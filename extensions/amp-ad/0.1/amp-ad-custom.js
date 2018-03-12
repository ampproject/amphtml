/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAdUIHandler} from './amp-ad-ui';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {addParamToUrl} from '../../../src/url';
import {ancestorElementsByTag} from '../../../src/dom';
import {
  childElementByTag,
  removeChildren,
} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

/** @const {string} Tag name for custom ad implementation. */
export const TAG_AD_CUSTOM = 'amp-ad-custom';

/** @var {Object} A map of promises for each value of data-url. The promise
 *  will fetch data for the URL for the ad server, and return it as a map of
 *  objects, keyed by slot; each object contains the variables to be
 *   substituted into the mustache template. */
const ampCustomadXhrPromises = {};

/** @var {Object} a map of full urls (i.e. including the ampslots parameter)
 * for each value of data-url */
let ampCustomadFullUrls = null;

export class AmpAdCustom extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?string} The base URL of the ad server for this ad */
    this.url_ = null;

    /** @private {?string} A string identifying this ad slot: the server's
     *  responses will be keyed by slot */
    this.slot_ = null;

    /** {?AmpAdUIHandler} */
    this.uiHandler = null;
  }

  /** @override */
  getLayoutPriority() {
    // Loads ads after other content
    const isPWA = !this.element.getAmpDoc().isSingleDoc();
    // give the ad higher priority if it is inside a PWA
    return isPWA ? 1 : 2;
  }

  /** @override **/
  isLayoutSupported(layout) {
    /** @TODO Add proper support for more layouts, and figure out which ones
     *  we're permitting */
    return isLayoutSizeDefined(layout);
  }

  buildCallback() {
    this.url_ = this.element.getAttribute('data-url');
    this.slot_ = this.element.getAttribute('data-slot');
    // Ensure that the slot value is legal
    user().assert(this.slot_ === null || this.slot_.match(/^[0-9a-z]+$/),
        'custom ad slot should be alphanumeric: ' + this.slot_);

    this.uiHandler = new AmpAdUIHandler(this);
  }

  /** @override */
  layoutCallback() {
    /** @const {string} fullUrl */
    const fullUrl = this.getFullUrl_();
    // If this promise has no URL yet, create one for it.
    if (!(fullUrl in ampCustomadXhrPromises)) {
      // Here is a promise that will return the data for this URL
      ampCustomadXhrPromises[fullUrl] =
          Services.xhrFor(this.win).fetchJson(fullUrl).then(res => res.json());
    }
    return ampCustomadXhrPromises[fullUrl].then(data => {
      // We will get here when the data has been fetched from the server
      let templateData = data;
      if (this.slot_ !== null) {
        templateData = data.hasOwnProperty(this.slot_) ? data[this.slot_] :
          null;
      }

      if (!templateData || typeof templateData != 'object') {
        this.uiHandler.applyNoContentUI();
        return;
      }

      templateData = this.handleTemplateData_(templateData);

      this.renderStarted();

      try {
        Services.templatesFor(this.win)
            .findAndRenderTemplate(this.element, templateData)
            .then(renderedElement => {
              // Get here when the template has been rendered
              // Clear out the child template and replace it by the rendered version
              // Note that we can't clear templates that's not ad's child because
              // they maybe used by other ad component.
              removeChildren(this.element);
              this.element.appendChild(renderedElement);
              this.signals().signal(CommonSignals.INI_LOAD);
            });
      } catch (e) {
        this.uiHandler.applyNoContentUI();
      }
    });
  }

  /**
   * Handles the template data response.
   * There are two types of templateData format
   * Format option 1
   * {
   *   'templateId': {},
   *   'vars': {},
   *   'data': {
   *     'a': '1',
   *     'b': '2'
   *   }
   * }
   * or format option 2
   * {
   *  'a': '1',
   *  'b': '2'
   * }
   * if `templateId` or `vars` are not specified.
   *
   * @param {!JsonObject} templateData
   * @return {!JsonObject}
   */
  handleTemplateData_(templateData) {
    if (childElementByTag(this.element, 'template')) {
      // Need to check for template attribute if it's allowed in amp-ad tag
      return templateData;
    }

    // If use remote template specified by response
    user().assert(templateData['templateId'], 'TemplateId not specified');

    user().assert(
        templateData['data'] && typeof templateData['data'] == 'object',
        'Template data not specified');

    this.element.setAttribute('template', templateData['templateId']);

    if (templateData['vars'] && typeof templateData['vars'] == 'object') {
      // Support for vars
      const vars = templateData['vars'];
      const keys = Object.keys(vars);
      for (let i = 0; i < keys.length; i++) {
        const attrName = 'data-vars-' + keys[i];
        try {
          this.element.setAttribute(attrName, vars[keys[i]]);
        } catch (e) {
          this.user().error(TAG_AD_CUSTOM, 'Fail to set attribute: ', e);
        }
      }
    }

    return templateData['data'];
  }

  /** @override  */
  unlayoutCallback() {
    this.uiHandler.applyUnlayoutUI();
    return true;
  }

  /** @override */
  createPlaceholderCallback() {
    return this.uiHandler.createPlaceholder();
  }

  /**
   * @private getFullUrl_ Get a URL which includes a parameter indicating
   * all slots to be fetched from this web server URL
   * @returns {string} The URL with the "ampslots" parameter appended
   */
  getFullUrl_() {
    // If this ad doesn't have a slot defined, just return the base URL
    if (this.slot_ === null) {
      return /** @type {string} */ (this.url_);
    }
    if (ampCustomadFullUrls === null) {
      // The array of ad urls has not yet been built, do so now.
      ampCustomadFullUrls = {};
      const slots = {};

      // Get the parent body of this amp-ad element. It could be the body of
      // the main document, or it could be an enclosing iframe.
      const body = ancestorElementsByTag(this.element, 'BODY')[0];
      const elements = body.querySelectorAll('amp-ad[type=custom]');
      for (let index = 0; index < elements.length; index++) {
        const elem = elements[index];
        const url = elem.getAttribute('data-url');
        const slotId = elem.getAttribute('data-slot');
        if (slotId !== null) {
          if (!(url in slots)) {
            slots[url] = [];
          }
          slots[url].push(encodeURIComponent(slotId));
        }
      }
      for (const baseUrl in slots) {
        ampCustomadFullUrls[baseUrl] = addParamToUrl(baseUrl, 'ampslots',
            slots[baseUrl].join(','));
      }
    }
    return ampCustomadFullUrls[this.url_];
  }
}
