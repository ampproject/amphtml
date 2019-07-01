/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {escapeCssSelectorIdent, prependSelectorsWith} from '../../src/css';

describe('CSS', () => {
  describe('escapeCssSelectorIdent', () => {
    it('should escape', () => {
      expect(escapeCssSelectorIdent('a b')).to.equal('a\\ b');
    });
  });

  describe('scopeSelector', () => {
    it('concats simple', () => {
      expect(prependSelectorsWith('div', '.i-amphtml-scoped')).to.equal(
        '.i-amphtml-scoped div'
      );
    });

    it('concats multiple selectors (2)', () => {
      expect(prependSelectorsWith('div,ul', ':scope')).to.equal(
        ':scope div,:scope ul'
      );
    });

    it('concats multiple selectors (4)', () => {
      expect(prependSelectorsWith('div,ul,ol,section', 'div >')).to.equal(
        'div > div,div > ul,div > ol,div > section'
      );
    });
  });
});
