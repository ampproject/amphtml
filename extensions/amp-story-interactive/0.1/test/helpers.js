/**
 * Returns mock interactive data.
 *
 * @return {Object}
 */
export const getMockInteractiveData = () => {
  return {
    options: [
      {
        index: 0,
        count: 3,
        selected: true,
      },
      {
        index: 1,
        count: 3,
        selected: false,
      },
      {
        index: 2,
        count: 3,
        selected: false,
      },
      {
        index: 3,
        count: 1,
        selected: false,
      },
    ],
  };
};

/**
 * Returns mock interactive data with index key values that don't match the
 * index within the options array.
 *
 * @return {Object}
 */
export const getMockScrambledData = () => {
  return {
    options: [
      {
        index: 3,
        count: 4,
        selected: false,
      },
      {
        index: 0,
        count: 1,
        selected: false,
      },
      {
        index: 1,
        count: 2,
        selected: false,
      },
      {
        index: 2,
        count: 3,
        selected: true,
      },
    ],
  };
};

/**
 * Returns mock interactive data that doesn't account for all options.
 *
 * @return {Object}
 */
export const getMockIncompleteData = () => {
  return {
    options: [
      {
        index: 1,
        count: 5,
        selected: false,
      },
      {
        index: 2,
        count: 5,
        selected: true,
      },
    ],
  };
};

/**
 * Returns mock interactive data with index key values that don't correspond
 * to any of the option elements.
 *
 * @return {Object}
 */
export const getMockOutOfBoundsData = () => {
  return {
    options: [
      {
        index: 3,
        count: 4,
        selected: false,
      },
      {
        index: 0,
        count: 1,
        selected: true,
      },
      {
        index: -1,
        count: 2,
        selected: false,
      },
      {
        index: 4,
        count: 3,
        selected: false,
      },
    ],
  };
};

/**
 * Returns mock interactive slider data.
 *
 * @return {Object}
 */
export const getSliderInteractiveData = () => {
  return {
    options: [
      {
        index: 15,
        count: 5,
        selected: true,
      },
      {
        index: 32,
        count: 3,
        selected: true,
      },
      {
        index: 47,
        count: 2,
        selected: true,
      },
      {
        index: 86,
        count: 7,
        selected: true,
      },
    ],
  };
};

export const addConfigToInteractive = (
  interactive,
  options = 4,
  correct = undefined,
  attributes = ['text', 'results-category', 'image']
) => {
  for (let i = 0; i < options; i++) {
    attributes.forEach((attr) => {
      interactive.element.setAttribute(
        `option-${i + 1}-${attr}`,
        `${attr} ${i + 1}`
      );
    });
  }
  if (correct) {
    interactive.element.setAttribute(`option-${correct}-correct`, 'correct');
  }
};

/**
 * Populates the quiz with some number of prompts and some number of options.
 *
 * @param {AmpStoryInteractive} quiz
 * @param {number} numOptions
 * @param {?string} prompt
 * @param {number} correctOption
 */
export const populateQuiz = (
  quiz,
  numOptions = 4,
  prompt = undefined,
  correctOption = 1
) => {
  if (prompt) {
    quiz.element.setAttribute('prompt-text', prompt);
  }
  addConfigToInteractive(quiz, numOptions, correctOption);
  quiz.element.setAttribute('id', 'TEST_quizId');
};

export const addThresholdsToInteractive = (interactive, thresholdList) => {
  addConfigToInteractive(interactive, thresholdList.length, null, [
    'results-category',
  ]);
  thresholdList.forEach((threshold, index) => {
    interactive.element.setAttribute(
      `option-${index + 1}-results-threshold`,
      threshold
    );
  });
};

export const MOCK_URL = 'https://amp.dev';
