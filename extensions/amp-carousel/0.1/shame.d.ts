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

declare module '#core/dom/css-selectors' {
  export var escapeCssSelectorIdent: (s: string) => string;
}

// TODO: everything below are core stubs, which we can remove once Core has been
// converted to TS.
declare module '#core/constants/key-codes' {
  export var Keys_Enum: any;
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
  export var isServerRendered: (el: Element) => boolean;
}

declare module '#core/window' {
  export var getWin: (element: Element) => Window;
}

declare module '#core/dom/query' {
  export var realChildElements: any;
  export var closestAncestorElementBySelector: any;
}

declare module '#core/constants/action-constants' {
  export var ActionTrust_Enum: any;
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
