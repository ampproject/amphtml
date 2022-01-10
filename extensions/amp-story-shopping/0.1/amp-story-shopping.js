import {AmpStoryShoppingAttachment} from './amp-story-shopping-attachment';
import {AmpStoryShoppingConfig} from './amp-story-shopping-config';
import {AmpStoryShoppingTag} from './amp-story-shopping-tag';

import {CSS as shoppingCSS} from '../../../build/amp-story-shopping-0.1.css';

/**
 * Language and currency sensitive number formatting.
 * @param {../../../src/service/localization.LocalizationService} LocalizationService
 * @param {Element} el
 * @param {string} currency // An ISO 4217 currency code.
 * @param {number} price
 * @return {string}
 */
export const formatI18nNumber = (LocalizationService, el, currency, price) => {
  const langCode = LocalizationService.getLanguageCodesForElement(el)[0];
  return new Intl.NumberFormat(langCode, {style: 'currency', currency}).format(
    price
  );
};

/**
 * @param {!Window} win
 * @param {!Array<!Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins
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
  AMP.registerElement('amp-story-shopping-config', AmpStoryShoppingConfig);
  AMP.registerElement(
    'amp-story-shopping-tag',
    AmpStoryShoppingTag,
    shoppingCSS
  );
  AMP.registerElement(
    'amp-story-shopping-attachment',
    AmpStoryShoppingAttachment
  );
});
