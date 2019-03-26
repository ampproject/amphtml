/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AccessSource, AccessType} from './amp-access-source';
import {AccessVars} from './access-vars';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-access-0.1.css';
import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {cancellation} from '../../../src/error';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {evaluateAccessExpr} from './access-expr';
import {getSourceOrigin} from '../../../src/url';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {installStylesForDoc} from '../../../src/style-installer';
import {isArray} from '../../../src/types';
import {listenOnce} from '../../../src/event-helper';
import {startsWith} from '../../../src/string';
import {triggerAnalyticsEvent} from '../../../src/analytics';


/** @const */
const TAG = 'amp-access';

/** @const {number} */
const VIEW_TIMEOUT = 2000;

/** @const {string} */
const TEMPLATE_PROP = '__AMP_ACCESS__TEMPLATE';


/**
 * AccessService implements the complete lifecycle of the AMP Access system.
 * @implements {AccessVars}
 */
export class AccessService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    const accessElement = ampdoc.getElementById('amp-access');

    /** @private {boolean} */
    this.enabled_ = !!accessElement;
    if (!this.enabled_) {
      return;
    }

    /** @const @private {!Element} */
    this.accessElement_ = dev().assertElement(accessElement);

    /** @const @private {string} */
    this.pubOrigin_ = getSourceOrigin(ampdoc.win.location);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    // TODO(dvoytenko, #3742): This will refer to the ampdoc once AccessService
    // is migrated to ampdoc as well.
    /** @private @const {!Promise<!../../../src/service/cid-impl.Cid>} */
    this.cid_ = Services.cidForDoc(ampdoc);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(ampdoc.win);

    /** @private @const {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private @const {?../../../src/service/performance-impl.Performance} */
    this.performance_ = Services.performanceForOrNull(ampdoc.win);

    /** @private {?Promise<string>} */
    this.readerIdPromise_ = null;

    /** @const */
    this.sources_ = this.parseConfig_();

    const promises = this.sources_.map(source => source.whenFirstAuthorized());

    /** @private {boolean} */
    this.firstAuthorizationsCompleted_ = false;

    /**
     * Track most recent requests and block reporting and refreshes if
     * outstanding. Future optimizations may choose to take action as soon
     * as a single request completes. These complete even on failure.
     * @private {!Promise}
     */
    this.lastAuthorizationPromises_ = Promise.all(promises);

    /** @private {?Promise} */
    this.reportViewPromise_ = null;

    /** @private @const {!Observable} */
    this.applyAuthorizationsObservable_ = new Observable();

    // This will fire after the first received authorization, even if
    // there are multiple sources.
    this.lastAuthorizationPromises_.then(() => {
      this.firstAuthorizationsCompleted_ = true;
      this.analyticsEvent_('access-authorization-received');
      if (this.performance_) {
        this.performance_.tick('aaa');
        this.performance_.tickSinceVisible('aaav');
        this.performance_.flush();
      }
    });

    // Re-authorize newly added sections.
    ampdoc.getRootNode().addEventListener(AmpEvents.DOM_UPDATE,
        this.onDomUpdate_.bind(this));
  }

  /** @override from AccessVars */
  getAccessReaderId() {
    if (!this.enabled_) {
      return null;
    }
    return this.getReaderId_();
  }

  /**
   * @return {!Promise<string>}
   * @private
   */
  getReaderId_() {
    if (!this.readerIdPromise_) {
      // No consent - an essential part of the access system.
      const consent = Promise.resolve();
      this.readerIdPromise_ = this.cid_.then(cid => {
        return cid.get({scope: 'amp-access', createCookieIfNotPresent: true},
            consent);
      });
    }
    return this.readerIdPromise_;
  }

  /**
   * @return {boolean}
   */
  areFirstAuthorizationsCompleted() {
    return this.firstAuthorizationsCompleted_;
  }

  /**
   * Registers a callback to be triggered when the document gets (re)authorized.
   * @param {!Function} callback
   */
  onApplyAuthorizations(callback) {
    this.applyAuthorizationsObservable_.add(callback);
  }

  /**
   * @return {!Array<!AccessSource>}
   * @private
   */
  parseConfig_() {
    const rawContent = tryParseJson(this.accessElement_.textContent, e => {
      throw user().createError('Failed to parse "amp-access" JSON: ' + e);
    });

    const configMap = {};
    if (isArray(rawContent)) {
      const contentArray = rawContent;
      for (let i = 0; i < contentArray['length']; i++) {
        const namespace = contentArray[i]['namespace'];
        userAssert(!!namespace, 'Namespace required');
        userAssert(!configMap[namespace],
            'Namespace already used: ' + namespace);
        configMap[namespace] = contentArray[i];
      }
    } else {
      configMap[rawContent['namespace'] || ''] = rawContent;
    }

    const readerIdFn = this.getReaderId_.bind(this);
    const scheduleViewFn = this.scheduleView_.bind(this);
    const onReauthorizeFn = this.onReauthorize_.bind(this);

    return Object.keys(configMap).map(key =>
      new AccessSource(this.ampdoc, configMap[key], readerIdFn, scheduleViewFn,
          onReauthorizeFn, this.accessElement_)
    );
  }

  /**
   * @param {!Event} event
   * @private
   */
  onDomUpdate_(event) {
    // Only re-authorize sections if authorization already fired, otherwise
    // just wait and existing callback will cover new sections.
    if (this.firstAuthorizationsCompleted_) {
      const target = dev().assertElement(event.target);
      // Guard against anything else in flight.
      return this.lastAuthorizationPromises_.then(() => {
        const responses = this.combinedResponses();
        this.applyAuthorizationToRoot_(target, responses);
      });
    }
  }

  /**
   * @param {string} name
   * @return {!AccessSource}
   */
  getVendorSource(name) {
    for (let i = 0; i < this.sources_.length; i++) {
      const source = this.sources_[i];
      if (source.getType() == AccessType.VENDOR) {
        const vendorAdapter =
          /** @type {!./amp-access-vendor.AccessVendorAdapter} */ (
            source.getAdapter()
          );
        if (vendorAdapter.getVendorName() == name) {
          return source;
        }
      }
    }
    userAssert(false,
        'Access vendor "%s" can only be used for "type=vendor", but none found',
        name);
    // Should not happen, just to appease type checking.
    throw new Error();
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.enabled_;
  }

  /**
   * @return {!Element}
   * @private
   */
  getRootElement_() {
    const root = this.ampdoc.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /**
   * @param {string} eventType
   * @private
   */
  analyticsEvent_(eventType) {
    triggerAnalyticsEvent(this.getRootElement_(), eventType);
  }

  /**
   * @return {!AccessService}
   * @private
   * @restricted
   */
  start_() {
    if (!this.enabled_) {
      user().info(TAG, 'Access is disabled - no "id=amp-access" element');
      return this;
    }
    this.startInternal_();
    return this;
  }

  /** @private */
  startInternal_() {
    const actionService = Services.actionServiceForDoc(this.accessElement_);
    actionService.installActionHandler(
        this.accessElement_, this.handleAction_.bind(this));

    for (let i = 0; i < this.sources_.length; i++) {
      this.sources_[i].start();
    }

    // Run authorization as soon as visible.
    this.runAuthorization_();

    // Wait for the "view" signal.
    this.scheduleView_(VIEW_TIMEOUT);

    // Listen to amp-access broadcasts from other pages.
    this.listenToBroadcasts_();
  }

  /** @private */
  listenToBroadcasts_() {
    this.viewer_.onBroadcast(message => {
      if (message['type'] == 'amp-access-reauthorize' &&
              message['origin'] == this.pubOrigin_) {
        this.runAuthorization_();
      }
    });
  }

  /**
   * @param {!Promise} authorization
   * @private
   */
  onReauthorize_(authorization) {
    this.broadcastReauthorize_();
    authorization.then(() => {
      // If nothing has happened, initial render will cover this change.
      if (this.firstAuthorizationsCompleted_) {
        // Guard against anything else in flight.
        this.lastAuthorizationPromises_.then(() => {
          this.ampdoc.whenReady().then(() => {
            const root = this.ampdoc.getRootNode();
            const responses = this.combinedResponses();
            return this.applyAuthorizationToRoot_(root, responses);
          });
        });
      }
    });
  }

  /** @private */
  broadcastReauthorize_() {
    this.viewer_.broadcast(dict({
      'type': 'amp-access-reauthorize',
      'origin': this.pubOrigin_,
    }));
  }

  /**
   * Returns the promise that resolves when all authorization work has
   * completed, including authorization endpoint call and UI update.
   * Note that this promise never fails.
   * @param {boolean=} opt_disableFallback
   * @return {!Promise}
   * @private
   */
  runAuthorization_(opt_disableFallback) {
    this.toggleTopClass_('amp-access-loading', true);

    const authorizations = this.viewer_.whenFirstVisible().then(() => {
      return Promise.all(
          this.sources_.map(source => this.runOneAuthorization_(source)));
    });

    const rendered = authorizations.then(() => {
      this.toggleTopClass_('amp-access-loading', false);
      return this.ampdoc.whenReady().then(() => {
        const root = this.ampdoc.getRootNode();
        const responses = this.combinedResponses();
        return this.applyAuthorizationToRoot_(root, responses);
      });
    });

    this.lastAuthorizationPromises_ = rendered;

    return rendered;
  }

  /**
   * Make a single authorization call.
   * @param {AccessSource} source
   * @return {Promise}
   * @private
   */
  runOneAuthorization_(source) {
    return source.runAuthorization()
        .catch(() => {
          this.toggleTopClass_('amp-access-error', true);
        });
  }

  /** @override from AccessVars */
  getAuthdataField(field) {
    if (!this.enabled_) {
      return null;
    }
    return this.lastAuthorizationPromises_.then(() => {
      const responses = this.combinedResponses();
      const v = getValueForExpr(responses, field);
      return v !== undefined ? v : null;
    });
  }

  /**
   * @param {!Document|!ShadowRoot|!Element} root
   * @param {!JsonObject} response
   * @return {!Promise}
   * @private
   */
  applyAuthorizationToRoot_(root, response) {
    const elements = root.querySelectorAll('[amp-access]');
    const promises = [];
    for (let i = 0; i < elements.length; i++) {
      promises.push(this.applyAuthorizationToElement_(elements[i], response));
    }
    return Promise.all(promises).then(() => {
      this.applyAuthorizationsObservable_.fire();
    });
  }

  /**
   * @param {!Element} element
   * @param {!JsonObject} response
   * @return {!Promise}
   * @private
   */
  applyAuthorizationToElement_(element, response) {
    const expr = element.getAttribute('amp-access');
    const on = evaluateAccessExpr(expr, response);
    let renderPromise = null;
    if (on) {
      renderPromise = this.renderTemplates_(element, response);
    }
    if (renderPromise) {
      return renderPromise.then(() =>
        this.applyAuthorizationAttrs_(element, on));
    }
    return this.applyAuthorizationAttrs_(element, on);
  }

  /**
   * @param {!Element} element
   * @param {boolean} on
   * @return {!Promise}
   * @private
   */
  applyAuthorizationAttrs_(element, on) {
    const wasOn = !element.hasAttribute('amp-access-hide');
    if (on == wasOn) {
      return Promise.resolve();
    }
    return this.resources_.mutateElement(element, () => {
      if (on) {
        element.removeAttribute('amp-access-hide');
      } else {
        element.setAttribute('amp-access-hide', '');
      }
    });
  }

  /**
   * Discovers and renders templates.
   * @param {!Element} element
   * @param {!JsonObject} response
   * @return {?Promise}
   * @private
   */
  renderTemplates_(element, response) {
    const promises = [];
    const templateElements = element.querySelectorAll('[amp-access-template]');
    if (templateElements.length > 0) {
      for (let i = 0; i < templateElements.length; i++) {
        const p = this.renderTemplate_(element, templateElements[i], response)
            .catch(error => {
              // Ignore the error.
              dev().error(TAG, 'Template failed: ', error,
                  templateElements[i], element);
            });
        promises.push(p);
      }
    }
    return promises.length > 0 ? Promise.all(promises) : null;
  }

  /**
   * @param {!Element} element
   * @param {!Element} templateOrPrev
   * @param {!JsonObject} response
   * @return {!Promise}
   * @private
   */
  renderTemplate_(element, templateOrPrev, response) {
    let template = templateOrPrev;
    let prev = null;
    if (template.tagName != 'TEMPLATE') {
      prev = template;
      template = prev[TEMPLATE_PROP];
    }
    if (!template) {
      return Promise.reject(new Error('template not found'));
    }

    const rendered = this.templates_.renderTemplate(template, response);
    return rendered.then(element => {
      return this.vsync_.mutatePromise(() => {
        element.setAttribute('amp-access-template', '');
        element[TEMPLATE_PROP] = template;
        if (template.parentElement) {
          template.parentElement.replaceChild(element, template);
        } else if (prev && prev.parentElement) {
          prev.parentElement.replaceChild(element, prev);
        }
      });
    });
  }

  /**
   * @param {time} timeToView
   * @private
   */
  scheduleView_(timeToView) {
    if (!this.sources_.some(s => s.getAdapter().isPingbackEnabled())) {
      return;
    }
    this.reportViewPromise_ = null;
    this.ampdoc.whenReady().then(() => {
      if (this.viewer_.isVisible()) {
        this.reportWhenViewed_(timeToView);
      }
      this.viewer_.onVisibilityChanged(() => {
        if (this.viewer_.isVisible()) {
          this.reportWhenViewed_(timeToView);
        }
      });
    });
  }

  /**
   * @param {time} timeToView
   * @return {!Promise}
   * @private
   */
  reportWhenViewed_(timeToView) {
    if (this.reportViewPromise_) {
      return this.reportViewPromise_;
    }
    dev().fine(TAG, 'start view monitoring');
    this.reportViewPromise_ = this.whenViewed_(timeToView)
        .then(() => {
          // Wait for the most recent authorization flow to complete.
          return this.lastAuthorizationPromises_;
        })
        .then(() => {
          // Report the analytics event.
          this.analyticsEvent_('access-viewed');
          return this.reportViewToServer_();
        })
        .catch(reason => {
          // Ignore - view has been canceled.
          dev().fine(TAG, 'view cancelled:', reason);
          this.reportViewPromise_ = null;
          throw reason;
        });

    // Support pre-rendering with metering by possibly hiding content
    // after view is recorded.
    this.reportViewPromise_.then(this.broadcastReauthorize_.bind(this));

    return this.reportViewPromise_;
  }

  /**
   * The promise will be resolved when a view of this document has occurred. It
   * will be rejected if the current impression should not be counted as a view.
   * @param {time} timeToView Pass the value of 0 when this method is called
   *   as the result of the user action.
   * @return {!Promise}
   * @private
   */
  whenViewed_(timeToView) {
    if (timeToView == 0) {
      // Immediate view has been registered. This will happen when this method
      // is called as the result of the user action.
      return Promise.resolve();
    }

    // Viewing kick off: document is visible.
    const unlistenSet = [];
    return new Promise((resolve, reject) => {
      // 1. Document becomes invisible again: cancel.
      unlistenSet.push(this.viewer_.onVisibilityChanged(() => {
        if (!this.viewer_.isVisible()) {
          reject(cancellation());
        }
      }));

      // 2. After a few seconds: register a view.
      const timeoutId = this.timer_.delay(resolve, timeToView);
      unlistenSet.push(() => this.timer_.cancel(timeoutId));

      // 3. If scrolled: register a view.
      unlistenSet.push(this.viewport_.onScroll(resolve));

      // 4. Tap: register a view.
      unlistenSet.push(listenOnce(this.ampdoc.getRootNode(),
          'click', resolve));
    }).then(() => {
      unlistenSet.forEach(unlisten => unlisten());
    }, reason => {
      unlistenSet.forEach(unlisten => unlisten());
      throw reason;
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  reportViewToServer_() {
    const promises = [];
    for (let i = 0; i < this.sources_.length; i++) {
      if (this.sources_[i].getAdapter().isPingbackEnabled()) {
        promises.push(this.sources_[i].reportViewToServer());
      }
    }
    return Promise.all(promises);
  }

  /**
   * @param {string} className
   * @param {boolean} on
   * @private
   */
  toggleTopClass_(className, on) {
    this.vsync_.mutate(() => {
      this.getRootElement_().classList.toggle(className, on);
    });

  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  handleAction_(invocation) {
    if (invocation.method == 'login') {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.loginWithType_('');
    } else if (startsWith(invocation.method, 'login-')) {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.loginWithType_(invocation.method.substring('login-'.length));
    } else if (invocation.method == 'refresh') {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.runAuthorization_();
    }
    return null;
  }

  /**
   * Expose the underlying AccessSource for use by laterpay.
   * @param {number} index
   * @return {!AccessSource}
   */
  getSource(index) {
    userAssert(index >= 0 && index < this.sources_.length,
        'Invalid index: %d', index);
    return this.sources_[index];
  }

  /**
   * Runs the login flow using one of the predefined urls in the amp-access
   * config
   *
   * @private
   * @param {string} type Type of login defined in the config
   * @return {!Promise}
   */
  loginWithType_(type) {
    const splitPoint = type.indexOf('-');
    const singleSource = this.sources_.length == 1;

    // Try to find a matching namespace
    const namespace = (splitPoint > -1) ? type.substring(0, splitPoint) : type;
    const match = this.sources_.filter(s => s.getNamespace() == namespace);
    if (match.length) {
      // Matching namespace found
      const remaining = (splitPoint > -1) ? type.substring(splitPoint + 1) : '';
      return match[0].loginWithType(remaining);
    }

    // If there is only one source, process as standalone
    userAssert(singleSource, 'Login must match namespace: %s', namespace);
    return this.sources_[0].loginWithType(type);
  }

  /**
   * Either combine namespaced responses or just return the single one.
   *
   * @return {!JsonObject}
   */
  combinedResponses() {
    if (this.sources_.length == 1 && !this.sources_[0].getNamespace()) {
      return /** @type {!JsonObject} */ (this.sources_[0].getAuthResponse() ||
        {});
    }

    const combined = /** @type {!JsonObject} */ ({});
    this.sources_.forEach(source =>
      combined[source.getNamespace()] = source.getAuthResponse());
    return combined;
  }
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('access', function(ampdoc) {
    return new AccessService(ampdoc).start_();
  });
});


/** @package Visible for testing only. */
export function getAccessVarsClassForTesting() {
  return AccessVars;
}
