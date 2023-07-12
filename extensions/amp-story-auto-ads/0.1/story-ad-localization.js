import {Services} from '#service';
import {LocalizationService} from '#service/localization';
import {
  LocalizedStringId_Enum,
  createPseudoLocale,
} from '#service/localization/strings';

import LocalizedStringsAr from './_locales/ar.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsDe from './_locales/de.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsEnGb from './_locales/en-GB.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsEn from './_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsEs419 from './_locales/es-419.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsEs from './_locales/es.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsFr from './_locales/fr.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsHi from './_locales/hi.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsId from './_locales/id.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsIt from './_locales/it.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsJa from './_locales/ja.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsKo from './_locales/ko.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsNl from './_locales/nl.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsNo from './_locales/no.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsPtBr from './_locales/pt-BR.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsPtPt from './_locales/pt-PT.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsRu from './_locales/ru.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsTr from './_locales/tr.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsVi from './_locales/vi.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsZhCn from './_locales/zh-CN.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsZhTw from './_locales/zh-TW.json' assert {type: 'json'}; // lgtm[js/syntax-error]

import {registerServiceBuilderForDoc} from '../../../src/service-helpers';

/** @const */
export const CtaTypes = {
  APPLY_NOW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_APPLY_NOW,
  BOOK_NOW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_BOOK_NOW,
  BUY_TICKETS:
    LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_BUY_TICKETS,
  DOWNLOAD: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_DOWNLOAD,
  EXPLORE: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_EXPLORE,
  GET_NOW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_GET_NOW,
  INSTALL: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_INSTALL,
  LEARN_MORE: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_LEARN_MORE,
  LISTEN: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_LISTEN,
  MORE: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_MORE,
  OPEN_APP: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_OPEN_APP,
  ORDER_NOW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_ORDER_NOW,
  PLAY: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_PLAY,
  READ: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_READ,
  SHOP: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOP,
  SHOW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOW,
  SHOWTIMES: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SHOWTIMES,
  SIGN_UP: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SIGN_UP,
  SUBSCRIBE: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_SUBSCRIBE,
  USE_APP: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_USE_APP,
  VIEW: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_VIEW,
  WATCH: LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH,
  WATCH_EPISODE:
    LocalizedStringId_Enum.AMP_STORY_AUTO_ADS_BUTTON_LABEL_WATCH_EPISODE,
};

/**
 * Util function to retrieve the localization service. Ensures we can retrieve
 * the service synchronously without running into race conditions.
 * @param {!Element} element
 * @return {!../../../src/service/localization.LocalizationService}
 */
const getLocalizationService = (element) => {
  let localizationService = Services.localizationForDoc(element);

  if (!localizationService) {
    localizationService = new LocalizationService(element);
    registerServiceBuilderForDoc(element, 'localization', function () {
      return localizationService;
    });
  }

  return localizationService;
};

export class StoryAdLocalization {
  /**
   * @param {!Element} storyAutoAdsEl
   */
  constructor(storyAutoAdsEl) {
    /** @private @const {!Element} */
    this.storyAutoAdsEl_ = storyAutoAdsEl;
    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;
  }

  /**
   * @param {!../../../src/service/localization/strings.LocalizedStringId_Enum} id
   * @return {?string}
   */
  getLocalizedString(id) {
    if (!this.localizationService_) {
      this.init_();
    }
    return this.localizationService_.getLocalizedString(id);
  }

  /**
   * Create localization service and register all bundles.
   */
  init_() {
    this.localizationService_ = getLocalizationService(this.storyAutoAdsEl_);

    const enXaPseudoLocaleBundle = createPseudoLocale(
      LocalizedStringsEn,
      (s) => `[${s} one two]`
    );

    this.localizationService_.registerLocalizedStringBundles({
      'default': LocalizedStringsEn,
      'ar': LocalizedStringsAr,
      'de': LocalizedStringsDe,
      'en': LocalizedStringsEn,
      'en-GB': LocalizedStringsEnGb,
      'es': LocalizedStringsEs,
      'es-419': LocalizedStringsEs419,
      'fr': LocalizedStringsFr,
      'hi': LocalizedStringsHi,
      'id': LocalizedStringsId,
      'it': LocalizedStringsIt,
      'ja': LocalizedStringsJa,
      'ko': LocalizedStringsKo,
      'nl': LocalizedStringsNl,
      'no': LocalizedStringsNo,
      'pt-PT': LocalizedStringsPtPt,
      'pt-BR': LocalizedStringsPtBr,
      'ru': LocalizedStringsRu,
      'tr': LocalizedStringsTr,
      'vi': LocalizedStringsVi,
      'zh-cn': LocalizedStringsZhCn,
      'zh-TW': LocalizedStringsZhTw,
      'en-xa': enXaPseudoLocaleBundle,
    });
  }
}
