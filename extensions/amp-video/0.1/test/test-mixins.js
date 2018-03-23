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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or videoImplied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AmpVideo} from '../amp-video';
import {Services} from '../../../../src/services';
import {VideoElementMixin, MediaPoolVideoMixin} from '../mixins';


describes.fakeWin('amp-video mixins', {}, env => {
  let win;
  let doc;
  let element;
  let videoImpl;

  const vsync = {
    mutate(fn) {
      fn();
    },
  };

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    element = doc.createElement('amp-video');
    videoImpl = {
      element,
      getVsync() {
        return vsync;
      },
    };
  });

  describe('VideoElementMixin', () => {

    it('should create and append a video as base node', () => {
      const mixin = new VideoElementMixin(videoImpl);
      const baseNode = mixin.createBaseNode();

      expect(baseNode.tagName).to.equal('VIDEO');
      expect(element.firstElementChild).to.equal(baseNode);
    });
  });

  describe('MediaPoolVideoMixin', () => {
    let pool;
    let hlsStub;

    beforeEach(() => {
      pool = {
        play: sandbox.spy(),
        pause: sandbox.spy(),
      };

      sandbox.stub(Services, 'mediaPoolFor')
          .returns(Promise.resolve(pool));
    });

    it('should create and append a video as base node', () => {
      const mixin = new MediaPoolVideoMixin(videoImpl);
      const baseNode = mixin.createBaseNode();

      expect(baseNode.tagName).to.equal('VIDEO');
      expect(element.firstElementChild).to.equal(baseNode);
    });

    it('should delegate play/pause/mute/controls to media pool', () => {
      const mixin = new MediaPoolVideoMixin(videoImpl);

      return Promise.resolve()
        .then(() => mixin.play())
        .then(() => expect(pool.play).to.have.been.calledOnce)
        .then(() => mixin.pause())
        .then(() => expect(pool.pause).to.have.been.calledOnce);
    });
  });
});
