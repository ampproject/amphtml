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
import { dict } from "../core/types/object";
import { Services } from "./";
import { parseUrlDeprecated } from "../url";

/**
 * Exposes CID API if provided by the Viewer.
 */
export var ViewerCidApi = /*#__PURE__*/function () {
  /**
   * Creates an instance of ViewerCidApi.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewerCidApi(ampdoc) {
    _classCallCheck(this, ViewerCidApi);

    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc_),
        canonicalUrl = _Services$documentInf.canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ? parseUrlDeprecated(canonicalUrl).origin : null;
  }

  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @return {!Promise<boolean>}
   */
  _createClass(ViewerCidApi, [{
    key: "isSupported",
    value: function isSupported() {
      if (!this.viewer_.hasCapability('cid')) {
        return Promise.resolve(false);
      }

      return this.viewer_.isTrustedViewer();
    }
    /**
     * Returns scoped CID retrieved from the Viewer.
     * @param {string|undefined} apiKey
     * @param {string} scope
     * @return {!Promise<?JsonObject|string|undefined>}
     */

  }, {
    key: "getScopedCid",
    value: function getScopedCid(apiKey, scope) {
      var payload = dict({
        'scope': scope,
        'clientIdApi': !!apiKey,
        'canonicalOrigin': this.canonicalOrigin_
      });

      if (apiKey) {
        payload['apiKey'] = apiKey;
      }

      return this.viewer_.sendMessageAwaitResponse('cid', payload);
    }
  }]);

  return ViewerCidApi;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdlci1jaWQtYXBpLmpzIl0sIm5hbWVzIjpbImRpY3QiLCJTZXJ2aWNlcyIsInBhcnNlVXJsRGVwcmVjYXRlZCIsIlZpZXdlckNpZEFwaSIsImFtcGRvYyIsImFtcGRvY18iLCJ2aWV3ZXJfIiwidmlld2VyRm9yRG9jIiwiZG9jdW1lbnRJbmZvRm9yRG9jIiwiY2Fub25pY2FsVXJsIiwiY2Fub25pY2FsT3JpZ2luXyIsIm9yaWdpbiIsImhhc0NhcGFiaWxpdHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsImlzVHJ1c3RlZFZpZXdlciIsImFwaUtleSIsInNjb3BlIiwicGF5bG9hZCIsInNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsSUFBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxrQkFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxZQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDRSx3QkFBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNBLFNBQUtDLE9BQUwsR0FBZUQsTUFBZjs7QUFFQTtBQUNBLFNBQUtFLE9BQUwsR0FBZUwsUUFBUSxDQUFDTSxZQUFULENBQXNCLEtBQUtGLE9BQTNCLENBQWY7O0FBRUEsZ0NBQXVCSixRQUFRLENBQUNPLGtCQUFULENBQTRCLEtBQUtILE9BQWpDLENBQXZCO0FBQUEsUUFBT0ksWUFBUCx5QkFBT0EsWUFBUDs7QUFFQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCRCxZQUFZLEdBQ2hDUCxrQkFBa0IsQ0FBQ08sWUFBRCxDQUFsQixDQUFpQ0UsTUFERCxHQUVoQyxJQUZKO0FBR0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUF2QkE7QUFBQTtBQUFBLFdBd0JFLHVCQUFjO0FBQ1osVUFBSSxDQUFDLEtBQUtMLE9BQUwsQ0FBYU0sYUFBYixDQUEyQixLQUEzQixDQUFMLEVBQXdDO0FBQ3RDLGVBQU9DLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFLUixPQUFMLENBQWFTLGVBQWIsRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXBDQTtBQUFBO0FBQUEsV0FxQ0Usc0JBQWFDLE1BQWIsRUFBcUJDLEtBQXJCLEVBQTRCO0FBQzFCLFVBQU1DLE9BQU8sR0FBR2xCLElBQUksQ0FBQztBQUNuQixpQkFBU2lCLEtBRFU7QUFFbkIsdUJBQWUsQ0FBQyxDQUFDRCxNQUZFO0FBR25CLDJCQUFtQixLQUFLTjtBQUhMLE9BQUQsQ0FBcEI7O0FBS0EsVUFBSU0sTUFBSixFQUFZO0FBQ1ZFLFFBQUFBLE9BQU8sQ0FBQyxRQUFELENBQVAsR0FBb0JGLE1BQXBCO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFLVixPQUFMLENBQWFhLHdCQUFiLENBQXNDLEtBQXRDLEVBQTZDRCxPQUE3QyxDQUFQO0FBQ0Q7QUEvQ0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4uL3VybCc7XG5cbi8qKlxuICogRXhwb3NlcyBDSUQgQVBJIGlmIHByb3ZpZGVkIGJ5IHRoZSBWaWV3ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWV3ZXJDaWRBcGkge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBWaWV3ZXJDaWRBcGkuXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG5cbiAgICBjb25zdCB7Y2Fub25pY2FsVXJsfSA9IFNlcnZpY2VzLmRvY3VtZW50SW5mb0ZvckRvYyh0aGlzLmFtcGRvY18pO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMuY2Fub25pY2FsT3JpZ2luXyA9IGNhbm9uaWNhbFVybFxuICAgICAgPyBwYXJzZVVybERlcHJlY2F0ZWQoY2Fub25pY2FsVXJsKS5vcmlnaW5cbiAgICAgIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0byB0cnVlIGlmIFZpZXdlciBpcyB0cnVzdGVkIGFuZCBzdXBwb3J0cyBDSUQgQVBJLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxib29sZWFuPn1cbiAgICovXG4gIGlzU3VwcG9ydGVkKCkge1xuICAgIGlmICghdGhpcy52aWV3ZXJfLmhhc0NhcGFiaWxpdHkoJ2NpZCcpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmlld2VyXy5pc1RydXN0ZWRWaWV3ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHNjb3BlZCBDSUQgcmV0cmlldmVkIGZyb20gdGhlIFZpZXdlci5cbiAgICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBhcGlLZXlcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9Kc29uT2JqZWN0fHN0cmluZ3x1bmRlZmluZWQ+fVxuICAgKi9cbiAgZ2V0U2NvcGVkQ2lkKGFwaUtleSwgc2NvcGUpIHtcbiAgICBjb25zdCBwYXlsb2FkID0gZGljdCh7XG4gICAgICAnc2NvcGUnOiBzY29wZSxcbiAgICAgICdjbGllbnRJZEFwaSc6ICEhYXBpS2V5LFxuICAgICAgJ2Nhbm9uaWNhbE9yaWdpbic6IHRoaXMuY2Fub25pY2FsT3JpZ2luXyxcbiAgICB9KTtcbiAgICBpZiAoYXBpS2V5KSB7XG4gICAgICBwYXlsb2FkWydhcGlLZXknXSA9IGFwaUtleTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmlld2VyXy5zZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UoJ2NpZCcsIHBheWxvYWQpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/viewer-cid-api.js