var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

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
import { removeElement } from "../core/dom";
import { createViewportObserver } from "../core/dom/layout/viewport-observer";
import { htmlFor } from "../core/dom/static-template";
import { createLoaderElement } from "./loader-element";
import { registerServiceBuilderForDoc } from "../service-helpers";
var MIN_SIZE = 20;

/**
 * @typedef {{
 *   shown: boolean,
 *   loader: !Element,
 *   container: !Element,
 * }}
 */
var LoadingIndicatorStateDef;

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installLoadingIndicatorForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'loadingIndicator', LoadingIndicatorImpl);
}

/**
 * @implements {../service.Disposable}
 */
export var LoadingIndicatorImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function LoadingIndicatorImpl(ampdoc) {
    _classCallCheck(this, LoadingIndicatorImpl);

    /** @private @const */
    this.ampdoc_ = ampdoc;
    var win = ampdoc.win;
    var inViewport = this.inViewport_.bind(this);

    var ioCallback = function ioCallback(records) {
      return (
        /** @type {!Array<!IntersectionObserverEntry>} */
        records.forEach(inViewport)
      );
    };

    /** @private @const {!IntersectionObserver} */
    this.io_ = createViewportObserver(ioCallback, win);

    /** @private @const {!WeakMap<!AmpElement, !LoadingIndicatorStateDef>} */
    this.states_ = new WeakMap();
  }

  /** @override */
  _createClass(LoadingIndicatorImpl, [{
    key: "dispose",
    value: function dispose() {
      this.io_.disconnect();
    }
    /**
     * @param {!AmpElement} element
     */

  }, {
    key: "track",
    value: function track(element) {
      this.io_.observe(element);
    }
    /**
     * @param {!AmpElement} element
     */

  }, {
    key: "untrack",
    value: function untrack(element) {
      this.io_.unobserve(element);
      this.cleanup_(element);
    }
    /**
     * @param {!IntersectionObserverEntry} record
     * @private
     */

  }, {
    key: "inViewport_",
    value: function inViewport_(record) {
      var boundingClientRect = record.boundingClientRect,
          isIntersecting = record.isIntersecting,
          target = record.target;
      var height = boundingClientRect.height,
          width = boundingClientRect.width;
      var element =
      /** @type {!AmpElement} */
      target;
      var show = isIntersecting && width > MIN_SIZE && height > MIN_SIZE;
      var state = this.states_.get(element);
      var isCurrentlyShown = state && state.shown || false;

      if (show === isCurrentlyShown) {
        // Loading state is the same.
        return;
      }

      if (show && !state) {
        state = this.createLoaderState_(element, width, height);
        this.states_.set(element, state);
      }

      if (state) {
        state.shown = show;
        state.container.classList.toggle('amp-hidden', !show);
        state.loader.classList.toggle('amp-active', show);
      }
    }
    /**
     * @param {!AmpElement} element
     * @param {number} width
     * @param {number} height
     * @return {!LoadingIndicatorStateDef}
     * @private
     */

  }, {
    key: "createLoaderState_",
    value: function createLoaderState_(element, width, height) {
      var startTime = Date.now();
      var loader = createLoaderElement(this.ampdoc_, element, width, height, startTime);
      var container = htmlFor(this.ampdoc_.win.document)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n        <div slot=\"i-amphtml-svc\" class=\"i-amphtml-svc i-amphtml-loading-container i-amphtml-fill-content\n            amp-hidden\"></div>\n      "])));
      container.appendChild(loader);
      element.appendChild(container);
      return (
        /** @type {!LoadingIndicatorStateDef} */
        {
          shown: false,
          loader: loader,
          container: container
        }
      );
    }
    /**
     * @param {!AmpElement} element
     * @private
     */

  }, {
    key: "cleanup_",
    value: function cleanup_(element) {
      var state = this.states_.get(element);

      if (!state) {
        return;
      }

      this.states_.delete(element);
      removeElement(state.container);
    }
  }]);

  return LoadingIndicatorImpl;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRpbmctaW5kaWNhdG9yLmpzIl0sIm5hbWVzIjpbInJlbW92ZUVsZW1lbnQiLCJjcmVhdGVWaWV3cG9ydE9ic2VydmVyIiwiaHRtbEZvciIsImNyZWF0ZUxvYWRlckVsZW1lbnQiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiTUlOX1NJWkUiLCJMb2FkaW5nSW5kaWNhdG9yU3RhdGVEZWYiLCJpbnN0YWxsTG9hZGluZ0luZGljYXRvckZvckRvYyIsIm5vZGVPckRvYyIsIkxvYWRpbmdJbmRpY2F0b3JJbXBsIiwiYW1wZG9jIiwiYW1wZG9jXyIsIndpbiIsImluVmlld3BvcnQiLCJpblZpZXdwb3J0XyIsImJpbmQiLCJpb0NhbGxiYWNrIiwicmVjb3JkcyIsImZvckVhY2giLCJpb18iLCJzdGF0ZXNfIiwiV2Vha01hcCIsImRpc2Nvbm5lY3QiLCJlbGVtZW50Iiwib2JzZXJ2ZSIsInVub2JzZXJ2ZSIsImNsZWFudXBfIiwicmVjb3JkIiwiYm91bmRpbmdDbGllbnRSZWN0IiwiaXNJbnRlcnNlY3RpbmciLCJ0YXJnZXQiLCJoZWlnaHQiLCJ3aWR0aCIsInNob3ciLCJzdGF0ZSIsImdldCIsImlzQ3VycmVudGx5U2hvd24iLCJzaG93biIsImNyZWF0ZUxvYWRlclN0YXRlXyIsInNldCIsImNvbnRhaW5lciIsImNsYXNzTGlzdCIsInRvZ2dsZSIsImxvYWRlciIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJkb2N1bWVudCIsImFwcGVuZENoaWxkIiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsYUFBUjtBQUNBLFNBQVFDLHNCQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUVBLFNBQVFDLG1CQUFSO0FBRUEsU0FBUUMsNEJBQVI7QUFFQSxJQUFNQyxRQUFRLEdBQUcsRUFBakI7O0FB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ZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3JlbW92ZUVsZW1lbnR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2NyZWF0ZVZpZXdwb3J0T2JzZXJ2ZXJ9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvdmlld3BvcnQtb2JzZXJ2ZXInO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcblxuaW1wb3J0IHtjcmVhdGVMb2FkZXJFbGVtZW50fSBmcm9tICcuL2xvYWRlci1lbGVtZW50JztcblxuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuXG5jb25zdCBNSU5fU0laRSA9IDIwO1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHNob3duOiBib29sZWFuLFxuICogICBsb2FkZXI6ICFFbGVtZW50LFxuICogICBjb250YWluZXI6ICFFbGVtZW50LFxuICogfX1cbiAqL1xubGV0IExvYWRpbmdJbmRpY2F0b3JTdGF0ZURlZjtcblxuLyoqXG4gKiBAcGFyYW0geyFOb2RlfCEuL2FtcGRvYy1pbXBsLkFtcERvY30gbm9kZU9yRG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsTG9hZGluZ0luZGljYXRvckZvckRvYyhub2RlT3JEb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBub2RlT3JEb2MsXG4gICAgJ2xvYWRpbmdJbmRpY2F0b3InLFxuICAgIExvYWRpbmdJbmRpY2F0b3JJbXBsXG4gICk7XG59XG5cbi8qKlxuICogQGltcGxlbWVudHMgey4uL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIExvYWRpbmdJbmRpY2F0b3JJbXBsIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICBjb25zdCB7d2lufSA9IGFtcGRvYztcbiAgICBjb25zdCBpblZpZXdwb3J0ID0gdGhpcy5pblZpZXdwb3J0Xy5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IGlvQ2FsbGJhY2sgPSAocmVjb3JkcykgPT5cbiAgICAgIC8qKiBAdHlwZSB7IUFycmF5PCFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5Pn0gKi8gKHJlY29yZHMpLmZvckVhY2goXG4gICAgICAgIGluVmlld3BvcnRcbiAgICAgICk7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUludGVyc2VjdGlvbk9ic2VydmVyfSAqL1xuICAgIHRoaXMuaW9fID0gY3JlYXRlVmlld3BvcnRPYnNlcnZlcihpb0NhbGxiYWNrLCB3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IVdlYWtNYXA8IUFtcEVsZW1lbnQsICFMb2FkaW5nSW5kaWNhdG9yU3RhdGVEZWY+fSAqL1xuICAgIHRoaXMuc3RhdGVzXyA9IG5ldyBXZWFrTWFwKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5pb18uZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIHRyYWNrKGVsZW1lbnQpIHtcbiAgICB0aGlzLmlvXy5vYnNlcnZlKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIHVudHJhY2soZWxlbWVudCkge1xuICAgIHRoaXMuaW9fLnVub2JzZXJ2ZShlbGVtZW50KTtcbiAgICB0aGlzLmNsZWFudXBfKGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnl9IHJlY29yZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5WaWV3cG9ydF8ocmVjb3JkKSB7XG4gICAgY29uc3Qge2JvdW5kaW5nQ2xpZW50UmVjdCwgaXNJbnRlcnNlY3RpbmcsIHRhcmdldH0gPSByZWNvcmQ7XG4gICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gYm91bmRpbmdDbGllbnRSZWN0O1xuICAgIGNvbnN0IGVsZW1lbnQgPSAvKiogQHR5cGUgeyFBbXBFbGVtZW50fSAqLyAodGFyZ2V0KTtcblxuICAgIGNvbnN0IHNob3cgPSBpc0ludGVyc2VjdGluZyAmJiB3aWR0aCA+IE1JTl9TSVpFICYmIGhlaWdodCA+IE1JTl9TSVpFO1xuXG4gICAgbGV0IHN0YXRlID0gdGhpcy5zdGF0ZXNfLmdldChlbGVtZW50KTtcbiAgICBjb25zdCBpc0N1cnJlbnRseVNob3duID0gKHN0YXRlICYmIHN0YXRlLnNob3duKSB8fCBmYWxzZTtcbiAgICBpZiAoc2hvdyA9PT0gaXNDdXJyZW50bHlTaG93bikge1xuICAgICAgLy8gTG9hZGluZyBzdGF0ZSBpcyB0aGUgc2FtZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2hvdyAmJiAhc3RhdGUpIHtcbiAgICAgIHN0YXRlID0gdGhpcy5jcmVhdGVMb2FkZXJTdGF0ZV8oZWxlbWVudCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICB0aGlzLnN0YXRlc18uc2V0KGVsZW1lbnQsIHN0YXRlKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBzdGF0ZS5zaG93biA9IHNob3c7XG4gICAgICBzdGF0ZS5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZSgnYW1wLWhpZGRlbicsICFzaG93KTtcbiAgICAgIHN0YXRlLmxvYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdhbXAtYWN0aXZlJywgc2hvdyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHJldHVybiB7IUxvYWRpbmdJbmRpY2F0b3JTdGF0ZURlZn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNyZWF0ZUxvYWRlclN0YXRlXyhlbGVtZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGNvbnN0IGxvYWRlciA9IGNyZWF0ZUxvYWRlckVsZW1lbnQoXG4gICAgICB0aGlzLmFtcGRvY18sXG4gICAgICBlbGVtZW50LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBzdGFydFRpbWVcbiAgICApO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gaHRtbEZvcih0aGlzLmFtcGRvY18ud2luLmRvY3VtZW50KWBcbiAgICAgICAgPGRpdiBzbG90PVwiaS1hbXBodG1sLXN2Y1wiIGNsYXNzPVwiaS1hbXBodG1sLXN2YyBpLWFtcGh0bWwtbG9hZGluZy1jb250YWluZXIgaS1hbXBodG1sLWZpbGwtY29udGVudFxuICAgICAgICAgICAgYW1wLWhpZGRlblwiPjwvZGl2PlxuICAgICAgYDtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobG9hZGVyKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICByZXR1cm4gLyoqIEB0eXBlIHshTG9hZGluZ0luZGljYXRvclN0YXRlRGVmfSAqLyAoe1xuICAgICAgc2hvd246IGZhbHNlLFxuICAgICAgbG9hZGVyLFxuICAgICAgY29udGFpbmVyLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNsZWFudXBfKGVsZW1lbnQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RhdGVzXy5nZXQoZWxlbWVudCk7XG4gICAgaWYgKCFzdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGVzXy5kZWxldGUoZWxlbWVudCk7XG4gICAgcmVtb3ZlRWxlbWVudChzdGF0ZS5jb250YWluZXIpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/loading-indicator.js