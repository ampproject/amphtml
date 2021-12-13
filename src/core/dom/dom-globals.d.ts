export {};

declare global {
  interface HTMLElement {
    // Used by modal.js to keep track of the saved tab on an element.
    '__AMP_MODAL_SAVED_TAB_INDEX'?: string | null;

    // Used by extensions/amp-form/0.1 and src/core/form.js.
    // TODO: move to extensions/amp-form, as it is the only consumer.
    '__AMP_FORM': AmpForm;
  }

  interface AmpForm {}
}
