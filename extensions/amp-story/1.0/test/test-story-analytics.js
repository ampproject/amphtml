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

import * as analytics from '../../../../src/analytics';
import {Action, getStoreService} from '../amp-story-store-service';
import {StoryAnalyticsService} from '../story-analytics';

describes.realWin('amp-story-analytics', {amp: true}, (env) => {
  let el;
  let storeService;

  beforeEach(() => {
    const {win} = env;
    el = win.document.createElement('amp-story');
    storeService = getStoreService(win);
    new StoryAnalyticsService(env.win, el);
  });

  it('sends story-page-visible on current page change', () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-1',
      index: 0,
    });
    expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 0, storyPageId: 'page-1'})
    );
  });

  it('does not send story-page-visible on ad page', () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.TOGGLE_AD, true);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'ad-page-1',
      index: 1,
    });
    expect(triggerAnalyticsStub).not.to.be.called;
  });

  it('sends story-page-visible on content page after ad page', () => {
    const triggerAnalyticsStub = env.sandbox.stub(
      analytics,
      'triggerAnalyticsEvent'
    );
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-1',
      index: 0,
    });
    expect(triggerAnalyticsStub).to.have.been.calledOnceWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 0, storyPageId: 'page-1'})
    );
    storeService.dispatch(Action.TOGGLE_AD, true);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'ad-page-1',
      index: 1,
    });
    expect(triggerAnalyticsStub).to.have.been.calledOnce;
    storeService.dispatch(Action.TOGGLE_AD, false);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page-2',
      index: 2,
    });
    expect(triggerAnalyticsStub).to.have.been.calledTwice;
    expect(triggerAnalyticsStub.secondCall).to.have.been.calledWithExactly(
      el,
      'story-page-visible',
      env.sandbox.match({storyPageIndex: 2, storyPageId: 'page-2'})
    );
  });
});
