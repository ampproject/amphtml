import {
  MessageType_Enum,
  deserializeMessage,
  listen,
} from '#core/3p-frame-messaging';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {isJsonScriptTag} from '#core/dom';
import {isObject} from '#core/types';
import {parseJson} from '#core/types/object/json';

import {HostServices} from '#inabox/host-services';

import {Services} from '#service';

import {getData} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';
import {
  AttributionReportingStatus,
  isAttributionReportingAllowed,
} from '#utils/privacy-sandbox-utils';

import {TransportMode, assertConfig, assertVendor} from './config';
import {makeClickDelaySpec} from './filters/click-delay';
import {createFilter} from './filters/factory';
import {FilterType} from './filters/filter';
import {makeInactiveElementSpec} from './filters/inactive-element';

import {getAmpAdResourceId} from '../../../src/ad-helper';
import {getMode} from '../../../src/mode';
import {openWindowDialog} from '../../../src/open-window-dialog';
import {getTopWindow} from '../../../src/service-helpers';
import {parseUrlDeprecated} from '../../../src/url';

const TAG = 'amp-ad-exit';

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: !Array<string>,
 *   vars: !./config.VariablesDef,
 *   filters: !Array<!./filters/filter.Filter>
 * }}
 */
let NavigationTargetDef;

