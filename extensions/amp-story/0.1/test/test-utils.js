/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  getRGBFromCssColorValue,
  getTextColorForRGB,
  timeStrToMillis,
} from '../utils';

describes.fakeWin('amp-story utils', {}, () => {
  describe('timeStrToMillis', () => {
    it('should return millis for a milliseconds string', () => {
      const millis = timeStrToMillis('100ms');

      expect(millis).to.equal(100);
    });

    it('should return millis for a seconds string', () => {
      const millisForSeconds = timeStrToMillis('1s');

      expect(millisForSeconds).to.equal(1000);
    });

    it('should return millis for a decimal seconds string', () => {
      const millisForSeconds = timeStrToMillis('1.64s');

      expect(millisForSeconds).to.equal(1640);
    });

    it('should return millis for a uppercase string', () => {
      const millisForSeconds = timeStrToMillis('2.5S');

      expect(millisForSeconds).to.equal(2500);
    });

    it('should return undefined for invalid types', () => {
      const convertedMillis = timeStrToMillis('10kg');
      expect(convertedMillis).to.be.NaN;
    });
  });

  describe('getRGBFromCssColorValue', () => {
    it('should accept rgb parameters', () => {
      expect(getRGBFromCssColorValue('rgb(0, 10, 100)')).to.deep.equal({
        r: 0,
        g: 10,
        b: 100,
      });
    });

    it('should accept rgba parameters', () => {
      expect(getRGBFromCssColorValue('rgba(0, 10, 100, 0.1)')).to.deep.equal({
        r: 0,
        g: 10,
        b: 100,
      });
    });

    it('should throw an error if wrong parameters', () => {
      allowConsoleError(() => {
        getRGBFromCssColorValue('who dis');
      });
    });

    it('should return a default value if wrong parameters', () => {
      allowConsoleError(() => {
        expect(getRGBFromCssColorValue('who dis')).to.deep.equal({
          r: 0,
          g: 0,
          b: 0,
        });
      });
    });
  });

  describe('getTextColorForRGB', () => {
    it('should return white for a dark background', () => {
      expect(getTextColorForRGB({r: 10, g: 10, b: 10})).to.equal('#FFF');
    });

    it('should return white for a light background', () => {
      expect(getTextColorForRGB({r: 200, g: 200, b: 200})).to.equal('#000');
    });
  });
});
