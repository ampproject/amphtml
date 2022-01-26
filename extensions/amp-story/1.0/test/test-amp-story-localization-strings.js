import {LocalizedStringId_Enum} from '#service/localization/strings';

import localesObjs from '../_locales';

describes.fakeWin('amp-story-localization-strings', {amp: true}, () => {
  describe('localized strings', () => {
    localesObjs.forEach((obj) => {
      const languageName = Object.keys(obj)[0];
      const languageStrings = obj[languageName];
      const languageKeys = Object.keys(languageStrings);

      it(languageName + ' should have unique keys', () => {
        const uniqueKeys = new Set(languageKeys);

        expect(uniqueKeys.size).to.eql(languageKeys.length);
      });

      it(languageName + ' keys should exist in LocalizedStringId_Enum', () => {
        const localizedStringIdKeys = Object.values(LocalizedStringId_Enum);

        languageKeys.forEach((key) => {
          expect(localizedStringIdKeys).to.contain(key);
        });
      });
    });
  });
});
