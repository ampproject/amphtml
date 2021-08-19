/**
 * Creates a ShadowRoot for a given Element with some style text. This also
 * tags the first sizer element found with a slot, which is placed at the top
 * level of the ShadowRoot.
 * @param {!Element} element An Element to create a ShadowRoot for.
 * @param {string} styleText The style text for the ShadowRoot.
 * @param {!Element} content The content of the shadowRoot.
 * @return {*} TODO(#23582): Specify return type
 */
export function createShadowRoot(element, styleText, content) {
  // TODO(sparhami) Where is the right place to put this? Runtime? What about
  // SSR?
  const sizer = element.querySelector('i-amphtml-sizer');
  if (sizer) {
    sizer.setAttribute('slot', 'i-amphtml-sizer');
  }

  // TODO(sparhami) Is there a shared place to add logic for creating
  // shadow roots with styles? Might make sense to have it create the style
  // as well as a slot for the sizer.
  const shadowRoot = element.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = styleText;
  const sizerSlot = document.createElement('slot');
  sizerSlot.setAttribute('name', 'i-amphtml-sizer');

  shadowRoot.appendChild(style);
  shadowRoot.appendChild(sizerSlot);
  shadowRoot.appendChild(content);

  return shadowRoot;
}
