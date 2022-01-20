import type {FunctionComponent} from 'preact';

import {devAssert} from '#core/assert';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Loading_Enum} from '#core/constants/loading-instructions';
import {ReadyState_Enum} from '#core/constants/ready-state';
import type {IContextProp} from '#core/context';
import {
  addGroup,
  discover,
  setGroupProp,
  setParent,
  subscribe,
} from '#core/context';
import {Deferred} from '#core/data-structures/promise';
import {createElementWithAttributes, dispatchCustomEvent} from '#core/dom';
import {
  Layout_Enum,
  applyFillContent,
  isLayoutSizeDefined,
} from '#core/dom/layout';
import {MediaQueryProps} from '#core/dom/media-query-props';
import {childElementByAttr, childElementByTag} from '#core/dom/query';
import {installShadowStyle} from '#core/dom/shadow-embed';
import {PauseHelper} from '#core/dom/video/pause-helper';
import * as mode from '#core/mode';
import {isElement} from '#core/types';
import {hasOwn, map} from '#core/types/object';

import * as Preact from '#preact';
import {hydrate, render} from '#preact';
import {BaseElement} from '#preact/bento-ce';

import {AmpContext, WithAmpContext} from './context';
import {CanPlay, CanRender, LoadingProp} from './contextprops';
import {
  AmpElementProp,
  HAS_SELECTOR,
  checkPropsFor,
  collectProps,
} from './parse-props';

const CHILDREN_MUTATION_INIT: MutationObserverInit = {
  childList: true,
};

const PASSTHROUGH_MUTATION_INIT: MutationObserverInit = {
  childList: true,
  characterData: true,
};

const TEMPLATES_MUTATION_INIT: MutationObserverInit = {
  childList: true,
};

const SHADOW_CONTAINER_ATTRS = {
  'style': 'display: contents; background: inherit;',
  'part': 'c',
};

const SERVICE_SLOT_NAME = 'i-amphtml-svc';

const SERVICE_SLOT_ATTRS = {'name': SERVICE_SLOT_NAME};

const RENDERED_ATTR = 'i-amphtml-rendered';

const RENDERED_ATTRS = {'i-amphtml-rendered': ''};

/**
 * This is an internal property that marks light DOM nodes that were rendered
 * by AMP/Preact bridge and thus must be ignored by the mutation observer to
 * avoid mutate->rerender->mutate loops.
 */
const RENDERED_PROP = '__AMP_RENDERED';

const UNSLOTTED_GROUP = 'unslotted';

const MATCH_ANY = () => true;

const HAS_MEDIA = (def: AmpElementProp): boolean => !!def.media;

const HAS_PASSTHROUGH = (def: AmpElementProp): boolean =>
  !!(def.passthrough || def.passthroughNonEmpty);

interface API_TYPE {
  readyState?: ReadyState_Enum;
  pause?: () => void;
}

/**
 * Wraps a Preact Component in a BaseElement class.
 *
 * Most functionality should be done in Preact. We don't expose the BaseElement
 * subclass on purpose, you're not meant to do work in the subclass! There will
 * be very few exceptions, which is why we allow options to configure the
 * class.
 */
export class PreactBaseElement<T extends API_TYPE> extends BaseElement {
  static override R1() {
    return true;
  }

  static override requiresShadowDom() {
    return this['usesShadowDom'];
  }

  static override usesLoading() {
    return this['loadable'];
  }

  static override prerenderAllowed() {
    return !this.usesLoading();
  }

  /**
   * Override to provide the Component definition.
   */
  protected static Component(): ReturnType<FunctionComponent> {
    devAssert(false, 'Must provide Component');
  }

  /**
   * If default props are static, this can be used instead of init().
   */
  static staticProps?: JsonObject = undefined;

  static useContexts: IContextProp<any, any>[] = mode.isLocalDev()
    ? Object.freeze([])
    : ([] as any);

  /**
   * Whether the component implements a loading protocol.
   */
  static loadable: boolean = false;

  /**
   * Whether a component should be unloaded for `pauseCallback`.
   */
  static unloadOnPause: boolean = false;

  /**
   * An override to specify that the component requires `layoutSizeDefined`.
   * This typically means that the element's `isLayoutSupported()` is
   * implemented via `isLayoutSizeDefined()`, and this is how the default
   * `isLayoutSupported()` is implemented when this flag is set.
   */
  static layoutSizeDefined: boolean = false;

  /**
   * The tag name, e.g. "div", "span", time" that should be used as a replacement
   * node for Preact rendering. This is the node that Preact will diff with
   * with specified, instead of rendering a new node. Only applicable to light-DOM
   * mapping styles.
   */
  static lightDomTag: string = '';

