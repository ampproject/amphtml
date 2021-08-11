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
import { Builder } from "./web-animations";
import { Services } from "../../../src/service";
import { WebAnimationBuilderOptionsDef } from "./web-animation-types";
import { installWebAnimationsIfNecessary } from "./install-polyfill";
export var WebAnimationService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function WebAnimationService(ampdoc) {
    _classCallCheck(this, WebAnimationService);

    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const */
    this.owners_ = Services.ownersForDoc(ampdoc);
  }

  /**
   * @param {!WebAnimationBuilderOptionsDef} options
   * @return {!Promise<Builder>}
   */
  _createClass(WebAnimationService, [{
    key: "createBuilder",
    value: function createBuilder(options) {
      var _this = this;

      return installWebAnimationsIfNecessary(this.ampdoc_).then(function () {
        return new Builder(_this.ampdoc_.win, _this.ampdoc_.getRootNode(), _this.ampdoc_.getUrl(), _this.vsync_, _this.owners_, options);
      });
    }
  }]);

  return WebAnimationService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYi1hbmltYXRpb24tc2VydmljZS5qcyJdLCJuYW1lcyI6WyJCdWlsZGVyIiwiU2VydmljZXMiLCJXZWJBbmltYXRpb25CdWlsZGVyT3B0aW9uc0RlZiIsImluc3RhbGxXZWJBbmltYXRpb25zSWZOZWNlc3NhcnkiLCJXZWJBbmltYXRpb25TZXJ2aWNlIiwiYW1wZG9jIiwiYW1wZG9jXyIsInZzeW5jXyIsInZzeW5jRm9yIiwid2luIiwib3duZXJzXyIsIm93bmVyc0ZvckRvYyIsIm9wdGlvbnMiLCJ0aGVuIiwiZ2V0Um9vdE5vZGUiLCJnZXRVcmwiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLE9BQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsNkJBQVI7QUFDQSxTQUFRQywrQkFBUjtBQUVBLFdBQWFDLG1CQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsK0JBQVlDLE1BQVosRUFBb0I7QUFBQTs7QUFDbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWVELE1BQWY7O0FBRUE7QUFDQSxTQUFLRSxNQUFMLEdBQWNOLFFBQVEsQ0FBQ08sUUFBVCxDQUFrQkgsTUFBTSxDQUFDSSxHQUF6QixDQUFkOztBQUVBO0FBQ0EsU0FBS0MsT0FBTCxHQUFlVCxRQUFRLENBQUNVLFlBQVQsQ0FBc0JOLE1BQXRCLENBQWY7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQWxCQTtBQUFBO0FBQUEsV0FtQkUsdUJBQWNPLE9BQWQsRUFBdUI7QUFBQTs7QUFDckIsYUFBT1QsK0JBQStCLENBQUMsS0FBS0csT0FBTixDQUEvQixDQUE4Q08sSUFBOUMsQ0FDTDtBQUFBLGVBQ0UsSUFBSWIsT0FBSixDQUNFLEtBQUksQ0FBQ00sT0FBTCxDQUFhRyxHQURmLEVBRUUsS0FBSSxDQUFDSCxPQUFMLENBQWFRLFdBQWIsRUFGRixFQUdFLEtBQUksQ0FBQ1IsT0FBTCxDQUFhUyxNQUFiLEVBSEYsRUFJRSxLQUFJLENBQUNSLE1BSlAsRUFLRSxLQUFJLENBQUNHLE9BTFAsRUFNRUUsT0FORixDQURGO0FBQUEsT0FESyxDQUFQO0FBV0Q7QUEvQkg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtCdWlsZGVyfSBmcm9tICcuL3dlYi1hbmltYXRpb25zJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7V2ViQW5pbWF0aW9uQnVpbGRlck9wdGlvbnNEZWZ9IGZyb20gJy4vd2ViLWFuaW1hdGlvbi10eXBlcyc7XG5pbXBvcnQge2luc3RhbGxXZWJBbmltYXRpb25zSWZOZWNlc3Nhcnl9IGZyb20gJy4vaW5zdGFsbC1wb2x5ZmlsbCc7XG5cbmV4cG9ydCBjbGFzcyBXZWJBbmltYXRpb25TZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCAqL1xuICAgIHRoaXMudnN5bmNfID0gU2VydmljZXMudnN5bmNGb3IoYW1wZG9jLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5vd25lcnNfID0gU2VydmljZXMub3duZXJzRm9yRG9jKGFtcGRvYyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshV2ViQW5pbWF0aW9uQnVpbGRlck9wdGlvbnNEZWZ9IG9wdGlvbnNcbiAgICogQHJldHVybiB7IVByb21pc2U8QnVpbGRlcj59XG4gICAqL1xuICBjcmVhdGVCdWlsZGVyKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFsbFdlYkFuaW1hdGlvbnNJZk5lY2Vzc2FyeSh0aGlzLmFtcGRvY18pLnRoZW4oXG4gICAgICAoKSA9PlxuICAgICAgICBuZXcgQnVpbGRlcihcbiAgICAgICAgICB0aGlzLmFtcGRvY18ud2luLFxuICAgICAgICAgIHRoaXMuYW1wZG9jXy5nZXRSb290Tm9kZSgpLFxuICAgICAgICAgIHRoaXMuYW1wZG9jXy5nZXRVcmwoKSxcbiAgICAgICAgICB0aGlzLnZzeW5jXyxcbiAgICAgICAgICB0aGlzLm93bmVyc18sXG4gICAgICAgICAgb3B0aW9uc1xuICAgICAgICApXG4gICAgKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/web-animation-service.js