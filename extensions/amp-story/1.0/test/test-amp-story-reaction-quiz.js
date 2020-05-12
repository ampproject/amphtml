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
import {AnalyticsVariable, getVariableService} from '../variable-service';
import {Services} from '../../../../src/services';
import {getAnalyticsService} from '../story-analytics';
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

/**
 * Populates the quiz with a prompt and three options.
 *
 * @param {Window} win
 * @param {AmpStoryQuiz} quiz
 */
const populateStandardQuizContent = (win, quizElement) => {
  populateQuiz(win, quizElement);
};

/**
 * Returns mock reaction data.
 *
 * @return {Object}
 */
const getMockReactionData = () => {
  return {
    data: {
      totalResponseCount: 10,
      hasUserResponded: true,
      responses: [
        {
          reactionValue: 0,
          totalCount: 3,
          selectedByUser: true,
        },
        {
          reactionValue: 1,
          totalCount: 3,
          selectedByUser: false,
        },
        {
          reactionValue: 2,
          totalCount: 3,
          selectedByUser: false,
        },
        {
          reactionValue: 3,
          totalCount: 1,
          selectedByUser: false,
        },
      ],
    },
  };
};

/**
 * Generates a response given an array of counts.
 *
 * @param {Array<number>} responseCounts
 */
const generateResponseDataFor = (responseCounts) => {
  const response = {
    totalResponseCount: responseCounts.reduce((a, b) => a + b, 0),
    hasUserResponded: false,
    responses: [],
  };

  responseCounts.forEach((count, index) => {
    response.responses.push({
      reactionValue: index,
      totalCount: count,
      selectedByUser: false,
    });
  });

  return response;
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
    let analytics;
    let analyticsVars;
    let requestService;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryQuizEl = win.document.createElement(
        'amp-story-reaction-quiz'
      );
      ampStoryQuizEl.getResources = () => win.__AMP_SERVICES.resources.obj;

      analyticsVars = getVariableService(win);
      analytics = getAnalyticsService(win, win.document.body);
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
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      expect(ampStoryQuiz.getQuizElement().children.length).to.equal(2);
    });

    it('should structure the content in the quiz element', () => {
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();

      const quizContent = ampStoryQuiz.getQuizElement().children;
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
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with more than one prompt', () => {
      populateQuiz(win, ampStoryQuiz.element, 2);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with fewer than two options', () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 1);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with more than four options', () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 5);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should enter the post-interaction state on option click', async () => {
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizElement = ampStoryQuiz.getQuizElement();
      const quizOption = quizElement.querySelector(
        '.i-amphtml-story-reaction-quiz-option'
      );

      quizOption.click();

      // Microtask tick
      await Promise.resolve();

      expect(quizElement).to.have.class(
        'i-amphtml-story-reaction-post-selection'
      );
      expect(quizOption).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should only record the first option response', async () => {
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizElement = ampStoryQuiz.getQuizElement();
      const quizOptions = quizElement.querySelectorAll(
        '.i-amphtml-story-reaction-option'
      );

      quizOptions[0].click();
      quizOptions[1].click();

      // Microtask tick
      await Promise.resolve();

      expect(quizOptions[0]).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
      expect(quizOptions[1]).to.not.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should trigger an analytics event with the right variables on selection', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const option = ampStoryQuiz
        .getQuizElement()
        .querySelector('.i-amphtml-story-reaction-quiz-option');

      option.click();

      // Microtask tick
      await Promise.resolve();

      expect(trigger).to.have.been.calledWith('story-reaction');

      const variables = analyticsVars.get();
      expect(variables[AnalyticsVariable.STORY_REACTION_ID]).to.equal(
        'TEST_quizId'
      );
      expect(variables[AnalyticsVariable.STORY_REACTION_RESPONSE]).to.equal(0);
      expect(variables[AnalyticsVariable.STORY_REACTION_TYPE]).to.equal(0);
    });

    it('should update the quiz when the user has already reacted', async () => {
      // Fill the response to the requestService with mock reaction data.
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockReactionData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizElement = ampStoryQuiz.getQuizElement();
      const quizOptions = quizElement.querySelectorAll(
        '.i-amphtml-story-reaction-quiz-option'
      );

      expect(quizElement).to.have.class(
        'i-amphtml-story-reaction-post-selection'
      );
      expect(quizOptions[0]).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should handle the percentage pipeline', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockReactionData());

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizElement = ampStoryQuiz.getQuizElement();
      const quizOptions = quizElement.querySelectorAll(
        '.i-amphtml-story-reaction-quiz-option'
      );

      const percentageOption0 = quizOptions[0].querySelector(
        '.i-amphtml-story-reaction-quiz-percentage-text'
      );

      expect(percentageOption0.textContent).to.equal('30%');

      const percentageOption3 = quizOptions[3].querySelector(
        '.i-amphtml-story-reaction-quiz-percentage-text'
      );

      expect(percentageOption3.textContent).to.equal('10%');
    });

    it('should preprocess percentages properly', () => {
      const responseData1 = getMockReactionData()['data'];

      const percentages1 = ampStoryQuiz.preprocessPercentages_(responseData1);

      expect(percentages1).to.deep.equal([30, 30, 30, 10]);
    });

    it('should preprocess percentages preserving ties', () => {
      const responseData2 = generateResponseDataFor([3, 3, 3]);
      const percentages2 = ampStoryQuiz.preprocessPercentages_(responseData2);

      expect(percentages2).to.deep.equal([33, 33, 33]);
    });

    it('should preprocess percentages preserving order', () => {
      const responseData3 = generateResponseDataFor([255, 255, 245, 245]);
      const percentages3 = ampStoryQuiz.preprocessPercentages_(responseData3);

      expect(percentages3).to.deep.equal([26, 26, 24, 24]);
    });

    it('should preprocess percentages handling rounding edge cases', () => {
      const responseData4 = generateResponseDataFor([335, 335, 330]);
      const percentages4 = ampStoryQuiz.preprocessPercentages_(responseData4);

      expect(percentages4).to.deep.equal([33, 33, 33]);
    });
  }
);
