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
import {closest} from '../dom';


/**
 * Language code used if there is no language code specified by the document.
 * @const {string}
 */
const FALLBACK_LANGUAGE_CODE = 'default';


/**
 * @const {!RegExp}
 */
const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;


/**
 * Gets the string matching the specified localized string ID in the language
 * specified.
 * @param {!Object<string, !../localized-strings.LocalizedStringBundleDef>} localizedStringBundles
 * @param {!Array<string>} languageCodes
 * @param {!LocalizedStringId} localizedStringId
 */
function findLocalizedString(localizedStringBundles, languageCodes,
  localizedStringId) {
  let localizedString = null;

  languageCodes.some(languageCode => {
    const localizedStringBundle = localizedStringBundles[languageCode];
    if (localizedStringBundle && localizedStringBundle[localizedStringId]) {
      localizedString = localizedStringBundle[localizedStringId].string ||
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
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce((fallbackLanguageCodeList, chunk, index) => {
    const fallbackLanguageCode = matches.slice(0, index + 1)
        .join('-')
        .toLowerCase();
    fallbackLanguageCodeList.unshift(fallbackLanguageCode);
    return fallbackLanguageCodeList;
  }, [FALLBACK_LANGUAGE_CODE]);
}


/**
 * Localization service.
 */
export class LocalizationService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    const rootEl = win.document.documentElement;

    /**
     * @private @const {!Array<string>}
     */
    this.rootLanguageCodes_ = this.getLanguageCodesForElement_(rootEl);

    /**
     * A mapping of language code to localized string bundle.
     * @private @const {!Object<string, !../localized-strings.LocalizedStringBundleDef>}
     */
    this.localizedStringBundles_ = {};
  }


  /**
   * @param {!Element} element
   * @return {!Array<string>}
   * @private
   */
  getLanguageCodesForElement_(element) {
    const languageEl = closest(element, el => el.hasAttribute('lang'));
    const languageCode = languageEl ? languageEl.getAttribute('lang') : null;
    return getLanguageCodesFromString(languageCode || '');
  }


  /**
   * @param {string} languageCode The language code to associate with the
   *     specified localized string bundle.
   * @param {!../localized-strings.LocalizedStringBundleDef} localizedStringBundle
   *     The localized string bundle to register.
   * @return {!LocalizationService} For chaining.
   */
  registerLocalizedStringBundle(languageCode, localizedStringBundle) {
    if (!this.localizedStringBundles_[languageCode]) {
      this.localizedStringBundles_[languageCode] = {};
    }

    Object.assign(this.localizedStringBundles_[languageCode],
        localizedStringBundle);
    return this;
  }


  /**
   * @param {!../localized-strings.LocalizedStringId} LocalizedStringId
   * @param {!Element=} elementToUse The element where the string will be
   *     used.  The language is based on the language at that part of the
   *     document.  If unspecified, will use the document-level language, if
   *     one exists, or the default otherwise.
   */
  getLocalizedString(LocalizedStringId, elementToUse = undefined) {
    const languageCodes = elementToUse ?
      this.getLanguageCodesForElement_(elementToUse) :
      this.rootLanguageCodes_;

    return findLocalizedString(this.localizedStringBundles_, languageCodes,
        LocalizedStringId);
  }
}
