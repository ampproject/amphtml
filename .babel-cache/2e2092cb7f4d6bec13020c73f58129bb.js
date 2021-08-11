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
import { Action, StateProperty, getStoreService } from "./amp-story-store-service";
import { AnalyticsVariable, getVariableService } from "./variable-service";
import { dev, user } from "../../../src/log";
import { dict } from "../../../src/core/types/object";

/** @type {string} */
var TAG = 'amp-story-viewer-messaging-handler';

/** @enum {number} */
var DataSources = {
  STORE_SERVICE: 0,
  VARIABLE_SERVICE: 2
};

/**
 * @typedef {{
 *   dataSource: !DataSources,
 *   property: (!StateProperty|!AnalyticsVariable)
 * }}
 */
var GetStateConfigurationDef;

/** @enum {!GetStateConfigurationDef} */
var GET_STATE_CONFIGURATIONS = {
  'CURRENT_PAGE_ID': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.CURRENT_PAGE_ID
  },
  'EDUCATION_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.EDUCATION_STATE
  },
  'MUTED_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.MUTED_STATE
  },
  'PAGE_ATTACHMENT_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.PAGE_ATTACHMENT_STATE
  },
  'UI_STATE': {
    dataSource: DataSources.STORE_SERVICE,
    property: StateProperty.UI_STATE
  },
  'STORY_PROGRESS': {
    dataSource: DataSources.VARIABLE_SERVICE,
    property: AnalyticsVariable.STORY_PROGRESS
  }
};

/** @typedef {{action: !Action, isValueValid: function(*):boolean}} */
var SetStateConfigurationDef;

/** @enum {!SetStateConfigurationDef} */
var SET_STATE_CONFIGURATIONS = {
  'MUTED_STATE': {
    action: Action.TOGGLE_MUTED,
    isValueValid: function isValueValid(value) {
      return typeof value === 'boolean';
    }
  }
};

/**
 * Viewer messaging handler.
 */
