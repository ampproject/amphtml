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
import {closest} from '../../../src/dom';
import {parseJson} from '../../../src/json';


/**
 * A unique identifier for each localized string.  Localized string IDs should:
 *
 *   - Maintain alphabetical order
 *   - Be prefixed with the name of the extension that uses the string
 *     (e.g. "AMP_STORY_"), or with "AMP_" if they are general
 *   - NOT be reused; to deprecate an ID, comment it out and prefix its key with
 *     the string "DEPRECATED_"
 *
 * Next ID: 27
 *
 * @const @enum {string}
 */
export const LocalizedStringId = {
  // amp-story
  AMP_STORY_CONSENT_ACCEPT_BUTTON_LABEL: '22',
  AMP_STORY_CONSENT_DECLINE_BUTTON_LABEL: '23',
  AMP_STORY_CONSENT_DISMISS_DIALOG_BUTTON_LABEL: '24',
  AMP_STORY_DOMAIN_DIALOG_HEADING_LABEL: '25',
  AMP_STORY_DOMAIN_DIALOG_HEADING_LINK: '26',
  AMP_STORY_EXPERIMENT_ENABLE_BUTTON_LABEL: '0',
  AMP_STORY_EXPERIMENT_ENABLED_TEXT: '1',
  AMP_STORY_HINT_UI_NEXT_LABEL: '2',
  AMP_STORY_HINT_UI_PREVIOUS_LABEL: '3',
  AMP_STORY_SHARING_CLIPBOARD_FAILURE_TEXT: '4',
  AMP_STORY_SHARING_CLIPBOARD_SUCCESS_TEXT: '5',
  AMP_STORY_SHARING_PROVIDER_NAME_EMAIL: '6',
  AMP_STORY_SHARING_PROVIDER_NAME_FACEBOOK: '7',
  AMP_STORY_SHARING_PROVIDER_NAME_GOOGLE_PLUS: '8',
  AMP_STORY_SHARING_PROVIDER_NAME_LINK: '9',
  AMP_STORY_SHARING_PROVIDER_NAME_LINKEDIN: '10',
  AMP_STORY_SHARING_PROVIDER_NAME_PINTEREST: '11',
  AMP_STORY_SHARING_PROVIDER_NAME_SMS: '12',
  AMP_STORY_SHARING_PROVIDER_NAME_SYSTEM: '13',
  AMP_STORY_SHARING_PROVIDER_NAME_TUMBLR: '14',
  AMP_STORY_SHARING_PROVIDER_NAME_TWITTER: '15',
  AMP_STORY_SHARING_PROVIDER_NAME_WHATSAPP: '16',
  AMP_STORY_SYSTEM_LAYER_SHARE_WIDGET_LABEL: '17',
  AMP_STORY_WARNING_DESKTOP_SIZE_TEXT: '18',
  AMP_STORY_WARNING_EXPERIMENT_DISABLED_TEXT: '19',
  AMP_STORY_WARNING_LANDSCAPE_ORIENTATION_TEXT: '20',
  AMP_STORY_WARNING_UNSUPPORTED_BROWSER_TEXT: '21',
};


/**
 * @typedef {{
 *   string: string,
 *   description: string,
 * }}
 */
export let LocalizedStringDef;


/**
 * @typedef {!Object<!LocalizedStringId, !LocalizedStringDef>}
 */
export let LocalizedStringBundleDef;


/**
 * Language code used if there is no language code specified by the document.
 * @const {string}
 */
const DEFAULT_LANGUAGE_CODE = 'default';


/**
 * @const {!RegExp}
 */
const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;


/**
 * @param {string} languageCode
 * @return {!Array<string>} A list of language codes.
 */
export function getLanguageCodesFromString(languageCode) {
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce((fallbackLanguageCodeList, chunk, index) => {
    const fallbackLanguageCode = matches.slice(0, index + 1)
        .join('-')
        .toLowerCase();
    fallbackLanguageCodeList.unshift(fallbackLanguageCode);
    return fallbackLanguageCodeList;
  }, [DEFAULT_LANGUAGE_CODE]);
}


/**
 * Gets the string matching the specified localized string ID in the language
 * specified.
 * @param {!Object<string, LocalizedStringBundleDef>} localizedStringBundles
 * @param {!Array<string>} languageCodes
 * @param {!LocalizedStringId} localizedStringId
 */
function findLocalizedString(localizedStringBundles, languageCodes,
  localizedStringId) {
  let localizedString = null;

  languageCodes.some(languageCode => {
    const localizedStringBundle = localizedStringBundles[languageCode];
    if (localizedStringBundle && localizedStringBundle[localizedStringId] &&
        localizedStringBundle[localizedStringId].string) {
      localizedString = localizedStringBundle[localizedStringId].string;
      return true;
    }

    return false;
  });

  return localizedString;
}


/**
 * Creates a deep copy of the specified LocalizedStringBundle.
 * @param {!LocalizedStringBundleDef} localizedStringBundle
 * @return {!LocalizedStringBundleDef}
 */
function cloneLocalizedStringBundle(localizedStringBundle) {
  return /** @type {!LocalizedStringBundleDef} */ (parseJson(
      JSON.stringify(/** @type {!JsonObject} */ (localizedStringBundle))));
}


/**
 * Creates a pseudo locale by applying string transformations (specified by the
 * localizationFn) to an existing string bundle, without modifying the original.
 * @param {!LocalizedStringBundleDef} localizedStringBundle The localized
 *     string bundle to be transformed.
 * @param {function(string): string} localizationFn The transformation to be
 *     applied to each string in the bundle.
 * @return {!LocalizedStringBundleDef} The new strings.
 */
export function createPseudoLocale(localizedStringBundle, localizationFn) {
  /** @type {!LocalizedStringBundleDef} */
  const pseudoLocaleStringBundle =
      cloneLocalizedStringBundle(localizedStringBundle);

  Object.keys(pseudoLocaleStringBundle).forEach(localizedStringIdAsStr => {
    const localizedStringId =
        /** @type {!LocalizedStringId} */ (localizedStringIdAsStr);
    pseudoLocaleStringBundle[localizedStringId].string =
        localizationFn(localizedStringBundle[localizedStringId].string);
  });

  return pseudoLocaleStringBundle;
}


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
     * @private @const {!Object<string, !LocalizedStringBundleDef>}
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
   * @param {!LocalizedStringBundleDef} localizedStringBundle The localized
   *     string bundle to register.
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
   * @param {!LocalizedStringId} LocalizedStringId
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
