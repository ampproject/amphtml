/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
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

import '../amp-__component_name_hyphenated__';
import {toggleExperiment} from '../../../../src/experiments';
import {waitFor} from '../../../../testing/test-helper';

describes.realWin(
  'amp-__component_name_hyphenated__-v__component_version__',
  {
    amp: {
      extensions: ['amp-__component_name_hyphenated__:__component_version__'],
    },
  },
  (env) => {
    let win, doc, element;

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-__component_name_hyphenated__', true, true);
    });

    it('example test renders', async () => {
      element = doc.createElement('amp-__component_name_hyphenated__');
      doc.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');
      expect(element.parentNode).to.equal(doc.body);
    });
  }
);
