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
import {CarouselCriteria} from './carousel-criteria';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {
  closestAncestorElementBySelector,
  matches,
  whenUpgradedToCustomElement,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {resolveFalse, resolveTrue} from './utils/promise';
import {toArray} from '../../../src/types';
import {tryParseJson} from '../../../src/json';

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
 * Only of document type by Open Graph `<meta property="og:type">` where
 * auto-lightbox should be enabled. Top-level og:type set is tiny, and `article`
 * covers all required types.
 */
export const ENABLED_OG_TYPE_ARTICLE = 'article';

/** Factor of naturalArea vs renderArea to lightbox. */
export const RENDER_AREA_RATIO = 1.2;

/** Factor of renderArea vs viewportArea to lightbox. */
export const VIEWPORT_AREA_RATIO = 0.25;

/** @const {!Array<string>} */
const CANDIDATES = ['amp-img', 'amp-carousel'];

/**
 * Selector for subnodes by attribute for which the auto-lightbox treatment
 * does not apply. These can be set directly on the candidate or on an ancestor.
 */
const DISABLED_BY_ATTR = [
  // Runtime-specific.
  '[placeholder]',

  // Explicitly opted out.
  '[data-amp-auto-lightbox-disable]',

  // Considered "actionable", i.e. that are bound to a default
  // onclick action(e.g. `button`) or where it cannot be determined whether
  // they're actionable or not (e.g. `amp-script`).
  'amp-selector [option]',

  // amp-subscriptions actions
  '[subscriptions-action]',
].join(',');

/**
 * Selector for subnodes for which the auto-lightbox treatment does not apply.
 */
const DISABLED_ANCESTORS = [
  // Ancestors considered "actionable", i.e. that are bound to a default
  // onclick action(e.g. `button`) or where it cannot be determined whether
  // they're actionable or not (e.g. `amp-script`).
  'a[href]',
  'amp-script',
  'amp-story',
  'button',

  // No nested lightboxes.
  'amp-lightbox',

  // Special treatment.
  'amp-carousel',
].join(',');

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
   * @return {!Promise<boolean>}
   */
  static meetsAll(element) {
    if (
      !Criteria.meetsSimpleCriteria(element) ||
      !Criteria.meetsTreeShapeCriteria(element)
    ) {
      return resolveFalse();
    }
    return Criteria.meetsComplexCriteria(element);
  }

  /**
   * Criteria that is "simple", ie runs quickly and discards elements in order
   * to shortcircuit.
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsSimpleCriteria(element) {
    if (element.tagName.toUpperCase() == 'AMP-IMG') {
      return ImageCriteria.meetsSizingCriteria(element);
    }
    return true;
  }

  /**
   * Criteria that is "complex", ie takes longer to run and discards elements
   * after they're likely to be good candidates per previous conditions.
   * @param {!Element} element
   * @return {!Promise<boolean>}
   */
  static meetsComplexCriteria(element) {
    if (element.tagName.toUpperCase() == 'AMP-CAROUSEL') {
      return CarouselCriteria.meetsAll(element);
    }
    return resolveTrue();
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsTreeShapeCriteria(element) {
    const disabledSelector = `${DISABLED_ANCESTORS},${DISABLED_BY_ATTR}`;
    const disabledAncestor = closestAncestorElementBySelector(
      element,
      disabledSelector
    );
    // since we lookup both amp-img and amp-carousel at the same level, and
    // we'd like to give amp-carousel special treatment by containing amp-img's,
    // we need to filter out images inside carousels, but not carousels
    // themselves.
    if (
      disabledAncestor &&
      (disabledAncestor != element ||
        matches(disabledAncestor, DISABLED_BY_ATTR))
    ) {
      return false;
    }
    const actions = Services.actionServiceForDoc(element);
    return !actions.hasResolvableAction(element, 'tap');
  }
}

class ImageCriteria {
  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static meetsSizingCriteria(element) {
    const {naturalWidth, naturalHeight} = dev().assertElement(
      element.querySelector('img')
    );

    const {width: renderWidth, height: renderHeight} = element.getLayoutBox();

    const viewport = Services.viewportForDoc(element);
    const {width: vw, height: vh} = viewport.getSize();

    return meetsSizingCriteria(
      renderWidth,
      renderHeight,
      naturalWidth,
      naturalHeight,
      vw,
      vh
    );
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
  vh
) {
  const viewportArea = vw * vh;
  const naturalArea = naturalWidth * naturalHeight;
  const renderArea = renderWidth * renderHeight;

  const isShrunk = naturalArea / renderArea >= RENDER_AREA_RATIO;

  const isCoveringSignificantArea =
    renderArea / viewportArea >= VIEWPORT_AREA_RATIO;

  const isLargerThanViewport = naturalWidth > vw || naturalHeight > vh;

  return isShrunk || isLargerThanViewport || isCoveringSignificantArea;
}

/**
 * Marks a lightbox candidate as visited as not to rescan on DOM update.
 * @param {!Element} candidate
 * @return {!Promise}
 */
function markAsVisited(candidate) {
  return Mutation.mutate(candidate, () => {
    candidate.setAttribute(VISITED_ATTR, '');
  });
}

/**
 * @param {string} tagName
 * @return {string}
 */
function candidateSelector(tagName) {
  return `${tagName}:not([${LIGHTBOXABLE_ATTR}]):not([${VISITED_ATTR}])`;
}

/**
 * @param {!Element} element
 * @return {!Promise}
 */
function whenLoaded(element) {
  return whenUpgradedToCustomElement(element).then(element =>
    element.signals().whenSignal(CommonSignals.LOAD_END)
  );
}

/** @visibleForTesting */
export class Scanner {
  /**
   * Gets all unvisited lightbox candidates.
   * @param {!Document|!Element} root
   * @return {!Array<!Element>}
   */
  static getCandidates(root) {
    const selector = CANDIDATES.map(candidateSelector).join(',');
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
   * e.g. `<meta property="og:type">` is valid.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {boolean}
   */
  static hasValidOgType(ampdoc) {
    return DocMetaAnnotations.getOgType(ampdoc) == ENABLED_OG_TYPE_ARTICLE;
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Array<string>}
   */
  static getAllLdJsonTypes(ampdoc) {
    return toArray(getRootNode(ampdoc).querySelectorAll(SCRIPT_LD_JSON))
      .map(({textContent}) => (tryParseJson(textContent) || {})['@type'])
      .filter(typeOrUndefined => typeOrUndefined);
  }

  /**
   * Determines wheter one of the document types (field `@type`) defined in
   * LD+JSON schema is in ENABLED_LD_JSON_TYPES.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {boolean}
   */
  static hasValidLdJsonType(ampdoc) {
    return DocMetaAnnotations.getAllLdJsonTypes(ampdoc).some(
      type => ENABLED_LD_JSON_TYPES[type]
    );
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
    return whenUpgradedToCustomElement(ampEl).then(ampEl =>
      ampEl.getResources().mutateElement(ampEl, mutator)
    );
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
  const requiredExtensionSelector = `script[custom-element="${REQUIRED_EXTENSION}"]`;

  const lightboxedElementsSelector = `[${LIGHTBOXABLE_ATTR}]:not([${VISITED_ATTR}])`;

  const exists = selector => !!getRootNode(ampdoc).querySelector(selector);

  return (
    exists(requiredExtensionSelector) && exists(lightboxedElementsSelector)
  );
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function isProxyOriginOrLocalDev(ampdoc) {
  // Allow `localDev` in lieu of proxy origin for manual testing, except in
  // tests where we need to actually perform the check.
  const {win} = ampdoc;
  if (getMode(win).localDev && !getMode(win).test) {
    return true;
  }

  // An attached node is required for proxy origin check. If no elements are
  // present, short-circuit.
  const {firstElementChild} = ampdoc.getBody();
  if (!firstElementChild) {
    return false;
  }

  // TODO(alanorozco): Additionally check for transformed, webpackaged flag.
  // See git.io/fhQ0a (#20359) for details.
  return Services.urlForDoc(firstElementChild).isProxyOrigin(win.location);
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
  if (
    !DocMetaAnnotations.hasValidOgType(ampdoc) &&
    !DocMetaAnnotations.hasValidLdJsonType(ampdoc)
  ) {
    return false;
  }
  return isProxyOriginOrLocalDev(ampdoc);
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
    Services.extensionsFor(ampdoc.win).installExtensionForDoc(
      ampdoc,
      REQUIRED_EXTENSION
    );

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
      return Criteria.meetsAll(candidate).then(meetsAll => {
        if (!meetsAll) {
          return;
        }
        dev().info(TAG, 'apply', candidate);
        return apply(ampdoc, candidate);
      });
    }, NOOP)
  );
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
  const root = opt_root || ampdoc.win.document;
  return runCandidates(ampdoc, Scanner.getCandidates(root));
}

AMP.extension(TAG, '0.1', ({ampdoc}) => {
  ampdoc.whenReady().then(() => {
    getRootNode(ampdoc).addEventListener(AmpEvents.DOM_UPDATE, ({target}) => {
      scan(ampdoc, dev().assertElement(target));
    });
    scan(ampdoc);
  });
});
