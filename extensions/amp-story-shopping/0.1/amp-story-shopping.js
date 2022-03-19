import {AmpStoryShoppingAttachment} from './amp-story-shopping-attachment';
import {AmpStoryShoppingTag} from './amp-story-shopping-tag';

import {CSS as shoppingCSS} from '../../../build/amp-story-shopping-0.1.css';
import {dependsOnStoryServices} from '../../amp-story/1.0/utils';

/**
 * Language and currency sensitive number formatting.
 * @param {!../../../src/service/localization.LocalizationService} localizationService
 * @param {!Element} el
 * @param {string} currency An ISO 4217 currency code.
 * @param {number} price
 * @return {string}
 */
export const formatI18nNumber = (localizationService, el, currency, price) => {
  const langCode = localizationService.getLanguageCodesForElement(el)[0];
  try {
    return new Intl.NumberFormat(langCode, {
      style: 'currency',
      currency,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
};

/**
 * @param {!Window} win
 * @param {!Array<!Object>} fontFaces
 */
export const loadFonts = (win, fontFaces) => {
  if (win.document.fonts && FontFace) {
    fontFaces.forEach(({family, src, weight}) =>
      new FontFace(family, src, {weight})
        .load()
        .then((font) => win.document.fonts.add(font))
    );
  }
};

AMP.extension('amp-story-shopping', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-story-shopping-tag',
    dependsOnStoryServices(AmpStoryShoppingTag),
    shoppingCSS
  );
  AMP.registerElement(
    'amp-story-shopping-attachment',
    dependsOnStoryServices(AmpStoryShoppingAttachment)
  );
});
