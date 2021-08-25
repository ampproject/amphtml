/**
 * @fileoverview Provides AmpElement interface for typechecking. Includes
 * smaller interfaces that modules can type-check against to keep expected
 * API surfaces narrow, so it's clear what properties and methods are
 * expected/required.
 *
 * @externs
 */

/**
 * An interface for elements with pause functionality.
 * @interface
 */
class PausableInterface {
  /** @function */
  pause() {}
}

/**
 * Just an element, but used with AMP custom elements..
 * @constructor
 * @extends {HTMLElement}
 * @implements {PausableInterface}
 */
let AmpElement = function () {};

/** @type {function(number=):!Promise}  */
AmpElement.prototype.ensureLoaded;
/** @type {function():Promise} */
AmpElement.prototype.unmount;

/** @type {function():?Element} */
AmpElement.prototype.getPlaceholder;
