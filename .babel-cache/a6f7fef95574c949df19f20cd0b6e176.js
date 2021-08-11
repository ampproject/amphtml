function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { map } from "../core/types/object";
import { Xhr } from "./xhr-impl";
import { getService, registerServiceBuilder } from "../service-helpers";
import { getSourceOrigin, removeFragment, resolveRelativeUrl } from "../url";

/**
 * A wrapper around the Xhr service which batches the result of GET requests
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export var BatchedXhr = /*#__PURE__*/function (_Xhr) {
  _inherits(BatchedXhr, _Xhr);

  var _super = _createSuper(BatchedXhr);

  /**
   * @param {!Window} win
   */
  function BatchedXhr(win) {
    var _this;

    _classCallCheck(this, BatchedXhr);

    _this = _super.call(this, win);

    /** @const {!Object<!Promise<!Response>>} */
    _this.fetchPromises_ = map();
    return _this;
  }

  /**
   * Fetch and batch the requests if possible.
   *
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   * @override
   */
  _createClass(BatchedXhr, [{
    key: "fetch",
    value: function fetch(input, opt_init) {
      var _this2 = this;

      var accept = opt_init && opt_init.headers && opt_init.headers['Accept'] || '';
      var isBatchable = !opt_init || !opt_init.method || opt_init.method === 'GET';
      var key = this.getMapKey_(input, accept);
      var isBatched = !!this.fetchPromises_[key];

      if (isBatchable && isBatched) {
        return this.fetchPromises_[key].then(function (response) {
          return response.clone();
        });
      }

      var fetchPromise = _get(_getPrototypeOf(BatchedXhr.prototype), "fetch", this).call(this, input, opt_init);

      if (isBatchable) {
        this.fetchPromises_[key] = fetchPromise.then(function (response) {
          delete _this2.fetchPromises_[key];
          return response.clone();
        }, function (err) {
          delete _this2.fetchPromises_[key];
          throw err;
        });
      }

      return fetchPromise;
    }
    /**
     * Creates a map key for a fetch.
     *
     * @param {string} input URL
     * @param {string} responseType
     * @return {string}
     * @private
     */

  }, {
    key: "getMapKey_",
    value: function getMapKey_(input, responseType) {
      var absoluteUrl = resolveRelativeUrl(input, getSourceOrigin(this.win.location));
      return removeFragment(absoluteUrl) + responseType;
    }
  }]);

  return BatchedXhr;
}(Xhr);

/**
 * @param {!Window} window
 * @return {!BatchedXhr}
 */
export function batchedXhrServiceForTesting(window) {
  installBatchedXhrService(window);
  return getService(window, 'batched-xhr');
}

/**
 * @param {!Window} window
 */
