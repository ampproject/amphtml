/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {getAnalyticsService} from '../story-analytics';
import {installDocService} from '../../../../src/service/ampdoc-impl';

describes.fakeWin('amp-story analytics', {}, (env) => {
  let analytics;
  let rootEl;
  let storeService;

  beforeEach(() => {
    const {win} = env;

    rootEl = win.document.createElement('div');
    storeService = getStoreService(win);
    analytics = getAnalyticsService(win, rootEl);
    win.document.body.appendChild(rootEl);
    installDocService(win, true);
  });

  it('should trigger `story-page-visible` on change', () => {
    const trigger = env.sandbox.stub(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledWith('story-page-visible');
  });

  it('should trigger `story-last-page-visible` when last page is visible', () => {
    const trigger = env.sandbox.stub(analytics, 'triggerEvent');

    storeService.dispatch(Action.SET_PAGE_IDS, ['cover', 'page1', 'page2']);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page1',
      index: 1,
    });
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'page2',
      index: 2,
    });

    expect(trigger).to.have.been.calledWith('story-last-page-visible');
  });

  it('should not mark an event as repeated the first time it fires', () => {
    const trigger = env.sandbox.spy(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledOnceWith('story-page-visible');

    const details = analytics.updateDetails('story-page-visible');
    expect(details.eventDetails).to.deep.equal({});
  });

  it('should mark event as repeated when fired more than once', () => {
    const trigger = env.sandbox.spy(analytics, 'triggerEvent');

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page2',
      index: 2,
    });

    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });

    expect(trigger).to.have.been.calledWith('story-page-visible');
    expect(trigger).to.have.been.calledThrice;
    expect(
      analytics.updateDetails('story-page-visible').eventDetails
    ).to.deep.include({
      'repeated': true,
    });
  });
});
