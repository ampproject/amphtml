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

import {AmpStoryInteractiveImgPoll} from '../amp-story-interactive-img-poll';
import {AmpStoryRequestService} from '../../../amp-story/1.0/amp-story-request-service';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {LocalizationService} from '#service/localization';
import {Services} from '#service';
import {
  addConfigToInteractive,
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
} from './helpers';
import {measureMutateElementStub} from '#testing/test-helper';
import {registerServiceBuilder} from '../../../../src/service-helpers';

describes.realWin(
  'amp-story-interactive-img-poll',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryPoll;
    let storyEl;
    let requestService;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryPollEl = win.document.createElement(
        'amp-story-interactive-img-poll'
      );
      ampStoryPollEl.getResources = () => win.__AMP_SERVICES.resources.obj;
      requestService = new AmpStoryRequestService(win);
      registerServiceBuilder(win, 'story-request', function () {
        return requestService;
      });

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryPollEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryPoll = new AmpStoryInteractiveImgPoll(ampStoryPollEl);
      env.sandbox
        .stub(ampStoryPoll, 'measureMutateElement')
        .callsFake(measureMutateElementStub);
      env.sandbox.stub(ampStoryPoll, 'mutateElement').callsFake((fn) => fn());
    });

    it('should fill the content of the options with images', async () => {
      ampStoryPoll.element.setAttribute('option-1-image', 'Fizz');
      ampStoryPoll.element.setAttribute('option-1-image-alt', 'Fizz');
      ampStoryPoll.element.setAttribute('option-2-image', 'Buzz');
      ampStoryPoll.element.setAttribute('option-2-image-alt', 'Buzz');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(
        win
          .getComputedStyle(
            ampStoryPoll
              .getOptionElements()[0]
              .querySelector('.i-amphtml-story-interactive-img-option-img')
          )
          .getPropertyValue('background-image')
      ).to.contain('Fizz');
      expect(
        win
          .getComputedStyle(
            ampStoryPoll
              .getOptionElements()[1]
              .querySelector('.i-amphtml-story-interactive-img-option-img')
          )
          .getPropertyValue('background-image')
      ).to.contain('Buzz');
    });

    it('should set the aria-label of the options', async () => {
      ampStoryPoll.element.setAttribute('option-1-image', 'Fizz');
      ampStoryPoll.element.setAttribute('option-1-image-alt', 'Fizz');
      ampStoryPoll.element.setAttribute('option-2-image', 'Buzz');
      ampStoryPoll.element.setAttribute('option-2-image-alt', 'Buzz');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(
        ampStoryPoll.getOptionElements()[0].getAttribute('aria-label')
      ).to.equal('Fizz');
      expect(
        ampStoryPoll.getOptionElements()[1].getAttribute('aria-label')
      ).to.equal('Buzz');
    });

    it('should throw an error with fewer than two options', () => {
      addConfigToInteractive(ampStoryPoll, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with two options', () => {
      addConfigToInteractive(ampStoryPoll, 2);
      expect(() => ampStoryPoll.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryPoll, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].innerText).to.contain('50%');
      expect(ampStoryPoll.getOptionElements()[1].innerText).to.contain('50%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockScrambledData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [10, 20, 30, 40];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryPoll.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with incomplete data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockIncompleteData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [0, 50, 50, 0];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryPoll.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with out of bounds data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockOutOfBoundsData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [20, 0, 0, 80];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryPoll.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });
  }
);
