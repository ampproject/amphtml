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

import '../amp-trinity-tts-player';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-trinity-tts-player',
  {
    amp: {
      extensions: ['amp-trinity-tts-player'],
    },
  },
  env => {
    let win;
    let element;

    async function renderPlayer() {
      await element.build();
      element.layoutCallback();
    }

    beforeEach(() => {
      win = env.win;

      toggleExperiment(win, 'amp-trinity-tts-player', true);

      element = win.document.createElement('amp-trinity-tts-player');
      element.setAttribute('height', '75');
      element.setAttribute('data-campaign-id', '2900000668');

      win.document.body.appendChild(element);
    });

    it('should render iframe', async () => {
      await renderPlayer();

      expect(element.querySelector('iframe').src).to.equal(
        'https://trinitymedia.ai/player/trinity-amp'
      );
    });
  }
);
