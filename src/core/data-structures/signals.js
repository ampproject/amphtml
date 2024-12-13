import {map} from '#core/types/object';

import {Deferred} from './promise';

/** @typedef {import('#core/types/date').TimestampDef} TimestampDef */

/**
 * This object tracts signals and allows blocking until a signal has been
 * received.
 */
export class Signals {
  /**
   * Creates an instance of Signals.
   */
  constructor() {
    /**
     * A mapping from a signal name to the signal response: either time or
     * an error.
     * @private @const {{[key: string]: (TimestampDef|Error)}}
     */
    this.map_ = map();

    /**
     * A mapping from a signal name to the signal promise, resolve and reject.
     * Only allocated when promise has been requested.
     * @private {?Object<string, {
     *   promise: !Promise,
     *   resolve: (function(!TimestampDef)|undefined),
     *   reject: (function(!Error)|undefined)
     * }>}
     */
    this.promiseMap_ = null;
  }

  /**
   * Returns the current known value of the signal. If signal is not yet
   * available, `null` is returned.
   * @param {string} name
   * @return {number|Error|null}
   */
  get(name) {
    const v = this.map_[name];
    return v == null ? null : v;
  }

  /**
   * Returns the promise that's resolved when the signal is triggered. The
   * resolved value is the time of the signal.
   * @param {string} name
   * @return {Promise<TimestampDef>}
   */
  whenSignal(name) {
    let promiseStruct = this.promiseMap_?.[name];
    if (!promiseStruct) {
      const result = this.map_[name];
      if (result != null) {
        // Immediately resolve signal.
        const promise =
          typeof result == 'number'
            ? Promise.resolve(result)
            : Promise.reject(result);
        promiseStruct = {promise};
      } else {
        // Allocate the promise/resolver for when the signal arrives in the
        // future.
        promiseStruct = new Deferred();
      }
      if (!this.promiseMap_) {
        this.promiseMap_ = map();
      }
      this.promiseMap_[name] = promiseStruct;
    }
    return promiseStruct.promise;
  }

  /**
   * Triggers the signal with the specified name on the element. The time is
   * optional; if not provided, the current time is used. The associated
   * promise is resolved with the resulting TimestampDef.
   * @param {string} name
   * @param {TimestampDef=} opt_time
   */
  signal(name, opt_time) {
    if (this.map_[name] != null) {
      // Do not duplicate signals.
      return;
    }
    const time = opt_time ?? Date.now();
    this.map_[name] = time;
    const promiseStruct = this.promiseMap_?.[name];
    if (promiseStruct?.resolve) {
      promiseStruct.resolve(time);
      promiseStruct.resolve = undefined;
      promiseStruct.reject = undefined;
    }
  }

  /**
   * Rejects the signal. Indicates that the signal will never succeed. The
   * associated signal is rejected.
   * @param {string} name
   * @param {Error} error
   */
  rejectSignal(name, error) {
    if (this.map_[name] != null) {
      // Do not duplicate signals.
      return;
    }
    this.map_[name] = error;
    const promiseStruct = this.promiseMap_?.[name];
    if (promiseStruct?.reject) {
      promiseStruct.reject(error);
      promiseStruct.promise.catch(() => {});
      promiseStruct.resolve = undefined;
      promiseStruct.reject = undefined;
    }
  }

  /**
   * Resets all signals.
   * @param {string} name
   */
  reset(name) {
    if (this.map_[name]) {
      delete this.map_[name];
    }
    // Reset promise it has already been resolved.
    const promiseStruct = this.promiseMap_?.[name];
    if (promiseStruct && !promiseStruct.resolve) {
      delete this.promiseMap_[name];
    }
  }
}
