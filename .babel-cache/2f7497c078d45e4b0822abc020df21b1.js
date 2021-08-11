function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { isArray } from "../core/types";
import { map } from "../core/types/object";
import { parseQueryString } from "../core/types/string/url";

import { getRandomString64 } from "./cid-impl";

import { registerServiceBuilderForDoc } from "../service-helpers";
import { getProxyServingType, getSourceUrl, parseUrlDeprecated } from "../url";

/** @private @const {!Array<string>} */
var filteredLinkRels = ['prefetch', 'preload', 'preconnect', 'dns-prefetch'];

/**
 * Properties:
 *     - sourceUrl: the source url of an amp document.
 *     - canonicalUrl: The doc's canonical.
 *     - pageViewId: Id for this page view. Low entropy but should be unique
 *     - pageViewId64: Id for this page view. High entropy but should be unique
 *       for concurrent page views of a user().
 *     - linkRels: A map object of link tag's rel (key) and corresponding
 *       hrefs (value). rel could be 'canonical', 'icon', etc.
 *     - viewport: The global doc's viewport.
 *     - replaceParams: A map object of extra query string parameter names (key)
 *       to corresponding values, used for custom analytics.
 *       Null if not applicable.
 *
 * @typedef {{
 *   sourceUrl: string,
 *   canonicalUrl: string,
 *   pageViewId: string,
 *   pageViewId64: !Promise<string>,
 *   linkRels: !Object<string, string|!Array<string>>,
 *   viewport: ?string,
 *   replaceParams: ?Object<string, string|!Array<string>>
 * }}
 */
export var DocumentInfoDef;

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {*} TODO(#23582): Specify return type
 */
export function installDocumentInfoServiceForDoc(nodeOrDoc) {
  return registerServiceBuilderForDoc(nodeOrDoc, 'documentInfo', DocInfo);
}

export var DocInfo = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function DocInfo(ampdoc) {_classCallCheck(this, DocInfo);
    /** @private @const  */
    this.ampdoc_ = ampdoc;
    /** @private {?DocumentInfoDef} */
    this.info_ = null;
    /** @private {?Promise<string>} */
    this.pageViewId64_ = null;
  }

  /** @return {!DocumentInfoDef} */_createClass(DocInfo, [{ key: "get", value:
    function get() {
      if (this.info_) {
        return this.info_;
      }
      var ampdoc = this.ampdoc_;
      var url = ampdoc.getUrl();
      var sourceUrl = getSourceUrl(url);
      var rootNode = ampdoc.getRootNode();
      var canonicalUrl = rootNode && rootNode.AMP && rootNode.AMP.canonicalUrl;
      if (!canonicalUrl) {
        var canonicalTag = rootNode.querySelector('link[rel=canonical]');
        canonicalUrl = canonicalTag ?
        parseUrlDeprecated(canonicalTag.href).href :
        sourceUrl;
      }
      var pageViewId = getPageViewId(ampdoc.win);
      var linkRels = getLinkRels(ampdoc.win.document);
      var viewport = getViewport(ampdoc.win.document);
      var replaceParams = getReplaceParams(ampdoc);

      return (this.info_ = {
        /** @return {string} */
        get sourceUrl() {
          return getSourceUrl(ampdoc.getUrl());
        },
        canonicalUrl: canonicalUrl,
        pageViewId: pageViewId,
        get pageViewId64() {
          // Must be calculated async since getRandomString64() can load the
          // amp-crypto-polyfill on some browsers, and extensions service
          // may not be registered yet.
          if (!this.pageViewId64_) {
            this.pageViewId64_ = getRandomString64(ampdoc.win);
          }
          return this.pageViewId64_;
        },
        linkRels: linkRels,
        viewport: viewport,
        replaceParams: replaceParams });

    } }]);return DocInfo;}();


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
  var linkRels = map();
  if (doc.head) {
    var links = doc.head.querySelectorAll('link[rel]');var _loop = function _loop(
    i) {
      var link = links[i];
      var href = link.href;
      var rels = link.getAttribute('rel');
      if (!rels || !href) {
        return "continue";
      }

      rels.split(/\s+/).forEach(function (rel) {
        if (filteredLinkRels.indexOf(rel) != -1) {
          return;
        }

        var value = linkRels[rel];
        if (value) {
          // Change to array if more than one href for the same rel
          if (!isArray(value)) {
            value = linkRels[rel] = [value];
          }
          value.push(href);
        } else {
          linkRels[rel] = href;
        }
      });};for (var i = 0; i < links.length; i++) {var _ret = _loop(i);if (_ret === "continue") continue;
    }
  }
  return linkRels;
}

/**
 * Returns the viewport of the document. Note that this is the viewport of the
 * host document for AmpDocShadow instances.
 * @param {!Document} doc
 * @return {?string}
 */
function getViewport(doc) {
  var viewportEl = doc.head.querySelector('meta[name="viewport"]');
  return viewportEl ? viewportEl.getAttribute('content') : null;
}

/**
 * Attempts to retrieve extra parameters from the "amp_r" query param,
 * returning null if invalid.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {?JsonObject<string, string|!Array<string>>}
 */
function getReplaceParams(ampdoc) {
  // The "amp_r" parameter is only supported for ads.
  if (
  !ampdoc.isSingleDoc() ||
  getProxyServingType(ampdoc.win.location.href) != 'a')
  {
    return null;
  }
  var url = parseUrlDeprecated(ampdoc.win.location.href);
  var replaceRaw = parseQueryString(url.search)['amp_r'];
  if (replaceRaw === undefined) {
    // Differentiate the case between empty replace params and invalid result
    return null;
  }
  return parseQueryString(replaceRaw);
}
// /Users/mszylkowski/src/amphtml/src/service/document-info-impl.js