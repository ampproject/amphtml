function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import { ampMediaElementFor } from "./utils";
import { removeElement } from "../../../src/core/dom";
import { toArray } from "../../../src/core/types/array";

/**
 * Class handling HTMLMediaElements sources.
 */
export var Sources = /*#__PURE__*/function () {
  /**
   * @param {?string=} srcAttr The 'src' attribute of the media element.
   * @param {!Array<!Element>=} srcEls Any child <source> tags of the
   *     media element.
   * @param {!Array<!Element>=} trackEls Any child <track> tags of the
   *     media element.
   */
  function Sources() {var srcAttr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;var srcEls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];var trackEls = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];_classCallCheck(this, Sources);
    /** @private @const {?string} */
    this.srcAttr_ = srcAttr;

    /** @private @const {!Array<!Element>} */
    this.srcEls_ = srcEls;

    /** @private @const {!Array<!Element>} */
    this.trackEls_ = trackEls;
  }

  /**
   * Applies track tags to a specified element. This is done in a separate
   * method from the source tags, because we must wait for "loadedmetadata"
   * video event before doing this.
   * @param {!HTMLMediaElement} element The element to adopt the text tracks
   *     represented by this object.
   * @private
   */_createClass(Sources, [{ key: "applyTracksToElement_", value:
    function applyTracksToElement_(element) {
      Array.prototype.forEach.call(this.trackEls_, function (trackEl) {
        var track = document.createElement('track');
        track.id = trackEl.id;
        track.kind = trackEl.kind;
        track.label = trackEl.label;
        track.srclang = trackEl.srclang;
        track.default = trackEl.default;
        track.src = trackEl.src;
        track.addEventListener('load', function () {
          track.mode = 'showing';
          element.textTracks[0].mode = 'showing';
        });
        element.appendChild(track);
      });
    }

    /**
     * Applies the src attribute and source tags to a specified element.
     * @param {!Window} win
     * @param {!HTMLMediaElement} element The element to adopt the sources
     *     represented by this object.
     */ }, { key: "applyToElement", value:
    function applyToElement(win, element) {var _this = this;
      Sources.removeFrom(win, element);

      if (!this.srcAttr_) {
        element.removeAttribute('src');
      } else {
        element.setAttribute('src', this.srcAttr_);
      }

      Array.prototype.forEach.call(this.srcEls_, function (srcEl) {return (
          element.appendChild(srcEl));});

      if (element.changedSources) {
        element.changedSources();
      }

      if (this.trackEls_.length > 0) {
        // Wait for "loadedmetadata" before adding tracks.
        // Firefox adds tracks, but does not toggle them on unless video metadata
        // is loaded first.
        if (element.readyState >= 1 /* HAVE_METADATA */) {
            this.applyTracksToElement_(element);
          } else {
          var addTracksHandler = function addTracksHandler() {
            element.removeEventListener('loadedmetadata', addTracksHandler);
            _this.applyTracksToElement_(element);
          };

          element.addEventListener('loadedmetadata', addTracksHandler);
        }
      }
    }

    /**
     * Removes and returns the sources from a specified element.
     * @param {!Window} win
     * @param {!Element} element The element whose sources should be removed and
     *     returned.
     * @return {!Sources} An object representing the sources of the specified
     *     element.
     */ }], [{ key: "removeFrom", value:
    function removeFrom(win, element) {
      var elementToUse = ampMediaElementFor(element) || element;

      var srcEl = null;
      // If the src attribute is specified, create a source element from it as it
      // prevents race conditions between amp-story and amp-video propagating or
      // removing attributes from amp-video/video elements.
      if (elementToUse.hasAttribute('src')) {
        srcEl = Sources.createSourceElement(win, elementToUse);
        elementToUse.removeAttribute('src');
      }

      var srcEls = toArray(elementToUse.querySelectorAll('source'));
      srcEls.forEach(function (srcEl) {return removeElement(srcEl);});

      var trackEls = toArray(elementToUse.querySelectorAll('track'));
      trackEls.forEach(function (trackEl) {return removeElement(trackEl);});

      // If the src attribute is present, browsers will follow it and ignore the
      // HTMLSourceElements. To ensure this behavior, drop the sources if the src
      // was specified.
      // cf: https://html.spec.whatwg.org/#concept-media-load-algorithm
      var sourcesToUse = srcEl ? [srcEl] : srcEls;

      return new Sources(null /** srcAttr */, sourcesToUse, trackEls);
    }

    /**
     * Creates a HTMLSourceElement from the element src attribute.
     * @param {!Window} win
     * @param {!Element} element
     * @return {!Element}
     */ }, { key: "createSourceElement", value:
    function createSourceElement(win, element) {
      var srcEl = win.document.createElement('source');

      var srcAttr = element.getAttribute('src');
      srcEl.setAttribute('src', srcAttr);

      var origSrcAttr = element.getAttribute('amp-orig-src');
      if (origSrcAttr) {
        srcEl.setAttribute('amp-orig-src', origSrcAttr);
      }

      var typeAttr = element.getAttribute('type');
      if (typeAttr) {
        srcEl.setAttribute('type', typeAttr);
      }

      return srcEl;
    } }]);return Sources;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/sources.js