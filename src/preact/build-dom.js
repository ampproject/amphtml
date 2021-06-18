/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from './';

import {MediaQueryProps} from '#core/dom/media-query-props';
import {collectProps} from './parse-props';

/**
 * @param Ctor
 * @return {function() => void}
 */
export function getBuildDom(Ctor) {
  const fakeWindow = {matchMedia: () => null};
  const mediaQueryProps = new MediaQueryProps(fakeWindow, () => {});

  return function buildDom(doc, element) {
    const props = collectProps(
      Ctor,
      element,
      /* ref */ {current: null},
      /* default props */ {},
      mediaQueryProps
    );

    const Component = function () {
      let state = 42; // WORKS, line below this breaks :(
      // const [state, setState] = Preact.useState(42);
      return <button>{state}</button>;
    };
    const vNode = Preact.createElement(Component, props);
    const realNode = renderToDom(doc, element, vNode);
    element.appendChild(realNode);
  };
}

export function renderToDom(doc, domNode, node, context = {}) {
  // these values render nothing, which we represent as empty Text nodes:
  if (node == null || typeof node === 'boolean') {
    return document.createTextNode();
  }

  // number and string are DOM plaintext (`.textContent`):
  if (typeof node !== 'object') {
    return doc.createTextNode(String(node));
  }

  // recursively render (potentially infinitely-)nested children:
  if (Array.isArray(node)) {
    return node
      .flat(Infinity)
      .map((node) => renderToDom(doc, domNode, node, context));
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
      if (inst.getChildContext) {
        context = {...inst.getChildContext()};
      }
    } else {
      // function components:
      rendered = node.type.call(inst, node.props, node.context);
    }
    return renderToDom(doc, domNode, rendered, context);
  }

  // "Render" VDOM to DOM Proto:
  let {children, dangerouslySetInnerHTML, key, ref, ...props} = node.props;
  if (dangerouslySetInnerHTML) {
    // TODO: this should do a real parse
    const temp = document.createElement('div');
    temp.innerHTML = String(dangerouslySetInnerHTML.__html || '');
    children = Array.from(temp.childNodes);
  } else {
    children = []
      .concat(children)
      .flat(Infinity)
      .map((c) => renderToDom(doc, domNode, c, context));
  }

  const elem = doc.createElement(node.type);
  for (const [name, val] of Object.entries(props)) {
    elem.setAttribute(name, val);
  }

  children.filter(Boolean).forEach((child) => elem.appendChild(child));
  return elem;
}
