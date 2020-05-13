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

import {AmpStoryReactionQuiz} from '../amp-story-reaction-quiz';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {Services} from '../../../../src/services';
import {getMockReactionData} from './test-amp-story-reaction';
import {getRequestService} from '../amp-story-request-service';
import {registerServiceBuilder} from '../../../../src/service';

/**
 * Populates the quiz with some number of prompts and some number of options.
 *
 * @param {Window} win
 * @param {AmpStoryReactionQuiz} quiz
 * @param {number} numPrompts
 * @param {number} numOptions
 */
const populateQuiz = (win, quizElement, numPrompts = 1, numOptions = 4) => {
  for (let i = 0; i < numPrompts; i++) {
    const prompt = win.document.createElement('h1');
    prompt.textContent = 'prompt';
    quizElement.appendChild(prompt);
  }

  const option = win.document.createElement('option');
  option.textContent = 'option';
  for (let i = 0; i < numOptions; i++) {
    quizElement.appendChild(option.cloneNode());
  }

  quizElement.setAttribute('id', 'TEST_quizId');
};

describes.realWin(
  'amp-story-reaction-quiz',
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

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryQuizEl = win.document.createElement(
        'amp-story-reaction-quiz'
      );
      ampStoryQuizEl.getResources = () => win.__AMP_SERVICES.resources.obj;
      requestService = getRequestService(win, ampStoryQuizEl);

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryQuizEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryQuiz = new AmpStoryReactionQuiz(ampStoryQuizEl);

      env.sandbox.stub(ampStoryQuiz, 'mutateElement').callsFake((fn) => fn());
    });

    it('should take the html and reformat it', () => {
      populateQuiz(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      expect(ampStoryQuiz.getRootElement().children.length).to.equal(2);
    });

    it('should structure the content in the quiz element', () => {
      populateQuiz(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();

      const quizContent = ampStoryQuiz.getRootElement().children;
      expect(quizContent[0]).to.have.class(
        'i-amphtml-story-reaction-quiz-prompt-container'
      );
      expect(quizContent[1]).to.have.class(
        'i-amphtml-story-reaction-quiz-option-container'
      );

      // Check prompt container structure.
      expect(quizContent[0].children.length).to.equal(1);
      expect(
        quizContent[0].querySelectorAll('.i-amphtml-story-reaction-quiz-prompt')
      ).to.have.length(1);

      // Check option container structure.
      expect(quizContent[1].childNodes.length).to.equal(4);
      expect(
        quizContent[1].querySelectorAll('.i-amphtml-story-reaction-quiz-option')
      ).to.have.length(4);
    });

    it('should throw an error with fewer than one prompt', () => {
      populateQuiz(win, ampStoryQuiz.element, 0);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(
          /The first child must be a heading element <h1>, <h2>, or <h3>/
        );
      });
    });

    it('should throw an error with more than one prompt', () => {
      populateQuiz(win, ampStoryQuiz.element, 2);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Too many children/);
      });
    });

    it('should throw an error with fewer than two options', () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with three options and one prompt', () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 3);
      expect(() => ampStoryQuiz.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should enter the post-interaction state on option click', async () => {
      populateQuiz(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizElement = ampStoryQuiz.getRootElement();
      const quizOption = quizElement.querySelector(
        '.i-amphtml-story-reaction-quiz-option'
      );

      await quizOption.click();

      expect(quizElement).to.have.class(
        'i-amphtml-story-reaction-post-selection'
      );
      expect(quizOption).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockReactionData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      expect(ampStoryQuiz.getOptionElements()[0].innerText).to.equal('30%');
      expect(ampStoryQuiz.getOptionElements()[3].innerText).to.equal('10%');
    });
  }
);
