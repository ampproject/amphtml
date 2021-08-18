

/**
 * AMP Components must implement this "buildDom" function in order to be server-rendered.
 *
 * - It must perform all of the DOM manipulations necessary to render a component.
 *   Note: this is a subset of the responsibilities of buildCallback.
 * - It must not perform any side effects, such as adding event listeners or assigning instance variables.
 * - It must not perform any of the operations involved with layoutCallback (loading).
 *
 * The return value is set to *, so that we may optionally return any DOM nodes
 * created during a client-side render. These nodes are often needed for ivars.
 *
 * @typedef {function(!Element):*}
 */
export let BuildDomDef;

/**
 * See @ampproject/bento-compiler for the definition.
 * @typedef {*}
 */
export let TreeProtoDef;

/**
 * Contains component versioning data via a map from tagName --> version.
 *
 * @typedef {Object<string, string>}}
 */
export let VersionsDef;
