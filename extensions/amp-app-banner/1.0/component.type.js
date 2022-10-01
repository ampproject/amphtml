/** @externs */

/** @const */
var BentoAppBannerDef = {};

/**
 * @typedef {{
 *   dismissButtonAriaLabel: ?string,
 *   id: string,
 * }}
 */
BentoAppBannerDef.Props;

/**
 * @typedef {{
 *   dismissButtonAriaLabel: ?string,
 *   id: string,
 *   children: PreactDef.Renderable,
 *   onDismiss: function(): void,
 *   onInstall: function(): void,
 * }}
 */
BentoAppBannerDef.RawProps;
