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

import {AmpStoryInteractivePoll} from '../amp-story-interactive-poll';
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
  'amp-story-interactive-poll',
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
        'amp-story-interactive-poll'
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
      ampStoryPoll = new AmpStoryInteractivePoll(ampStoryPollEl);
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

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryPoll, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should fill the content of the options', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'Fizz');
      ampStoryPoll.element.setAttribute('option-2-text', 'Buzz');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain(
        'Fizz'
      );
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain(
        'Buzz'
      );
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].innerText).to.contain('50 %');
      expect(ampStoryPoll.getOptionElements()[1].innerText).to.contain('50 %');
    });

    it('should have large font size if options are short', async () => {
      ampStoryPoll.element.setAttribute(
        'option-1-text',
        'This is a short text'
      );
      ampStoryPoll.element.setAttribute(
        'option-2-text',
        'This is another text'
      );
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(
        ampStoryPoll
          .getRootElement()
          .classList.contains('i-amphtml-story-interactive-poll-two-lines')
      ).to.be.false;
    });

    it('should have small font size if options are long', async () => {
      ampStoryPoll.element.setAttribute(
        'option-1-text',
        'This is a really really really really really long text'
      );
      ampStoryPoll.element.setAttribute(
        'option-2-text',
        'This is another text'
      );
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(
        ampStoryPoll
          .getRootElement()
          .classList.contains('i-amphtml-story-interactive-poll-two-lines')
      ).to.be.true;
    });
  }
);
