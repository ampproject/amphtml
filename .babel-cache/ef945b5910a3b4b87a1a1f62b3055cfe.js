function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  'DiscussionForumPosting': true };


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
var DISABLED_BY_ATTR = [
// Runtime-specific.
'[placeholder]',

// Explicitly opted out.
'[data-amp-auto-lightbox-disable]',

// Considered "actionable", i.e. that are bound to a default
// onclick action(e.g. `button`) or where it cannot be determined whether
// they're actionable or not (e.g. `amp-script`).
'amp-selector [option]',

// amp-subscriptions actions
'[subscriptions-action]'].
join(',');

/**
 * Selector for subnodes for which the auto-lightbox treatment does not apply.
 */
var DISABLED_ANCESTORS = [
// Ancestors considered "actionable", i.e. that are bound to a default
// onclick action(e.g. `button`) or where it cannot be determined whether
// they're actionable or not (e.g. `amp-script`).
'a[href]',
'amp-script',
'amp-story',
'button',

// No nested lightboxes.
'amp-lightbox',

// Already actionable in vast majority of cases, explicit API.
'amp-carousel'].
join(',');

var SCRIPT_LD_JSON = 'script[type="application/ld+json"]';
var META_OG_TYPE = 'meta[property="og:type"]';

var NOOP = function NOOP() {};

/** @visibleForTesting */
export var Criteria = /*#__PURE__*/function () {function Criteria() {_classCallCheck(this, Criteria);}_createClass(Criteria, null, [{ key: "meetsAll", value:
    /**
     * @param {!Element} element
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @param {number} renderWidth
     * @param {number} renderHeight
     * @return {boolean}
     */
    function meetsAll(element, ampdoc, renderWidth, renderHeight) {
      return (
      Criteria.meetsSizingCriteria(
      element,
      ampdoc,
      renderWidth,
      renderHeight) &&
      Criteria.meetsTreeShapeCriteria(element, ampdoc));

    }

    /**
     * @param {!Element} element
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {boolean}
     */ }, { key: "meetsTreeShapeCriteria", value:
    function meetsTreeShapeCriteria(element, ampdoc) {
      if (
      element.tagName === 'IMG' &&
      closestAncestorElementBySelector(element, 'amp-img'))
      {
        // Images that are a child of an AMP-IMG do not need additional treatment.
        return false;
      }

      var disabledSelector = "".concat(DISABLED_ANCESTORS, ",").concat(DISABLED_BY_ATTR);
      var disabledAncestor = closestAncestorElementBySelector(
      element,
      disabledSelector);

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
     */ }, { key: "meetsSizingCriteria", value:
    function meetsSizingCriteria(element, ampdoc, renderWidth, renderHeight) {
      var _getMaxNaturalDimensi = getMaxNaturalDimensions( /** @type {!Element} */(
      element.querySelector('img') || element)),naturalHeight = _getMaxNaturalDimensi.naturalHeight,naturalWidth = _getMaxNaturalDimensi.naturalWidth;


      var viewport = Services.viewportForDoc(ampdoc);
      var _viewport$getSize = viewport.getSize(),vh = _viewport$getSize.height,vw = _viewport$getSize.width;

      return _meetsSizingCriteria(
      renderWidth,
      renderHeight,
      naturalWidth,
      naturalHeight,
      vw,
      vh);

    } }]);return Criteria;}();


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
    while ((match = srcsetWidthRe.exec(srcsetAttr))) {
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
  var naturalHeight = img.naturalHeight,naturalWidth = img.naturalWidth;
  var ratio = naturalWidth / naturalHeight;
  var maxWidthFromSrcset = getMaxWidthFromSrcset(img);
  if (maxWidthFromSrcset > naturalWidth) {
    return {
      naturalWidth: maxWidthFromSrcset,
      naturalHeight: maxWidthFromSrcset / ratio };

  }
  return { naturalWidth: naturalWidth, naturalHeight: naturalHeight };
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
function _meetsSizingCriteria(
renderWidth,
renderHeight,
naturalWidth,
naturalHeight,
vw,
vh)
{
  var viewportArea = vw * vh;
  var naturalArea = naturalWidth * naturalHeight;
  var renderArea = renderWidth * renderHeight;

  var isShrunk = naturalArea / renderArea >= RENDER_AREA_RATIO;

  var isCoveringSignificantArea =
  renderArea / viewportArea >= VIEWPORT_AREA_RATIO;

  var isLargerThanViewport = naturalWidth > vw || naturalHeight > vh;

  return isShrunk || isLargerThanViewport || isCoveringSignificantArea;
}

/**
 * Marks a lightbox candidate as visited as not to rescan on DOM update.
 * @param {!Element} candidate
 * @return {!Promise}
 */export { _meetsSizingCriteria as meetsSizingCriteria };
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
  return tagNames.
  map(
  function (tagName) {return "".concat(
    tagName, ":not([").concat(LIGHTBOXABLE_ATTR, "]):not([").concat(VISITED_ATTR, "])");}).

  join(',');
}

/**
 * @param {!Element} element
 * @return {!Promise}
 */
function whenLoaded(element) {
  if (element.tagName === 'IMG') {
    return loadPromise(element);
  }
  return whenUpgradedToCustomElement(element).then(function (element) {return (
      element.signals().whenSignal(CommonSignals.LOAD_END));});

}

/** @visibleForTesting */
export var Scanner = /*#__PURE__*/function () {function Scanner() {_classCallCheck(this, Scanner);}_createClass(Scanner, null, [{ key: "getCandidates", value:
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
    } }]);return Scanner;}();


