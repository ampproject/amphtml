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
 */
import {devAssert} from '#core/assert';

/**
 * @param {!Element} parent
 * @param {*} child
 */
function appendChild(parent, child) {
  if (!child && child !== 0) {
    return;
  }
  if (Array.isArray(child)) {
    child.forEach((nestedChild) => {
      appendChild(parent, nestedChild);
    });
  } else {
    parent.appendChild(
      child.nodeType ? child : self.document.createTextNode(child)
    );
  }
}

/**
 * @param {string|function(T):!Element} tag
 * @param {T} props
 * @param {...*} children
 * @return {!Element}
 * @template T
 */
export function createElement(tag, props, ...children) {
  if (typeof tag !== 'string') {
    return tag(children?.length ? {...props, children} : props);
  }

  const element = self.document.createElement(tag);
  children.forEach((child) => {
    appendChild(element, child);
  });

  if (props) {
    Object.keys(props).forEach((name) => {
      const value = props[name];
      if (name.startsWith('on') && name.length > 2) {
        element.addEventListener(name.toLowerCase().substr(2), value);
        return;
      }
      if (value !== false && value != null) {
        element.setAttribute(name, value === true ? '' : value.toString());
      }
    });
  }

  return element;
}

/** */
export function Fragment() {
  devAssert(
    false,
    "Don't use Fragment (<></>) with jsx-dom. " +
      'Use a root node or an array of nodes instead.'
  );
}
