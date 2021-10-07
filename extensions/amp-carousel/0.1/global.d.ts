declare namespace AMP {
  // See src/base-element.js for method descriptions.
  class BaseElement {
    static R1(): boolean;
    static deferredMount(el?: AmpElement): boolean;
    static prerenderAllowed(el?: AmpElement): boolean;
    static usesLoading(el?: AmpElement): boolean;
    static createLoaderLogoCallback(el?: AmpElement): {
      content?: Element;
      color?: string;
    };
    static getBuildPriority(el?: AmpElement): boolean;
    static getPreconnects(el?: AmpElement): null | string[];
    static requiresShadowDom(): boolean;

    constructor(el: AmpElement);
    element: AmpElement;
    win: Window;
    actionMap_?: any;
    defaultActionAlias_?: string;

    signals(): any;
    getDefaultActionAlias(): string | undefined;
    getLayoutPriority(): number;
    updateLayoutPriority(pri: number): void;
    getLayout(): Layout;
    getLayoutBox(): LayoutRect;
    getLayoutSize(): LayoutSize;
    getWin(): Window;
    getAmpDoc(): any;
    getVsync(): any;
    getConsentPolicy(): string | undefined;
    isLayoutSupported(layout: Layout): boolean;
    isAlwaysFixed(): boolean;
    upgradeCallback(): null | BaseElement | Promise<BaseElement>;
    buildCallback(): void | Promise<void>;
    preconnectCallback(onLayout?: boolean);
    attachedCallback(): void;
    detachedCallback(): void;
    setAsContainer(scroller?: Element): void;
    removeAsContainer(): void;
    isBuildRenderBlocking(): boolean;
    createPlaceholderCallback(): Element | null;
    renderOutsideViewport(): boolean | number;
    idleRenderOutsideViewport(): false;
    ensureLoaded(): void;
    setReadyState(state: any, failure?: any): void;
    mountCallback(signal?: AbortSignal): Promise<void> | void;
    unmountCallback(): void;
    isRelayoutNeeded(): boolean;
    layoutCallback(): Promise<void>;
    firstLayoutCompleted(): void;
    pauseCallback(): void;
    resumeCallback(): void;
    unlayoutCallback(): boolean;
    unlayoutOnPause(): boolean;
    reconstructWhenReparented(): boolean;
    loadPromise<T>(element: T): Promise<T>;
    registerAction(alias: string, handler: any, minTrust: any);
    registerDefaultAction(handler: any, alias: string, minTrust: any);
    executeAction(invocation: any, deferred?: boolean): any;
    forwardEvents(events: string | string[], element: Element): any;
    getPlaceholder(): Element;
    togglePlaceholder(state: boolean): void;
    getFallback(): Element | undefined;
    toggleFallback(state: boolean);
    toggleLoading(state: boolean, force?: boolean): void;
    getOverflowElement(): Element | undefined;
    renderStarted(): void;
    getViewport(): any;
    getIntersectionElementBox(): LayoutRect;
    collapse(): void;
    attemptCollapse(): Promise<void>;
    forceChangeHeight(newHeight: number): void;
    attemptChangeHeight(newHeight: number): Promise<void>;
    attemptChangeSize(
      newHeight?: number,
      newWidth?: number,
      opt_event?: any
    ): Promise<void>;
    measureElement(measurer: any): Promise<void>;
    mutateElement(mutator: any, element?: Element): Promise<void>;
    measureMutateElement(
      measurer: any,
      mutator: any,
      element?: Element
    ): Promise<void>;
    mutateElementSkipRemeasure(mutator: any): Promise<void>;
    collapsedCalback(element: AmpElement): void;
    expand(): void;
    mutatedAttributesCallback(mutations: Mutations): void;
    onLayoutMeasure(): void;
    user(): any;
    getApi(): Promise<Object>;
  }

  const extension: any;
  const registerElement: any;
}

declare type AmpElement = HTMLElement;

declare type Layout =
  | 'nodisplay'
  | 'fixed'
  | 'fixed-height'
  | 'responsive'
  | 'container'
  | 'fill'
  | 'flex-item'
  | 'fluid'
  | 'intrinsic';

declare type LayoutSize = {height: number; width: number};
declare type LayoutRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

type Mutations = {
  [key: string]: null | boolean | string | number | Array<any> | Object;
};

// SHAME SHAME SHAME
// Stubbed out modules below

declare module '#utils/log' {
  export var dev: any;
  export var user: any;
  export var userAssert: any;
}

declare module '#utils/animation' {
  export var Animation: any;
}

declare module '#utils/event-helper' {
  export var createCustomEvent: any;
  export var listen: any;
}

declare module '#experiments' {
  export var dict: any;
  export var isExperimentOn: any;
}

declare module '#service' {
  export var Services: any;
}
declare module '#utils/analytics' {
  export var triggerAnalyticsEvent: any;
}

// Core stubs
// These can be deleted when Core has been converted to TS.
declare module '#core/constants/key-codes' {
  export var Keys: any;
}

declare module '#core/document/format' {
  export var isAmp4Email: any;
}

declare module '#core/dom/layout/viewport-observer' {
  export var observeIntersections: any;
}

declare module '#core/dom' {
  export var toggleAttribute: any;
  export var dispatchCustomEvent: any;
}

declare module '#core/dom/query' {
  export var realChildElements: any;
  export var closestAncestorElementBySelector: any;
}

declare module '#core/constants/action-constants' {
  export var ActionTrust: any;
}

declare module '#core/dom/layout' {
  export var isLayoutSizeFixed: any;
  export var isLayoutSizeDefined: any;
}

declare module '#core/dom/layout/size-observer' {
  export var observeContentSize: any;
  export var unobserveContentSize: any;
}

declare module '#core/types' {
  export var isFiniteNumber: any;
}

declare module '#core/types/object' {
  export var dict: any;
}

declare module '#core/dom/transition' {
  export var numeric: any;
}

declare module '#core/dom/style' {
  export var getStyle: any;
  export var setStyle: any;
}

declare module '#core/data-structures/curve' {
  export var bezierCurve: any;
}
