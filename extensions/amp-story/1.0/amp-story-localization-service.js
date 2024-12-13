import {getWin} from '#core/window';

import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilderForDoc} from '../../../src/service-helpers';

/**
 * AMP_STORY_SUPPORTED_LANGUAGES is replaced by a babel plugin with a list
 * of supported languages amp-story supports for localization string.
 * @const {string[]}
 */
const SUPPORTED_LANGUAGES = AMP_STORY_SUPPORTED_LANGUAGES;

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
    registerServiceBuilderForDoc(element, 'localization', function () {
      return localizationService;
    });
  }

  return localizationService;
}

/**
 * Adds the localized strings onto the template as aria labels or text contents.
 * Uses `i-amphtml-i18n-text-content` or `i-amphtml-i18n-aria-label` attributes.
 * @param {!Element} template
 * @param {!Element} context
 * @return {!Promise}
 */
export function localizeTemplate(template, context) {
  const localizationService = Services.localizationForDoc(context);
  const vsync = Services.vsyncFor(getWin(context));
  const promises = [];
  template.querySelectorAll('[i-amphtml-i18n-aria-label]').forEach((el) => {
    promises.push(
      localizationService
        .getLocalizedStringAsync(el.getAttribute('i-amphtml-i18n-aria-label'))
        .then((str) => el.setAttribute('aria-label', str))
    );
    el.removeAttribute('i-amphtml-i18n-aria-label');
  });
  template.querySelectorAll('[i-amphtml-i18n-text-content]').forEach((el) => {
    promises.push(
      localizationService
        .getLocalizedStringAsync(el.getAttribute('i-amphtml-i18n-text-content'))
        .then((str) =>
          template.isConnected
            ? vsync.mutatePromise(() => {
                el.textContent = str;
              })
            : (el.textContent = str)
        )
    );
    el.removeAttribute('i-amphtml-i18n-text-content');
  });
  return Promise.all(promises);
}

/**
 * Cross references the candidateLanguageCodes with the supportedLanguageCodes
 * to ensure that the candidate language is supported.
 * @param {string[]} candidateLanguageCodes
 * @return {string}
 * @private
 */
export function getSupportedLanguageCode(candidateLanguageCodes) {
  // IETF BCP 47 language tag and ISO-639 are not case sensitive but
  // the request to the Google AMP Cache is, so we make sure to maintain
  // the correct language code casing when making the request.
  for (let x = 0; x < candidateLanguageCodes.length; x++) {
    const curCandidateLanguageCode = candidateLanguageCodes[x].toLowerCase();
    for (let y = 0; y < SUPPORTED_LANGUAGES.length; y++) {
      const curSupportedLanguage = SUPPORTED_LANGUAGES[y].toLowerCase();
      if (curSupportedLanguage === curCandidateLanguageCode) {
        // We return the original un-lowercased value.
        return SUPPORTED_LANGUAGES[y];
      }
    }
  }
  return 'en';
}
