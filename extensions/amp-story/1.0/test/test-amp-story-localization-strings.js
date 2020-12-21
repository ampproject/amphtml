/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {LocalizedStringId} from '../../../../src/localized-strings';
import localesObjs from '../_locales/index';

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

      it(languageName + ' keys should exist in LocalizedStringId', () => {
        const localizedStringIdKeys = Object.values(LocalizedStringId);

        languageKeys.forEach((key) => {
          expect(localizedStringIdKeys.indexOf(key)).to.not.eql(-1);
        });
      });
    });
  });
});
