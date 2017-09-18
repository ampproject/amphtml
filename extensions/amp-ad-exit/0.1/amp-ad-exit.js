/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {makeClickDelaySpec} from './filters/click-delay';
import {assertConfig, assertOriginMatchesVendor, TransportMode} from './config';
import {createFilter} from './filters/factory';
import {isJsonScriptTag, openWindowDialog} from '../../../src/dom';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {parseJson} from '../../../src/json';
import {
  listen,
  deserializeMessage,
} from '../../../src/3p-frame-messaging';
import {getData} from '../../../src/event-helper';
import {MessageType} from '../../../src/3p-frame-messaging';

const TAG = 'amp-ad-exit';

/**
 * @typedef {{
 *   finalUrl: string,
 *   trackingUrls: !Array<string>,
 *   vars: !./config.Variables,
 *   filters: !Array<!./filters/filter.Filter>
 * }}
 */
let NavigationTarget;  // eslint-disable-line no-unused-vars

export class AmpAdExit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @private @const {!Object<string, !NavigationTarget>}
     */
    this.targets_ = {};

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

    /** @private @const {!Object<string, Object<string, string>>} */
    this.vendorResponses_ = {};

    /** @private {?function()} */
    this.unlisten_ = null;
  }

  /** @override */
  detachedCallback() {
    if (this.unlisten_) {
      this.unlisten_();
    }
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   */
  exit({args, event}) {
    const target = this.targets_[args['target']];
    user().assert(target, `Exit target not found: '${args['target']}'`);

    event.preventDefault();
    if (!this.filter_(this.defaultFilters_, event) ||
        !this.filter_(target.filters, event)) {
      return;
    }
    const substituteVariables =
        this.getUrlVariableRewriter_(args, event, target);
    if (target.trackingUrls) {
      target.trackingUrls.map(substituteVariables)
          .forEach(url => this.pingTrackingUrl_(url));
    }
    openWindowDialog(this.win, substituteVariables(target.finalUrl), '_blank');
  }


  /**
   * @param {!Object<string, string|number|boolean>} args
   * @param {!../../../src/service/action-impl.ActionEventDef} event
   * @param {!NavigationTarget} target
   * @return {function(string): string}
   */
  getUrlVariableRewriter_(args, event, target) {
    const substitutionFunctions = {
      'CLICK_X': () => event.clientX,
      'CLICK_Y': () => event.clientY,
    };
    const whitelist = {
      'RANDOM': true,
      'CLICK_X': true,
      'CLICK_Y': true,
    };
    if (target.vars) {
      for (const customVarName in target.vars) {
        if (customVarName[0] == '_') {
          const customVar =
              /** @type {!./config.Variable} */ (target.vars[customVarName]);
          if (customVar) {
            /*
              Example:
              The amp-ad-exit target has a variable representing the
               priority of something, which is defined as follows:
               "vars": {
                 "_pty": {
                   "defaultValue": "unknown",
                   "iframeTransportSignal":
                      "IFRAME_TRANSPORT_SIGNAL(vendorXYZ, priority)"
                 },
                 ...
               }
               The cross-domain iframe of vendorXYZ has sent the
               following response for the creative:
                 { priority: medium, category: W }
               This is just example data. The keys/values in that object can
               be any strings.
               The code below will create substitutionFunctions['_pty'],
               which in this example will return "medium".
             */
            substitutionFunctions[customVarName] = () => {
              if ('iframeTransportSignal' in customVar) {
                const matches = customVar['iframeTransportSignal'].match(
                    /IFRAME_TRANSPORT_SIGNAL\(([\w-]+),\s*([\w-]+)\)/);
                user().assert(matches && matches.length == 3,
                    'Malformed value for iframeTransportSignal');
                // It's a 3p analytics variable
                const vendorResponses = this.vendorResponses_[matches[1]];
                if (vendorResponses) {
                  /* The vendor (in the example above, "vendorXYZ") has
                     responded to this creative. Need to check whether that
                     response contains a property that matches the
                     second parameter to IFRAME_TRANSPORT_SIGNAL (ex:
                     "priority") for this custom variable. If so, return the
                     value in the response object that is associated with
                     that key.
                  */
                  const responseKey = matches[2];
                  if (responseKey in vendorResponses) {
                    return vendorResponses[responseKey];
                  }
                }
              }
              // Either it's not a 3p analytics variable, or it is one but
              // no matching response has been received yet.
              return (customVarName in args) ?
                  args[customVarName] : customVar.defaultValue;
            };
            whitelist[customVarName] = true;
          }
        }
      }
    }
    const replacements = Services.urlReplacementsForDoc(this.getAmpDoc());
    return url => replacements.expandUrlSync(
        url, substitutionFunctions, undefined /* opt_collectVars */, whitelist);
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
    if (this.transport_.beacon &&
        this.win.navigator.sendBeacon &&
        this.win.navigator.sendBeacon(url, '')) {
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
   * @returns {boolean}
   */
  filter_(filters, event) {
    return filters.every(filter => {
      const result = filter.filter(event);
      user().info(TAG, `Filter '${filter.name}': ${result ? 'pass' : 'fail'}`);
      return result;
    });
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');

    this.defaultFilters_.push(
        createFilter('minDelay', makeClickDelaySpec(1000), this));

    const children = this.element.children;
    user().assert(children.length == 1,
        'The tag should contain exactly one <script> child.');
    const child = children[0];
    user().assert(
        isJsonScriptTag(child),
        'The amp-ad-exit config should ' +
        'be inside a <script> tag with type="application/json"');
    try {
      const config = assertConfig(parseJson(child.textContent));
      for (const name in config.filters) {
        this.userFilters_[name] =
            createFilter(name, config.filters[name], this);
      }
      for (const name in config.targets) {
        const target = config.targets[name];
        this.targets_[name] = {
          finalUrl: target.finalUrl,
          trackingUrls: target.trackingUrls || [],
          vars: target.vars || {},
          filters:
              (target.filters || []).map(
                  f => this.userFilters_[f]).filter(f => f),
        };
      }
      this.transport_.beacon = config.transport[TransportMode.BEACON] !== false;
      this.transport_.image = config.transport[TransportMode.IMAGE] !== false;
    } catch (e) {
      user().error(TAG, 'Invalid JSON config', e);
      throw e;
    }

    this.unlisten_ = listen(this.getAmpDoc().win, 'message', event => {
      const responseMessage = deserializeMessage(getData(event));

      let ampAdResourceId;
      try {
        ampAdResourceId = this.element.ownerDocument.defaultView
          .frameElement.parentElement.getResourceId();
      } catch (e) {
        user().error(TAG,
            'No friendly parent amp-ad element was found for amp-ad-exit tag.');
      }

      if (!responseMessage || !responseMessage['type'] ||
        responseMessage['type'] != MessageType.IFRAME_TRANSPORT_RESPONSE ||
        !responseMessage['creativeId'] ||
        responseMessage['creativeId'] != ampAdResourceId) {
        return;
      }

      dev().assert(responseMessage && responseMessage['message'],
          'Received empty response from 3p analytics frame');
      dev().assert(responseMessage && responseMessage['vendor'],
          'Received response from 3p analytics frame that does not indicate' +
          ' vendor');
      const vendor = responseMessage['vendor'];
      assertOriginMatchesVendor(event.origin, vendor);

      this.vendorResponses_[vendor] = responseMessage['message'];
    });
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

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAdExit);
});
