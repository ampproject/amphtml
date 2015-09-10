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

import {createIframe} from '../../testing/iframe';
import {installPixel} from '../../src/amp-pixel';

describe('amp-pixel', () => {


  function getPixel(src) {
    var iframe = createIframe();
    installPixel(iframe.win);
    var p = iframe.doc.createElement('amp-pixel');
    p.setAttribute('width', '0');
    p.setAttribute('height', '0');
    p.setAttribute('src', src);
    iframe.doc.body.appendChild(p);
    p.implementation_.loadContent();
    return p;
  }

  it('should load a pixel', () => {
    var p = getPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
    expect(p.querySelector('img')).to.be.an.instanceof(Image)
    expect(p.children[0].src).to.equal(
      'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
  });

  it('should load a pixel with protocol relative URL', () => {
    var p = getPixel(
        '//pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
    expect(p.querySelector('img')).to.be.an.instanceof(Image)
    expect(p.children[0].src).to.equal(
      'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?');
  });

  it('replace $RANDOM', () => {
    var p = getPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=$RANDOM?');
    expect(p.querySelector('img')).to.be.an.instanceof(Image)
    expect(p.children[0].src).to.match(/ord=(\d\.\d+)\?$/);
  });

  it('should throw for invalid URL', () => {
    expect(function() {
      getPixel(
          'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=$RANDOM?');
    }).to.throw(/src attribute must start with/);
  });
});
