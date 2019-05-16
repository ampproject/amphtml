/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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


// DO NOT SUBMIT: is DocRoot concept enough? Or do we also need a separate
// concept of Scope?

/**
 * `DocRoot` is very similar to the `Document` interface and acts as a stand-in
 * for the `Document` in most of cases. It's a pseudo-document and a unit of
 * scoping in AMP. Each independent sub-document will have its own instance of
 * `DocRoot` even if multiple `DocRoot`s share the same global `Document`
 * instance.
 *
 * @interface
 */
export class DocRoot {

  /**
   * Returns the current URL of the docroot.
   * See https://developer.mozilla.org/en-US/docs/Web/API/Document/URL.
   *
   * @return {string}
   */
  get url() {}

  /**
   * Returns the root node of the docroot. It can be either a `Document` or
   * a `ShadowRoot` instance.
   *
   * @return {!DocumentOrShadowRoot}
   */
  get rootNode() {}

  /**
   * @return {!Window}
   */
  get win() {}

  /**
   * @return {!../utils/signals.Signals}
   */
  get signals() {}

  /**
   * @return {!Element}
   */
  get documentElement() {}

  /**
   * @return {!Element}
   */
  get head() {}

  /**
   * @return {!Element}
   */
  get body() {}

  /**
   * @return {?Element}
   */
  get bodyIfAvailable() {}

  // DO NOT SUBMIT: restrict and look for a way to remove the need to
  // have a body promise. This is a very rare need.
  /**
   * @return {!Element}
   */
  waitForBodyOpen() {}

  /**
   * @return {!StyleSheetList}
   */
  get styleSheets() {}

  /**
   * @param {!Node} node
   * @return {boolean}
   */
  contains(node) {}

  /**
   * @param {string} name
   * @return {!Element}
   */
  createElement(name) {}

  /**
   * @param {!Node} node
   * @return {!Node}
   */
  adoptNode(node) {}

  /**
   * @param {!Node} node
   * @param {boolean=} deep
   * @return {!Node}
   */
  importNode(node, deep = false) {}

  /**
   * @param {string} selector
   * @return {!NodeList<!Element>}
   */
  querySelectorAll(selector) {}

  /**
   * @param {string} selector
   * @return {!Element}
   */
  querySelector(selector) {}

  /**
   * @param {string} id
   * @return {!Element}
   */
  getElementById(id) {}

  /**
   * @return {boolean}
   */
  get ready() {}

  /**
   * @return {!Promise}
   */
  whenReady() {}

  /**
   * @return {boolean}
   */
  get visible() {}

  /**
   * @return {boolean}
   */
  get hasBeenVisible() {}

  /** @return {!Promise} */
  whenFirstVisible() {}

  /**
   * @return {!../visibility-state.VisibilityState}
   */
  get visibilityState() {}

  // DO NOT SUBMIT: do we follow Observable model here or EventTarget?
  /**
   * @param {function(!../visibility-state.VisibilityState)} handler
   * @return {!Unsubscribe}
   */
  onVisibilityStateChange(handler) {}

  // TODO(dvoytenko): additional APIs available in docroot will be:
  // - extensions scoping
  // - dependency scoping
  // - custom element scoping
}
