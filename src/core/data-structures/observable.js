import {removeItem} from '#core/types/array';

/**
 * This class helps to manage observers. Observers can be added, removed or
 * fired through and instance of this class.
 * @template TYPE
 */
export class Observable {
  /**
   * Creates an instance of Observable.
   */
  constructor() {
    /** @type {?Array<function(TYPE)>} */
    this.handlers_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(TYPE)} handler Observer's handler.
   * @return {!UnlistenDef}
   */
  add(handler) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
    return () => {
      this.remove(handler);
    };
  }

  /**
   * Removes the observer from this instance.
   * @param {function(TYPE)} handler Observer's instance.
   */
  remove(handler) {
    if (!this.handlers_) {
      return;
    }
    removeItem(this.handlers_, handler);
  }

  /**
   * Removes all observers.
   */
  removeAll() {
    if (!this.handlers_) {
      return;
    }
    this.handlers_.length = 0;
  }

  /**
   * Fires an event. All observers are called.
   * @param {TYPE=} opt_event
   */
  fire(opt_event) {
    if (!this.handlers_) {
      return;
    }
    for (const handler of this.handlers_) {
      handler(opt_event);
    }
  }

  /**
   * Returns number of handlers. Mostly needed for tests.
   * @return {number}
   */
  getHandlerCount() {
    return this.handlers_?.length ?? 0;
  }
}
