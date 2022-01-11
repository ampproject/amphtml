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
    let element;
    let localizationService;

    beforeEach(async () => {
      win = env.win;

      localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      element = win.document.createElement('amp-story-page');
      element.setAttribute('lang', 'en');
    });

    it('should format i18n number', () => {
      const formattedNumber = formatI18nNumber(
        localizationService,
        element,
        'USD',
        100
      );
      expect(formattedNumber).to.equal('$100.00');
    });
  }
);
