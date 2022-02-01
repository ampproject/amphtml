import {Services} from '#service';
import {
  LocalizationService,
  getLanguageCodesFromString,
} from '#service/localization';
import {
  LocalizedStringId_Enum,
  createPseudoLocale,
} from '#service/localization/strings';

describes.fakeWin('localization', {amp: true}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  describe('localized string IDs', () => {
    it('should have unique values', () => {
      // Transform string IDs from a map of keys to values to a multimap of
      // values to a list of keys that have that value.
      const localizedStringIdKeys = Object.keys(LocalizedStringId_Enum);
      const valuesToKeys = localizedStringIdKeys.reduce(
        (freq, LocalizedStringIdKey) => {
          const LocalizedStringIdValue =
            LocalizedStringId_Enum[LocalizedStringIdKey];
          if (!freq[LocalizedStringIdValue]) {
            freq[LocalizedStringIdValue] = [];
          }

          freq[LocalizedStringIdValue].push(LocalizedStringIdKey);
          return freq;
        },
        {}
      );

      // Assert that each of the lists of keys from the created multimap has
      // exactly one value.
      const localizedStringIdValues = Object.keys(valuesToKeys);
      localizedStringIdValues.forEach((value) => {
        const keys = valuesToKeys[value];
        expect(keys, `${value} is never used in a localized string ID`).to.not
          .be.empty;
        expect(keys).to.have.lengthOf(
          1,
          `${value} is used as a value for more than one ` +
            `localized string ID: ${keys}`
        );
      });
    });
  });

  describe('localization service', () => {
    it('should get string text', () => {
      const localizationService = new LocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          string: 'test string content',
        },
        'test_string_unwrapped': 'test string in unwrapped format',
      });

      expect(localizationService.getLocalizedString('test_string_id')).to.equal(
        'test string content'
      );
      expect(
        localizationService.getLocalizedString('test_string_unwrapped')
      ).to.equal('test string in unwrapped format');
    });

    it('should handle registration of uppercase locales', () => {
      env.win.document.documentElement.setAttribute('lang', 'zh-CN');
      const localizationService = new LocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundle('zh-CN', {
        '123': {
          string: '买票',
        },
        'test_string_unwrapped': 'test string in unwrapped format',
      });

      expect(localizationService.getLocalizedString('123')).to.equal('买票');
      expect(
        localizationService.getLocalizedString('test_string_unwrapped')
      ).to.equal('test string in unwrapped format');
    });

    it('should have language fallbacks', () => {
      expect(getLanguageCodesFromString('de-hi-1')).to.deep.equal([
        'de-hi-1',
        'de-hi',
        'de',
        'default',
      ]);
    });

    it('should default to English', () => {
      expect(getLanguageCodesFromString()).to.deep.equal(['en', 'default']);
    });
  });

  describe('pseudolocales', () => {
    it('should transform strings', () => {
      const originalStringBundle = {
        'test_string_id': {string: 'foo'},
        'test_string_unwrapped': 'unwrapped',
      };
      const pseudoLocaleBundle = createPseudoLocale(
        originalStringBundle,
        (s) => `${s} ${s}`
      );

      expect(pseudoLocaleBundle['test_string_id']).to.equal('foo foo');
      expect(pseudoLocaleBundle['test_string_unwrapped']).to.equal(
        'unwrapped unwrapped'
      );
    });

    it('should contain all string IDs from original locale', () => {
      const originalStringBundle = {
        'msg_id_1': {string: 'msg1'},
        'msg_id_2': {string: 'msg2'},
        'msg_id_3': {string: 'msg3'},
        'msg_id_4': {string: 'msg4'},
        'msg_id_5': {string: 'msg5'},
      };
      const pseudoLocaleBundle = createPseudoLocale(
        originalStringBundle,
        (s) => `${s} ${s}`
      );

      expect(Object.keys(originalStringBundle)).to.deep.equal(
        Object.keys(pseudoLocaleBundle)
      );
    });
  });
});

describes.fakeWin('viewer localization', {amp: true}, (env) => {
  describe('viewer language override', () => {
    let win;

    beforeEach(() => {
      win = env.win;
      env.sandbox
        .stub(Services.viewerForDoc(env.ampdoc), 'getParam')
        .returns('fr');
    });

    it('should take precedence over document language', () => {
      const localizationService = new LocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundle('fr', {
        'test_string_id': {
          string: 'oui',
        },
      });
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          string: 'yes',
        },
      });

      expect(localizationService.getLocalizedString('test_string_id')).to.equal(
        'oui'
      );
    });

    it('should fall back if string is not found', () => {
      const localizationService = new LocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundle('fr', {
        'incorrect_test_string_id': {
          string: 'non',
        },
      });
      localizationService.registerLocalizedStringBundle('en', {
        'correct_test_string_id': {
          string: 'yes',
        },
      });

      expect(
        localizationService.getLocalizedString('correct_test_string_id')
      ).to.equal('yes');
    });

    it('should fall back if language code is not registered', () => {
      const localizationService = new LocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          string: 'yes',
        },
      });

      expect(localizationService.getLocalizedString('test_string_id')).to.equal(
        'yes'
      );
    });
  });
});
