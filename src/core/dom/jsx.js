/**
 * @fileoverview
 * Minimal implementation of JSX that outputs DOM nodes.
 *
 * Usage:
 *   import * as Preact from '#core/dom/jsx';
 *
 * This library is nicer than templates in bundles that do not include Preact,
 * but it does not attempt to implement JSX fully.
 *
 * These features are omitted for the sake of bundle size:
 *
 * 🚫 Attribute names are not re-mapped.
 *   - Use standard HTML attribute names on elements (`class`, not `className`).
 *   - Dashes are ok, like `data-foo="bar"`.
 *
 * 🚫 No objects in attribute values, like `style={{width: 40}}`
 *   - For `style`, use strings instead.
 *   - For `class`, call `objstr()` or use strings instead.
 *
 * 🚫 No Fragments
 *   - Instead use a root node, or split into an array of nodes.
 *
 * 🚫 No dangerouslySetInnerHTML
 *   - You should not do this anyway.
 *
 * 🚫 No SVG <foreignObject>
 *   - This tag is rather obscure. You should be able to restructure your tree.
 *     If you absolutely need it, get in touch with `@alanorozco` to consider
 *     enabling support.
 */
import {devAssert} from '#core/assert';

/**
 * @typedef {Node|Object|string|number|bigint|boolean|null|undefined}
 */
let DomJsxChildDef;

/**
 * @param {Element} parent
 * @param {DomJsxChildDef|Array<DomJsxChildDef>} child
 */
function appendChild(parent, child) {
  if (!!child === child || child == null) {
    return;
  }
  if (Array.isArray(child)) {
    const children = /** @type {Array<DomJsxChildDef>} */ (child);
    children.forEach((child) => {
      appendChild(parent, child);
    });
    return;
  }
  const maybeNode = /** @type {Node} */ (child);
  parent.appendChild(
    maybeNode.nodeType ? maybeNode : self.document.createTextNode(String(child))
  );
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 */
function setAttribute(element, name, value) {
  if (value === false || value == null) {
    return;
  }
  if (typeof value === 'function' && name[0] === 'o' && name[1] === 'n') {
    const eventName = name.toLowerCase().substr(2);
    element.addEventListener(eventName, value);
    return;
  }
  element.setAttribute(name, value === true ? '' : String(value));
}

/**
 * @param {string | (function(*): Element)} tag
 * @param {Object<string, *>} props
 * @param {...*} children
 * @return {Element}
 */
export function createElement(tag, props, ...children) {
  if (typeof tag !== 'string') {
    return tag({...props, children});
  }
  // We expect all SVG-related tags to have `xmlns` set during build time.
  // See babel-plugin-dom-jsx-svg-namespace
  const xmlns = props?.['xmlns'];
  if (xmlns) {
    delete props['xmlns'];
  }
  const element = xmlns
    ? self.document.createElementNS(xmlns, tag)
    : self.document.createElement(tag);
  appendChild(element, children);
  if (props) {
    Object.keys(props).forEach((name) => {
      setAttribute(element, name, props[name]);
    });
  }
  return element;
}

/**
 * @return {null}
 */
export function Fragment() {
  devAssert(
    null,
    "Don't use Fragment (<></>) with #core/dom/jsx. " +
      'Use a root node or an array of nodes instead.'
  );
  return null;
}
