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
import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {NavigationState, StateChangeType} from '../navigation-state';
import {registerServiceBuilder} from '../../../../src/service';


describes.fakeWin('amp-story navigation state', {ampdoc: 'none'}, env => {
  let navigationState;
  let hasBookend = false;
  let storeService;

  function createObserver() {
    return sandbox.spy();
  }

  beforeEach(() => {
    storeService = new AmpStoryStoreService(env.win);
    registerServiceBuilder(env.win, 'story-store', () => storeService);
    hasBookend = false;
    navigationState = new NavigationState(env.win,
        // Not using `Promise.resolve` since we need synchronicity.
        () => ({then(fn) { fn(hasBookend); }}));
  });

  it('should dispatch active page changes to all observers', () => {
    const observers = Array(5).fill(undefined).map(createObserver);

    observers.forEach(observer => navigationState.observe(observer));

    navigationState.updateActivePage(0, 10, 'my-page-id-1');

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
        e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 0
              && e.value.totalPages === 10
              && e.value.pageId == 'my-page-id-1'));
    });

    navigationState.updateActivePage(5, 15);

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
        e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 5
              && e.value.totalPages === 15
              && !('pageId' in e.value)));
    });

    navigationState.updateActivePage(2, 5, 'one-two-three');

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
        e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 2
              && e.value.totalPages === 5
              && e.value.pageId == 'one-two-three'));
    });
  });

  it('should dispatch END on last page if story does NOT have bookend', () => {
    const observer = sandbox.spy();

    navigationState.observe(event => observer(event));

    hasBookend = false;

    navigationState.updateActivePage(1, 2);

    expect(observer).to.have.been.calledWith(sandbox.match(e =>
      e.type == StateChangeType.ACTIVE_PAGE
          && e.value.pageIndex === 1
          && e.value.totalPages === 2));

    expect(observer).to.have.been.calledWith(sandbox.match(e =>
      e.type == StateChangeType.END));
  });

  it('should NOT dispatch END on last page if story has bookend', () => {
    const observer = sandbox.spy();

    navigationState.observe(event => observer(event));

    hasBookend = true;

    navigationState.updateActivePage(1, 2);

    expect(observer).to.have.been.calledWith(sandbox.match(e =>
      e.type == StateChangeType.ACTIVE_PAGE
          && e.value.pageIndex === 1
          && e.value.totalPages === 2));

    expect(observer).to.not.have.been.calledWith(sandbox.match(e =>
      e.type == StateChangeType.END));
  });

  it('should dispatch BOOKEND_ENTER/END and BOOKEND_EXIT', () => {
    const observer = sandbox.spy();

    navigationState.observe(event => observer(event.type));

    storeService.dispatch(Action.TOGGLE_BOOKEND, true);

    expect(observer).to.have.been.calledWith(StateChangeType.BOOKEND_ENTER);
    expect(observer).to.have.been.calledWith(StateChangeType.END);

    storeService.dispatch(Action.TOGGLE_BOOKEND, false);

    expect(observer).to.have.been.calledWith(StateChangeType.BOOKEND_EXIT);
  });
});
