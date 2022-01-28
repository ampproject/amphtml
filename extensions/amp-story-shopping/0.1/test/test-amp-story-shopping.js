import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {formatI18nNumber} from '../amp-story-shopping';

describes.realWin(
  'amp-story-shopping',
  {
    amp: {runtimeOn: true},
  },
  (env) => {
    let win;
    let storyPageEl;
    let localizationService;

    beforeEach(async () => {
      win = env.win;

      localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      storyPageEl = win.document.createElement('amp-story-page');
      storyPageEl.setAttribute('lang', 'en');
    });

    it('should format i18n number using USD', () => {
      const formattedNumber = formatI18nNumber(
        localizationService,
        storyPageEl,
        'USD',
        100
      );
      expect(formattedNumber).to.equal('$100.00');
    });

    it('should format i18n number using JPY', () => {
      const formattedNumber = formatI18nNumber(
        localizationService,
        storyPageEl,
        'JPY',
        10000
      );
      expect(formattedNumber).to.equal('¥10,000');
    });

    it('should fallback to price and currency if invalid currency code', () => {
      const formattedNumber = formatI18nNumber(
        localizationService,
        storyPageEl,
        'asdf',
        10000
      );
      expect(formattedNumber).to.equal('10000 asdf');
    });
  }
);
