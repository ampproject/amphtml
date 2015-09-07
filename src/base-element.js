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

import {assert} from './asserts';
import {Layout, isInternalElement} from './layout';
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
 * createdCallback -> firstAttachedCallback -> loadContent -> loadIdleContent.
 *
 * Each method is called exactly once and overriding them in sub classes
 * is optional.
 */
export class BaseElement {
  /** @param {!Element} */
  constructor(element) {
    /** @public @const */
    this.element = element;
    /** @private {!Layout} */
    this.layout_ = Layout.NODISPLAY;
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
   * Called when the element is first created. Note that for element created
   * using createElement this may be before any children are added.
   */
  createdCallback() {
    // Sub classes may override.
  }

  /**
   * Override in sub class to adjust the element when it is being added to the
   * DOM. Could e.g. be used to insert a fallback. Should not typically start
   * loading a resource.
   */
  firstAttachedCallback() {
    // Sub classes may override.
  }

  /**
   * Called when the element should load the resources associated with it.
   * At this time the element should be visible or should soon be visible.
   * @return {!Element|!Promise|undefined} Element whose load event is takes
   *     as a proxy for the overall component load event or a Promise for
   *     when the element was loaded.
   */
  loadContent() {
    return Promise.resolve();
  }

  /**
   * Called once when no other resources are being downloaded.
   * @return {!Element|!Promiseundefined} Element whose load event is takes
   *     as a proxy for the overall component load event or a Promise for
   *     when the element was loaded.
   */
  loadIdleContent() {
    // Sub classes should override.
  }

  /**
   * TODO(dvoytenko): come up with a more appropriate name that would signify
   * "visible in viewport right now".
   * Instructs the resource that it's currently in the active viewport
   * and can activate itself. Intended to be implemented by actual
   * components.
   */
  activateContent(){
  }

  /**
   * Instructs the resource that it's no longer in the active viewport
   * and should deactivate itself. Intended to be implemented by actual
   * components.
   */
  deactivateContent() {
  }

  /**
   * Instructs the element that its activation is requested based on some
   * user event. Intended to be implemented by actual components.
   */
  activate() {
  }

  /**
   * Utility method that propagates attributes from this element
   * to the given element.
   * @param  {!Array<string>} attributes
   * @param  {!Element} element
   * @protected @final
   */
  propagateAttributes(attributes, element) {
    for (let attr of attributes) {
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
      if (!isInternalElement(n)) {
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
      if (!isInternalElement(child)) {
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
}
