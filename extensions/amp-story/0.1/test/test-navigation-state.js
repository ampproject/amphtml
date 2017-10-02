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
import {NavigationState, StateChangeType} from '../navigation-state';


describes.fakeWin('amp-story navigation state', {}, () => {
  let navigationState;

  function createObserver() {
    return sandbox.spy();
  }

  beforeEach(() => {
    navigationState = new NavigationState();
  });

  it('should dispatch active page changes to all observers', () => {
    const observers = Array(5).fill(undefined).map(createObserver);

    observers.forEach(observer => navigationState.observe(observer));

    navigationState.updateActivePage(0, 'my-page-id-1');

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
          e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 0
              && e.value.pageId == 'my-page-id-1'));
    });

    navigationState.updateActivePage(5);

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
          e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 5
              && !('pageId' in e.value)));
    });

    navigationState.updateActivePage(2, 'one-two-three');

    observers.forEach(observer => {
      expect(observer).to.have.been.calledWith(sandbox.match(e =>
          e.type == StateChangeType.ACTIVE_PAGE
              && e.value.pageIndex === 2
              && e.value.pageId == 'one-two-three'));
    });
  });
});
