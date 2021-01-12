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

import '../amp-story-panning-media';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-story-panning-media',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-panning-media'],
    },
  },
  (env) => {
    let win;
    let element;
    let panningMedia;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '4000',
        'height': '3059',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStoryPanningMedia(imagePath, positionValues = {}) {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-panning-media',
        {
          'layout': 'fill',
          ...positionValues,
        }
      );
      if (imagePath) {
        appendAmpImg(element, imagePath);
      }
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      panningMedia = await element.getImpl();
    }

    beforeEach(() => {
      win = env.win;
    });

    it('should build', async () => {
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg'
      );
      return expect(() => panningMedia.layoutCallback()).to.not.throw();
    });

    it('should throw if nested amp-img is missing', async () => {
      await createAmpStoryPanningMedia();
      return expect(() => panningMedia.layoutCallback()).to.throw(
        'Element expected: null'
      );
    });

    it('sets transform of image element from attributes', async () => {
      const positionValues = {x: '50%', y: '50%', zoom: '2'};
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg',
        positionValues
      );
      await panningMedia.layoutCallback();
      expect(panningMedia.image_.style.transform).to.equal(
        `scale(${positionValues.zoom}) translate(${positionValues.x}, ${positionValues.y})`
      );
    });
  }
);
