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

import {fromClassForDoc} from '../service';
import {parseUrl, getSourceUrl} from '../url';


/**
 * Properties:
 *     - url: The doc's url.
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *       for concurrent page views of a user().
 *
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 * }}
 */
export let DocumentInfoDef;


/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!DocInfo} Info about the doc
 */
export function installDocumentInfoServiceForDoc(nodeOrDoc) {
  return fromClassForDoc(nodeOrDoc, 'documentInfo', DocInfo);
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
    return this.info_ = {
      /** @return {string} */
      get sourceUrl() {
        return getSourceUrl(ampdoc.getUrl());
      },
      canonicalUrl,
      pageViewId,
    };
  }
}

const pageViewIdByWindow = {};

/**
 * Returns a relatively low entropy random string.
 * This should be called once per window and then cached for subsequent
 * access to the same value to be persistent per page.
 * @param {!Window} win
 * @return {string}
 */
export function getPageViewId(win) {
  if (!pageViewIdByWindow[win]) {
    pageViewIdByWindow[win] = String(Math.floor(win.Math.random() * 10000));
  }
  return pageViewIdByWindow[win];
}
