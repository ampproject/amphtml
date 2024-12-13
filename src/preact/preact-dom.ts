/**
 * Re-export the `render`/`hydrate` functions from 'preact' as 'preact/dom' (via
 * ../../tsconfig.base.json) to make it more consistent with React. This makes
 * remapping the imports for React builds simple (preact/dom --> react-dom).
 *
 * @fileoverview
 */
export {hydrate, render} from 'preact';
