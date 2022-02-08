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
 * 🚫 No objects in attribute values, like `class={{foo: true, bar: false}}`
 *   - Objects in `style` are ok. They're converted to strings during build time.
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

type Tag = string | ((props: Props) => Element);
type Props = {[string: string]: any} | null | undefined;
type Child =
  | Child[]
  | Node
  | Object
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

function appendChild(parent: Element, child: Child) {
  if (!!child === child || child == null) {
    return;
  }
  if (Array.isArray(child)) {
    child.forEach((child) => {
      appendChild(parent, child);
    });
    return;
  }
  const maybeNode = child as Node;
  parent.appendChild(
    maybeNode.nodeType ? maybeNode : self.document.createTextNode(String(child))
  );
}

function setAttribute(element: Element, name: string, value: any) {
  if (value === false || value == null) {
    return;
  }
  if (typeof value === 'function' && name[0] === 'o' && name[1] === 'n') {
    const eventName = name.toLowerCase().substring(2);
    element.addEventListener(eventName, value);
    return;
  }
  element.setAttribute(name, value === true ? '' : String(value));
}

export function createElement(
  tag: Tag,
  props: Props,
  ...children: Child[]
): Element {
  if (typeof tag !== 'string') {
    return tag({...props, children});
  }
  // We expect all SVG-related tags to have `xmlns` set during build time.
  // See babel-plugin-dom-jsx-svg-namespace
  const xmlns = props?.xmlns;
  if (xmlns) {
    delete props.xmlns;
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

export function Fragment() {
  devAssert(
    null,
    "Don't use Fragment (<></>) with #core/dom/jsx. " +
      'Use a root node or an array of nodes instead.'
  );
  return null;
}
