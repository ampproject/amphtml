function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { closest } from "../../core/dom/query";
import { Services } from "./..";
import { LocalizedStringBundleDef // The LocalizedStringId type is imported even though it is not used because
// the compiler does not output types for enums, but we want to distinguish
// between LocalizedStringId enum values and any other strings.
// eslint-disable-next-line no-unused-vars
, LocalizedStringId } from "./strings";

/**
 * Language code used if there is no language code specified by the document.
 * @const {string}
 */
var FALLBACK_LANGUAGE_CODE = 'default';

/**
 * @const {!RegExp}
 */
var LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;

/**
 * Gets the string matching the specified localized string ID in the language
 * specified.
 * @param {!Object<string, !LocalizedStringBundleDef>} localizedStringBundles
 * @param {!Array<string>} languageCodes
 * @param {!LocalizedStringId} localizedStringId
 * @return {?string}
 */
function findLocalizedString(localizedStringBundles, languageCodes, localizedStringId) {
  var localizedString = null;
  languageCodes.some(function (languageCode) {
    var localizedStringBundle = localizedStringBundles[languageCode];

    if (localizedStringBundle && localizedStringBundle[localizedStringId]) {
      localizedString = localizedStringBundle[localizedStringId].string || localizedStringBundle[localizedStringId].fallback;
      return !!localizedString;
    }

    return false;
  });
  return localizedString;
}

/**
 * @param {string} languageCode
 * @return {!Array<string>} A list of language codes.
 * @visibleForTesting
 */
export function getLanguageCodesFromString(languageCode) {
  if (!languageCode) {
    return ['en', FALLBACK_LANGUAGE_CODE];
  }

  var matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce(function (fallbackLanguageCodeList, chunk, index) {
    var fallbackLanguageCode = matches.slice(0, index + 1).join('-').toLowerCase();
    fallbackLanguageCodeList.unshift(fallbackLanguageCode);
    return fallbackLanguageCodeList;
  }, [FALLBACK_LANGUAGE_CODE]);
}

/**
 * Localization service.
 */
