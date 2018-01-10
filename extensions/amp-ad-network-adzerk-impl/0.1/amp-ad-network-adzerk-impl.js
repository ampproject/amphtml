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
import {AmpMustache} from '../../amp-mustache/0.1/amp-mustache';
import {urls} from '../../../src/config';
import {tryParseJson} from '../../../src/json';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
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
      doc: !Document,
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
    this.creativeMetaData_ = null;

    this.win.AMP.registerTemplate('amp-mustache', AmpMustache);
  };

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
    // TODO(keithwrightbos): this is temporary until AMP cache can be modified
    // to parse and supply this information as opposed to requiring client
    // side parsing.  For now build metadata and remove portions of template.
    // Only the body will be used for mustache expansion.
    const doc = new DOMParser().parseFromString(template, 'text/html');
    if (!doc) {
      throw new Error('Unable to parse template');
    }
    const parsedTemplate = {
      doc,
      metadata: {
        // minifiedCreative will be populated using mustache and macro values.
        minifiedCreative: '',
        customElementExtensions: [],
        customStylesheets: [],
      },
      access: Date.now(),
    };
    Array.prototype.forEach.call(
        // Scripts can be present within the body as configurations so only
        // look for those with src attribute for removal (extensions and
        // runtime).
        doc.querySelectorAll('script[src]'),
        element => {
          const customElement = element.getAttribute('custom-element');
          if (customElement) {
            parsedTemplate.metadata.customElementExtensions.push(customElement);
          }
          element.parentElement.removeChild(element);
        });
    Array.prototype.forEach.call(
        doc.querySelectorAll('link[rel=stylesheet][href]'),
        element => {
          parsedTemplate.metadata.customStylesheets.push({
            href: element.getAttribute('href'),
          });
          element.parentElement.removeChild(element);
        });
    Array.prototype.forEach.call(
        doc.querySelectorAll('style[amp4ads-boilerplate]'),
        element => element.parentElement.removeChild(element));
    // TODO(keithwrightbos): support dynamic creation of amp-pixel and
    // amp-analytics.
    return parsedTemplate;
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
      const ampCreativeJson =
          /** @type {!AmpTemplateCreativeDef} */(tryParseJson(body) || {});
      if (isNaN(parseInt(ampCreativeJson.ampCreativeTemplateId, 10))) {
        dev().warn(TAG, 'AMP creative missing/invalid template path',
            ampCreativeJson);
        this.forceCollapse();
        return Promise.reject(NO_CONTENT_RESPONSE);
      }
      // TODO(keithwrightbos): macro value validation?  E.g. http invalid?
      return this.retrieveTemplate_(ampCreativeJson.ampCreativeTemplateId)
          .then(parsedTemplate => {
            // Assign copy of cached metadata to local and then build
            // minifiedCreative by temporarily modifying cached document's
            // body ensuring that it is reset so that other consumers can
            // macro.
            // TODO(keithwrightbos): sanitizeHtml strips out ALL script elements
            // including those used within extensions (e.g. amp-analytics &
            // amp-animation).
            this.creativeMetaData_ = Object.assign({}, parsedTemplate.metadata);
            const origDocBody = parsedTemplate.doc.body./*OK*/innerHTML;
            return Services.templatesFor(this.win)
                .findAndRenderTemplate(
                    parsedTemplate.doc.body,
                    ampCreativeJson.templateMacroValues ||
                    /** @type{!JsonObject} */ ({}))
                .then(element => {
                  parsedTemplate.doc.body./*OK*/innerHTML =
                      element./*OK*/innerHTML;
                  this.creativeMetaData_.minifiedCreative =
                      parsedTemplate.doc.documentElement./*OK*/outerHTML;
                  parsedTemplate.doc.body./*OK*/innerHTML = origDocBody;
                  return utf8Encode(this.creativeMetaData_.minifiedCreative);
                });
          })
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
    return /**@type {?CreativeMetaDataDef}*/(this.creativeMetaData_);
  }
}


AMP.extension('amp-ad-network-adzerk-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-adzerk-impl', AmpAdNetworkAdzerkImpl);
});
