import * as Preact from '#core/dom/jsx';

/** @const {string} */
const SPINNER_ACTIVE_ATTRIBUTE = 'active';

/** @return {!Element} */
export const renderLoadingSpinner = () => (
  <div class="i-amphtml-story-spinner" aria-hidden="true">
    <div class="i-amphtml-story-spinner-container">
      <div class="i-amphtml-story-spinner-layer">
        <div class="i-amphtml-story-spinner-circle-clipper left" />
        <div class="i-amphtml-story-spinner-circle-clipper right" />
      </div>
    </div>
  </div>
);

/**
 * @param {Element} element
 * @param {boolean} isActive
 * @return {Element}
 */
export function toggleLoadingSpinner(element, isActive) {
  if (isActive !== element.hasAttribute(SPINNER_ACTIVE_ATTRIBUTE)) {
    if (isActive) {
      element.setAttribute(SPINNER_ACTIVE_ATTRIBUTE, '');
      element.setAttribute('aria-hidden', 'false');
    } else {
      element.removeAttribute(SPINNER_ACTIVE_ATTRIBUTE);
      element.setAttribute('aria-hidden', 'true');
    }
  }
  return element;
}