export class AmpAdExit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private @const {!{[key: string]: !NavigationTargetDef}}
     */
    this.targets_ = {};

    /**
     * Maps variable target name to an actual target name.
     * @private @const {!{[key: string]: string}}
     */
    this.variableTargets_ = {};

    /**
     * Filters to apply to every target.
     * @private @const {!Array<!./filters/filter.Filter>}
     */
    this.defaultFilters_ = [];

    /** @private @struct */
    this.transport_ = {
      beacon: true,
      image: true,
    };

    this.userFilters_ = {};

    this.registerAction('exit', this.exit.bind(this));
    this.registerAction(
      'setVariable',
      this.setVariable.bind(this),
      ActionTrust_Enum.LOW
    );

    /** @private @const {!{[key: string]: !{[key: string]: string}}} */
    this.vendorResponses_ = {};

    /** @private {?function()} */
    this.unlisten_ = null;

    /** @private {?string} */
    this.ampAdResourceId_ = null;

    /** @private @const {!{[key: string]: string}} */
    this.expectedOriginToVendor_ = {};

    /** @private @const {boolean} */
    this.isAttributionReportingSupported_ =
      this.detectAttributionReportingSupport();
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  exit(invocation) {
    const {args} = invocation;
    let {event} = invocation;
    userAssert(
      'variable' in args != 'target' in args,
      `One and only one of 'target' and 'variable' must be specified`
    );
    let targetName;
    if ('variable' in args) {
      targetName = this.variableTargets_[args['variable']];
      if (!targetName) {
        targetName = args['default'];
      }
      userAssert(
        targetName,
        `Variable target not found, variable:'${args['variable']}', default:'${args['default']}'`
      );
      delete args['default'];
    } else {
      targetName = args['target'];
    }
    const target = this.targets_[targetName];
    userAssert(target, `Exit target not found: '${targetName}'`);
    userAssert(event, 'Unexpected null event');
    event = /** @type {!../../../src/service/action-impl.ActionEventDef} */ (
      event
    );

    event.preventDefault();
    if (
      !this.filter_(this.defaultFilters_, event) ||
      !this.filter_(target.filters, event)
    ) {
      return;
    }
    const substituteVariables = this.getUrlVariableRewriter_(
      args,
      event,
      target
    );
    if (target.trackingUrls) {
      target.trackingUrls
        .map(substituteVariables)
        .forEach((url) => this.pingTrackingUrl_(url));
    }
    const finalUrl = substituteVariables(target.finalUrl);
    // TODO(wg-monetization): clean up unused HostServices.
    if (HostServices.isAvailable(this.getAmpDoc())) {
      HostServices.exitForDoc(this.getAmpDoc())
        .then((exitService) => exitService.openUrl(finalUrl))
        .catch((error) => {
          // TODO: reporting on errors
          dev().fine(TAG, 'ExitServiceError - fallback=' + error.fallback);
          if (error.fallback) {
            openWindowDialog(this.win, finalUrl, '_blank');
          }
        });
    } else {
      const clickTarget =
        target.behaviors &&
        target.behaviors.clickTarget &&
        target.behaviors.clickTarget == '_top'
          ? '_top'
          : '_blank';

      const substitutedFeatures = substituteVariables(
        target.windowFeatures || ''
      );
      openWindowDialog(this.win, finalUrl, clickTarget, substitutedFeatures);
    }
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  setVariable(invocation) {
    const {args} = invocation;
    const pointToTarget = this.targets_[args['target']];
    userAssert(pointToTarget, `Exit target not found: '${args['target']}'`);
    this.variableTargets_[args['name']] = args['target'];
  }

  /**
   * @param {!{[key: string]: string|number|boolean}} args
   * @param {!../../../src/service/action-impl.ActionEventDef} event
   * @param {!NavigationTargetDef} target
   * @return {function(string): string}
   */
  getUrlVariableRewriter_(args, event, target) {
    const substitutionFunctions = {
      'ATTRIBUTION_REPORTING_STATUS': () =>
        getAttributionReportingStatus(
          this.isAttributionReportingSupported_,
          target
        ),
      'CLICK_X': () => event.clientX,
      'CLICK_Y': () => event.clientY,
    };
    const replacements = Services.urlReplacementsForDoc(this.element);
    const allowlist = {
      'ATTRIBUTION_REPORTING_STATUS': true,
      'CLICK_X': true,
      'CLICK_Y': true,
      'RANDOM': true,
      'UACH': true,
    };
    if (target['vars']) {
      for (const customVarName in target['vars']) {
        if (customVarName[0] != '_') {
          continue;
        }
        const customVar = /** @type {!./config.VariableDef} */ (
          target['vars'][customVarName]
        );
        if (!customVar) {
          continue;
        }
        /*
         Example:
         The amp-ad-exit target has a variable representing the priority of
         something, which is defined as follows:
         "vars": {
           "_pty": {
             "defaultValue": "unknown",
             "iframeTransportSignal":
                 "IFRAME_TRANSPORT_SIGNAL(vendorXYZ,priority)"
           },
           ...
         }
         The cross-domain iframe of vendorXYZ has sent the following
         response for the creative:
         { priority: medium, category: W }
         This is just example data. The keys/values in that object can be
         any strings.
         The code below will create substitutionFunctions['_pty'], which in
         this example will return "medium".
        */
        substitutionFunctions[customVarName] = () => {
          if (customVar.iframeTransportSignal) {
            const vendorResponse = replacements./*OK*/ expandStringSync(
              customVar.iframeTransportSignal,
              {
                'IFRAME_TRANSPORT_SIGNAL': (vendor, responseKey) => {
                  if (!(vendor && responseKey)) {
                    return '';
                  }
                  const vendorResponses = this.vendorResponses_[vendor];
                  if (vendorResponses && responseKey in vendorResponses) {
                    return vendorResponses[responseKey];
                  }
                },
              }
            );
            if (
              customVar.iframeTransportSignal ==
              `IFRAME_TRANSPORT_SIGNAL${vendorResponse}`
            ) {
              // No substitution occurred, so format string in amp-ad-exit
              // config was invalid
              dev().error(
                TAG,
                'Invalid IFRAME_TRANSPORT_SIGNAL format:' +
                  vendorResponse +
                  ' (perhaps there is a space after a comma?)'
              );
            } else if (vendorResponse != '') {
              // Caveat: If the vendor's response *is* the empty string, then
              // this will cause the arg/default value to be returned.
              return vendorResponse;
            }
          }

          // Either it's not a 3p analytics variable, or it is one
          // but no matching response has been received yet.
          return customVarName in args
            ? args[customVarName]
            : customVar.defaultValue;
        };
        allowlist[customVarName] = true;
      }
    }
    return (url) =>
      replacements.expandUrlSync(url, substitutionFunctions, allowlist);
  }

  /**
   * Attempts to issue a request to `url` to report the click. The request
   * method depends on the exit config's transport property.
   * navigator.sendBeacon will be tried if transport.beacon is `true` or
   * `undefined`. Otherwise, or if sendBeacon returns false, an image request
   * will be made.
   * @param {string} url
   */
  pingTrackingUrl_(url) {
    user().fine(TAG, `pinging ${url}`);
    if (
      this.transport_.beacon &&
      this.win.navigator.sendBeacon &&
      this.win.navigator.sendBeacon(url, '')
    ) {
      return;
    }
    if (this.transport_.image) {
      const req = this.win.document.createElement('img');
      req.src = url;
      return;
    }
  }

  /**
   * Checks the click event against the given filters. Returns true if the event
   * passes.
   * @param {!Array<!./filters/filter.Filter>} filters
   * @param {!../../../src/service/action-impl.ActionEventDef} event
   * @return {boolean}
   */
  filter_(filters, event) {
    return filters.every((filter) => {
      const result = filter.filter(event);
      user().info(TAG, `Filter '${filter.name}': ${result ? 'pass' : 'fail'}`);
      return result;
    });
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');

    // Note that order is expected as part of applying default filter options.
    this.defaultFilters_.push(
      createFilter('minDelay', makeClickDelaySpec(1000), this)
    );
    this.defaultFilters_.push(
      createFilter(
        'carouselBtns',
        makeInactiveElementSpec('.amp-carousel-button'),
        this
      )
    );

    const {children} = this.element;
    userAssert(
      children.length == 1,
      'The tag should contain exactly one <script> child.'
    );
    const child = children[0];
    userAssert(
      isJsonScriptTag(child),
      'The amp-ad-exit config should ' +
        'be inside a <script> tag with type="application/json"'
    );
    try {
      const config = assertConfig(parseJson(child.textContent));
      let defaultClickStartTimingEvent;
      if (
        isObject(config['options']) &&
        typeof config['options']['startTimingEvent'] === 'string'
      ) {
        defaultClickStartTimingEvent = config['options']['startTimingEvent'];
        this.defaultFilters_.splice(
          0,
          1,
          devAssert(
            createFilter(
              'minDelay',
              makeClickDelaySpec(1000, config['options']['startTimingEvent']),
              this
            )
          )
        );
      }
      for (const name in config['filters']) {
        const spec = config['filters'][name];
        if (spec.type == FilterType.CLICK_DELAY) {
          spec.startTimingEvent =
            spec.startTimingEvent || defaultClickStartTimingEvent;
        }
        this.userFilters_[name] = createFilter(name, spec, this);
      }
      for (const name in config['targets']) {
        const /** !JsonObject */ target = config['targets'][name];
        this.targets_[name] = {
          finalUrl: target['finalUrl'],
          vars: target['vars'] || {},
          filters: (target['filters'] || [])
            .map((f) => this.userFilters_[f])
            .filter(Boolean),
          behaviors: target['behaviors'] || {},
        };
        if (
          this.isAttributionReportingSupported_ &&
          target?.behaviors?.browserAdConversion
        ) {
          this.targets_[name]['windowFeatures'] =
            this.getAttributionReportingValues_(
              target?.behaviors?.browserAdConversion
            );
        } else {
          this.targets_[name]['trackingUrls'] = target['trackingUrls'] || [];
        }

        // Build a map of {vendor, origin} for 3p custom variables in the config
        for (const customVar in target['vars']) {
          if (!target['vars'][customVar].iframeTransportSignal) {
            continue;
          }
          const matches = target['vars'][customVar].iframeTransportSignal.match(
            /IFRAME_TRANSPORT_SIGNAL\(([^,]+)/
          );
          if (!matches || matches.length < 2) {
            continue;
          }
          const vendor = matches[1];
          const {origin} = parseUrlDeprecated(assertVendor(vendor));
          this.expectedOriginToVendor_[origin] =
            this.expectedOriginToVendor_[origin] || vendor;
        }
      }
      this.transport_.beacon =
        config['transport'][TransportMode.BEACON] !== false;
      this.transport_.image =
        config['transport'][TransportMode.IMAGE] !== false;
    } catch (e) {
      this.user().error(TAG, 'Invalid JSON config', e);
      throw e;
    }

    this.init3pResponseListener_();
  }

  /**
   * Determine if `attribution-reporting` is supported by user-agent. Should only return
   * true for Chrome 92+.
   * @visibleForTesting
   * @return {boolean}
   */
  detectAttributionReportingSupport() {
    return isAttributionReportingAllowed(this.win.document);
  }

  /**
   * Extracts the keys from the `browserAdConversion` data creates a
   * string to be used as the `features` param for the `window.open()` call.
   * @param {JsonObject} adConversionData
   * @return {?string}
   */
  getAttributionReportingValues_(adConversionData) {
    if (!adConversionData || !Object.keys(adConversionData)) {
      return;
    }

    // `noopener` is probably redundant here but left as defense in depth.
    // https://groups.google.com/a/chromium.org/g/blink-dev/c/FFX6VkvladY/m/QgaWHK6ZBAAJ
    const parts = ['noopener'];
    for (const key of Object.keys(adConversionData)) {
      const encoded = encodeURIComponent(adConversionData[key]);
      parts.push(`${key.toLowerCase()}=${encoded}`);
    }
    return parts.join(',');
  }

  /**
   * Gets the resource ID of the amp-ad element containing this amp-ad-exit tag.
   * This is a pass-through for the version in service.js, solely because
   * the one in service.js isn't stubbable for testing, since only object
   * methods are stubbable.
   * @return {?string}
   * @private
   */
  getAmpAdResourceId_() {
    return getAmpAdResourceId(this.element, getTopWindow(this.win));
  }

  /** @override */
  resumeCallback() {
    this.init3pResponseListener_();
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlisten_) {
      this.unlisten_();
      this.unlisten_ = null;
    }
    return super.unlayoutCallback();
  }

  /**
   * amp-analytics will create an iframe for vendors in
   * extensions/amp-analytics/0.1/vendors/* who have transport/iframe defined.
   * This is limited to MRC-accreddited vendors. The frame is removed in
   * amp-analytics, and the listener is destroyed here, if the user
   * navigates/swipes away from the page. Both are recreated if the user
   * navigates back to the page.
   * @private
   */
  init3pResponseListener_() {
    if (getMode().runtime == 'inabox') {
      // TODO(jonkeller): Remove this once #11436 is resolved.
      return;
    }
    this.ampAdResourceId_ = this.ampAdResourceId_ || this.getAmpAdResourceId_();
    if (!this.ampAdResourceId_) {
      user().warn(
        TAG,
        'No friendly parent amp-ad element was found for amp-ad-exit; ' +
          'not in inabox case.'
      );
      return;
    }
    devAssert(!this.unlisten_, 'Unlistener should not already exist.');
    this.unlisten_ = listen(this.getAmpDoc().win, 'message', (event) => {
      // We shouldn't deserialize just any message...it would be too
      // expensive to parse ones that aren't for amp-ad-exit.
      if (!this.expectedOriginToVendor_[event.origin]) {
        return;
      }
      const responseMsg = deserializeMessage(getData(event));
      if (
        !responseMsg ||
        responseMsg['type'] != MessageType_Enum.IFRAME_TRANSPORT_RESPONSE
      ) {
        return;
      }
      this.assertValidResponseMessage_(responseMsg, event.origin);
      if (responseMsg['creativeId'] != this.ampAdResourceId_) {
        return; // Valid message, but for different amp-ad-exit instance
      }
      this.vendorResponses_[responseMsg['vendor']] = responseMsg['message'];
    });
  }

  /**
   *
   * @param {JsonObject} responseMessage The response object to
   *     validate.
   * @param {string} eventOrigin The origin of the message, which should
   *     match the expected origin of messages from responseMessage['vendor']
   * @private
   */
  assertValidResponseMessage_(responseMessage, eventOrigin) {
    userAssert(
      responseMessage['message'],
      'Received empty response from 3p analytics frame'
    );
    userAssert(
      responseMessage['creativeId'],
      'Received malformed message from 3p analytics frame: ' +
        'creativeId missing'
    );
    userAssert(
      responseMessage['vendor'],
      'Received malformed message from 3p analytics frame: vendor missing'
    );
    const vendorURL = parseUrlDeprecated(
      assertVendor(responseMessage['vendor'])
    );
    userAssert(
      vendorURL && vendorURL.origin == eventOrigin,
      'Invalid origin for vendor ' +
        `${responseMessage['vendor']}: ${eventOrigin}`
    );
  }

  /** @override */
  isLayoutSupported(unused) {
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    for (const name in this.userFilters_) {
      this.userFilters_[name].onLayoutMeasure();
    }
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdExit);
});

/**
 * Resolves the ATTRIBUTION_REPORTING_STATUS macro to the appropriate value
 * based on the given config and browser support.
 * @param {boolean} isAttributionReportingSupported
 * @param {!NavigationTargetDef} target
 * @return {AttributionReportingStatus}
 * @visibleForTesting
 */
export function getAttributionReportingStatus(
  isAttributionReportingSupported,
  target
) {
  if (
    target?.behaviors?.browserAdConversion &&
    isAttributionReportingSupported
  ) {
    return AttributionReportingStatus.ATTRIBUTION_DATA_PRESENT_AND_POLICY_ENABLED;
  } else if (target?.behaviors?.browserAdConversion?.attributionsrc) {
    return AttributionReportingStatus.ATTRIBUTION_DATA_PRESENT;
  }
  return AttributionReportingStatus.ATTRIBUTION_MACRO_PRESENT;
}
