/** @externs */

/** @const */
var IframeDef = {};

/**
 * @typedef {{
 *   allowFullScreen: (boolean),
 *   allowPaymentRequest: (boolean),
 *   allowTransparency: (boolean),
 *   onLoad: (function():undefined),
 *   referrerPolicy: (string),
 *   requestResize: (function(number,number):undefined),
 *   sandbox: (string),
 *   src: (!string),
 *   srcdoc: (string),
 * }}
 */
IframeDef.Props;
