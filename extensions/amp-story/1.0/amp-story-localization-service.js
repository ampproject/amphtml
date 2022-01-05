import {LocalizationService} from '#service/localization';
import {Services} from '#service';
import {registerServiceBuilderForDoc} from '../../../src/service-helpers';
// eslint-disable-next-line no-unused-vars
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {executeRequest} from './request-utils';

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
 * @param {!Node} context
 * @param {LocalizedStringId_Enum} key
 * @return {?string}
 */
export function localize(context, key) {
  return getLocalizationService(context).getLocalizedString(key);
}

/**
 * @param {!Node} context
 * @param {LocalizedStringId_Enum} key
 * @return {!Promise<?string>}
 */
export function localizeAsync(context, key) {
  executeRequest(
    context,
    'https://gist.githubusercontent.com/mszylkowski/3ed540186b18f4da4083e087bff36122/raw/a46b0204d5a7e12615a924b4ae192d9d77128bff/amp-story.es.json'
  ).then((res) => res[key]);
}
