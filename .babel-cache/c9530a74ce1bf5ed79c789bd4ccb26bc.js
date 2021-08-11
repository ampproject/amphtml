function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { VariableSource, getNavigationData, getTimingDataAsync, getTimingDataSync } from "../../../src/service/variable-source";
import { user, userAssert } from "../../../src/log";
var ALLOWLISTED_VARIABLES = ['AMPDOC_HOST', 'AMPDOC_HOSTNAME', 'AMPDOC_URL', 'AMP_VERSION', 'AVAILABLE_SCREEN_HEIGHT', 'AVAILABLE_SCREEN_WIDTH', 'BACKGROUND_STATE', 'BROWSER_LANGUAGE', 'CANONICAL_HOST', 'CANONICAL_HOSTNAME', 'CANONICAL_PATH', 'CANONICAL_URL', 'COUNTER', 'DOCUMENT_CHARSET', 'DOCUMENT_REFERRER', 'PAGE_VIEW_ID', 'RANDOM', 'SCREEN_COLOR_DEPTH', 'SCREEN_HEIGHT', 'SCREEN_WIDTH', 'SCROLL_HEIGHT', 'SCROLL_WIDTH', 'SOURCE_HOST', 'SOURCE_HOSTNAME', 'SOURCE_PATH', 'SOURCE_URL', 'TIMESTAMP', 'TIMEZONE', 'TITLE', 'TOTAL_ENGAGED_TIME', 'USER_AGENT', 'VARIANT', 'VARIANTS', 'VIEWER', 'VIEWPORT_HEIGHT', 'VIEWPORT_WIDTH'];

