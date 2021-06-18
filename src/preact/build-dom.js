import {MediaQueryProps} from '#core/dom/media-query-props';
import {Loading} from '#core/loading-instructions';
import * as Preact from 'preact';
import {collectProps} from './parse-props';

/**
 * Goals
 * 1.
 */

/**
 * @return {function() => void}
 */
export function getBuildDom(Ctor) {
  const fakeWindow = {matchMedia: () => null};
  const mediaQueryProps = new MediaQueryProps(fakeWindow, () => {});

  return function buildDom(doc, element) {
    const props = collectProps(
      Ctor,
      element,
      {current: null},
      {},
      mediaQueryProps
    );

    const PreactComponent = Ctor['Component'];
    const vdom = PreactComponent(props);
    const realDom = renderToDom(doc, element, vdom);
    element.appendChild(realDom);
  };
}

export function renderToDom(doc, domNode, node, context = {}) {
  // these values render nothing, which we represent as empty Text nodes:
  if (node == null || typeof node === 'boolean') return;

  // number and string are DOM plaintext (`.textContent`):
  if (typeof node !== 'object') {
    return doc.createTextNode(String(node));
  }

  // recursively render (potentially infinitely-)nested children:
  if (Array.isArray(node)) {
    return node
      .flat(Infinity)
      .map((node) => renderToProto(doc, domNode, node, context));
  }

  // recurse into component functions:
  // Note: Function type can only be provided by AMP, since HTML parsing cannot produce a function type value.
  if (typeof node.type === 'function') {
    let inst = {
      setState: Object,
      forceUpdate: Object,
      __d: true,
      props: node.props,
      context: node.context,
    };
    let rendered;
    if ('prototype' in node.type && node.type.prototype.render) {
      // class components:
      inst = Object.assign(new node.type(inst.props, inst.context), inst);
      rendered = inst.render(inst.props, inst.state, inst.context);
      if (inst.getChildContext)
        context = Object.assign({}, inst.getChildContext());
    } else {
      // function components:
      rendered = node.type.call(inst, node.props, node.context);
    }
    return renderToProto(doc, domNode, rendered, context);
  }

  // "Render" VDOM to DOM Proto:
  let {children, dangerouslySetInnerHTML, ref, key, ...props} = node.props;
  if (dangerouslySetInnerHTML) {
    const temp = document.createElement('div');
    temp.innerHTML = String(dangerouslySetInnerHTML.__html || '');
    children = temp.childNodes;
  }
  if (Array.isArray(children)) children = children.flat(Infinity);
  else children = [children];

  const elem = doc.createElement(node.type);
  for (let [name, val] of Object.entries(props)) {
    elem.setAttribute(name, val);
  }

  children.filter(Boolean).forEach((child) => elem.appendChild(child));
  return elem;
}
