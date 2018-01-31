/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  AmpA4A,
  NO_CONTENT_RESPONSE,
  CreativeMetaDataDef,
} from '../../amp-a4a/0.1/amp-a4a';
import {AmpAdTemplates} from '../../amp-a4a/0.1/amp-ad-templates';
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

/** @type {string} */
const TAG = 'amp-ad-network-adzerk-impl';

/** @visibleForTesting @type {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** @typedef {{
      templateUrl: string,
      data: (JsonObject|undefined),
    }} */
let AmpTemplateCreativeDef;

/** @private {?AmpAdTemplates} */
let ampAdTemplates;

/**
 * Fast Fetch implementation for AdZerk network that allows AMP creative
 * preferential render via AMP cache stored template expansion using
 * amp-mustache.  AMP creative response will consist of the following JSON
 * object with two fields:
 *
 * - templateUrl: number value for template ID.  Template must already
 *    have been stored in the AMP cache.
 * - data: optional JSON object mapping of macro name to its
 *    string value used to dynamically update the template
 *
 * Additionally, ad response must include header indicating AMP creative
 * template type, e.g.: `AMP-template-amp-creative: amp-mustache`.
 *
 * Failure to properly fetch or expand template will result in slot collapsing.
 * Non-AMP creatives (defined as those not including AMP-template-amp-creative)
 * will be rendered via cross domain frame.
 */
export class AmpAdNetworkAdzerkImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {?CreativeMetaDataDef} */
    this.creativeMetadata_ = null;

    /** @private {?AmpTemplateCreativeDef} */
    this.ampCreativeJson_ = null;

    ampAdTemplates = ampAdTemplates || new AmpAdTemplates(this.win);
  }

  /**
   * Validate the tag parameters.  If invalid, ad ad will not be displayed.
   * @override
   */
  isValidElement() {
    return !!this.getAdUrl();
  }

  /** @override */
  getSigningServiceNames() {
    // Does not utilize crypto signature based AMP creative validation.
    // TODO(keithwrightbos): move import of crypto validation into
    // implementations, reducing adzerk binary size.
    return [];
  }

  /** @override */
  getAdUrl() {
    const data = this.element.getAttribute('data-r');
    dev().assert(data, 'Expected data-r attribte on amp-ad tag');
    if (getMode(this.win).localDev) {
      return `http://ads.localhost:${this.win.location.port}` +
          '/adzerk/' + data;
    }
    return `https://engine.adzerk.net/amp?r=${encodeURIComponent(data)}`;
  }

  /** @override */
  maybeValidateAmpCreative(bytes, headers) {
    if (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      return /**@type {!Promise<(ArrayBuffer|null)>}*/ (Promise.resolve(null));
    }
    // Shorthand for: reject promise if current promise chain is out of date.
    const checkStillCurrent = this.verifyStillCurrent();
    return Promise.resolve(utf8Decode(bytes)).then(body => {
      checkStillCurrent();
      this.ampCreativeJson_ = /** @type {!AmpTemplateCreativeDef} */
        (tryParseJson(body) || {});
      // TODO(keithwrightbos): macro value validation?  E.g. http invalid?
      return ampAdTemplates
          .fetch(this.ampCreativeJson_.templateUrl)
          .then(parsedTemplate => {
            return utf8Encode(this.parseMetadataFromCreative(parsedTemplate));
          })
          .catch(error => {
            dev().warn(TAG, 'Error fetching/expanding template',
                this.ampCreativeJson_, error);
            this.forceCollapse();
            return Promise.reject(NO_CONTENT_RESPONSE);
          });
    });
  }

  /**
   * Parses out required extensions and returns a minified version of the
   * creative.
   * @param {string} creative
   * @return {string} A minified version of the creative, suitable to be
   *   rendered as an amp4ads ad.
   */
  parseMetadataFromCreative(creative) {
    // TODO(levitzky) The following minification is for demo purposes only. Once
    // launched this will either be performed server-side, or will be replaced
    // by more sophisticated logic.
    const minifiedCreative = creative.replace(
        /<script async.+?<\/script>/g, '');
    this.creativeMetadata_ = /** @type {?CreativeMetaDataDef} */ ({
      minifiedCreative,
      customElementExtensions: [],
      extensions: [],
    });
    return minifiedCreative;
  }

  /** @override */
  getAmpAdMetadata(unusedCreative) {
    if (!this.creativeMetadata_) {
      this.creativeMetadata_ = /**@type {?CreativeMetaDataDef}*/ ({});
    }
    if (!this.creativeMetadata_['customElementExtensions']) {
      this.creativeMetadata_['customElementExtensions'] = [];
    }
    if (this.ampCreativeJson_.analytics) {
      pushIfNotExist(
          this.creativeMetadata_['customElementExtensions'], 'amp-analytics');
    }
    pushIfNotExist(
        this.creativeMetadata_['customElementExtensions'], 'amp-mustache');
    return /**@type {?CreativeMetaDataDef}*/(this.creativeMetadata_);
  }

  /** @override */
  onCreativeRender(unusedMetadata) {
    if (this.ampCreativeJson_ && this.ampCreativeJson_.data) {
      ampAdTemplates.render(
          this.ampCreativeJson_.data,
          this.iframe.contentWindow.document.body)
          .then(renderedElement => {
            if (this.ampCreativeJson_.analytics) {
              ampAdTemplates.insertAnalytics(
                  renderedElement, this.ampCreativeJson_.analytics);
            }
            this.iframe.contentWindow.document.body./*OK*/innerHTML =
                renderedElement./*OK*/innerHTML;
          });
    }
  }
}

function pushIfNotExist(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
  }
}

AMP.extension('amp-ad-network-adzerk-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-adzerk-impl', AmpAdNetworkAdzerkImpl);
});
