import {isAmp4Email} from '#core/document/format';
import {isServerRendered} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {realChildElements} from '#core/dom/query';

/**
 * @enum {string}
 */
export const ClassNames = {
  // Carousel Controls
  BUTTON: 'amp-carousel-button',
  PREV_BUTTON: 'amp-carousel-button-prev',
  NEXT_BUTTON: 'amp-carousel-button-next',
  HAS_CONTROL: 'i-amphtml-carousel-has-controls',
  CONTROL_HIDE_ATTRIBUTE: 'i-amphtml-carousel-hide-buttons',

  // Generic
  SLIDE: 'amp-carousel-slide',
  SHOW_SLIDE: 'amp-carousel-slide',

  // SlideScroll Carousel
  SLIDESCROLL_CAROUSEL: 'i-amphtml-slidescroll',
  SLIDE_WRAPPER: 'i-amphtml-slide-item',
  SLIDES_CONTAINER: 'i-amphtml-slides-container',
  SLIDES_CONTAINER_NOSNAP: 'i-amphtml-slidescroll-no-snap',
  SLIDES_ITEM_SHOW: 'i-amphtml-slide-item-show',

  // Scrollable Carousel
  SCROLLABLE_CONTAINER: 'i-amphtml-scrollable-carousel-container',
  SCROLLABLE_SLIDE: 'amp-scrollable-carousel-slide',
};

/**
 * Throws if any provided param is not truthy.
 */
function assertDomQueryResults() {
  for (let i = 0; i < arguments.length; i++) {
    if (!arguments[i]) {
      throw new Error('Invalid server render');
    }
  }
}

/**
 * Builds a carousel button for next/prev.
 * @param {Element} element
 * @param {{className: string, title: string, enabled: boolean}} options
 * @return {HTMLDivElement}
 */
function buildButton(element, {className, enabled, title}) {
  /*
   * In scrollable carousel, the next/previous buttons add no functionality
   * for screen readers as scrollable carousel is just a horizontally
   * scrollable div which ATs navigate just like any other content.
   * To avoid confusion, we therefore set the role to presentation for the
   * controls in this case.
   */
  const ariaRole = isScrollable(element) ? 'presentation' : 'button';

  const button = element.ownerDocument.createElement('div');
  button.setAttribute('tabindex', '0');
  button.classList.add(ClassNames.BUTTON, className);
  button.setAttribute('role', ariaRole);
  button.setAttribute('title', title);
  setButtonState(button, enabled);
  element.appendChild(button);
  return button;
}

/**
 *
 * @param {HTMLDivElement} button
 * @param {boolean} enabled
 */
export function setButtonState(button, enabled) {
  button.classList.toggle('amp-disabled', !enabled);
  button.setAttribute('aria-disabled', String(!enabled));
  button.setAttribute('tabindex', String(enabled ? 0 : -1));
}

/**
 * Builds the DOM necessary for amp-carousel.
 * @param {Element} element
 * @param {number} slideCount
 * @return {{
 *   prevButton: HTMLDivElement,
 *   nextButton: HTMLDivElement
 * }}
 */
export function buildCarouselControls(element, slideCount) {
  if (isServerRendered(element)) {
    return queryCarouselControls(element);
  }

  const doc = element.ownerDocument;
  if (isAmp4Email(doc) || element.hasAttribute('controls')) {
    element.classList.add(ClassNames.HAS_CONTROL);
  }

  const hasLoop = element.hasAttribute('loop');
  const prevIndex = hasLoop ? slideCount : 0;
  const nextIndex = slideCount > 1 ? 2 : hasLoop ? 0 : 1;
  const prevButton = buildButton(element, {
    className: ClassNames.PREV_BUTTON,
    title: getPrevButtonTitle(element, {
      index: String(prevIndex),
      total: String(slideCount),
    }),
    enabled: element.hasAttribute('loop'),
  });
  const nextButton = buildButton(element, {
    className: ClassNames.NEXT_BUTTON,
    title: getNextButtonTitle(element, {
      index: String(nextIndex),
      total: String(slideCount),
    }),
    enabled: slideCount > 1,
  });
  return {prevButton, nextButton};
}

