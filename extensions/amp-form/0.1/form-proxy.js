/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


/**
 * @param {!HTMLFormElement} form
 * @return {!Object}
 */
export function installFormProxy(form) {
  const proxy = {};

  const win = form.ownerDocument.defaultView;

  // Hierarchy:
  //   Node  <==  Element <== HTMLElement <== HTMLFormElement
  //   EventTarget  <==  HTMLFormElement
  const prototypes = [
    win.HTMLFormElement.prototype,
    win.HTMLElement.prototype,
    win.Element.prototype,
    win.Node.prototype,
    win.EventTarget.prototype,
  ];
  prototypes.forEach(function(prototype) {
    const properties = win.Object.getOwnPropertyDescriptors(prototype);
    for (const name in properties) {
      if (proxy[name] || name == 'constructor') {
        continue;
      }
      const property = properties[name];
      if (typeof property.value == 'function') {
        const method = property.value;
        proxy[name] = function() {
          return method.apply(form, arguments);
        };
      } else {
        const spec = {};
        if (property.get) {
          spec.get = function() {
            return property.get.call(form);
          };
        }
        if (property.set) {
          spec.set = function(value) {
            return property.set.call(form, value);
          };
        }
        win.Object.defineProperty(proxy, name, spec);
      }
    }
  });

  form['$p'] = proxy;
  return proxy;
}


/*QQQ

Methods:
  after
  animate
  append
  before
  blur
  checkValidity
  click
  cloneNode
  closest
  contains
  dispatchEvent
  focus
  insertBefore
  lookupPrefix
  matches
  normalize
  prepend
  remove
  replaceWith
  reportValidity
  reset
  submit

Properties (currently in review in b/33790306):
  acceptCharset string
  accessKey string
  assignedSlot object
  attributes object
  autocomplete string
  childElementCount number
  childNodes object
  children object
  classList object
  className string
  clientHeight number
  clientLeft number
  clientTop number
  clientWidth number
  contentEditable string
  dataset object
  dir string
  draggable boolean
  elements object
  encoding string
  enctype string
  firstChild object
  firstElementChild object
  hidden boolean
  id string
  innerText string
  isConnected boolean
  isContentEditable boolean
  lang string
  lastChild object
  lastElementChild object
  length number
  localName string
  name string
  namespaceURI string
  nextElementSibling object
  nextSibling object
  noValidate boolean
  nodeName string
  nodeType number
  nodeValue object
  offsetHeight number
  offsetLeft number
  offsetParent object
  offsetTop number
  offsetWidth number
  outerText string
  ownerDocument object
  parentElement object
  parentNode object
  prefix object
  previousElementSibling object
  previousSibling object
  scrollHeight number
  scrollLeft number
  scrollTop number
  scrollWidth number
  shadowRoot object
  slot string
  spellcheck boolean
  style object
  tabIndex number
  tagName string
  target string
  textContent string
  title string
  translate boolean
  webkitdropzone string
*/
