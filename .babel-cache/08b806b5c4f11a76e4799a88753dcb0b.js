function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import {
LocalizedStringBundleDef
// The LocalizedStringId type is imported even though it is not used because
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
function findLocalizedString(
localizedStringBundles,
languageCodes,
localizedStringId)
{
  var localizedString = null;

  languageCodes.some(function (languageCode) {
    var localizedStringBundle = localizedStringBundles[languageCode];
    if (localizedStringBundle && localizedStringBundle[localizedStringId]) {
      localizedString =
      localizedStringBundle[localizedStringId].string ||
      localizedStringBundle[localizedStringId].fallback;
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
  return matches.reduce(
  function (fallbackLanguageCodeList, chunk, index) {
    var fallbackLanguageCode = matches.
    slice(0, index + 1).
    join('-').
    toLowerCase();
    fallbackLanguageCodeList.unshift(fallbackLanguageCode);
    return fallbackLanguageCodeList;
  },
  [FALLBACK_LANGUAGE_CODE]);

}

/**
 * Localization service.
 */
export var LocalizationService = /*#__PURE__*/function () {
  /**
   * @param {!Element} element
   */
  function LocalizationService(element) {_classCallCheck(this, LocalizationService);
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
   */_createClass(LocalizationService, [{ key: "getLanguageCodesForElement_", value:
    function getLanguageCodesForElement_(element) {
      var languageEl = closest(element, function (el) {return el.hasAttribute('lang');});
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
     */ }, { key: "registerLocalizedStringBundle", value:
    function registerLocalizedStringBundle(languageCode, localizedStringBundle) {
      var normalizedLangCode = languageCode.toLowerCase();
      if (!this.localizedStringBundles_[normalizedLangCode]) {
        this.localizedStringBundles_[normalizedLangCode] = {};
      }

      Object.assign(
      this.localizedStringBundles_[normalizedLangCode],
      localizedStringBundle);

      return this;
    }

    /**
     * @param {!LocalizedStringId} localizedStringId
     * @param {!Element=} elementToUse The element where the string will be
     *     used.  The language is based on the language at that part of the
     *     document.  If unspecified, will use the document-level language, if
     *     one exists, or the default otherwise.
     * @return {?string}
     */ }, { key: "getLocalizedString", value:
    function getLocalizedString(localizedStringId) {var elementToUse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.element_;
      var languageCodes = this.getLanguageCodesForElement_(elementToUse);

      return findLocalizedString(
      this.localizedStringBundles_,
      languageCodes,
      localizedStringId);

    } }]);return LocalizationService;}();
// /Users/mszylkowski/src/amphtml/src/service/localization/index.js