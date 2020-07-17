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

import '../amp-story-360';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-story-360',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-360', 'amp-img'],
    },
  },
  (env) => {
    let win;
    let element;
    let threesixty;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '7168',
        'height': '3584',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStory360(imagePath) {
      element = createElementWithAttributes(win.document, 'amp-story-360', {
        'layout': 'fill',
        'duration': '1s',
        'heading-end': '95',
        'style': 'height: 100px',
      });
      if (imagePath) {
        appendAmpImg(element, imagePath);
      }
      win.document.body.appendChild(element);
      threesixty = await element.getImpl();
    }

    beforeEach(() => {
      win = env.win;
    });

    it('should build', async () => {
      await createAmpStory360('/examples/img/panorama1.jpg');
      expect(() => {
        threesixty.layoutCallback();
      }).to.not.throw();
    });

    it('should throw if nested amp-img is missing', async () => {
      await createAmpStory360();
      expect(() => {
        allowConsoleError(() => {
          threesixty.layoutCallback();
        });
      }).to.throw();
    });

    it('parse orientation attributes', async () => {
      await createAmpStory360('/examples/img/panorama1.jpg');
      await threesixty.layoutCallback();
      expect(threesixty.canAnimate).to.be.true;
    });
  }
);
