function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Detects <amp-img> elements to set the `lightbox` attribute
 * automatically.
 *
 * This extension is not meant to be included explicitly, e.g. as a script tag.
 * Instead, the runtime loads it when encountering an <amp-img>.
 */
import { AmpEvents } from "../../../src/core/constants/amp-events";
import { AutoLightboxEvents } from "../../../src/auto-lightbox";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Services } from "../../../src/service";
import { closestAncestorElementBySelector } from "../../../src/core/dom/query";
import { dev } from "../../../src/log";
import { dispatchCustomEvent } from "../../../src/core/dom";
import { loadPromise } from "../../../src/event-helper";
import { measureIntersectionNoRoot } from "../../../src/core/dom/layout/intersection-no-root";
import { toArray } from "../../../src/core/types/array";
import { tryParseJson } from "../../../src/core/types/object/json";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";
var TAG = 'amp-auto-lightbox';
export var REQUIRED_EXTENSION = 'amp-lightbox-gallery';
export var LIGHTBOXABLE_ATTR = 'lightbox';

/** Attribute to mark scanned lightbox candidates as not to revisit. */
export var VISITED_ATTR = 'i-amphtml-auto-lightbox-visited';

/**
 * Types of document by LD+JSON schema `@type` field where auto-lightbox should
 * be enabled.
 * @private @const {!Object<string|undefined, boolean>}
 */
export var ENABLED_LD_JSON_TYPES = {
  'Article': true,
  'NewsArticle': true,
  'BlogPosting': true,
  'LiveBlogPosting': true,
  'DiscussionForumPosting': true
};

/**
 * Only of document type by Open Graph `<meta property="og:type">` where
 * auto-lightbox should be enabled. Top-level og:type set is tiny, and `article`
 * covers all required types.
 */
export var ENABLED_OG_TYPE_ARTICLE = 'article';

/** Factor of naturalArea vs renderArea to lightbox. */
export var RENDER_AREA_RATIO = 1.2;

/** Factor of renderArea vs viewportArea to lightbox. */
export var VIEWPORT_AREA_RATIO = 0.25;

/**
 * Selector for subnodes by attribute for which the auto-lightbox treatment
 * does not apply. These can be set directly on the candidate or on an ancestor.
 */
var DISABLED_BY_ATTR = [// Runtime-specific.
'[placeholder]', // Explicitly opted out.
'[data-amp-auto-lightbox-disable]', // Considered "actionable", i.e. that are bound to a default
// onclick action(e.g. `button`) or where it cannot be determined whether
// they're actionable or not (e.g. `amp-script`).
'amp-selector [option]', // amp-subscriptions actions
'[subscriptions-action]'].join(',');

/**
 * Selector for subnodes for which the auto-lightbox treatment does not apply.
 */
var DISABLED_ANCESTORS = [// Ancestors considered "actionable", i.e. that are bound to a default
// onclick action(e.g. `button`) or where it cannot be determined whether
// they're actionable or not (e.g. `amp-script`).
'a[href]', 'amp-script', 'amp-story', 'button', // No nested lightboxes.
'amp-lightbox', // Already actionable in vast majority of cases, explicit API.
'amp-carousel'].join(',');
var SCRIPT_LD_JSON = 'script[type="application/ld+json"]';
var META_OG_TYPE = 'meta[property="og:type"]';

var NOOP = function NOOP() {};

/** @visibleForTesting */
export var Criteria = /*#__PURE__*/function () {
  function Criteria() {
    _classCallCheck(this, Criteria);
  }

  _createClass(Criteria, null, [{
    key: "meetsAll",
    value:
    /**
     * @param {!Element} element
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @param {number} renderWidth
     * @param {number} renderHeight
     * @return {boolean}
     */
    function meetsAll(element, ampdoc, renderWidth, renderHeight) {
      return Criteria.meetsSizingCriteria(element, ampdoc, renderWidth, renderHeight) && Criteria.meetsTreeShapeCriteria(element, ampdoc);
    }
    /**
     * @param {!Element} element
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {boolean}
     */

  }, {
    key: "meetsTreeShapeCriteria",
    value: function meetsTreeShapeCriteria(element, ampdoc) {
      if (element.tagName === 'IMG' && closestAncestorElementBySelector(element, 'amp-img')) {
        // Images that are a child of an AMP-IMG do not need additional treatment.
        return false;
      }

      var disabledSelector = DISABLED_ANCESTORS + "," + DISABLED_BY_ATTR;
      var disabledAncestor = closestAncestorElementBySelector(element, disabledSelector);

      if (disabledAncestor) {
        return false;
      }

      var actions = Services.actionServiceForDoc(ampdoc || element);
      return !actions.hasResolvableAction(element, 'tap');
    }
    /**
     * @param {!Element} element
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @param {number} renderWidth
     * @param {number} renderHeight
     * @return {boolean}
     */

  }, {
    key: "meetsSizingCriteria",
    value: function meetsSizingCriteria(element, ampdoc, renderWidth, renderHeight) {
      var _getMaxNaturalDimensi = getMaxNaturalDimensions(dev().assertElement(element.querySelector('img') || element)),
          naturalHeight = _getMaxNaturalDimensi.naturalHeight,
          naturalWidth = _getMaxNaturalDimensi.naturalWidth;

      var viewport = Services.viewportForDoc(ampdoc);

      var _viewport$getSize = viewport.getSize(),
          vh = _viewport$getSize.height,
          vw = _viewport$getSize.width;

      return _meetsSizingCriteria(renderWidth, renderHeight, naturalWidth, naturalHeight, vw, vh);
    }
  }]);

  return Criteria;
}();

/**
 * Regex for the width-selection portion of a srcset, so for the
 * general grammar: (URL [NUM[w|x]],)*, this should express "NUMw".
 * E.g. in "image1.png 100w, image2.png 50w", this matches "100w" and "50w"
 */
var srcsetWidthRe = /\s+([0-9]+)w(,|[\S\s]*$)/g;

/**
 * Parses srcset partially to get the maximum defined intrinsic width.
 * @param {!Element} img
 * @return {number} -1 if no srcset, or if srcset is defined by dpr instead of
 *   width. (This value is useful for comparisons, see getMaxNaturalDimensions.)
 */
function getMaxWidthFromSrcset(img) {
  var max = -1;
  var srcsetAttr = img.getAttribute('srcset');

  if (srcsetAttr) {
    var match;

    while (match = srcsetWidthRe.exec(srcsetAttr)) {
      var width = parseInt(match[1], 10);

      if (width > max) {
        max = width;
      }
    }
  }

  return max;
}

/**
 * Gets the maximum natural dimensions for an image with srcset.
 * This is necessary when the browser selects a src that is not shrunk for its
 * render size, but the srcset provides a different, higher resolution image
 * that can be used in the lightbox.
 * @param {!Element} img
 * @return {{naturalWidth: number, naturalHeight: number}}
 */
