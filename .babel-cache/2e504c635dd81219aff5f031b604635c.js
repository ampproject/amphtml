function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
  function DocInfo(ampdoc) {
    _classCallCheck(this, DocInfo);

    /** @private @const  */
    this.ampdoc_ = ampdoc;

    /** @private {?DocumentInfoDef} */
    this.info_ = null;

    /** @private {?Promise<string>} */
    this.pageViewId64_ = null;
  }

  /** @return {!DocumentInfoDef} */
  _createClass(DocInfo, [{
    key: "get",
    value: function get() {
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
        canonicalUrl = canonicalTag ? parseUrlDeprecated(canonicalTag.href).href : sourceUrl;
      }

      var pageViewId = getPageViewId(ampdoc.win);
      var linkRels = getLinkRels(ampdoc.win.document);
      var viewport = getViewport(ampdoc.win.document);
      var replaceParams = getReplaceParams(ampdoc);
      return this.info_ = {
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
        replaceParams: replaceParams
      };
    }
  }]);

  return DocInfo;
}();

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
    var links = doc.head.querySelectorAll('link[rel]');

    var _loop = function _loop(i) {
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
      });
    };

    for (var i = 0; i < links.length; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
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
  if (!ampdoc.isSingleDoc() || getProxyServingType(ampdoc.win.location.href) != 'a') {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvY3VtZW50LWluZm8taW1wbC5qcyJdLCJuYW1lcyI6WyJpc0FycmF5IiwibWFwIiwicGFyc2VRdWVyeVN0cmluZyIsImdldFJhbmRvbVN0cmluZzY0IiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsImdldFByb3h5U2VydmluZ1R5cGUiLCJnZXRTb3VyY2VVcmwiLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJmaWx0ZXJlZExpbmtSZWxzIiwiRG9jdW1lbnRJbmZvRGVmIiwiaW5zdGFsbERvY3VtZW50SW5mb1NlcnZpY2VGb3JEb2MiLCJub2RlT3JEb2MiLCJEb2NJbmZvIiwiYW1wZG9jIiwiYW1wZG9jXyIsImluZm9fIiwicGFnZVZpZXdJZDY0XyIsInVybCIsImdldFVybCIsInNvdXJjZVVybCIsInJvb3ROb2RlIiwiZ2V0Um9vdE5vZGUiLCJjYW5vbmljYWxVcmwiLCJBTVAiLCJjYW5vbmljYWxUYWciLCJxdWVyeVNlbGVjdG9yIiwiaHJlZiIsInBhZ2VWaWV3SWQiLCJnZXRQYWdlVmlld0lkIiwid2luIiwibGlua1JlbHMiLCJnZXRMaW5rUmVscyIsImRvY3VtZW50Iiwidmlld3BvcnQiLCJnZXRWaWV3cG9ydCIsInJlcGxhY2VQYXJhbXMiLCJnZXRSZXBsYWNlUGFyYW1zIiwicGFnZVZpZXdJZDY0IiwiU3RyaW5nIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZG9jIiwiaGVhZCIsImxpbmtzIiwicXVlcnlTZWxlY3RvckFsbCIsImkiLCJsaW5rIiwicmVscyIsImdldEF0dHJpYnV0ZSIsInNwbGl0IiwiZm9yRWFjaCIsInJlbCIsImluZGV4T2YiLCJ2YWx1ZSIsInB1c2giLCJsZW5ndGgiLCJ2aWV3cG9ydEVsIiwiaXNTaW5nbGVEb2MiLCJsb2NhdGlvbiIsInJlcGxhY2VSYXciLCJzZWFyY2giLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFXOEIsUUFBWCxDQUFvQmpDLElBQXJCLENBQTlCO0FBQ0EsTUFBTWtDLFVBQVUsR0FBRzFELGdCQUFnQixDQUFDZSxHQUFHLENBQUM0QyxNQUFMLENBQWhCLENBQTZCLE9BQTdCLENBQW5COztBQUNBLE1BQUlELFVBQVUsS0FBS0UsU0FBbkIsRUFBOEI7QUFDNUI7QUFDQSxXQUFPLElBQVA7QUFDRDs7QUFDRCxTQUFPNUQsZ0JBQWdCLENBQUMwRCxVQUFELENBQXZCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtpc0FycmF5fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cGFyc2VRdWVyeVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL3VybCc7XG5cbmltcG9ydCB7Z2V0UmFuZG9tU3RyaW5nNjR9IGZyb20gJy4vY2lkLWltcGwnO1xuXG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2N9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2dldFByb3h5U2VydmluZ1R5cGUsIGdldFNvdXJjZVVybCwgcGFyc2VVcmxEZXByZWNhdGVkfSBmcm9tICcuLi91cmwnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8c3RyaW5nPn0gKi9cbmNvbnN0IGZpbHRlcmVkTGlua1JlbHMgPSBbJ3ByZWZldGNoJywgJ3ByZWxvYWQnLCAncHJlY29ubmVjdCcsICdkbnMtcHJlZmV0Y2gnXTtcblxuLyoqXG4gKiBQcm9wZXJ0aWVzOlxuICogICAgIC0gc291cmNlVXJsOiB0aGUgc291cmNlIHVybCBvZiBhbiBhbXAgZG9jdW1lbnQuXG4gKiAgICAgLSBjYW5vbmljYWxVcmw6IFRoZSBkb2MncyBjYW5vbmljYWwuXG4gKiAgICAgLSBwYWdlVmlld0lkOiBJZCBmb3IgdGhpcyBwYWdlIHZpZXcuIExvdyBlbnRyb3B5IGJ1dCBzaG91bGQgYmUgdW5pcXVlXG4gKiAgICAgLSBwYWdlVmlld0lkNjQ6IElkIGZvciB0aGlzIHBhZ2Ugdmlldy4gSGlnaCBlbnRyb3B5IGJ1dCBzaG91bGQgYmUgdW5pcXVlXG4gKiAgICAgICBmb3IgY29uY3VycmVudCBwYWdlIHZpZXdzIG9mIGEgdXNlcigpLlxuICogICAgIC0gbGlua1JlbHM6IEEgbWFwIG9iamVjdCBvZiBsaW5rIHRhZydzIHJlbCAoa2V5KSBhbmQgY29ycmVzcG9uZGluZ1xuICogICAgICAgaHJlZnMgKHZhbHVlKS4gcmVsIGNvdWxkIGJlICdjYW5vbmljYWwnLCAnaWNvbicsIGV0Yy5cbiAqICAgICAtIHZpZXdwb3J0OiBUaGUgZ2xvYmFsIGRvYydzIHZpZXdwb3J0LlxuICogICAgIC0gcmVwbGFjZVBhcmFtczogQSBtYXAgb2JqZWN0IG9mIGV4dHJhIHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXIgbmFtZXMgKGtleSlcbiAqICAgICAgIHRvIGNvcnJlc3BvbmRpbmcgdmFsdWVzLCB1c2VkIGZvciBjdXN0b20gYW5hbHl0aWNzLlxuICogICAgICAgTnVsbCBpZiBub3QgYXBwbGljYWJsZS5cbiAqXG4gKiBAdHlwZWRlZiB7e1xuICogICBzb3VyY2VVcmw6IHN0cmluZyxcbiAqICAgY2Fub25pY2FsVXJsOiBzdHJpbmcsXG4gKiAgIHBhZ2VWaWV3SWQ6IHN0cmluZyxcbiAqICAgcGFnZVZpZXdJZDY0OiAhUHJvbWlzZTxzdHJpbmc+LFxuICogICBsaW5rUmVsczogIU9iamVjdDxzdHJpbmcsIHN0cmluZ3whQXJyYXk8c3RyaW5nPj4sXG4gKiAgIHZpZXdwb3J0OiA/c3RyaW5nLFxuICogICByZXBsYWNlUGFyYW1zOiA/T2JqZWN0PHN0cmluZywgc3RyaW5nfCFBcnJheTxzdHJpbmc+PlxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBEb2N1bWVudEluZm9EZWY7XG5cbi8qKlxuICogQHBhcmFtIHshTm9kZXwhLi9hbXBkb2MtaW1wbC5BbXBEb2N9IG5vZGVPckRvY1xuICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsRG9jdW1lbnRJbmZvU2VydmljZUZvckRvYyhub2RlT3JEb2MpIHtcbiAgcmV0dXJuIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2Mobm9kZU9yRG9jLCAnZG9jdW1lbnRJbmZvJywgRG9jSW5mbyk7XG59XG5cbmV4cG9ydCBjbGFzcyBEb2NJbmZvIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuICAgIC8qKiBAcHJpdmF0ZSB7P0RvY3VtZW50SW5mb0RlZn0gKi9cbiAgICB0aGlzLmluZm9fID0gbnVsbDtcbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPHN0cmluZz59ICovXG4gICAgdGhpcy5wYWdlVmlld0lkNjRfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHshRG9jdW1lbnRJbmZvRGVmfSAqL1xuICBnZXQoKSB7XG4gICAgaWYgKHRoaXMuaW5mb18pIHtcbiAgICAgIHJldHVybiB0aGlzLmluZm9fO1xuICAgIH1cbiAgICBjb25zdCBhbXBkb2MgPSB0aGlzLmFtcGRvY187XG4gICAgY29uc3QgdXJsID0gYW1wZG9jLmdldFVybCgpO1xuICAgIGNvbnN0IHNvdXJjZVVybCA9IGdldFNvdXJjZVVybCh1cmwpO1xuICAgIGNvbnN0IHJvb3ROb2RlID0gYW1wZG9jLmdldFJvb3ROb2RlKCk7XG4gICAgbGV0IGNhbm9uaWNhbFVybCA9IHJvb3ROb2RlICYmIHJvb3ROb2RlLkFNUCAmJiByb290Tm9kZS5BTVAuY2Fub25pY2FsVXJsO1xuICAgIGlmICghY2Fub25pY2FsVXJsKSB7XG4gICAgICBjb25zdCBjYW5vbmljYWxUYWcgPSByb290Tm9kZS5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1jYW5vbmljYWxdJyk7XG4gICAgICBjYW5vbmljYWxVcmwgPSBjYW5vbmljYWxUYWdcbiAgICAgICAgPyBwYXJzZVVybERlcHJlY2F0ZWQoY2Fub25pY2FsVGFnLmhyZWYpLmhyZWZcbiAgICAgICAgOiBzb3VyY2VVcmw7XG4gICAgfVxuICAgIGNvbnN0IHBhZ2VWaWV3SWQgPSBnZXRQYWdlVmlld0lkKGFtcGRvYy53aW4pO1xuICAgIGNvbnN0IGxpbmtSZWxzID0gZ2V0TGlua1JlbHMoYW1wZG9jLndpbi5kb2N1bWVudCk7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBnZXRWaWV3cG9ydChhbXBkb2Mud2luLmRvY3VtZW50KTtcbiAgICBjb25zdCByZXBsYWNlUGFyYW1zID0gZ2V0UmVwbGFjZVBhcmFtcyhhbXBkb2MpO1xuXG4gICAgcmV0dXJuICh0aGlzLmluZm9fID0ge1xuICAgICAgLyoqIEByZXR1cm4ge3N0cmluZ30gKi9cbiAgICAgIGdldCBzb3VyY2VVcmwoKSB7XG4gICAgICAgIHJldHVybiBnZXRTb3VyY2VVcmwoYW1wZG9jLmdldFVybCgpKTtcbiAgICAgIH0sXG4gICAgICBjYW5vbmljYWxVcmwsXG4gICAgICBwYWdlVmlld0lkLFxuICAgICAgZ2V0IHBhZ2VWaWV3SWQ2NCgpIHtcbiAgICAgICAgLy8gTXVzdCBiZSBjYWxjdWxhdGVkIGFzeW5jIHNpbmNlIGdldFJhbmRvbVN0cmluZzY0KCkgY2FuIGxvYWQgdGhlXG4gICAgICAgIC8vIGFtcC1jcnlwdG8tcG9seWZpbGwgb24gc29tZSBicm93c2VycywgYW5kIGV4dGVuc2lvbnMgc2VydmljZVxuICAgICAgICAvLyBtYXkgbm90IGJlIHJlZ2lzdGVyZWQgeWV0LlxuICAgICAgICBpZiAoIXRoaXMucGFnZVZpZXdJZDY0Xykge1xuICAgICAgICAgIHRoaXMucGFnZVZpZXdJZDY0XyA9IGdldFJhbmRvbVN0cmluZzY0KGFtcGRvYy53aW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhZ2VWaWV3SWQ2NF87XG4gICAgICB9LFxuICAgICAgbGlua1JlbHMsXG4gICAgICB2aWV3cG9ydCxcbiAgICAgIHJlcGxhY2VQYXJhbXMsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcmVsYXRpdmVseSBsb3cgZW50cm9weSByYW5kb20gc3RyaW5nLlxuICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIG9uY2UgcGVyIHdpbmRvdyBhbmQgdGhlbiBjYWNoZWQgZm9yIHN1YnNlcXVlbnRcbiAqIGFjY2VzcyB0byB0aGUgc2FtZSB2YWx1ZSB0byBiZSBwZXJzaXN0ZW50IHBlciBwYWdlLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0UGFnZVZpZXdJZCh3aW4pIHtcbiAgcmV0dXJuIFN0cmluZyhNYXRoLmZsb29yKHdpbi5NYXRoLnJhbmRvbSgpICogMTAwMDApKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwIG9iamVjdCBvZiBsaW5rIHRhZyByZWxhdGlvbnMgaW4gZG9jdW1lbnQgaGVhZC5cbiAqIEtleSBpcyB0aGUgbGluayByZWwsIHZhbHVlIGlzIGEgbGlzdCBvZiBjb3JyZXNwb25kaW5nIGhyZWZzLlxuICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICogQHJldHVybiB7IUpzb25PYmplY3Q8c3RyaW5nLCBzdHJpbmd8IUFycmF5PHN0cmluZz4+fVxuICovXG5mdW5jdGlvbiBnZXRMaW5rUmVscyhkb2MpIHtcbiAgY29uc3QgbGlua1JlbHMgPSBtYXAoKTtcbiAgaWYgKGRvYy5oZWFkKSB7XG4gICAgY29uc3QgbGlua3MgPSBkb2MuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKCdsaW5rW3JlbF0nKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsaW5rID0gbGlua3NbaV07XG4gICAgICBjb25zdCB7aHJlZn0gPSBsaW5rO1xuICAgICAgY29uc3QgcmVscyA9IGxpbmsuZ2V0QXR0cmlidXRlKCdyZWwnKTtcbiAgICAgIGlmICghcmVscyB8fCAhaHJlZikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcmVscy5zcGxpdCgvXFxzKy8pLmZvckVhY2goKHJlbCkgPT4ge1xuICAgICAgICBpZiAoZmlsdGVyZWRMaW5rUmVscy5pbmRleE9mKHJlbCkgIT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFsdWUgPSBsaW5rUmVsc1tyZWxdO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAvLyBDaGFuZ2UgdG8gYXJyYXkgaWYgbW9yZSB0aGFuIG9uZSBocmVmIGZvciB0aGUgc2FtZSByZWxcbiAgICAgICAgICBpZiAoIWlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGxpbmtSZWxzW3JlbF0gPSBbdmFsdWVdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZS5wdXNoKGhyZWYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpbmtSZWxzW3JlbF0gPSBocmVmO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxpbmtSZWxzO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHZpZXdwb3J0IG9mIHRoZSBkb2N1bWVudC4gTm90ZSB0aGF0IHRoaXMgaXMgdGhlIHZpZXdwb3J0IG9mIHRoZVxuICogaG9zdCBkb2N1bWVudCBmb3IgQW1wRG9jU2hhZG93IGluc3RhbmNlcy5cbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4gez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldFZpZXdwb3J0KGRvYykge1xuICBjb25zdCB2aWV3cG9ydEVsID0gZG9jLmhlYWQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwidmlld3BvcnRcIl0nKTtcbiAgcmV0dXJuIHZpZXdwb3J0RWwgPyB2aWV3cG9ydEVsLmdldEF0dHJpYnV0ZSgnY29udGVudCcpIDogbnVsbDtcbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byByZXRyaWV2ZSBleHRyYSBwYXJhbWV0ZXJzIGZyb20gdGhlIFwiYW1wX3JcIiBxdWVyeSBwYXJhbSxcbiAqIHJldHVybmluZyBudWxsIGlmIGludmFsaWQuXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcmV0dXJuIHs/SnNvbk9iamVjdDxzdHJpbmcsIHN0cmluZ3whQXJyYXk8c3RyaW5nPj59XG4gKi9cbmZ1bmN0aW9uIGdldFJlcGxhY2VQYXJhbXMoYW1wZG9jKSB7XG4gIC8vIFRoZSBcImFtcF9yXCIgcGFyYW1ldGVyIGlzIG9ubHkgc3VwcG9ydGVkIGZvciBhZHMuXG4gIGlmIChcbiAgICAhYW1wZG9jLmlzU2luZ2xlRG9jKCkgfHxcbiAgICBnZXRQcm94eVNlcnZpbmdUeXBlKGFtcGRvYy53aW4ubG9jYXRpb24uaHJlZikgIT0gJ2EnXG4gICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHVybCA9IHBhcnNlVXJsRGVwcmVjYXRlZChhbXBkb2Mud2luLmxvY2F0aW9uLmhyZWYpO1xuICBjb25zdCByZXBsYWNlUmF3ID0gcGFyc2VRdWVyeVN0cmluZyh1cmwuc2VhcmNoKVsnYW1wX3InXTtcbiAgaWYgKHJlcGxhY2VSYXcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIERpZmZlcmVudGlhdGUgdGhlIGNhc2UgYmV0d2VlbiBlbXB0eSByZXBsYWNlIHBhcmFtcyBhbmQgaW52YWxpZCByZXN1bHRcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gcGFyc2VRdWVyeVN0cmluZyhyZXBsYWNlUmF3KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/document-info-impl.js