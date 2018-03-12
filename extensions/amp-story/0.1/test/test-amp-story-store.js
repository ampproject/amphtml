/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Action, StateProperty, Store} from '../amp-story-store';
import {EmbedMode, EmbedModeParam} from '../embed-mode';


describes.fakeWin('amp-story-store', {}, () => {
  let store;

  beforeEach(() => {
    // Making sure we always get a new instance to isolate each test.
    store = new Store();
  });

  it('should return the default state', () => {
    expect(store.get(StateProperty.CAN_SHOW_BOOKEND)).to.be.true;
  });

  it('should subscribe to property mutations and receive the new value', () => {
    const listenerSpy = sandbox.spy();
    store.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    store.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should not trigger a listener if another property changed', () => {
    const listenerSpy = sandbox.spy();
    store.subscribe(StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP, listenerSpy);
    store.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.callCount(0);
  });

  it('should always retrieve the same global store instance', () => {
    const listenerSpy = sandbox.spy();
    const firstStore = Store.getInstance();
    const secondStore = Store.getInstance();

    // Subscribing from one store and dispatching from the other works since it
    // actually returned the same global instance.
    firstStore.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    secondStore.dispatch(Action.TOGGLE_BOOKEND, true);

    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });
});

describes.fakeWin('amp-story-store embed mode', {}, () => {
  let store;

  beforeEach(() => {
    // Initializing the store with an embed mode.
    self.location.hash = `${EmbedModeParam}=${EmbedMode.NAME_TBD}`;
    store = new Store();
  });

  it('should override the state with the expected mode', () => {
    expect(store.get(StateProperty.CAN_SHOW_BOOKEND)).to.be.false;
  });

  after(() => {
    self.location.hash = '';
  });
});
