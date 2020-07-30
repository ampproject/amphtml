/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryInteractiveBinaryPoll} from '../amp-story-interactive-binary-poll';
import {AmpStoryRequestService} from '../../../amp-story/1.0/amp-story-request-service';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {Services} from '../../../../src/services';
import {
  addConfigToInteractive,
  getMockInteractiveData,
} from './test-amp-story-interactive';
import {measureMutateElementStub} from '../../../../testing/test-helper';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin(
  'amp-story-interactive-binary-poll',
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
        'amp-story-interactive-binary-poll'
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

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryPollEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryPoll = new AmpStoryInteractiveBinaryPoll(ampStoryPollEl);
      env.sandbox
        .stub(ampStoryPoll, 'measureMutateElement')
        .callsFake(measureMutateElementStub);
      env.sandbox.stub(ampStoryPoll, 'mutateElement').callsFake((fn) => fn());
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

    it('should throw an error with more than two options', () => {
      addConfigToInteractive(ampStoryPoll, 3);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should fill the content of the options', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'Fizz');
      ampStoryPoll.element.setAttribute('option-2-text', 'Buzz');
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain(
        'Fizz'
      );
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain(
        'Buzz'
      );
    });

    it('should enter the post-interactive state on option click', async () => {
      addConfigToInteractive(ampStoryPoll, 2);
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      await ampStoryPoll.getOptionElements()[0].click();

      expect(ampStoryPoll.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      expect(ampStoryPoll.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, 2);
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].innerText).to.contain('50%');
      expect(ampStoryPoll.getOptionElements()[1].innerText).to.contain('50%');
    });

    it('should change the font-size wih the emoji content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', '🧛');
      ampStoryPoll.element.setAttribute('option-2-text', '🧛');
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable:2'
      );
    });

    it('should change the font-size with one line content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'This');
      ampStoryPoll.element.setAttribute('option-2-text', 'That');
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable:1.14'
      );
    });

    it('should change the font-size with two line content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'This is one');
      ampStoryPoll.element.setAttribute('option-2-text', 'That is two');
      ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable:1'
      );
    });

    it('should clamp transformX of text to MIN_HORIZONTAL_TRANSFORM value', () => {
      const transformVal = ampStoryPoll.getTransformVal_(10);
      expect(transformVal).to.deep.equal(-20);
    });
  }
);
