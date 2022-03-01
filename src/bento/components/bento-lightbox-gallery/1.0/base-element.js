import {CSS as CAROUSEL_CSS} from '#bento/components/bento-base-carousel/1.0/component.jss';
import {CSS as LIGHTBOX_CSS} from '#bento/components/bento-lightbox/1.0/component.jss';

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
import {PreactBaseElement} from '#preact/base-element';

import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

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

export class BaseElement extends PreactBaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  mountCallback() {
    // There should only be one instance of `amp-lightbox-gallery` in a document.
    if (count++) {
      console /*OK */
        .warn(
          `${this.element.tagName} already exists in the document. Removing additional instance: ${this.element}`
        );
      this.element.parentNode?.removeChild(this.element);
    }
  }

  /** @override */
  init() {
    const lightboxElements = getLightboxElements(
      this.element.ownerDocument,
      (opt_index, opt_group) => this.api().open(opt_index, opt_group)
    );
    return {
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
      'onViewGrid': () => this.onViewGrid(),
      'onToggleCaption': () => this.onToggleCaption(),
      'render': () => lightboxElements,
    };
  }

  /** @override */
  unmountCallback() {
    count--;
  }

  /** @protected */
  beforeOpen() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @protected */
  afterOpen() {}

  /** @protected */
  afterClose() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);
  }

  /** @protected */
  onViewGrid() {}

  /** @protected */
  onToggleCaption() {}

  /** @override */
  mutationObserverCallback() {
    const open = this.element.hasAttribute('open');
    if (open === this.open_) {
      return;
    }
    this.open_ = open;
    open ? this.api().open() : this.api().close();
  }
}

/**
 * @param {!Document} document
 * @param {function(number)} open
 * @return {!Array<PreactDef.Renderable>}
 */
function getLightboxElements(document, open) {
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

/** @override */
BaseElement['Component'] = BentoLightboxGalleryProvider;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS + LIGHTBOX_CSS + CAROUSEL_CSS;
