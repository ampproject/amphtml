function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { Services } from "../../../src/service";
import { dev } from "../../../src/log";
import { registerServiceBuilder } from "../../../src/service-helpers";

/**
 * Util function to retrieve the media query service. Ensures we can retrieve
 * the service synchronously from the amp-story codebase without running into
 * race conditions.
 * @param  {!Window} win
 * @return {!AmpStoryMediaQueryService}
 */
export var getMediaQueryService = function getMediaQueryService(win) {
  var service = Services.storyMediaQueryService(win);

  if (!service) {
    service = new AmpStoryMediaQueryService(win);
    registerServiceBuilder(win, 'story-media-query', function () {
      return service;
    });
  }

  return service;
};

/**
 * Media query service.
 */
export var AmpStoryMediaQueryService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function AmpStoryMediaQueryService(win) {
    _classCallCheck(this, AmpStoryMediaQueryService);

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Promise} */
    this.initializePromise_ = null;

    /** @private {?Element} Iframe matcher. */
    this.matcher_ = null;

    /** @private @const {!Element} */
    this.storyEl_ = dev().assertElement(this.win_.document.querySelector('amp-story'));
  }

  /**
   * Registers the media query and triggering the provided callback on match.
   * @param {string} media The media query, ie: '(orientation: portrait)'
   * @param {function(boolean)} callback Called when the media query matches.
   * @return {!Promise<!MediaQueryList>}
   */
  _createClass(AmpStoryMediaQueryService, [{
    key: "onMediaQueryMatch",
    value: function onMediaQueryMatch(media, callback) {
      var _this = this;

      return this.initialize_().then(function () {
        var mediaQueryList = _this.matcher_.contentWindow.matchMedia(media);

        mediaQueryList.addListener(function (event) {
          return callback(event.matches);
        });
        callback(mediaQueryList.matches);
        return mediaQueryList;
      });
    }
    /**
     * Creates an iframe that is positioned like an amp-story-page, used to match
     * media queries.
     * @return {!Promise} Resolves when the iframe is ready.
     * @private
     */

  }, {
    key: "initialize_",
    value: function initialize_() {
      var _this2 = this;

      if (this.initializePromise_) {
        return this.initializePromise_;
      }

      this.initializePromise_ = new Promise(function (resolve) {
        _this2.matcher_ = _this2.win_.document.createElement('iframe');

        _this2.matcher_.classList.add('i-amphtml-story-media-query-matcher');

        _this2.matcher_.onload = resolve;

        _this2.storyEl_.appendChild(_this2.matcher_);
      });
      return this.initializePromise_;
    }
  }]);

  return AmpStoryMediaQueryService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1tZWRpYS1xdWVyeS1zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbIlNlcnZpY2VzIiwiZGV2IiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsImdldE1lZGlhUXVlcnlTZXJ2aWNlIiwid2luIiwic2VydmljZSIsInN0b3J5TWVkaWFRdWVyeVNlcnZpY2UiLCJBbXBTdG9yeU1lZGlhUXVlcnlTZXJ2aWNlIiwid2luXyIsImluaXRpYWxpemVQcm9taXNlXyIsIm1hdGNoZXJfIiwic3RvcnlFbF8iLCJhc3NlcnRFbGVtZW50IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwibWVkaWEiLCJjYWxsYmFjayIsImluaXRpYWxpemVfIiwidGhlbiIsIm1lZGlhUXVlcnlMaXN0IiwiY29udGVudFdpbmRvdyIsIm1hdGNoTWVkaWEiLCJhZGRMaXN0ZW5lciIsImV2ZW50IiwibWF0Y2hlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsIm9ubG9hZCIsImFwcGVuZENoaWxkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsR0FBUjtBQUNBLFNBQVFDLHNCQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxvQkFBb0IsR0FBRyxTQUF2QkEsb0JBQXVCLENBQUNDLEdBQUQsRUFBUztBQUMzQyxNQUFJQyxPQUFPLEdBQUdMLFFBQVEsQ0FBQ00sc0JBQVQsQ0FBZ0NGLEdBQWhDLENBQWQ7O0FBRUEsTUFBSSxDQUFDQyxPQUFMLEVBQWM7QUFDWkEsSUFBQUEsT0FBTyxHQUFHLElBQUlFLHlCQUFKLENBQThCSCxHQUE5QixDQUFWO0FBQ0FGLElBQUFBLHNCQUFzQixDQUFDRSxHQUFELEVBQU0sbUJBQU4sRUFBMkIsWUFBWTtBQUMzRCxhQUFPQyxPQUFQO0FBQ0QsS0FGcUIsQ0FBdEI7QUFHRDs7QUFFRCxTQUFPQSxPQUFQO0FBQ0QsQ0FYTTs7QUFhUDtBQUNBO0FBQ0E7QUFDQSxXQUFhRSx5QkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHFDQUFZSCxHQUFaLEVBQWlCO0FBQUE7O0FBQ2Y7QUFDQSxTQUFLSSxJQUFMLEdBQVlKLEdBQVo7O0FBRUE7QUFDQSxTQUFLSyxrQkFBTCxHQUEwQixJQUExQjs7QUFFQTtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsSUFBaEI7O0FBRUE7QUFDQSxTQUFLQyxRQUFMLEdBQWdCVixHQUFHLEdBQUdXLGFBQU4sQ0FDZCxLQUFLSixJQUFMLENBQVVLLFFBQVYsQ0FBbUJDLGFBQW5CLENBQWlDLFdBQWpDLENBRGMsQ0FBaEI7QUFHRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF6QkE7QUFBQTtBQUFBLFdBMEJFLDJCQUFrQkMsS0FBbEIsRUFBeUJDLFFBQXpCLEVBQW1DO0FBQUE7O0FBQ2pDLGFBQU8sS0FBS0MsV0FBTCxHQUFtQkMsSUFBbkIsQ0FBd0IsWUFBTTtBQUNuQyxZQUFNQyxjQUFjLEdBQUcsS0FBSSxDQUFDVCxRQUFMLENBQWNVLGFBQWQsQ0FBNEJDLFVBQTVCLENBQXVDTixLQUF2QyxDQUF2Qjs7QUFDQUksUUFBQUEsY0FBYyxDQUFDRyxXQUFmLENBQTJCLFVBQUNDLEtBQUQ7QUFBQSxpQkFBV1AsUUFBUSxDQUFDTyxLQUFLLENBQUNDLE9BQVAsQ0FBbkI7QUFBQSxTQUEzQjtBQUNBUixRQUFBQSxRQUFRLENBQUNHLGNBQWMsQ0FBQ0ssT0FBaEIsQ0FBUjtBQUNBLGVBQU9MLGNBQVA7QUFDRCxPQUxNLENBQVA7QUFNRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4Q0E7QUFBQTtBQUFBLFdBeUNFLHVCQUFjO0FBQUE7O0FBQ1osVUFBSSxLQUFLVixrQkFBVCxFQUE2QjtBQUMzQixlQUFPLEtBQUtBLGtCQUFaO0FBQ0Q7O0FBRUQsV0FBS0Esa0JBQUwsR0FBMEIsSUFBSWdCLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQWE7QUFDakQsUUFBQSxNQUFJLENBQUNoQixRQUFMLEdBQWdCLE1BQUksQ0FBQ0YsSUFBTCxDQUFVSyxRQUFWLENBQW1CYyxhQUFuQixDQUFpQyxRQUFqQyxDQUFoQjs7QUFDQSxRQUFBLE1BQUksQ0FBQ2pCLFFBQUwsQ0FBY2tCLFNBQWQsQ0FBd0JDLEdBQXhCLENBQTRCLHFDQUE1Qjs7QUFDQSxRQUFBLE1BQUksQ0FBQ25CLFFBQUwsQ0FBY29CLE1BQWQsR0FBdUJKLE9BQXZCOztBQUNBLFFBQUEsTUFBSSxDQUFDZixRQUFMLENBQWNvQixXQUFkLENBQTBCLE1BQUksQ0FBQ3JCLFFBQS9CO0FBQ0QsT0FMeUIsQ0FBMUI7QUFPQSxhQUFPLEtBQUtELGtCQUFaO0FBQ0Q7QUF0REg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKipcbiAqIFV0aWwgZnVuY3Rpb24gdG8gcmV0cmlldmUgdGhlIG1lZGlhIHF1ZXJ5IHNlcnZpY2UuIEVuc3VyZXMgd2UgY2FuIHJldHJpZXZlXG4gKiB0aGUgc2VydmljZSBzeW5jaHJvbm91c2x5IGZyb20gdGhlIGFtcC1zdG9yeSBjb2RlYmFzZSB3aXRob3V0IHJ1bm5pbmcgaW50b1xuICogcmFjZSBjb25kaXRpb25zLlxuICogQHBhcmFtICB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHshQW1wU3RvcnlNZWRpYVF1ZXJ5U2VydmljZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1lZGlhUXVlcnlTZXJ2aWNlID0gKHdpbikgPT4ge1xuICBsZXQgc2VydmljZSA9IFNlcnZpY2VzLnN0b3J5TWVkaWFRdWVyeVNlcnZpY2Uod2luKTtcblxuICBpZiAoIXNlcnZpY2UpIHtcbiAgICBzZXJ2aWNlID0gbmV3IEFtcFN0b3J5TWVkaWFRdWVyeVNlcnZpY2Uod2luKTtcbiAgICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbiwgJ3N0b3J5LW1lZGlhLXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNlcnZpY2U7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gc2VydmljZTtcbn07XG5cbi8qKlxuICogTWVkaWEgcXVlcnkgc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5TWVkaWFRdWVyeVNlcnZpY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLmluaXRpYWxpemVQcm9taXNlXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9FbGVtZW50fSBJZnJhbWUgbWF0Y2hlci4gKi9cbiAgICB0aGlzLm1hdGNoZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuc3RvcnlFbF8gPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgdGhpcy53aW5fLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FtcC1zdG9yeScpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIG1lZGlhIHF1ZXJ5IGFuZCB0cmlnZ2VyaW5nIHRoZSBwcm92aWRlZCBjYWxsYmFjayBvbiBtYXRjaC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lZGlhIFRoZSBtZWRpYSBxdWVyeSwgaWU6ICcob3JpZW50YXRpb246IHBvcnRyYWl0KSdcbiAgICogQHBhcmFtIHtmdW5jdGlvbihib29sZWFuKX0gY2FsbGJhY2sgQ2FsbGVkIHdoZW4gdGhlIG1lZGlhIHF1ZXJ5IG1hdGNoZXMuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFNZWRpYVF1ZXJ5TGlzdD59XG4gICAqL1xuICBvbk1lZGlhUXVlcnlNYXRjaChtZWRpYSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplXygpLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgbWVkaWFRdWVyeUxpc3QgPSB0aGlzLm1hdGNoZXJfLmNvbnRlbnRXaW5kb3cubWF0Y2hNZWRpYShtZWRpYSk7XG4gICAgICBtZWRpYVF1ZXJ5TGlzdC5hZGRMaXN0ZW5lcigoZXZlbnQpID0+IGNhbGxiYWNrKGV2ZW50Lm1hdGNoZXMpKTtcbiAgICAgIGNhbGxiYWNrKG1lZGlhUXVlcnlMaXN0Lm1hdGNoZXMpO1xuICAgICAgcmV0dXJuIG1lZGlhUXVlcnlMaXN0O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaWZyYW1lIHRoYXQgaXMgcG9zaXRpb25lZCBsaWtlIGFuIGFtcC1zdG9yeS1wYWdlLCB1c2VkIHRvIG1hdGNoXG4gICAqIG1lZGlhIHF1ZXJpZXMuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSBpZnJhbWUgaXMgcmVhZHkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplXygpIHtcbiAgICBpZiAodGhpcy5pbml0aWFsaXplUHJvbWlzZV8pIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemVQcm9taXNlXztcbiAgICB9XG5cbiAgICB0aGlzLmluaXRpYWxpemVQcm9taXNlXyA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLm1hdGNoZXJfID0gdGhpcy53aW5fLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgdGhpcy5tYXRjaGVyXy5jbGFzc0xpc3QuYWRkKCdpLWFtcGh0bWwtc3RvcnktbWVkaWEtcXVlcnktbWF0Y2hlcicpO1xuICAgICAgdGhpcy5tYXRjaGVyXy5vbmxvYWQgPSByZXNvbHZlO1xuICAgICAgdGhpcy5zdG9yeUVsXy5hcHBlbmRDaGlsZCh0aGlzLm1hdGNoZXJfKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmluaXRpYWxpemVQcm9taXNlXztcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-media-query-service.js