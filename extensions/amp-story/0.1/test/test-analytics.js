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
import {StateChangeType} from '../navigation-state';
import {
  AnalyticsTrigger,
  setTriggerAnalyticsEventImplForTesting,
} from '../analytics';


describes.fakeWin('amp-story analytics', {}, env => {
  let win;
  let analyticsTrigger;
  let rootEl;

  beforeEach(() => {
    rootEl = env.win.document.createElement('div');
    analyticsTrigger = new AnalyticsTrigger(rootEl);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should trigger `story-page-visible` on change', () => {
    const trigger = setTriggerAnalyticsEventImplForTesting(sandbox.spy());

    analyticsTrigger.onStateChange({
      type: StateChangeType.ACTIVE_PAGE,
      value: {
        pageIndex: 123,
        pageId: 'my-page-id',
      },
    });

    expect(trigger).to.have.been.calledWith(rootEl, 'story-page-visible',
        sandbox.match(vars =>
            vars.pageIndex === '123' &&
            vars.pageId == 'my-page-id'));
  });

  it('should trigger `story-page-visible` only once per page', () => {
    const trigger = setTriggerAnalyticsEventImplForTesting(sandbox.spy());

    for (let i = 0; i < 10; i++) {
      analyticsTrigger.onStateChange({
        type: StateChangeType.ACTIVE_PAGE,
        value: {
          pageIndex: 123,
          pageId: 'my-page-id',
        },
      });
    }

    expect(trigger).to.have.been.calledOnce;
    expect(trigger).to.have.been.calledWith(rootEl, 'story-page-visible',
        sandbox.match(vars =>
            vars.pageIndex === '123' &&
            vars.pageId == 'my-page-id'));

    for (let i = 0; i < 10; i++) {
      analyticsTrigger.onStateChange({
        type: StateChangeType.ACTIVE_PAGE,
        value: {
          pageIndex: 6,
          pageId: 'foo-page-id',
        },
      });
    }

    expect(trigger).to.have.been.calledTwice;
    expect(trigger).to.have.been.calledWith(rootEl, 'story-page-visible',
        sandbox.match(vars =>
            vars.pageIndex === '6' &&
            vars.pageId == 'foo-page-id'));
  });
});
