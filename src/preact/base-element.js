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
import {ActionTrust} from '../action-constants';
import {AmpEvents} from '../amp-events';
import {CanPlay, CanRender, LoadingProp} from '../core/contextprops';
import {Deferred} from '../utils/promise';
import {Layout, isLayoutSizeDefined} from '../layout';
import {Loading} from '../core/loading-instructions';
import {MediaQueryProps} from '../utils/media-query-props';
import {ReadyState} from '../ready-state';
import {Slot, createSlot} from './slot';
import {WithAmpContext} from './context';
import {
  addGroup,
  discover,
  setGroupProp,
  setParent,
  subscribe,
} from '../context';
import {
  childElementByTag,
  createElementWithAttributes,
  dispatchCustomEvent,
  matches,
  parseBooleanAttribute,
} from '../dom';
import {dashToCamelCase} from '../string';
import {devAssert} from '../log';
import {dict, hasOwn, map} from '../utils/object';
import {getDate} from '../utils/date';
import {getMode} from '../mode';
import {hydrate, render} from './index';
import {installShadowStyle} from '../shadow-embed';
import {observeContentSize, unobserveContentSize} from '../utils/size-observer';
import {sequentialIdGenerator} from '../utils/id-generator';
import {toArray} from '../types';

/**
 * The following combinations are allowed.
 * - `attr`, (optionally) `type`, and (optionally) `media` can be specified when
 *   an attribute maps to a component prop 1:1.
 * - `attrs` and `parseAttrs` can be specified when multiple attributes map
 *   to a single prop.
 * - `attrPrefix` can be specified when multiple attributes with the same prefix
 *   map to a single prop object. The prefix cannot equal the attribute name.
 * - `selector` can be specified for children of a certain shape and structure
 *   according to ChildDef.
 * - `passthrough` can be specified to slot children using a single
 *   `<slot>` element for all children. This is in contrast to selector mode,
 *   which creates a new named `<slot>` for every selector.
 * - `passthroughNonEmpty` is similar to passthrough mode except that when there
 *   are no children elements, the returned value will be null instead of the
 *   unnamed `<slot>`. This allows the Preact environment to have conditional
 *   behavior depending on whether or not there are children.
 *
 * @typedef {{
 *   attr: (string|undefined),
 *   type: (string|undefined),
 *   attrPrefix: (string|undefined),
 *   attrs: (!Array<string>|undefined),
 *   parseAttrs: ((function(!Element):*)|undefined),
 *   media: (boolean|undefined),
 *   default: *,
 * }|string}
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
const SHADOW_CONTAINER_ATTRS = dict({
  'style': 'display: contents; background: inherit;',
  'part': 'c',
});

/** @const {!JsonObject<string, string>} */
const SERVICE_SLOT_ATTRS = dict({'name': 'i-amphtml-svc'});

/**
 * The same as `applyFillContent`, but inside the shadow.
 * @const {!Object}
 */
const SIZE_DEFINED_STYLE = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
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

const childIdGenerator = sequentialIdGenerator();

const ONE_OF_ERROR_MESSAGE =
  'Only one of "attr", "attrs", "attrPrefix", "passthrough", ' +
  '"passthroughNonEmpty", or "selector" must be given';

/**
 * @param {!Object<string, !AmpElementPropDef>} propDefs
 * @param {function(!AmpElementPropDef):boolean} cb
 * @return {boolean}
 */
function checkPropsFor(propDefs, cb) {
  return Object.values(propDefs).some(cb);
}

/**
 * @param {!AmpElementPropDef} def
 * @return {boolean}
 */
const HAS_MEDIA = (def) => !!def.media;

/**
 * @param {!AmpElementPropDef} def
 * @return {boolean}
 */
const HAS_SELECTOR = (def) => typeof def === 'string' || !!def.selector;

/**
 * @param {!AmpElementPropDef} def
 * @return {boolean}
 */
const HAS_PASSTHROUGH = (def) => !!(def.passthrough || def.passthroughNonEmpty);

