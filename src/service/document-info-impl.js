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

import {parseUrl, getSourceUrl} from '../url';
import {map} from '../utils/object';
import {isArray} from '../types';
import {registerServiceBuilderForDoc} from '../service';

/** @private @const {!Array<string>} */
const filteredLinkRels = ['prefetch', 'preload', 'preconnect', 'dns-prefetch'];

/**
 * Properties:
 *     - url: The doc's url.
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *       for concurrent page views of a user().
 *     - linkRels: A map object of link tag's rel (key) and corresponding
 *       hrefs (value). rel could be 'canonical', 'icon', etc.
 *
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 *   linkRels: !Object<string, string|!Array<string>>,
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
          ? parseUrl(canonicalTag.href).href
          : sourceUrl;
    }
    const pageViewId = getPageViewId(ampdoc.win);
    const linkRels = getLinkRels(ampdoc.win.document);

    return this.info_ = {
      /** @return {string} */
      get sourceUrl() {
        return getSourceUrl(ampdoc.getUrl());
      },
      canonicalUrl,
      pageViewId,
      linkRels,
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
 * @return {!Object<string, string|!Array<string>>}
 */
function getLinkRels(doc) {
  const linkRels = map();
  if (doc.head) {
    const links = doc.head.querySelectorAll('link[rel]');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.href;
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