  /**
   * Whether this element uses "templates" system.
   */
  static usesTemplate: boolean = false;

  /**
   * The CSS for shadow stylesheets.
   */
  static shadowCss: string | null = null;

  /**
   * Whether this element uses Shadow DOM.
   */
  static usesShadowDom: boolean = false;

  /**
   * Enabling detached mode alters the children to be rendered in an
   * unappended container. By default the children will be attached to the DOM.
   */
  static detached: boolean = false;

  /**
   * This enables the 'delegatesFocus' option when creating the shadow DOM for
   * this component.  A key feature of 'delegatesFocus' set to true is that
   * when elements within the shadow DOM gain focus, the focus is also applied
   * to the host element.
   */
  static delegatesFocus: boolean = false;

  /**
   * Provides a mapping of Preact prop to AmpElement DOM attributes.
   */
  static props: {[key: string]: AmpElementProp} = {};

  private defaultProps_ = this.getDefaultProps();
  private context_: AmpContext = {
    renderable: false,
    playable: true,
    loading: Loading_Enum.AUTO,
    notify: () => this.mutateElement(() => {}),
  };
  private resetLoading_ = false;
  private apiWrapper_: T | null = null;
  private currentRef_: T | null = null;
  private refSetter_ = (current: T): void => {
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
  private deferredApi_: Deferred<T> | null = null;
  private contextValues_: Array<any> | null = null;
  private scheduledRender_ = false;
  private renderDeferred_: Deferred<void> | null = null;
  private boundRerender_ = () => {
    this.scheduledRender_ = false;
    this.rerender_();
  };
  private hydrationPending_: boolean = false;
  private mounted_: boolean = false;
  private pauseHelper_: PauseHelper;

  protected observer: MutationObserver | null = null;
  protected mediaQueryProps_: MediaQueryProps | null = null;
  protected container_: Element | null = null;

  constructor(element: AmpElement) {
    super(element);
    this.pauseHelper_ = new PauseHelper(element);
  }

  /**
   * Returns default props
   */
  getDefaultProps(): JsonObject {
    return {
      loading: Loading_Enum.AUTO,
      onReadyState: (state: ReadyState_Enum, opt_failure?: Error) => {
        this.onReadyState_(state, opt_failure);
      },
      onPlayingState: (isPlaying: boolean) => {
        this.updateIsPlaying_(isPlaying);
      },
    };
  }

  /**
   * A chance to initialize default Preact props for the element.
   *
   * @protected
   * @return {JsonObject|void}
   */
  init() {}

  override isLayoutSupported(layout: Layout_Enum) {
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (Ctor.layoutSizeDefined) {
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
        layout == Layout_Enum.CONTAINER
      );
    }
    return super.isLayoutSupported(layout);
  }

  override buildCallback() {
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    this.observer = new MutationObserver((rs) => this.checkMutations_(rs));
    const {props} = Ctor;
    const childrenInit = checkPropsFor(props, HAS_SELECTOR)
      ? CHILDREN_MUTATION_INIT
      : null;
    const passthroughInit = checkPropsFor(props, HAS_PASSTHROUGH)
      ? PASSTHROUGH_MUTATION_INIT
      : null;
    const templatesInit = Ctor.usesTemplate ? TEMPLATES_MUTATION_INIT : null;
    this.observer.observe(this.element, {
      attributes: true,
      ...childrenInit,
      ...passthroughInit,
      ...templatesInit,
    });

    this.mediaQueryProps_ = checkPropsFor(props, HAS_MEDIA)
      ? new MediaQueryProps(this.win, () => this.scheduleRender_())
      : null;

    const {staticProps} = Ctor;
    const initProps = this.init();
    Object.assign(this.defaultProps_, staticProps, initProps);

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
      [CanRender, CanPlay, LoadingProp] as IContextProp<any, boolean>[],
      (canRender, canPlay, loading) => {
        this.context_.renderable = canRender;
        this.context_.playable = canPlay;
        this.context_.loading = loading;
        this.mounted_ = true;
        this.scheduleRender_();
      }
    );

    const {useContexts} = Ctor;
    if (useContexts.length != 0) {
      subscribe(this.element, useContexts, (...contexts) => {
        this.contextValues_ = contexts;
        this.scheduleRender_();
      });
    }

    this.renderDeferred_ = new Deferred();
    this.scheduleRender_();

    if (Ctor.loadable) {
      this.setReadyState?.(ReadyState_Enum.LOADING);
    }
    this.maybeUpdateReadyState_();

