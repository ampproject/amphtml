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

import {AmpAudio} from '../amp-bodymovin-player';


describes.realWin('amp-bodymovin-player', {
  amp: {
    extensions: ['amp-bodymovin-player'],
  },
}, env => {
  let win, doc;
  let ampAudio;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpBodymovinPlayer(attributes) {
    ampBodymovinPlayer = doc.createElement('amp-bodymovin-player');
    for (const key in attributes) {
      ampBodymovinPlayer.setAttribute(key, attributes[key]);
    }
    doc.body.appendChild(ampBodymovinPlayer);
    return ampBodymovinPlayer.build().then(() => {
      return ampBodymovinPlayer.layoutCallback();
    }).then(() => ampBodymovinPlayer);
  }

  it('test', () => {
    expect('true').to.equal('true');
  });
});
