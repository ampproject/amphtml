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
import {AmpStory} from '../amp-story';
import {
  exitFullScreen,
  isFullScreenSupported,
  requestFullScreen,
} from '../fullscreen';


describes.fakeWin('amp-story fullscreen', {
}, env => {
  afterEach(() => {
    sandbox.restore();
  });

  it('should use browser-specific request full screen API', () => {
    [
      'requestFullscreen',
      'webkitRequestFullScreen',
      'mozRequestFullScreen',
      'msRequestFullscreen',
    ].forEach(method => {
      const el = {};
      el[method] = sandbox.spy();

      requestFullScreen(el);

      expect(el[method]).to.be.calledOnce;
    });
  });

  it('should use browser-specific exit full screen API', () => {
    [
      'exitFullscreen',
      'webkitExitFullscreen',
      'mozCancelFullScreen',
      'msExitFullscreen',
    ].forEach(method => {
      const doc = {};
      doc[method] = sandbox.spy();

      exitFullScreen({ownerDocument: doc});

      expect(doc[method]).to.be.calledOnce;
    });
  });

  it('should be supported if the browser supports it', () => {
    [
      'requestFullscreen',
      'webkitRequestFullScreen',
      'mozRequestFullScreen',
      'msRequestFullscreen',
    ].forEach(method => {
      const el = {};
      el[method] = true;

      expect(isFullScreenSupported(el)).to.be.true;
    });
  });

  it('should not be supported if the browser does not support it', () => {
    expect(isFullScreenSupported({})).to.be.false;
  });
});
