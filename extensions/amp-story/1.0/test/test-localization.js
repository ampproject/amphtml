/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  LocalizationService,
  LocalizedStringId,
  createPseudoLocale,
  getLanguageCodesFromString,
} from '../../../../src/service/localization';

describes.fakeWin('localization', {}, env => {
  describe('localized string IDs', () => {
    it('should have unique values', () => {
      // Transform string IDs from a map of keys to values to a multimap of
      // values to a list of keys that have that value.
      const localizedStringIdKeys = Object.keys(LocalizedStringId);
      const valuesToKeys = localizedStringIdKeys
          .reduce((freq, LocalizedStringIdKey) => {
            const LocalizedStringIdValue =
                LocalizedStringId[LocalizedStringIdKey];
            if (!freq[LocalizedStringIdValue]) {
              freq[LocalizedStringIdValue] = [];
            }

            freq[LocalizedStringIdValue].push(LocalizedStringIdKey);
            return freq;
          }, {});

      // Assert that each of the lists of keys from the created multimap has
      // exactly one value.
      const localizedStringIdValues = Object.keys(valuesToKeys);
      localizedStringIdValues.forEach(value => {
        const keys = valuesToKeys[value];
        expect(keys, `${value} is never used in a localized string ID`)
            .to.not.be.empty;
        expect(keys).to.have
            .lengthOf(1, `${value} is used as a value for more than one ` +
                `localized string ID: ${keys}`);
      });
    });
  });

  describe('localization service', () => {
    it('should get string text', () => {
      const localizationService = new LocalizationService(env.win);
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          string: 'test string content',
        },
      });

      expect(localizationService.getLocalizedString('test_string_id'))
          .to.equal('test string content');
    });

    it('should utilize fallback if string is missing', () => {
      const localizationService = new LocalizationService(env.win);
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          fallback: 'test fallback content',
        },
      });

      expect(localizationService.getLocalizedString('test_string_id'))
          .to.equal('test fallback content');
    });

    it('should not utilize fallback if string is present', () => {
      const localizationService = new LocalizationService(env.win);
      localizationService.registerLocalizedStringBundle('en', {
        'test_string_id': {
          string: 'test string content',
          fallback: 'test fallback content',
        },
      });

      expect(localizationService.getLocalizedString('test_string_id'))
          .to.equal('test string content');
    });

    it('should have language fallbacks', () => {
      expect(getLanguageCodesFromString('de-hi-1')).to
          .deep.equal(['de-hi-1', 'de-hi', 'de', 'default']);
    });

    it('should default to English', () => {
      expect(getLanguageCodesFromString()).to.deep.equal(['en', 'default']);
    });
  });

  describe('en-XA pseudolocale', () => {
    it('should transform strings', () => {
      const originalStringBundle = {
        'test_string_id': {string: 'foo'},
      };
      const pseudoLocaleBundle = createPseudoLocale(originalStringBundle,
          s => `${s} ${s}`);

      expect(pseudoLocaleBundle['test_string_id'].string).to.equal('foo foo');
    });

    it('should contain all string IDs from original locale', () => {
      const originalStringBundle = {
        'msg_id_1': {string: 'msg1'},
        'msg_id_2': {string: 'msg2'},
        'msg_id_3': {string: 'msg3'},
        'msg_id_4': {string: 'msg4'},
        'msg_id_5': {string: 'msg5'},
      };
      const pseudoLocaleBundle = createPseudoLocale(originalStringBundle,
          s => `${s} ${s}`);

      expect(Object.keys(originalStringBundle)).to
          .deep.equal(Object.keys(pseudoLocaleBundle));
    });
  });
});