/**
 * @param {Node} node
 * @return {boolean}
 */
const IS_EMPTY_TEXT_NODE = (node) =>
  node.nodeType === /* TEXT_NODE */ 3 && node.nodeValue.trim().length === 0;

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
  /** @override @nocollapse */
  static V1() {
    return true;
  }

  /** @override @nocollapse */
  static requiresShadowDom() {
    // eslint-disable-next-line local/no-static-this
    return this['usesShadowDom'];
  }

  /** @override @nocollapse */
  static usesLoading() {
    // eslint-disable-next-line local/no-static-this
    const Ctor = this;
    return Ctor['loadable'];
  }

  /** @override @nocollapse */
  static prerenderAllowed() {
    // eslint-disable-next-line local/no-static-this
    const Ctor = this;
    return !Ctor.usesLoading();
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!JsonObject} */
    this.defaultProps_ = dict({
      'loading': Loading.AUTO,
      'onReadyState': this.onReadyState_.bind(this),
      'onPlayingState': this.updateIsPlaying_.bind(this),
    });

    /** @private {!AmpContextDef.ContextType} */
    this.context_ = {
      renderable: false,
      playable: true,
      loading: Loading.AUTO,
      notify: () => this.mutateElement(() => {}),
    };

    /** @private {boolean} */
    this.resetLoading_ = false;

    /** @private {?API_TYPE} */
    this.apiWrapper_ = null;

    /** @private {?API_TYPE} */
    this.currentRef_ = null;

    /** @param {?API_TYPE|null} current */
    this.refSetter_ = (current) => {
      // The API shape **must** be consistent.
      if (current !== null) {
        if (this.apiWrapper_) {
          this.checkApiWrapper_(current);
        } else {
          this.initApiWrapper_(current);
        }
      }
      this.currentRef_ = current;
      this.maybeUpdateReadyState_();
    };

    /** @type {?Deferred<!API_TYPE>} */
    this.deferredApi_ = null;

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

    /** @protected {?MutationObserver} */
    this.observer = null;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @protected {?MediaQueryProps} */
    this.mediaQueryProps_ = null;

    this.pauseWhenNoSize_ = this.pauseWhenNoSize_.bind(this);
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
      return (
        isLayoutSizeDefined(layout) ||
        // This allows a developer to specify the component's size using the
        // user stylesheet without the help of AMP's static layout rules.
        // Bento components use `ContainWrapper` with `contain:strict`, thus
        // if a user stylesheet doesn't provide for the appropriate size, the
        // element's size will be 0. The user stylesheet CSS can use
        // fixed `width`/`height`, `aspect-ratio`, `flex`, `grid`, or any
        // other CSS layouts coupled with `@media` queries and other CSS tools.
        // Besides normal benefits of using plain CSS, an important feature of
        // using this layout is that AMP does not add "sizer" elements thus
        // keeping the user DOM clean.
        layout == Layout.CONTAINER
      );
    }
    return super.isLayoutSupported(layout);
  }

  /** @override */
  buildCallback() {
    const Ctor = this.constructor;

    this.observer = new MutationObserver(this.checkMutations_.bind(this));
    const props = Ctor['props'];
    const childrenInit = checkPropsFor(props, HAS_SELECTOR)
      ? CHILDREN_MUTATION_INIT
      : null;
    const passthroughInit = checkPropsFor(props, HAS_PASSTHROUGH)
      ? PASSTHROUGH_MUTATION_INIT
      : null;
    const templatesInit = Ctor['usesTemplate'] ? TEMPLATES_MUTATION_INIT : null;
    this.observer.observe(this.element, {
      attributes: true,
      ...childrenInit,
      ...passthroughInit,
      ...templatesInit,
    });

    this.mediaQueryProps_ = checkPropsFor(props, HAS_MEDIA)
      ? new MediaQueryProps(this.win, () => this.scheduleRender_())
      : null;

    const staticProps = Ctor['staticProps'];
    const initProps = this.init();
    Object.assign(
      /** @type {!Object} */ (this.defaultProps_),
      staticProps,
      initProps
    );

    this.checkPropsPostMutations();

    // Unmount callback.
    subscribe(this.element, [], () => {
      return () => {
        this.mounted_ = false;
        if (this.container_) {
          // We have to unmount the component to run all cleanup functions and
          // release handlers. The only way to unmount right now is by
          // unrendering the DOM. If the new `unmount` API becomes available, this
          // code can be changed to `unmount` and the follow up render would
          // have to execute the fast `hydrate` API.
          render(null, this.container_);
        }
      };
    });

    // Unblock rendering on first `CanRender` response. And keep the context
    // in-sync.
    subscribe(
      this.element,
      [CanRender, CanPlay, LoadingProp],
      (canRender, canPlay, loading) => {
        this.context_.renderable = canRender;
        this.context_.playable = canPlay;
        this.context_.loading = loading;
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

    if (Ctor['loadable']) {
      this.setReadyState(ReadyState.LOADING);
    }
    this.maybeUpdateReadyState_();

    return this.renderDeferred_.promise;
  }

  /** @override */
  ensureLoaded() {
    const Ctor = this.constructor;
    if (!Ctor['loadable']) {
      return;
    }
    this.mutateProps(dict({'loading': Loading.EAGER}));
    this.resetLoading_ = true;
  }

  /** @override */
  mountCallback() {
    discover(this.element);
    const Ctor = this.constructor;
    if (Ctor['loadable'] && this.getProp('loading') != Loading.AUTO) {
      this.mutateProps({'loading': Loading.AUTO});
      this.resetLoading_ = false;
    }
  }

  /** @override */
  unmountCallback() {
    discover(this.element);
    const Ctor = this.constructor;
    if (Ctor['loadable']) {
      this.mutateProps({'loading': Loading.UNLOAD});
    }
    this.updateIsPlaying_(false);
    this.mediaQueryProps_?.dispose();
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
    return devAssert(this.currentRef_);
  }

  /**
   * @param {string} alias
   * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
   * @param {../action-constants.ActionTrust} minTrust
   * @protected
   */
  registerApiAction(alias, handler, minTrust = ActionTrust.DEFAULT) {
    this.registerAction(
      alias,
      (invocation) => handler(this.api(), invocation),
      minTrust
    );
  }

  /**
   * A callback called immediately after mutations have been observed on a
   * component. This differs from `checkPropsPostMutations` in that it is
   * called in all cases of mutation.
   * @param {!Array<MutationRecord>} unusedRecords
   * @protected
   */
  mutationObserverCallback(unusedRecords) {}

  /**
   * A callback called immediately after mutations have been observed on a
   * component's defined props. The implementation can verify if any
   * additional properties need to be mutated via `mutateProps()` API.
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
    this.mutationObserverCallback(records);
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
  maybeUpdateReadyState_() {
    const {currentRef_: api} = this;

    const apiReadyState = api?.['readyState'];
    if (apiReadyState && apiReadyState !== this.element.readyState) {
      this.onReadyState_(apiReadyState);
    }
  }

  /**
   * @param {!ReadyState} state
   * @param {*=} opt_failure
   * @private
   */
  onReadyState_(state, opt_failure) {
    this.setReadyState(state, opt_failure);

    const Ctor = this.constructor;
    if (Ctor['unloadOnPause']) {
      // These are typically iframe-based elements where we don't know
      // whether a media is currently playing. So we have to assume that
      // it is whenever the element is loaded.
      this.updateIsPlaying_(state == ReadyState.COMPLETE);
    }

    // Reset "loading" property back to "auto".
    if (this.resetLoading_) {
      this.resetLoading_ = false;
      this.mutateProps({'loading': Loading.AUTO});
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
    const isShadow = Ctor['usesShadowDom'];
    const lightDomTag = isShadow ? null : Ctor['lightDomTag'];
    const isDetached = Ctor['detached'];

    if (!this.container_) {
      const doc = this.win.document;
      if (isShadow) {
        devAssert(
          !isDetached,
          'The AMP element cannot be rendered in detached mode ' +
            'when "props" are configured with "children" property.'
        );
        // Check if there's a pre-constructed shadow DOM.
        let {shadowRoot} = this.element;
        let container = shadowRoot && childElementByTag(shadowRoot, 'c');
        if (container) {
          this.hydrationPending_ = true;
        } else {
          // Create new shadow root.
          shadowRoot = this.element.attachShadow({
            mode: 'open',
            delegatesFocus: Ctor['delegatesFocus'],
          });

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
      this.refSetter_,
      this.defaultProps_,
      this.mediaQueryProps_
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
      this.mutateElement(() =>
        dispatchCustomEvent(this.element, AmpEvents.DOM_UPDATE, null)
      );
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

  /**
   * Returns reference to upgraded imperative API object, as in React's
   * useImperativeHandle.
   *
   * @return {!Promise<!API_TYPE>}
   * @override
   */
  getApi() {
    const api = this.apiWrapper_;
    if (api) {
      return Promise.resolve(api);
    }
    if (!this.deferredApi_) {
      this.deferredApi_ = new Deferred();
    }
    return this.deferredApi_.promise;
  }

  /**
   * Creates a wrapper around a Preact ref. The API surface exposed by this ref
   * **must** be consistent accross all rerenders.
   *
   * This wrapper is necessary because every time React rerenders, it creates
   * (depending on deps checking) a new imperative handle and sets that to
   * `ref.current`. So if we ever returned `ref.current` directly, it could go
   * stale by the time its actually used.
   *
   * @param {!API_TYPE} current
   * @private
   */
  initApiWrapper_(current) {
    const api = map();
    const keys = Object.keys(current);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      wrapRefProperty(this, api, key);
    }
    this.apiWrapper_ = api;
    if (this.deferredApi_) {
      this.deferredApi_.resolve(api);
      this.deferredApi_ = null;
    }
  }

  /**
   * Verifies that every Preact render exposes the same API surface as the previous render.
   * If it does not, the API wrapper is syncrhonized.
   *
   * @param {!API_TYPE} current
   * @private
   */
  checkApiWrapper_(current) {
    if (!getMode().localDev) {
      return;
    }
    // Hack around https://github.com/preactjs/preact/issues/3084
    if (current.constructor && current.constructor.name !== 'Object') {
      return;
    }
    const api = this.apiWrapper_;
    const newKeys = Object.keys(current);
    for (let i = 0; i < newKeys.length; i++) {
      const key = newKeys[i];
      devAssert(
        hasOwn(api, key),
        'Inconsistent Bento API shape: imperative API gained a "%s" key for %s',
        key,
        this.element
      );
    }
    const oldKeys = Object.keys(api);
    for (let i = 0; i < oldKeys.length; i++) {
      const key = oldKeys[i];
      devAssert(
        hasOwn(current, key),
        'Inconsistent Bento API shape: imperative API lost a "%s" key for %s',
        key,
        this.element
      );
    }
  }

  /**
   * Dispatches an error event. Provided as a method so Preact components can
   * call into it, while AMP components can override to trigger action services.
   * @param {!Element} element
   * @param {string} eventName
   * @param {!JSONObject|string|undefined|null} detail
   * @return {!Object}
   */
  triggerEvent(element, eventName, detail) {
    dispatchCustomEvent(element, eventName, detail);
  }

  /** @override */
  pauseCallback() {
    const Ctor = this.constructor;
    if (Ctor['unloadOnPause']) {
      this.mutateProps(dict({'loading': Loading.UNLOAD}));
      this.resetLoading_ = true;
    } else {
      const {currentRef_: api} = this;
      api?.['pause']?.();
    }
  }

  /**
   * @param {boolean} isPlaying
   * @private
   */
  updateIsPlaying_(isPlaying) {
    if (isPlaying === this.isPlaying_) {
      return;
    }
    this.isPlaying_ = isPlaying;
    if (isPlaying) {
      observeContentSize(this.element, this.pauseWhenNoSize_);
    } else {
      unobserveContentSize(this.element, this.pauseWhenNoSize_);
    }
  }

  /**
   * @param {!../../../src/layout-rect.LayoutSizeDef} size
   * @private
   */
  pauseWhenNoSize_({width, height}) {
    const hasSize = width > 0 && height > 0;
    if (!hasSize) {
      this.pauseCallback();
    }
  }
}

/**
 * @param {tyepof PreactBaseElement} baseElement
 * @param {!Object} api
 * @param {string} key
 */
function wrapRefProperty(baseElement, api, key) {
  Object.defineProperty(api, key, {
    configurable: true,

    get() {
      return baseElement.currentRef_[key];
    },

    set(v) {
      baseElement.currentRef_[key] = v;
    },
  });
}

/**
 * Returns the upgraded imperative API object, once Preact has actually mounted.
 *
 * This technically works with both Bento and Legacy components, returning the
 * BaseElement instance in the later case.
 *
 * @param {!Element} el
 * @return {!Promise<!Object>}
 */
export function whenUpgraded(el) {
  return el.ownerDocument.defaultView.customElements
    .whenDefined(el.localName)
    .then(() => el.getImpl())
    .then((impl) => impl.getApi());
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
 * Whether a component should be unloaded for `pauseCallback`.
 *
 * @protected {boolean}
 */
PreactBaseElement['unloadOnPause'] = false;

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
 * Whether this element uses Shadow DOM.
 *
 * @protected {boolean}
 */
PreactBaseElement['usesShadowDom'] = false;

/**
 * Enabling detached mode alters the children to be rendered in an
 * unappended container. By default the children will be attached to the DOM.
 *
 * @protected {boolean}
 */
PreactBaseElement['detached'] = false;

/**
 * This enables the 'delegatesFocus' option when creating the shadow DOM for
 * this component.  A key feature of 'delegatesFocus' set to true is that
 * when elements within the shadow DOM gain focus, the focus is also applied
 * to the host element.
 */
PreactBaseElement['delegatesFocus'] = false;

/**
 * Provides a mapping of Preact prop to AmpElement DOM attributes.
 *
 * @protected {!Object<string, !AmpElementPropDef>}
 */
PreactBaseElement['props'] = {};

/**
 * @param {null|string} attributeName
 * @param {string|undefined} attributePrefix
 * @return {boolean}
 */
function matchesAttrPrefix(attributeName, attributePrefix) {
  return (
    attributeName !== null &&
    attributePrefix !== undefined &&
    attributeName.startsWith(attributePrefix) &&
    attributeName !== attributePrefix
  );
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!AmpElement} element
 * @param {{current: ?}} ref
 * @param {!JsonObject|null|undefined} defaultProps
 * @param {?MediaQueryProps} mediaQueryProps
 * @return {!JsonObject}
 */
function collectProps(Ctor, element, ref, defaultProps, mediaQueryProps) {
  const {
    'className': className,
    'layoutSizeDefined': layoutSizeDefined,
    'lightDomTag': lightDomTag,
    'props': propDefs,
  } = Ctor;

  if (mediaQueryProps) {
    mediaQueryProps.start();
  }

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
    if (Ctor['usesShadowDom']) {
      props['style'] = SIZE_DEFINED_STYLE;
    } else {
      props['className'] =
        `i-amphtml-fill-content ${className || ''}`.trim() || null;
    }
  }

  // Props.
  parsePropDefs(Ctor, props, propDefs, element, mediaQueryProps);
  if (mediaQueryProps) {
    mediaQueryProps.complete();
  }

  return props;
}

/**
 * @param {typeof PreactBaseElement} Ctor
 * @param {!Object} props
 * @param {!Object} propDefs
 * @param {!Element} element
 * @param {?MediaQueryProps} mediaQueryProps
 */
function parsePropDefs(Ctor, props, propDefs, element, mediaQueryProps) {
  // Match all children defined with "selector".
  if (checkPropsFor(propDefs, HAS_SELECTOR)) {
    // There are plain "children" and there're slotted children assigned
    // as separate properties. Thus in a carousel the plain "children" are
    // slides, and the "arrowNext" children are passed via a "arrowNext"
    // property.
    const nodes = element.getRealChildNodes
      ? element.getRealChildNodes()
      : toArray(element.childNodes);
    for (let i = 0; i < nodes.length; i++) {
      const childElement = nodes[i];
      const match = matchChild(childElement, propDefs);
      if (!match) {
        continue;
      }
      const def = propDefs[match];
      const {single, name = match, clone, props: slotProps = {}} = def;
      devAssert(clone || Ctor['usesShadowDom']);
      const parsedSlotProps = {};
      parsePropDefs(
        Ctor,
        parsedSlotProps,
        slotProps,
        childElement,
        mediaQueryProps
      );

      // TBD: assign keys, reuse slots, etc.
      if (single) {
        props[name] = createSlot(
          childElement,
          childElement.getAttribute('slot') || `i-amphtml-${name}`,
          parsedSlotProps
        );
      } else {
        const list = props[name] || (props[name] = []);
        list.push(
          clone
            ? createShallowVNodeCopy(childElement)
            : createSlot(
                childElement,
                childElement.getAttribute('slot') ||
                  `i-amphtml-${name}-${childIdGenerator()}`,
                parsedSlotProps
              )
        );
      }
    }
  }

  for (const name in propDefs) {
    const def = /** @type {!AmpElementPropDef} */ (propDefs[name]);
    devAssert(
      !!def.attr +
        !!def.attrs +
        !!def.attrPrefix +
        !!def.selector +
        !!def.passthrough +
        !!def.passthroughNonEmpty <=
        1,
      ONE_OF_ERROR_MESSAGE
    );
    let value;
    if (def.passthrough) {
      devAssert(Ctor['usesShadowDom']);
      // Use lazy loading inside the passthrough by default due to too many
      // elements.
      value = [<Slot loading={Loading.LAZY} />];
    } else if (def.passthroughNonEmpty) {
      devAssert(Ctor['usesShadowDom']);
      // Use lazy loading inside the passthrough by default due to too many
      // elements.
      value = element.getRealChildNodes().every(IS_EMPTY_TEXT_NODE)
        ? null
        : [<Slot loading={Loading.LAZY} />];
    } else if (def.attr) {
      value = element.getAttribute(def.attr);
      if (def.media && value != null) {
        value = mediaQueryProps.resolveListQuery(String(value));
      }
    } else if (def.parseAttrs) {
      devAssert(def.attrs);
      value = def.parseAttrs(element);
    } else if (def.attrPrefix) {
      const currObj = {};
      let objContains = false;
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attrib = attrs[i];
        if (matchesAttrPrefix(attrib.name, def.attrPrefix)) {
          currObj[dashToCamelCase(attrib.name.slice(def.attrPrefix.length))] =
            attrib.value;
          objContains = true;
        }
      }
      if (objContains) {
        value = currObj;
      }
    }
    if (value == null) {
      if (def.default != null) {
        props[name] = def.default;
      }
    } else {
      const v =
        def.type == 'number'
          ? parseFloat(value)
          : def.type == 'boolean'
          ? parseBooleanAttribute(/** @type {string} */ (value))
          : def.type == 'date'
          ? getDate(value)
          : value;
      props[name] = v;
    }
  }
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
      return match;
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
        node.tagName.startsWith('I-') ||
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
        (def.attrs && def.attrs.includes(devAssert(m.attributeName))) ||
        matchesAttrPrefix(m.attributeName, def.attrPrefix)
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
