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
import {AmpEvents} from '../amp-events';
import {CanPlay, CanRender, LoadingProp} from '../contextprops';
import {Deferred} from '../utils/promise';
import {Loading} from '../loading';
import {Slot, createSlot} from './slot';
import {WithAmpContext} from './context';
import {addGroup, setGroupProp, setParent, subscribe} from '../context';
import {cancellation} from '../error';
import {childElementByTag, createElementWithAttributes, matches} from '../dom';
import {createCustomEvent} from '../event-helper';
import {createRef, hydrate, render} from './index';
import {devAssert} from '../log';
import {dict, hasOwn} from '../utils/object';
import {getDate} from '../utils/date';
import {getMode} from '../mode';
import {installShadowStyle} from '../shadow-embed';
import {isLayoutSizeDefined} from '../layout';
import {startsWith} from '../string';

/**
 * The following combinations are allowed.
 * - `attr` and (optionally) `type` can be specified when an attribute maps to
 *   a component prop 1:1.
 * - `attrs` and `parseAttrs` can be specified when multiple attributes map
 *   to a single prop.
 *
 * @typedef {{
 *   attr: (string|undefined),
 *   type: (string|undefined),
 *   attrs: (!Array<string>|undefined),
 *   parseAttrs: ((function(!Element):*)|undefined),
 *   default: *,
 * }}
 */
let AmpElementPropDef;