export var AmpStoryViewerMessagingHandler = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!../../../src/service/viewer-interface.ViewerInterface} viewer
   */
  function AmpStoryViewerMessagingHandler(win, viewer) {
    _classCallCheck(this, AmpStoryViewerMessagingHandler);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    /** @private @const {!./variable-service.AmpStoryVariableService} */
    this.variableService_ = getVariableService(win);

    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = viewer;
  }

  /**
   * @public
   */
  _createClass(AmpStoryViewerMessagingHandler, [{
    key: "startListening",
    value: function startListening() {
      var _this = this;

      this.viewer_.onMessageRespond('getDocumentState', function (data) {
        return _this.onGetDocumentState_(data);
      });
      this.viewer_.onMessage('onDocumentState', function (data) {
        return _this.onOnDocumentState_(data);
      });
      this.viewer_.onMessageRespond('setDocumentState', function (data) {
        return _this.onSetDocumentState_(data);
      });
      this.viewer_.onMessageRespond('customDocumentUI', function (data) {
        return _this.onCustomDocumentUI_(data);
      });
    }
    /**
     * @param {string} eventType
     * @param {?JsonObject|string|undefined} data
     * @param {boolean=} cancelUnsent
     */

  }, {
    key: "send",
    value: function send(eventType, data, cancelUnsent) {
      if (cancelUnsent === void 0) {
        cancelUnsent = false;
      }

      this.viewer_.sendMessage(eventType, data, cancelUnsent);
    }
    /**
     * Handles 'getDocumentState' viewer messages.
     * @param {!Object=} data
     * @return {!Promise}
     * @private
     */

  }, {
    key: "onGetDocumentState_",
    value: function onGetDocumentState_(data) {
      if (data === void 0) {
        data = {};
      }

      var _data = data,
          state = _data.state;
      var config = GET_STATE_CONFIGURATIONS[state];

      if (!config) {
        return Promise.reject("Invalid 'state' parameter");
      }

      var value;

      switch (config.dataSource) {
        case DataSources.STORE_SERVICE:
          value = this.storeService_.get(config.property);
          break;

        case DataSources.VARIABLE_SERVICE:
          value = this.variableService_.get()[config.property];
          break;

        default:
          dev().error(TAG, 'Unknown data source %s.', config.dataSource);
          break;
      }

      return Promise.resolve({
        state: state,
        value: value
      });
    }
    /**
     * Handles 'onDocumentState' viewer messages.
     * @param {!Object=} data
     * @private
     */

  }, {
    key: "onOnDocumentState_",
    value: function onOnDocumentState_(data) {
      var _this2 = this;

      if (data === void 0) {
        data = {};
      }

      var _data2 = data,
          state = _data2.state;
      var config = GET_STATE_CONFIGURATIONS[state];

      if (!config) {
        user().error(TAG, "Invalid 'state' parameter");
        return;
      }

      this.storeService_.subscribe(config.property, function (value) {
        _this2.viewer_.sendMessage('documentStateUpdate', dict({
          'state': state,
          'value': value
        }));
      });
    }
    /**
     * Handles 'setDocumentState' viewer messages.
     * @param {!Object=} data
     * @return {!Promise<!Object|undefined>}
     * @private
     */

  }, {
    key: "onSetDocumentState_",
    value: function onSetDocumentState_(data) {
      if (data === void 0) {
        data = {};
      }

      var _data3 = data,
          state = _data3.state,
          value = _data3.value;
      var config = SET_STATE_CONFIGURATIONS[state];

      if (!config) {
        return Promise.reject("Invalid 'state' parameter");
      }

      if (!config.isValueValid(value)) {
        return Promise.reject("Invalid 'value' parameter");
      }

      this.storeService_.dispatch(config.action, value);
      return Promise.resolve({
        state: state,
        value: value
      });
    }
    /**
     * Handles 'customDocumentUI' viewer messages.
     * @param {!Object} data
     * @private
     */

  }, {
    key: "onCustomDocumentUI_",
    value: function onCustomDocumentUI_(data) {
      this.storeService_.dispatch(Action.SET_VIEWER_CUSTOM_CONTROLS, data.controls);
    }
  }]);

  return AmpStoryViewerMessagingHandler;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS12aWV3ZXItbWVzc2FnaW5nLWhhbmRsZXIuanMiXSwibmFtZXMiOlsiQWN0aW9uIiwiU3RhdGVQcm9wZXJ0eSIsImdldFN0b3JlU2VydmljZSIsIkFuYWx5dGljc1ZhcmlhYmxlIiwiZ2V0VmFyaWFibGVTZXJ2aWNlIiwiZGV2IiwidXNlciIsImRpY3QiLCJUQUciLCJEYXRhU291cmNlcyIsIlNUT1JFX1NFUlZJQ0UiLCJWQVJJQUJMRV9TRVJWSUNFIiwiR2V0U3RhdGVDb25maWd1cmF0aW9uRGVmIiwiR0VUX1NUQVRFX0NPTkZJR1VSQVRJT05TIiwiZGF0YVNvdXJjZSIsInByb3BlcnR5IiwiQ1VSUkVOVF9QQUdFX0lEIiwiRURVQ0FUSU9OX1NUQVRFIiwiTVVURURfU1RBVEUiLCJQQUdFX0FUVEFDSE1FTlRfU1RBVEUiLCJVSV9TVEFURSIsIlNUT1JZX1BST0dSRVNTIiwiU2V0U3RhdGVDb25maWd1cmF0aW9uRGVmIiwiU0VUX1NUQVRFX0NPTkZJR1VSQVRJT05TIiwiYWN0aW9uIiwiVE9HR0xFX01VVEVEIiwiaXNWYWx1ZVZhbGlkIiwidmFsdWUiLCJBbXBTdG9yeVZpZXdlck1lc3NhZ2luZ0hhbmRsZXIiLCJ3aW4iLCJ2aWV3ZXIiLCJzdG9yZVNlcnZpY2VfIiwidmFyaWFibGVTZXJ2aWNlXyIsInZpZXdlcl8iLCJvbk1lc3NhZ2VSZXNwb25kIiwiZGF0YSIsIm9uR2V0RG9jdW1lbnRTdGF0ZV8iLCJvbk1lc3NhZ2UiLCJvbk9uRG9jdW1lbnRTdGF0ZV8iLCJvblNldERvY3VtZW50U3RhdGVfIiwib25DdXN0b21Eb2N1bWVudFVJXyIsImV2ZW50VHlwZSIsImNhbmNlbFVuc2VudCIsInNlbmRNZXNzYWdlIiwic3RhdGUiLCJjb25maWciLCJQcm9taXNlIiwicmVqZWN0IiwiZ2V0IiwiZXJyb3IiLCJyZXNvbHZlIiwic3Vic2NyaWJlIiwiZGlzcGF0Y2giLCJTRVRfVklFV0VSX0NVU1RPTV9DT05UUk9MUyIsImNvbnRyb2xzIl0sIm1h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QU9BLEtBQVA7QUFBQSxVQUFjakIsS0FBZCxVQUFjQSxLQUFkO0FBQ0EsVUFBTWtCLE1BQU0sR0FBR3RCLHdCQUF3QixDQUFDcUIsS0FBRCxDQUF2Qzs7QUFFQSxVQUFJLENBQUNDLE1BQUwsRUFBYTtBQUNYLGVBQU9DLE9BQU8sQ0FBQ0MsTUFBUiw2QkFBUDtBQUNEOztBQUVELFVBQUksQ0FBQ0YsTUFBTSxDQUFDbkIsWUFBUCxDQUFvQkMsS0FBcEIsQ0FBTCxFQUFpQztBQUMvQixlQUFPbUIsT0FBTyxDQUFDQyxNQUFSLDZCQUFQO0FBQ0Q7O0FBRUQsV0FBS2hCLGFBQUwsQ0FBbUJxQixRQUFuQixDQUE0QlAsTUFBTSxDQUFDckIsTUFBbkMsRUFBMkNHLEtBQTNDO0FBRUEsYUFBT21CLE9BQU8sQ0FBQ0ksT0FBUixDQUFnQjtBQUFDTixRQUFBQSxLQUFLLEVBQUxBLEtBQUQ7QUFBUWpCLFFBQUFBLEtBQUssRUFBTEE7QUFBUixPQUFoQixDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTNIQTtBQUFBO0FBQUEsV0E0SEUsNkJBQW9CUSxJQUFwQixFQUEwQjtBQUN4QixXQUFLSixhQUFMLENBQW1CcUIsUUFBbkIsQ0FDRXBELE1BQU0sQ0FBQ3FELDBCQURULEVBRUVsQixJQUFJLENBQUNtQixRQUZQO0FBSUQ7QUFqSUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBBY3Rpb24sXG4gIFN0YXRlUHJvcGVydHksXG4gIGdldFN0b3JlU2VydmljZSxcbn0gZnJvbSAnLi9hbXAtc3Rvcnktc3RvcmUtc2VydmljZSc7XG5pbXBvcnQge0FuYWx5dGljc1ZhcmlhYmxlLCBnZXRWYXJpYWJsZVNlcnZpY2V9IGZyb20gJy4vdmFyaWFibGUtc2VydmljZSc7XG5pbXBvcnQge2RldiwgdXNlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS12aWV3ZXItbWVzc2FnaW5nLWhhbmRsZXInO1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cbmNvbnN0IERhdGFTb3VyY2VzID0ge1xuICBTVE9SRV9TRVJWSUNFOiAwLFxuICBWQVJJQUJMRV9TRVJWSUNFOiAyLFxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBkYXRhU291cmNlOiAhRGF0YVNvdXJjZXMsXG4gKiAgIHByb3BlcnR5OiAoIVN0YXRlUHJvcGVydHl8IUFuYWx5dGljc1ZhcmlhYmxlKVxuICogfX1cbiAqL1xubGV0IEdldFN0YXRlQ29uZmlndXJhdGlvbkRlZjtcblxuLyoqIEBlbnVtIHshR2V0U3RhdGVDb25maWd1cmF0aW9uRGVmfSAqL1xuY29uc3QgR0VUX1NUQVRFX0NPTkZJR1VSQVRJT05TID0ge1xuICAnQ1VSUkVOVF9QQUdFX0lEJzoge1xuICAgIGRhdGFTb3VyY2U6IERhdGFTb3VyY2VzLlNUT1JFX1NFUlZJQ0UsXG4gICAgcHJvcGVydHk6IFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lELFxuICB9LFxuICAnRURVQ0FUSU9OX1NUQVRFJzoge1xuICAgIGRhdGFTb3VyY2U6IERhdGFTb3VyY2VzLlNUT1JFX1NFUlZJQ0UsXG4gICAgcHJvcGVydHk6IFN0YXRlUHJvcGVydHkuRURVQ0FUSU9OX1NUQVRFLFxuICB9LFxuICAnTVVURURfU1RBVEUnOiB7XG4gICAgZGF0YVNvdXJjZTogRGF0YVNvdXJjZXMuU1RPUkVfU0VSVklDRSxcbiAgICBwcm9wZXJ0eTogU3RhdGVQcm9wZXJ0eS5NVVRFRF9TVEFURSxcbiAgfSxcbiAgJ1BBR0VfQVRUQUNITUVOVF9TVEFURSc6IHtcbiAgICBkYXRhU291cmNlOiBEYXRhU291cmNlcy5TVE9SRV9TRVJWSUNFLFxuICAgIHByb3BlcnR5OiBTdGF0ZVByb3BlcnR5LlBBR0VfQVRUQUNITUVOVF9TVEFURSxcbiAgfSxcbiAgJ1VJX1NUQVRFJzoge1xuICAgIGRhdGFTb3VyY2U6IERhdGFTb3VyY2VzLlNUT1JFX1NFUlZJQ0UsXG4gICAgcHJvcGVydHk6IFN0YXRlUHJvcGVydHkuVUlfU1RBVEUsXG4gIH0sXG4gICdTVE9SWV9QUk9HUkVTUyc6IHtcbiAgICBkYXRhU291cmNlOiBEYXRhU291cmNlcy5WQVJJQUJMRV9TRVJWSUNFLFxuICAgIHByb3BlcnR5OiBBbmFseXRpY3NWYXJpYWJsZS5TVE9SWV9QUk9HUkVTUyxcbiAgfSxcbn07XG5cbi8qKiBAdHlwZWRlZiB7e2FjdGlvbjogIUFjdGlvbiwgaXNWYWx1ZVZhbGlkOiBmdW5jdGlvbigqKTpib29sZWFufX0gKi9cbmxldCBTZXRTdGF0ZUNvbmZpZ3VyYXRpb25EZWY7XG5cbi8qKiBAZW51bSB7IVNldFN0YXRlQ29uZmlndXJhdGlvbkRlZn0gKi9cbmNvbnN0IFNFVF9TVEFURV9DT05GSUdVUkFUSU9OUyA9IHtcbiAgJ01VVEVEX1NUQVRFJzoge1xuICAgIGFjdGlvbjogQWN0aW9uLlRPR0dMRV9NVVRFRCxcbiAgICBpc1ZhbHVlVmFsaWQ6ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gIH0sXG59O1xuXG4vKipcbiAqIFZpZXdlciBtZXNzYWdpbmcgaGFuZGxlci5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5Vmlld2VyTWVzc2FnaW5nSGFuZGxlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gdmlld2VyXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHZpZXdlcikge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh3aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdmFyaWFibGUtc2VydmljZS5BbXBTdG9yeVZhcmlhYmxlU2VydmljZX0gKi9cbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8gPSBnZXRWYXJpYWJsZVNlcnZpY2Uod2luKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS92aWV3ZXItaW50ZXJmYWNlLlZpZXdlckludGVyZmFjZX0gKi9cbiAgICB0aGlzLnZpZXdlcl8gPSB2aWV3ZXI7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc3RhcnRMaXN0ZW5pbmcoKSB7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZVJlc3BvbmQoJ2dldERvY3VtZW50U3RhdGUnLCAoZGF0YSkgPT5cbiAgICAgIHRoaXMub25HZXREb2N1bWVudFN0YXRlXyhkYXRhKVxuICAgICk7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZSgnb25Eb2N1bWVudFN0YXRlJywgKGRhdGEpID0+XG4gICAgICB0aGlzLm9uT25Eb2N1bWVudFN0YXRlXyhkYXRhKVxuICAgICk7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZVJlc3BvbmQoJ3NldERvY3VtZW50U3RhdGUnLCAoZGF0YSkgPT5cbiAgICAgIHRoaXMub25TZXREb2N1bWVudFN0YXRlXyhkYXRhKVxuICAgICk7XG4gICAgdGhpcy52aWV3ZXJfLm9uTWVzc2FnZVJlc3BvbmQoJ2N1c3RvbURvY3VtZW50VUknLCAoZGF0YSkgPT5cbiAgICAgIHRoaXMub25DdXN0b21Eb2N1bWVudFVJXyhkYXRhKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0gez9Kc29uT2JqZWN0fHN0cmluZ3x1bmRlZmluZWR9IGRhdGFcbiAgICogQHBhcmFtIHtib29sZWFuPX0gY2FuY2VsVW5zZW50XG4gICAqL1xuICBzZW5kKGV2ZW50VHlwZSwgZGF0YSwgY2FuY2VsVW5zZW50ID0gZmFsc2UpIHtcbiAgICB0aGlzLnZpZXdlcl8uc2VuZE1lc3NhZ2UoZXZlbnRUeXBlLCBkYXRhLCBjYW5jZWxVbnNlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgJ2dldERvY3VtZW50U3RhdGUnIHZpZXdlciBtZXNzYWdlcy5cbiAgICogQHBhcmFtIHshT2JqZWN0PX0gZGF0YVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uR2V0RG9jdW1lbnRTdGF0ZV8oZGF0YSA9IHt9KSB7XG4gICAgY29uc3Qge3N0YXRlfSA9IGRhdGE7XG4gICAgY29uc3QgY29uZmlnID0gR0VUX1NUQVRFX0NPTkZJR1VSQVRJT05TW3N0YXRlXTtcblxuICAgIGlmICghY29uZmlnKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoYEludmFsaWQgJ3N0YXRlJyBwYXJhbWV0ZXJgKTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWU7XG5cbiAgICBzd2l0Y2ggKGNvbmZpZy5kYXRhU291cmNlKSB7XG4gICAgICBjYXNlIERhdGFTb3VyY2VzLlNUT1JFX1NFUlZJQ0U6XG4gICAgICAgIHZhbHVlID0gdGhpcy5zdG9yZVNlcnZpY2VfLmdldChjb25maWcucHJvcGVydHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGF0YVNvdXJjZXMuVkFSSUFCTEVfU0VSVklDRTpcbiAgICAgICAgdmFsdWUgPSB0aGlzLnZhcmlhYmxlU2VydmljZV8uZ2V0KClbY29uZmlnLnByb3BlcnR5XTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZXYoKS5lcnJvcihUQUcsICdVbmtub3duIGRhdGEgc291cmNlICVzLicsIGNvbmZpZy5kYXRhU291cmNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7c3RhdGUsIHZhbHVlfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyAnb25Eb2N1bWVudFN0YXRlJyB2aWV3ZXIgbWVzc2FnZXMuXG4gICAqIEBwYXJhbSB7IU9iamVjdD19IGRhdGFcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uT25Eb2N1bWVudFN0YXRlXyhkYXRhID0ge30pIHtcbiAgICBjb25zdCB7c3RhdGV9ID0gZGF0YTtcbiAgICBjb25zdCBjb25maWcgPSBHRVRfU1RBVEVfQ09ORklHVVJBVElPTlNbc3RhdGVdO1xuXG4gICAgaWYgKCFjb25maWcpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsIGBJbnZhbGlkICdzdGF0ZScgcGFyYW1ldGVyYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShjb25maWcucHJvcGVydHksICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy52aWV3ZXJfLnNlbmRNZXNzYWdlKFxuICAgICAgICAnZG9jdW1lbnRTdGF0ZVVwZGF0ZScsXG4gICAgICAgIGRpY3QoeydzdGF0ZSc6IHN0YXRlLCAndmFsdWUnOiB2YWx1ZX0pXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgJ3NldERvY3VtZW50U3RhdGUnIHZpZXdlciBtZXNzYWdlcy5cbiAgICogQHBhcmFtIHshT2JqZWN0PX0gZGF0YVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhT2JqZWN0fHVuZGVmaW5lZD59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblNldERvY3VtZW50U3RhdGVfKGRhdGEgPSB7fSkge1xuICAgIGNvbnN0IHtzdGF0ZSwgdmFsdWV9ID0gZGF0YTtcbiAgICBjb25zdCBjb25maWcgPSBTRVRfU1RBVEVfQ09ORklHVVJBVElPTlNbc3RhdGVdO1xuXG4gICAgaWYgKCFjb25maWcpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChgSW52YWxpZCAnc3RhdGUnIHBhcmFtZXRlcmApO1xuICAgIH1cblxuICAgIGlmICghY29uZmlnLmlzVmFsdWVWYWxpZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChgSW52YWxpZCAndmFsdWUnIHBhcmFtZXRlcmApO1xuICAgIH1cblxuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXy5kaXNwYXRjaChjb25maWcuYWN0aW9uLCB2YWx1ZSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtzdGF0ZSwgdmFsdWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzICdjdXN0b21Eb2N1bWVudFVJJyB2aWV3ZXIgbWVzc2FnZXMuXG4gICAqIEBwYXJhbSB7IU9iamVjdH0gZGF0YVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25DdXN0b21Eb2N1bWVudFVJXyhkYXRhKSB7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKFxuICAgICAgQWN0aW9uLlNFVF9WSUVXRVJfQ1VTVE9NX0NPTlRST0xTLFxuICAgICAgZGF0YS5jb250cm9sc1xuICAgICk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-viewer-messaging-handler.js