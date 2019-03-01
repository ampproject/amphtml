// This file is executed via Puppeteer's page.evaluate on a document to remove
// all <script> tags that import AMP pages. This makes for cleaner diffs and
// prevents "double-execution" of AMP scripts when enableJavaScript=true.

for (const form of document.forms) {
  for (const formElement of form.elements) {
    switch (formElement.tagName) {
      case 'INPUT':
        // Need to update this? Look at
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#Properties
        // for inspiration.
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
        for (const optionElement of formElement.options) {
          if (optionElement.selected) {
            optionElement.setAttribute('selected', '');
          } else {
            optionElement.removeAttribute('selected');
          }
        }
        break;

      case 'TEXTAREA':
        formElement.textContent = formElement.value;
        break;
    }
  }
}
