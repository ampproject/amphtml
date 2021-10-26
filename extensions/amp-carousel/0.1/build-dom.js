import {isAmp4Email} from '#core/document/format';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';

export const _HAS_CONTROL_CLASS = 'i-amphtml-carousel-has-controls';

/**
 * @enum {string}
 */
const ClassNames = {
  PREV_BUTTON: 'amp-carousel-button-prev',
  NEXT_BUTTON: 'amp-carousel-button-next',
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

  const button = element.ownerDocument.createElement('div');
  button.setAttribute('tabindex', '0');
  button.classList.add('amp-carousel-button');
  button.classList.add(className);
  button.setAttribute('role', this.ariaRole_);
  button.setAttribute('title', title);
  element.appendChild(button);

  return button;
}

/**
 * Builds the DOM necessary for amp-carousel.
 * @param {!Element} element
 * @return {{prevButton: !HTMLDivElement, nextButton: !HTMLDivElement}}
 */
export function buildDom(element) {
  const doc = element.ownerDocument;
  if (isAmp4Email(doc) || element.hasAttribute('controls')) {
    this.element_.classList.add(_HAS_CONTROL_CLASS);
  }

  const prevButton = buildButton(element, 'prev');
  const nextButton = buildButton(element, 'next');

  return {prevButton, nextButton};
}

/**
 * Queries for all of the necessary DOM Elements to assign to ivars
 * @param {!Element} element
 * @return {{prevButton: !HTMLDivElement, nextButton: !HTMLDivElement}}
 */
export function queryDom(element) {
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
