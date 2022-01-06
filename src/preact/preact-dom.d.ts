/**
 * Provides type information for a Preact subdirectory.
 *
 * We render/hydrate from 'preact/dom' instead of 'preact' in order to make it more consistent with
 * React. This makes remapping the imports for React builds simple (preact/dom --> react-dom).
 *
 * @fileoverview
 */
declare module 'preact/dom' {
  export const hydrate: typeof import('preact').hydrate;
  export const render: typeof import('preact').render;
}
