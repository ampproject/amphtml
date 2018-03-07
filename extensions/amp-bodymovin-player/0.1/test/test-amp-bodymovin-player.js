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

import '../amp-bodymovin-player';

describes.realWin('amp-bodymovin-player', {
  amp: {
    extensions: ['amp-bodymovin-player'],
  },
}, function(env) {
  this.timeout(5000);

  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpBodymovinPlayer(attributes) {
    const ampBP = doc.createElement('amp-bodymovin-player');
    for (const key in attributes) {
      ampBP.setAttribute(key, attributes[key]);
    }
    console.log(ampBP);
    doc.body.appendChild(ampBP);
    return ampBP;
  }

  // add test for https only

  it('`src` attribute is mandatory', () => {
    const attrs = {
      'loop': 'false',
    };
    expect(getAmpBodymovinPlayer(attrs)).to.eventually.throw;
  });

  it.only('Test that animation autoplays by default', () => {
    const attrs = {'src': 'https://nainar.github.io/loader.json'};
    const ampBP = getAmpBodymovinPlayer(attrs);
    console.log(ampBP);
    expect(ampBP.hasAttribute('no-autoplay')).to.be.false;
    expect(ampBP.hasAttribute('data-autoplay')).to.be.true;
  });

  it('Test that `loop` is overriden when set to `false`', () => {
    const attrs = {
      'src': 'https://nainar.github.io/loader.json',
      'loop': 'false',
    };
    const ampBP = getAmpBodymovinPlayer(attrs);
    console.log(ampBP);
    expect(ampBP.getAttribute('loop')).to.equal('false');
    expect(ampBP.getAttribute('data-loop')).to.equal('false');
  });


  it('Test that `loop` is overriden when set to a number', () => {
    const attrs = {
      'src': 'https://nainar.github.io/loader.json',
      'loop': '10',
    };
    const ampBP = getAmpBodymovinPlayer(attrs);
    expect(ampBP.getAttribute('loop')).to.equal('10');
    expect(ampBP.getAttribute('data-loop')).to.equal('10');
  });

});
