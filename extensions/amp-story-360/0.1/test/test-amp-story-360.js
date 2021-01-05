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
import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {createElementWithAttributes} from '../../../../src/dom';
import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
} from '../../../../src/service';

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
    let storeService;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '7168',
        'height': '3584',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStory360(imagePath) {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(win.document, 'amp-story-360', {
        'layout': 'fill',
        'duration': '1s',
        'heading-end': '95',
        'style': 'height: 100px',
      });
      if (imagePath) {
        appendAmpImg(element, imagePath);
      }
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      const localizationService = new LocalizationService(win.document.body);
      registerServiceBuilderForDoc(element, 'localization', function () {
        return localizationService;
      });

      threesixty = await element.getImpl();
    }

    beforeEach(() => {
      win = env.win;

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
    });

    it('should build', async () => {
      await createAmpStory360(
        '/examples/amp-story/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
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

    it('parses orientation attributes', async () => {
      await createAmpStory360(
        '/examples/amp-story/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      expect(threesixty.canAnimate).to.be.true;
    });

    it('should play when in view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      expect(threesixty.isPlaying_).to.be.true;
    });

    it('should respond to pause when in view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await storeService.dispatch(Action.TOGGLE_PAUSED, false);
      expect(threesixty.isPlaying_).to.be.true;
    });

    it('should not play when out of view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await storeService.dispatch(Action.TOGGLE_PAUSED, true);
      await storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'notPage1',
        index: 1,
      });
      await storeService.dispatch(Action.TOGGLE_PAUSED, false);
      expect(threesixty.isPlaying_).to.be.false;
    });
  }
);
