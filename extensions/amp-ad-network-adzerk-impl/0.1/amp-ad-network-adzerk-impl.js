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

import {
  AmpA4A,
  NO_CONTENT_RESPONSE,
  CreativeMetaDataDef,
} from '../../amp-a4a/0.1/amp-a4a';
import {Bind} from '../../amp-bind/0.1/bind-impl';
import {urls} from '../../../src/config';
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {getAmpdoc} from '../../../src/service';
import {Services} from '../../../src/services';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

/** @type {string} */
const TAG = 'amp-ad-network-adzerk-impl';

/** @visibleForTesting @type {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/** @typedef {{
      ampCreativeTemplateId: number,
      templateMacroValues: (JsonObject|undefined),
    }} */
let AmpTemplateCreativeDef;

/** @typedef {{
      template: string,
      metadata: !CreativeMetaDataDef,
      access: number
    }} */
let CachedTemplateDef;

/** @private {!Object<number, !Promise<!CachedTemplateDef>>} */
const TemplateCache = {};

/** @private {!Object<string, string|boolean>} */
const TEMPLATE_CORS_CONFIG = {
  mode: 'cors',
  method: 'GET',
  // This should be cached across publisher domains, so don't append
  // __amp_source_origin to the URL.
  ampCors: false,
  credentials: 'omit',
};

/**
 * Fast Fetch implementation for AdZerk network that allows AMP creative
 * preferential render via AMP cache stored template expansion using
 * amp-mustache.  AMP creative response will consist of the following JSON
 * object with two fields:
 *
 * - ampCreativeTemplateId: number value for template ID.  Template must already
 *    have been stored in the AMP cache.
 * - templateMacroValues: optional JSON object mapping of macro name to its
 *    string value used to dynamically update the template
 *
 * Additionally, ad response must include header indicating AMP creative
 * template response: AMP-template-amp-creative: true
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
  }

  /**
   * Validate the tag parameters.  If invalid, ad ad will not be displayed.
   * @override
   */
  isValidElement() {
    if (!this.win['DOMParser']) {
      dev().error(TAG, 'Missing DOM Parser');
      return false;
    }
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
    const src = this.element.getAttribute('src');
    if (!/^https:\/\/adzerk.com\?id=\d+$/i.test(src)) {
      return '';
    }
    if (getMode(this.win).localDev) {
      return `http://ads.localhost:${this.win.location.port}` +
        '/adzerk/' + /^https:\/\/adzerk.com\?id=(\d+)/.exec(src)[1];
    }
    // TODO(adzerk): specify expected src path.
    return /^https:\/\/adzerk.com\?id=\d+$/i.test(src) ? src : '';
  }

  /**
   * Fetch and parse template from AMP cache.  Result is stored in global in
   * order to reduce overhead when template is used multiple times.
   * @param {number} templateId
   * @return {!Promise<!CachedTemplateDef>}
   * @private
   */
  retrieveTemplate_(templateId) {
    // Retrieve template from AMP cache.
    TemplateCache[templateId] = TemplateCache[templateId] ||
        Services.xhrFor(this.win)
            .fetchText(getMode(this.win).localDev ?
              `http://ads.localhost:${this.win.location.port}` +
                `/a4a_template/adzerk/${templateId}` :
              `${urls.cdn}/c/s/adzerk/${templateId}`,
            TEMPLATE_CORS_CONFIG)
            .then(response => response.text())
            .then(template => this.parseTemplate_(template));
    TemplateCache[templateId].access = Date.now();
    const cacheKeys = /**@type {!Array<number>}*/(Object.keys(TemplateCache));
    if (cacheKeys.length > 5) {
      dev().warn(TAG, 'Trimming template cache');
      // Evict oldest entry to ensure memory usage is minimized.
      cacheKeys.sort((a, b) =>
        TemplateCache[b].access - TemplateCache[a].access);
      delete TemplateCache[cacheKeys[cacheKeys.length - 1]];
    }
    dev().assert(TemplateCache[templateId]);
    return TemplateCache[templateId];
  }

  /**
   * Extracts metadata from template head used for preferential render.
   * @param {string} template
   * @return {!CachedTemplateDef}
   * @private
   */
  parseTemplate_(template) {
    // TODO(keithwrightbos): support dynamic creation of amp-pixel and
    // amp-analytics.
    this.creativeMetadata_ = super.getAmpAdMetadata(template);
    return {
      template,
      metadata: this.creativeMetadata_,
      access: Date.now(),
    };
  }

  /** @override */
  maybeValidateAmpCreative(bytes, headers) {
    if (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'true') {
      return /**@type {!Promise<(ArrayBuffer|null)>}*/ (Promise.resolve(null));
    }
    // Shorthand for: reject promise if current promise chain is out of date.
    const checkStillCurrent = this.verifyStillCurrent();
    return utf8Decode(bytes).then(body => {
      checkStillCurrent();
      this.ampCreativeJson_ =
          /** @type {!AmpTemplateCreativeDef} */(tryParseJson(body) || {});
      if (isNaN(parseInt(this.ampCreativeJson_.ampCreativeTemplateId, 10))) {
        dev().warn(TAG, 'AMP creative missing/invalid template path',
            this.ampCreativeJson_);
        this.forceCollapse();
        return Promise.reject(NO_CONTENT_RESPONSE);
      }
      // TODO(keithwrightbos): macro value validation?  E.g. http invalid?
      return this.retrieveTemplate_(this.ampCreativeJson_.ampCreativeTemplateId)
          .then(parsedTemplate =>
              utf8Encode(parsedTemplate.metadata.minifiedCreative))
          .catch(error => {
            dev().warn(TAG, 'Error fetching/expanding template',
                ampCreativeJson, error);
            this.forceCollapse();
            return Promise.reject(NO_CONTENT_RESPONSE);
          });
    });
  }

  /** @override */
  getAmpAdMetadata(unusedCreative) {
    return /**@type {?CreativeMetaDataDef}*/(this.creativeMetadata_);
  }

  /** @override */
  onCreativeRender(unusedMetadata) { debugger;
    if (this.ampCreativeJson_ && this.ampCreativeJson_.templateMacroValues) {
      const bind = new Bind(getAmpdoc(this.iframe.contentWindow.document.body),
          this.iframe.contentWindow);
      bind.setState(this.ampCreativeJson_.templateMacroValues);
    }
  }
}


AMP.extension('amp-ad-network-adzerk-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-adzerk-impl', AmpAdNetworkAdzerkImpl);
});
