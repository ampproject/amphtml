import {closestAncestorElementBySelector} from '#core/dom/query';

import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilderForDoc} from '../../../src/service-helpers';

/**
 * Language code used if there is no language code specified by the document.
 * @const {string}
 */
const FALLBACK_LANGUAGE_CODE = 'en';

/**
 * @const {!RegExp}
 */
const LANGUAGE_CODE_CHUNK_REGEX = /\w+/gi;

const testUrl = 'https://cdn.ampproject.org/v0/amp-story.es.json';

/**
 * Util function to retrieve the localization service. Ensures we can retrieve
 * the service synchronously from the amp-story codebase without running into
 * race conditions.
 * @param {!Element} element
 * @return {!../../../src/service/localization.LocalizationService}
 */
export function getLocalizationService(element) {
  let localizationService = Services.localizationForDoc(element);

  if (!localizationService) {
    localizationService = new LocalizationService(element);
    localizationService.registerFromUrl(testUrl);
    registerServiceBuilderForDoc(element, 'localization', function () {
      return localizationService;
    });
  }

  return localizationService;
}

/**
 * Finds the closest lang attribute in a parent element, or defaults to `en`.
 * @param {!Element} element
 * @return {string}
 */
export function getLanguageCodeForElement(element) {
  return (
    closestAncestorElementBySelector(element, '[lang]')?.getAttribute('lang') ||
    FALLBACK_LANGUAGE_CODE
  );
}

/**
 * @param {string} languageCode
 * @return {!Array<string>} A list of language codes.
 * @visibleForTesting
 */
export function getLanguageCodesFromString(languageCode) {
  if (!languageCode) {
    return [FALLBACK_LANGUAGE_CODE];
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
