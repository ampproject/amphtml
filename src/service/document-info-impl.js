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

import {
  getProxyServingType,
  getSourceUrl,
  parseQueryString,
  parseUrlDeprecated,
} from '../url';
import {isArray} from '../types';
import {map} from '../utils/object';
import {registerServiceBuilderForDoc} from '../service';

/** @private @const {!Array<string>} */
const filteredLinkRels = ['prefetch', 'preload', 'preconnect', 'dns-prefetch'];

/**
 * Properties:
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *       for concurrent page views of a user().
 *     - linkRels: A map object of link tag's rel (key) and corresponding
 *       hrefs (value). rel could be 'canonical', 'icon', etc.
 *     - metaTags: A map object of meta tag's name (key) and corresponding
 *       contents (value).
 *     - replaceParams: A map object of extra query string parameter names (key)
 *       to corresponding values, used for custom analytics.
 *       Null if not applicable.
 *
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 *   linkRels: !Object<string, string|!Array<string>>,
 *   metaTags: !Object<string, string|!Array<string>>,
 *   replaceParams: ?Object<string, string|!Array<string>>
 * }}
 */
export let DocumentInfoDef;


/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installDocumentInfoServiceForDoc(nodeOrDoc) {
  return registerServiceBuilderForDoc(nodeOrDoc, 'documentInfo', DocInfo);
}


export class DocInfo {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const  */
    this.ampdoc_ = ampdoc;
    /** @private {?DocumentInfoDef} */
    this.info_ = null;
  }

  /** @return {!DocumentInfoDef} */
  get() {
    if (this.info_) {
      return this.info_;
    }
    const ampdoc = this.ampdoc_;
    const url = ampdoc.getUrl();
    const sourceUrl = getSourceUrl(url);
    const rootNode = ampdoc.getRootNode();
    let canonicalUrl = rootNode && rootNode.AMP
        && rootNode.AMP.canonicalUrl;
    if (!canonicalUrl) {
      const canonicalTag = rootNode.querySelector('link[rel=canonical]');
      canonicalUrl = canonicalTag
        ? parseUrlDeprecated(canonicalTag.href).href
        : sourceUrl;
    }
    const pageViewId = getPageViewId(ampdoc.win);
    const linkRels = getLinkRels(ampdoc.win.document);
    const metaTags = getMetaTags(ampdoc.win.document);
    const replaceParams = getReplaceParams(ampdoc);

    return this.info_ = {
      /** @return {string} */
      get sourceUrl() {
        return getSourceUrl(ampdoc.getUrl());
      },
      canonicalUrl,
      pageViewId,
      linkRels,
      metaTags,
      replaceParams,
    };
  }
}


/**
 * Returns a relatively low entropy random string.
 * This should be called once per window and then cached for subsequent
 * access to the same value to be persistent per page.
 * @param {!Window} win
 * @return {string}
 */
function getPageViewId(win) {
  return String(Math.floor(win.Math.random() * 10000));
}

/**
 * Returns a map object of link tag relations in document head.
 * Key is the link rel, value is a list of corresponding hrefs.
 * @param {!Document} doc
 * @return {!JsonObject<string, string|!Array<string>>}
 */
function getLinkRels(doc) {
  const linkRels = map();
  if (doc.head) {
    const links = doc.head.querySelectorAll('link[rel]');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const {href} = link;
      const rels = link.getAttribute('rel');
      if (!rels || !href) {
        continue;
      }

      rels.split(/\s+/).forEach(rel => {
        if (filteredLinkRels.indexOf(rel) != -1) {
          return;
        }

        let value = linkRels[rel];
        if (value) {
          // Change to array if more than one href for the same rel
          if (!isArray(value)) {
            value = linkRels[rel] = [value];
          }
          value.push(href);
        } else {
          linkRels[rel] = href;
        }
      });
    }
  }
  return linkRels;
}

/**
 * Returns a map object of meta tags in document head.
 * Key is the meta name, value is a list of corresponding content values.
 * @param {!Document} doc
 * @return {!JsonObject<string, string|!Array<string>>}
 */
function getMetaTags(doc) {
  const metaTags = map();
  if (doc.head) {
    const metas = doc.head.querySelectorAll('meta[name]');
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const content = meta.getAttribute('content');
      const name = meta.getAttribute('name');
      if (!name || !content) {
        continue;
      }

      let value = metaTags[name];
      if (value) {
        // Change to array if more than one content for the same name
        if (!isArray(value)) {
          value = metaTags[name] = [value];
        }
        value.push(content);
      } else {
        metaTags[name] = content;
      }
    }
  }
  return metaTags;
}

/**
 * Attempts to retrieve extra parameters from the "amp_r" query param,
 * returning null if invalid.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {?JsonObject<string, string|!Array<string>>}
 */
function getReplaceParams(ampdoc) {
  // The "amp_r" parameter is only supported for ads.
  if (!ampdoc.isSingleDoc() ||
      getProxyServingType(ampdoc.win.location.href) != 'a') {
    return null;
  }
  const url = parseUrlDeprecated(ampdoc.win.location.href);
  const replaceRaw = parseQueryString(url.search)['amp_r'];
  if (replaceRaw === undefined) {
    // Differentiate the case between empty replace params and invalid result
    return null;
  }
  return parseQueryString(replaceRaw);
}