/**
 * @typedef {{
 *   name: string,
 *   selector: string,
 *   single: (boolean|undefined),
 *   clone: (boolean|undefined),
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

/** @const {!MutationObserverInit} */
const TEMPLATES_MUTATION_INIT = {
  childList: true,
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
 * This is an internal property that marks light DOM nodes that were rendered
 * by AMP/Preact bridge and thus must be ignored by the mutation observer to
 * avoid mutate->rerender->mutate loops.
 */
const RENDERED_PROP = '__AMP_RENDERED';

const UNSLOTTED_GROUP = 'unslotted';

/** @return {boolean} */
const MATCH_ANY = () => true;

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

    /** @private {!JsonObject} */
    this.defaultProps_ = dict({
      'loading': Loading.AUTO,
      'onLoad': this.onLoad_.bind(this),
      'onLoadError': this.onLoadError_.bind(this),
    });

    /** @private {!AmpContextDef.ContextType} */
    this.context_ = {
      renderable: false,
      playable: false,
      loading: Loading.LAZY,
      notify: () => this.mutateElement(() => {}),
    };

    /** @private {{current: ?API_TYPE}} */
    this.ref_ = createRef();

    /** @private {?Array} */
    this.contextValues_ = null;

    /** @private {?Node} */
    this.container_ = null;

    /** @private {boolean} */
    this.scheduledRender_ = false;

    /** @private {?Deferred} */
    this.renderDeferred_ = null;

    /** @private @const {function()} */
    this.boundRerender_ = () => {
      this.scheduledRender_ = false;
      this.rerender_();
    };

    /** @private {boolean} */
    this.hydrationPending_ = false;

    /** @private {boolean} */
    this.mounted_ = false;

    /** @private {?Deferred} */
    this.loadDeferred_ = null;

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
  isLayoutSupported(layout) {
    const Ctor = this.constructor;
    if (Ctor['layoutSizeDefined']) {
      return isLayoutSizeDefined(layout);
    }
    return super.isLayoutSupported(layout);
  }

  /** @override */
  buildCallback() {
    const Ctor = this.constructor;

    this.observer = new MutationObserver(this.checkMutations_.bind(this));
    const childrenInit = Ctor['children'] ? CHILDREN_MUTATION_INIT : null;
    const passthroughInit =
      Ctor['passthrough'] || Ctor['passthroughNonEmpty']
        ? PASSTHROUGH_MUTATION_INIT
        : null;
    const templatesInit = Ctor['usesTemplate'] ? TEMPLATES_MUTATION_INIT : null;
    this.observer.observe(this.element, {
      attributes: true,
      ...childrenInit,
      ...passthroughInit,
      ...templatesInit,
    });

    const staticProps = Ctor['staticProps'];
    const initProps = this.init();
    Object.assign(
      /** @type {!Object} */ (this.defaultProps_),
      staticProps,
      initProps
    );

    this.checkPropsPostMutations();

    // Unblock rendering on first `CanRender` response. And keep the context
    // in-sync.
    subscribe(
      this.element,
      [CanRender, CanPlay, LoadingProp],
      (canRender, canPlay, loading) => {
        this.context_.renderable = canRender;
        this.context_.playable = canPlay;
        // TODO(#30283): trust "loading" completely from the context once it's
        // fully supported.
        this.context_.loading =
          loading == Loading.AUTO ? Loading.LAZY : loading;
        this.mounted_ = true;
        this.scheduleRender_();
      }
    );

    const useContexts = Ctor['useContexts'];
    if (useContexts.length != 0) {
      subscribe(this.element, useContexts, (...contexts) => {
        this.contextValues_ = contexts;
        this.scheduleRender_();
      });
    }

    this.renderDeferred_ = new Deferred();
    this.scheduleRender_();
    return this.renderDeferred_.promise;
  }

  /** @override */
  layoutCallback() {
    const Ctor = this.constructor;
    if (!Ctor['loadable']) {
      return super.layoutCallback();
    }

    this.mutateProps(dict({'loading': Loading.EAGER}));

    // Check if the element has already been loaded.
    const api = this.ref_.current;
    if (api && api['complete']) {
      return Promise.resolve();
    }

    // If not, wait for `onLoad` callback.
    this.loadDeferred_ = new Deferred();
    return this.loadDeferred_.promise;
  }

  /** @override */
  unlayoutCallback() {
    const Ctor = this.constructor;
    if (!Ctor['loadable']) {
      return super.unlayoutCallback();
    }
    this.mutateProps(dict({'loading': Loading.UNLOAD}));
    this.onLoadError_(cancellation());
    return true;
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
    Object.assign(/** @type {!Object} */ (this.defaultProps_), props);
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
   * A callback called immediately or after mutations have been observed. The
   * implementation can verify if any additional properties need to be mutated
   * via `mutateProps()` API.
   * @protected
   */
  checkPropsPostMutations() {}

  /**
   * A callback called to compute props before rendering is run. The properties
   * computed here and ephemeral and thus should not be persisted via a
   * `mutateProps()` method.
   * @param {!JsonObject} unusedProps
   * @protected
   */
  updatePropsForRendering(unusedProps) {}

  /**
   * A callback called to check whether the element is ready for rendering.
   * @param {!JsonObject} unusedProps
   * @return {boolean}
   * @protected
   */
  isReady(unusedProps) {
    return true;
  }

  /**
   * @param {!Array<!MutationRecord>} records
   * @private
   */
  checkMutations_(records) {
    const Ctor = this.constructor;
    const rerender = records.some((m) => shouldMutationBeRerendered(Ctor, m));
    if (rerender) {
      this.checkPropsPostMutations();
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
  onLoad_() {
    if (this.loadDeferred_) {
      this.loadDeferred_.resolve();
      this.loadDeferred_ = null;
    }
  }

  /**
   * @param {*} opt_reason
   * @private
   */
  onLoadError_(opt_reason) {
    if (this.loadDeferred_) {
      this.loadDeferred_.reject(opt_reason || new Error('load error'));
      this.loadDeferred_ = null;
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
    const isShadow = usesShadowDom(Ctor);
    const lightDomTag = isShadow ? null : Ctor['lightDomTag'];
    const isDetached = Ctor['detached'];

    if (!this.container_) {
      const doc = this.win.document;
      if (isShadow) {
        devAssert(
          !isDetached,
          'The AMP element cannot be rendered in detached mode ' +
            'when configured with "children", "passthrough", or ' +
            '"passthroughNonEmpty" properties.'
        );
        // Check if there's a pre-constructed shadow DOM.
        let {shadowRoot} = this.element;
        let container = shadowRoot && childElementByTag(shadowRoot, 'c');
        if (container) {
          this.hydrationPending_ = true;
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

        // Connect shadow root to the element's context.
        setParent(shadowRoot, this.element);
        // In Shadow DOM, only the children distributed in
        // slots are displayed. All other children are undisplayed. We need
        // to create a simple mechanism that would automatically compute
        // `CanRender = false` on undistributed children.
        addGroup(this.element, UNSLOTTED_GROUP, MATCH_ANY, /* weight */ -1);
        setGroupProp(this.element, UNSLOTTED_GROUP, CanRender, this, false);
      } else if (lightDomTag) {
        this.container_ = this.element;
        const replacement =
          childElementByTag(this.container_, lightDomTag) ||
          doc.createElement(lightDomTag);
        replacement[RENDERED_PROP] = true;
        if (Ctor['layoutSizeDefined']) {
          replacement.classList.add('i-amphtml-fill-content');
        }
        this.container_.appendChild(replacement);
      } else {
        const container = doc.createElement('i-amphtml-c');
        this.container_ = container;
        this.applyFillContent(container);
        if (!isDetached) {
          this.element.appendChild(container);
        }
      }
    }

    // Exit early if contexts are not ready. Optional contexts will yield
    // right away, even when `null`. The required contexts will block the
    // `contextValues` until available.
    const useContexts = Ctor['useContexts'];
    const contextValues = this.contextValues_;
    const isContextReady = useContexts.length == 0 || contextValues != null;
    if (!isContextReady) {
      return;
    }

    // Process attributes and children.
    const props = collectProps(
      Ctor,
      this.element,
      this.ref_,
      this.defaultProps_
    );
    this.updatePropsForRendering(props);

    if (!this.isReady(props)) {
      return;
    }

    // While this "creates" a new element, diffing will not create a second
    // instance of Component. Instead, the existing one already rendered into
    // this element will be reused.
    let comp = Preact.createElement(Ctor['Component'], props);

    // Add contexts.
    for (let i = 0; i < useContexts.length; i++) {
      const Context = useContexts[i].type;
      const value = contextValues[i];
      if (value) {
        comp = <Context.Provider value={value}>{comp}</Context.Provider>;
      }
    }

    // Add AmpContext with renderable/playable proeprties.
    const v = <WithAmpContext {...this.context_}>{comp}</WithAmpContext>;

    if (this.hydrationPending_) {
      this.hydrationPending_ = false;
      hydrate(v, this.container_);
    } else {
      const replacement = lightDomTag
        ? childElementByTag(this.container_, lightDomTag)
        : null;
      if (replacement) {
        replacement[RENDERED_PROP] = true;
      }
      render(v, this.container_, replacement);
    }

    // Dispatch the DOM_UPDATE event when rendered in the light DOM.
    if (!isShadow && !isDetached) {
      this.mutateElement(() => {
        this.element.dispatchEvent(
          createCustomEvent(this.win, AmpEvents.DOM_UPDATE, /* detail */ null, {
            bubbles: true,
          })
        );
      });
    }

    if (this.renderDeferred_) {
      this.renderDeferred_.resolve();
      this.renderDeferred_ = null;
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
 * If default props are static, this can be used instead of init().
 * @protected {!JsonObject|undefined}
 */
PreactBaseElement['staticProps'] = undefined;

/**
 * @protected {!Array<!ContextProp>}
 */
PreactBaseElement['useContexts'] = getMode().localDev ? Object.freeze([]) : [];

/**
 * Whether the component implements a loading protocol.
 *
 * @protected {boolean}
 */
PreactBaseElement['loadable'] = false;

/**
 * An override to specify that the component requires `layoutSizeDefined`.
 * This typically means that the element's `isLayoutSupported()` is
 * implemented via `isLayoutSizeDefined()`, and this is how the default
 * `isLayoutSupported()` is implemented when this flag is set.
 *
 * @protected {string}
 */
PreactBaseElement['layoutSizeDefined'] = false;

/**
 * The tag name, e.g. "div", "span", time" that should be used as a replacement
 * node for Preact rendering. This is the node that Preact will diff with
 * with specified, instead of rendering a new node. Only applicable to light-DOM
 * mapping styles.
 *
 * @protected {string}
 */
PreactBaseElement['lightDomTag'] = '';

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
 * Whether this element uses "templates" system.
 *
 * @protected {boolean}
 */
PreactBaseElement['usesTemplate'] = false;

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
 * @return {boolean}
 */
function usesShadowDom(Ctor) {
  return !!(
    Ctor['children'] ||
    Ctor['passthrough'] ||
    Ctor['passthroughNonEmpty']
  );
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!AmpElement} element
 * @param {{current: ?}} ref
 * @param {!JsonObject|null|undefined} defaultProps
 * @return {!JsonObject}
 */
function collectProps(Ctor, element, ref, defaultProps) {
  const {
    'children': childrenDefs,
    'className': className,
    'layoutSizeDefined': layoutSizeDefined,
    'lightDomTag': lightDomTag,
    'passthrough': passthrough,
    'passthroughNonEmpty': passthroughNonEmpty,
    'props': propDefs,
  } = Ctor;

  const props = /** @type {!JsonObject} */ ({...defaultProps, ref});

  // Light DOM.
  if (lightDomTag) {
    props[RENDERED_PROP] = true;
    props['as'] = lightDomTag;
  }

  // Class.
  if (className) {
    props['className'] = className;
  }

  // Common styles.
  if (layoutSizeDefined) {
    if (usesShadowDom(Ctor)) {
      props['style'] = SIZE_DEFINED_STYLE;
    } else {
      props['className'] =
        `i-amphtml-fill-content ${className || ''}`.trim() || null;
    }
  }

  // Props.
  for (const name in propDefs) {
    const def = /** @type {!AmpElementPropDef} */ (propDefs[name]);
    let value;
    if (def.attr) {
      value =
        def.type == 'boolean'
          ? element.hasAttribute(def.attr)
          : element.getAttribute(def.attr);
    } else if (def.parseAttrs) {
      devAssert(def.attrs);
      value = def.parseAttrs(element);
    }
    if (value == null) {
      if (def.default !== undefined) {
        props[name] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? parseFloat(value)
          : def.type == 'date'
          ? getDate(value)
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

      const {single, name, clone, props: slotProps = {}} = def;

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
          clone
            ? createShallowVNodeCopy(childElement)
            : createSlot(
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
 * Copies an Element into a VNode representation.
 * (Interpretation into VNode is not recursive, so it excludes children.)
 * @param {!Element} element
 * @return {!PreactDef.Renderable}
 */
function createShallowVNodeCopy(element) {
  const props = {
    // Setting `key` to an object is fine in Preact, but not React.
    'key': element,
  };
  // We need to read element.attributes and element.attributes.length only once,
  // since reading a live NamedNodeMap repeatedly is expensive.
  const {attributes, localName} = element;
  const {length} = attributes;
  for (let i = 0; i < length; i++) {
    const {name, value} = attributes[i];
    props[name] = value;
  }
  return Preact.createElement(localName, props);
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
        node[RENDERED_PROP] ||
        startsWith(node.tagName, 'I-') ||
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
    // Check whether this is a templates attribute.
    if (Ctor['usesTemplate'] && m.attributeName == 'template') {
      return true;
    }
    // Check if the attribute is mapped to one of the properties.
    const props = Ctor['props'];
    for (const name in props) {
      const def = /** @type {!AmpElementPropDef} */ (props[name]);
      if (
        m.attributeName == def.attr ||
        (def.attrs && def.attrs.includes(devAssert(m.attributeName)))
      ) {
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
