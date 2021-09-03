/**
 * @fileoverview The junk-drawer of externs that haven't yet been sorted well.
 * Shame! Shame! Shame! Avoid adding to this.
 *
 * It's okay for some things to start off here, since moving them doesn't
 * require any other file changes (unlike real code, which requires updating)
 * imports throughout the repo).
 *
 * @externs
 */

// This definition is exported by the fetch polyfill implementation, but
// currently has dependencies on non-core modules that aren't yet type-checked.
//
// Planned destination: this should be removed when fetch is re-included in the
// polyfills type-check target.
/** @type {function(!Window)} */
let install$$module$src$polyfills$fetch;

// This definition lives in non-core files but is consumed by
// get-bounding-client-rect. Is should be removed once dom.js is moved to core.
/** @type {function(!Element):boolean} */
let isConnectedNode$$module$src$dom;
