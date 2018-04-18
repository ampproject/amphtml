/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  AutoFullscreenManager,
} from '../../src/service/video-manager-impl';

describes.fakeWin('Rotate-to-fullscreen', {amp: true}, env => {
  let ampdoc;
  let autoFullscreenManager;

  function createVideo() {
    const element = env.win.document.createElement('div');
    const noop = () => {};
    Object.assign(element, {
      getIntersectionChangeEntry: noop,
    });
    return {element};
  }

  function mockCenteredVideo(element) {
    autoFullscreenManager.currentlyCentered_ = element;
  }

  function mockOrientation(orientation) {
    env.win.screen = env.win.screen || {orientation};
    sandbox.stub(env.win.screen, 'orientation').returns(orientation);
  }

  beforeEach(() => {
    ampdoc = env.ampdoc;
    autoFullscreenManager = new AutoFullscreenManager(ampdoc);
  });

  it('should enter fullscreen if a video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(video.element);

    sandbox.stub(autoFullscreenManager, 'updateVisibility_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.have.been.calledOnce;
  });

  it('should not enter fullscreen if no video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(null);

    sandbox.stub(autoFullscreenManager, 'updateVisibility_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.not.have.been.called;
  });
});