export var LocalizationService = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   */
  function LocalizationService(element) {
    _classCallCheck(this, LocalizationService);

    this.element_ = element;

    /**
     * @private @const {?string}
     */
    this.viewerLanguageCode_ = Services.viewerForDoc(element).getParam('lang');

    /**
     * A mapping of language code to localized string bundle.
     * @private @const {!Object<string, !LocalizedStringBundleDef>}
     */
    this.localizedStringBundles_ = {};
  }

  /**
   * @param {!Element} element
   * @return {!Array<string>}
   * @private
   */
  _createClass(LocalizationService, [{
    key: "getLanguageCodesForElement_",
    value: function getLanguageCodesForElement_(element) {
      var languageEl = closest(element, function (el) {
        return el.hasAttribute('lang');
      });
      var languageCode = languageEl ? languageEl.getAttribute('lang') : null;
      var languageCodesToUse = getLanguageCodesFromString(languageCode || '');

      if (this.viewerLanguageCode_) {
        languageCodesToUse.unshift(this.viewerLanguageCode_);
      }

      return languageCodesToUse;
    }
    /**
     * @param {string} languageCode The language code to associate with the
     *     specified localized string bundle.
     * @param {!LocalizedStringBundleDef} localizedStringBundle
     *     The localized string bundle to register.
     * @return {!LocalizationService} For chaining.
     */

  }, {
    key: "registerLocalizedStringBundle",
    value: function registerLocalizedStringBundle(languageCode, localizedStringBundle) {
      var normalizedLangCode = languageCode.toLowerCase();

      if (!this.localizedStringBundles_[normalizedLangCode]) {
        this.localizedStringBundles_[normalizedLangCode] = {};
      }

      Object.assign(this.localizedStringBundles_[normalizedLangCode], localizedStringBundle);
      return this;
    }
    /**
     * @param {!LocalizedStringId} localizedStringId
     * @param {!Element=} elementToUse The element where the string will be
     *     used.  The language is based on the language at that part of the
     *     document.  If unspecified, will use the document-level language, if
     *     one exists, or the default otherwise.
     * @return {?string}
     */

  }, {
    key: "getLocalizedString",
    value: function getLocalizedString(localizedStringId, elementToUse) {
      if (elementToUse === void 0) {
        elementToUse = this.element_;
      }

      var languageCodes = this.getLanguageCodesForElement_(elementToUse);
      return findLocalizedString(this.localizedStringBundles_, languageCodes, localizedStringId);
    }
  }]);

  return LocalizationService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImNsb3Nlc3QiLCJTZXJ2aWNlcyIsIkxvY2FsaXplZFN0cmluZ0J1bmRsZURlZiIsIkxvY2FsaXplZFN0cmluZ0lkIiwiRkFMTEJBQ0tfTEFOR1VBR0VfQ09ERSIsIkxBTkdVQUdFX0NPREVfQ0hVTktfUkVHRVgiLCJmaW5kTG9jYWxpemVkU3RyaW5nIiwibG9jYWxpemVkU3RyaW5nQnVuZGxlcyIsImxhbmd1YWdlQ29kZXMiLCJsb2NhbGl6ZWRTdHJpbmdJZCIsImxvY2FsaXplZFN0cmluZyIsInNvbWUiLCJsYW5ndWFnZUNvZGUiLCJsb2NhbGl6ZWRTdHJpbmdCdW5kbGUiLCJzdHJpbmciLCJmYWxsYmFjayIsImdldExhbmd1YWdlQ29kZXNGcm9tU3RyaW5nIiwibWF0Y2hlcyIsIm1hdGNoIiwicmVkdWNlIiwiZmFsbGJhY2tMYW5ndWFnZUNvZGVMaXN0IiwiY2h1bmsiLCJpbmRleCIsImZhbGxiYWNrTGFuZ3VhZ2VDb2RlIiwic2xpY2UiLCJqb2luIiwidG9Mb3dlckNhc2UiLCJ1bnNoaWZ0IiwiTG9jYWxpemF0aW9uU2VydmljZSIsImVsZW1lbnQiLCJlbGVtZW50XyIsInZpZXdlckxhbmd1YWdlQ29kZV8iLCJ2aWV3ZXJGb3JEb2MiLCJnZXRQYXJhbSIsImxvY2FsaXplZFN0cmluZ0J1bmRsZXNfIiwibGFuZ3VhZ2VFbCIsImVsIiwiaGFzQXR0cmlidXRlIiwiZ2V0QXR0cmlidXRlIiwibGFuZ3VhZ2VDb2Rlc1RvVXNlIiwibm9ybWFsaXplZExhbmdDb2RlIiwiT2JqZWN0IiwiYXNzaWduIiwiZWxlbWVudFRvVXNlIiwiZ2V0TGFuZ3VhZ2VDb2Rlc0ZvckVsZW1lbnRfIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxPQUFSO0FBRUEsU0FBUUMsUUFBUjtBQUVBLFNBQ0VD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QVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTFDQTtBQUFBO0FBQUEsV0EyQ0UsdUNBQThCM0IsWUFBOUIsRUFBNENDLHFCQUE1QyxFQUFtRTtBQUNqRSxVQUFNMkIsa0JBQWtCLEdBQUc1QixZQUFZLENBQUNjLFdBQWIsRUFBM0I7O0FBQ0EsVUFBSSxDQUFDLEtBQUtRLHVCQUFMLENBQTZCTSxrQkFBN0IsQ0FBTCxFQUF1RDtBQUNyRCxhQUFLTix1QkFBTCxDQUE2Qk0sa0JBQTdCLElBQW1ELEVBQW5EO0FBQ0Q7O0FBRURDLE1BQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUNFLEtBQUtSLHVCQUFMLENBQTZCTSxrQkFBN0IsQ0FERixFQUVFM0IscUJBRkY7QUFJQSxhQUFPLElBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBL0RBO0FBQUE7QUFBQSxXQWdFRSw0QkFBbUJKLGlCQUFuQixFQUFzQ2tDLFlBQXRDLEVBQW9FO0FBQUEsVUFBOUJBLFlBQThCO0FBQTlCQSxRQUFBQSxZQUE4QixHQUFmLEtBQUtiLFFBQVU7QUFBQTs7QUFDbEUsVUFBTXRCLGFBQWEsR0FBRyxLQUFLb0MsMkJBQUwsQ0FBaUNELFlBQWpDLENBQXRCO0FBRUEsYUFBT3JDLG1CQUFtQixDQUN4QixLQUFLNEIsdUJBRG1CLEVBRXhCMUIsYUFGd0IsRUFHeEJDLGlCQUh3QixDQUExQjtBQUtEO0FBeEVIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge1xuICBMb2NhbGl6ZWRTdHJpbmdCdW5kbGVEZWYsXG4gIC8vIFRoZSBMb2NhbGl6ZWRTdHJpbmdJZCB0eXBlIGlzIGltcG9ydGVkIGV2ZW4gdGhvdWdoIGl0IGlzIG5vdCB1c2VkIGJlY2F1c2VcbiAgLy8gdGhlIGNvbXBpbGVyIGRvZXMgbm90IG91dHB1dCB0eXBlcyBmb3IgZW51bXMsIGJ1dCB3ZSB3YW50IHRvIGRpc3Rpbmd1aXNoXG4gIC8vIGJldHdlZW4gTG9jYWxpemVkU3RyaW5nSWQgZW51bSB2YWx1ZXMgYW5kIGFueSBvdGhlciBzdHJpbmdzLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgTG9jYWxpemVkU3RyaW5nSWQsXG59IGZyb20gJy4vc3RyaW5ncyc7XG5cbi8qKlxuICogTGFuZ3VhZ2UgY29kZSB1c2VkIGlmIHRoZXJlIGlzIG5vIGxhbmd1YWdlIGNvZGUgc3BlY2lmaWVkIGJ5IHRoZSBkb2N1bWVudC5cbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5jb25zdCBGQUxMQkFDS19MQU5HVUFHRV9DT0RFID0gJ2RlZmF1bHQnO1xuXG4vKipcbiAqIEBjb25zdCB7IVJlZ0V4cH1cbiAqL1xuY29uc3QgTEFOR1VBR0VfQ09ERV9DSFVOS19SRUdFWCA9IC9cXHcrL2dpO1xuXG4vKipcbiAqIEdldHMgdGhlIHN0cmluZyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIGxvY2FsaXplZCBzdHJpbmcgSUQgaW4gdGhlIGxhbmd1YWdlXG4gKiBzcGVjaWZpZWQuXG4gKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCAhTG9jYWxpemVkU3RyaW5nQnVuZGxlRGVmPn0gbG9jYWxpemVkU3RyaW5nQnVuZGxlc1xuICogQHBhcmFtIHshQXJyYXk8c3RyaW5nPn0gbGFuZ3VhZ2VDb2Rlc1xuICogQHBhcmFtIHshTG9jYWxpemVkU3RyaW5nSWR9IGxvY2FsaXplZFN0cmluZ0lkXG4gKiBAcmV0dXJuIHs/c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmaW5kTG9jYWxpemVkU3RyaW5nKFxuICBsb2NhbGl6ZWRTdHJpbmdCdW5kbGVzLFxuICBsYW5ndWFnZUNvZGVzLFxuICBsb2NhbGl6ZWRTdHJpbmdJZFxuKSB7XG4gIGxldCBsb2NhbGl6ZWRTdHJpbmcgPSBudWxsO1xuXG4gIGxhbmd1YWdlQ29kZXMuc29tZSgobGFuZ3VhZ2VDb2RlKSA9PiB7XG4gICAgY29uc3QgbG9jYWxpemVkU3RyaW5nQnVuZGxlID0gbG9jYWxpemVkU3RyaW5nQnVuZGxlc1tsYW5ndWFnZUNvZGVdO1xuICAgIGlmIChsb2NhbGl6ZWRTdHJpbmdCdW5kbGUgJiYgbG9jYWxpemVkU3RyaW5nQnVuZGxlW2xvY2FsaXplZFN0cmluZ0lkXSkge1xuICAgICAgbG9jYWxpemVkU3RyaW5nID1cbiAgICAgICAgbG9jYWxpemVkU3RyaW5nQnVuZGxlW2xvY2FsaXplZFN0cmluZ0lkXS5zdHJpbmcgfHxcbiAgICAgICAgbG9jYWxpemVkU3RyaW5nQnVuZGxlW2xvY2FsaXplZFN0cmluZ0lkXS5mYWxsYmFjaztcbiAgICAgIHJldHVybiAhIWxvY2FsaXplZFN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiBsb2NhbGl6ZWRTdHJpbmc7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGxhbmd1YWdlQ29kZVxuICogQHJldHVybiB7IUFycmF5PHN0cmluZz59IEEgbGlzdCBvZiBsYW5ndWFnZSBjb2Rlcy5cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2VDb2Rlc0Zyb21TdHJpbmcobGFuZ3VhZ2VDb2RlKSB7XG4gIGlmICghbGFuZ3VhZ2VDb2RlKSB7XG4gICAgcmV0dXJuIFsnZW4nLCBGQUxMQkFDS19MQU5HVUFHRV9DT0RFXTtcbiAgfVxuICBjb25zdCBtYXRjaGVzID0gbGFuZ3VhZ2VDb2RlLm1hdGNoKExBTkdVQUdFX0NPREVfQ0hVTktfUkVHRVgpIHx8IFtdO1xuICByZXR1cm4gbWF0Y2hlcy5yZWR1Y2UoXG4gICAgKGZhbGxiYWNrTGFuZ3VhZ2VDb2RlTGlzdCwgY2h1bmssIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBmYWxsYmFja0xhbmd1YWdlQ29kZSA9IG1hdGNoZXNcbiAgICAgICAgLnNsaWNlKDAsIGluZGV4ICsgMSlcbiAgICAgICAgLmpvaW4oJy0nKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICAgIGZhbGxiYWNrTGFuZ3VhZ2VDb2RlTGlzdC51bnNoaWZ0KGZhbGxiYWNrTGFuZ3VhZ2VDb2RlKTtcbiAgICAgIHJldHVybiBmYWxsYmFja0xhbmd1YWdlQ29kZUxpc3Q7XG4gICAgfSxcbiAgICBbRkFMTEJBQ0tfTEFOR1VBR0VfQ09ERV1cbiAgKTtcbn1cblxuLyoqXG4gKiBMb2NhbGl6YXRpb24gc2VydmljZS5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsaXphdGlvblNlcnZpY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudF8gPSBlbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHs/c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMudmlld2VyTGFuZ3VhZ2VDb2RlXyA9IFNlcnZpY2VzLnZpZXdlckZvckRvYyhlbGVtZW50KS5nZXRQYXJhbSgnbGFuZycpO1xuXG4gICAgLyoqXG4gICAgICogQSBtYXBwaW5nIG9mIGxhbmd1YWdlIGNvZGUgdG8gbG9jYWxpemVkIHN0cmluZyBidW5kbGUuXG4gICAgICogQHByaXZhdGUgQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUxvY2FsaXplZFN0cmluZ0J1bmRsZURlZj59XG4gICAgICovXG4gICAgdGhpcy5sb2NhbGl6ZWRTdHJpbmdCdW5kbGVzXyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7IUFycmF5PHN0cmluZz59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRMYW5ndWFnZUNvZGVzRm9yRWxlbWVudF8oZWxlbWVudCkge1xuICAgIGNvbnN0IGxhbmd1YWdlRWwgPSBjbG9zZXN0KGVsZW1lbnQsIChlbCkgPT4gZWwuaGFzQXR0cmlidXRlKCdsYW5nJykpO1xuICAgIGNvbnN0IGxhbmd1YWdlQ29kZSA9IGxhbmd1YWdlRWwgPyBsYW5ndWFnZUVsLmdldEF0dHJpYnV0ZSgnbGFuZycpIDogbnVsbDtcbiAgICBjb25zdCBsYW5ndWFnZUNvZGVzVG9Vc2UgPSBnZXRMYW5ndWFnZUNvZGVzRnJvbVN0cmluZyhsYW5ndWFnZUNvZGUgfHwgJycpO1xuXG4gICAgaWYgKHRoaXMudmlld2VyTGFuZ3VhZ2VDb2RlXykge1xuICAgICAgbGFuZ3VhZ2VDb2Rlc1RvVXNlLnVuc2hpZnQodGhpcy52aWV3ZXJMYW5ndWFnZUNvZGVfKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGFuZ3VhZ2VDb2Rlc1RvVXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZUNvZGUgVGhlIGxhbmd1YWdlIGNvZGUgdG8gYXNzb2NpYXRlIHdpdGggdGhlXG4gICAqICAgICBzcGVjaWZpZWQgbG9jYWxpemVkIHN0cmluZyBidW5kbGUuXG4gICAqIEBwYXJhbSB7IUxvY2FsaXplZFN0cmluZ0J1bmRsZURlZn0gbG9jYWxpemVkU3RyaW5nQnVuZGxlXG4gICAqICAgICBUaGUgbG9jYWxpemVkIHN0cmluZyBidW5kbGUgdG8gcmVnaXN0ZXIuXG4gICAqIEByZXR1cm4geyFMb2NhbGl6YXRpb25TZXJ2aWNlfSBGb3IgY2hhaW5pbmcuXG4gICAqL1xuICByZWdpc3RlckxvY2FsaXplZFN0cmluZ0J1bmRsZShsYW5ndWFnZUNvZGUsIGxvY2FsaXplZFN0cmluZ0J1bmRsZSkge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRMYW5nQ29kZSA9IGxhbmd1YWdlQ29kZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICghdGhpcy5sb2NhbGl6ZWRTdHJpbmdCdW5kbGVzX1tub3JtYWxpemVkTGFuZ0NvZGVdKSB7XG4gICAgICB0aGlzLmxvY2FsaXplZFN0cmluZ0J1bmRsZXNfW25vcm1hbGl6ZWRMYW5nQ29kZV0gPSB7fTtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKFxuICAgICAgdGhpcy5sb2NhbGl6ZWRTdHJpbmdCdW5kbGVzX1tub3JtYWxpemVkTGFuZ0NvZGVdLFxuICAgICAgbG9jYWxpemVkU3RyaW5nQnVuZGxlXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFMb2NhbGl6ZWRTdHJpbmdJZH0gbG9jYWxpemVkU3RyaW5nSWRcbiAgICogQHBhcmFtIHshRWxlbWVudD19IGVsZW1lbnRUb1VzZSBUaGUgZWxlbWVudCB3aGVyZSB0aGUgc3RyaW5nIHdpbGwgYmVcbiAgICogICAgIHVzZWQuICBUaGUgbGFuZ3VhZ2UgaXMgYmFzZWQgb24gdGhlIGxhbmd1YWdlIGF0IHRoYXQgcGFydCBvZiB0aGVcbiAgICogICAgIGRvY3VtZW50LiAgSWYgdW5zcGVjaWZpZWQsIHdpbGwgdXNlIHRoZSBkb2N1bWVudC1sZXZlbCBsYW5ndWFnZSwgaWZcbiAgICogICAgIG9uZSBleGlzdHMsIG9yIHRoZSBkZWZhdWx0IG90aGVyd2lzZS5cbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICovXG4gIGdldExvY2FsaXplZFN0cmluZyhsb2NhbGl6ZWRTdHJpbmdJZCwgZWxlbWVudFRvVXNlID0gdGhpcy5lbGVtZW50Xykge1xuICAgIGNvbnN0IGxhbmd1YWdlQ29kZXMgPSB0aGlzLmdldExhbmd1YWdlQ29kZXNGb3JFbGVtZW50XyhlbGVtZW50VG9Vc2UpO1xuXG4gICAgcmV0dXJuIGZpbmRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgICB0aGlzLmxvY2FsaXplZFN0cmluZ0J1bmRsZXNfLFxuICAgICAgbGFuZ3VhZ2VDb2RlcyxcbiAgICAgIGxvY2FsaXplZFN0cmluZ0lkXG4gICAgKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/localization/index.js