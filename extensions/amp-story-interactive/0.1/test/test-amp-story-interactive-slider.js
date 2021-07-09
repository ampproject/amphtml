/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryInteractiveSlider} from '../amp-story-interactive-slider';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {registerServiceBuilder} from '../../../../src/service-helpers';
import {Services} from '#service';
import {AmpStoryRequestService} from '../../../amp-story/1.0/amp-story-request-service';
import {LocalizationService} from '#service/localization';

describes.realWin(
  'amp-story-interactive-slider',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStorySlider;
    let storyEl;
    let requestService;

    beforeEach(() => {
      win = env.win;
      const ampStorySliderEl = win.document.createElement(
        'amp-story-interactive-slider'
      );
      ampStorySlider = new AmpStoryInteractiveSlider(ampStorySliderEl);

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStorySliderEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStorySlider = new AmpStoryInteractiveSlider(ampStorySliderEl);

      ampStorySliderEl.getResources = () => win.__AMP_SERVICES.resources.obj;
      requestService = new AmpStoryRequestService(win);
      registerServiceBuilder(win, 'story-request', function () {
        return requestService;
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      env.sandbox.stub(ampStorySlider, 'mutateElement').callsFake((fn) => fn());
    });

    it('should create an input element, with type range', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      expect(
        ampStorySlider.getRootElement().querySelector('input[type="range"]')
      ).to.not.be.null;
    });

    it('should be disabled after the input event', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      // simulates a change event, which is when the user releases the slider
      slider.dispatchEvent(new CustomEvent('change'));
      expect(slider.hasAttribute('disabled')).to.be.true;
    });

    it('checks that input is the same as the number displayed in the bubble', async () => {
      await ampStorySlider.buildCallback();
      await ampStorySlider.layoutCallback();
      const slider = ampStorySlider
        .getRootElement()
        .querySelector('input[type="range"]');
      const sliderValue = ampStorySlider
        .getRootElement()
        .querySelector('.i-amphtml-story-interactive-slider-bubble span');
      slider.value = 50;
      // simulates an input event
      slider.dispatchEvent(new CustomEvent('input'));
      expect(slider.value).to.be.equal(sliderValue.textContent);
    });
  }
);
