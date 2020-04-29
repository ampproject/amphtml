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

import {CharacterDataMutation} from '../mutation/character-data-mutation';
import {toggleExperiment} from '../../../../src/experiments';

const TEST_VALUE = 'TEST_VALUE';

describes.realWin(
  'amp-experiment character-data-mutation',
  {
    amp: {
      extensions: ['amp-experiment:1.0'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      toggleExperiment(win, 'amp-experiment-1.0', true);

      doc.body.innerHTML = '';
    });

    function getCharacterDataMutation() {
      return new CharacterDataMutation(
        {
          'type': 'characterData',
          'target': '.my-test-element-with-this-class',
          'value': TEST_VALUE,
        },
        [doc.createElement('div'), doc.createElement('div')]
      );
    }

    describe('mutate', () => {
      it('should mutate elements', () => {
        const mutation = getCharacterDataMutation();

        mutation.mutate();

        mutation.elements_.forEach((element) => {
          expect(element.textContent).to.be.equal(TEST_VALUE);
        });
      });
    });
  }
);
