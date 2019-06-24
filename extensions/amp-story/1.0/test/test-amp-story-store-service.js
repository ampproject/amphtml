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
  UIType,
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

  it('should toggle the desktop state when setting a UI State', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.DESKTOP_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_UI, UIType.DESKTOP_PANELS);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should update the current page id', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.CURRENT_PAGE_ID, listenerSpy);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith('test-page');
  });

  it('should update the current page index', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.CURRENT_PAGE_INDEX, listenerSpy);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'test-page',
      index: 1,
    });
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(1);
  });

  it('should toggle the has audio state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.STORY_HAS_AUDIO_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_STORY_HAS_AUDIO, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should toggle the viewport warning state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.VIEWPORT_WARNING_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_VIEWPORT_WARNING, true);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(true);
  });

  it('should toggle the supported browser state', () => {
    const listenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.SUPPORTED_BROWSER_STATE, listenerSpy);
    storeService.dispatch(Action.TOGGLE_SUPPORTED_BROWSER, false);
    expect(listenerSpy).to.have.been.calledOnce;
    expect(listenerSpy).to.have.been.calledWith(false);
  });

  it('should pause the story when displaying the share menu', () => {
    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(true);
  });

  it('should pause the story when displaying the bookend', () => {
    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);
    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(true);
  });

  it('should unpause the story when closing the bookend', () => {
    // First open the bookend.
    storeService.dispatch(Action.TOGGLE_BOOKEND, true);

    // Close the bookend.
    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_BOOKEND, false);

    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(false);
  });

  it('should unpause the story when hiding the share menu', () => {
    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_SHARE_MENU, false);
    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(false);
  });

  it('should pause the story when displaying the info dialog', () => {
    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(true);
  });

  it('should unpause the story when hiding the info dialog', () => {
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);

    const pausedListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.PAUSED_STATE, pausedListenerSpy);
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, false);
    expect(pausedListenerSpy).to.have.been.calledOnce;
    expect(pausedListenerSpy).to.have.been.calledWith(false);
  });

  it('should not update PAUSED_STATE if ACCESS_STATE is unchanged', () => {
    // Story is paused.
    storeService.dispatch(Action.TOGGLE_PAUSED, true);

    // ACCESS_STATE was already false but is set to false again.
    expect(storeService.get(StateProperty.ACCESS_STATE)).to.be.false;
    storeService.dispatch(Action.TOGGLE_ACCESS, false);

    // PAUSED_STATE did not get affected.
    expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
  });

  it('should add an action to the whitelist', () => {
    const action1 = {tagOrTarget: 'foo', method: 1};
    const action2 = {tagOrTarget: 'foo', method: 2};

    storeService.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, action1);

    const actionsListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.ACTIONS_WHITELIST, actionsListenerSpy);

    storeService.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, action2);

    expect(actionsListenerSpy).to.have.been.calledOnceWithExactly([
      action1,
      action2,
    ]);
  });

  it('should add an array of actions to the whitelist', () => {
    const action1 = {tagOrTarget: 'foo', method: 1};
    const action2 = {tagOrTarget: 'foo', method: 2};
    const action3 = {tagOrTarget: 'foo', method: 3};

    storeService.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, action1);

    const actionsListenerSpy = sandbox.spy();
    storeService.subscribe(StateProperty.ACTIONS_WHITELIST, actionsListenerSpy);

    storeService.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, [action2, action3]);

    expect(actionsListenerSpy).to.have.been.calledOnceWithExactly([
      action1,
      action2,
      action3,
    ]);
  });
});
