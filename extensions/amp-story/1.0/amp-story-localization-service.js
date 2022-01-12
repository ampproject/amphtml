import {Services} from '#service';
import {LocalizationService} from '#service/localization';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {registerServiceBuilderForDoc} from '../../../src/service-helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars

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
