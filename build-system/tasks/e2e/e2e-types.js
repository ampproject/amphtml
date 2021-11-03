/**
 * A wrapper class that allows client code to own references to
 * framework-specific element handles, but which does not expose any of the
 * framework-specific methods on that element.
 *
 * @template T
 * @public
 */
class ElementHandle {
  /**
   * Wrap the framework-specific element handle object.
   * @param {!T} element
   * @package
   */
  constructor(element) {
    /** @private */
    this.element_ = element;
  }

  /**
   * Unwrap the framework-specific element handle object.
   * @return {!T}
   * @package
   */
  getElement() {
    return this.element_;
  }
}

/**
 * Key codes used to trigger actions.
 * @enum {string}
 */
const Key = {
  'ArrowDown': 'ArrowDown',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',
  'ArrowUp': 'ArrowUp',
  'Backspace': 'Backspace',
  'Enter': 'Enter',
  'Escape': 'Escape',
  'Tab': 'Tab',
  'CtrlV': 'CtrlV',
};

/**
 * @typedef {{
 *   width: number,
 *   height: number
 * }} WindowRectDef
 */
let WindowRectDef;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number
 * }}
 */
let DOMRectDef;

/**
 * @typedef {{
 *   left: number,
 *   top: number,
 *   behavior: ScrollBehavior
 * }}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/ScrollToOptions}
 */
let ScrollToOptionsDef;

module.exports = {
  ElementHandle,
  Key,
  WindowRectDef,
  DOMRectDef,
  ScrollToOptionsDef,
};
