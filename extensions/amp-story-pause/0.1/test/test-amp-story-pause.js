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

import '../amp-story-pause';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {createElementWithAttributes} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin(
  'amp-story-pause',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-pause'],
    },
  },
  (env) => {
    let win;
    let element;
    let storeService;

    beforeEach(() => {
      win = env.win;

      const localizationService = new LocalizationService(win);
      registerServiceBuilder(win, 'localization', function () {
        return localizationService;
      });

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      element = win.document.createElement('amp-story-pause');
      win.document.body.appendChild(element);
    });

    it('should contain "hello world" when built', async () => {
      await element.whenBuilt();
      expect(element.querySelector('div').textContent).to.equal('hello world');
    });

    it('should toggle the paused state on click', async () => {
      // Makes sure the paused state is false.
      storeService.dispatch(Action.TOGGLE_PAUSED, false);

      // Builds the component. The `buildCallback` is asynchronous, so we wait
      // for it to resolve here.
      await element.build();

      // Clicks the button.
      const buttonEl = element.querySelector('button');
      buttonEl.click();

      // Asserts that the paused state got toggled.
      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    });
  }
);