function getMaxNaturalDimensions(img) {
  var naturalHeight = img.naturalHeight,
      naturalWidth = img.naturalWidth;
  var ratio = naturalWidth / naturalHeight;
  var maxWidthFromSrcset = getMaxWidthFromSrcset(img);

  if (maxWidthFromSrcset > naturalWidth) {
    return {
      naturalWidth: maxWidthFromSrcset,
      naturalHeight: maxWidthFromSrcset / ratio
    };
  }

  return {
    naturalWidth: naturalWidth,
    naturalHeight: naturalHeight
  };
}

/**
 * @param {number} renderWidth
 * @param {number} renderHeight
 * @param {number} naturalWidth
 * @param {number} naturalHeight
 * @param {number} vw
 * @param {number} vh
 * @return {boolean}
 * @visibleForTesting
 */
function _meetsSizingCriteria(renderWidth, renderHeight, naturalWidth, naturalHeight, vw, vh) {
  var viewportArea = vw * vh;
  var naturalArea = naturalWidth * naturalHeight;
  var renderArea = renderWidth * renderHeight;
  var isShrunk = naturalArea / renderArea >= RENDER_AREA_RATIO;
  var isCoveringSignificantArea = renderArea / viewportArea >= VIEWPORT_AREA_RATIO;
  var isLargerThanViewport = naturalWidth > vw || naturalHeight > vh;
  return isShrunk || isLargerThanViewport || isCoveringSignificantArea;
}

/**
 * Marks a lightbox candidate as visited as not to rescan on DOM update.
 * @param {!Element} candidate
 * @return {!Promise}
 */
export { _meetsSizingCriteria as meetsSizingCriteria };

function markAsVisited(candidate) {
  return Services.mutatorForDoc(candidate).mutateElement(candidate, function () {
    candidate.setAttribute(VISITED_ATTR, '');
  });
}

/**
 * @param {!Array<string>} tagNames
 * @return {string}
 */
function candidateSelector(tagNames) {
  return tagNames.map(function (tagName) {
    return tagName + ":not([" + LIGHTBOXABLE_ATTR + "]):not([" + VISITED_ATTR + "])";
  }).join(',');
}

/**
 * @param {!Element} element
 * @return {!Promise}
 */
function whenLoaded(element) {
  if (element.tagName === 'IMG') {
    return loadPromise(element);
  }

  return whenUpgradedToCustomElement(element).then(function (element) {
    return element.signals().whenSignal(CommonSignals.LOAD_END);
  });
}

/** @visibleForTesting */
export var Scanner = /*#__PURE__*/function () {
  function Scanner() {
    _classCallCheck(this, Scanner);
  }

  _createClass(Scanner, null, [{
    key: "getCandidates",
    value:
    /**
     * Gets all unvisited lightbox candidates.
     * @param {!Document|!Element} root
     * @return {!Array<!Element>}
     */
    function getCandidates(root) {
      var selector = candidateSelector(['amp-img', 'img']);
      var candidates = toArray(root.querySelectorAll(selector));
      // TODO(alanorozco): DOM mutations should be wrapped in mutate contexts.
      // Alternatively, use in-memory "visited" marker instead of attribute.
      candidates.forEach(markAsVisited);
      return candidates;
    }
  }]);

  return Scanner;
}();

/**
 * Parses document metadata annotations as defined by either LD+JSON schema or
 * Open Graph <meta> tags.
 * @visibleForTesting
 */
export var DocMetaAnnotations = /*#__PURE__*/function () {
  function DocMetaAnnotations() {
    _classCallCheck(this, DocMetaAnnotations);
  }

  _createClass(DocMetaAnnotations, null, [{
    key: "getOgType",
    value:
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {string|undefined}
     */
    function getOgType(ampdoc) {
      var tag = ampdoc.getRootNode().querySelector(META_OG_TYPE);

      if (tag) {
        return tag.getAttribute('content');
      }
    }
    /**
     * Determines wheter the document type as defined by Open Graph meta tag
     * e.g. `<meta property="og:type">` is valid.
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {boolean}
     */

  }, {
    key: "hasValidOgType",
    value: function hasValidOgType(ampdoc) {
      return DocMetaAnnotations.getOgType(ampdoc) == ENABLED_OG_TYPE_ARTICLE;
    }
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {!Array<string>}
     */

  }, {
    key: "getAllLdJsonTypes",
    value: function getAllLdJsonTypes(ampdoc) {
      return toArray(ampdoc.getRootNode().querySelectorAll(SCRIPT_LD_JSON)).map(function (el) {
        var textContent = el.textContent;
        return (tryParseJson(textContent) || {})['@type'];
      }).filter(Boolean);
    }
    /**
     * Determines wheter one of the document types (field `@type`) defined in
     * LD+JSON schema is in ENABLED_LD_JSON_TYPES.
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {boolean}
     */

  }, {
    key: "hasValidLdJsonType",
    value: function hasValidLdJsonType(ampdoc) {
      return DocMetaAnnotations.getAllLdJsonTypes(ampdoc).some(function (type) {
        return ENABLED_LD_JSON_TYPES[type];
      });
    }
  }]);

  return DocMetaAnnotations;
}();

/**
 * Determines whether a document uses `amp-lightbox-gallery` explicitly by
 * including the extension and explicitly lightboxing at least one element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function usesLightboxExplicitly(ampdoc) {
  // TODO(alanorozco): Backport into Extensions service.
  var requiredExtensionSelector = "script[custom-element=\"" + REQUIRED_EXTENSION + "\"]";
  var lightboxedElementsSelector = "[" + LIGHTBOXABLE_ATTR + "]:not([" + VISITED_ATTR + "])";

  var exists = function exists(selector) {
    return !!ampdoc.getRootNode().querySelector(selector);
  };

  return exists(requiredExtensionSelector) && exists(lightboxedElementsSelector);
}

/**
 * Determines whether auto-lightbox is enabled for a document.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 * @visibleForTesting
 */
export function isEnabledForDoc(ampdoc) {
  if (usesLightboxExplicitly(ampdoc)) {
    return false;
  }

  return DocMetaAnnotations.hasValidOgType(ampdoc) || DocMetaAnnotations.hasValidLdJsonType(ampdoc);
}

/** @private {number} */
var uid = 0;

/**
 * Generates a unique id for lightbox grouping.
 * @return {string}
 */
function generateLightboxUid() {
  return "i-amphtml-auto-lightbox-" + uid++;
}

/**
 * Lightboxes an element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @return {!Promise<!Element>}
 * @visibleForTesting
 */
export function apply(ampdoc, element) {
  var mutator = Services.mutatorForDoc(ampdoc);
  var mutatePromise = mutator.mutateElement(element, function () {
    element.setAttribute(LIGHTBOXABLE_ATTR, generateLightboxUid());
  });
  return mutatePromise.then(function () {
    Services.extensionsFor(ampdoc.win).installExtensionForDoc(ampdoc, REQUIRED_EXTENSION);
    dispatchCustomEvent(element, AutoLightboxEvents.NEWLY_SET);
    return element;
  });
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<!Element>} candidates
 * @return {!Array<!Promise<!Element|undefined>>}
 */
