import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
export var DomWriter = /*#__PURE__*/function () {
  function DomWriter() {
    _classCallCheck(this, DomWriter);
  }

  _createClass(DomWriter, [{
    key: "onBody",
    value:
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
     */

  }, {
    key: "onBodyChunk",
    value: function onBodyChunk(unusedCallback) {}
    /**
     * Sets the callback that will be called when the DOM has been fully
     * constructed.
     * @param {function()} unusedCallback
     */

  }, {
    key: "onEnd",
    value: function onEnd(unusedCallback) {}
  }]);

  return DomWriter;
}();

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
  function DomWriterStreamer(win) {
    _classCallCheck(this, DomWriterStreamer);

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

  /** @override */
  _createClass(DomWriterStreamer, [{
    key: "onBody",
    value: function onBody(callback) {
      this.onBody_ = callback;
    }
    /** @override */

  }, {
    key: "onBodyChunk",
    value: function onBodyChunk(callback) {
      this.onBodyChunk_ = callback;
    }
    /** @override */

  }, {
    key: "onEnd",
    value: function onEnd(callback) {
      this.onEnd_ = callback;
    }
    /** @override */

  }, {
    key: "write",
    value: function write(chunk) {
      if (this.eof_) {
        throw new Error('closed already');
      }

      if (chunk) {
        this.parser_.write(
        /** @type {string} */
        chunk);
      }

      this.schedule_();
      return this.success_;
    }
    /** @override */

  }, {
    key: "close",
    value: function close() {
      this.parser_.close();
      this.eof_ = true;
      this.schedule_();
      return this.success_;
    }
    /** @override */

  }, {
    key: "abort",
    value: function abort(unusedReason) {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "releaseLock",
    value: function releaseLock() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "closed",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "desiredSize",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "ready",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @private */

  }, {
    key: "schedule_",
    value: function schedule_() {
      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);

      if (!this.mergeScheduled_) {
        this.mergeScheduled_ = true;
        this.vsync_.mutate(this.boundMerge_);
      }
    }
    /** @private */

  }, {
    key: "merge_",
    value: function merge_() {
      this.mergeScheduled_ = false;

      // Body has been newly parsed.
      if (!this.targetBody_ && this.parser_.body) {
        this.targetBody_ = this.onBody_(this.parser_);
      }

      // Merge body children.
      if (this.targetBody_) {
        var inputBody = dev().assertElement(this.parser_.body);
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
    }
  }]);

  return DomWriterStreamer;
}();

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
  function DomWriterBulk(win) {
    _classCallCheck(this, DomWriterBulk);

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

  /** @override */
  _createClass(DomWriterBulk, [{
    key: "onBody",
    value: function onBody(callback) {
      this.onBody_ = callback;
    }
    /** @override */

  }, {
    key: "onBodyChunk",
    value: function onBodyChunk(callback) {
      this.onBodyChunk_ = callback;
    }
    /** @override */

  }, {
    key: "onEnd",
    value: function onEnd(callback) {
      this.onEnd_ = callback;
    }
    /** @override */

  }, {
    key: "write",
    value: function write(chunk) {
      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);

      if (this.eof_) {
        throw new Error('closed already');
      }

      if (chunk) {
        this.fullHtml_.push(dev().assertString(chunk));
      }

      return this.success_;
    }
    /** @override */

  }, {
    key: "close",
    value: function close() {
      var _this = this;

      devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
      this.eof_ = true;
      this.vsync_.mutate(function () {
        return _this.complete_();
      });
      return this.success_;
    }
    /** @override */

  }, {
    key: "abort",
    value: function abort(unusedReason) {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "releaseLock",
    value: function releaseLock() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "closed",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "desiredSize",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @override */

  }, {
    key: "ready",
    get: function get() {
      throw new Error('Not implemented');
    }
    /** @private */

  }, {
    key: "complete_",
    value: function complete_() {
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
    }
  }]);

  return DomWriterBulk;
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS13cml0ZXIuanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiaXRlcmF0ZUN1cnNvciIsInJlbW92ZUVsZW1lbnQiLCJjaGlsZEVsZW1lbnRzQnlUYWciLCJTZXJ2aWNlcyIsImRldiIsIkRvbVdyaXRlciIsInVudXNlZENhbGxiYWNrIiwiRG9tV3JpdGVyU3RyZWFtZXIiLCJ3aW4iLCJwYXJzZXJfIiwiZG9jdW1lbnQiLCJpbXBsZW1lbnRhdGlvbiIsImNyZWF0ZUhUTUxEb2N1bWVudCIsIm9wZW4iLCJ2c3luY18iLCJ2c3luY0ZvciIsImJvdW5kTWVyZ2VfIiwibWVyZ2VfIiwiYmluZCIsIm9uQm9keV8iLCJvbkJvZHlDaHVua18iLCJvbkVuZF8iLCJtZXJnZVNjaGVkdWxlZF8iLCJzdWNjZXNzXyIsImVvZl8iLCJ0YXJnZXRCb2R5XyIsImNhbGxiYWNrIiwiY2h1bmsiLCJFcnJvciIsIndyaXRlIiwic2NoZWR1bGVfIiwiY2xvc2UiLCJ1bnVzZWRSZWFzb24iLCJtdXRhdGUiLCJib2R5IiwiaW5wdXRCb2R5IiwiYXNzZXJ0RWxlbWVudCIsInRhcmdldEJvZHkiLCJ0cmFuc2ZlckNvdW50IiwicmVtb3ZlTm9TY3JpcHRFbGVtZW50cyIsImZpcnN0Q2hpbGQiLCJhcHBlbmRDaGlsZCIsIkRvbVdyaXRlckJ1bGsiLCJmdWxsSHRtbF8iLCJwdXNoIiwiYXNzZXJ0U3RyaW5nIiwiY29tcGxldGVfIiwiZnVsbEh0bWwiLCJqb2luIiwiZG9jIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwicGFyZW50Iiwibm9zY3JpcHRFbGVtZW50cyIsImVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFDQSxTQUFRQyxhQUFSLEVBQXVCQyxhQUF2QjtBQUNBLFNBQVFDLGtCQUFSO0FBRUEs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LFNBQUwsQ0FBZUssSUFBZixDQUFvQixFQUFwQixDQUFqQjtBQUNBLFVBQU1DLEdBQUcsR0FBRyxJQUFJQyxTQUFKLEdBQWdCQyxlQUFoQixDQUFnQ0osUUFBaEMsRUFBMEMsV0FBMUMsQ0FBWjs7QUFFQTtBQUNBLFVBQUlFLEdBQUcsQ0FBQ2YsSUFBUixFQUFjO0FBQ1osWUFBTUMsU0FBUyxHQUFHYyxHQUFHLENBQUNmLElBQXRCO0FBQ0EsWUFBTUcsVUFBVSxHQUFHLEtBQUtsQixPQUFMLENBQWE4QixHQUFiLENBQW5CO0FBQ0EsWUFBSVgsYUFBYSxHQUFHLENBQXBCO0FBQ0FDLFFBQUFBLHNCQUFzQixDQUFDSixTQUFELENBQXRCOztBQUNBLGVBQU9BLFNBQVMsQ0FBQ0ssVUFBakIsRUFBNkI7QUFDM0JGLFVBQUFBLGFBQWE7QUFDYkQsVUFBQUEsVUFBVSxDQUFDSSxXQUFYLENBQXVCTixTQUFTLENBQUNLLFVBQWpDO0FBQ0Q7O0FBQ0QsWUFBSUYsYUFBYSxHQUFHLENBQXBCLEVBQXVCO0FBQ3JCLGVBQUtsQixZQUFMO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFdBQUtDLE1BQUw7QUFDRDtBQTdHSDs7QUFBQTtBQUFBOztBQWdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTa0Isc0JBQVQsQ0FBZ0NhLE1BQWhDLEVBQXdDO0FBQzdDLE1BQU1DLGdCQUFnQixHQUFHbkQsa0JBQWtCLENBQUNrRCxNQUFELEVBQVMsVUFBVCxDQUEzQztBQUNBcEQsRUFBQUEsYUFBYSxDQUFDcUQsZ0JBQUQsRUFBbUIsVUFBQ0MsT0FBRCxFQUFhO0FBQzNDckQsSUFBQUEsYUFBYSxDQUFDcUQsT0FBRCxDQUFiO0FBQ0QsR0FGWSxDQUFiO0FBR0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkZXZBc3NlcnR9IGZyb20gJyNjb3JlL2Fzc2VydCc7XG5pbXBvcnQge2l0ZXJhdGVDdXJzb3IsIHJlbW92ZUVsZW1lbnR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2NoaWxkRWxlbWVudHNCeVRhZ30gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vbG9nJztcblxuLyoqXG4gKiBUYWtlcyBhcyBhbiBpbnB1dCBhIHRleHQgc3RyZWFtLCBwYXJzZXMgaXQgYW5kIGluY3JlbWVudGFsbHkgcmVjb25zdHJ1Y3RzXG4gKiBpdCBpbiB0aGUgbmV3IHRhcmdldCByb290LlxuICpcbiAqIFNlZSBodHRwczovL2pha2VhcmNoaWJhbGQuY29tLzIwMTYvZnVuLWhhY2tzLWZhc3Rlci1jb250ZW50LyBmb3IgbW9yZVxuICogZGV0YWlscy5cbiAqXG4gKiBAaW50ZXJmYWNlXG4gKiBAZXh0ZW5kcyB7V3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBEb21Xcml0ZXIge1xuICAvKipcbiAgICogU2V0cyB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIGJvZHkgaGFzIGJlZW4gcGFyc2VkLlxuICAgKlxuICAgKiBGb3Igc2hhZG93IHVzZSBjYXNlLCB1bmxpa2UgbW9zdCBvZiBvdGhlciBub2RlcywgYDxib2R5PmAgY2Fubm90IGJlIHNpbXBseVxuICAgKiBtZXJnZWQgdG8gc3VwcG9ydCBTaGFkb3cgRE9NIHBvbHlmaWxsIHdoZXJlIHRoZSB1c2Ugb2YgYDxib2R5PmBcbiAgICogZWxlbWVudCBpcyBub3QgcG9zc2libGUuXG4gICAqXG4gICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGdpdmVuIHRoZSBwYXJzZWQgZG9jdW1lbnQgYW5kIGl0IG11c3QgcmV0dXJuIGJhY2tcbiAgICogdGhlIHJlY29uc3RydWN0ZWQgYDxib2R5PmAgbm9kZSBpbiB0aGUgdGFyZ2V0IERPTSB3aGVyZSBhbGwgY2hpbGRyZW5cbiAgICogd2lsbCBiZSBzdHJlYW1lZCBpbnRvLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFEb2N1bWVudCk6IUVsZW1lbnR9IHVudXNlZENhbGxiYWNrXG4gICAqL1xuICBvbkJvZHkodW51c2VkQ2FsbGJhY2spIHt9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiBuZXcgbm9kZXMgaGF2ZSBiZWVuIG1lcmdlZFxuICAgKiBpbnRvIHRoZSB0YXJnZXQgRE9NLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IHVudXNlZENhbGxiYWNrXG4gICAqL1xuICBvbkJvZHlDaHVuayh1bnVzZWRDYWxsYmFjaykge31cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBET00gaGFzIGJlZW4gZnVsbHlcbiAgICogY29uc3RydWN0ZWQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gdW51c2VkQ2FsbGJhY2tcbiAgICovXG4gIG9uRW5kKHVudXNlZENhbGxiYWNrKSB7fVxufVxuXG4vKipcbiAqIFRha2VzIGFzIGFuIGlucHV0IGEgdGV4dCBzdHJlYW0sIHBhcnNlcyBpdCBhbmQgaW5jcmVtZW50YWxseSByZWNvbnN0cnVjdHNcbiAqIGl0IGluIHRoZSBnaXZlbiByb290LlxuICpcbiAqIFNlZSBodHRwczovL2pha2VhcmNoaWJhbGQuY29tLzIwMTYvZnVuLWhhY2tzLWZhc3Rlci1jb250ZW50LyBmb3IgbW9yZVxuICogZGV0YWlscy5cbiAqXG4gKiBAaW1wbGVtZW50cyB7RG9tV3JpdGVyfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBEb21Xcml0ZXJTdHJlYW1lciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IURvY3VtZW50fSAqL1xuICAgIHRoaXMucGFyc2VyXyA9IHdpbi5kb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJycpO1xuICAgIHRoaXMucGFyc2VyXy5vcGVuKCk7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlICovXG4gICAgdGhpcy52c3luY18gPSBTZXJ2aWNlcy52c3luY0Zvcih3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMuYm91bmRNZXJnZV8gPSB0aGlzLm1lcmdlXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/ZnVuY3Rpb24oIURvY3VtZW50KTohRWxlbWVudH0gKi9cbiAgICB0aGlzLm9uQm9keV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLm9uQm9keUNodW5rXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9mdW5jdGlvbigpfSAqL1xuICAgIHRoaXMub25FbmRfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLm1lcmdlU2NoZWR1bGVkXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IVByb21pc2V9ICovXG4gICAgdGhpcy5zdWNjZXNzXyA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuZW9mXyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RWxlbWVudH0gKi9cbiAgICB0aGlzLnRhcmdldEJvZHlfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25Cb2R5KGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbkJvZHlfID0gY2FsbGJhY2s7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uQm9keUNodW5rKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbkJvZHlDaHVua18gPSBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25FbmQoY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uRW5kXyA9IGNhbGxiYWNrO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB3cml0ZShjaHVuaykge1xuICAgIGlmICh0aGlzLmVvZl8pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2xvc2VkIGFscmVhZHknKTtcbiAgICB9XG4gICAgaWYgKGNodW5rKSB7XG4gICAgICB0aGlzLnBhcnNlcl8ud3JpdGUoLyoqIEB0eXBlIHtzdHJpbmd9ICovIChjaHVuaykpO1xuICAgIH1cbiAgICB0aGlzLnNjaGVkdWxlXygpO1xuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3NfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjbG9zZSgpIHtcbiAgICB0aGlzLnBhcnNlcl8uY2xvc2UoKTtcbiAgICB0aGlzLmVvZl8gPSB0cnVlO1xuICAgIHRoaXMuc2NoZWR1bGVfKCk7XG4gICAgcmV0dXJuIHRoaXMuc3VjY2Vzc187XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGFib3J0KHVudXNlZFJlYXNvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlbGVhc2VMb2NrKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldCBjbG9zZWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0IGRlc2lyZWRTaXplKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldCByZWFkeSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHNjaGVkdWxlXygpIHtcbiAgICBkZXZBc3NlcnQodGhpcy5vbkJvZHlfICYmIHRoaXMub25Cb2R5Q2h1bmtfICYmIHRoaXMub25FbmRfKTtcbiAgICBpZiAoIXRoaXMubWVyZ2VTY2hlZHVsZWRfKSB7XG4gICAgICB0aGlzLm1lcmdlU2NoZWR1bGVkXyA9IHRydWU7XG4gICAgICB0aGlzLnZzeW5jXy5tdXRhdGUodGhpcy5ib3VuZE1lcmdlXyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIG1lcmdlXygpIHtcbiAgICB0aGlzLm1lcmdlU2NoZWR1bGVkXyA9IGZhbHNlO1xuXG4gICAgLy8gQm9keSBoYXMgYmVlbiBuZXdseSBwYXJzZWQuXG4gICAgaWYgKCF0aGlzLnRhcmdldEJvZHlfICYmIHRoaXMucGFyc2VyXy5ib2R5KSB7XG4gICAgICB0aGlzLnRhcmdldEJvZHlfID0gdGhpcy5vbkJvZHlfKHRoaXMucGFyc2VyXyk7XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgYm9keSBjaGlsZHJlbi5cbiAgICBpZiAodGhpcy50YXJnZXRCb2R5Xykge1xuICAgICAgY29uc3QgaW5wdXRCb2R5ID0gZGV2KCkuYXNzZXJ0RWxlbWVudCh0aGlzLnBhcnNlcl8uYm9keSk7XG4gICAgICBjb25zdCB0YXJnZXRCb2R5ID0gZGV2QXNzZXJ0KHRoaXMudGFyZ2V0Qm9keV8pO1xuICAgICAgbGV0IHRyYW5zZmVyQ291bnQgPSAwO1xuICAgICAgcmVtb3ZlTm9TY3JpcHRFbGVtZW50cyhpbnB1dEJvZHkpO1xuICAgICAgd2hpbGUgKGlucHV0Qm9keS5maXJzdENoaWxkKSB7XG4gICAgICAgIHRyYW5zZmVyQ291bnQrKztcbiAgICAgICAgdGFyZ2V0Qm9keS5hcHBlbmRDaGlsZChpbnB1dEJvZHkuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNmZXJDb3VudCA+IDApIHtcbiAgICAgICAgdGhpcy5vbkJvZHlDaHVua18oKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFT0YuXG4gICAgaWYgKHRoaXMuZW9mXykge1xuICAgICAgdGhpcy5vbkVuZF8oKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyBhcyBhbiBpbnB1dCBhIHRleHQgc3RyZWFtLCBhZ2dyZWdhdGVzIGl0IGFuZCBwYXJzZXMgaXQgaW4gb25lIGJ1bGsuXG4gKiBUaGlzIGlzIGEgd29ya2Fyb3VuZCBhZ2FpbnN0IHRoZSBicm93c2VycyB0aGF0IGRvIG5vdCBzdXBwb3J0IHN0cmVhbWluZyBET01cbiAqIHBhcnNpbmcuIE1haW5seSBjdXJyZW50bHkgRmlyZWZveC5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3doYXR3Zy9odG1sL2lzc3Vlcy8yODI3IGFuZFxuICogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODY3MTAyXG4gKlxuICogQGltcGxlbWVudHMge0RvbVdyaXRlcn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgRG9tV3JpdGVyQnVsayB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIHshQXJyYXk8c3RyaW5nPn0gKi9cbiAgICB0aGlzLmZ1bGxIdG1sXyA9IFtdO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSAqL1xuICAgIHRoaXMudnN5bmNfID0gU2VydmljZXMudnN5bmNGb3Iod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCFEb2N1bWVudCk6IUVsZW1lbnR9ICovXG4gICAgdGhpcy5vbkJvZHlfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Z1bmN0aW9uKCl9ICovXG4gICAgdGhpcy5vbkJvZHlDaHVua18gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/ZnVuY3Rpb24oKX0gKi9cbiAgICB0aGlzLm9uRW5kXyA9IG51bGw7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshUHJvbWlzZX0gKi9cbiAgICB0aGlzLnN1Y2Nlc3NfID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5lb2ZfID0gZmFsc2U7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uQm9keShjYWxsYmFjaykge1xuICAgIHRoaXMub25Cb2R5XyA9IGNhbGxiYWNrO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvbkJvZHlDaHVuayhjYWxsYmFjaykge1xuICAgIHRoaXMub25Cb2R5Q2h1bmtfID0gY2FsbGJhY2s7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uRW5kKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbkVuZF8gPSBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgd3JpdGUoY2h1bmspIHtcbiAgICBkZXZBc3NlcnQodGhpcy5vbkJvZHlfICYmIHRoaXMub25Cb2R5Q2h1bmtfICYmIHRoaXMub25FbmRfKTtcbiAgICBpZiAodGhpcy5lb2ZfKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nsb3NlZCBhbHJlYWR5Jyk7XG4gICAgfVxuICAgIGlmIChjaHVuaykge1xuICAgICAgdGhpcy5mdWxsSHRtbF8ucHVzaChkZXYoKS5hc3NlcnRTdHJpbmcoY2h1bmspKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3VjY2Vzc187XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGNsb3NlKCkge1xuICAgIGRldkFzc2VydCh0aGlzLm9uQm9keV8gJiYgdGhpcy5vbkJvZHlDaHVua18gJiYgdGhpcy5vbkVuZF8pO1xuICAgIHRoaXMuZW9mXyA9IHRydWU7XG4gICAgdGhpcy52c3luY18ubXV0YXRlKCgpID0+IHRoaXMuY29tcGxldGVfKCkpO1xuICAgIHJldHVybiB0aGlzLnN1Y2Nlc3NfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhYm9ydCh1bnVzZWRSZWFzb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZWxlYXNlTG9jaygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXQgY2xvc2VkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldCBkZXNpcmVkU2l6ZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXQgcmVhZHkoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBjb21wbGV0ZV8oKSB7XG4gICAgY29uc3QgZnVsbEh0bWwgPSB0aGlzLmZ1bGxIdG1sXy5qb2luKCcnKTtcbiAgICBjb25zdCBkb2MgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKGZ1bGxIdG1sLCAndGV4dC9odG1sJyk7XG5cbiAgICAvLyBNZXJnZSBib2R5LlxuICAgIGlmIChkb2MuYm9keSkge1xuICAgICAgY29uc3QgaW5wdXRCb2R5ID0gZG9jLmJvZHk7XG4gICAgICBjb25zdCB0YXJnZXRCb2R5ID0gdGhpcy5vbkJvZHlfKGRvYyk7XG4gICAgICBsZXQgdHJhbnNmZXJDb3VudCA9IDA7XG4gICAgICByZW1vdmVOb1NjcmlwdEVsZW1lbnRzKGlucHV0Qm9keSk7XG4gICAgICB3aGlsZSAoaW5wdXRCb2R5LmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgdHJhbnNmZXJDb3VudCsrO1xuICAgICAgICB0YXJnZXRCb2R5LmFwcGVuZENoaWxkKGlucHV0Qm9keS5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2ZlckNvdW50ID4gMCkge1xuICAgICAgICB0aGlzLm9uQm9keUNodW5rXygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEVPRi5cbiAgICB0aGlzLm9uRW5kXygpO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGFueSBub3NjcmlwdCBlbGVtZW50cy5cbiAqXG4gKiBBY2NvcmRpbmcgdG8gdGhlIHNwZWNcbiAqIChodHRwczovL3czYy5naXRodWIuaW8vRE9NLVBhcnNpbmcvI3RoZS1kb21wYXJzZXItaW50ZXJmYWNlKSwgd2l0aFxuICogYERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZ2AsIGNvbnRlbnRzIG9mIGBub3NjcmlwdGAgZ2V0IHBhcnNlZCBhcyBtYXJrdXAsXG4gKiBzbyB3ZSBuZWVkIHRvIHJlbW92ZSB0aGVtIG1hbnVhbGx5LiBXaHk/IMKvXFxfKOODhClfL8KvIGBjcmVhdGVIVE1MRG9jdW1lbnQoKWBcbiAqIHNlZW1zIHRvIGJlaGF2ZSB0aGUgc2FtZSB3YXkuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVOb1NjcmlwdEVsZW1lbnRzKHBhcmVudCkge1xuICBjb25zdCBub3NjcmlwdEVsZW1lbnRzID0gY2hpbGRFbGVtZW50c0J5VGFnKHBhcmVudCwgJ25vc2NyaXB0Jyk7XG4gIGl0ZXJhdGVDdXJzb3Iobm9zY3JpcHRFbGVtZW50cywgKGVsZW1lbnQpID0+IHtcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpO1xuICB9KTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/utils/dom-writer.js