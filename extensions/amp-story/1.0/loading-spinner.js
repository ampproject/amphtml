import * as Preact from '#core/dom/jsx';

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
  if (isActive !== element.hasAttribute('active')) {
    element.setAttribute('aria-hidden', String(!isActive));
    if (isActive) {
      element.setAttribute('active', '');
    } else {
      element.removeAttribute('active');
    }
  }
  return element;
}
