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

import {Action, getStoreService} from '../amp-story-store-service';
import {ProgressBar} from '../progress-bar';
import {Services} from '../../../../src/service';
import {expect} from 'chai';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-story-progress-bar', {amp: true}, (env) => {
  let win;
  let doc;
  let storeService;

  beforeEach(() => {
    win = env.win;
    doc = env.win.document;
    const mutator = Services.mutatorForDoc(env.ampdoc);
    // Sync mutate element.
    env.sandbox.stub(mutator, 'mutateElement').callsFake((el, cb) => {
      cb();
      return Promise.resolve();
    });
    storeService = getStoreService(env.win);
    const storyEl = doc.createElement('amp-story');
    storeService.dispatch(Action.SET_PAGE_IDS, [
      'page-1',
      'page-2',
      'page-3',
      'page-4',
      'page-5',
    ]);
    const progressBar = ProgressBar.create(env.win, storyEl).build('page-1');
    doc.body.appendChild(progressBar);
  });

  describe('story ad progress segment', async () => {
    it('should create/remove ad segment based on ad visibility', () => {
      toggleExperiment(win, 'story-ad-progress-segment', true);
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).not.to
        .exist;
      storeService.dispatch(Action.TOGGLE_AD, true);
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).to.exist;
      storeService.dispatch(Action.TOGGLE_AD, false);
      expect(doc.querySelector('.i-amphtml-story-ad-progress-value')).not.to
        .exist;
    });
  });
});
