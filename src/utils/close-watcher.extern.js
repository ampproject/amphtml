/**
 * @fileoverview Externs for CloseWatcher class.
 * See https://github.com/WICG/close-watcher.
 *
 * TODO(dvoytenko): remove CloseWatcher once it's added in Closure externs.
 *
 * @externs
 */

/** @constructor */
function CloseWatcher() {}

CloseWatcher.prototype.destroy = function () {};

CloseWatcher.prototype.signalClosed = function () {};

/** @type {?function(!Event)} */
CloseWatcher.prototype.onclose;

/** @type {?function(!Event)} */
CloseWatcher.prototype.oncancel;
