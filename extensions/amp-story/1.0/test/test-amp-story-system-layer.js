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

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {ProgressBar} from '../progress-bar';
import {Services} from '../../../../src/services';
import {SystemLayer} from '../amp-story-system-layer';
import {registerServiceBuilder} from '../../../../src/service';

const NOOP = () => {};

describes.fakeWin('amp-story system layer', {amp: true}, (env) => {
  let win;
  let storeService;
  let systemLayer;
  let progressBarStub;
  let progressBarRoot;

  beforeEach(() => {
    win = env.win;

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    progressBarRoot = win.document.createElement('div');

    progressBarStub = {
      build: env.sandbox.stub().returns(progressBarRoot),
      getRoot: env.sandbox.stub().returns(progressBarRoot),
      updateProgress: env.sandbox.spy(),
    };

    env.sandbox.stub(ProgressBar, 'create').returns(progressBarStub);

    env.sandbox.stub(Services, 'vsyncFor').returns({
      mutate: (fn) => fn(),
    });

    systemLayer = new SystemLayer(win, win.document.body);
  });

  it('should build UI', () => {
    const initializeListeners = env.sandbox
      .stub(systemLayer, 'initializeListeners_')
      .callsFake(NOOP);

    const root = systemLayer.build();

    expect(root).to.not.be.null;

    expect(initializeListeners).to.have.been.called;
  });

  // TODO(alanorozco, #12476): Make this test work with sinon 4.0.
  it.skip('should attach event handlers', () => {
    const rootMock = {addEventListener: env.sandbox.spy()};

    env.sandbox.stub(systemLayer, 'root_').callsFake(rootMock);
    env.sandbox.stub(systemLayer, 'win_').callsFake(rootMock);

    systemLayer.initializeListeners_();

    expect(rootMock.addEventListener).to.have.been.calledWith('click');
  });

  it('should set an attribute to toggle the UI when an ad is shown', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_AD, true);

    expect(systemLayer.getShadowRoot()).to.have.attribute('ad-showing');
  });

  it('should show that sound off on a page when muted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
    storeService.dispatch(Action.TOGGLE_MUTED, true);
    expect(systemLayer.getShadowRoot()).to.have.attribute('muted');
  });

  it('should show that this page has no sound when unmuted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, false);
    storeService.dispatch(Action.TOGGLE_MUTED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('muted');
    expect(systemLayer.getShadowRoot()).to.not.have.attribute(
      'i-amphtml-current-page-has-audio'
    );
  });

  it('should show that the sound is on when unmuted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
    storeService.dispatch(Action.TOGGLE_MUTED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('muted');
    expect(systemLayer.getShadowRoot()).to.have.attribute(
      'i-amphtml-current-page-has-audio'
    );
  });

  it('should show the sidebar control only if a sidebar exists', () => {
    storeService.dispatch(Action.TOGGLE_HAS_SIDEBAR, true);
    systemLayer.build();
    expect(systemLayer.getShadowRoot()).to.have.attribute(
      'i-amphtml-story-has-sidebar'
    );
  });

  it('should hide system layer on SYSTEM_UI_IS_VISIBLE_STATE change', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    expect(systemLayer.getShadowRoot()).to.have.class('i-amphtml-story-hidden');
  });

  it('should link the share button to the canonical URL', () => {
    systemLayer.build();
    const shareButton = systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-share-control');
    expect(shareButton).to.not.be.null;
    expect(shareButton.tagName).to.equal('A');
    // Default "canonical"
    expect(shareButton.href).to.equal('http://localhost:9876/context.html');
  });

  it('should show paused button if story has element with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    expect(systemLayer.getShadowRoot()).to.have.class(
      'i-amphtml-story-has-playback-ui'
    );
  });

  it('should enable paused button if page has element with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-pause-control')
    ).to.not.have.attribute('disabled');
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-play-control')
    ).to.not.have.attribute('disabled');
  });

  it('should disable paused button if page does not has elements with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, false);
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-pause-control')
    ).to.have.attribute('disabled');
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-play-control')
    ).to.have.attribute('disabled');
  });

  it('setting paused state to true should add the paused flag', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, true);
    expect(systemLayer.getShadowRoot()).to.have.attribute('paused');
  });

  it('setting paused state to false should not add the paused flag', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('paused');
  });

  it('click on the play button should change state to false', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, true);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-play-control')
      .click();
    expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('paused');
  });

  it('click on the pause button should change state to true', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, false);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-pause-control')
      .click();
    expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    expect(systemLayer.getShadowRoot()).to.have.attribute('paused');
  });
});