export function runCandidates(ampdoc, candidates) {
  return candidates.map(function (candidate) {
    return whenLoaded(candidate).then(function () {
      return measureIntersectionNoRoot(candidate).then(function (_ref) {
        var boundingClientRect = _ref.boundingClientRect;

        if (candidate.tagName !== 'IMG' && !candidate.signals().get(CommonSignals.LOAD_END)) {
          // <amp-img> will change the img's src inline data on unlayout and
          // remove it from DOM.
          return;
        }

        var height = boundingClientRect.height,
            width = boundingClientRect.width;

        if (!Criteria.meetsAll(candidate, ampdoc, width, height)) {
          return;
        }

        dev().info(TAG, 'apply', candidate);
        return apply(ampdoc, candidate);
      });
    }, NOOP);
  });
}

/**
 * Scans a document on initialization to lightbox elements that meet criteria.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element=} opt_root
 * @return {!Array<!Promise>|undefined}
 */
export function scan(ampdoc, opt_root) {
  if (!isEnabledForDoc(ampdoc)) {
    dev().info(TAG, 'disabled');
    return;
  }

  var root = opt_root || ampdoc.win.document;
  return runCandidates(ampdoc, Scanner.getCandidates(root));
}
AMP.extension(TAG, '0.1', function (AMP) {
  var ampdoc = AMP.ampdoc;
  ampdoc.whenReady().then(function () {
    ampdoc.getRootNode().addEventListener(AmpEvents.DOM_UPDATE, function (e) {
      var target = e.target;
      scan(ampdoc, dev().assertElement(target));
    });
    scan(ampdoc);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hdXRvLWxpZ2h0Ym94LmpzIl0sIm5hbWVzIjpbIkFtcEV2ZW50cyIsIkF1dG9MaWdodGJveEV2ZW50cyIsIkNvbW1vblNpZ25hbHMiLCJTZXJ2aWNlcyIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwiZGV2IiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsImxvYWRQcm9taXNlIiwibWVhc3VyZUludGVyc2VjdGlvbk5vUm9vdCIsInRvQXJyYXkiLCJ0cnlQYXJzZUpzb24iLCJ3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQiLCJUQUciLCJSRVFVSVJFRF9FWFRFTlNJT04iLCJMSUdIVEJPWEFCTEVfQVRUUiIsIlZJU0lURURfQVRUUiIsIkVOQUJMRURfTERfSlNPTl9UWVBFUyIsIkVOQUJMRURfT0dfVFlQRV9BUlRJQ0xFIiwiUkVOREVSX0FSRUFfUkFUSU8iLCJWSUVXUE9SVF9BUkVBX1JBVElPIiwiRElTQUJMRURfQllfQVRUUiIsImpvaW4iLCJESVNBQkxFRF9BTkNFU1RPUlMiLCJTQ1JJUFRfTERfSlNPTiIsIk1FVEFfT0dfVFlQRSIsIk5PT1AiLCJDcml0ZXJpYSIsImVsZW1lbnQiLCJhbXBkb2MiLCJyZW5kZXJXaWR0aCIsInJlbmRlckhlaWdodCIsIm1lZXRzU2l6aW5nQ3JpdGVyaWEiLCJtZWV0c1RyZWVTaGFwZUNyaXRlcmlhIiwidGFnTmFtZSIsImRpc2FibGVkU2VsZWN0b3IiLCJkaXNhYmxlZEFuY2VzdG9yIiwiYWN0aW9ucyIsImFjdGlvblNlcnZpY2VGb3JEb2MiLCJoYXNSZXNvbHZhYmxlQWN0aW9uIiwiZ2V0TWF4TmF0dXJhbERpbWVuc2lvbnMiLCJhc3NlcnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsIm5hdHVyYWxIZWlnaHQiLCJuYXR1cmFsV2lkdGgiLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwiZ2V0U2l6ZSIsInZoIiwiaGVpZ2h0IiwidnciLCJ3aWR0aCIsInNyY3NldFdpZHRoUmUiLCJnZXRNYXhXaWR0aEZyb21TcmNzZXQiLCJpbWciLCJtYXgiLCJzcmNzZXRBdHRyIiwiZ2V0QXR0cmlidXRlIiwibWF0Y2giLCJleGVjIiwicGFyc2VJbnQiLCJyYXRpbyIsIm1heFdpZHRoRnJvbVNyY3NldCIsInZpZXdwb3J0QXJlYSIsIm5hdHVyYWxBcmVhIiwicmVuZGVyQXJlYSIsImlzU2hydW5rIiwiaXNDb3ZlcmluZ1NpZ25pZmljYW50QXJlYSIsImlzTGFyZ2VyVGhhblZpZXdwb3J0IiwibWFya0FzVmlzaXRlZCIsImNhbmRpZGF0ZSIsIm11dGF0b3JGb3JEb2MiLCJtdXRhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiY2FuZGlkYXRlU2VsZWN0b3IiLCJ0YWdOYW1lcyIsIm1hcCIsIndoZW5Mb2FkZWQiLCJ0aGVuIiwic2lnbmFscyIsIndoZW5TaWduYWwiLCJMT0FEX0VORCIsIlNjYW5uZXIiLCJyb290Iiwic2VsZWN0b3IiLCJjYW5kaWRhdGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJEb2NNZXRhQW5ub3RhdGlvbnMiLCJ0YWciLCJnZXRSb290Tm9kZSIsImdldE9nVHlwZSIsImVsIiwidGV4dENvbnRlbnQiLCJmaWx0ZXIiLCJCb29sZWFuIiwiZ2V0QWxsTGRKc29uVHlwZXMiLCJzb21lIiwidHlwZSIsInVzZXNMaWdodGJveEV4cGxpY2l0bHkiLCJyZXF1aXJlZEV4dGVuc2lvblNlbGVjdG9yIiwibGlnaHRib3hlZEVsZW1lbnRzU2VsZWN0b3IiLCJleGlzdHMiLCJpc0VuYWJsZWRGb3JEb2MiLCJoYXNWYWxpZE9nVHlwZSIsImhhc1ZhbGlkTGRKc29uVHlwZSIsInVpZCIsImdlbmVyYXRlTGlnaHRib3hVaWQiLCJhcHBseSIsIm11dGF0b3IiLCJtdXRhdGVQcm9taXNlIiwiZXh0ZW5zaW9uc0ZvciIsIndpbiIsImluc3RhbGxFeHRlbnNpb25Gb3JEb2MiLCJORVdMWV9TRVQiLCJydW5DYW5kaWRhdGVzIiwiYm91bmRpbmdDbGllbnRSZWN0IiwiZ2V0IiwibWVldHNBbGwiLCJpbmZvIiwic2NhbiIsIm9wdF9yb290IiwiZG9jdW1lbnQiLCJnZXRDYW5kaWRhdGVzIiwiQU1QIiwiZXh0ZW5zaW9uIiwid2hlblJlYWR5IiwiYWRkRXZlbnRMaXN0ZW5lciIsIkRPTV9VUERBVEUiLCJlIiwidGFyZ2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxTQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLGdDQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLG1CQUFSO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLFlBQVI7QUFDQSxTQUFRQywyQkFBUjtBQUVBLElBQU1DLEdBQUcsR0FBRyxtQkFBWjtBQUVBLE9BQU8sSUFBTUMsa0JBQWtCLEdBQUcsc0JBQTNCO0FBQ1AsT0FBTyxJQUFNQyxpQkFBaUIsR0FBRyxVQUExQjs7QUFFUDtBQUNBLE9BQU8sSUFBTUMsWUFBWSxHQUFHLGlDQUFyQjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxxQkFBcUIsR0FBRztBQUNuQyxhQUFXLElBRHdCO0FBRW5DLGlCQUFlLElBRm9CO0FBR25DLGlCQUFlLElBSG9CO0FBSW5DLHFCQUFtQixJQUpnQjtBQUtuQyw0QkFBMEI7QUFMUyxDQUE5Qjs7QUFRUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyx1QkFBdUIsR0FBRyxTQUFoQzs7QUFFUDtBQUNBLE9BQU8sSUFBTUMsaUJBQWlCLEdBQUcsR0FBMUI7O0FBRVA7QUFDQSxPQUFPLElBQU1DLG1CQUFtQixHQUFHLElBQTVCOztBQUVQO0FBQ0E7QUFDQTtBQUNB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bCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGV0ZWN0cyA8YW1wLWltZz4gZWxlbWVudHMgdG8gc2V0IHRoZSBgbGlnaHRib3hgIGF0dHJpYnV0ZVxuICogYXV0b21hdGljYWxseS5cbiAqXG4gKiBUaGlzIGV4dGVuc2lvbiBpcyBub3QgbWVhbnQgdG8gYmUgaW5jbHVkZWQgZXhwbGljaXRseSwgZS5nLiBhcyBhIHNjcmlwdCB0YWcuXG4gKiBJbnN0ZWFkLCB0aGUgcnVudGltZSBsb2FkcyBpdCB3aGVuIGVuY291bnRlcmluZyBhbiA8YW1wLWltZz4uXG4gKi9cblxuaW1wb3J0IHtBbXBFdmVudHN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9hbXAtZXZlbnRzJztcbmltcG9ydCB7QXV0b0xpZ2h0Ym94RXZlbnRzfSBmcm9tICcuLi8uLi8uLi9zcmMvYXV0by1saWdodGJveCc7XG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb21tb24tc2lnbmFscyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2Nsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yfSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaXNwYXRjaEN1c3RvbUV2ZW50fSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtsb2FkUHJvbWlzZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge21lYXN1cmVJbnRlcnNlY3Rpb25Ob1Jvb3R9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvaW50ZXJzZWN0aW9uLW5vLXJvb3QnO1xuaW1wb3J0IHt0b0FycmF5fSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5pbXBvcnQge3RyeVBhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHt3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9hbXAtZWxlbWVudC1oZWxwZXJzJztcblxuY29uc3QgVEFHID0gJ2FtcC1hdXRvLWxpZ2h0Ym94JztcblxuZXhwb3J0IGNvbnN0IFJFUVVJUkVEX0VYVEVOU0lPTiA9ICdhbXAtbGlnaHRib3gtZ2FsbGVyeSc7XG5leHBvcnQgY29uc3QgTElHSFRCT1hBQkxFX0FUVFIgPSAnbGlnaHRib3gnO1xuXG4vKiogQXR0cmlidXRlIHRvIG1hcmsgc2Nhbm5lZCBsaWdodGJveCBjYW5kaWRhdGVzIGFzIG5vdCB0byByZXZpc2l0LiAqL1xuZXhwb3J0IGNvbnN0IFZJU0lURURfQVRUUiA9ICdpLWFtcGh0bWwtYXV0by1saWdodGJveC12aXNpdGVkJztcblxuLyoqXG4gKiBUeXBlcyBvZiBkb2N1bWVudCBieSBMRCtKU09OIHNjaGVtYSBgQHR5cGVgIGZpZWxkIHdoZXJlIGF1dG8tbGlnaHRib3ggc2hvdWxkXG4gKiBiZSBlbmFibGVkLlxuICogQHByaXZhdGUgQGNvbnN0IHshT2JqZWN0PHN0cmluZ3x1bmRlZmluZWQsIGJvb2xlYW4+fVxuICovXG5leHBvcnQgY29uc3QgRU5BQkxFRF9MRF9KU09OX1RZUEVTID0ge1xuICAnQXJ0aWNsZSc6IHRydWUsXG4gICdOZXdzQXJ0aWNsZSc6IHRydWUsXG4gICdCbG9nUG9zdGluZyc6IHRydWUsXG4gICdMaXZlQmxvZ1Bvc3RpbmcnOiB0cnVlLFxuICAnRGlzY3Vzc2lvbkZvcnVtUG9zdGluZyc6IHRydWUsXG59O1xuXG4vKipcbiAqIE9ubHkgb2YgZG9jdW1lbnQgdHlwZSBieSBPcGVuIEdyYXBoIGA8bWV0YSBwcm9wZXJ0eT1cIm9nOnR5cGVcIj5gIHdoZXJlXG4gKiBhdXRvLWxpZ2h0Ym94IHNob3VsZCBiZSBlbmFibGVkLiBUb3AtbGV2ZWwgb2c6dHlwZSBzZXQgaXMgdGlueSwgYW5kIGBhcnRpY2xlYFxuICogY292ZXJzIGFsbCByZXF1aXJlZCB0eXBlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEVOQUJMRURfT0dfVFlQRV9BUlRJQ0xFID0gJ2FydGljbGUnO1xuXG4vKiogRmFjdG9yIG9mIG5hdHVyYWxBcmVhIHZzIHJlbmRlckFyZWEgdG8gbGlnaHRib3guICovXG5leHBvcnQgY29uc3QgUkVOREVSX0FSRUFfUkFUSU8gPSAxLjI7XG5cbi8qKiBGYWN0b3Igb2YgcmVuZGVyQXJlYSB2cyB2aWV3cG9ydEFyZWEgdG8gbGlnaHRib3guICovXG5leHBvcnQgY29uc3QgVklFV1BPUlRfQVJFQV9SQVRJTyA9IDAuMjU7XG5cbi8qKlxuICogU2VsZWN0b3IgZm9yIHN1Ym5vZGVzIGJ5IGF0dHJpYnV0ZSBmb3Igd2hpY2ggdGhlIGF1dG8tbGlnaHRib3ggdHJlYXRtZW50XG4gKiBkb2VzIG5vdCBhcHBseS4gVGhlc2UgY2FuIGJlIHNldCBkaXJlY3RseSBvbiB0aGUgY2FuZGlkYXRlIG9yIG9uIGFuIGFuY2VzdG9yLlxuICovXG5jb25zdCBESVNBQkxFRF9CWV9BVFRSID0gW1xuICAvLyBSdW50aW1lLXNwZWNpZmljLlxuICAnW3BsYWNlaG9sZGVyXScsXG5cbiAgLy8gRXhwbGljaXRseSBvcHRlZCBvdXQuXG4gICdbZGF0YS1hbXAtYXV0by1saWdodGJveC1kaXNhYmxlXScsXG5cbiAgLy8gQ29uc2lkZXJlZCBcImFjdGlvbmFibGVcIiwgaS5lLiB0aGF0IGFyZSBib3VuZCB0byBhIGRlZmF1bHRcbiAgLy8gb25jbGljayBhY3Rpb24oZS5nLiBgYnV0dG9uYCkgb3Igd2hlcmUgaXQgY2Fubm90IGJlIGRldGVybWluZWQgd2hldGhlclxuICAvLyB0aGV5J3JlIGFjdGlvbmFibGUgb3Igbm90IChlLmcuIGBhbXAtc2NyaXB0YCkuXG4gICdhbXAtc2VsZWN0b3IgW29wdGlvbl0nLFxuXG4gIC8vIGFtcC1zdWJzY3JpcHRpb25zIGFjdGlvbnNcbiAgJ1tzdWJzY3JpcHRpb25zLWFjdGlvbl0nLFxuXS5qb2luKCcsJyk7XG5cbi8qKlxuICogU2VsZWN0b3IgZm9yIHN1Ym5vZGVzIGZvciB3aGljaCB0aGUgYXV0by1saWdodGJveCB0cmVhdG1lbnQgZG9lcyBub3QgYXBwbHkuXG4gKi9cbmNvbnN0IERJU0FCTEVEX0FOQ0VTVE9SUyA9IFtcbiAgLy8gQW5jZXN0b3JzIGNvbnNpZGVyZWQgXCJhY3Rpb25hYmxlXCIsIGkuZS4gdGhhdCBhcmUgYm91bmQgdG8gYSBkZWZhdWx0XG4gIC8vIG9uY2xpY2sgYWN0aW9uKGUuZy4gYGJ1dHRvbmApIG9yIHdoZXJlIGl0IGNhbm5vdCBiZSBkZXRlcm1pbmVkIHdoZXRoZXJcbiAgLy8gdGhleSdyZSBhY3Rpb25hYmxlIG9yIG5vdCAoZS5nLiBgYW1wLXNjcmlwdGApLlxuICAnYVtocmVmXScsXG4gICdhbXAtc2NyaXB0JyxcbiAgJ2FtcC1zdG9yeScsXG4gICdidXR0b24nLFxuXG4gIC8vIE5vIG5lc3RlZCBsaWdodGJveGVzLlxuICAnYW1wLWxpZ2h0Ym94JyxcblxuICAvLyBBbHJlYWR5IGFjdGlvbmFibGUgaW4gdmFzdCBtYWpvcml0eSBvZiBjYXNlcywgZXhwbGljaXQgQVBJLlxuICAnYW1wLWNhcm91c2VsJyxcbl0uam9pbignLCcpO1xuXG5jb25zdCBTQ1JJUFRfTERfSlNPTiA9ICdzY3JpcHRbdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIl0nO1xuY29uc3QgTUVUQV9PR19UWVBFID0gJ21ldGFbcHJvcGVydHk9XCJvZzp0eXBlXCJdJztcblxuY29uc3QgTk9PUCA9ICgpID0+IHt9O1xuXG4vKiogQHZpc2libGVGb3JUZXN0aW5nICovXG5leHBvcnQgY2xhc3MgQ3JpdGVyaWEge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyV2lkdGhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlckhlaWdodFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIG1lZXRzQWxsKGVsZW1lbnQsIGFtcGRvYywgcmVuZGVyV2lkdGgsIHJlbmRlckhlaWdodCkge1xuICAgIHJldHVybiAoXG4gICAgICBDcml0ZXJpYS5tZWV0c1NpemluZ0NyaXRlcmlhKFxuICAgICAgICBlbGVtZW50LFxuICAgICAgICBhbXBkb2MsXG4gICAgICAgIHJlbmRlcldpZHRoLFxuICAgICAgICByZW5kZXJIZWlnaHRcbiAgICAgICkgJiYgQ3JpdGVyaWEubWVldHNUcmVlU2hhcGVDcml0ZXJpYShlbGVtZW50LCBhbXBkb2MpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzdGF0aWMgbWVldHNUcmVlU2hhcGVDcml0ZXJpYShlbGVtZW50LCBhbXBkb2MpIHtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LnRhZ05hbWUgPT09ICdJTUcnICYmXG4gICAgICBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcihlbGVtZW50LCAnYW1wLWltZycpXG4gICAgKSB7XG4gICAgICAvLyBJbWFnZXMgdGhhdCBhcmUgYSBjaGlsZCBvZiBhbiBBTVAtSU1HIGRvIG5vdCBuZWVkIGFkZGl0aW9uYWwgdHJlYXRtZW50LlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc2FibGVkU2VsZWN0b3IgPSBgJHtESVNBQkxFRF9BTkNFU1RPUlN9LCR7RElTQUJMRURfQllfQVRUUn1gO1xuICAgIGNvbnN0IGRpc2FibGVkQW5jZXN0b3IgPSBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcihcbiAgICAgIGVsZW1lbnQsXG4gICAgICBkaXNhYmxlZFNlbGVjdG9yXG4gICAgKTtcbiAgICBpZiAoZGlzYWJsZWRBbmNlc3Rvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb25zID0gU2VydmljZXMuYWN0aW9uU2VydmljZUZvckRvYyhhbXBkb2MgfHwgZWxlbWVudCk7XG4gICAgcmV0dXJuICFhY3Rpb25zLmhhc1Jlc29sdmFibGVBY3Rpb24oZWxlbWVudCwgJ3RhcCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcldpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJIZWlnaHRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHN0YXRpYyBtZWV0c1NpemluZ0NyaXRlcmlhKGVsZW1lbnQsIGFtcGRvYywgcmVuZGVyV2lkdGgsIHJlbmRlckhlaWdodCkge1xuICAgIGNvbnN0IHtuYXR1cmFsSGVpZ2h0LCBuYXR1cmFsV2lkdGh9ID0gZ2V0TWF4TmF0dXJhbERpbWVuc2lvbnMoXG4gICAgICBkZXYoKS5hc3NlcnRFbGVtZW50KGVsZW1lbnQucXVlcnlTZWxlY3RvcignaW1nJykgfHwgZWxlbWVudClcbiAgICApO1xuXG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyhhbXBkb2MpO1xuICAgIGNvbnN0IHtoZWlnaHQ6IHZoLCB3aWR0aDogdnd9ID0gdmlld3BvcnQuZ2V0U2l6ZSgpO1xuXG4gICAgcmV0dXJuIG1lZXRzU2l6aW5nQ3JpdGVyaWEoXG4gICAgICByZW5kZXJXaWR0aCxcbiAgICAgIHJlbmRlckhlaWdodCxcbiAgICAgIG5hdHVyYWxXaWR0aCxcbiAgICAgIG5hdHVyYWxIZWlnaHQsXG4gICAgICB2dyxcbiAgICAgIHZoXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlZ2V4IGZvciB0aGUgd2lkdGgtc2VsZWN0aW9uIHBvcnRpb24gb2YgYSBzcmNzZXQsIHNvIGZvciB0aGVcbiAqIGdlbmVyYWwgZ3JhbW1hcjogKFVSTCBbTlVNW3d8eF1dLCkqLCB0aGlzIHNob3VsZCBleHByZXNzIFwiTlVNd1wiLlxuICogRS5nLiBpbiBcImltYWdlMS5wbmcgMTAwdywgaW1hZ2UyLnBuZyA1MHdcIiwgdGhpcyBtYXRjaGVzIFwiMTAwd1wiIGFuZCBcIjUwd1wiXG4gKi9cbmNvbnN0IHNyY3NldFdpZHRoUmUgPSAvXFxzKyhbMC05XSspdygsfFtcXFNcXHNdKiQpL2c7XG5cbi8qKlxuICogUGFyc2VzIHNyY3NldCBwYXJ0aWFsbHkgdG8gZ2V0IHRoZSBtYXhpbXVtIGRlZmluZWQgaW50cmluc2ljIHdpZHRoLlxuICogQHBhcmFtIHshRWxlbWVudH0gaW1nXG4gKiBAcmV0dXJuIHtudW1iZXJ9IC0xIGlmIG5vIHNyY3NldCwgb3IgaWYgc3Jjc2V0IGlzIGRlZmluZWQgYnkgZHByIGluc3RlYWQgb2ZcbiAqICAgd2lkdGguIChUaGlzIHZhbHVlIGlzIHVzZWZ1bCBmb3IgY29tcGFyaXNvbnMsIHNlZSBnZXRNYXhOYXR1cmFsRGltZW5zaW9ucy4pXG4gKi9cbmZ1bmN0aW9uIGdldE1heFdpZHRoRnJvbVNyY3NldChpbWcpIHtcbiAgbGV0IG1heCA9IC0xO1xuXG4gIGNvbnN0IHNyY3NldEF0dHIgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmNzZXQnKTtcbiAgaWYgKHNyY3NldEF0dHIpIHtcbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKChtYXRjaCA9IHNyY3NldFdpZHRoUmUuZXhlYyhzcmNzZXRBdHRyKSkpIHtcbiAgICAgIGNvbnN0IHdpZHRoID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcbiAgICAgIGlmICh3aWR0aCA+IG1heCkge1xuICAgICAgICBtYXggPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF4O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIG1heGltdW0gbmF0dXJhbCBkaW1lbnNpb25zIGZvciBhbiBpbWFnZSB3aXRoIHNyY3NldC5cbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IHdoZW4gdGhlIGJyb3dzZXIgc2VsZWN0cyBhIHNyYyB0aGF0IGlzIG5vdCBzaHJ1bmsgZm9yIGl0c1xuICogcmVuZGVyIHNpemUsIGJ1dCB0aGUgc3Jjc2V0IHByb3ZpZGVzIGEgZGlmZmVyZW50LCBoaWdoZXIgcmVzb2x1dGlvbiBpbWFnZVxuICogdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgbGlnaHRib3guXG4gKiBAcGFyYW0geyFFbGVtZW50fSBpbWdcbiAqIEByZXR1cm4ge3tuYXR1cmFsV2lkdGg6IG51bWJlciwgbmF0dXJhbEhlaWdodDogbnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gZ2V0TWF4TmF0dXJhbERpbWVuc2lvbnMoaW1nKSB7XG4gIGNvbnN0IHtuYXR1cmFsSGVpZ2h0LCBuYXR1cmFsV2lkdGh9ID0gaW1nO1xuICBjb25zdCByYXRpbyA9IG5hdHVyYWxXaWR0aCAvIG5hdHVyYWxIZWlnaHQ7XG4gIGNvbnN0IG1heFdpZHRoRnJvbVNyY3NldCA9IGdldE1heFdpZHRoRnJvbVNyY3NldChpbWcpO1xuICBpZiAobWF4V2lkdGhGcm9tU3Jjc2V0ID4gbmF0dXJhbFdpZHRoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hdHVyYWxXaWR0aDogbWF4V2lkdGhGcm9tU3Jjc2V0LFxuICAgICAgbmF0dXJhbEhlaWdodDogbWF4V2lkdGhGcm9tU3Jjc2V0IC8gcmF0aW8sXG4gICAgfTtcbiAgfVxuICByZXR1cm4ge25hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcldpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gcmVuZGVySGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmF0dXJhbFdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gbmF0dXJhbEhlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IHZ3XG4gKiBAcGFyYW0ge251bWJlcn0gdmhcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lZXRzU2l6aW5nQ3JpdGVyaWEoXG4gIHJlbmRlcldpZHRoLFxuICByZW5kZXJIZWlnaHQsXG4gIG5hdHVyYWxXaWR0aCxcbiAgbmF0dXJhbEhlaWdodCxcbiAgdncsXG4gIHZoXG4pIHtcbiAgY29uc3Qgdmlld3BvcnRBcmVhID0gdncgKiB2aDtcbiAgY29uc3QgbmF0dXJhbEFyZWEgPSBuYXR1cmFsV2lkdGggKiBuYXR1cmFsSGVpZ2h0O1xuICBjb25zdCByZW5kZXJBcmVhID0gcmVuZGVyV2lkdGggKiByZW5kZXJIZWlnaHQ7XG5cbiAgY29uc3QgaXNTaHJ1bmsgPSBuYXR1cmFsQXJlYSAvIHJlbmRlckFyZWEgPj0gUkVOREVSX0FSRUFfUkFUSU87XG5cbiAgY29uc3QgaXNDb3ZlcmluZ1NpZ25pZmljYW50QXJlYSA9XG4gICAgcmVuZGVyQXJlYSAvIHZpZXdwb3J0QXJlYSA+PSBWSUVXUE9SVF9BUkVBX1JBVElPO1xuXG4gIGNvbnN0IGlzTGFyZ2VyVGhhblZpZXdwb3J0ID0gbmF0dXJhbFdpZHRoID4gdncgfHwgbmF0dXJhbEhlaWdodCA+IHZoO1xuXG4gIHJldHVybiBpc1NocnVuayB8fCBpc0xhcmdlclRoYW5WaWV3cG9ydCB8fCBpc0NvdmVyaW5nU2lnbmlmaWNhbnRBcmVhO1xufVxuXG4vKipcbiAqIE1hcmtzIGEgbGlnaHRib3ggY2FuZGlkYXRlIGFzIHZpc2l0ZWQgYXMgbm90IHRvIHJlc2NhbiBvbiBET00gdXBkYXRlLlxuICogQHBhcmFtIHshRWxlbWVudH0gY2FuZGlkYXRlXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gbWFya0FzVmlzaXRlZChjYW5kaWRhdGUpIHtcbiAgcmV0dXJuIFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoY2FuZGlkYXRlKS5tdXRhdGVFbGVtZW50KGNhbmRpZGF0ZSwgKCkgPT4ge1xuICAgIGNhbmRpZGF0ZS5zZXRBdHRyaWJ1dGUoVklTSVRFRF9BVFRSLCAnJyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz59IHRhZ05hbWVzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGNhbmRpZGF0ZVNlbGVjdG9yKHRhZ05hbWVzKSB7XG4gIHJldHVybiB0YWdOYW1lc1xuICAgIC5tYXAoXG4gICAgICAodGFnTmFtZSkgPT5cbiAgICAgICAgYCR7dGFnTmFtZX06bm90KFske0xJR0hUQk9YQUJMRV9BVFRSfV0pOm5vdChbJHtWSVNJVEVEX0FUVFJ9XSlgXG4gICAgKVxuICAgIC5qb2luKCcsJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IVByb21pc2V9XG4gKi9cbmZ1bmN0aW9uIHdoZW5Mb2FkZWQoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC50YWdOYW1lID09PSAnSU1HJykge1xuICAgIHJldHVybiBsb2FkUHJvbWlzZShlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gd2hlblVwZ3JhZGVkVG9DdXN0b21FbGVtZW50KGVsZW1lbnQpLnRoZW4oKGVsZW1lbnQpID0+XG4gICAgZWxlbWVudC5zaWduYWxzKCkud2hlblNpZ25hbChDb21tb25TaWduYWxzLkxPQURfRU5EKVxuICApO1xufVxuXG4vKiogQHZpc2libGVGb3JUZXN0aW5nICovXG5leHBvcnQgY2xhc3MgU2Nhbm5lciB7XG4gIC8qKlxuICAgKiBHZXRzIGFsbCB1bnZpc2l0ZWQgbGlnaHRib3ggY2FuZGlkYXRlcy5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR8IUVsZW1lbnR9IHJvb3RcbiAgICogQHJldHVybiB7IUFycmF5PCFFbGVtZW50Pn1cbiAgICovXG4gIHN0YXRpYyBnZXRDYW5kaWRhdGVzKHJvb3QpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGNhbmRpZGF0ZVNlbGVjdG9yKFsnYW1wLWltZycsICdpbWcnXSk7XG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IHRvQXJyYXkocm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgLy8gVE9ETyhhbGFub3JvemNvKTogRE9NIG11dGF0aW9ucyBzaG91bGQgYmUgd3JhcHBlZCBpbiBtdXRhdGUgY29udGV4dHMuXG4gICAgLy8gQWx0ZXJuYXRpdmVseSwgdXNlIGluLW1lbW9yeSBcInZpc2l0ZWRcIiBtYXJrZXIgaW5zdGVhZCBvZiBhdHRyaWJ1dGUuXG4gICAgY2FuZGlkYXRlcy5mb3JFYWNoKG1hcmtBc1Zpc2l0ZWQpO1xuICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIGRvY3VtZW50IG1ldGFkYXRhIGFubm90YXRpb25zIGFzIGRlZmluZWQgYnkgZWl0aGVyIExEK0pTT04gc2NoZW1hIG9yXG4gKiBPcGVuIEdyYXBoIDxtZXRhPiB0YWdzLlxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBEb2NNZXRhQW5ub3RhdGlvbnMge1xuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAgICovXG4gIHN0YXRpYyBnZXRPZ1R5cGUoYW1wZG9jKSB7XG4gICAgY29uc3QgdGFnID0gYW1wZG9jLmdldFJvb3ROb2RlKCkucXVlcnlTZWxlY3RvcihNRVRBX09HX1RZUEUpO1xuICAgIGlmICh0YWcpIHtcbiAgICAgIHJldHVybiB0YWcuZ2V0QXR0cmlidXRlKCdjb250ZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGVyIHRoZSBkb2N1bWVudCB0eXBlIGFzIGRlZmluZWQgYnkgT3BlbiBHcmFwaCBtZXRhIHRhZ1xuICAgKiBlLmcuIGA8bWV0YSBwcm9wZXJ0eT1cIm9nOnR5cGVcIj5gIGlzIHZhbGlkLlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIGhhc1ZhbGlkT2dUeXBlKGFtcGRvYykge1xuICAgIHJldHVybiBEb2NNZXRhQW5ub3RhdGlvbnMuZ2V0T2dUeXBlKGFtcGRvYykgPT0gRU5BQkxFRF9PR19UWVBFX0FSVElDTEU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHJldHVybiB7IUFycmF5PHN0cmluZz59XG4gICAqL1xuICBzdGF0aWMgZ2V0QWxsTGRKc29uVHlwZXMoYW1wZG9jKSB7XG4gICAgcmV0dXJuIHRvQXJyYXkoYW1wZG9jLmdldFJvb3ROb2RlKCkucXVlcnlTZWxlY3RvckFsbChTQ1JJUFRfTERfSlNPTikpXG4gICAgICAubWFwKChlbCkgPT4ge1xuICAgICAgICBjb25zdCB7dGV4dENvbnRlbnR9ID0gZWw7XG4gICAgICAgIHJldHVybiAodHJ5UGFyc2VKc29uKHRleHRDb250ZW50KSB8fCB7fSlbJ0B0eXBlJ107XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihCb29sZWFuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRlciBvbmUgb2YgdGhlIGRvY3VtZW50IHR5cGVzIChmaWVsZCBgQHR5cGVgKSBkZWZpbmVkIGluXG4gICAqIExEK0pTT04gc2NoZW1hIGlzIGluIEVOQUJMRURfTERfSlNPTl9UWVBFUy5cbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHN0YXRpYyBoYXNWYWxpZExkSnNvblR5cGUoYW1wZG9jKSB7XG4gICAgcmV0dXJuIERvY01ldGFBbm5vdGF0aW9ucy5nZXRBbGxMZEpzb25UeXBlcyhhbXBkb2MpLnNvbWUoXG4gICAgICAodHlwZSkgPT4gRU5BQkxFRF9MRF9KU09OX1RZUEVTW3R5cGVdXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhIGRvY3VtZW50IHVzZXMgYGFtcC1saWdodGJveC1nYWxsZXJ5YCBleHBsaWNpdGx5IGJ5XG4gKiBpbmNsdWRpbmcgdGhlIGV4dGVuc2lvbiBhbmQgZXhwbGljaXRseSBsaWdodGJveGluZyBhdCBsZWFzdCBvbmUgZWxlbWVudC5cbiAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiB1c2VzTGlnaHRib3hFeHBsaWNpdGx5KGFtcGRvYykge1xuICAvLyBUT0RPKGFsYW5vcm96Y28pOiBCYWNrcG9ydCBpbnRvIEV4dGVuc2lvbnMgc2VydmljZS5cbiAgY29uc3QgcmVxdWlyZWRFeHRlbnNpb25TZWxlY3RvciA9IGBzY3JpcHRbY3VzdG9tLWVsZW1lbnQ9XCIke1JFUVVJUkVEX0VYVEVOU0lPTn1cIl1gO1xuICBjb25zdCBsaWdodGJveGVkRWxlbWVudHNTZWxlY3RvciA9IGBbJHtMSUdIVEJPWEFCTEVfQVRUUn1dOm5vdChbJHtWSVNJVEVEX0FUVFJ9XSlgO1xuICBjb25zdCBleGlzdHMgPSAoc2VsZWN0b3IpID0+ICEhYW1wZG9jLmdldFJvb3ROb2RlKCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgcmV0dXJuIChcbiAgICBleGlzdHMocmVxdWlyZWRFeHRlbnNpb25TZWxlY3RvcikgJiYgZXhpc3RzKGxpZ2h0Ym94ZWRFbGVtZW50c1NlbGVjdG9yKVxuICApO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBhdXRvLWxpZ2h0Ym94IGlzIGVuYWJsZWQgZm9yIGEgZG9jdW1lbnQuXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbmFibGVkRm9yRG9jKGFtcGRvYykge1xuICBpZiAodXNlc0xpZ2h0Ym94RXhwbGljaXRseShhbXBkb2MpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgRG9jTWV0YUFubm90YXRpb25zLmhhc1ZhbGlkT2dUeXBlKGFtcGRvYykgfHxcbiAgICBEb2NNZXRhQW5ub3RhdGlvbnMuaGFzVmFsaWRMZEpzb25UeXBlKGFtcGRvYylcbiAgKTtcbn1cblxuLyoqIEBwcml2YXRlIHtudW1iZXJ9ICovXG5sZXQgdWlkID0gMDtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgaWQgZm9yIGxpZ2h0Ym94IGdyb3VwaW5nLlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUxpZ2h0Ym94VWlkKCkge1xuICByZXR1cm4gYGktYW1waHRtbC1hdXRvLWxpZ2h0Ym94LSR7dWlkKyt9YDtcbn1cblxuLyoqXG4gKiBMaWdodGJveGVzIGFuIGVsZW1lbnQuXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IVByb21pc2U8IUVsZW1lbnQ+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShhbXBkb2MsIGVsZW1lbnQpIHtcbiAgY29uc3QgbXV0YXRvciA9IFNlcnZpY2VzLm11dGF0b3JGb3JEb2MoYW1wZG9jKTtcbiAgY29uc3QgbXV0YXRlUHJvbWlzZSA9IG11dGF0b3IubXV0YXRlRWxlbWVudChlbGVtZW50LCAoKSA9PiB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoTElHSFRCT1hBQkxFX0FUVFIsIGdlbmVyYXRlTGlnaHRib3hVaWQoKSk7XG4gIH0pO1xuICByZXR1cm4gbXV0YXRlUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICBTZXJ2aWNlcy5leHRlbnNpb25zRm9yKGFtcGRvYy53aW4pLmluc3RhbGxFeHRlbnNpb25Gb3JEb2MoXG4gICAgICBhbXBkb2MsXG4gICAgICBSRVFVSVJFRF9FWFRFTlNJT05cbiAgICApO1xuXG4gICAgZGlzcGF0Y2hDdXN0b21FdmVudChlbGVtZW50LCBBdXRvTGlnaHRib3hFdmVudHMuTkVXTFlfU0VUKTtcblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICogQHBhcmFtIHshQXJyYXk8IUVsZW1lbnQ+fSBjYW5kaWRhdGVzXG4gKiBAcmV0dXJuIHshQXJyYXk8IVByb21pc2U8IUVsZW1lbnR8dW5kZWZpbmVkPj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5DYW5kaWRhdGVzKGFtcGRvYywgY2FuZGlkYXRlcykge1xuICByZXR1cm4gY2FuZGlkYXRlcy5tYXAoKGNhbmRpZGF0ZSkgPT5cbiAgICB3aGVuTG9hZGVkKGNhbmRpZGF0ZSkudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gbWVhc3VyZUludGVyc2VjdGlvbk5vUm9vdChjYW5kaWRhdGUpLnRoZW4oXG4gICAgICAgICh7Ym91bmRpbmdDbGllbnRSZWN0fSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGNhbmRpZGF0ZS50YWdOYW1lICE9PSAnSU1HJyAmJlxuICAgICAgICAgICAgIWNhbmRpZGF0ZS5zaWduYWxzKCkuZ2V0KENvbW1vblNpZ25hbHMuTE9BRF9FTkQpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyA8YW1wLWltZz4gd2lsbCBjaGFuZ2UgdGhlIGltZydzIHNyYyBpbmxpbmUgZGF0YSBvbiB1bmxheW91dCBhbmRcbiAgICAgICAgICAgIC8vIHJlbW92ZSBpdCBmcm9tIERPTS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCB7aGVpZ2h0LCB3aWR0aH0gPSBib3VuZGluZ0NsaWVudFJlY3Q7XG4gICAgICAgICAgaWYgKCFDcml0ZXJpYS5tZWV0c0FsbChjYW5kaWRhdGUsIGFtcGRvYywgd2lkdGgsIGhlaWdodCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGV2KCkuaW5mbyhUQUcsICdhcHBseScsIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgcmV0dXJuIGFwcGx5KGFtcGRvYywgY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9LCBOT09QKVxuICApO1xufVxuXG4vKipcbiAqIFNjYW5zIGEgZG9jdW1lbnQgb24gaW5pdGlhbGl6YXRpb24gdG8gbGlnaHRib3ggZWxlbWVudHMgdGhhdCBtZWV0IGNyaXRlcmlhLlxuICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfcm9vdFxuICogQHJldHVybiB7IUFycmF5PCFQcm9taXNlPnx1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FuKGFtcGRvYywgb3B0X3Jvb3QpIHtcbiAgaWYgKCFpc0VuYWJsZWRGb3JEb2MoYW1wZG9jKSkge1xuICAgIGRldigpLmluZm8oVEFHLCAnZGlzYWJsZWQnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgcm9vdCA9IG9wdF9yb290IHx8IGFtcGRvYy53aW4uZG9jdW1lbnQ7XG4gIHJldHVybiBydW5DYW5kaWRhdGVzKGFtcGRvYywgU2Nhbm5lci5nZXRDYW5kaWRhdGVzKHJvb3QpKTtcbn1cblxuQU1QLmV4dGVuc2lvbihUQUcsICcwLjEnLCAoQU1QKSA9PiB7XG4gIGNvbnN0IHthbXBkb2N9ID0gQU1QO1xuICBhbXBkb2Mud2hlblJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgYW1wZG9jLmdldFJvb3ROb2RlKCkuYWRkRXZlbnRMaXN0ZW5lcihBbXBFdmVudHMuRE9NX1VQREFURSwgKGUpID0+IHtcbiAgICAgIGNvbnN0IHt0YXJnZXR9ID0gZTtcbiAgICAgIHNjYW4oYW1wZG9jLCBkZXYoKS5hc3NlcnRFbGVtZW50KHRhcmdldCkpO1xuICAgIH0pO1xuICAgIHNjYW4oYW1wZG9jKTtcbiAgfSk7XG59KTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-auto-lightbox/0.1/amp-auto-lightbox.js