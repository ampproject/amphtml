export {};

declare global {
  interface HTMLElement {
    // Used by modal.js to keep track of the saved tab on an element.
    '__AMP_MODAL_SAVED_TAB_INDEX'?: string | null;

    // Used by form.js
    '__AMP_FORM': HTMLFormElement;
  }
}
