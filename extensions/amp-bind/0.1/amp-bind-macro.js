import {LayoutPriority_Enum} from '#core/dom/layout';

/**
 * The <amp-bind-macro> element is used to define an expression macro that can
 * be called from other amp-bind expressions within the document.
 */
export class AmpBindMacro extends AMP.BaseElement {
  /** @override */
  getLayoutPriority() {
    // Loads after other content.
    return LayoutPriority_Enum.METADATA;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element name is not unique.
   * @protected
   */
  getName_() {
    return (
      '<amp-bind-macro> ' + (this.element.getAttribute('id') || '<unknown id>')
    );
  }
}
