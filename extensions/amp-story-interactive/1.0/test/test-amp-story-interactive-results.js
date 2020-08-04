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
import {AmpStoryInteractiveResults} from '../amp-story-interactive-results';
import {addConfigToInteractive} from './test-amp-story-interactive';
import {registerServiceBuilder} from '../../../../src/service';

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
      ampStoryResults.buildCallback();
      await ampStoryResults.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {'resultscategory': 'results-category 2'},
      });
      expect(
        ampStoryResults.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 2');
    });
  }
);
