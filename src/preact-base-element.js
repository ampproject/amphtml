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

import {Deferred} from './utils/promise';
import {Fragment, createElement, render} from 'preact';
import {Slot, createSlot} from './preact/slot';
import {devAssert} from './log';
import {dict} from './utils/object';
import {matches} from './dom';
import {withAmpContext} from './preact/context';

/**
 * @typedef {{
 *   prop: string,
 *   default: *,
 *   type: (string|undefined)
 * }}
 */
export let AmpElementAttr;

/**
 * @typedef {{
 *   className: (string|undefined),
 *   attrs: (!Object<string, !AmpElementAttr>|undefined),
 * }}
 */
export let AmpElementOptions;

/**
 * Wraps a Preact Component in a BaseElement class.
 *
 * Most functionality should be done in Preact. We don't expose the BaseElement
 * subclass on purpose, you're not meant to do work in the subclass! There will
 * be very few exceptions, which is why we allow options to configure the
 * class.
 *
 * @param {function(!JsonObject):*} Component
 * @param {!AmpElementOptions} opts
 * @return {function(new:./base-element.BaseElement, !Element)}
 */
export function PreactBaseElement(Component, opts = {}) {
  return class extends AMP.BaseElement {
    /** @param {!AmpElement} element */
    constructor(element) {
      super(element);

      /** @private {?Node} */
      this.container_ = null;

      /** @private {number} */
      this.scheduledRender_ = 0;

      /** @private {!Object} */
      this.context_ = {
        renderable: false,
        playable: false,
        notify: () => this.mutateElement(() => {}),
      };

      this.boundRerender_ = () => {
        this.scheduledRender_ = 0;
        this.rerender_();
      };

      /** @private {!Deferred|null} */
      this.scheduledRenderDeferred_ = null;
    }

    /** @override */
    renderOutsideViewport() {
      const distance = opts.renderOutsideViewport;
      return distance == null ? super.renderOutsideViewport() : distance;
    }

    /** @override */
    isLayoutSupported(layout) {
      const layoutSupported = opts.isLayoutSupported;
      return layoutSupported ? layoutSupported(layout) : true;
    }

    /** @override */
    buildCallback() {
      this.scheduleRender_();

      // context-changed is fired on each child element to notify it that the
      // parent has changed the wrapping context. This is equivalent to
      // updating the Context.Provider with new data and having it propagate.
      this.element.addEventListener('i-amphtml-context-changed', e => {
        e.stopPropagation();
        this.scheduleRender_();
      });

      // unmounted is fired on each child element to notify it that the parent
      // has removed the element from the DOM tree. This is equivalent to React
      // recursively calling componentWillUnmount.
      this.element.addEventListener('i-amphtml-unmounted', e => {
        e.stopPropagation();
        this.unmount_();
      });
    }

    /** @override */
    layoutCallback() {
      const deferred =
        this.scheduledRenderDeferred_ ||
        (this.scheduledRenderDeferred_ = new Deferred());
      this.context_.renderable = true;
      this.context_.playable = true;
      this.scheduleRender_();
      return deferred.promise;
    }

    /** @override */
    mutatedAttributesCallback() {
      if (this.container_) {
        this.scheduleRender_();
      }
    }

    /** @private */
    scheduleRender_() {
      if (this.scheduledRender_ === 0) {
        this.scheduledRender_ = requestAnimationFrame(this.boundRerender_);
      }
    }

    /** @private */
    unmount_() {
      if (this.scheduledRender_ !== 0) {
        cancelAnimationFrame(this.scheduledRender_);
        this.scheduledRender_ = 0;
      }

      if (this.container_) {
        render(Fragment, this.container_);
      }
    }

    /** @private */
    rerender_() {
      if (!this.container_) {
        if (opts.children || opts.passthrough) {
          this.container_ = this.element.attachShadow({mode: 'open'});
        } else {
          const container = this.win.document.createElement('i-amphtml-c');
          this.container_ = container;
          this.applyFillContent(container);
          this.element.appendChild(container);
        }
      }

      const props = collectProps(
        this.element,
        devAssert(opts),
        this.win,
        this.getAmpDoc()
      );

      // While this "creates" a new element, diffing will not create a second
      // instance of Component. Instead, the existing one already rendered into
      // this element will be reused.
      const cv = createElement(Component, props);

      const v = createElement(withAmpContext, this.context_, cv);

      render(v, this.container_);

      const deferred = this.scheduledRenderDeferred_;
      if (deferred) {
        deferred.resolve();
        this.scheduledRenderDeferred_ = null;
      }
    }
  };
}

/**
 * @param {!AmpElement} element
 * @param {!AmpElementOptions} opts
 * @param {!Window} win
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Object}
 */
function collectProps(element, opts, win, ampdoc) {
  const props = dict({});

  // Class.
  if (opts.className) {
    props['className'] = opts.className;
  }

  // Attributes.
  const defs = opts.attrs || {};
  for (const name in defs) {
    const def = defs[name];
    const value = element.getAttribute(name);
    if (value == null) {
      if (def.default != null) {
        props[def.prop] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? Number(value)
          : def.type == 'Element'
          ? // TBD: what's the best way for element referencing compat between
            // React and AMP? Currently modeled as a Ref.
            {current: element.getRootNode().getElementById(value)}
          : value;
      props[def.prop] = v;
    }
  }

  // Children.
  // There are plain "children" and there're slotted children assigned
  // as separate properties. Thus in a carousel the plain "children" are
  // slides, and the "arrowNext" children are passed via a "arrowNext"
  // property.
  if (opts.passthrough) {
    props['children'] = [createElement(Slot)];
  } else if (opts.children) {
    const children = [];
    const nodes = element.getRealChildNodes();
    for (let i = 0; i < nodes.length; i++) {
      const childElement = nodes[i];
      const match = matchChild(childElement, opts.children);
      if (!match) {
        continue;
      }

      const def = opts.children[match];
      const slotProps = (typeof def == 'object' && def.props) || {};

      // TBD: assign keys, reuse slots, etc.
      if (def.single) {
        props[match] = createSlot(
          childElement,
          `i-amphtml-${match}`,
          slotProps
        );
      } else {
        const list =
          match == 'children' ? children : props[match] || (props[match] = []);
        list.push(
          createSlot(
            childElement,
            `i-amphtml-${match}-${list.length}`,
            slotProps
          )
        );
      }
    }
    props['children'] = children;
  }

  const services = {};
  const requestedServices = opts.services || {};
  for (const service in requestedServices) {
    const getter = requestedServices[service];
    services[service] = getter(win, ampdoc);
  }
  props['services'] = services;

  return props;
}

/**
 * @param {!Element} element
 * @param {!Object} defs
 * @return {?string}
 */
function matchChild(element, defs) {
  if (
    /^i-/.test(element.tagName) ||
    element.hasAttribute('placeholder') ||
    element.hasAttribute('fallback') ||
    element.hasAttribute('i-amphtml')
  ) {
    return null;
  }

  // TODO: a little slow to do this repeatedly.
  for (const match in defs) {
    const def = defs[match];
    const selector = typeof def == 'string' ? def : def.selector;
    if (matches(element, selector)) {
      return match;
    }
  }
  return null;
}
