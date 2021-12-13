/** @externs */

/**
 * @typedef {{
 *   as: (string|!Function|undefined),
 *   wrapperClassName: (?string|undefined),
 *   wrapperStyle: (?Object|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
var WrapperComponentProps;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 *
 * @typedef {{
 *   as: (string|!Function|undefined),
 *   size: (boolean|undefined),
 *   layout: (boolean|undefined),
 *   paint: (boolean|undefined),
 *   wrapperClassName: (?string|undefined),
 *   wrapperStyle: (?Object|undefined),
 *   contentRef: ({current: ?}|function(!Element)|undefined),
 *   contentClassName: (?string|undefined),
 *   contentStyle: (?Object|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
var ContainWrapperComponentProps;

/**
 * @typedef {!PreactDef.Renderable|!PreactDef.InnerHTML|null}
 */
var RendererFunctionResponseType;

/**
 * @typedef {function(!JsonObject):(?RendererFunctionResponseType|!Promise<?RendererFunctionResponseType>)}
 */
var RendererFunctionType;

/** @const */
var IframeEmbedDef = {};

/**
 * @typedef {{
 *   allow: (string|undefined),
 *   allowFullScreen: (boolean|undefined),
 *   loading: (string),
 *   manageMessageHandler: (function({current: HTMLIFrameElement}, function():void):function():void|undefined),
 *   name: (string|undefined),
 *   onReadyState: (function(string)|undefined),
 *   ready: (boolean|undefined),
 *   sandbox: (string|undefined),
 *   src: (string|undefined),
 *   title: (string|undefined),
 * }}
 */
IframeEmbedDef.Props;

/** @constructor */
IframeEmbedDef.Api = function () {};

/** @type {string} */
IframeEmbedDef.Api.prototype.readyState;
