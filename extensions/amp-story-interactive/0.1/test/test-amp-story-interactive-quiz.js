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

import {AmpStoryInteractiveQuiz} from '../amp-story-interactive-quiz';
import {AmpStoryRequestService} from '../../../amp-story/1.0/amp-story-request-service';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {LocalizationService} from '#service/localization';
import {Services} from '#service';
import {
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
  populateQuiz,
} from './helpers';
import {registerServiceBuilder} from '../../../../src/service-helpers';

describes.realWin(
  'amp-story-interactive-quiz',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryQuiz;
    let storyEl;
    let requestService;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryQuizEl = win.document.createElement(
        'amp-story-interactive-quiz'
      );
      ampStoryQuizEl.getResources = () => win.__AMP_SERVICES.resources.obj;
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
      gridLayer.appendChild(ampStoryQuizEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryQuiz = new AmpStoryInteractiveQuiz(ampStoryQuizEl);

      env.sandbox.stub(ampStoryQuiz, 'mutateElement').callsFake((fn) => fn());
    });

    it('should create the prompt and options container if there is a prompt', async () => {
      populateQuiz(ampStoryQuiz, 4, 'Is this a prompt?');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();
      expect(ampStoryQuiz.getRootElement().children.length).to.equal(2);
    });

    it('should not create the prompt and options container if there no prompt', async () => {
      populateQuiz(ampStoryQuiz, 4, undefined);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();
      expect(ampStoryQuiz.getRootElement().children.length).to.equal(1);
    });

    it('should structure the content in the quiz element', async () => {
      populateQuiz(ampStoryQuiz, 4, 'Has prompt!?');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizContent = ampStoryQuiz.getRootElement().children;
      expect(quizContent[0]).to.have.class(
        'i-amphtml-story-interactive-prompt-container'
      );
      expect(quizContent[1]).to.have.class(
        'i-amphtml-story-interactive-quiz-option-container'
      );

      // Check prompt container structure.
      expect(quizContent[0].children.length).to.equal(1);
      expect(
        quizContent[0].querySelectorAll('.i-amphtml-story-interactive-prompt')
      ).to.have.length(1);

      // Check option container structure.
      expect(quizContent[1].childNodes.length).to.equal(4);
      expect(
        quizContent[1].querySelectorAll(
          '.i-amphtml-story-interactive-quiz-option'
        )
      ).to.have.length(4);
    });

    it('should throw an error with fewer than two options', () => {
      populateQuiz(ampStoryQuiz, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with three options and one prompt', () => {
      populateQuiz(ampStoryQuiz, 3);
      expect(() => ampStoryQuiz.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      populateQuiz(ampStoryQuiz, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      expect(ampStoryQuiz.getOptionElements()[0].innerText).to.contain('30%');
      expect(ampStoryQuiz.getOptionElements()[3].innerText).to.contain('10%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockScrambledData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [10, 20, 30, 40];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with incomplete data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockIncompleteData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [0, 50, 50, 0];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with out of bounds data', async () => {
      const NUM_OPTIONS = 4;
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockOutOfBoundsData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [20, 0, 0, 80];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].innerText).to.contain(
          expectedText
        );
      }
    });
  }
);
