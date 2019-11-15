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

import {AmpStoryQuiz} from '../amp-story-quiz';

/**
 * Populates the quiz with some number of prompts and some number of options
 *
 * @param {Window} win
 * @param {AmpStoryQuiz} quiz
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
};

/**
 * Populates the quiz with a prompt and three options
 *
 * @param {Window} win
 * @param {AmpStoryQuiz} quiz
 */
const populateStandardQuizContent = (win, quizElement) => {
  populateQuiz(win, quizElement);
};

describes.realWin(
  'amp-story-cta-layer',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  env => {
    let win;
    let ampStoryQuiz;

    beforeEach(() => {
      win = env.win;
      const ampStoryQuizEl = win.document.createElement('amp-story-quiz');

      win.document.body.appendChild(ampStoryQuizEl);
      ampStoryQuiz = new AmpStoryQuiz(ampStoryQuizEl);
    });

    it('should take the html and reformat it', async () => {
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();
      expect(ampStoryQuiz.getQuizElement().children.length).to.equal(2);
    });

    it('should structure the content in the quiz element', async () => {
      populateStandardQuizContent(win, ampStoryQuiz.element);
      ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizContent = ampStoryQuiz.getQuizElement().children;
      expect(quizContent[0]).to.have.class('i-amp-story-quiz-prompt-container');
      expect(quizContent[1]).to.have.class('i-amp-story-quiz-option-container');

      // check prompt container structure
      expect(quizContent[0].children.length).to.equal(1);
      expect(
        quizContent[0].querySelectorAll('.i-amp-story-quiz-prompt')
      ).to.have.length(1);

      // check option container structure
      expect(quizContent[1].childNodes.length).to.equal(4);
      expect(
        quizContent[1].querySelectorAll('.i-amp-story-quiz-option')
      ).to.have.length(4);
    });

    it('should throw an error with fewer than one prompt', async () => {
      populateQuiz(win, ampStoryQuiz.element, 0);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with more than one prompt', async () => {
      populateQuiz(win, ampStoryQuiz.element, 2);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with fewer than two options', async () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 1);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });

    it('should throw an error with more than four options', async () => {
      populateQuiz(win, ampStoryQuiz.element, 1, 5);
      expect(ampStoryQuiz.buildCallback).to.throw();
    });
  }
);
