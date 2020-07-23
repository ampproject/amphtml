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

import * as Preact from './index';
import {Deferred} from '../utils/promise';
import {Slot, createSlot} from './slot';
import {WithAmpContext} from './context';
import {devAssert} from '../log';
import {hasOwn} from '../utils/object';
import {matches} from '../dom';
import {render} from './index';

/**
 * @typedef {{
 *   attr: string,
 *   type: (string|undefined),
 *   default: *,
 * }}
 */
let AmpElementPropDef;

/**
 * @typedef {{
 *   name: string,
 *   selector: string,
 *   single: (boolean|undefined),
 *   props: (!JsonObject|undefined),
 * }}
 */
let ChildDef;

/** @const {!MutationObserverInit} */
const PASSTHROUGH_NON_EMPTY_MUTATION_INIT = {
  childList: true,
  characterData: true,
};

/**
 * Wraps a Preact Component in a BaseElement class.
 *
 * Most functionality should be done in Preact. We don't expose the BaseElement
 * subclass on purpose, you're not meant to do work in the subclass! There will
 * be very few exceptions, which is why we allow options to configure the
 * class.
 */
export class PreactBaseElement extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Node} */
    this.container_ = null;

    /** @private {boolean} */
    this.scheduledRender_ = false;

    /** @private {!Object} */
    this.context_ = {
      renderable: false,
      playable: false,
      notify: () => this.mutateElement(() => {}),
    };

    this.boundRerender_ = () => {
      this.scheduledRender_ = false;
      this.rerender_();
    };

    /** @private {!Deferred|null} */
    this.scheduledRenderDeferred_ = null;

    /** @private {!JsonObject|null|undefined} */
    this.defaultProps_ = null;

    /** @private {boolean} */
    this.mounted_ = true;

    /** @private {?MutationObserver} */
    this.observer_ = this.constructor['passthroughNonEmpty']
      ? new MutationObserver(() => {
          this.scheduleRender_();
        })
      : null;
  }

  /**
   * A chance to initialize default Preact props for the element.
   *
   * @return {!JsonObject|undefined}
   */
  init() {}

  /** @override */
  buildCallback() {
    this.defaultProps_ = this.init() || null;

    this.scheduleRender_();

    // context-changed is fired on each child element to notify it that the
    // parent has changed the wrapping context. This is equivalent to
    // updating the Context.Provider with new data and having it propagate.
    this.element.addEventListener('i-amphtml-context-changed', (e) => {
      e.stopPropagation();
      this.scheduleRender_();
    });

    // unmounted is fired on each child element to notify it that the parent
    // has removed the element from the DOM tree. This is equivalent to React
    // recursively calling componentWillUnmount.
    this.element.addEventListener('i-amphtml-unmounted', (e) => {
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
    if (this.observer_) {
      this.observer_.observe(this.element, PASSTHROUGH_NON_EMPTY_MUTATION_INIT);
    }
    return deferred.promise;
  }

  /** @override */
  unlayoutCallback() {
    if (this.observer_) {
      this.observer_.disconnect();
      return true;
    }
    return false;
  }

  /** @override */
  mutatedAttributesCallback() {
    if (this.container_) {
      this.scheduleRender_();
    }
  }

  /**
   * @protected
   * @param {!JsonObject} props
   */
  mutateProps(props) {
    this.defaultProps_ = /** @type {!JsonObject} */ ({
      ...this.defaultProps_,
      ...props,
    });
    this.scheduleRender_();
  }

  /** @private */
  scheduleRender_() {
    if (!this.scheduledRender_) {
      this.scheduledRender_ = true;
      this.mutateElement(this.boundRerender_);
    }
  }

  /** @private */
  unmount_() {
    this.mounted_ = false;
    if (this.container_) {
      render(<></>, this.container_);
    }
  }

  /** @private */
  rerender_() {
    // If the component unmounted before the scheduled render runs, exit
    // early.
    if (!this.mounted_) {
      return;
    }

    const Ctor = this.constructor;

    if (!this.container_) {
      if (
        Ctor['children'] ||
        Ctor['passthrough'] ||
        Ctor['passthroughNonEmpty']
      ) {
        devAssert(
          !Ctor['detached'],
          'The AMP element cannot be rendered in detached mode ' +
            'when configured with "children", "passthrough", or ' +
            '"passthroughNonEmpty" properties.'
        );
        this.container_ = this.element.attachShadow({mode: 'open'});

        // Create a slot for internal service elements i.e. "i-amphtml-sizer"
        const serviceSlot = this.win.document.createElement('slot');
        serviceSlot.setAttribute('name', 'i-amphtml-svc');
        this.container_.appendChild(serviceSlot);
      } else {
        const container = this.win.document.createElement('i-amphtml-c');
        this.container_ = container;
        this.applyFillContent(container);
        if (!Ctor['detached']) {
          this.element.appendChild(container);
        }
      }
    }

    const props = collectProps(Ctor, this.element, this.defaultProps_);

    // While this "creates" a new element, diffing will not create a second
    // instance of Component. Instead, the existing one already rendered into
    // this element will be reused.
    const v = (
      <WithAmpContext {...this.context_}>
        {Preact.createElement(Ctor['Component'], props)}
      </WithAmpContext>
    );

    render(v, this.container_);

    const deferred = this.scheduledRenderDeferred_;
    if (deferred) {
      deferred.resolve();
      this.scheduledRenderDeferred_ = null;
    }
  }

  /**
   * @protected
   * @param {string} prop
   * @param {*} opt_fallback
   * @return {*}
   */
  getProp(prop, opt_fallback) {
    if (!hasOwn(this.defaultProps_, prop)) {
      return opt_fallback;
    }
    return this.defaultProps_[prop];
  }
}

// Ideally, these would be Static Class Fields. But Closure can't even.

/**
 * Override to provide the Component definition.
 *
 * @protected {!PreactDef.FunctionalComponent}
 */
PreactBaseElement['Component'] = function () {
  devAssert(false, 'Must provide Component');
};

/**
 * An override to specify an exact className prop to Preact.
 *
 * @protected {string}
 */
PreactBaseElement['className'] = '';

/**
 * Enabling passthrough mode alters the children slotting to use a single
 * `<slot>` element for all children. This is in contrast to children mode,
 * which creates a new named `<slot>` for every child.
 *
 * @protected {boolean}
 */
PreactBaseElement['passthrough'] = false;

/**
 * Handling children with passthroughNonEmpty mode is similar to passthrough
 * mode except that when there are no children elements, the returned
 * prop['children'] will be null instead of the unnamed <slot>.  This allows
 * the Preact environment to have conditional behavior depending on whether
 * or not there are children.
 *
 * @protected {boolean}
 */
PreactBaseElement['passthroughNonEmpty'] = false;

/**
 * Enabling detached mode alters the children to be rendered in an
 * unappended container. By default the children will be attached to the DOM.
 *
 * @protected {boolean}
 */
PreactBaseElement['detached'] = false;

/**
 * Provides a mapping of Preact prop to AmpElement DOM attributes.
 *
 * @protected {!Object<string, !AmpElementPropDef>}
 */
PreactBaseElement['props'] = {};

/**
 * @protected {!Object<string, !ChildDef>|null}
 */
PreactBaseElement['children'] = null;

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!AmpElement} element
 * @param {!JsonObject|null|undefined} defaultProps
 * @return {!JsonObject}
 */
