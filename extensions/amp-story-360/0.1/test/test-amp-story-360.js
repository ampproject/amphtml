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
    let ampImg;
    let element;
    let threesixty;

    beforeEach(async () => {
      win = env.win;

      element = win.document.createElement('amp-story-360');
      element.setAttribute('layout', 'fill');
      element.setAttribute('duration', '1s');
      element.setAttribute('heading-end', '95');
      element.style.height = '100px';

      ampImg = win.document.createElement('amp-img');
      ampImg.setAttribute('src', '/examples/img/panorama1.jpg');
      ampImg.setAttribute('width', '7168');
      ampImg.setAttribute('height', '3584');
      element.appendChild(ampImg);

      win.document.body.appendChild(element);
      threesixty = await element.getImpl();
    });

    it('should build and parse duration attribute', async () => {
      await threesixty.layoutCallback();
      expect(threesixty.duration_).to.equal(1000);
    });
  }
);  