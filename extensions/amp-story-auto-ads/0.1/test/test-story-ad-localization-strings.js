import localesObjs from '#extensions/amp-story-auto-ads/0.1/_locales';

import {LocalizedStringId} from '#service/localization/strings';

describes.fakeWin('amp-story-ad-localization-strings', {amp: true}, () => {
  describe('localized strings', () => {
    localesObjs.forEach((obj) => {
      const languageName = Object.keys(obj)[0];
      const languageStringsObj = obj[languageName];
      const languageKeys = Object.keys(languageStringsObj);

      it(languageName + ' should have unique keys', () => {
        const uniqueKeys = new Set(languageKeys);

        expect(uniqueKeys.size).to.eql(languageKeys.length);
      });

      it(languageName + ' keys should exist in LocalizedStringId', () => {
        const localizedStringIdKeys = Object.values(LocalizedStringId);

        languageKeys.forEach((key) => {
          expect(localizedStringIdKeys.indexOf(key)).to.not.eql(-1);
        });
      });
    });
  });
});
