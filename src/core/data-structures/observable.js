import {remove, removeItem} from '#core/types/array';

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
    /** @type {?Array<function(TYPE=):void>} */
    this.handlers_ = null;

    /** @type {!Set<function(TYPE=):void>} */
    this.handlersToRemove_ = new Set();

    /** @type {boolean} */
    this.iterating_ = false;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(TYPE=):void} handler Observer's handler.
   * @return {import('#core/types/function/types').UnlistenCallback}
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
   * Can be called in a handler fired.
   * @param {function(TYPE=):void} handler Observer's instance.
   */
  remove(handler) {
    if (!this.handlers_) {
      return;
    }
    if (this.iterating_) {
      this.handlersToRemove_.add(handler);
    } else {
      removeItem(this.handlers_, handler);
    }
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
    this.iterating_ = true;
    for (const handler of this.handlers_) {
      handler(opt_event);
    }
    this.iterating_ = false;
    if (this.handlersToRemove_.size) {
      remove(this.handlers_, (handler) => this.handlersToRemove_.has(handler));
      this.handlersToRemove_.clear();
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
