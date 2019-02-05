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

import {AmpEvents} from '../../../src/amp-events';
import {AutoLightboxEvents} from '../../../src/auto-lightbox';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {closestBySelector} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {tryResolve} from '../../../src/utils/promise';


const TAG = 'amp-auto-lightbox';

export const REQUIRED_EXTENSION = 'amp-lightbox-gallery';
export const LIGHTBOXABLE_ATTR = 'lightbox';

/** Attribute to mark scanned lightbox candidates as not to revisit. */
export const VISITED_ATTR = 'i-amphtml-auto-lightbox-visited';

/**
 * Types of document by LD+JSON schema `@type` field where auto-lightbox should
 * be enabled.
 * @private @const {!Object<string|undefined, boolean>}
 */
export const ENABLED_LD_JSON_TYPES = {
  'Article': true,
  'NewsArticle': true,
  'BlogPosting': true,
  'LiveBlogPosting': true,
  'DiscussionForumPosting': true,
};

/**
 * Types of document by Open Graph `<meta property="og:type">` where
 * auto-lightbox should be enabled.
 * @private @const {!Object<string|undefined, boolean>}
 */
export const ENABLED_OG_TYPES = {
  'article': true,
};

/** Factor of naturalArea vs renderArea to lightbox. */
export const RENDER_AREA_RATIO = 1.2;

/** Factor of renderArea vs viewportArea to lightbox. */
export const VIEWPORT_AREA_RATIO = 0.25;

/**
 * Selector for subnodes for which the auto-lightbox treatment does not apply.
 */
const DISABLED_ANCESTORS =
    // Runtime-specific.
    '[placeholder],' +

    // Explicitly opted out.
    '[data-amp-auto-lightbox-disable],' +

    // Ancestors considered "actionable", i.e. that are bound to a default
    // onclick action(e.g. `button`) or where it cannot be determined whether
    // they're actionable or not (e.g. `amp-script`).
    'a[href],' +
    'amp-selector [option],' +
    'amp-script,' +
    'amp-story,' +
    'button,' +

    // Special treatment.
    // TODO(alanorozco): Allow and possibly group carousels where images are the
    // only content.
    'amp-carousel';


const GOOGLE_DOMAIN_RE = /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;

const SCRIPT_LD_JSON = 'script[type="application/ld+json"]';
const META_OG_TYPE = 'meta[property="og:type"]';

const NOOP = () => {};

/**
 * For better minification.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Document|!ShadowRoot}
 */
const getRootNode = ampdoc => ampdoc.getRootNode();


