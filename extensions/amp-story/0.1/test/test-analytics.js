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
import {AmpStoryAnalytics} from '../analytics';
import {StateChangeType} from '../navigation-state';


describes.fakeWin('amp-story analytics', {}, env => {
  let analytics;
  let rootEl;

  beforeEach(() => {
    rootEl = env.win.document.createElement('div');
    analytics = new AmpStoryAnalytics(rootEl);
  });

  it('should trigger `story-page-visible` on change', () => {
    const trigger = sandbox.stub(analytics, 'triggerEvent_');

    analytics.onStateChange({
      type: StateChangeType.ACTIVE_PAGE,
      value: {
        pageIndex: 123,
        pageId: 'my-page-id',
      },
    });

    expect(trigger).to.have.been.calledWith('story-page-visible',
        sandbox.match(vars =>
          vars.storyPageIndex === '123' &&
            vars.storyPageId == 'my-page-id'));
  });

  it('should trigger `story-page-visible` only once per page', () => {
    const trigger = sandbox.stub(analytics, 'triggerEvent_');

    for (let i = 0; i < 10; i++) {
      analytics.onStateChange({
        type: StateChangeType.ACTIVE_PAGE,
        value: {
          pageIndex: 123,
          pageId: 'my-page-id',
        },
      });
    }

    expect(trigger).to.have.been.calledOnce;
    expect(trigger).to.have.been.calledWith('story-page-visible',
        sandbox.match(vars =>
          vars.storyPageIndex === '123' &&
            vars.storyPageId == 'my-page-id'));

    for (let i = 0; i < 10; i++) {
      analytics.onStateChange({
        type: StateChangeType.ACTIVE_PAGE,
        value: {
          pageIndex: 6,
          pageId: 'foo-page-id',
        },
      });
    }

    expect(trigger).to.have.been.calledTwice;
    expect(trigger).to.have.been.calledWith('story-page-visible',
        sandbox.match(vars =>
          vars.storyPageIndex === '6' &&
            vars.storyPageId == 'foo-page-id'));
  });
});
