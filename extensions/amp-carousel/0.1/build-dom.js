import {isAmp4Email} from '#core/document/format';
import {isServerRendered} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {realChildElements} from '#core/dom/query';

export const _HAS_CONTROL_CLASS = 'i-amphtml-carousel-has-controls';

/**
 * @enum {string}
 */
const ClassNames = {
  PREV_BUTTON: 'amp-carousel-button-prev',
  NEXT_BUTTON: 'amp-carousel-button-next',
  SLIDES_CONTAINER: 'i-amphtml-slides-container',
  SCROLLABLE_CONTAINER: 'i-amphtml-scrollable-carousel-container',
  SLIDE: 'amp-carousel-slide',
  SLIDE_WRAPPER: 'i-amphtml-slide-item',
};

/**
 * Builds a carousel button for next/prev.
 * @param {!Element} element
 * @param {'prev' | 'next'} type
 * @return {?HTMLDivElement}
 */
function buildButton(element, type) {
  const className =
    type === 'prev' ? ClassNames.PREV_BUTTON : ClassNames.NEXT_BUTTON;
  const title =
    type === 'prev' ? getPrevButtonTitle(element) : getNextButtonTitle(element);

  /**
   * In scrollable carousel, the next/previous buttons add no functionality
   * for screen readers as scrollable carousel is just a horizontally
   * scrollable div which ATs navigate just like any other content.
   * To avoid confusion, we therefore set the role to presentation for the
   * controls in this case.
   */
  const ariaRole = getType(element) === 'slides' ? 'button' : 'presentation';

  const button = element.ownerDocument.createElement('div');
  button.setAttribute('tabindex', '0');
  button.classList.add('amp-carousel-button');
  button.classList.add(className);
  button.setAttribute('role', ariaRole);
  button.setAttribute('title', title);
  element.appendChild(button);

  return button;
}

/**
 * Builds the DOM necessary for amp-carousel.
 * @param {!Element} element
 * @return {{
 *   prevButton: !HTMLDivElement,
 *   nextButton: !HTMLDivElement
 * }}
 */
export function buildCarouselControls(element) {
  if (isServerRendered(element)) {
    return queryCarouselControlsDom(element);
  }

  const doc = element.ownerDocument;
  if (isAmp4Email(doc) || element.hasAttribute('controls')) {
    element.classList.add(_HAS_CONTROL_CLASS);
  }

  const prevButton = buildButton(element, 'prev');
  const nextButton = buildButton(element, 'next');

  return {prevButton, nextButton};
}

/**
 * Builds the DOM necessary for scrollable carousel.
 * @param {!Element} element
 * @return {{
 *   container: !HTMLDivElement
 *   cells: !HTMLDivElement[]
 * }}
 */
function buildScrollableCarousel(element) {
  if (isServerRendered(element)) {
    return queryScrollableCarousel(element);
  }

  const doc = element.ownerDocument;
  const cells = realChildElements(element);
  const container = doc.createElement('div');

  container.classList.add(ClassNames.SCROLLABLE_CONTAINER);
  // Focusable container makes it possible to fully consume Arrow key events.
  container.setAttribute('tabindex', '-1');
  element.appendChild(container);
  cells.forEach((cell) => {
    cell.classList.add(ClassNames.SLIDE);
    cell.classList.add('amp-scrollable-carousel-slide');
    container.appendChild(cell);
  });

  return {cells, container};
}

/**
 * Queries for ivars for scrollable carousel.
 * @param {!Element} element
 * @return {{
 *   container: !HTMLDivElement
 *   cells: !HTMLDivElement[]
 * }}
 */
function queryScrollableCarousel(element) {
  const container = /** @type {!HTMLDivElement} */ (
    element.querySelector(
      `./${escapeCssSelectorIdent(ClassNames.SCROLLABLE_CONTAINER)}`
    )
  );
  const cells = /** @type {!HTMLDivElement[]} */ (
    Array.from(
      element.querySelectorAll(`./${escapeCssSelectorIdent(ClassNames.SLIDE)}`)
    )
  );
  return {container, cells};
}

/**
 * Builds the DOM necessary for slidescroll carousel.
 * @param {!Element} element
 * @return {{
 *   slides: !HTMLDivElement[]
 *   slidesContainer: !HTMLDivElement
 *   slideWrappers: !HTMLDivElement[]
 * }}
 */
