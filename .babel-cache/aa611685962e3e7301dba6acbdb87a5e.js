import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { devAssert } from "../core/assert";
import { iterateCursor, removeElement } from "../core/dom";
import { childElementsByTag } from "../core/dom/query";

import { Services } from "../service";

import { dev } from "../log";

/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the new target root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @interface
 * @extends {WritableStreamDefaultWriter}
 * @visibleForTesting
 */
export var DomWriter = /*#__PURE__*/function () {function DomWriter() {_classCallCheck(this, DomWriter);}_createClass(DomWriter, [{ key: "onBody", value:
    /**
     * Sets the callback that will be called when body has been parsed.
     *
     * For shadow use case, unlike most of other nodes, `<body>` cannot be simply
     * merged to support Shadow DOM polyfill where the use of `<body>`
     * element is not possible.
     *
     * The callback will be given the parsed document and it must return back
     * the reconstructed `<body>` node in the target DOM where all children
     * will be streamed into.
     *
     * @param {function(!Document):!Element} unusedCallback
     */
    function onBody(unusedCallback) {}

    /**
     * Sets the callback that will be called when new nodes have been merged
     * into the target DOM.
     * @param {function()} unusedCallback
     */ }, { key: "onBodyChunk", value:
    function onBodyChunk(unusedCallback) {}

    /**
     * Sets the callback that will be called when the DOM has been fully
     * constructed.
     * @param {function()} unusedCallback
     */ }, { key: "onEnd", value:
    function onEnd(unusedCallback) {} }]);return DomWriter;}();


/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the given root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @implements {DomWriter}
 * @visibleForTesting
 */
export var DomWriterStreamer = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function DomWriterStreamer(win) {_classCallCheck(this, DomWriterStreamer);
    /** @const @private {!Document} */
    this.parser_ = win.document.implementation.createHTMLDocument('');
    this.parser_.open();

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const */
    this.boundMerge_ = this.merge_.bind(this);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @private {boolean} */
    this.mergeScheduled_ = false;

    /** @const @private {!Promise} */
    this.success_ = _resolvedPromise();

    /** @private {boolean} */
    this.eof_ = false;

    /** @private {?Element} */
    this.targetBody_ = null;
  }

  /** @override */_createClass(DomWriterStreamer, [{ key: "onBody", value:
    function onBody(callback) {
      this.onBody_ = callback;
    }

    /** @override */ }, { key: "onBodyChunk", value:
    function onBodyChunk(callback) {
      this.onBodyChunk_ = callback;
    }

    /** @override */ }, { key: "onEnd", value:
    function onEnd(callback) {
      this.onEnd_ = callback;
    }

    /** @override */ }, { key: "write", value:
    function write(chunk) {
      if (this.eof_) {
        throw new Error('closed already');
      }
      if (chunk) {
        this.parser_.write( /** @type {string} */(chunk));
      }
      this.schedule_();
      return this.success_;
    }

    /** @override */ }, { key: "close", value:
    function close() {
      this.parser_.close();
      this.eof_ = true;
      this.schedule_();
      return this.success_;
    }

    /** @override */ }, { key: "abort", value:
    function abort(unusedReason) {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "releaseLock", value:
    function releaseLock() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "closed", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "desiredSize", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "ready", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @private */ }, { key: "schedule_", value:
    function schedule_() {
      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
      if (!this.mergeScheduled_) {
        this.mergeScheduled_ = true;
        this.vsync_.mutate(this.boundMerge_);
      }
    }

    /** @private */ }, { key: "merge_", value:
    function merge_() {
      this.mergeScheduled_ = false;

      // Body has been newly parsed.
      if (!this.targetBody_ && this.parser_.body) {
        this.targetBody_ = this.onBody_(this.parser_);
      }

      // Merge body children.
      if (this.targetBody_) {
        var inputBody = /** @type {!Element} */(this.parser_.body);
        var targetBody = devAssert(this.targetBody_);
        var transferCount = 0;
        removeNoScriptElements(inputBody);
        while (inputBody.firstChild) {
          transferCount++;
          targetBody.appendChild(inputBody.firstChild);
        }
        if (transferCount > 0) {
          this.onBodyChunk_();
        }
      }

      // EOF.
      if (this.eof_) {
        this.onEnd_();
      }
    } }]);return DomWriterStreamer;}();


/**
 * Takes as an input a text stream, aggregates it and parses it in one bulk.
 * This is a workaround against the browsers that do not support streaming DOM
 * parsing. Mainly currently Firefox.
 *
 * See https://github.com/whatwg/html/issues/2827 and
 * https://bugzilla.mozilla.org/show_bug.cgi?id=867102
 *
 * @implements {DomWriter}
 * @visibleForTesting
 */
export var DomWriterBulk = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function DomWriterBulk(win) {_classCallCheck(this, DomWriterBulk);
    /** @private {!Array<string>} */
    this.fullHtml_ = [];

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @const @private {!Promise} */
    this.success_ = _resolvedPromise2();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /** @override */_createClass(DomWriterBulk, [{ key: "onBody", value:
    function onBody(callback) {
      this.onBody_ = callback;
    }

    /** @override */ }, { key: "onBodyChunk", value:
    function onBodyChunk(callback) {
      this.onBodyChunk_ = callback;
    }

    /** @override */ }, { key: "onEnd", value:
    function onEnd(callback) {
      this.onEnd_ = callback;
    }

    /** @override */ }, { key: "write", value:
    function write(chunk) {
      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
      if (this.eof_) {
        throw new Error('closed already');
      }
      if (chunk) {
        this.fullHtml_.push( /** @type {string} */(chunk));
      }
      return this.success_;
    }

    /** @override */ }, { key: "close", value:
    function close() {var _this = this;
      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
      this.eof_ = true;
      this.vsync_.mutate(function () {return _this.complete_();});
      return this.success_;
    }

    /** @override */ }, { key: "abort", value:
    function abort(unusedReason) {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "releaseLock", value:
    function releaseLock() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "closed", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "desiredSize", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @override */ }, { key: "ready", get:
    function get() {
      throw new Error('Not implemented');
    }

    /** @private */ }, { key: "complete_", value:
    function complete_() {
      var fullHtml = this.fullHtml_.join('');
      var doc = new DOMParser().parseFromString(fullHtml, 'text/html');

      // Merge body.
      if (doc.body) {
        var inputBody = doc.body;
        var targetBody = this.onBody_(doc);
        var transferCount = 0;
        removeNoScriptElements(inputBody);
        while (inputBody.firstChild) {
          transferCount++;
          targetBody.appendChild(inputBody.firstChild);
        }
        if (transferCount > 0) {
          this.onBodyChunk_();
        }
      }

      // EOF.
      this.onEnd_();
    } }]);return DomWriterBulk;}();


/**
 * Remove any noscript elements.
 *
 * According to the spec
 * (https://w3c.github.io/DOM-Parsing/#the-domparser-interface), with
 * `DOMParser().parseFromString`, contents of `noscript` get parsed as markup,
 * so we need to remove them manually. Why? ¯\_(ツ)_/¯ `createHTMLDocument()`
 * seems to behave the same way.
 *
 * @param {!Element} parent
 */
export function removeNoScriptElements(parent) {
  var noscriptElements = childElementsByTag(parent, 'noscript');
  iterateCursor(noscriptElements, function (element) {
    removeElement(element);
  });
}
// /Users/mszylkowski/src/amphtml/src/utils/dom-writer.js