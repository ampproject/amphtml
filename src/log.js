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
   * @param {string} message
   * @param {?} opt_error
   */
  msg_(tag, level, message, opt_error) {
    if (this.isEnabled_) {
      let s = '[' + tag + '] [' + level + '] ' + message;
      if (level != 'ERROR' || !this.win.console.error) {
        this.win.console.log(s);
      } else {
        if (opt_error) {
          this.win.console.error(s, opt_error);
        } else {
          this.win.console.error(s);
        }
      }
    }
  }

  /**
   * @param {string} tag
   * @param {string} message
   */
  fine(tag, message) {
    this.msg_(tag, 'FINE', message);
  }

  /**
   * @param {string} tag
   * @param {string} message
   */
  info(tag, message) {
    this.msg_(tag, 'INFO', message);
  }

  /**
   * @param {string} tag
   * @param {string} message
   */
  warn(tag, message) {
    this.msg_(tag, 'WARN', message);
  }

  /**
   * @param {string} tag
   * @param {string} message
   * @param {?} opt_error
   */
  error(tag, message, opt_error) {
    this.msg_(tag, 'ERROR', message, opt_error);
  }
}


export const log = new Log(window);
