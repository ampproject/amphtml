/**
 * A `WeakRef` polyfill that works for DOM Elements only.
 *
 * NOTE, and this is a big NOTE, that the fallback implementation fails to
 * `deref` an element if it is no longer in the respective document.
 * Technically it could still be around, but for the purpose of this class
 * we assume that the element is not longer reachable.
 */
export class DomBasedWeakRef {
  /**
   * @param {Window} win
   * @param {string} id
   * @package
   */
  constructor(win, id) {
    this.win = win;
    /** @private @const */
    this.id_ = id;
  }

  /**
   * Returns a WeakRef. Uses this implementation if the real WeakRef class
   * is not available.
   * @param {Window} win
   * @param {Element} element
   * @return {WeakRef<Element>|DomBasedWeakRef}
   */
  static make(win, element) {
    if (win.WeakRef) {
      return new win.WeakRef(element);
    }
    if (!element.id) {
      const index = (win.__AMP_WEAKREF_ID = (win.__AMP_WEAKREF_ID || 0) + 1);
      element.id = 'weakref-id-' + index;
    }
    return new DomBasedWeakRef(win, element.id);
  }

  /** @return {Element|undefined} */
  deref() {
    return this.win.document.getElementById(this.id_) || undefined;
  }
}
