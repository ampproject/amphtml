export {};

declare global {
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
    sizerElement?: HTMLElement;

    getPlaceholder: () => null | Element;
  }
}
