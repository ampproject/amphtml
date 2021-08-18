/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to copy the values of forms into their attributes, so that they will
 * be passed in the snapshots to Percy.
 */

for (const form of Array.from(document.forms)) {
  for (const element of Array.from(form.elements)) {
    switch (element.tagName) {
      case 'INPUT':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
        const formElement = /** @type {!HTMLInputElement} */ (element);
        switch (formElement.type) {
          case 'file':
          case 'hidden':
          case 'image':
            break;

          case 'checkbox':
          case 'radio':
            if (formElement.checked) {
              formElement.setAttribute('checked', '');
            } else {
              formElement.removeAttribute('checked');
            }
            break;

          default:
            formElement.setAttribute('value', formElement.value);
        }
        break;

      case 'SELECT':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
        const selectElement = /** @type {!HTMLSelectElement} */ (element);
        for (const optionElement of Array.from(selectElement.options)) {
          if (optionElement.selected) {
            optionElement.setAttribute('selected', '');
          } else {
            optionElement.removeAttribute('selected');
          }
        }
        break;

      case 'TEXTAREA':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement
        const textElement = /** @type {!HTMLTextAreaElement} */ (element);
        textElement.textContent = textElement.value;
        break;
    }
  }
}
