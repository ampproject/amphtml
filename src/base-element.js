/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Layout, isInternalElement} from './layout';
import {assert} from './asserts';
import {resources} from './resources';
import {viewportFor} from './viewport';


/**
 * Base class for all custom element implementations. Instead of inheriting
 * from Element this class has an Element. Among other things this allows
 * switching the element implementation when going from a stub to the full
 * implementation.
 *
 * The base class implements a set of lifecycle methods that are called by
 * the framework as appropriate. These are mostly based on the custom element
 * lifecycle (See
 * http://www.html5rocks.com/en/tutorials/webcomponents/customelements/)
 * and adding AMP style late loading to the mix.
 * The lifecycle is:
 *   createdCallback ->
 *   firstAttachedCallback ->
 *   buildCallback ->
 *   layoutCallback (one or more) ->
 *   viewportCallback (one or more)
 *
 *
 * Each method is called exactly once and overriding them in subclasses
 * is optional.
 */
export class BaseElement {
  /** @param {!Element} */
  constructor(element) {
    /** @public @const */
    this.element = element;

    /** @package {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @package {boolean} */
    this.inViewport_ = false;
  }

  /** @return {!Layout} */
  getLayout() {
    return this.layout_;
  }

  /**
   * Intended to be implemented by subclasses. Tests whether the element
   * supports the specified layout. By default only Layout.NODISPLAY is
   * supported.
   * @param {!Layout} layout
   * @return {boolean}
   * @protected
   */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * @return {boolean}
   */
  isInViewport() {
    return this.inViewport_;
  }

  /**
   * Called when the element is first created. Note that for element created
   * using createElement this may be before any children are added.
   */
  createdCallback() {
    // Subclasses may override.
  }

  /**
   * Override in subclass to adjust the element when it is being added to the
   * DOM. Could e.g. be used to insert a fallback. Should not typically start
   * loading a resource.
   */
  firstAttachedCallback() {
    // Subclasses may override.
  }

  /**
   * Override in subclass to indicate if the element is ready to rebuild its
   * DOM subtree.  If the element can proceed with building the content return
   * "true" and return "false" otherwise. The element may not be ready to build
   * e.g. beacuse its children are not available yet.
   *
   * See "buildCallback" for more details.
   *
   * @return {boolean}
   */
  isReadyToBuild() {
    // Subclasses may override.
    return true;
  }

  /**
   * Override in subclass if the element needs to rebuilt its DOM content.
   * Until the element has been rebuilt its content are not shown with an only
   * exception of [placeholder] elements. From the moment the element is created
   * and until the building phase is complete it will have "amp-notbuilt" CSS
   * class set on it.
   *
   * This callback is executed early after the element has been attached to DOM
   * if "isReadyToBuild" callback returns "true" or its called later upon the
   * determination of Resources manager but definitely before first
   * "layoutCallback" is called. Notice that "isReadyToBuild" call is not
   * consulted in the later case.
   */
  buildCallback() {
    // Subclasses may override.
  }

  /**
   * @param {!Element} element
   */
  setAsOwner(element) {
    resources.setOwner(element, this.element);
  }

  /**
   * Called when the element should perform layout. At this point the element
   * should load/reload resources associated with it. This method is called
   * by runtime and cannot be called manually. Returns promise that will
   * complete when loading is considered to be complete.
   * @return {!Promise}
   */
  layoutCallback() {
    return Promise.resolve();
  }

  /**
   * Instructs the resource that it has either entered or exited the visible
   * viewport. Intended to be implemented by actual components.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
  }

  /**
   * Instructs the element that its activation is requested based on some
   * user event. Intended to be implemented by actual components.
   */
  activate() {
  }

  /**
   * Returns the maximum DPR available on this device.
   * @return {number}
   */
  getMaxDpr() {
    return resources.getMaxDpr();
  }

  /**
   * Returns the most optimal DPR currently recommended.
   * @return {number}
   */
  getDpr() {
    return resources.getDpr();
  }

  /**
   * Utility method that propagates attributes from this element
   * to the given element.
   * @param  {!Array<string>} attributes
   * @param  {!Element} element
   * @protected @final
   */
  propagateAttributes(attributes, element) {
    for (let i = 0; i < attributes.length; i++) {
      let attr = attributes[i];
      if (!this.element.hasAttribute(attr)) {
        continue;
      }
      element.setAttribute(attr, this.element.getAttribute(attr));
    }
  }

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   * @protected @final
   */
  getPlaceholder() {
    let children = this.element.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].hasAttribute('placeholder')) {
        return children[i];
      }
    }
    return null;
  }

  /**
   * Returns the original nodes of the custom element without any service nodes
   * that could have been added for markup. These nodes can include Text,
   * Comment and other child nodes.
   * @return {!Array<!Node>}
   * @protected @final
   */
  getRealChildNodes() {
    let nodes = [];
    for (let n = this.element.firstChild; n; n = n.nextSibling) {
      if (!isInternalOrServiceNode(n)) {
        nodes.push(n);
      }
    }
    return nodes;
  }

  /**
   * Returns the original children of the custom element without any service
   * nodes that could have been added for markup.
   * @return {!Array<!Element>}
   * @protected @final
   */
  getRealChildren() {
    let elements = [];
    for (let i = 0; i < this.element.children.length; i++) {
      let child = this.element.children[i];
      if (!isInternalOrServiceNode(child)) {
        elements.push(child);
      }
    }
    return elements;
  }

  /**
   * Configures the supplied element to have a "fill content" layout. The
   * exact interpretation of "fill content" depends on the element's layout.
   * @param {!Element} element
   * @protected @final
   */
  applyFillContent(element) {
    element.classList.add('-amp-fill-content');
  }

  /**
   * @return {!Viewport}
   */
  getViewport() {
    return viewportFor(this.element.ownerDocument.defaultView);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   */
  scheduleLayout(elements) {
    resources.scheduleLayout(this.element, elements);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   */
  schedulePreload(elements) {
    resources.schedulePreload(this.element, elements);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   */
  updateInViewport(elements, inLocalViewport) {
    resources.updateInViewport(this.element, elements, inLocalViewport);
  }
}


/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (node.tagName && node.hasAttribute('placeholder')) {
    return true;
  }
  return false;
}