/** @visibleForTesting */
export class Criteria {

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsAll(element) {
    return Criteria.meetsSizingCriteria(element) &&
      Criteria.meetsTreeShapeCriteria(element);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsSizingCriteria(element) {
    const {naturalWidth, naturalHeight} =
        dev().assertElement(element.querySelector('img'));

    const {width: renderWidth, height: renderHeight} = element.getLayoutBox();

    const viewport = Services.viewportForDoc(element);
    const {width: vw, height: vh} = viewport.getSize();

    return meetsSizingCriteria(
        renderWidth,
        renderHeight,
        naturalWidth,
        naturalHeight,
        vw,
        vh);
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsTreeShapeCriteria(element) {
    if (closestBySelector(element, DISABLED_ANCESTORS)) {
      return false;
    }
    const actions = Services.actionServiceForDoc(element);
    return !actions.hasAction(element, 'tap');
  }
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
export function meetsSizingCriteria(
  renderWidth,
  renderHeight,
  naturalWidth,
  naturalHeight,
  vw,
  vh) {

  const viewportArea = vw * vh;
  const naturalArea = naturalWidth * naturalHeight;
  const renderArea = renderWidth * renderHeight;

  const isShrunk =
    (naturalArea / renderArea) >= RENDER_AREA_RATIO;

  const isCoveringSignificantArea =
    (renderArea / viewportArea) >= VIEWPORT_AREA_RATIO;

  const isLargerThanViewport = naturalWidth > vw || naturalHeight > vh;

  return isShrunk ||
    isLargerThanViewport ||
    isCoveringSignificantArea;
}


/**
 * Marks a lightbox candidate as visited as not to rescan on DOM update.
 * @param {!Element} candidate
 * @return {!Promise<!Element>}
 */
function markAsVisited(candidate) {
  return Mutation.mutate(candidate, () => {
    candidate.setAttribute(VISITED_ATTR, '');
  });
}


/**
 * @param {!Element} element
 * @return {!Promise<!Element>}
 */
function whenLoaded(element) {
  return element.signals().whenSignal(CommonSignals.LOAD_END);
}


/** @visibleForTesting */
export class Scanner {

  /**
   * Gets all unvisited lightbox candidates.
   * @param {!Document|!Element} root
   * @return {!Array<!Element>}
   */
  static getCandidates(root) {
    const selector =
        `amp-img:not([${LIGHTBOXABLE_ATTR}]):not([${VISITED_ATTR}])`;
    const candidates = toArray(root.querySelectorAll(selector));
    candidates.forEach(markAsVisited);
    return candidates;
  }
}


/**
 * Parses document metadata annotations as defined by either LD+JSON schema or
 * Open Graph <meta> tags.
 * @visibleForTesting
 */
export class DocMetaAnnotations {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {string|undefined}
   */
  static getOgType(ampdoc) {
    const tag = getRootNode(ampdoc).querySelector(META_OG_TYPE);
    if (tag) {
      return tag.getAttribute('content');
    }
  }

  /**
   * Determines wheter the document type as defined by Open Graph meta tag
   * e.g. `<meta property="og:type">` is in a given set.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Object<string|undefined, boolean>} types
   * @return {boolean}
   */
  static isOgTypeInSet(ampdoc, types) {
    return types[DocMetaAnnotations.getOgType(ampdoc)];
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Array<string>}
   */
  static getAllLdJsonTypes(ampdoc) {
    return toArray(getRootNode(ampdoc).querySelectorAll(SCRIPT_LD_JSON))
        .map(({textContent}) => ((tryParseJson(textContent) || {})['@type']))
        .filter(typeOrUndefined => typeOrUndefined);
  }

  /**
   * Determines wheter one of the document types (field `@type`) defined in
   * LD+JSON schema is in a given set.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Object<string|undefined, boolean>} types
   * @return {boolean}
   */
  static isLdJsonTypeInSet(ampdoc, types) {
    return DocMetaAnnotations.getAllLdJsonTypes(ampdoc)
        .some(type => types[type]);
  }
}


/**
 * Wrapper for an element-implementation-mutate sequence for readability and
 * mocking in tests.
 * @visibleForTesting
 */
export class Mutation {
  /**
   * @param {!Element} ampEl
   * @param {function()} mutator
   * @return {!Promise}
   */
  static mutate(ampEl, mutator) {
    return ampEl.getImpl().then(impl => impl.mutateElement(mutator));
  }
}


/**
 * Determines whether a document uses `amp-lightbox-gallery` explicitly by
 * including the extension and explicitly lightboxing at least one element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function usesLightboxExplicitly(ampdoc) {
  // TODO(alanorozco): Backport into Extensions service.
  const requiredExtensionSelector =
      `script[custom-element="${REQUIRED_EXTENSION}"]`;

  const lightboxedElementsSelector =
      `[${LIGHTBOXABLE_ATTR}]:not([${VISITED_ATTR}])`;

  const exists = selector => !!getRootNode(ampdoc).querySelector(selector);

  return exists(requiredExtensionSelector) &&
      exists(lightboxedElementsSelector);
}


const resolveFalse = () => tryResolve(() => false);
const resolveTrue = () => tryResolve(() => true);


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<!Element>} candidates
 * @return {!Promise<boolean>}
 */
function isEmbeddedAndTrusted(ampdoc, candidates) {
  // Allow `localDev` in lieu of viewer for manual testing, except in tests
  // where we need all checks.
  const {win} = ampdoc;
  if (getMode(win).localDev && !getMode(win).test) {
    return resolveTrue();
  }

  const viewer = Services.viewerForDoc(ampdoc);
  if (!viewer.isEmbedded()) {
    return resolveFalse();
  }

  // An attached node is required for viewer origin check. If no candidates are
  // present, short-circuit.
  if (candidates.length <= 0) {
    return resolveFalse();
  }

  return viewer.getViewerOrigin().then(origin => {
    const {hostname} = Services.urlForDoc(candidates[0]).parse(origin);
    return GOOGLE_DOMAIN_RE.test(hostname);
  });
}


/**
 * Determines whether auto-lightbox is enabled for a document.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<!Element>} candidates
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */
export function resolveIsEnabledForDoc(ampdoc, candidates) {
  if (usesLightboxExplicitly(ampdoc)) {
    return resolveFalse();
  }
  if (!DocMetaAnnotations.isLdJsonTypeInSet(ampdoc, ENABLED_LD_JSON_TYPES) &&
      !DocMetaAnnotations.isOgTypeInSet(ampdoc, ENABLED_OG_TYPES)) {
    return resolveFalse();
  }
  return isEmbeddedAndTrusted(ampdoc, candidates);
}


/** @private {number} */
let uid = 0;


/**
 * Generates a unique id for lightbox grouping.
 * @return {string}
 */
function generateLightboxUid() {
  return `i-amphtml-auto-lightbox-${uid++}`;
}


/**
 * Lightboxes an element.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @return {!Promise<!Element>}
 * @visibleForTesting
 */
export function apply(ampdoc, element) {
  return Mutation.mutate(element, () => {
    element.setAttribute(LIGHTBOXABLE_ATTR, generateLightboxUid());
  }).then(() => {
    Services.extensionsFor(ampdoc.win)
        .installExtensionForDoc(ampdoc, REQUIRED_EXTENSION);

    element.dispatchCustomEvent(AutoLightboxEvents.NEWLY_SET);

    return element;
  });
}


/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Array<!Element>} candidates
 * @return {!Array<!Promise<!Element|undefined>>}
 */
export function runCandidates(ampdoc, candidates) {
  return candidates.map(candidate =>
    whenLoaded(candidate).then(() => {
      if (!Criteria.meetsAll(candidate)) {
        dev().info(TAG, 'discarded', candidate);
        return;
      }
      dev().info(TAG, 'apply', candidate);
      return apply(ampdoc, candidate);
    }, NOOP));
}


/**
 * Scans a document on initialization to lightbox elements that meet criteria.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element=} opt_root
 * @return {!Promise<!Array<!Promise>|undefined>}
 */
export function scan(ampdoc, opt_root) {
  const candidates = Scanner.getCandidates(opt_root || ampdoc.win.document);

  return resolveIsEnabledForDoc(ampdoc, candidates).then(isEnabled => {
    if (!isEnabled) {
      dev().info(TAG, 'disabled');
      return;
    }
    return runCandidates(ampdoc, candidates);
  });
}


AMP.extension(TAG, '0.1', ({ampdoc}) => {
  ampdoc.whenReady().then(() => {
    getRootNode(ampdoc).addEventListener(AmpEvents.DOM_UPDATE, ({target}) => {
      scan(ampdoc, dev().assertElement(target));
    });
    scan(ampdoc);
  });
});
