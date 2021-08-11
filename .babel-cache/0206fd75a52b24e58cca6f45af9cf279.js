function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import * as ampToolboxCacheUrl from '@ampproject/toolbox-cache-url';
import { urls } from "../../../src/config";
export var AmpCacheUrlService = /*#__PURE__*/function () {
  /**
   * Create cache url service
   */
  function AmpCacheUrlService() {
    _classCallCheck(this, AmpCacheUrlService);
  }

  /**
   *
   * @param {string} url
   * @param {string=} cacheDomain the cache domain name (eg: cdn.approject.org)
   * @return {!Promise<string>}
   */
  _createClass(AmpCacheUrlService, [{
    key: "createCacheUrl",
    value: function createCacheUrl(url, cacheDomain) {
      if (cacheDomain === void 0) {
        cacheDomain = urls.cdn;
      }

      return ampToolboxCacheUrl.createCacheUrl(cacheDomain.replace(/https?:\/\//, ''), url);
    }
  }]);

  return AmpCacheUrlService;
}();
AMP.extension('amp-cache-url', '0.1', function (AMP) {
  AMP.registerServiceForDoc('cache-url', AmpCacheUrlService);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1jYWNoZS11cmwuanMiXSwibmFtZXMiOlsiYW1wVG9vbGJveENhY2hlVXJsIiwidXJscyIsIkFtcENhY2hlVXJsU2VydmljZSIsInVybCIsImNhY2hlRG9tYWluIiwiY2RuIiwiY3JlYXRlQ2FjaGVVcmwiLCJyZXBsYWNlIiwiQU1QIiwiZXh0ZW5zaW9uIiwicmVnaXN0ZXJTZXJ2aWNlRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxPQUFPLEtBQUtBLGtCQUFaLE1BQW9DLCtCQUFwQztBQUNBLFNBQVFDLElBQVI7QUFFQSxXQUFhQyxrQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLGdDQUFjO0FBQUE7QUFBRTs7QUFFaEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWEE7QUFBQTtBQUFBLFdBWUUsd0JBQWVDLEdBQWYsRUFBb0JDLFdBQXBCLEVBQTRDO0FBQUEsVUFBeEJBLFdBQXdCO0FBQXhCQSxRQUFBQSxXQUF3QixHQUFWSCxJQUFJLENBQUNJLEdBQUs7QUFBQTs7QUFDMUMsYUFBT0wsa0JBQWtCLENBQUNNLGNBQW5CLENBQ0xGLFdBQVcsQ0FBQ0csT0FBWixDQUFvQixhQUFwQixFQUFtQyxFQUFuQyxDQURLLEVBRUxKLEdBRkssQ0FBUDtBQUlEO0FBakJIOztBQUFBO0FBQUE7QUFvQkFLLEdBQUcsQ0FBQ0MsU0FBSixDQUFjLGVBQWQsRUFBK0IsS0FBL0IsRUFBc0MsVUFBQ0QsR0FBRCxFQUFTO0FBQzdDQSxFQUFBQSxHQUFHLENBQUNFLHFCQUFKLENBQTBCLFdBQTFCLEVBQXVDUixrQkFBdkM7QUFDRCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCAqIGFzIGFtcFRvb2xib3hDYWNoZVVybCBmcm9tICdAYW1wcHJvamVjdC90b29sYm94LWNhY2hlLXVybCc7XG5pbXBvcnQge3VybHN9IGZyb20gJy4uLy4uLy4uL3NyYy9jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgQW1wQ2FjaGVVcmxTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBjYWNoZSB1cmwgc2VydmljZVxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gY2FjaGVEb21haW4gdGhlIGNhY2hlIGRvbWFpbiBuYW1lIChlZzogY2RuLmFwcHJvamVjdC5vcmcpXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBjcmVhdGVDYWNoZVVybCh1cmwsIGNhY2hlRG9tYWluID0gdXJscy5jZG4pIHtcbiAgICByZXR1cm4gYW1wVG9vbGJveENhY2hlVXJsLmNyZWF0ZUNhY2hlVXJsKFxuICAgICAgY2FjaGVEb21haW4ucmVwbGFjZSgvaHR0cHM/OlxcL1xcLy8sICcnKSxcbiAgICAgIHVybFxuICAgICk7XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbignYW1wLWNhY2hlLXVybCcsICcwLjEnLCAoQU1QKSA9PiB7XG4gIEFNUC5yZWdpc3RlclNlcnZpY2VGb3JEb2MoJ2NhY2hlLXVybCcsIEFtcENhY2hlVXJsU2VydmljZSk7XG59KTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-cache-url/0.1/amp-cache-url.js