/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * This class is completely removed in the PROD mode.
 */
export class Log {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = win.AMP_TEST ? win.parent : win;

    /** @private {boolean} */
    this.isEnabled_ = !!this.win.console && !!this.win.console.log;
  }

  /**
   * @param {string} tag
   * @param {string} level
   * @param {!Array} messages
   * @param {?} opt_error
   */
  msg_(tag, level, messages) {
    if (this.isEnabled_) {
      var fn = this.win.console.log;
      if (level == 'ERROR') {
        fn = this.win.console.error || fn;
      } else if (level == 'INFO') {
        fn = this.win.console.info || fn;
      } else if (level == 'WARN') {
        fn = this.win.console.warn || fn;
      }
      messages.unshift('[' + tag + ']');
      fn.apply(this.win.console, messages);
    }
  }

  /**
   * @param {string} tag
   * @param {...*} var_args
   */
  fine(tag, var_args) {
    this.msg_(tag, 'FINE', Array.prototype.slice.call(arguments, 1));
  }

  /**
   * @param {string} tag
   * @param {...*} var_args
   */
  info(tag, var_args) {
    this.msg_(tag, 'INFO', Array.prototype.slice.call(arguments, 1));
  }

  /**
   * @param {string} tag
   * @param {...*} var_args
   */
  warn(tag, var_args) {
    this.msg_(tag, 'WARN', Array.prototype.slice.call(arguments, 1));
  }

  /**
   * @param {string} tag
   * @param {...*} var_args
   * @param {?} opt_error
   */
  error(tag, var_args) {
    this.msg_(tag, 'ERROR', Array.prototype.slice.call(arguments, 1));
  }
}


export const log = new Log(window);
