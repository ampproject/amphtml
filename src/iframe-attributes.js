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
import {urls} from './config';
import {Services} from './services';
import {experimentToggles, isCanary} from './experiments';
import {getLengthNumeral} from './layout';
import {getModeObject} from './mode-object';
import {DomFingerprint} from './utils/dom-fingerprint';
import {dict} from './utils/object.js';


/**
 * @typedef {{
 *   creative: (string|undefined),
 *   clientId: (string|undefined),
 *   container: (string|undefined),
 *   type: (string|undefined),
 * }}
 */
export let OptionalIframeMetadata;


class IframeMetadataBuilder {
  /**
   * @param {!Window} parentWindow
   * @param {!AmpElement} element
   * @param {?string} sentinel
   * @param {!JsonObject=} opt_attributes
   */
  constructor(parentWindow, element, sentinel, opt_attributes) {
    /** @private @const */
    this.startTime_ = Date.now();

    /** @private @const */
    this.parentWindow_ = parentWindow;

    /** @private @const */
    this.element_ = element;

    /** @private @const */
    this.attributes_ = opt_attributes || dict({});

    /** @private @const */
    this.sentinel_ = sentinel;

    /** @private */
    this.type_ = opt_attributes && opt_attributes['type'] || null;

    /** @private {?string} */
    this.clientId_ = null;

    /** @private */
    this.container_ = null;

    /** @private */
    this.creative_ = null;
  }

  /**
   * @param {!Window} parentWindow
   * @param {!AmpElement} element
   * @param {?string} sentinel
   * @param {!JsonObject=} opt_attributes
   * @return {!IframeMetadataBuilder}
   */
  static create(parentWindow, element, sentinel, opt_attributes) {
    return new IframeMetadataBuilder(
        parentWindow, element, sentinel, opt_attributes);
  }

  /**
   * @param {!OptionalIframeMetadata} metadata
   */
  setOptional(metadata) {
    if (metadata.creative) {
      this.creative_ = metadata.creative;
    }
    if (metadata.clientId) {
      this.clientId_ = metadata.clientId;
    }
    if (metadata.container) {
      this.container_ = metadata.container;
    }
    if (metadata.type) {
      this.type_ = metadata.type;
    }
  }

  /**
   * @return {!JsonObject}
   * @private
   */
  getAttributes_() {
    const width = this.element_.getAttribute('width');
    const height = this.element_.getAttribute('height');

    const adSrc = this.element_.getAttribute('src');

    if (adSrc) {
      this.attributes_['src'] = adSrc;
    }

    if (this.type_) {
      this.attributes_['type'] = this.type_;
    }

    this.attributes_['width'] = getLengthNumeral(width);
    this.attributes_['height'] = getLengthNumeral(height);

    return this.attributes_;
  }

  /**
   * @return {string}
   * @private
   */
  getLocationHref_() {
    // This is really only needed for tests, but whatever. Children
    // see us as the logical origin, so telling them we are about:srcdoc
    // will fail ancestor checks.
    if (this.parentWindow_.location.href == 'about:srcdoc') {
      return this.parentWindow_.parent.location.href;
    }
    return this.parentWindow_.location.href;
  }

  /**
   * @return {?{left: number, top: number, width: number, height: number}}
   * @private
   */
  getInitialLayoutRect_() {
    const layoutRectOptional = this.element_.getPageLayoutBox();

    if (!layoutRectOptional) {
      return null;
    }

    return {
      'left': layoutRectOptional.left,
      'top': layoutRectOptional.top,
      'width': layoutRectOptional.width,
      'height': layoutRectOptional.height,
    };
  }

  /**
   * @return {!JsonObject}
   */
  build() {
    const docInfo = Services.documentInfoForDoc(this.element_);
    const viewer = Services.viewerForDoc(this.element_);
    const referrer = viewer.getUnconfirmedReferrerUrl();

    return dict({
      'type': this.type_ || undefined,

      'attributes': this.getAttributes_(),

      'config': {
        'mode': getModeObject(),
        'experimentToggles': experimentToggles(this.parentWindow_),
      },

      'context': {
        'ampcontextVersion': '$internalRuntimeVersion$',
        'ampcontextFilepath':
            `${urls.thirdParty}/$internalRuntimeVersion$/ampcontext-v0.js`,
        'canary': isCanary(this.parentWindow_),
        'canonicalUrl': docInfo.canonicalUrl,
        'domFingerprint': DomFingerprint.generate(this.element_),
        'hidden': !viewer.isVisible(),
        'initialIntersection': this.element_.getIntersectionChangeEntry(),
        'location': {'href': this.getLocationHref_()},
        'pageViewId': docInfo.pageViewId,
        'referrer': referrer,
        'sourceUrl': docInfo.sourceUrl,
        'sentinel': this.sentinel_,
        'startTime': this.startTime_,
        'tagName': this.element_.tagName,

        // Optionals.
        'clientId': this.clientId_ || undefined,
        'container': this.container_ || undefined,
        'initialLayoutRect': this.getInitialLayoutRect_() || undefined,
      },

      // Hm.
      'creative': this.creative_ || undefined,
    });
  }
}


/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {!string} sentinel
 * @param {!JsonObject=} opt_attributes
 * @return {!IframeMetadataBuilder}
 */
export function getContextMetadataBuilder(
    parentWindow, element, sentinel, opt_attributes) {

  return IframeMetadataBuilder
      .create(parentWindow, element, sentinel, opt_attributes);
}