function buildSlideScroll(element) {
  if (isServerRendered(element)) {
    return querySlideScrollCarousel(element);
  }
  const doc = element.ownerDocument;
  const slides = realChildElements(element);
  element.classList.add('i-amphtml-slidescroll');

  const slidesContainer = doc.createElement('div');
  // Focusable container makes it possible to fully consume Arrow key events.
  slidesContainer.setAttribute('tabindex', '-1');
  slidesContainer.classList.add(ClassNames.SLIDES_CONTAINER);
  // Let screen reader know that this is a live area and changes
  // to it (such after pressing next) should be announced to the
  // user.
  slidesContainer.setAttribute('aria-live', 'polite');
  element.appendChild(slidesContainer);

  const slideWrappers = [];
  slides.forEach((slide) => {
    slide.classList.add(ClassNames.SLIDE);

    const slideWrapper = doc.createElement('div');
    slideWrapper.classList.add(ClassNames.SLIDE_WRAPPER);
    slideWrapper.appendChild(slide);
    slidesContainer.appendChild(slideWrapper);
    slideWrappers.push(slideWrapper);
  });

  return {slidesContainer, slides, slideWrappers};
}

/**
 * Queries for ivars for slidescroll.
 * @param {!Element} element
 * @return {{
 *   slides: !HTMLDivElement[]
 *   slidesContainer: !HTMLDivElement
 *   slideWrappers: !HTMLDivElement[]
 * }}
 */
function querySlideScrollCarousel(element) {
  const slidesContainer = /** @type {!HTMLDivElement} */ (
    element.querySelector(
      `./${escapeCssSelectorIdent(ClassNames.SLIDES_CONTAINER)}`
    )
  );
  const slideWrappers = /** @type {!HTMLDivElement[]} */ (
    Array.from(
      element.querySelectorAll(
        `./${escapeCssSelectorIdent(ClassNames.SLIDE_WRAPPER)}`
      )
    )
  );
  const slides = /** @type {!HTMLDivElement[]} */ (
    Array.from(
      element.querySelectorAll(`./${escapeCssSelectorIdent(ClassNames.SLIDE)}`)
    )
  );
  return {slides, slidesContainer, slideWrappers};
}

/**
 * Builds the DOM necessary for slidescroll carousel.
 * @param {!Element} element
 * @return {{
 *   prevButton: !HTMLDivElement,
 *   nextButton: !HTMLDivElement
 *   container?: !HTMLDivElement
 *   cells?: !HTMLDivElement[]
 *   slides?: !HTMLDivElement[]
 *   slidesContainer?: !HTMLDivElement
 *   slideWrappers?: !HTMLDivElement[]
 * }}
 */
export function buildDom(element) {
  const type = getType(element);
  const specificDom =
    type == 'slides'
      ? buildSlideScroll(element)
      : buildScrollableCarousel(element);
  const controlsDom = buildCarouselControls(element);

  return {...controlsDom, ...specificDom};
}

/**
 * Queries for all of the necessary DOM Elements to assign to ivars
 * @param {!Element} element
 * @return {{
 *   prevButton: !HTMLDivElement,
 *   nextButton: !HTMLDivElement
 * }}
 */
export function queryCarouselControlsDom(element) {
  const prevButton = /** @type {!HTMLDivElement} */ (
    element.querySelector(`./${escapeCssSelectorIdent(ClassNames.PREV_BUTTON)}`)
  );
  const nextButton = /** @type {!HTMLDivElement} */ (
    element.querySelector(`./${escapeCssSelectorIdent(ClassNames.NEXT_BUTTON)}`)
  );

  return {prevButton, nextButton};
}

/**
 * @param {!Element} element
 * @return {string} The default title to use for the next button.
 */
export function getNextButtonTitle(element) {
  return (
    element.getAttribute('data-next-button-aria-label') ||
    'Next item in carousel'
  );
}

/**
 * @param {!Element} element
 * @return {string} The default title to use for the pevious button.
 */
export function getPrevButtonTitle(element) {
  return (
    element.getAttribute('data-prev-button-aria-label') ||
    'Previous item in carousel'
  );
}

/**
 * @param {!Element} element
 * @return {'slides' | 'scroll'}
 */
export function getType(element) {
  if (element.getAttribute('type') == 'slides') {
    return 'slides';
  }
  return 'scroll';
}
