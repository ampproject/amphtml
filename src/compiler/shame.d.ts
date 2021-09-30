/**
 * @fileoverview The junk-drawer of type definitions for files that do not pass type checking yet.
 * Shame! Shame! Shame! Avoid adding to this.
 */

declare module '#builtins/amp-layout/build-dom' {
  import {BuildDom} from '#compiler/types';
  export const buildDom: BuildDom;
}

declare module 'extensions/amp-fit-text/0.1/build-dom' {
  import {BuildDom} from '#compiler/types';
  export const buildDom: BuildDom;
}

declare module '#core/dom' {
  export const copyChildren: any;
  export const removeChildren: any;
}

declare module '#core/dom/query' {
  export const realChildNodes: any;
}

declare module '#core/dom/layout' {
  export const applyFillContent: any;
}
