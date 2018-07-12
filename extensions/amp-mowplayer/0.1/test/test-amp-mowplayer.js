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

import '../amp-mowplayer';


describes.realWin('amp-mowplayer', {
  amp: {
    extensions: ['amp-mowplayer'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getmowplayer(attributes) {
    const mow = doc.createElement('amp-mowplayer');

    for (const key in attributes) {
      mow.setAttribute(key, attributes[key]);
    }

    mow.setAttribute('width', '320');
    mow.setAttribute('height', '180');
    mow.setAttribute('layout', 'responsive');
    doc.body.appendChild(mow);
    return mow.build().then(() => mow.layoutCallback()).then(() => mow);
  }

  it('renders', () => {
    return getmowplayer({
      'data-media-id': 'myfwarfx4tb',
    }).then(mow => {
      const iframe = mow.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
          'https://cdn.mowplayer.com/player.html?code=myfwarfx4tb');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });


  it('fails if no media is specified', () => {
    return allowConsoleError(() => {
      return getmowplayer({}).should.eventually.be.rejectedWith(
          /the data-media-id attributes must exists/);
    });
  });

});