export function installBatchedXhrService(window) {
  registerServiceBuilder(window, 'batched-xhr', BatchedXhr);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhdGNoZWQteGhyLWltcGwuanMiXSwibmFtZXMiOlsibWFwIiwiWGhyIiwiZ2V0U2VydmljZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJnZXRTb3VyY2VPcmlnaW4iLCJyZW1vdmVGcmFnbWVudCIsInJlc29sdmVSZWxhdGl2ZVVybCIsIkJhdGNoZWRYaHIiLCJ3aW4iLCJmZXRjaFByb21pc2VzXyIsImlucHV0Iiwib3B0X2luaXQiLCJhY2NlcHQiLCJoZWFkZXJzIiwiaXNCYXRjaGFibGUiLCJtZXRob2QiLCJrZXkiLCJnZXRNYXBLZXlfIiwiaXNCYXRjaGVkIiwidGhlbiIsInJlc3BvbnNlIiwiY2xvbmUiLCJmZXRjaFByb21pc2UiLCJlcnIiLCJyZXNwb25zZVR5cGUiLCJhYnNvbHV0ZVVybCIsImxvY2F0aW9uIiwiYmF0Y2hlZFhoclNlcnZpY2VGb3JUZXN0aW5nIiwid2luZG93IiwiaW5zdGFsbEJhdGNoZWRYaHJTZXJ2aWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxHQUFSO0FBRUEsU0FBUUMsR0FBUjtBQUVBLFNBQVFDLFVBQVIsRUFBb0JDLHNCQUFwQjtBQUNBLFNBQVFDLGVBQVIsRUFBeUJDLGNBQXpCLEVBQXlDQyxrQkFBekM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsVUFBYjtBQUFBOztBQUFBOztBQUNFO0FBQ0Y7QUFDQTtBQUNFLHNCQUFZQyxHQUFaLEVBQWlCO0FBQUE7O0FBQUE7O0FBQ2YsOEJBQU1BLEdBQU47O0FBRUE7QUFDQSxVQUFLQyxjQUFMLEdBQXNCVCxHQUFHLEVBQXpCO0FBSmU7QUFLaEI7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWxCQTtBQUFBO0FBQUEsV0FtQkUsZUFBTVUsS0FBTixFQUFhQyxRQUFiLEVBQXVCO0FBQUE7O0FBQ3JCLFVBQU1DLE1BQU0sR0FDVEQsUUFBUSxJQUFJQSxRQUFRLENBQUNFLE9BQXJCLElBQWdDRixRQUFRLENBQUNFLE9BQVQsQ0FBaUIsUUFBakIsQ0FBakMsSUFBZ0UsRUFEbEU7QUFFQSxVQUFNQyxXQUFXLEdBQ2YsQ0FBQ0gsUUFBRCxJQUFhLENBQUNBLFFBQVEsQ0FBQ0ksTUFBdkIsSUFBaUNKLFFBQVEsQ0FBQ0ksTUFBVCxLQUFvQixLQUR2RDtBQUVBLFVBQU1DLEdBQUcsR0FBRyxLQUFLQyxVQUFMLENBQWdCUCxLQUFoQixFQUF1QkUsTUFBdkIsQ0FBWjtBQUNBLFVBQU1NLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBS1QsY0FBTCxDQUFvQk8sR0FBcEIsQ0FBcEI7O0FBRUEsVUFBSUYsV0FBVyxJQUFJSSxTQUFuQixFQUE4QjtBQUM1QixlQUFPLEtBQUtULGNBQUwsQ0FBb0JPLEdBQXBCLEVBQXlCRyxJQUF6QixDQUE4QixVQUFDQyxRQUFEO0FBQUEsaUJBQWNBLFFBQVEsQ0FBQ0MsS0FBVCxFQUFkO0FBQUEsU0FBOUIsQ0FBUDtBQUNEOztBQUVELFVBQU1DLFlBQVkseUVBQWVaLEtBQWYsRUFBc0JDLFFBQXRCLENBQWxCOztBQUVBLFVBQUlHLFdBQUosRUFBaUI7QUFDZixhQUFLTCxjQUFMLENBQW9CTyxHQUFwQixJQUEyQk0sWUFBWSxDQUFDSCxJQUFiLENBQ3pCLFVBQUNDLFFBQUQsRUFBYztBQUNaLGlCQUFPLE1BQUksQ0FBQ1gsY0FBTCxDQUFvQk8sR0FBcEIsQ0FBUDtBQUNBLGlCQUFPSSxRQUFRLENBQUNDLEtBQVQsRUFBUDtBQUNELFNBSndCLEVBS3pCLFVBQUNFLEdBQUQsRUFBUztBQUNQLGlCQUFPLE1BQUksQ0FBQ2QsY0FBTCxDQUFvQk8sR0FBcEIsQ0FBUDtBQUNBLGdCQUFNTyxHQUFOO0FBQ0QsU0FSd0IsQ0FBM0I7QUFVRDs7QUFFRCxhQUFPRCxZQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhEQTtBQUFBO0FBQUEsV0F5REUsb0JBQVdaLEtBQVgsRUFBa0JjLFlBQWxCLEVBQWdDO0FBQzlCLFVBQU1DLFdBQVcsR0FBR25CLGtCQUFrQixDQUNwQ0ksS0FEb0MsRUFFcENOLGVBQWUsQ0FBQyxLQUFLSSxHQUFMLENBQVNrQixRQUFWLENBRnFCLENBQXRDO0FBSUEsYUFBT3JCLGNBQWMsQ0FBQ29CLFdBQUQsQ0FBZCxHQUE4QkQsWUFBckM7QUFDRDtBQS9ESDs7QUFBQTtBQUFBLEVBQWdDdkIsR0FBaEM7O0FBa0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTMEIsMkJBQVQsQ0FBcUNDLE1BQXJDLEVBQTZDO0FBQ2xEQyxFQUFBQSx3QkFBd0IsQ0FBQ0QsTUFBRCxDQUF4QjtBQUNBLFNBQU8xQixVQUFVLENBQUMwQixNQUFELEVBQVMsYUFBVCxDQUFqQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msd0JBQVQsQ0FBa0NELE1BQWxDLEVBQTBDO0FBQy9DekIsRUFBQUEsc0JBQXNCLENBQUN5QixNQUFELEVBQVMsYUFBVCxFQUF3QnJCLFVBQXhCLENBQXRCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHttYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbmltcG9ydCB7WGhyfSBmcm9tICcuL3hoci1pbXBsJztcblxuaW1wb3J0IHtnZXRTZXJ2aWNlLCByZWdpc3RlclNlcnZpY2VCdWlsZGVyfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHtnZXRTb3VyY2VPcmlnaW4sIHJlbW92ZUZyYWdtZW50LCByZXNvbHZlUmVsYXRpdmVVcmx9IGZyb20gJy4uL3VybCc7XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgWGhyIHNlcnZpY2Ugd2hpY2ggYmF0Y2hlcyB0aGUgcmVzdWx0IG9mIEdFVCByZXF1ZXN0c1xuICpcbiAqIEBwYWNrYWdlIFZpc2libGUgZm9yIHR5cGUuXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEJhdGNoZWRYaHIgZXh0ZW5kcyBYaHIge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbikge1xuICAgIHN1cGVyKHdpbik7XG5cbiAgICAvKiogQGNvbnN0IHshT2JqZWN0PCFQcm9taXNlPCFSZXNwb25zZT4+fSAqL1xuICAgIHRoaXMuZmV0Y2hQcm9taXNlc18gPSBtYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbmQgYmF0Y2ggdGhlIHJlcXVlc3RzIGlmIHBvc3NpYmxlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgVVJMXG4gICAqIEBwYXJhbSB7P0ZldGNoSW5pdERlZj19IG9wdF9pbml0IEZldGNoIG9wdGlvbnMgb2JqZWN0LlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhUmVzcG9uc2U+fVxuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGZldGNoKGlucHV0LCBvcHRfaW5pdCkge1xuICAgIGNvbnN0IGFjY2VwdCA9XG4gICAgICAob3B0X2luaXQgJiYgb3B0X2luaXQuaGVhZGVycyAmJiBvcHRfaW5pdC5oZWFkZXJzWydBY2NlcHQnXSkgfHwgJyc7XG4gICAgY29uc3QgaXNCYXRjaGFibGUgPVxuICAgICAgIW9wdF9pbml0IHx8ICFvcHRfaW5pdC5tZXRob2QgfHwgb3B0X2luaXQubWV0aG9kID09PSAnR0VUJztcbiAgICBjb25zdCBrZXkgPSB0aGlzLmdldE1hcEtleV8oaW5wdXQsIGFjY2VwdCk7XG4gICAgY29uc3QgaXNCYXRjaGVkID0gISF0aGlzLmZldGNoUHJvbWlzZXNfW2tleV07XG5cbiAgICBpZiAoaXNCYXRjaGFibGUgJiYgaXNCYXRjaGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaFByb21pc2VzX1trZXldLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5jbG9uZSgpKTtcbiAgICB9XG5cbiAgICBjb25zdCBmZXRjaFByb21pc2UgPSBzdXBlci5mZXRjaChpbnB1dCwgb3B0X2luaXQpO1xuXG4gICAgaWYgKGlzQmF0Y2hhYmxlKSB7XG4gICAgICB0aGlzLmZldGNoUHJvbWlzZXNfW2tleV0gPSBmZXRjaFByb21pc2UudGhlbihcbiAgICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZmV0Y2hQcm9taXNlc19ba2V5XTtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuY2xvbmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmZldGNoUHJvbWlzZXNfW2tleV07XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBmZXRjaFByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG1hcCBrZXkgZm9yIGEgZmV0Y2guXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBVUkxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlc3BvbnNlVHlwZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRNYXBLZXlfKGlucHV0LCByZXNwb25zZVR5cGUpIHtcbiAgICBjb25zdCBhYnNvbHV0ZVVybCA9IHJlc29sdmVSZWxhdGl2ZVVybChcbiAgICAgIGlucHV0LFxuICAgICAgZ2V0U291cmNlT3JpZ2luKHRoaXMud2luLmxvY2F0aW9uKVxuICAgICk7XG4gICAgcmV0dXJuIHJlbW92ZUZyYWdtZW50KGFic29sdXRlVXJsKSArIHJlc3BvbnNlVHlwZTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luZG93XG4gKiBAcmV0dXJuIHshQmF0Y2hlZFhocn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhdGNoZWRYaHJTZXJ2aWNlRm9yVGVzdGluZyh3aW5kb3cpIHtcbiAgaW5zdGFsbEJhdGNoZWRYaHJTZXJ2aWNlKHdpbmRvdyk7XG4gIHJldHVybiBnZXRTZXJ2aWNlKHdpbmRvdywgJ2JhdGNoZWQteGhyJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5kb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxCYXRjaGVkWGhyU2VydmljZSh3aW5kb3cpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW5kb3csICdiYXRjaGVkLXhocicsIEJhdGNoZWRYaHIpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/batched-xhr-impl.js