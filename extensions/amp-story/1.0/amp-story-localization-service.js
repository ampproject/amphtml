import { getWin } from '#core/window';
import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilderForDoc} from '../../../src/service-helpers';

const testUrl = 'https://gist.githubusercontent.com/mszylkowski/3ed540186b18f4da4083e087bff36122/raw/a46b0204d5a7e12615a924b4ae192d9d77128bff/amp-story.es.json';

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
    localizationService = new LocalizationService(element, testUrl);
    registerServiceBuilderForDoc(element, 'localization', function () {
      return localizationService;
    });
  }

  return localizationService;
}
