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
import {childElementByTag, createElementWithAttributes, matches} from '../dom';
import {createRef, hydrate, render} from './index';
import {devAssert} from '../log';
import {dict, hasOwn} from '../utils/object';
import {installShadowStyle} from '../shadow-embed';
import {startsWith} from '../string';
import {subscribe} from '../context';

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
const CHILDREN_MUTATION_INIT = {
  childList: true,
};

/** @const {!MutationObserverInit} */
const PASSTHROUGH_MUTATION_INIT = {
  childList: true,
  characterData: true,
};

/** @const {!JsonObject<string, string>} */
const SHADOW_CONTAINER_ATTRS = dict({'style': 'display: contents'});

/** @const {!JsonObject<string, string>} */
const SERVICE_SLOT_ATTRS = dict({'name': 'i-amphtml-svc'});

/**
 * The same as `applyFillContent`, but inside the shadow.
 * @const {!Object}
 */
const SIZE_DEFINED_STYLE = {
  'position': 'absolute',
  'width': '100%',
  'height': '100%',
};

/**
 * Wraps a Preact Component in a BaseElement class.
 *
 * Most functionality should be done in Preact. We don't expose the BaseElement
 * subclass on purpose, you're not meant to do work in the subclass! There will
 * be very few exceptions, which is why we allow options to configure the
 * class.
 *
 * @template API_TYPE
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

    /** @private {{current: ?API_TYPE}} */
    this.ref_ = createRef();

    /** @private {?Array} */
    this.contextValues_ = null;

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

    /** @protected {?MutationObserver} */
    this.observer = null;
  }

  /**
   * A chance to initialize default Preact props for the element.
   *
   * @return {!JsonObject|undefined}
   */
  init() {}

  /** @override */
  buildCallback() {
    const Ctor = this.constructor;

    this.observer = new MutationObserver(this.checkMutations_.bind(this));
    const childrenInit = Ctor['children'] ? CHILDREN_MUTATION_INIT : null;
    const passthroughInit =
      Ctor['passthrough'] || Ctor['passthroughNonEmpty']
        ? PASSTHROUGH_MUTATION_INIT
        : null;
    this.observer.observe(this.element, {
      attributes: true,
      ...childrenInit,
      ...passthroughInit,
    });

    this.defaultProps_ = this.init() || null;

    const useContexts = Ctor['useContexts'];
    if (useContexts.length != 0) {
      subscribe(this.element, useContexts, (...contexts) => {
        this.contextValues_ = contexts.slice(0);
        this.scheduleRender_();
      });
    }

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
    return deferred.promise;
  }

  /** @override */
  unlayoutCallback() {
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

  /**
   * @return {!API_TYPE}
   * @protected
   */
  api() {
    return devAssert(this.ref_.current);
  }

  /**
   * @param {string} alias
   * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
   * @param {../action-constants.ActionTrust} minTrust
   * @protected
   */
  registerApiAction(alias, handler, minTrust) {
    this.registerAction(
      alias,
      (invocation) => handler(this.api(), invocation),
      minTrust
    );
  }

  /**
   * @param {!Array<!MutationRecord>} records
   * @private
   */
  checkMutations_(records) {
    const Ctor = this.constructor;
    const rerender = records.some((m) => shouldMutationBeRerendered(Ctor, m));
    if (rerender) {
      this.scheduleRender_();
    }
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
      render(null, this.container_);
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

    let toHydrate = false;
    if (!this.container_) {
      const doc = this.win.document;
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
        // Check if there's a pre-constructed shadow DOM.
        let {shadowRoot} = this.element;
        let container = shadowRoot && childElementByTag(shadowRoot, 'c');
        if (container) {
          toHydrate = true;
        } else {
          // Create new shadow root.
          shadowRoot = this.element.attachShadow({mode: 'open'});

          // The pre-constructed shadow root is required to have the stylesheet
          // inline. Thus, only the new shadow roots share the stylesheets.
          const shadowCss = Ctor['shadowCss'];
          if (shadowCss) {
            installShadowStyle(shadowRoot, this.element.tagName, shadowCss);
          }

          // Create container.
          // The pre-constructed shadow root is required to have this container.
          container = createElementWithAttributes(
            doc,
            'c',
            SHADOW_CONTAINER_ATTRS
          );
          shadowRoot.appendChild(container);

          // Create a slot for internal service elements i.e. "i-amphtml-sizer".
          // The pre-constructed shadow root is required to have this slot.
          const serviceSlot = createElementWithAttributes(
            doc,
            'slot',
            SERVICE_SLOT_ATTRS
          );
          shadowRoot.appendChild(serviceSlot);
        }
        this.container_ = container;
      } else {
        const container = doc.createElement('i-amphtml-c');
        this.container_ = container;
        this.applyFillContent(container);
        if (!Ctor['detached']) {
          this.element.appendChild(container);
        }
      }
    }

    // Exit early if contexts are not ready. Optional contexts will yield
    // right away, even when `null`. The required contexts will block the
    // `contextValues` until available.
    const useContexts = Ctor['useContexts'];
    const contextValues = this.contextValues_;
    const isReady = useContexts.length == 0 || contextValues != null;
    if (!isReady) {
      return;
    }

    // Process attributes and children.
    const props = collectProps(
      Ctor,
      this.element,
      this.ref_,
      this.defaultProps_
    );

    // While this "creates" a new element, diffing will not create a second
    // instance of Component. Instead, the existing one already rendered into
    // this element will be reused.
    let comp = Preact.createElement(Ctor['Component'], props);

    // Add contexts.
    if (useContexts.length != 0) {
      for (let i = 0; i < useContexts.length; i++) {
        const Context = useContexts[i].type;
        const value = contextValues[i];
        if (value) {
          comp = <Context.Provider value={value}>{comp}</Context.Provider>;
        }
      }
    }

    // Add AmpContext with renderable/playable proeprties.
    const v = <WithAmpContext {...this.context_}>{comp}</WithAmpContext>;

    if (toHydrate) {
      hydrate(v, this.container_);
    } else {
      render(v, this.container_);
    }

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
 * @protected {!Array<!ContextProp>}
 */
PreactBaseElement['useContexts'] = [];

/**
 * An override to specify that the component requires `layoutSizeDefined`.
 * This typically means that the element's `isLayoutSupported()` is
 * implemented via `isLayoutSizeDefined()`.
 *
 * @protected {string}
 */
PreactBaseElement['layoutSizeDefined'] = false;

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
 * The CSS for shadow stylesheets.
 *
 * @protected {?string}
 */
PreactBaseElement['shadowCss'] = null;

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
 * @param {{current: ?}} ref
 * @param {!JsonObject|null|undefined} defaultProps
 * @return {!JsonObject}
 */
function collectProps(Ctor, element, ref, defaultProps) {
  const props = /** @type {!JsonObject} */ ({...defaultProps, ref});

  const {
    'className': className,
    'layoutSizeDefined': layoutSizeDefined,
    'props': propDefs,
    'passthrough': passthrough,
    'passthroughNonEmpty': passthroughNonEmpty,
    'children': childrenDefs,
  } = Ctor;

  // Class.
  if (className) {
    props['className'] = className;
  }

  // Common styles.
  if (layoutSizeDefined) {
    props['style'] = SIZE_DEFINED_STYLE;
    props['containSize'] = true;
  }

  // Props.
  for (const name in propDefs) {
    const def = propDefs[name];
    const value =
      def.type == 'boolean'
        ? element.hasAttribute(def.attr)
        : element.getAttribute(def.attr);
    if (value == null) {
      if (def.default !== undefined) {
        props[name] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? parseFloat(value)
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
        props[name] = createSlot(
          childElement,
          childElement.getAttribute('slot') || `i-amphtml-${name}`,
          slotProps
        );
      } else {
        const list =
          name == 'children' ? children : props[name] || (props[name] = []);
        list.push(
          createSlot(
            childElement,
            childElement.getAttribute('slot') ||
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

/**
 * @param {!NodeList} nodeList
 * @return {boolean}
 */
function shouldMutationForNodeListBeRerendered(nodeList) {
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i];
    if (node.nodeType == /* ELEMENT */ 1) {
      // Ignore service elements, e.g. `<i-amphtml-svc>` or
      // `<x slot="i-amphtml-svc">`.
      if (
        startsWith(node.tagName, 'I-AMPHTML') ||
        node.getAttribute('slot') == 'i-amphtml-svc'
      ) {
        continue;
      }
      return true;
    }
    if (node.nodeType == /* TEXT */ 3) {
      return true;
    }
  }
  return false;
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!MutationRecord} m
 * @return {boolean}
 */
function shouldMutationBeRerendered(Ctor, m) {
  const {type} = m;
  if (type == 'attributes') {
    // Check if the attribute is mapped to one of the properties.
    const props = Ctor['props'];
    for (const name in props) {
      const def = props[name];
      if (m.attributeName == def.attr) {
        return true;
      }
    }
    return false;
  }
  if (type == 'childList') {
    return (
      shouldMutationForNodeListBeRerendered(m.addedNodes) ||
      shouldMutationForNodeListBeRerendered(m.removedNodes)
    );
  }
  return false;
}