/**
 * Queries for all of the necessary DOM Elements to assign to ivars
 * @param {Element} element
 * @return {{
 *   prevButton: HTMLDivElement,
 *   nextButton: HTMLDivElement
 * }}
 */
export function queryCarouselControls(element) {
  const prevButton = /** @type {HTMLDivElement} */ (
    element.querySelector(`.${escapeCssSelectorIdent(ClassNames.PREV_BUTTON)}`)
  );
  const nextButton = /** @type {HTMLDivElement} */ (
    element.querySelector(`.${escapeCssSelectorIdent(ClassNames.NEXT_BUTTON)}`)
  );
  assertDomQueryResults(prevButton, nextButton);
  return {prevButton, nextButton};
}

/**
 * Builds the DOM necessary for scrollable carousel.
 * @param {Element} element
 * @return {{
 *   container: HTMLDivElement
 *   cells: HTMLElement[]
 * }}
 */
function buildScrollableCarousel(element) {
  if (isServerRendered(element)) {
    return queryScrollableCarousel(element);
  }

  const doc = element.ownerDocument;
  const cells = /** @type {HTMLElement[]} */ (realChildElements(element));
  const container = doc.createElement('div');

  container.classList.add(ClassNames.SCROLLABLE_CONTAINER);
  // Focusable container makes it possible to fully consume Arrow key events.
  container.setAttribute('tabindex', '-1');
  element.appendChild(container);
  cells.forEach((cell) => {
    cell.classList.add(ClassNames.SLIDE, ClassNames.SCROLLABLE_SLIDE);
    container.appendChild(cell);
  });

  return {cells, container};
}

/**
 * Queries for ivars for scrollable carousel.
 * @param {Element} element
 * @return {{
 *   container: HTMLDivElement
 *   cells: HTMLElement[]
 * }}
 */
function queryScrollableCarousel(element) {
  const container = /** @type {HTMLDivElement} */ (
    element.querySelector(
      `.${escapeCssSelectorIdent(ClassNames.SCROLLABLE_CONTAINER)}`
    )
  );
  const cells = /** @type {HTMLElement[]} */ (
    Array.from(
      element.querySelectorAll(`.${escapeCssSelectorIdent(ClassNames.SLIDE)}`)
    )
  );
  assertDomQueryResults(container, cells);
  return {container, cells};
}

/**
 * Builds the DOM necessary for slidescroll carousel.
 * @param {Element} element
 * @return {{
 *   slides: Element[]
 *   slidesContainer: HTMLDivElement
 *   slideWrappers: HTMLDivElement[]
 * }}
 */
function buildSlideScrollCarousel(element) {
  if (isServerRendered(element)) {
    return querySlideScrollCarousel(element);
  }
  const doc = element.ownerDocument;
  const slides = realChildElements(element);
  element.classList.add(ClassNames.SLIDESCROLL_CAROUSEL);

  const slidesContainer = doc.createElement('div');
  // Focusable container makes it possible to fully consume Arrow key events.
  slidesContainer.setAttribute('tabindex', '-1');
  slidesContainer.classList.add(
    ClassNames.SLIDES_CONTAINER,
    ClassNames.SLIDES_CONTAINER_NOSNAP
  );
  // Let screen reader know that this is a live area and changes
  // to it (such after pressing next) should be announced to the
  // user.
  slidesContainer.setAttribute('aria-live', 'polite');
  element.appendChild(slidesContainer);

  /** @type {HTMLDivElement[]} */
  const slideWrappers = [];
  slides.forEach((slide) => {
    slide.classList.add(ClassNames.SLIDE);

    const slideWrapper = doc.createElement('div');
    slideWrapper.classList.add(ClassNames.SLIDE_WRAPPER);
    slideWrapper.appendChild(slide);
    slidesContainer.appendChild(slideWrapper);
    slideWrappers.push(slideWrapper);
  });
  // Initialize the first slide to be shown.
  slideWrappers[0]?.classList.add(ClassNames.SLIDES_ITEM_SHOW);

  return {slidesContainer, slides, slideWrappers};
}

