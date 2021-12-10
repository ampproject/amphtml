import {toggleAttribute} from '#core/dom';
import {
  childElement,
  closestAncestorElementBySelector,
  elementByTag,
} from '#core/dom/query';
import {srcsetFromElement} from '#core/dom/srcset';
import {toggle} from '#core/dom/style';
import {toArray} from '#core/types/array';

import * as Preact from '#preact';

import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CSS as LIGHTBOX_CSS} from '../../amp-lightbox/1.0/component.jss';

/** @override */
export const Component = BentoLightboxGalleryProvider;

/** @override */
export const props = {
  'open': {attr: 'open', type: 'boolean'},
};

/** @override */
export const usesShadowDom = true;

/** @override */
export const shadowCss = COMPONENT_CSS + LIGHTBOX_CSS + CAROUSEL_CSS;

/** @const {!Array<string>} */
const LIGHTBOX_ELIGIBLE_TAGS = ['AMP-IMG', 'IMG'];

/** @const {!Array<string>} */
const LIGHTBOX_ELIGIBLE_GROUP_SELECTORS = [
  'AMP-BASE-CAROUSEL[lightbox]',
  'AMP-STREAM-GALLERY[lightbox]',
  'BENTO-BASE-CAROUSEL[lightbox]',
  'BENTO-STREAM-GALLERY[lightbox]',
];

/** @const {string} */
const LIGHTBOX_ATTR = 'lightbox';

/** @const {string} */
const DEFAULT_GROUP = 'default';

/** @const {string} */
const DEFAULT_CAROUSEL_PREFIX = 'carousel';

/** @const {number} */
let count = 0;

/**
 * @param {Node} element
 */
export function checkNumInstancesOnMount(element) {
  // There should only be one instance of `amp-lightbox-gallery` in a document.
  if (count++) {
    console /*OK */
      .warn(
        `${element.tagName} already exists in the document. Removing additional instance: ${element}`
      );
    element.parentNode?.removeChild(element);
  }
}

/** */
export function checkNumInstancesOnUnmount() {
  count--;
}

/**
 *
 * @param {Node} element
 */
export function beforeLightboxGalleryOpen(element) {
  toggleAttribute(element, 'open', true);
  toggle(element, true);
}

/**
 *
 * @param {Node} element
 */
export function afterLightboxGalleryClose(element) {
  toggleAttribute(element, 'open', false);
  toggle(element, false);
}

/**
 * @param {!Document} document
 * @param {function(number)} open
 * @return {!Array<PreactDef.Renderable>}
 */
export function getLightboxElements(document, open) {
  const lightboxElements = [];

  // Process all standalone elements into a lightbox.
  toArray(document.querySelectorAll(LIGHTBOX_ELIGIBLE_TAGS)).forEach(
    (element) => {
      if (element.hasAttribute(LIGHTBOX_ATTR)) {
        lightboxElements.push(
          processLightboxElement(DEFAULT_GROUP, document, element, open)
        );
      }
    }
  );

  // Process all lightboxed carousel elements into separate lightbox groups.
  toArray(document.querySelectorAll(LIGHTBOX_ELIGIBLE_GROUP_SELECTORS)).forEach(
    (element, index) => {
      const group =
        element.getAttribute(LIGHTBOX_ATTR) || DEFAULT_CAROUSEL_PREFIX + index;
      toArray(element.children).forEach((child, index) =>
        lightboxElements.push(
          processLightboxElement(group, document, child, open, index)
        )
      );
    }
  );

  return lightboxElements;
}

/**
 * @param {string} defaultGroup
 * @param {!Document} document
 * @param {Element} element
 * @param {function(number)} open
 * @param {number} opt_index
 * @return {PreactDef.Renderable}
 */
function processLightboxElement(
  defaultGroup,
  document,
  element,
  open,
  opt_index
) {
  const group = element.getAttribute(LIGHTBOX_ATTR) || defaultGroup;
  const img = isLightboxEligible(element)
    ? element
    : childElement(element, isLightboxEligible);
  return (
    <WithBentoLightboxGallery
      group={group}
      as="img"
      caption={getDescriptionForElement(document, img)}
      onMount={(index) => {
        const onClick = () => open(opt_index ?? index, group);
        element.addEventListener('click', onClick);
        return () => {
          element.removeEventListener('click', onClick);
        };
      }}
      srcset={srcsetFromElement(img).stringify()}
    />
  );
}

/**
 * @param {Element} element
 * @return {boolean}
 */
function isLightboxEligible(element) {
  return LIGHTBOX_ELIGIBLE_TAGS.indexOf(element.tagName) !== -1;
}

/**
 * @param {!Document} document
 * @param {Element} element
 * @return {string}
 */
function getDescriptionForElement(document, element) {
  // If the element in question is the descendant of a figure element
  // try using the figure caption as the lightbox description.
  const figureParent = closestAncestorElementBySelector(element, 'figure');
  if (figureParent) {
    const figCaption = elementByTag(figureParent, 'figcaption');
    if (figCaption) {
      return figCaption./*OK*/ textContent;
    }
  }
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  if (ariaDescribedBy) {
    const descriptionElement = document.getElementById(ariaDescribedBy);
    if (descriptionElement) {
      return descriptionElement./*OK*/ textContent;
    }
  }
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const descriptionElement = document.getElementById(ariaLabelledBy);
    if (descriptionElement) {
      return descriptionElement./*OK*/ innerText;
    }
  }
  return element.getAttribute('alt') ?? element.getAttribute('aria-label');
}
