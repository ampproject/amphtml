function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function VideoSessionManager() {_classCallCheck(this, VideoSessionManager);
    /** @private */
    this.isSessionActive_ = false;

    /** @private */
    this.endSessionObservable_ = new Observable();
  }

  /**
   * Register a listener to be notified when a session has ended
   * @param {!Function} listener
   */_createClass(VideoSessionManager, [{ key: "onSessionEnd", value:
    function onSessionEnd(listener) {
      this.endSessionObservable_.add(listener);
    }

    /**
     * Begin a session.
     */ }, { key: "beginSession", value:
    function beginSession() {
      this.isSessionActive_ = true;
    }

    /**
     * End a session.
     */ }, { key: "endSession", value:
    function endSession() {
      if (this.isSessionActive_) {
        this.endSessionObservable_.fire();
      }
      this.isSessionActive_ = false;
    }

    /**
     * Get the current session state.
     * @return {*} TODO(#23582): Specify return type
     */ }, { key: "isSessionActive", value:
    function isSessionActive() {
      return this.isSessionActive_;
    } }]);return VideoSessionManager;}();
// /Users/mszylkowski/src/amphtml/src/service/video-session-manager.js