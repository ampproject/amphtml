/**
 * @fileoverview Externs for values expected to be on global self/window.
 * @externs
 */

/**
 * Never exists; used as part of post-compilation checks to verify DCE.
 * @type {undefined}
 */
window.__AMP_ASSERTION_CHECK;

/**
 * Global error reporting handler; only present in AMP pages.
 * @type {undefined|function(this:Window,!Error,Element=)}
 */
window.__AMP_REPORT_ERROR;

/**
 * Global property set by test some harnesses to signal a testing environment.
 * @type {undefined|boolean}
 */
window.__AMP_TEST;

/**
 * Counter for the DomBaseWeakRef polyfill.
 * @type {undefined|number}
 */
window.__AMP_WEAKREF_ID;

/**
 * AMP Runtime settings, configuration, and environment/build constants.
 * @type {!AmpConfigDef|undefined}
 */
window.AMP_CONFIG;

/**
 * AMP Mode, used to force an override in tests.
 * @type {{esm: boolean}}
 */
window.__AMP_MODE;
