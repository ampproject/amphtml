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

import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {
  AmpStoryInteractiveResults,
  decideStrategy,
  processResultsCategory,
  processResultsPercentage,
} from '../amp-story-interactive-results';
import {InteractiveType} from '../amp-story-interactive-abstract';
import {addConfigToInteractive} from './test-amp-story-interactive';
import {registerServiceBuilder} from '../../../../src/service';

const addThresholdsToInteractive = (interactive, thresholdList) => {
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

describes.realWin(
  'amp-story-interactive-results',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryResults;
    let storyEl;
    let storeService;

    beforeEach(() => {
      win = env.win;

      const ampStoryResultsEl = win.document.createElement(
        'amp-story-interactive-results'
      );
      ampStoryResultsEl.getResources = () => win.__AMP_SERVICES.resources.obj;

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryResultsEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryResults = new AmpStoryInteractiveResults(ampStoryResultsEl);
      env.sandbox
        .stub(ampStoryResults, 'mutateElement')
        .callsFake((fn) => fn());
    });

    it('should throw an error with fewer than two options', () => {
      addConfigToInteractive(ampStoryResults, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResults.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with two-four options', () => {
      addConfigToInteractive(ampStoryResults, 3);
      expect(() => ampStoryResults.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryResults, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResults.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should set the text for the category on update', async () => {
      addConfigToInteractive(ampStoryResults, 3);
      await ampStoryResults.buildCallback();
      await ampStoryResults.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {'resultscategory': 'results-category 2'},
        'type': InteractiveType.POLL,
      });
      expect(
        ampStoryResults.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 2');
    });

    it('should use a percentage strategy if there are thresholds', async () => {
      addConfigToInteractive(ampStoryResults, 3, null, [
        'results-category',
        'results-threshold',
      ]);
      expect(decideStrategy(ampStoryResults.parseOptions_())).to.equal(
        'percentage'
      );
    });

    it('should use a category strategy if there are no thresholds', () => {
      addConfigToInteractive(ampStoryResults, 3, null, ['results-category']);
      expect(decideStrategy(ampStoryResults.parseOptions_())).to.equal(
        'category'
      );
    });

    it('should select the category with most votes', () => {
      const votes = {
        'a': {
          'option': {'resultscategory': 'results-category 1'},
          'type': InteractiveType.POLL,
        },
        'b': {
          'option': {'resultscategory': 'results-category 2'},
          'type': InteractiveType.POLL,
        },
        'c': {
          'option': {'resultscategory': 'results-category 2'},
          'type': InteractiveType.POLL,
        },
      };
      addConfigToInteractive(ampStoryResults, 3, null, ['results-category']);
      expect(
        processResultsCategory(votes, ampStoryResults.parseOptions_()).category
      ).to.equal('results-category 2');
    });

    it('should select the first category with most votes if tied', () => {
      const votes = {
        'a': {
          'option': {'resultscategory': 'results-category 1'},
          'type': InteractiveType.POLL,
        },
        'b': {
          'option': {'resultscategory': 'results-category 2'},
          'type': InteractiveType.POLL,
        },
      };
      addConfigToInteractive(ampStoryResults, 3, null, ['results-category']);
      expect(
        processResultsCategory(votes, ampStoryResults.parseOptions_()).category
      ).to.equal('results-category 1');
    });

    it('should get the highest threshold that is lower or equal to the percentage', () => {
      const votes = {
        'a': {
          'option': {'correct': 'correct'},
          'type': InteractiveType.QUIZ,
        },
        'b': {
          'option': {},
          'type': InteractiveType.QUIZ,
        },
      };
      addThresholdsToInteractive(ampStoryResults, [25, 80, 50]);
      const results = processResultsPercentage(
        votes,
        ampStoryResults.parseOptions_()
      );
      expect(results.category).to.equal('results-category 3');
      expect(results.percentage).to.equal(50);
    });

    it('should get the lowest threshold if all are higher than percentage', () => {
      const votes = {
        'a': {
          'option': {},
          'type': InteractiveType.QUIZ,
        },
        'b': {
          'option': {},
          'type': InteractiveType.QUIZ,
        },
      };
      addThresholdsToInteractive(ampStoryResults, [50, 20, 80]);
      const results = processResultsPercentage(
        votes,
        ampStoryResults.parseOptions_()
      );
      expect(results.category).to.equal('results-category 2');
      expect(results.percentage).to.equal(0);
    });

    it('should set the text for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResults, [80, 20, 50]);
      await ampStoryResults.buildCallback();
      await ampStoryResults.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResults.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 3');
    });

    it('should set the percentage for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResults, [80, 20, 50]);
      await ampStoryResults.buildCallback();
      await ampStoryResults.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResults.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-top-value-number'
        ).textContent
      ).to.equal('33');
    });
  }
);
