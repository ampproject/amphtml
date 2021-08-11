function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

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
import { isJsonScriptTag } from "../../../src/core/dom";
import { isObject } from "../../../src/core/types";
import { parseJson } from "../../../src/core/types/object/json";
import { user, userAssert } from "../../../src/log";

/** @const {string} */
var TAG = 'amp-story-auto-ads:config';

/** @enum {boolean} */
var DisallowedAdAttributes = {
  'height': true,
  'layout': true,
  'width': true
};

/** @enum {boolean} */
var AllowedAdTypes = {
  'adsense': true,
  'custom': true,
  'doubleclick': true,
  'fake': true,
  'nws': true
};
export var StoryAdConfig = /*#__PURE__*/function () {
  /**
   * @param {!Element} element amp-story-auto-ads element.
   * @param {!Window} win Window element
   */
  function StoryAdConfig(element, win) {
    _classCallCheck(this, StoryAdConfig);

    /** @private {!Element} amp-story-auto ads element. */
    this.element_ = element;

    /** @private {!Window} Window element */
    this.win_ = win;
  }

  /**
   * Validate and sanitize config.
   * @return {!JsonObject}
   */
  _createClass(StoryAdConfig, [{
    key: "getConfig",
    value: function getConfig() {
      var _this = this;

      var configData = this.element_.hasAttribute('src') ? this.getRemoteConfig_() : this.getInlineConfig_(this.element_.firstElementChild);
      return configData.then(function (jsonConfig) {
        return _this.validateConfig_(jsonConfig);
      });
    }
    /**
     * @param {!Element} jsonConfig
     * @return {!JsonObject}
     */

  }, {
    key: "validateConfig_",
    value: function validateConfig_(jsonConfig) {
      var requiredAttrs = {
        class: 'i-amphtml-story-ad',
        layout: 'fill',
        'amp-story': ''
      };
      var adAttributes = jsonConfig['ad-attributes'];
      userAssert(adAttributes, TAG + " Error reading config. " + 'Top level JSON should have an "ad-attributes" key');
      this.validateType_(adAttributes['type']);

      for (var attr in adAttributes) {
        var value = adAttributes[attr];

        if (isObject(value)) {
          adAttributes[attr] = JSON.stringify(value);
        }

        if (DisallowedAdAttributes[attr]) {
          user().warn(TAG, 'ad-attribute "%s" is not allowed', attr);
          delete adAttributes[attr];
        }
      }

      return (
        /** @type {!JsonObject} */
        _extends({}, adAttributes, requiredAttrs)
      );
    }
    /**
     * @param {!Element} child
     * @return {!JsonObject}
     */

  }, {
    key: "getInlineConfig_",
    value: function getInlineConfig_(child) {
      userAssert(child && isJsonScriptTag(child), "The " + TAG + " should " + 'be inside a <script> tag with type="application/json"');
      var inlineJSONConfig = parseJson(child.textContent);
      return Promise.resolve(inlineJSONConfig);
    }
    /**
     * @return {!JsonObject}
     */

  }, {
    key: "getRemoteConfig_",
    value: function getRemoteConfig_() {
      return Services.xhrFor(this.win_).fetchJson(this.element_.getAttribute('src')).then(function (response) {
        return response.json();
      }).catch(function (err) {
        user().error(TAG, 'error determining if remote config is valid json: bad url or bad json', err);
      });
    }
    /**
     * Logic specific to each ad type.
     * @param {string} type
     */

  }, {
    key: "validateType_",
    value: function validateType_(type) {
      userAssert(!!AllowedAdTypes[type], TAG + " \"" + type + "\" ad type is missing or not supported");

      if (type === 'fake') {
        var id = this.element_.id;
        userAssert(id && id.startsWith('i-amphtml-demo-'), TAG + " id must start with i-amphtml-demo- to use fake ads");
      }
    }
  }]);

  return StoryAdConfig;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFkLWNvbmZpZy5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImlzSnNvblNjcmlwdFRhZyIsImlzT2JqZWN0IiwicGFyc2VKc29uIiwidXNlciIsInVzZXJBc3NlcnQiLCJUQUciLCJEaXNhbGxvd2VkQWRBdHRyaWJ1dGVzIiwiQWxsb3dlZEFkVHlwZXMiLCJTdG9yeUFkQ29uZmlnIiwiZWxlbWVudCIsIndpbiIsImVsZW1lbnRfIiwid2luXyIsImNvbmZpZ0RhdGEiLCJoYXNBdHRyaWJ1dGUiLCJnZXRSZW1vdGVDb25maWdfIiwiZ2V0SW5saW5lQ29uZmlnXyIsImZpcnN0RWxlbWVudENoaWxkIiwidGhlbiIsImpzb25Db25maWciLCJ2YWxpZGF0ZUNvbmZpZ18iLCJyZXF1aXJlZEF0dHJzIiwiY2xhc3MiLCJsYXlvdXQiLCJhZEF0dHJpYnV0ZXMiLCJ2YWxpZGF0ZVR5cGVfIiwiYXR0ciIsInZhbHVlIiwiSlNPTiIsInN0cmluZ2lmeSIsIndhcm4iLCJjaGlsZCIsImlubGluZUpTT05Db25maWciLCJ0ZXh0Q29udGVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwieGhyRm9yIiwiZmV0Y2hKc29uIiwiZ2V0QXR0cmlidXRlIiwicmVzcG9uc2UiLCJqc29uIiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsInR5cGUiLCJpZCIsInN0YXJ0c1dpdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLElBQVIsRUFBY0MsVUFBZDs7QUFFQTtBQUNBLElBQU1DLEdBQUcsR0FBRywyQkFBWjs7QUFFQTtBQUNBLElBQU1DLHNCQUFzQixHQUFHO0FBQzdCLFlBQVUsSUFEbUI7QUFFN0IsWUFBVSxJQUZtQjtB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LEVBR0pDLEtBSEksQ0FHRSxVQUFDQyxHQUFELEVBQVM7QUFDZHZDLFFBQUFBLElBQUksR0FBR3dDLEtBQVAsQ0FDRXRDLEdBREYsRUFFRSx1RUFGRixFQUdFcUMsR0FIRjtBQUtELE9BVEksQ0FBUDtBQVVEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBMUZBO0FBQUE7QUFBQSxXQTJGRSx1QkFBY0UsSUFBZCxFQUFvQjtBQUNsQnhDLE1BQUFBLFVBQVUsQ0FDUixDQUFDLENBQUNHLGNBQWMsQ0FBQ3FDLElBQUQsQ0FEUixFQUVMdkMsR0FGSyxXQUVHdUMsSUFGSCw0Q0FBVjs7QUFLQSxVQUFJQSxJQUFJLEtBQUssTUFBYixFQUFxQjtBQUNuQixZQUFPQyxFQUFQLEdBQWEsS0FBS2xDLFFBQWxCLENBQU9rQyxFQUFQO0FBQ0F6QyxRQUFBQSxVQUFVLENBQ1J5QyxFQUFFLElBQUlBLEVBQUUsQ0FBQ0MsVUFBSCxDQUFjLGlCQUFkLENBREUsRUFFTHpDLEdBRksseURBQVY7QUFJRDtBQUNGO0FBeEdIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtpc0pzb25TY3JpcHRUYWd9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2lzT2JqZWN0fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge3BhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHt1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1hdXRvLWFkczpjb25maWcnO1xuXG4vKiogQGVudW0ge2Jvb2xlYW59ICovXG5jb25zdCBEaXNhbGxvd2VkQWRBdHRyaWJ1dGVzID0ge1xuICAnaGVpZ2h0JzogdHJ1ZSxcbiAgJ2xheW91dCc6IHRydWUsXG4gICd3aWR0aCc6IHRydWUsXG59O1xuXG4vKiogQGVudW0ge2Jvb2xlYW59ICovXG5jb25zdCBBbGxvd2VkQWRUeXBlcyA9IHtcbiAgJ2Fkc2Vuc2UnOiB0cnVlLFxuICAnY3VzdG9tJzogdHJ1ZSxcbiAgJ2RvdWJsZWNsaWNrJzogdHJ1ZSxcbiAgJ2Zha2UnOiB0cnVlLFxuICAnbndzJzogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdG9yeUFkQ29uZmlnIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnQgYW1wLXN0b3J5LWF1dG8tYWRzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFdpbmRvdyBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCB3aW4pIHtcbiAgICAvKiogQHByaXZhdGUgeyFFbGVtZW50fSBhbXAtc3RvcnktYXV0byBhZHMgZWxlbWVudC4gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9IFdpbmRvdyBlbGVtZW50ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGFuZCBzYW5pdGl6ZSBjb25maWcuXG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICAgKi9cbiAgZ2V0Q29uZmlnKCkge1xuICAgIGNvbnN0IGNvbmZpZ0RhdGEgPSB0aGlzLmVsZW1lbnRfLmhhc0F0dHJpYnV0ZSgnc3JjJylcbiAgICAgID8gdGhpcy5nZXRSZW1vdGVDb25maWdfKClcbiAgICAgIDogdGhpcy5nZXRJbmxpbmVDb25maWdfKHRoaXMuZWxlbWVudF8uZmlyc3RFbGVtZW50Q2hpbGQpO1xuICAgIHJldHVybiBjb25maWdEYXRhLnRoZW4oKGpzb25Db25maWcpID0+IHRoaXMudmFsaWRhdGVDb25maWdfKGpzb25Db25maWcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBqc29uQ29uZmlnXG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fVxuICAgKi9cbiAgdmFsaWRhdGVDb25maWdfKGpzb25Db25maWcpIHtcbiAgICBjb25zdCByZXF1aXJlZEF0dHJzID0ge1xuICAgICAgY2xhc3M6ICdpLWFtcGh0bWwtc3RvcnktYWQnLFxuICAgICAgbGF5b3V0OiAnZmlsbCcsXG4gICAgICAnYW1wLXN0b3J5JzogJycsXG4gICAgfTtcblxuICAgIGNvbnN0IGFkQXR0cmlidXRlcyA9IGpzb25Db25maWdbJ2FkLWF0dHJpYnV0ZXMnXTtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgYWRBdHRyaWJ1dGVzLFxuICAgICAgYCR7VEFHfSBFcnJvciByZWFkaW5nIGNvbmZpZy4gYCArXG4gICAgICAgICdUb3AgbGV2ZWwgSlNPTiBzaG91bGQgaGF2ZSBhbiBcImFkLWF0dHJpYnV0ZXNcIiBrZXknXG4gICAgKTtcblxuICAgIHRoaXMudmFsaWRhdGVUeXBlXyhhZEF0dHJpYnV0ZXNbJ3R5cGUnXSk7XG5cbiAgICBmb3IgKGNvbnN0IGF0dHIgaW4gYWRBdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGFkQXR0cmlidXRlc1thdHRyXTtcbiAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgYWRBdHRyaWJ1dGVzW2F0dHJdID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKERpc2FsbG93ZWRBZEF0dHJpYnV0ZXNbYXR0cl0pIHtcbiAgICAgICAgdXNlcigpLndhcm4oVEFHLCAnYWQtYXR0cmlidXRlIFwiJXNcIiBpcyBub3QgYWxsb3dlZCcsIGF0dHIpO1xuICAgICAgICBkZWxldGUgYWRBdHRyaWJ1dGVzW2F0dHJdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHsuLi5hZEF0dHJpYnV0ZXMsIC4uLnJlcXVpcmVkQXR0cnN9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBjaGlsZFxuICAgKiBAcmV0dXJuIHshSnNvbk9iamVjdH1cbiAgICovXG4gIGdldElubGluZUNvbmZpZ18oY2hpbGQpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgY2hpbGQgJiYgaXNKc29uU2NyaXB0VGFnKGNoaWxkKSxcbiAgICAgIGBUaGUgJHtUQUd9IHNob3VsZCBgICtcbiAgICAgICAgJ2JlIGluc2lkZSBhIDxzY3JpcHQ+IHRhZyB3aXRoIHR5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCInXG4gICAgKTtcbiAgICBjb25zdCBpbmxpbmVKU09OQ29uZmlnID0gcGFyc2VKc29uKGNoaWxkLnRleHRDb250ZW50KTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaW5saW5lSlNPTkNvbmZpZyk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUpzb25PYmplY3R9XG4gICAqL1xuICBnZXRSZW1vdGVDb25maWdfKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy54aHJGb3IodGhpcy53aW5fKVxuICAgICAgLmZldGNoSnNvbih0aGlzLmVsZW1lbnRfLmdldEF0dHJpYnV0ZSgnc3JjJykpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ2Vycm9yIGRldGVybWluaW5nIGlmIHJlbW90ZSBjb25maWcgaXMgdmFsaWQganNvbjogYmFkIHVybCBvciBiYWQganNvbicsXG4gICAgICAgICAgZXJyXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dpYyBzcGVjaWZpYyB0byBlYWNoIGFkIHR5cGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqL1xuICB2YWxpZGF0ZVR5cGVfKHR5cGUpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgISFBbGxvd2VkQWRUeXBlc1t0eXBlXSxcbiAgICAgIGAke1RBR30gXCIke3R5cGV9XCIgYWQgdHlwZSBpcyBtaXNzaW5nIG9yIG5vdCBzdXBwb3J0ZWRgXG4gICAgKTtcblxuICAgIGlmICh0eXBlID09PSAnZmFrZScpIHtcbiAgICAgIGNvbnN0IHtpZH0gPSB0aGlzLmVsZW1lbnRfO1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgaWQgJiYgaWQuc3RhcnRzV2l0aCgnaS1hbXBodG1sLWRlbW8tJyksXG4gICAgICAgIGAke1RBR30gaWQgbXVzdCBzdGFydCB3aXRoIGktYW1waHRtbC1kZW1vLSB0byB1c2UgZmFrZSBhZHNgXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-config.js