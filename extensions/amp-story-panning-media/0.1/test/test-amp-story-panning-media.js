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
import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {createElementWithAttributes} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';

/**
 * @return {!Promise<undefined>} A Promise that resolves after the browser has
 *    rendered.
 */
function afterRenderPromise() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve);
    });
  });
}

describes.realWin(
  'amp-story-panning-media',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-panning-media', 'amp-img'],
    },
  },
  (env) => {
    let win;
    let element;
    let panningMedia;
    let storeService;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '4000',
        'height': '3059',
        'layout': 'fill',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStoryPanningMedia(imagePath, attributes = {}) {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-panning-media',
        {
          'layout': 'fill',
          ...attributes,
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

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
    });

    it('should build', async () => {
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg'
      );
      expect(() => panningMedia.layoutCallback()).to.not.throw();
    });

    it('should throw if nested amp-img is missing', async () => {
      await createAmpStoryPanningMedia();
      expect(() =>
        allowConsoleError(() => panningMedia.layoutCallback())
      ).to.throw('Element expected: null');
    });

    it('sets transform of amp-img on page change', async () => {
      const attributes = {
        'group-id': 'group-1',
        'x': '50%',
        'y': '50%',
        'zoom': '2',
      };
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg',
        attributes
      );
      await panningMedia.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await afterRenderPromise();
      expect(panningMedia.ampImgEl_.style.transform).to.equal(
        `translate3d(${attributes.x}, ${attributes.y}, ${
          (attributes.zoom - 1) / attributes.zoom
        }px)`
      );
    });
  }
);