/**
 * Parses document metadata annotations as defined by either LD+JSON schema or
 * Open Graph <meta> tags.
 * @visibleForTesting
 */
export var DocMetaAnnotations = /*#__PURE__*/function () {function DocMetaAnnotations() {_classCallCheck(this, DocMetaAnnotations);}_createClass(DocMetaAnnotations, null, [{ key: "getOgType", value:
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
     */ }, { key: "hasValidOgType", value:
    function hasValidOgType(ampdoc) {
      return DocMetaAnnotations.getOgType(ampdoc) == ENABLED_OG_TYPE_ARTICLE;
    }

    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {!Array<string>}
     */ }, { key: "getAllLdJsonTypes", value:
    function getAllLdJsonTypes(ampdoc) {
      return toArray(ampdoc.getRootNode().querySelectorAll(SCRIPT_LD_JSON)).
      map(function (el) {
        var textContent = el.textContent;
        return (tryParseJson(textContent) || {})['@type'];
      }).
      filter(Boolean);
    }

    /**
     * Determines wheter one of the document types (field `@type`) defined in
     * LD+JSON schema is in ENABLED_LD_JSON_TYPES.
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {boolean}
     */ }, { key: "hasValidLdJsonType", value:
    function hasValidLdJsonType(ampdoc) {
      return DocMetaAnnotations.getAllLdJsonTypes(ampdoc).some(
      function (type) {return ENABLED_LD_JSON_TYPES[type];});

    } }]);return DocMetaAnnotations;}();


/**
 * Determines whether a document uses `amp-lightbox-gallery` explicitly by
 * including the extension and explicitly lightboxing at least one element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function usesLightboxExplicitly(ampdoc) {
  // TODO(alanorozco): Backport into Extensions service.
  var requiredExtensionSelector = "script[custom-element=\"".concat(REQUIRED_EXTENSION, "\"]");
  var lightboxedElementsSelector = "[".concat(LIGHTBOXABLE_ATTR, "]:not([").concat(VISITED_ATTR, "])");
  var exists = function exists(selector) {return !!ampdoc.getRootNode().querySelector(selector);};

  return (
  exists(requiredExtensionSelector) && exists(lightboxedElementsSelector));

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
  return (
  DocMetaAnnotations.hasValidOgType(ampdoc) ||
  DocMetaAnnotations.hasValidLdJsonType(ampdoc));

}

/** @private {number} */
var uid = 0;

/**
 * Generates a unique id for lightbox grouping.
 * @return {string}
 */
function generateLightboxUid() {
  return "i-amphtml-auto-lightbox-".concat(uid++);
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
    Services.extensionsFor(ampdoc.win).installExtensionForDoc(
    ampdoc,
    REQUIRED_EXTENSION);


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
  return candidates.map(function (candidate) {return (
      whenLoaded(candidate).then(function () {
        return measureIntersectionNoRoot(candidate).then(
        function (_ref) {var boundingClientRect = _ref.boundingClientRect;
          if (
          candidate.tagName !== 'IMG' &&
          !candidate.signals().get(CommonSignals.LOAD_END))
          {
            // <amp-img> will change the img's src inline data on unlayout and
            // remove it from DOM.
            return;
          }

          var height = boundingClientRect.height,width = boundingClientRect.width;
          if (!Criteria.meetsAll(candidate, ampdoc, width, height)) {
            return;
          }
          dev().info(TAG, 'apply', candidate);
          return apply(ampdoc, candidate);
        });

      }, NOOP));});

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
      scan(ampdoc, /** @type {!Element} */(target));
    });
    scan(ampdoc);
  });
});
// /Users/mszylkowski/src/amphtml/extensions/amp-auto-lightbox/0.1/amp-auto-lightbox.js