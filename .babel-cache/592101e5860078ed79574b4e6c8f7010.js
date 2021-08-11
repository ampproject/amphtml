function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import { Observable } from "../core/data-structures/observable";
export var VideoSessionManager = /*#__PURE__*/function () {
  /**
   * Creates an instance of VideoSessionManager.
   */
  function VideoSessionManager() {
    _classCallCheck(this, VideoSessionManager);

    /** @private */
    this.isSessionActive_ = false;

    /** @private */
    this.endSessionObservable_ = new Observable();
  }

  /**
   * Register a listener to be notified when a session has ended
   * @param {!Function} listener
   */
  _createClass(VideoSessionManager, [{
    key: "onSessionEnd",
    value: function onSessionEnd(listener) {
      this.endSessionObservable_.add(listener);
    }
    /**
     * Begin a session.
     */

  }, {
    key: "beginSession",
    value: function beginSession() {
      this.isSessionActive_ = true;
    }
    /**
     * End a session.
     */

  }, {
    key: "endSession",
    value: function endSession() {
      if (this.isSessionActive_) {
        this.endSessionObservable_.fire();
      }

      this.isSessionActive_ = false;
    }
    /**
     * Get the current session state.
     * @return {*} TODO(#23582): Specify return type
     */

  }, {
    key: "isSessionActive",
    value: function isSessionActive() {
      return this.isSessionActive_;
    }
  }]);

  return VideoSessionManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZGVvLXNlc3Npb24tbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJPYnNlcnZhYmxlIiwiVmlkZW9TZXNzaW9uTWFuYWdlciIsImlzU2Vzc2lvbkFjdGl2ZV8iLCJlbmRTZXNzaW9uT2JzZXJ2YWJsZV8iLCJsaXN0ZW5lciIsImFkZCIsImZpcmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFVBQVI7QUFFQSxXQUFhQyxtQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLGlDQUFjO0FBQUE7O0FBQ1o7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QixLQUF4Qjs7QUFFQTtBQUNBLFNBQUtDLHFCQUFMLEdBQTZCLElBQUlILFVBQUosRUFBN0I7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQWZBO0FBQUE7QUFBQSxXQWdCRSxzQkFBYUksUUFBYixFQUF1QjtBQUNyQixXQUFLRCxxQkFBTCxDQUEyQkUsR0FBM0IsQ0FBK0JELFFBQS9CO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBdEJBO0FBQUE7QUFBQSxXQXVCRSx3QkFBZTtBQUNiLFdBQUtGLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7O0FBN0JBO0FBQUE7QUFBQSxXQThCRSxzQkFBYTtBQUNYLFVBQUksS0FBS0EsZ0JBQVQsRUFBMkI7QUFDekIsYUFBS0MscUJBQUwsQ0FBMkJHLElBQTNCO0FBQ0Q7O0FBQ0QsV0FBS0osZ0JBQUwsR0FBd0IsS0FBeEI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXhDQTtBQUFBO0FBQUEsV0F5Q0UsMkJBQWtCO0FBQ2hCLGFBQU8sS0FBS0EsZ0JBQVo7QUFDRDtBQTNDSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuXG5leHBvcnQgY2xhc3MgVmlkZW9TZXNzaW9uTWFuYWdlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIFZpZGVvU2Vzc2lvbk1hbmFnZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKiogQHByaXZhdGUgKi9cbiAgICB0aGlzLmlzU2Vzc2lvbkFjdGl2ZV8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSAqL1xuICAgIHRoaXMuZW5kU2Vzc2lvbk9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIG5vdGlmaWVkIHdoZW4gYSBzZXNzaW9uIGhhcyBlbmRlZFxuICAgKiBAcGFyYW0geyFGdW5jdGlvbn0gbGlzdGVuZXJcbiAgICovXG4gIG9uU2Vzc2lvbkVuZChsaXN0ZW5lcikge1xuICAgIHRoaXMuZW5kU2Vzc2lvbk9ic2VydmFibGVfLmFkZChsaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogQmVnaW4gYSBzZXNzaW9uLlxuICAgKi9cbiAgYmVnaW5TZXNzaW9uKCkge1xuICAgIHRoaXMuaXNTZXNzaW9uQWN0aXZlXyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRW5kIGEgc2Vzc2lvbi5cbiAgICovXG4gIGVuZFNlc3Npb24oKSB7XG4gICAgaWYgKHRoaXMuaXNTZXNzaW9uQWN0aXZlXykge1xuICAgICAgdGhpcy5lbmRTZXNzaW9uT2JzZXJ2YWJsZV8uZmlyZSgpO1xuICAgIH1cbiAgICB0aGlzLmlzU2Vzc2lvbkFjdGl2ZV8gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgc2Vzc2lvbiBzdGF0ZS5cbiAgICogQHJldHVybiB7Kn0gVE9ETygjMjM1ODIpOiBTcGVjaWZ5IHJldHVybiB0eXBlXG4gICAqL1xuICBpc1Nlc3Npb25BY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTZXNzaW9uQWN0aXZlXztcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/video-session-manager.js