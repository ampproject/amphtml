import { ReadyState_Enum } from "#core/constants/ready-state";

export {};

declare global {
  interface Window {
    __AMP_SHADOW_CSS?: null | {[key: string]: CSSStyleSheet};
  }

  // An interface for elements with pause functionality, such as media players.
  interface IPausable {
    pause: () => void;
  }

  // AMP element skeleton interface to support type-checking core code which
  // depends upon it.
  // TODO(wg-performance, wg-infra): Consider either a) splitting anything
  // dependent on the `AmpElement`` type out of #core or b) splitting the
  // `AmpElement` interface into a collection of independent interfaces (ex.
  // `Pausable`, `Scrollable`, `IdkAble``) so #core code can operate around those
  // expectations rather than the catch-all AMP-specific `AmpElement` class. This
  // is already done with the `IPausable` interface.
  interface AmpElement extends HTMLElement, IPausable {
    readyState: ReadyState_Enum;
    sizerElement?: HTMLElement;

    getPlaceholder: () => null | Element;

    unmount: () => Promise<void>;
    ensureLoaded: () => Promise<void>;
  }

  interface AmpForm {}

  interface HTMLElement {
    __AMP_UPG_PRM?: Promise<AmpElement>;
    __AMP_UPG_RES?: (res: Function) => void;

    // Used by modal.js to keep track of the saved tab on an element.
    __AMP_MODAL_SAVED_TAB_INDEX?: string | null;

    // Used by extensions/amp-form/0.1 and src/core/form.js.
    // TODO(wg-performance): move to extensions/amp-form, as it is the only consumer.
    __AMP_FORM: AmpForm;
  }
}