    return this.renderDeferred_.promise;
  }

  override ensureLoaded() {
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (!Ctor.loadable) {
      return;
    }
    this.mutateProps({'loading': Loading_Enum.EAGER});
    this.resetLoading_ = true;
  }

  override mountCallback() {
    discover(this.element);
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (Ctor.loadable && this.getProp('loading') != Loading_Enum.AUTO) {
      this.mutateProps({'loading': Loading_Enum.AUTO});
      this.resetLoading_ = false;
    }
  }

  override unmountCallback() {
    discover(this.element);
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (Ctor.loadable) {
      this.mutateProps({'loading': Loading_Enum.UNLOAD});
    }
    this.updateIsPlaying_(false);
    this.mediaQueryProps_?.dispose();
  }

  protected mutateProps(props: JsonObject) {
    Object.assign(this.defaultProps_ as Object, props);
    this.scheduleRender_();
  }

  protected api(): T {
    const ref = this.currentRef_;
    devAssert(ref);
    return ref;
  }

  /**
   * A callback called immediately after mutations have been observed on a
   * component. This differs from `checkPropsPostMutations` in that it is
   * called in all cases of mutation.
   */
  protected mutationObserverCallback(unusedRecords: MutationRecord[]) {}

  /**
   * A callback called immediately after mutations have been observed on a
   * component's defined props. The implementation can verify if any
   * additional properties need to be mutated via `mutateProps()` API.
   */
  protected checkPropsPostMutations() {}

  /**
   * A callback called to compute props before rendering is run. The properties
   * computed here and ephemeral and thus should not be persisted via a
   * `mutateProps()` method.
   */
  protected updatePropsForRendering(unusedProps: JsonObject) {}

  /**
   * A callback called to check whether the element is ready for rendering.
   */
  protected isReady(unusedProps: JsonObject): boolean {
    return true;
  }

  private checkMutations_(records: MutationRecord[]) {
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    this.mutationObserverCallback(records);
    const rerender = records.some((m) => shouldMutationBeRerendered(Ctor, m));
    if (rerender) {
      this.checkPropsPostMutations();
      this.scheduleRender_();
    }
  }

  protected scheduleRender_() {
    if (!this.scheduledRender_) {
      this.scheduledRender_ = true;
      this.mutateElement(this.boundRerender_);
    }
  }

  private maybeUpdateReadyState_() {
    const {currentRef_: api} = this;

    const apiReadyState = api?.['readyState'];
    if (apiReadyState && apiReadyState !== this.element.readyState) {
      this.onReadyState_(apiReadyState);
    }
  }

  private onReadyState_(state: ReadyState_Enum, opt_failure?: Error) {
    this.setReadyState?.(state, opt_failure);

    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (Ctor.unloadOnPause) {
      // These are typically iframe-based elements where we don't know
      // whether a media is currently playing. So we have to assume that
      // it is whenever the element is loaded.
      this.updateIsPlaying_(state == ReadyState_Enum.COMPLETE);
    }

    // Reset "loading" property back to "auto".
    if (this.resetLoading_) {
      this.resetLoading_ = false;
      this.mutateProps({'loading': Loading_Enum.AUTO});
    }
  }

  /** @private */
  rerender_() {
    // If the component unmounted before the scheduled render runs, exit
    // early.
    if (!this.mounted_) {
      return;
    }

    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    const {detached: isDetached, usesShadowDom: isShadow} = Ctor;
    const lightDomTag = isShadow ? null : Ctor.lightDomTag;

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
            delegatesFocus: Ctor.delegatesFocus,
          });

          // The pre-constructed shadow root is required to have the stylesheet
          // inline. Thus, only the new shadow roots share the stylesheets.
          const {shadowCss} = Ctor;
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
          this.getPlaceholder?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
          this.getFallback?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
          this.getOverflowElement?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
        }
        this.container_ = container;

        // Connect shadow root to the element's context.
        devAssert(shadowRoot);
        setParent(shadowRoot, this.element);
        // In Shadow DOM, only the children distributed in
        // slots are displayed. All other children are undisplayed. We need
        // to create a simple mechanism that would automatically compute
        // `CanRender = false` on undistributed children.
        addGroup(this.element, UNSLOTTED_GROUP, MATCH_ANY, /* weight */ -1);

        setGroupProp(
          this.element,
          UNSLOTTED_GROUP,
          CanRender,
          // TODO: is `this` correct as the setter arg for setGroupProp
          // eslint-disable-next-line local/restrict-this-access
          this as any,
          false
        );
      } else if (lightDomTag) {
        const container = this.element;
        this.container_ = container;
        const replacement =
          childElementByAttr(container, RENDERED_ATTR) ||
          createElementWithAttributes(doc, lightDomTag, RENDERED_ATTRS);
        replacement[RENDERED_PROP] = true;
        if (Ctor.layoutSizeDefined) {
          replacement.classList.add('i-amphtml-fill-content');
        }
        this.container_.appendChild(replacement);
      } else {
        const container = doc.createElement('i-amphtml-c');
        this.container_ = container;
        applyFillContent(container);
        if (!isDetached) {
          this.element.appendChild(container);
        }
      }
    }
    const container = this.container_;
    devAssert(container);

    // Exit early if contexts are not ready. Optional contexts will yield
    // right away, even when `null`. The required contexts will block the
    // `contextValues` until available.
    const {useContexts} = Ctor;
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
      this.mediaQueryProps_!
    );
    this.updatePropsForRendering(props);

    if (!this.isReady(props)) {
      return;
    }

    // While this "creates" a new element, diffing will not create a second
    // instance of Component. Instead, the existing one already rendered into
    // this element will be reused.
    let comp = <Ctor.Component {...props} />;

    // Add contexts.
    for (let i = 0; i < useContexts.length; i++) {
      devAssert(contextValues);
      const Context = useContexts[i].type;
      const value = contextValues[i];
      if (value) {
        comp = <Context.Provider value={value}>{comp}</Context.Provider>;
      }
    }

    // Add AmpContext with renderable/playable properties.
    const v = <WithAmpContext {...this.context_}>{comp}</WithAmpContext>;

    try {
      if (this.hydrationPending_) {
        this.hydrationPending_ = false;
        hydrate(v, container);
      } else {
        const replacement = lightDomTag
          ? childElementByAttr(container, RENDERED_ATTR)
          : null;
        if (replacement) {
          replacement[RENDERED_PROP] = true;
        }
        render(v, container, replacement ?? undefined);
      }
    } catch (err) {
      this.renderDeferred_?.reject(err);
      throw err;
    }

    // Dispatch the DOM_UPDATE event when rendered in the light DOM.
    if (!isShadow && !isDetached) {
      this.mutateElement(() =>
        dispatchCustomEvent(this.element, AmpEvents_Enum.DOM_UPDATE, undefined)
      );
    }

    if (this.renderDeferred_) {
      this.renderDeferred_.resolve(undefined);
      this.renderDeferred_ = null;
    }
  }

  protected getProp(prop: string, opt_fallback?: any): any {
    if (!hasOwn(this.defaultProps_, prop)) {
      return opt_fallback;
    }
    return this.defaultProps_[prop];
  }

  /**
   * Returns reference to upgraded imperative API object, as in React's
   * useImperativeHandle.
   */
  override getApi(): Promise<T> {
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
   */
  private initApiWrapper_(current: T) {
    const api: any = map();
    const keys = Object.keys(current) as Array<keyof T>;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.wrapRefProperty_(api, key);
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
   */
  private checkApiWrapper_(current: T) {
    if (!mode.isLocalDev()) {
      return;
    }
    // Hack around https://github.com/preactjs/preact/issues/3084
    if (current.constructor && current.constructor.name !== 'Object') {
      return;
    }
    const api = this.apiWrapper_!;
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
   */
  triggerEvent(element: Element, eventName: string, detail: JsonObject) {
    dispatchCustomEvent(element, eventName, detail);
  }

  override pauseCallback() {
    const Ctor = this.constructor as unknown as typeof PreactBaseElement;
    if (Ctor.unloadOnPause) {
      this.mutateProps({'loading': Loading_Enum.UNLOAD});
      this.resetLoading_ = true;
    } else {
      const {currentRef_: api} = this;
      api?.['pause']?.();
    }
  }

  private updateIsPlaying_(isPlaying: boolean) {
    this.pauseHelper_.updatePlaying(isPlaying);
  }

  private wrapRefProperty_(api: Object, key: keyof T) {
    Object.defineProperty(api, key, {
      configurable: true,

      get: () => {
        const ref = this.currentRef_;
        devAssert(ref);
        return ref[key];
      },
      set: (v) => {
        const ref = this.currentRef_;
        devAssert(ref);
        ref[key] = v;
      },
    });
  }
}

function shouldMutationForNodeListBeRerendered(nodeList: NodeList): boolean {
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i];
    if (isElement(node)) {
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

function shouldMutationBeRerendered(
  Ctor: typeof PreactBaseElement,
  m: MutationRecord
): boolean {
  const {type} = m;
  if (type == 'attributes') {
    // Check whether this is a templates attribute.
    if (Ctor.usesTemplate && m.attributeName == 'template') {
      return true;
    }
    // Check if the attribute is mapped to one of the properties.
    const {props} = Ctor;
    for (const name in props) {
      const def = props[name] as AmpElementProp;
      const attrName = m.attributeName;
      devAssert(attrName);
      if (
        attrName == def.attr ||
        def.attrs?.includes(attrName) ||
        def.attrMatches?.(attrName)
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
