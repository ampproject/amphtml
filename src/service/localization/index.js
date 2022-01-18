import {closest} from '#core/dom/query';
import {getWin} from '#core/window';

import {Services} from '#service';

import {
  LocalizedStringBundleDef,
  // The LocalizedStringId_Enum type is imported even though it is not used because
  // the compiler does not output types for enums, but we want to distinguish
  // between LocalizedStringId_Enum enum values and any other strings.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LocalizedStringId_Enum,
} from './strings';

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
 * @param {string} languageCode
 * @return {!Array<string>} A list of language codes.
 * @visibleForTesting
 */
export function getLanguageCodesFromString(languageCode) {
  if (!languageCode) {
    return ['en', FALLBACK_LANGUAGE_CODE];
  }
  const matches = languageCode.match(LANGUAGE_CODE_CHUNK_REGEX) || [];
  return matches.reduce(
    (fallbackLanguageCodeList, chunk, index) => {
      const fallbackLanguageCode = matches
        .slice(0, index + 1)
        .join('-')
        .toLowerCase();
      fallbackLanguageCodeList.unshift(fallbackLanguageCode);
      return fallbackLanguageCodeList;
    },
    [FALLBACK_LANGUAGE_CODE]
  );
}

/**
 * Localization service.
 */
export class LocalizationService {
  /**
   * @param {!Element} element
   * @param {?string} remoteBundleUrl
   */
  constructor(element, remoteBundleUrl) {
    this.element_ = element;

    this.language_ =
      getWin(element).document.querySelector('[lang]')?.getAttribute('lang') ||
      'en';
    
    this.fetchedRemote_ = Promise.resolve();

    /**
     * A mapping of language code to localized string bundle.
     * @private @const {!Object<string, !LocalizedStringBundleDef>}
     */
    this.localizedStringBundles_ = {};

    if (remoteBundleUrl) {
      this.fetchedRemote_ = Services.xhrFor(getWin(element)).fetchJson(remoteBundleUrl).then((res) => this.registerLocalizedStringBundle(this.language_, res.json()));
    }
  }

  getLocalizedString(code) {
    const languageDict = this.localizedStringBundles_[this.language_];
    if (languageDict && languageDict[code]) {
      console.log('should not be localizing', code, languageDict[code]);
      return languageDict[code];
    }
    console.log('should not be localizing', code, 'NOT WORKING');
    return 'NOT WORKING';
  }

  /**
   * @param {!Element} element
   * @return {!Array<string>}
   */
  getLanguageCodesForElement(element) {
    const languageEl = closest(element, (el) => el.hasAttribute('lang'));
    const languageCode = languageEl ? languageEl.getAttribute('lang') : null;
    const languageCodesToUse = getLanguageCodesFromString(languageCode || '');

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
  registerLocalizedStringBundle(languageCode, localizedStringBundle) {
    const normalizedLangCode = languageCode.toLowerCase();
    if (!this.localizedStringBundles_[normalizedLangCode]) {
      this.localizedStringBundles_[normalizedLangCode] = {};
    }

    Object.assign(
      this.localizedStringBundles_[normalizedLangCode],
      localizedStringBundle
    );
    return this;
  }

  whenInitialized() {
    return this.fetchedRemote_;
  }
}
