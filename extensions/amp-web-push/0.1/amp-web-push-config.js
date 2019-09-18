/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import {CONFIG_TAG, TAG} from './vars';
import {dev, user, userAssert} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {parseUrlDeprecated} from '../../../src/url';
import {webPushServiceForDoc} from './web-push-service';

/** @enum {string} */
export const WebPushConfigAttributes = {
  HELPER_FRAME_URL: 'helper-iframe-url',
  PERMISSION_DIALOG_URL: 'permission-dialog-url',
  SERVICE_WORKER_URL: 'service-worker-url',
  SERVICE_WORKER_SCOPE: 'service-worker-scope',
};

/** @enum {string} */
export const WebPushWidgetActions = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

/** @typedef {{
 *    'helper-iframe-url': (?string|undefined),
 *    'permission-dialog-url': (?string|undefined),
 *    'service-worker-url': (?string|undefined),
 * }}
 */
export let AmpWebPushConfig;

/**
 * @fileoverview
 * The element that exposes attributes for publishers to configure the web push
 * service.
 *
 * On buildCallback(), the element starts the web push service.
 *
 * Only a single element of this kind is allowed in the document, and it must
 * have the ID "amp-web-push". Subscribe and unsubscribe actions dispatched from
 * various widget elements are all processed by this element which then forwards
 * the event to the web push service.
 */
export class WebPushConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /**
   * Validates that this element instance has an ID attribute of 'amp-web-push'
   * and that there are no other elements of the same tag name.
   */
  validate() {
    this.ensureSpecificElementId_();
    this.ensureUniqueElement_();

    const config = {
      'helper-iframe-url': null,
      'permission-dialog-url': null,
      'service-worker-url': null,
      'service-worker-scope': null,
    };

    for (const attribute in WebPushConfigAttributes) {
      const value = WebPushConfigAttributes[attribute];
      userAssert(
        this.element.getAttribute(value) || value === 'service-worker-scope',
        `The ${value} attribute is required for <${CONFIG_TAG}>`
      );
      config[value] = this.element.getAttribute(value);
    }

    if (
      !this.isValidHelperOrPermissionDialogUrl_(config['helper-iframe-url'])
    ) {
      throw user().createError(
        `<${CONFIG_TAG}> must have a valid ` +
          'helper-iframe-url attribute. It should begin with ' +
          'the https:// protocol and point to the provided lightweight ' +
          'template page provided for AMP messaging.'
      );
    }

    if (
      !this.isValidHelperOrPermissionDialogUrl_(config['permission-dialog-url'])
    ) {
      throw user().createError(
        `<${CONFIG_TAG}> must have a valid ` +
          'permission-dialog-url attribute. It should begin with ' +
          'the https:// protocol and point to the provided template page ' +
          'for showing the permission prompt.'
      );
    }

    if (
      parseUrlDeprecated(config['service-worker-url']).protocol !== 'https:'
    ) {
      throw user().createError(
        `<${CONFIG_TAG}> must have a valid ` +
          'service-worker-url attribute. It should begin with the ' +
          'https:// protocol and point to the service worker JavaScript file ' +
          'to be installed.'
      );
    }

    if (
      parseUrlDeprecated(config['service-worker-url']).origin !==
        parseUrlDeprecated(config['permission-dialog-url']).origin ||
      parseUrlDeprecated(config['permission-dialog-url']).origin !==
        parseUrlDeprecated(config['helper-iframe-url']).origin
    ) {
      throw user().createError(
        `<${CONFIG_TAG}> URL attributes ` +
          'service-worker-url, permission-dialog-url, and ' +
          'helper-iframe-url must all share the same origin.'
      );
    }
  }

  /**
   * Parses the JSON configuration and returns a JavaScript object.
   * @return {AmpWebPushConfig}
   */
  parseConfig() {
    const config = {};

    for (const attribute in WebPushConfigAttributes) {
      const value = WebPushConfigAttributes[attribute];
      config[value] = this.element.getAttribute(value);
    }

    return config;
  }

  /** @override */
  buildCallback() {
    this.validate();
    const config = this.parseConfig();

    webPushServiceForDoc(this.element).then(service => {
      service.start(config).catch(() => {});
    });

    this.registerAction(
      WebPushWidgetActions.SUBSCRIBE,
      this.onSubscribe_.bind(this)
    );
    this.registerAction(
      WebPushWidgetActions.UNSUBSCRIBE,
      this.onUnsubscribe_.bind(this)
    );
  }

  /**
   * Ensures this element is defined with TAG id.
   * @private
   */
  ensureSpecificElementId_() {
    if (this.element.getAttribute('id') !== TAG) {
      throw user().createError(
        `<${CONFIG_TAG}> must have an id ` +
          "attribute with value '" +
          TAG +
          "'."
      );
    }
  }

  /**
   * Ensures there isn't another page element with the same id.
   * @private
   */
  ensureUniqueElement_() {
    const webPushConfigElements = this.getAmpDoc()
      .getRootNode()
      .querySelectorAll(`#${escapeCssSelectorIdent(CONFIG_TAG)}`);
    if (webPushConfigElements.length > 1) {
      throw user().createError(
        `Only one <${CONFIG_TAG}> element may exist on a page.`
      );
    }
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  onSubscribe_(invocation) {
    // Disable the widget temporarily to prevent multiple clicks The widget will
    // be re-enabled when the popup is closed, or the user interacts with the
    // prompt
    const widget = dev().assertElement(invocation.event.target);

    this.setWidgetDisabled_(widget, true);

    webPushServiceForDoc(this.element).then(service => {
      service
        .subscribe(() => {
          // On popup closed
          this.setWidgetDisabled_(widget, false);
        })
        .then(() => {
          // On browser notification permission granted, denied, or dismissed
          this.setWidgetDisabled_(widget, false);
        });
    });
  }

  /**
   *
   * @param {!Element} widget
   * @param {boolean} isDisabled
   * @private
   */
  setWidgetDisabled_(widget, isDisabled) {
    widget.disabled = isDisabled;
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  onUnsubscribe_(invocation) {
    const widget = dev().assertElement(invocation.event.target);

    this.setWidgetDisabled_(widget, true);

    webPushServiceForDoc(this.element).then(service => {
      service.unsubscribe().then(() => {
        this.setWidgetDisabled_(widget, false);
      });
    });
  }

  /**
   * @private
   * @param {string} url
   * @return {boolean}
   */
  isValidHelperOrPermissionDialogUrl_(url) {
    try {
      const parsedUrl = parseUrlDeprecated(url);
      /*
        The helper-iframe-url must be to a specific lightweight page on the
        user's site for handling AMP postMessage calls without loading push
        vendor-specific SDKs or other resources. It should not be the site root.

        The permission-dialog-url can load push vendor-specific SDKs, but it
        should still not be the site root and should be a dedicated page for
        subscribing.
      */
      const isNotRootUrl = parsedUrl.pathname.length > 1;

      /*
        Similar to <amp-form> and <amp-iframe>, the helper and subscribe URLs
        must be HTTPS. This is because most AMP caches serve pages over HTTPS,
        and an HTTP iframe URL would not load due to insecure resources being
        blocked on a secure page.
      */
      const isSecureUrl = parsedUrl.protocol === 'https:';

      return isSecureUrl && isNotRootUrl;
    } catch (e) {
      return false;
    }
  }
}