/** Provides A4A specific variable substitution. */
export var A4AVariableSource = /*#__PURE__*/function (_VariableSource) {
  _inherits(A4AVariableSource, _VariableSource);

  var _super = _createSuper(A4AVariableSource);

  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} parentAmpdoc
   * @param  {!Window} embedWin
   */
  function A4AVariableSource(parentAmpdoc, embedWin) {
    var _this;

    _classCallCheck(this, A4AVariableSource);

    _this = _super.call(this, parentAmpdoc);
    // Use parent URL replacements service for fallback.
    var headNode = parentAmpdoc.getHeadNode();
    var urlReplacements = Services.urlReplacementsForDoc(headNode);

    /** @private {VariableSource} global variable source for fallback. */
    _this.globalVariableSource_ = urlReplacements.getVariableSource();

    /** @private {!Window} */
    _this.win_ = embedWin;
    return _this;
  }

  /** @override */
  _createClass(A4AVariableSource, [{
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      // Initiate allowed varaibles first in case the resolver function needs
      // to be overwritten.
      for (var v = 0; v < ALLOWLISTED_VARIABLES.length; v++) {
        var varName = ALLOWLISTED_VARIABLES[v];
        var resolvers = this.globalVariableSource_.get(varName);
        this.set(varName, resolvers.sync).setAsync(varName, resolvers.async);
      }

      this.set('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(startAttribute, 'The first argument to NAV_TIMING, the' + ' start attribute name, is required');
        return getTimingDataSync(_this2.win_,
        /**@type {string}*/
        startAttribute,
        /**@type {string}*/
        endAttribute);
      }).setAsync('NAV_TIMING', function (startAttribute, endAttribute) {
        userAssert(startAttribute, 'The first argument to NAV_TIMING, the' + ' start attribute name, is required');
        return getTimingDataAsync(_this2.win_,
        /**@type {string}*/
        startAttribute,
        /**@type {string}*/
        endAttribute);
      });
      this.set('NAV_TYPE', function () {
        return getNavigationData(_this2.win_, 'type');
      });
      this.set('NAV_REDIRECT_COUNT', function () {
        return getNavigationData(_this2.win_, 'redirectCount');
      });
      this.set('HTML_ATTR',
      /** @type {function(...*)} */
      this.htmlAttributeBinding_.bind(this));
      this.set('CLIENT_ID', function () {
        return null;
      });
    }
    /**
     * Provides a binding for getting attributes from the DOM.
     * Most such bindings are provided in src/service/url-replacements-impl, but
     * this one needs access to this.win_.document, which if the amp-analytics
     * tag is contained within an amp-ad tag will NOT be the parent/publisher
     * page. Hence the need to put it here.
     * @param {string} cssSelector Elements matching this selector will be
     *     included, provided they have at least one of the attributeNames
     *     set, up to a max of 10. May be URI encoded.
     * @param {...string} var_args Additional params will be the names of
     *     attributes whose values will be returned. There should be at least 1.
     * @return {string} A stringified JSON array containing one member for each
     *     matching element. Each member will contain the names and values of the
     *     specified attributes, if the corresponding element has that attribute.
     *     Note that if an element matches the cssSelected but has none of the
     *     requested attributes, then nothing will be included in the array
     *     for that element.
     */

  }, {
    key: "htmlAttributeBinding_",
    value: function htmlAttributeBinding_(cssSelector, var_args) {
      // Generate an error if cssSelector matches more than this many elements
      var HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE = 20;
      // Of the elements matched by cssSelector, see which contain one or more
      // of the specified attributes, and return an array of at most this many.
      var HTML_ATTR_MAX_ELEMENTS_TO_RETURN = 10;
      // Only allow at most this many attributeNames to be specified.
      var HTML_ATTR_MAX_ATTRS = 10;
      var TAG = 'A4AVariableSource';
      var attributeNames = Array.prototype.slice.call(arguments, 1);

      if (!cssSelector || !attributeNames.length) {
        return '[]';
      }

      if (attributeNames.length > HTML_ATTR_MAX_ATTRS) {
        user().error(TAG, "At most " + HTML_ATTR_MAX_ATTRS + " may be requested.");
        return '[]';
      }

      cssSelector = decodeURI(cssSelector);
      var elements;

      try {
        elements = this.win_.document.querySelectorAll(cssSelector);
      } catch (e) {
        user().error(TAG, "Invalid selector: " + cssSelector);
        return '[]';
      }

      if (elements.length > HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE) {
        user().error(TAG, 'CSS selector may match at most ' + (HTML_ATTR_MAX_ELEMENTS_TO_TRAVERSE + " elements."));
        return '[]';
      }

      var result = [];

      for (var i = 0; i < elements.length && result.length < HTML_ATTR_MAX_ELEMENTS_TO_RETURN; ++i) {
        var currentResult = {};
        var foundAtLeastOneAttr = false;

        for (var j = 0; j < attributeNames.length; ++j) {
          var attributeName = attributeNames[j];

          if (elements[i].hasAttribute(attributeName)) {
            currentResult[attributeName] = elements[i].getAttribute(attributeName);
            foundAtLeastOneAttr = true;
          }
        }

        if (foundAtLeastOneAttr) {
          result.push(currentResult);
        }
      }

      return JSON.stringify(result);
    }
  }]);

  return A4AVariableSource;
}(VariableSource);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImE0YS12YXJpYWJsZS1zb3VyY2UuanMiXSwibmFtZXMiOlsiU2VydmljZXMiLCJWYXJpYWJsZVNvdXJjZSIsImdldE5hdmlnYXRpb25EYXRhIiwiZ2V0VGltaW5nRGF0YUFzeW5jIiwiZ2V0VGltaW5nRGF0YVN5bmMiLCJ1c2VyIiwidXNlckFzc2VydCIsIkFMTE9XTElTVEVEX1ZBUklBQkxFUyIsIkE0QVZhcmlhYmxlU291cmNlIiwicGFyZW50QW1wZG9jIiwiZW1iZWRXaW4iLCJoZWFkTm9kZSIsImdldEhlYWROb2RlIiwidXJsUmVwbGFjZW1lbnRzIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwiZ2xvYmFsVmFyaWFibGVTb3VyY2VfIiwiZ2V0VmFyaWFibGVTb3VyY2UiLCJ3aW5fIiwidiIsImxlbmd0aCIsInZhck5hbWUiLCJyZXNvbHZlcnMiLCJnZXQiLCJzZXQiLCJzeW5jIiwic2V0QXN5bmMiLCJhc3luYyIsInN0YXJ0QXR0cmlidXRlIiwiZW5kQXR0cmlidXRlIiwiaHRtbEF0dHJpYnV0ZUJpbmRpbmdfIiwiYmluZCIsImNzc1NlbGVjdG9yIiwidmFyX2FyZ3MiLCJIVE1MX0FUVFJfTUFYX0VMRU1FTlRTX1RPX1RSQVZFUlNFIiwiSFRNTF9BVFRSX01BWF9FTEVNRU5UU19UT19SRVRVUk4iLCJIVE1MX0FUVFJfTUFYX0FUVFJTIiwiVEFHIiwiYXR0cmlidXRlTmFtZXMiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImVycm9yIiwiZGVjb2RlVVJJIiwiZWxlbWVudHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlIiwicmVzdWx0IiwiaSIsImN1cnJlbnRSZXN1bHQiLCJmb3VuZEF0TGVhc3RPbmVBdHRyIiwiaiIsImF0dHJpYnV0ZU5hbWUiLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJwdXNoIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7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QUFiLEdBQ0VULFFBQVEsQ0FBQ0ssQ0FBRCxDQUFSLENBQVlNLFlBQVosQ0FBeUJGLGFBQXpCLENBREY7QUFFQUYsWUFBQUEsbUJBQW1CLEdBQUcsSUFBdEI7QUFDRDtBQUNGOztBQUNELFlBQUlBLG1CQUFKLEVBQXlCO0FBQ3ZCSCxVQUFBQSxNQUFNLENBQUNRLElBQVAsQ0FBWU4sYUFBWjtBQUNEO0FBQ0Y7O0FBQ0QsYUFBT08sSUFBSSxDQUFDQyxTQUFMLENBQWVWLE1BQWYsQ0FBUDtBQUNEO0FBakpIOztBQUFBO0FBQUEsRUFBdUNoRCxjQUF2QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1xuICBWYXJpYWJsZVNvdXJjZSxcbiAgZ2V0TmF2aWdhdGlvbkRhdGEsXG4gIGdldFRpbWluZ0RhdGFBc3luYyxcbiAgZ2V0VGltaW5nRGF0YVN5bmMsXG59IGZyb20gJyNzZXJ2aWNlL3ZhcmlhYmxlLXNvdXJjZSc7XG5pbXBvcnQge3VzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG5jb25zdCBBTExPV0xJU1RFRF9WQVJJQUJMRVMgPSBbXG4gICdBTVBET0NfSE9TVCcsXG4gICdBTVBET0NfSE9TVE5BTUUnLFxuICAnQU1QRE9DX1VSTCcsXG4gICdBTVBfVkVSU0lPTicsXG4gICdBVkFJTEFCTEVfU0NSRUVOX0hFSUdIVCcsXG4gICdBVkFJTEFCTEVfU0NSRUVOX1dJRFRIJyxcbiAgJ0JBQ0tHUk9VTkRfU1RBVEUnLFxuICAnQlJPV1NFUl9MQU5HVUFHRScsXG4gICdDQU5PTklDQUxfSE9TVCcsXG4gICdDQU5PTklDQUxfSE9TVE5BTUUnLFxuICAnQ0FOT05JQ0FMX1BBVEgnLFxuICAnQ0FOT05JQ0FMX1VSTCcsXG4gICdDT1VOVEVSJyxcbiAgJ0RPQ1VNRU5UX0NIQVJTRVQnLFxuICAnRE9DVU1FTlRfUkVGRVJSRVInLFxuICAnUEFHRV9WSUVXX0lEJyxcbiAgJ1JBTkRPTScsXG4gICdTQ1JFRU5fQ09MT1JfREVQVEgnLFxuICAnU0NSRUVOX0hFSUdIVCcsXG4gICdTQ1JFRU5fV0lEVEgnLFxuICAnU0NST0xMX0hFSUdIVCcsXG4gICdTQ1JPTExfV0lEVEgnLFxuICAnU09VUkNFX0hPU1QnLFxuICAnU09VUkNFX0hPU1ROQU1FJyxcbiAgJ1NPVVJDRV9QQVRIJyxcbiAgJ1NPVVJDRV9VUkwnLFxuICAnVElNRVNUQU1QJyxcbiAgJ1RJTUVaT05FJyxcbiAgJ1RJVExFJyxcbiAgJ1RPVEFMX0VOR0FHRURfVElNRScsXG4gICdVU0VSX0FHRU5UJyxcbiAgJ1ZBUklBTlQnLFxuICAnVkFSSUFOVFMnLFxuICAnVklFV0VSJyxcbiAgJ1ZJRVdQT1JUX0hFSUdIVCcsXG4gICdWSUVXUE9SVF9XSURUSCcsXG5dO1xuXG4vKiogUHJvdmlkZXMgQTRBIHNwZWNpZmljIHZhcmlhYmxlIHN1YnN0aXR1dGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBBNEFWYXJpYWJsZVNvdXJjZSBleHRlbmRzIFZhcmlhYmxlU291cmNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSAgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IHBhcmVudEFtcGRvY1xuICAgKiBAcGFyYW0gIHshV2luZG93fSBlbWJlZFdpblxuICAgKi9cbiAgY29uc3RydWN0b3IocGFyZW50QW1wZG9jLCBlbWJlZFdpbikge1xuICAgIHN1cGVyKHBhcmVudEFtcGRvYyk7XG5cbiAgICAvLyBVc2UgcGFyZW50IFVSTCByZXBsYWNlbWVudHMgc2VydmljZSBmb3IgZmFsbGJhY2suXG4gICAgY29uc3QgaGVhZE5vZGUgPSBwYXJlbnRBbXBkb2MuZ2V0SGVhZE5vZGUoKTtcbiAgICBjb25zdCB1cmxSZXBsYWNlbWVudHMgPSBTZXJ2aWNlcy51cmxSZXBsYWNlbWVudHNGb3JEb2MoaGVhZE5vZGUpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtWYXJpYWJsZVNvdXJjZX0gZ2xvYmFsIHZhcmlhYmxlIHNvdXJjZSBmb3IgZmFsbGJhY2suICovXG4gICAgdGhpcy5nbG9iYWxWYXJpYWJsZVNvdXJjZV8gPSB1cmxSZXBsYWNlbWVudHMuZ2V0VmFyaWFibGVTb3VyY2UoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbl8gPSBlbWJlZFdpbjtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICAvLyBJbml0aWF0ZSBhbGxvd2VkIHZhcmFpYmxlcyBmaXJzdCBpbiBjYXNlIHRoZSByZXNvbHZlciBmdW5jdGlvbiBuZWVkc1xuICAgIC8vIHRvIGJlIG92ZXJ3cml0dGVuLlxuICAgIGZvciAobGV0IHYgPSAwOyB2IDwgQUxMT1dMSVNURURfVkFSSUFCTEVTLmxlbmd0aDsgdisrKSB7XG4gICAgICBjb25zdCB2YXJOYW1lID0gQUxMT1dMSVNURURfVkFSSUFCTEVTW3ZdO1xuICAgICAgY29uc3QgcmVzb2x2ZXJzID0gdGhpcy5nbG9iYWxWYXJpYWJsZVNvdXJjZV8uZ2V0KHZhck5hbWUpO1xuICAgICAgdGhpcy5zZXQodmFyTmFtZSwgcmVzb2x2ZXJzLnN5bmMpLnNldEFzeW5jKHZhck5hbWUsIHJlc29sdmVycy5hc3luYyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXQoJ05BVl9USU1JTkcnLCAoc3RhcnRBdHRyaWJ1dGUsIGVuZEF0dHJpYnV0ZSkgPT4ge1xuICAgICAgdXNlckFzc2VydChcbiAgICAgICAgc3RhcnRBdHRyaWJ1dGUsXG4gICAgICAgICdUaGUgZmlyc3QgYXJndW1lbnQgdG8gTkFWX1RJTUlORywgdGhlJyArXG4gICAgICAgICAgJyBzdGFydCBhdHRyaWJ1dGUgbmFtZSwgaXMgcmVxdWlyZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuIGdldFRpbWluZ0RhdGFTeW5jKFxuICAgICAgICB0aGlzLndpbl8sXG4gICAgICAgIC8qKkB0eXBlIHtzdHJpbmd9Ki8gKHN0YXJ0QXR0cmlidXRlKSxcbiAgICAgICAgLyoqQHR5cGUge3N0cmluZ30qLyAoZW5kQXR0cmlidXRlKVxuICAgICAgKTtcbiAgICB9KS5zZXRBc3luYygnTkFWX1RJTUlORycsIChzdGFydEF0dHJpYnV0ZSwgZW5kQXR0cmlidXRlKSA9PiB7XG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICBzdGFydEF0dHJpYnV0ZSxcbiAgICAgICAgJ1RoZSBmaXJzdCBhcmd1bWVudCB0byBOQVZfVElNSU5HLCB0aGUnICtcbiAgICAgICAgICAnIHN0YXJ0IGF0dHJpYnV0ZSBuYW1lLCBpcyByZXF1aXJlZCdcbiAgICAgICk7XG4gICAgICByZXR1cm4gZ2V0VGltaW5nRGF0YUFzeW5jKFxuICAgICAgICB0aGlzLndpbl8sXG4gICAgICAgIC8qKkB0eXBlIHtzdHJpbmd9Ki8gKHN0YXJ0QXR0cmlidXRlKSxcbiAgICAgICAgLyoqQHR5cGUge3N0cmluZ30qLyAoZW5kQXR0cmlidXRlKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0KCdOQVZfVFlQRScsICgpID0+IHtcbiAgICAgIHJldHVybiBnZXROYXZpZ2F0aW9uRGF0YSh0aGlzLndpbl8sICd0eXBlJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldCgnTkFWX1JFRElSRUNUX0NPVU5UJywgKCkgPT4ge1xuICAgICAgcmV0dXJuIGdldE5hdmlnYXRpb25EYXRhKHRoaXMud2luXywgJ3JlZGlyZWN0Q291bnQnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0KFxuICAgICAgJ0hUTUxfQVRUUicsXG4gICAgICAvKiogQHR5cGUge2Z1bmN0aW9uKC4uLiopfSAqLyAodGhpcy5odG1sQXR0cmlidXRlQmluZGluZ18uYmluZCh0aGlzKSlcbiAgICApO1xuXG4gICAgdGhpcy5zZXQoJ0NMSUVOVF9JRCcsICgpID0+IG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgYmluZGluZyBmb3IgZ2V0dGluZyBhdHRyaWJ1dGVzIGZyb20gdGhlIERPTS5cbiAgICogTW9zdCBzdWNoIGJpbmRpbmdzIGFyZSBwcm92aWRlZCBpbiBzcmMvc2VydmljZS91cmwtcmVwbGFjZW1lbnRzLWltcGwsIGJ1dFxuICAgKiB0aGlzIG9uZSBuZWVkcyBhY2Nlc3MgdG8gdGhpcy53aW5fLmRvY3VtZW50LCB3aGljaCBpZiB0aGUgYW1wLWFuYWx5dGljc1xuICAgKiB0YWcgaXMgY29udGFpbmVkIHdpdGhpbiBhbiBhbXAtYWQgdGFnIHdpbGwgTk9UIGJlIHRoZSBwYXJlbnQvcHVibGlzaGVyXG4gICAqIHBhZ2UuIEhlbmNlIHRoZSBuZWVkIHRvIHB1dCBpdCBoZXJlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY3NzU2VsZWN0b3IgRWxlbWVudHMgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvciB3aWxsIGJlXG4gICAqICAgICBpbmNsdWRlZCwgcHJvdmlkZWQgdGhleSBoYXZlIGF0IGxlYXN0IG9uZSBvZiB0aGUgYXR0cmlidXRlTmFtZXNcbiAgICogICAgIHNldCwgdXAgdG8gYSBtYXggb2YgMTAuIE1heSBiZSBVUkkgZW5jb2RlZC5cbiAgICogQHBhcmFtIHsuLi5zdHJpbmd9IHZhcl9hcmdzIEFkZGl0aW9uYWwgcGFyYW1zIHdpbGwgYmUgdGhlIG5hbWVzIG9mXG4gICAqICAgICBhdHRyaWJ1dGVzIHdob3NlIHZhbHVlcyB3aWxsIGJlIHJldHVybmVkLiBUaGVyZSBzaG91bGQgYmUgYXQgbGVhc3QgMS5cbiAgICogQHJldHVybiB7c3RyaW5nfSBBIHN0cmluZ2lmaWVkIEpTT04gYXJyYXkgY29udGFpbmluZyBvbmUgbWVtYmVyIGZvciBlYWNoXG4gICAqICAgICBtYXRjaGluZyBlbGVtZW50LiBFYWNoIG1lbWJlciB3aWxsIGNvbnRhaW4gdGhlIG5hbWVzIGFuZCB2YWx1ZXMgb2YgdGhlXG4gICAqICAgICBzcGVjaWZpZWQgYXR0cmlidXRlcywgaWYgdGhlIGNvcnJlc3BvbmRpbmcgZWxlbWVudCBoYXMgdGhhdCBhdHRyaWJ1dGUuXG4gICAqICAgICBOb3RlIHRoYXQgaWYgYW4gZWxlbWVudCBtYXRjaGVzIHRoZSBjc3NTZWxlY3RlZCBidXQgaGFzIG5vbmUgb2YgdGhlXG4gICAqICAgICByZXF1ZXN0ZWQgYXR0cmlidXRlcywgdGhlbiBub3RoaW5nIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIGFycmF5XG4gICAqICAgICBmb3IgdGhhdCBlbGVtZW50LlxuICAgKi9cbiAgaHRtbEF0dHJpYnV0ZUJpbmRpbmdfKGNzc1NlbGVjdG9yLCB2YXJfYXJncykge1xuICAgIC8vIEdlbmVyYXRlIGFuIGVycm9yIGlmIGNzc1NlbGVjdG9yIG1hdGNoZXMgbW9yZSB0aGFuIHRoaXMgbWFueSBlbGVtZW50c1xuICAgIGNvbnN0IEhUTUxfQVRUUl9NQVhfRUxFTUVOVFNfVE9fVFJBVkVSU0UgPSAyMDtcblxuICAgIC8vIE9mIHRoZSBlbGVtZW50cyBtYXRjaGVkIGJ5IGNzc1NlbGVjdG9yLCBzZWUgd2hpY2ggY29udGFpbiBvbmUgb3IgbW9yZVxuICAgIC8vIG9mIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlcywgYW5kIHJldHVybiBhbiBhcnJheSBvZiBhdCBtb3N0IHRoaXMgbWFueS5cbiAgICBjb25zdCBIVE1MX0FUVFJfTUFYX0VMRU1FTlRTX1RPX1JFVFVSTiA9IDEwO1xuXG4gICAgLy8gT25seSBhbGxvdyBhdCBtb3N0IHRoaXMgbWFueSBhdHRyaWJ1dGVOYW1lcyB0byBiZSBzcGVjaWZpZWQuXG4gICAgY29uc3QgSFRNTF9BVFRSX01BWF9BVFRSUyA9IDEwO1xuXG4gICAgY29uc3QgVEFHID0gJ0E0QVZhcmlhYmxlU291cmNlJztcblxuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoIWNzc1NlbGVjdG9yIHx8ICFhdHRyaWJ1dGVOYW1lcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAnW10nO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlTmFtZXMubGVuZ3RoID4gSFRNTF9BVFRSX01BWF9BVFRSUykge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgYEF0IG1vc3QgJHtIVE1MX0FUVFJfTUFYX0FUVFJTfSBtYXkgYmUgcmVxdWVzdGVkLmApO1xuICAgICAgcmV0dXJuICdbXSc7XG4gICAgfVxuICAgIGNzc1NlbGVjdG9yID0gZGVjb2RlVVJJKGNzc1NlbGVjdG9yKTtcbiAgICBsZXQgZWxlbWVudHM7XG4gICAgdHJ5IHtcbiAgICAgIGVsZW1lbnRzID0gdGhpcy53aW5fLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY3NzU2VsZWN0b3IpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsIGBJbnZhbGlkIHNlbGVjdG9yOiAke2Nzc1NlbGVjdG9yfWApO1xuICAgICAgcmV0dXJuICdbXSc7XG4gICAgfVxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggPiBIVE1MX0FUVFJfTUFYX0VMRU1FTlRTX1RPX1RSQVZFUlNFKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ0NTUyBzZWxlY3RvciBtYXkgbWF0Y2ggYXQgbW9zdCAnICtcbiAgICAgICAgICBgJHtIVE1MX0FUVFJfTUFYX0VMRU1FTlRTX1RPX1RSQVZFUlNFfSBlbGVtZW50cy5gXG4gICAgICApO1xuICAgICAgcmV0dXJuICdbXSc7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoXG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBpIDwgZWxlbWVudHMubGVuZ3RoICYmIHJlc3VsdC5sZW5ndGggPCBIVE1MX0FUVFJfTUFYX0VMRU1FTlRTX1RPX1JFVFVSTjtcbiAgICAgICsraVxuICAgICkge1xuICAgICAgY29uc3QgY3VycmVudFJlc3VsdCA9IHt9O1xuICAgICAgbGV0IGZvdW5kQXRMZWFzdE9uZUF0dHIgPSBmYWxzZTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYXR0cmlidXRlTmFtZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IGF0dHJpYnV0ZU5hbWVzW2pdO1xuICAgICAgICBpZiAoZWxlbWVudHNbaV0uaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICAgICAgY3VycmVudFJlc3VsdFthdHRyaWJ1dGVOYW1lXSA9XG4gICAgICAgICAgICBlbGVtZW50c1tpXS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG4gICAgICAgICAgZm91bmRBdExlYXN0T25lQXR0ciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZEF0TGVhc3RPbmVBdHRyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGN1cnJlbnRSZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVzdWx0KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-a4a/0.1/a4a-variable-source.js