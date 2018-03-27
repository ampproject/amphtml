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

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {EmbedMode, EmbedModeParam} from '../embed-mode';


describes.fakeWin('amp-story-store-service', {}, env => {
  let storeService;

  beforeEach(() => {
    // Making sure we always get a new instance to isolate each test.
    storeService = new AmpStoryStoreService(env.win);
  });

  it('should return the default state', () => {
    expect(storeService.get(StateProperty.CAN_SHOW_BOOKEND)).to.be.true;
  });

  it('should subscribe to property mutations and receive the new value', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should not trigger a listener if another property changed', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.CAN_INSERT_AUTOMATIC_AD, listenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.callCount(0);
  });

  it('should not trigger a listener on subscribe by default', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    expect(listenerSpy).to.have.callCount(0);
  });

  it('should trigger a listener on subscribe if option is set to true', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.BOOKEND_STATE, listenerSpy, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(false);
  });
});

describes.fakeWin('amp-story-store-service embed mode', {}, env => {
  let storeService;

  beforeEach(() => {
    // Initializing the store with an embed mode.
    env.win.location = `#${EmbedModeParam}=${EmbedMode.NAME_TBD}`;
    storeService = new AmpStoryStoreService(env.win);
  });

  it('should override the state with the expected mode', () => {
    expect(storeService.get(StateProperty.CAN_SHOW_BOOKEND)).to.be.false;
  });
});

describes.fakeWin('amp-story-store-service actions', {}, env => {
  let storeService;

  beforeEach(() => {
    // Making sure we always get a new instance to isolate each test.
    storeService = new AmpStoryStoreService(env.win);
  });

  it('should toggle the bookend', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should not toggle the bookend if embed mode disables it', () => {
    const listenerSpy = sandbox.spy();
    storeService.state_[StateProperty.CAN_SHOW_BOOKEND] = false;
    storeService.subscribe(StateProperty.BOOKEND_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(listenerSpy).to.have.callCount(0);
  });

  it('should toggle the muted state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.MUTED_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_MUTED, false);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(false);
  });

  it('should toggle the desktop state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.DESKTOP_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_DESKTOP, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should update the current page', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.CURRENT_PAGE_ID, listenerSpy);
    storeService.dispatch(Action.CHANGE_PAGE, 'test-page');
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith('test-page');
  });

  it('should toggle the has audio state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.HAS_AUDIO_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_HAS_AUDIO, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should set the fallback state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.FALLBACK_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_FALLBACK, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });
});
