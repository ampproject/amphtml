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

/**
 * An interface to interact with browser window object.
 * Mainly used to mock out read only APIs in test.
 * See test-helper.js#mockWindowInterface
 */
export var WindowInterface = /*#__PURE__*/function () {
  function WindowInterface() {
    _classCallCheck(this, WindowInterface);
  }

  _createClass(WindowInterface, null, [{
    key: "getTop",
    value:
    /**
     * @static
     * @param {!Window} win
     * @return {!Window}
     */
    function getTop(win) {
      return win.top;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {!Location}
     */

  }, {
    key: "getLocation",
    value: function getLocation(win) {
      return win.location;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */

  }, {
    key: "getDocumentReferrer",
    value: function getDocumentReferrer(win) {
      return win.document.referrer;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */

  }, {
    key: "getHostname",
    value: function getHostname(win) {
      return win.location.hostname;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */

  }, {
    key: "getUserAgent",
    value: function getUserAgent(win) {
      return win.navigator.userAgent;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */

  }, {
    key: "getUserLanguage",
    value: function getUserLanguage(win) {
      // The `navigator.userLanguage` is only supported by IE. The standard is
      // the `navigator.language`.
      return win.navigator['userLanguage'] || win.navigator.language;
    }
    /**
     * @static
     * @return {number}
     */

  }, {
    key: "getDevicePixelRatio",
    value: function getDevicePixelRatio() {
      // No matter the window, the device-pixel-ratio is always one.
      return self.devicePixelRatio || 1;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {function(string,(ArrayBufferView|Blob|FormData|null|string)=):boolean|undefined}
     */

  }, {
    key: "getSendBeacon",
    value: function getSendBeacon(win) {
      if (!win.navigator.sendBeacon) {
        return undefined;
      }

      return win.navigator.sendBeacon.bind(win.navigator);
    }
    /**
     * @static
     * @param {!Window} win
     * @return {typeof XMLHttpRequest}
     */

  }, {
    key: "getXMLHttpRequest",
    value: function getXMLHttpRequest(win) {
      return win.XMLHttpRequest;
    }
    /**
     * @static
     * @param {!Window} win
     * @return {typeof Image}
     */

  }, {
    key: "getImage",
    value: function getImage(win) {
      return win.Image;
    }
  }]);

  return WindowInterface;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImludGVyZmFjZS5qcyJdLCJuYW1lcyI6WyJXaW5kb3dJbnRlcmZhY2UiLCJ3aW4iLCJ0b3AiLCJsb2NhdGlvbiIsImRvY3VtZW50IiwicmVmZXJyZXIiLCJob3N0bmFtZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhbmd1YWdlIiwic2VsZiIsImRldmljZVBpeGVsUmF0aW8iLCJzZW5kQmVhY29uIiwidW5kZWZpbmVkIiwiYmluZCIsIlhNTEh0dHBSZXF1ZXN0IiwiSW1hZ2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUEsZUFBYjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0Usb0JBQWNDLEdBQWQsRUFBbUI7QUFDakIsYUFBT0EsR0FBRyxDQUFDQyxHQUFYO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQWRBO0FBQUE7QUFBQSxXQWVFLHFCQUFtQkQsR0FBbkIsRUFBd0I7QUFDdEIsYUFBT0EsR0FBRyxDQUFDRSxRQUFYO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXZCQTtBQUFBO0FBQUEsV0F3QkUsNkJBQTJCRixHQUEzQixFQUFnQztBQUM5QixhQUFPQSxHQUFHLENBQUNHLFFBQUosQ0FBYUMsUUFBcEI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBaENBO0FBQUE7QUFBQSxXQWlDRSxxQkFBbUJKLEdBQW5CLEVBQXdCO0FBQ3RCLGFBQU9BLEdBQUcsQ0FBQ0UsUUFBSixDQUFhRyxRQUFwQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUF6Q0E7QUFBQTtBQUFBLFdBMENFLHNCQUFvQkwsR0FBcEIsRUFBeUI7QUFDdkIsYUFBT0EsR0FBRyxDQUFDTSxTQUFKLENBQWNDLFNBQXJCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQWxEQTtBQUFBO0FBQUEsV0FtREUseUJBQXVCUCxHQUF2QixFQUE0QjtBQUMxQjtBQUNBO0FBQ0EsYUFBT0EsR0FBRyxDQUFDTSxTQUFKLENBQWMsY0FBZCxLQUFpQ04sR0FBRyxDQUFDTSxTQUFKLENBQWNFLFFBQXREO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE1REE7QUFBQTtBQUFBLFdBNkRFLCtCQUE2QjtBQUMzQjtBQUNBLGFBQU9DLElBQUksQ0FBQ0MsZ0JBQUwsSUFBeUIsQ0FBaEM7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBdEVBO0FBQUE7QUFBQSxXQXVFRSx1QkFBcUJWLEdBQXJCLEVBQTBCO0FBQ3hCLFVBQUksQ0FBQ0EsR0FBRyxDQUFDTSxTQUFKLENBQWNLLFVBQW5CLEVBQStCO0FBQzdCLGVBQU9DLFNBQVA7QUFDRDs7QUFDRCxhQUFPWixHQUFHLENBQUNNLFNBQUosQ0FBY0ssVUFBZCxDQUF5QkUsSUFBekIsQ0FBOEJiLEdBQUcsQ0FBQ00sU0FBbEMsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFsRkE7QUFBQTtBQUFBLFdBbUZFLDJCQUF5Qk4sR0FBekIsRUFBOEI7QUFDNUIsYUFBT0EsR0FBRyxDQUFDYyxjQUFYO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTNGQTtBQUFBO0FBQUEsV0E0RkUsa0JBQWdCZCxHQUFoQixFQUFxQjtBQUNuQixhQUFPQSxHQUFHLENBQUNlLEtBQVg7QUFDRDtBQTlGSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHRvIGludGVyYWN0IHdpdGggYnJvd3NlciB3aW5kb3cgb2JqZWN0LlxuICogTWFpbmx5IHVzZWQgdG8gbW9jayBvdXQgcmVhZCBvbmx5IEFQSXMgaW4gdGVzdC5cbiAqIFNlZSB0ZXN0LWhlbHBlci5qcyNtb2NrV2luZG93SW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBXaW5kb3dJbnRlcmZhY2Uge1xuICAvKipcbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHshV2luZG93fVxuICAgKi9cbiAgc3RhdGljIGdldFRvcCh3aW4pIHtcbiAgICByZXR1cm4gd2luLnRvcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4geyFMb2NhdGlvbn1cbiAgICovXG4gIHN0YXRpYyBnZXRMb2NhdGlvbih3aW4pIHtcbiAgICByZXR1cm4gd2luLmxvY2F0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGdldERvY3VtZW50UmVmZXJyZXIod2luKSB7XG4gICAgcmV0dXJuIHdpbi5kb2N1bWVudC5yZWZlcnJlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBnZXRIb3N0bmFtZSh3aW4pIHtcbiAgICByZXR1cm4gd2luLmxvY2F0aW9uLmhvc3RuYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGdldFVzZXJBZ2VudCh3aW4pIHtcbiAgICByZXR1cm4gd2luLm5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBzdGF0aWMgZ2V0VXNlckxhbmd1YWdlKHdpbikge1xuICAgIC8vIFRoZSBgbmF2aWdhdG9yLnVzZXJMYW5ndWFnZWAgaXMgb25seSBzdXBwb3J0ZWQgYnkgSUUuIFRoZSBzdGFuZGFyZCBpc1xuICAgIC8vIHRoZSBgbmF2aWdhdG9yLmxhbmd1YWdlYC5cbiAgICByZXR1cm4gd2luLm5hdmlnYXRvclsndXNlckxhbmd1YWdlJ10gfHwgd2luLm5hdmlnYXRvci5sYW5ndWFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3RhdGljXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIHN0YXRpYyBnZXREZXZpY2VQaXhlbFJhdGlvKCkge1xuICAgIC8vIE5vIG1hdHRlciB0aGUgd2luZG93LCB0aGUgZGV2aWNlLXBpeGVsLXJhdGlvIGlzIGFsd2F5cyBvbmUuXG4gICAgcmV0dXJuIHNlbGYuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdGF0aWNcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHJldHVybiB7ZnVuY3Rpb24oc3RyaW5nLChBcnJheUJ1ZmZlclZpZXd8QmxvYnxGb3JtRGF0YXxudWxsfHN0cmluZyk9KTpib29sZWFufHVuZGVmaW5lZH1cbiAgICovXG4gIHN0YXRpYyBnZXRTZW5kQmVhY29uKHdpbikge1xuICAgIGlmICghd2luLm5hdmlnYXRvci5zZW5kQmVhY29uKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gd2luLm5hdmlnYXRvci5zZW5kQmVhY29uLmJpbmQod2luLm5hdmlnYXRvcik7XG4gIH1cblxuICAvKipcbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcmV0dXJuIHt0eXBlb2YgWE1MSHR0cFJlcXVlc3R9XG4gICAqL1xuICBzdGF0aWMgZ2V0WE1MSHR0cFJlcXVlc3Qod2luKSB7XG4gICAgcmV0dXJuIHdpbi5YTUxIdHRwUmVxdWVzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gICAqIEByZXR1cm4ge3R5cGVvZiBJbWFnZX1cbiAgICovXG4gIHN0YXRpYyBnZXRJbWFnZSh3aW4pIHtcbiAgICByZXR1cm4gd2luLkltYWdlO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/window/interface.js