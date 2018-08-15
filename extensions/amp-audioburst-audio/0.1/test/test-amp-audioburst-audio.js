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

// import {AmpAudioburstAudio} from '../amp-audioburst-audio';

describes.realWin('amp-audioburst-audio', {
  amp: {
    extensions: ['amp-audioburst-audio'],
  },
}, env => {

  let win;
  let audioburstAudio;

  beforeEach(() => {
    win = env.win;
    audioburstAudio = win.document.createElement('amp-audioburst-audio');
    audioburstAudio.setAttribute('layout', 'fixed-height');
    audioburstAudio.setAttribute('height', '315');
    audioburstAudio.setAttribute('src', 'https://sapi.audioburst.com/audio/repo/play/web/R6rDYxkvqVOK.mp3');
    win.document.body.appendChild(audioburstAudio);
  });

  it('should create element', () => {
    expect(audioburstAudio.tagName).to.equal('AMP-AUDIOBURST-AUDIO');
  });
});
