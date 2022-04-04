// See src/base-element.js for method documentation.

type Layout_Enum = import('#core/dom/layout').Layout_Enum;
type LayoutSize = import('#core/dom/layout/rect').LayoutSizeDef;
type LayoutRect = import('#core/dom/layout/rect').LayoutRectDef;

declare namespace AMP {
  class BaseElement {
    static R1(): boolean;
    static deferredMount(el?: AmpElement): boolean;
    static prerenderAllowed(el?: AmpElement): boolean;
    static previewAllowed(el?: AmpElement): boolean;
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
    getLayout(): Layout_Enum;
    getLayoutBox(): LayoutRect;
    getLayoutSize(): LayoutSize;
    getWin(): Window;
    getAmpDoc(): any;
    getVsync(): any;
    getConsentPolicy(): string | undefined;
    isLayoutSupported(layout: Layout_Enum): boolean;
    isAlwaysFixed(): boolean;
    upgradeCallback(): null | BaseElement | Promise<BaseElement>;
    buildCallback(): void | Promise<void>;
    preconnectCallback(onLayout?: boolean): void;
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
    registerAction(alias: string, handler: any, minTrust: any): void;
    registerDefaultAction(handler: any, alias: string, minTrust: any): void;
    executeAction(invocation: any, deferred?: boolean): any;
    forwardEvents(events: string | string[], element: Element): any;
    getPlaceholder(): Element;
    togglePlaceholder(state: boolean): void;
    getFallback(): Element | undefined;
    toggleFallback(state: boolean): void;
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

  const extension: (
    name: string,
    version: string,
    installer: (obj: any) => void
  ) => void;

  const registerElement: (
    name: string,
    implClass: BaseElement,
    css?: string
  ) => void;
}

type Mutations = {
  [key: string]: null | boolean | string | number | Array<any> | Object;
};
