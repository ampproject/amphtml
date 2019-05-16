/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  getAliasDefinition,
  getMaskPrefix,
  getPrefixSubsets,
  removePrefix,
} from '../inputmask-custom-alias';

describes.sandboxed('inputmask "custom" alias', {}, () => {
  describe('removePrefix', () => {
    it('should remove a prefix from the given input string', () => {
      const value = '+1(555)555-5555';
      expect(removePrefix(value, ['+1('])).to.equal('555)555-5555');
      expect(removePrefix(value, ['+1'])).to.equal('(555)555-5555');
      expect(removePrefix(value, ['+'])).to.equal('1(555)555-5555');
    });

    it('should remove the longest prefix match from the input string', () => {
      const prefices = ['+1(', '+1', '+', '1(', '1', '('];

      expect(removePrefix('+1555-555-5555', prefices)).to.equal('555-555-5555');
      expect(removePrefix('1555-555-5555', prefices)).to.equal('555-555-5555');
      expect(removePrefix('+1555-555-5555', prefices)).to.equal('555-555-5555');
      expect(removePrefix('15555555555', prefices)).to.equal('5555555555');
      expect(removePrefix('+1(555)-555-5555', prefices)).to.equal(
        '555)-555-5555'
      );
    });

    it('should return the input string if no prefix matches', () => {
      const value = '555-555-5555';
      const prefix = '+1(';
      expect(removePrefix(value, [prefix])).to.equal('555-555-5555');
    });
  });

  describe('getMaskPrefix', () => {
    it('should return non-mask characters at the start of the string', () => {
      const maskString = '+1(999)999-9999';
      expect(getMaskPrefix(maskString)).to.equal('+1(');
    });

    it('should return "" when no non-mask characters are found', () => {
      const maskString = '999)999-9999';
      expect(getMaskPrefix(maskString)).to.equal('');
    });
  });

  describe('getPrefixSubsets', () => {
    it("should return all substrings of a mask's non-mask prefix", () => {
      expect(getPrefixSubsets('(999)999-9999')).to.have.members(['(']);
      expect(getPrefixSubsets('1(999)999-9999')).to.have.members([
        '1(',
        '1',
        '(',
      ]);
      expect(getPrefixSubsets('+1(999)999-9999')).to.have.members([
        '+1(',
        '+1',
        '+',
        '1(',
        '1',
        '(',
      ]);
    });

    it('should return no substrings of a mask with no non-mask prefix', () => {
      expect(getPrefixSubsets('999)999-9999')).to.have.members([]);
    });

    it(
      'should return no substrings of a mask if a non-mask prefix ' +
        'has more than 5 characters',
      () => {
        expect(getPrefixSubsets('++++1(999)999-9999')).to.have.members([]);
      }
    );
  });

  describe('alias config', () => {
    it('should cache prefixes when installed', () => {
      const alias = getAliasDefinition();
      const opts = {'customMask': '+1(999)999-9999'};

      alias.custom.mask(opts);
      expect(opts.prefixes).to.have.members(['+1(', '+1', '+', '1(', '1', '(']);
    });

    it('should trim leading zeros when configured', () => {
      const alias = getAliasDefinition();
      const opts = {'customMask': '+1(999)999-9999', trimZeros: 2};

      alias.custom.mask(opts);
      expect(alias.custom.onBeforeMask('555-555-5555', opts)).to.equal(
        '555-555-5555'
      );
      expect(alias.custom.onBeforeMask('0555-555-5555', opts)).to.equal(
        '555-555-5555'
      );
      expect(alias.custom.onBeforeMask('00555-555-5555', opts)).to.equal(
        '555-555-5555'
      );
      expect(alias.custom.onBeforeMask('000555-555-5555', opts)).to.equal(
        '0555-555-5555'
      );
    });

    it('should not trim leading zeros when not configured', () => {
      const alias = getAliasDefinition();
      const opts = {'customMask': '+1(999)999-9999', trimZeros: 0};

      alias.custom.mask(opts);
      expect(alias.custom.onBeforeMask('00555-555-5555', opts)).to.equal(
        '00555-555-5555'
      );
    });

    it('should trim non-mask prefixes when configured', () => {
      const alias = getAliasDefinition();
      const opts = {'customMask': '+1(999)999-9999', trimZeros: 0};

      alias.custom.mask(opts);
      expect(alias.custom.onBeforeMask('+1555-555-5555', opts)).to.equal(
        '555-555-5555'
      );
    });
  });
});
