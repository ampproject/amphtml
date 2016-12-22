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
 * Creates a proxy object `form.$p` that proxies all of the methods and
 * properties to the original DOM APIs. This is to work around the problematic
 * forms feature where inputs mask DOM APIs.
 *
 * E.g. a `<input id="id">` will override `form.id` from the original DOM API.
 * Form proxy will give access to the original `id` value via `form.$p.id`.
 *
 * See https://medium.com/@dvoytenko/solving-conflicts-between-form-inputs-and-dom-api-535c45333ae4
 *
 * @param {!HTMLFormElement} form
 * @return {!Object}
 */
export function installFormProxy(form) {
  const constr = getFormProxyConstr(form.ownerDocument.defaultView);
  const proxy = new constr(form);
  form['$p'] = proxy;
  return proxy;
}


/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */
function getFormProxyConstr(win) {
  if (!win.FormProxy) {
    win.FormProxy = createFormProxyConstr(win);
  }
  return win.FormProxy;
}


/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */
function createFormProxyConstr(win) {

  /**
   * @param {!HTMLFormElement} form
   * @constructor
   */
  function FormProxy(form) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;
  }

  const FormProxyProto = FormProxy.prototype;

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
    for (const name in prototype) {
      const property = win.Object.getOwnPropertyDescriptor(prototype, name);
      if (!property ||
          name.substring(0, 2) == 'on' ||
          win.Object.prototype.hasOwnProperty.call(FormProxyProto, name)) {
        continue;
      }
      if (typeof property.value == 'function') {
        // A method call. Call the original prototype method via `call`.
        const method = property.value;
        FormProxyProto[name] = function() {
          return method.apply(this.form_, arguments);
        };
      } else {
        // A read/write property. Call the original prototype getter/setter.
        const spec = {};
        if (property.get) {
          spec.get = function() {
            return property.get.call(this.form_);
          };
        }
        if (property.set) {
          spec.set = function(value) {
            return property.set.call(this.form_, value);
          };
        }
        win.Object.defineProperty(FormProxyProto, name, spec);
      }
    }
  });

  return FormProxy;
}
