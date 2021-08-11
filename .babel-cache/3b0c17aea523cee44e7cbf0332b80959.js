function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
  function Sources(srcAttr, srcEls, trackEls) {
    if (srcAttr === void 0) {
      srcAttr = null;
    }

    if (srcEls === void 0) {
      srcEls = [];
    }

    if (trackEls === void 0) {
      trackEls = [];
    }

    _classCallCheck(this, Sources);

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
   */
  _createClass(Sources, [{
    key: "applyTracksToElement_",
    value: function applyTracksToElement_(element) {
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
     */

  }, {
    key: "applyToElement",
    value: function applyToElement(win, element) {
      var _this = this;

      Sources.removeFrom(win, element);

      if (!this.srcAttr_) {
        element.removeAttribute('src');
      } else {
        element.setAttribute('src', this.srcAttr_);
      }

      Array.prototype.forEach.call(this.srcEls_, function (srcEl) {
        return element.appendChild(srcEl);
      });

      if (element.changedSources) {
        element.changedSources();
      }

      if (this.trackEls_.length > 0) {
        // Wait for "loadedmetadata" before adding tracks.
        // Firefox adds tracks, but does not toggle them on unless video metadata
        // is loaded first.
        if (element.readyState >= 1
        /* HAVE_METADATA */
        ) {
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
     */

  }], [{
    key: "removeFrom",
    value: function removeFrom(win, element) {
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
      srcEls.forEach(function (srcEl) {
        return removeElement(srcEl);
      });
      var trackEls = toArray(elementToUse.querySelectorAll('track'));
      trackEls.forEach(function (trackEl) {
        return removeElement(trackEl);
      });
      // If the src attribute is present, browsers will follow it and ignore the
      // HTMLSourceElements. To ensure this behavior, drop the sources if the src
      // was specified.
      // cf: https://html.spec.whatwg.org/#concept-media-load-algorithm
      var sourcesToUse = srcEl ? [srcEl] : srcEls;
      return new Sources(null
      /** srcAttr */
      , sourcesToUse, trackEls);
    }
    /**
     * Creates a HTMLSourceElement from the element src attribute.
     * @param {!Window} win
     * @param {!Element} element
     * @return {!Element}
     */

  }, {
    key: "createSourceElement",
    value: function createSourceElement(win, element) {
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
    }
  }]);

  return Sources;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvdXJjZXMuanMiXSwibmFtZXMiOlsiYW1wTWVkaWFFbGVtZW50Rm9yIiwicmVtb3ZlRWxlbWVudCIsInRvQXJyYXkiLCJTb3VyY2VzIiwic3JjQXR0ciIsInNyY0VscyIsInRyYWNrRWxzIiwic3JjQXR0cl8iLCJzcmNFbHNfIiwidHJhY2tFbHNfIiwiZWxlbWVudCIsIkFycmF5IiwicHJvdG90eXBlIiwiZm9yRWFjaCIsImNhbGwiLCJ0cmFja0VsIiwidHJhY2siLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpZCIsImtpbmQiLCJsYWJlbCIsInNyY2xhbmciLCJkZWZhdWx0Iiwic3JjIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm1vZGUiLCJ0ZXh0VHJhY2tzIiwiYXBwZW5kQ2hpbGQiLCJ3aW4iLCJyZW1vdmVGcm9tIiwicmVtb3ZlQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwic3JjRWwiLCJjaGFuZ2VkU291cmNlcyIsImxlbmd0aCIsInJlYWR5U3RhdGUiLCJhcHBseVRyYWNrc1RvRWxlbWVudF8iLCJhZGRUcmFja3NIYW5kbGVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImVsZW1lbnRUb1VzZSIsImhhc0F0dHJpYnV0ZSIsImNyZWF0ZVNvdXJjZUVsZW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwic291cmNlc1RvVXNlIiwiZ2V0QXR0cmlidXRlIiwib3JpZ1NyY0F0dHIiLCJ0eXBlQXR0ciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsa0JBQVI7QUFDQSxTQUFRQyxhQUFSO0FBQ0EsU0FBUUMsT0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxPQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSxtQkFBWUMsT0FBWixFQUE0QkMsTUFBNUIsRUFBeUNDLFFBQXpD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QU02QixZQUFZLEdBQUdYLEtBQUssR0FBRyxDQUFDQSxLQUFELENBQUgsR0FBYTVCLE1BQXZDO0FBRUEsYUFBTyxJQUFJRixPQUFKLENBQVk7QUFBSztBQUFqQixRQUFpQ3lDLFlBQWpDLEVBQStDdEMsUUFBL0MsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTNIQTtBQUFBO0FBQUEsV0E0SEUsNkJBQTJCdUIsR0FBM0IsRUFBZ0NuQixPQUFoQyxFQUF5QztBQUN2QyxVQUFNdUIsS0FBSyxHQUFHSixHQUFHLENBQUNaLFFBQUosQ0FBYUMsYUFBYixDQUEyQixRQUEzQixDQUFkO0FBRUEsVUFBTWQsT0FBTyxHQUFHTSxPQUFPLENBQUNtQyxZQUFSLENBQXFCLEtBQXJCLENBQWhCO0FBQ0FaLE1BQUFBLEtBQUssQ0FBQ0QsWUFBTixDQUFtQixLQUFuQixFQUEwQjVCLE9BQTFCO0FBRUEsVUFBTTBDLFdBQVcsR0FBR3BDLE9BQU8sQ0FBQ21DLFlBQVIsQ0FBcUIsY0FBckIsQ0FBcEI7O0FBQ0EsVUFBSUMsV0FBSixFQUFpQjtBQUNmYixRQUFBQSxLQUFLLENBQUNELFlBQU4sQ0FBbUIsY0FBbkIsRUFBbUNjLFdBQW5DO0FBQ0Q7O0FBRUQsVUFBTUMsUUFBUSxHQUFHckMsT0FBTyxDQUFDbUMsWUFBUixDQUFxQixNQUFyQixDQUFqQjs7QUFDQSxVQUFJRSxRQUFKLEVBQWM7QUFDWmQsUUFBQUEsS0FBSyxDQUFDRCxZQUFOLENBQW1CLE1BQW5CLEVBQTJCZSxRQUEzQjtBQUNEOztBQUVELGFBQU9kLEtBQVA7QUFDRDtBQTdJSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7YW1wTWVkaWFFbGVtZW50Rm9yfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7cmVtb3ZlRWxlbWVudH0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7dG9BcnJheX0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuXG4vKipcbiAqIENsYXNzIGhhbmRsaW5nIEhUTUxNZWRpYUVsZW1lbnRzIHNvdXJjZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IHNyY0F0dHIgVGhlICdzcmMnIGF0dHJpYnV0ZSBvZiB0aGUgbWVkaWEgZWxlbWVudC5cbiAgICogQHBhcmFtIHshQXJyYXk8IUVsZW1lbnQ+PX0gc3JjRWxzIEFueSBjaGlsZCA8c291cmNlPiB0YWdzIG9mIHRoZVxuICAgKiAgICAgbWVkaWEgZWxlbWVudC5cbiAgICogQHBhcmFtIHshQXJyYXk8IUVsZW1lbnQ+PX0gdHJhY2tFbHMgQW55IGNoaWxkIDx0cmFjaz4gdGFncyBvZiB0aGVcbiAgICogICAgIG1lZGlhIGVsZW1lbnQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzcmNBdHRyID0gbnVsbCwgc3JjRWxzID0gW10sIHRyYWNrRWxzID0gW10pIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHs/c3RyaW5nfSAqL1xuICAgIHRoaXMuc3JjQXR0cl8gPSBzcmNBdHRyO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFycmF5PCFFbGVtZW50Pn0gKi9cbiAgICB0aGlzLnNyY0Vsc18gPSBzcmNFbHM7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8IUVsZW1lbnQ+fSAqL1xuICAgIHRoaXMudHJhY2tFbHNfID0gdHJhY2tFbHM7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0cmFjayB0YWdzIHRvIGEgc3BlY2lmaWVkIGVsZW1lbnQuIFRoaXMgaXMgZG9uZSBpbiBhIHNlcGFyYXRlXG4gICAqIG1ldGhvZCBmcm9tIHRoZSBzb3VyY2UgdGFncywgYmVjYXVzZSB3ZSBtdXN0IHdhaXQgZm9yIFwibG9hZGVkbWV0YWRhdGFcIlxuICAgKiB2aWRlbyBldmVudCBiZWZvcmUgZG9pbmcgdGhpcy5cbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBhZG9wdCB0aGUgdGV4dCB0cmFja3NcbiAgICogICAgIHJlcHJlc2VudGVkIGJ5IHRoaXMgb2JqZWN0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYXBwbHlUcmFja3NUb0VsZW1lbnRfKGVsZW1lbnQpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMudHJhY2tFbHNfLCAodHJhY2tFbCkgPT4ge1xuICAgICAgY29uc3QgdHJhY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cmFjaycpO1xuICAgICAgdHJhY2suaWQgPSB0cmFja0VsLmlkO1xuICAgICAgdHJhY2sua2luZCA9IHRyYWNrRWwua2luZDtcbiAgICAgIHRyYWNrLmxhYmVsID0gdHJhY2tFbC5sYWJlbDtcbiAgICAgIHRyYWNrLnNyY2xhbmcgPSB0cmFja0VsLnNyY2xhbmc7XG4gICAgICB0cmFjay5kZWZhdWx0ID0gdHJhY2tFbC5kZWZhdWx0O1xuICAgICAgdHJhY2suc3JjID0gdHJhY2tFbC5zcmM7XG4gICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICB0cmFjay5tb2RlID0gJ3Nob3dpbmcnO1xuICAgICAgICBlbGVtZW50LnRleHRUcmFja3NbMF0ubW9kZSA9ICdzaG93aW5nJztcbiAgICAgIH0pO1xuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0cmFjayk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyB0aGUgc3JjIGF0dHJpYnV0ZSBhbmQgc291cmNlIHRhZ3MgdG8gYSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshSFRNTE1lZGlhRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBhZG9wdCB0aGUgc291cmNlc1xuICAgKiAgICAgcmVwcmVzZW50ZWQgYnkgdGhpcyBvYmplY3QuXG4gICAqL1xuICBhcHBseVRvRWxlbWVudCh3aW4sIGVsZW1lbnQpIHtcbiAgICBTb3VyY2VzLnJlbW92ZUZyb20od2luLCBlbGVtZW50KTtcblxuICAgIGlmICghdGhpcy5zcmNBdHRyXykge1xuICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3NyYycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5zcmNBdHRyXyk7XG4gICAgfVxuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aGlzLnNyY0Vsc18sIChzcmNFbCkgPT5cbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc3JjRWwpXG4gICAgKTtcbiAgICBpZiAoZWxlbWVudC5jaGFuZ2VkU291cmNlcykge1xuICAgICAgZWxlbWVudC5jaGFuZ2VkU291cmNlcygpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRyYWNrRWxzXy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBXYWl0IGZvciBcImxvYWRlZG1ldGFkYXRhXCIgYmVmb3JlIGFkZGluZyB0cmFja3MuXG4gICAgICAvLyBGaXJlZm94IGFkZHMgdHJhY2tzLCBidXQgZG9lcyBub3QgdG9nZ2xlIHRoZW0gb24gdW5sZXNzIHZpZGVvIG1ldGFkYXRhXG4gICAgICAvLyBpcyBsb2FkZWQgZmlyc3QuXG4gICAgICBpZiAoZWxlbWVudC5yZWFkeVN0YXRlID49IDEgLyogSEFWRV9NRVRBREFUQSAqLykge1xuICAgICAgICB0aGlzLmFwcGx5VHJhY2tzVG9FbGVtZW50XyhlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGFkZFRyYWNrc0hhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkZWRtZXRhZGF0YScsIGFkZFRyYWNrc0hhbmRsZXIpO1xuICAgICAgICAgIHRoaXMuYXBwbHlUcmFja3NUb0VsZW1lbnRfKGVsZW1lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkbWV0YWRhdGEnLCBhZGRUcmFja3NIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbmQgcmV0dXJucyB0aGUgc291cmNlcyBmcm9tIGEgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgd2hvc2Ugc291cmNlcyBzaG91bGQgYmUgcmVtb3ZlZCBhbmRcbiAgICogICAgIHJldHVybmVkLlxuICAgKiBAcmV0dXJuIHshU291cmNlc30gQW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgc291cmNlcyBvZiB0aGUgc3BlY2lmaWVkXG4gICAqICAgICBlbGVtZW50LlxuICAgKi9cbiAgc3RhdGljIHJlbW92ZUZyb20od2luLCBlbGVtZW50KSB7XG4gICAgY29uc3QgZWxlbWVudFRvVXNlID0gYW1wTWVkaWFFbGVtZW50Rm9yKGVsZW1lbnQpIHx8IGVsZW1lbnQ7XG5cbiAgICBsZXQgc3JjRWwgPSBudWxsO1xuICAgIC8vIElmIHRoZSBzcmMgYXR0cmlidXRlIGlzIHNwZWNpZmllZCwgY3JlYXRlIGEgc291cmNlIGVsZW1lbnQgZnJvbSBpdCBhcyBpdFxuICAgIC8vIHByZXZlbnRzIHJhY2UgY29uZGl0aW9ucyBiZXR3ZWVuIGFtcC1zdG9yeSBhbmQgYW1wLXZpZGVvIHByb3BhZ2F0aW5nIG9yXG4gICAgLy8gcmVtb3ZpbmcgYXR0cmlidXRlcyBmcm9tIGFtcC12aWRlby92aWRlbyBlbGVtZW50cy5cbiAgICBpZiAoZWxlbWVudFRvVXNlLmhhc0F0dHJpYnV0ZSgnc3JjJykpIHtcbiAgICAgIHNyY0VsID0gU291cmNlcy5jcmVhdGVTb3VyY2VFbGVtZW50KHdpbiwgZWxlbWVudFRvVXNlKTtcbiAgICAgIGVsZW1lbnRUb1VzZS5yZW1vdmVBdHRyaWJ1dGUoJ3NyYycpO1xuICAgIH1cblxuICAgIGNvbnN0IHNyY0VscyA9IHRvQXJyYXkoZWxlbWVudFRvVXNlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3NvdXJjZScpKTtcbiAgICBzcmNFbHMuZm9yRWFjaCgoc3JjRWwpID0+IHJlbW92ZUVsZW1lbnQoc3JjRWwpKTtcblxuICAgIGNvbnN0IHRyYWNrRWxzID0gdG9BcnJheShlbGVtZW50VG9Vc2UucXVlcnlTZWxlY3RvckFsbCgndHJhY2snKSk7XG4gICAgdHJhY2tFbHMuZm9yRWFjaCgodHJhY2tFbCkgPT4gcmVtb3ZlRWxlbWVudCh0cmFja0VsKSk7XG5cbiAgICAvLyBJZiB0aGUgc3JjIGF0dHJpYnV0ZSBpcyBwcmVzZW50LCBicm93c2VycyB3aWxsIGZvbGxvdyBpdCBhbmQgaWdub3JlIHRoZVxuICAgIC8vIEhUTUxTb3VyY2VFbGVtZW50cy4gVG8gZW5zdXJlIHRoaXMgYmVoYXZpb3IsIGRyb3AgdGhlIHNvdXJjZXMgaWYgdGhlIHNyY1xuICAgIC8vIHdhcyBzcGVjaWZpZWQuXG4gICAgLy8gY2Y6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2NvbmNlcHQtbWVkaWEtbG9hZC1hbGdvcml0aG1cbiAgICBjb25zdCBzb3VyY2VzVG9Vc2UgPSBzcmNFbCA/IFtzcmNFbF0gOiBzcmNFbHM7XG5cbiAgICByZXR1cm4gbmV3IFNvdXJjZXMobnVsbCAvKiogc3JjQXR0ciAqLywgc291cmNlc1RvVXNlLCB0cmFja0Vscyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEhUTUxTb3VyY2VFbGVtZW50IGZyb20gdGhlIGVsZW1lbnQgc3JjIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVTb3VyY2VFbGVtZW50KHdpbiwgZWxlbWVudCkge1xuICAgIGNvbnN0IHNyY0VsID0gd2luLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuXG4gICAgY29uc3Qgc3JjQXR0ciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICBzcmNFbC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHNyY0F0dHIpO1xuXG4gICAgY29uc3Qgb3JpZ1NyY0F0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnYW1wLW9yaWctc3JjJyk7XG4gICAgaWYgKG9yaWdTcmNBdHRyKSB7XG4gICAgICBzcmNFbC5zZXRBdHRyaWJ1dGUoJ2FtcC1vcmlnLXNyYycsIG9yaWdTcmNBdHRyKTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlQXR0ciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG4gICAgaWYgKHR5cGVBdHRyKSB7XG4gICAgICBzcmNFbC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCB0eXBlQXR0cik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNyY0VsO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/sources.js