function collectProps(Ctor, element, defaultProps) {
  const props = /** @type {!JsonObject} */ ({...defaultProps});

  const {
    'className': className,
    'props': propDefs,
    'passthrough': passthrough,
    'passthroughNonEmpty': passthroughNonEmpty,
    'children': childrenDefs,
  } = Ctor;

  // Class.
  if (className) {
    props['className'] = className;
  }

  // Props.
  for (const name in propDefs) {
    const def = propDefs[name];
    const value =
      def.type == 'boolean'
        ? element.hasAttribute(def.attr)
        : element.getAttribute(def.attr);
    if (value == null) {
      props[name] = def.default;
    } else {
      const v =
        def.type == 'number'
          ? Number(value)
          : def.type == 'Element'
          ? // TBD: what's the best way for element referencing compat between
            // React and AMP? Currently modeled as a Ref.
            {current: element.getRootNode().getElementById(value)}
          : value;
      props[name] = v;
    }
  }

  // Children.
  // There are plain "children" and there're slotted children assigned
  // as separate properties. Thus in a carousel the plain "children" are
  // slides, and the "arrowNext" children are passed via a "arrowNext"
  // property.
  const errorMessage =
    'only one of "passthrough", "passthroughNonEmpty"' +
    ' or "children" may be given';
  if (passthrough) {
    devAssert(!childrenDefs && !passthroughNonEmpty, errorMessage);
    props['children'] = [<Slot />];
  } else if (passthroughNonEmpty) {
    devAssert(!childrenDefs, errorMessage);
    // If all children are whitespace text nodes, consider the element as
    // having no children
    props['children'] = element
      .getRealChildNodes()
      .every(
        (node) =>
          node.nodeType === /* TEXT_NODE */ 3 &&
          node.nodeValue.trim().length === 0
      )
      ? null
      : [<Slot />];
  } else if (childrenDefs) {
    const children = [];
    props['children'] = children;

    const nodes = element.getRealChildNodes();
    for (let i = 0; i < nodes.length; i++) {
      const childElement = nodes[i];
      const def = matchChild(childElement, childrenDefs);
      if (!def) {
        continue;
      }

      const {single, name, props: slotProps = {}} = def;

      // TBD: assign keys, reuse slots, etc.
      if (single) {
        props[name] = createSlot(childElement, `i-amphtml-${name}`, slotProps);
      } else {
        const list =
          name == 'children' ? children : props[name] || (props[name] = []);
        list.push(
          createSlot(
            childElement,
            `i-amphtml-${name}-${list.length}`,
            slotProps
          )
        );
      }
    }
  }

  return props;
}

/**
 * @param {!Element} element
 * @param {!Object} defs
 * @return {?ChildDef}
 */
function matchChild(element, defs) {
  // TODO: a little slow to do this repeatedly.
  for (const match in defs) {
    const def = defs[match];
    const selector = typeof def == 'string' ? def : def.selector;
    if (matches(element, selector)) {
      return def;
    }
  }
  return null;
}