/**
 * Queries for ivars for slidescroll.
 * @param {Element} element
 * @return {{
 *   slides: Element[]
 *   slidesContainer: HTMLDivElement
 *   slideWrappers: HTMLDivElement[]
 * }}
 */
function querySlideScrollCarousel(element) {
  const slidesContainer = /** @type {HTMLDivElement} */ (
    element.querySelector(
      `.${escapeCssSelectorIdent(ClassNames.SLIDES_CONTAINER)}`
    )
  );
  const slideWrappers = /** @type {HTMLDivElement[]} */ (
    Array.from(
      element.querySelectorAll(
        `.${escapeCssSelectorIdent(ClassNames.SLIDE_WRAPPER)}`
      )
    )
  );
  const slides = Array.from(
    element.querySelectorAll(`.${escapeCssSelectorIdent(ClassNames.SLIDE)}`)
  );
  assertDomQueryResults(slidesContainer, slideWrappers, slides);
  return {slides, slidesContainer, slideWrappers};
}

/**
 * Builds the DOM necessary for slidescroll carousel.
 * @param {Element} element
 * @return {{
 *   prevButton: HTMLDivElement,
 *   nextButton: HTMLDivElement
 *   container?: HTMLDivElement
 *   cells?: HTMLElement[]
 *   slides?: Element[]
 *   slidesContainer?: HTMLDivElement
 *   slideWrappers?: HTMLDivElement[]
 * }}
 */
export function buildDom(element) {
  const slideCount = realChildElements(element).length;
  const slidesDom = isScrollable(element)
    ? buildScrollableCarousel(element)
    : buildSlideScrollCarousel(element);
  const controlsDom = buildCarouselControls(element, slideCount);

  return {...controlsDom, ...slidesDom};
}

/**
 * @param {Element} element
 * @return {string} The default title to use for the next button.
 * @param {{index: string, total: string}} options - The default title to use for the previous button.
 */
export function getNextButtonTitle(element, options) {
  const prefix =
    element.getAttribute('data-next-button-aria-label') ||
    'Next item in carousel';
  const {index, total} = options;
  return getButtonTitle(element, {prefix, index, total});
}

/**
 * @param {Element} element
 * @param {{index: string, total: string}} options - The default title to use for the previous button.
 * @return {string} The default title to use for the previous button.
 */
export function getPrevButtonTitle(element, options) {
  const prefix =
    element.getAttribute('data-prev-button-aria-label') ||
    'Previous item in carousel';
  const {index, total} = options;
  return getButtonTitle(element, {prefix, index, total});
}

/**
 * Returns the title for a next or prev button.
 * Format:
 * - Scrollable: "Next item in carousel"
 * - Slides    : "Next item in carousel (X of Y)"
 *
 * @param {Element} element
 * @param {{prefix: string, index: string, total:string}} opts
 * @return {string}
 */
function getButtonTitle(element, {index, prefix, total}) {
  if (isScrollable(element)) {
    return prefix;
  }

  /**
   * A format string for the button label. Should be a string, containing two
   * placeholders of "%s", where the index and total count will go.
   * @type {string}
   */
  const suffixFormat =
    element.getAttribute('data-button-count-format') || '(%s of %s)';
  const suffix = suffixFormat.replace('%s', index).replace('%s', total);

  return `${prefix} ${suffix}`;
}

/**
 * Returns true if the carousel is a Scrollable Carousel.
 * @param {Element} element
 * @return {boolean}
 */
export function isScrollable(element) {
  return element.getAttribute('type') !== 'slides';
}
