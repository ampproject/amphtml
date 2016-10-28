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

import {getServiceForDoc} from './service';
import {parseUrl, getSourceUrl} from './url';
import {user} from './log';


/**
 * Properties:
 *     - url: The doc's url.
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *       for concurrent page views of a user().
 *
 * @typedef {{
 *   url: string,
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 * }}
 */
export let DocumentInfoDef;


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!DocumentInfoDef} Info about the doc
 */
export function documentInfoForDoc(nodeOrDoc) {
  return /** @type {!DocumentInfoDef} */ (getServiceForDoc(nodeOrDoc,
      'documentInfo', ampdoc => {
        const rootNode = ampdoc.getRootNode();
        let canonicalUrl = rootNode && rootNode.AMP
            && rootNode.AMP.canonicalUrl;
        if (!canonicalUrl) {
          const canonicalTag = user().assert(
              rootNode.querySelector('link[rel=canonical]'),
              'AMP files are required to have a <link rel=canonical> tag.');
          canonicalUrl = parseUrl(canonicalTag.href).href;
        }
        const pageViewId = getPageViewId(ampdoc.win);
        const res = {
          get sourceUrl() {
            return getSourceUrl(ampdoc.getUrl());
          },
          canonicalUrl,
          pageViewId,
        };
        return res;
      }));
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
