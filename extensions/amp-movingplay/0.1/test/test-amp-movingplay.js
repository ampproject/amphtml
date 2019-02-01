/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-movingplay';


describes.realWin('amp-movingplay', {
  amp: {
    extensions: ['amp-movingplay'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getPlayer(attributes) {
    const mov = doc.createElement('amp-movingplay');
    for (const key in attributes) {
      mov.setAttribute(key, attributes[key]);
    }
    mov.setAttribute('width', '320');
    mov.setAttribute('height', '180');
    mov.setAttribute('layout', 'responsive');
    doc.body.appendChild(mov);
    return mov.build().then(() => { mov.layoutCallback(); return mov; });
  }

  it('the player should be renders', () => {
    return getPlayer({
      'data-player-id':'3e1eee5a68d65bf24db48d994ab6a7a7',
      'data-media-id': '5678WxYz',
      'data-vp-id': '0',
      'data-o-id':"",
      'layout':"responsive"
    }).then(mov => {
      const iframe = mov.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://cdn.movingplay.it/amp/movplay.html?idp=3e1eee5a68d65bf24db48d994ab6a7a7&idv=0&oid=' 
      );
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('fails if no player is specified', () => {
    return allowConsoleError(() => { return getPlayer({
      'data-media-id': '5678WxYz',
      'data-vp-id': '0',
      'data-o-id':"",
      'layout':"responsive"
    }).should.eventually.be.rejectedWith(
        /The data-player-id attribute is required for/);
    });
  });

  it('fails if no data-media is specified', () => {
    return allowConsoleError(() => { return getPlayer({
      'data-player-id':'3e1eee5a68d65bf24db48d994ab6a7a7',
      'data-vp-id': '0',
      'data-o-id':"",
      'layout':"responsive"
    }).should.eventually.be.rejectedWith(
        /The data-media-id attribute is required for/);
    });
  });

});