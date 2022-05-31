import {isElement} from '#core/types';

import {Services} from '#service';

import {dev} from '#utils/log';

/**
 * The interface that is implemented by all templates.
 * @abstract
 */
export class BaseTemplate {
  /**
   * @param {!Element} element
   * @param {!Window} win
   */
  constructor(element, win) {
    /** @public @const */
    this.element = element;

    /** @public @const {!Window} */
    this.win = element.ownerDocument.defaultView || win;

    /** @private @const */
    this.viewer_ = Services.viewerForDoc(this.element);

    this.compileCallback();
  }

  /**
   * Override in subclass if the element needs to compile the template.
   * @protected
   */
  compileCallback() {
    // Subclasses may override.
  }

  /**
   * Bypasses template rendering and directly sets HTML. Should only be used
   * for server-side rendering case. To be implemented by subclasses.
   * @param {string} unusedData
   * @return {!Element|!Array<Element>}
   * @abstract
   */
  setHtml(unusedData) {}

  /**
   * To be implemented by subclasses.
   * @param {!JsonObject|string} unusedData
   * @return {!Element}
   * @abstract
   */
  render(unusedData) {}

  /**
   * To be implemented by subclasses.
   * @param {!JsonObject|string} unusedData
   * @return {string}
   * @abstract
   */
  renderAsString(unusedData) {}

  /**
   * Iterate through the child nodes of the given root, applying the
   * given callback to non-empty text nodes and elements.
   * @param {!Element} root
   * @param {function((!Element|string))} callback
   */
  visitChildren_(root, callback) {
    for (let n = root.firstChild; n != null; n = n.nextSibling) {
      if (n.nodeType == /* TEXT */ 3) {
        const text = n.textContent.trim();
        if (text) {
          callback(text);
        }
      } else if (n.nodeType == /* COMMENT */ 8) {
        // Ignore comments.
      } else if (isElement(n)) {
        callback(dev().assertElement(n));
      }
    }
  }

  /**
   * Unwraps the root element. If root has a single element child,
   * returns the child. Otherwise, returns root.
   * @param {!Element} root
   * @return {!Element}
   * @protected @final
   */
  tryUnwrap(root) {
    let onlyChild;
    this.visitChildren_(root, (c) => {
      if (onlyChild === undefined && c.nodeType) {
        onlyChild = c;
      } else {
        onlyChild = null;
      }
    });
    return onlyChild || root;
  }

  /**
   * Unwraps the root element and returns any children in an array.
   * Text node children are normalized inside a <div>.
   * @param {!Element} root
   * @return {!Array<!Element>}
   * @protected @final
   */
  unwrapChildren(root) {
    const children = [];
    this.visitChildren_(root, (c) => {
      if (typeof c == 'string') {
        const element = this.win.document.createElement('div');
        element.textContent = c;
        children.push(element);
      } else {
        children.push(c);
      }
    });
    return children;
  }

  /**
   * @protected @final
   * @return {boolean}
   */
  viewerCanRenderTemplates() {
    return this.viewer_.hasCapability('viewerRenderTemplate');
  }
}
