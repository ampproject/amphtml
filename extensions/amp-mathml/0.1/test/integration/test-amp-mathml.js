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

import {poll} from '../../../../../testing/iframe';

describe.configure().skipSafari().skipEdge().run('amp-mathml', function() {
  this.timeout(5000);
  const extensions = ['amp-mathml'];

  const mathmlBody = `
  <h2>The Quadratic Formula</h2>
  <amp-mathml layout="container" data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]">
  </amp-mathml>
  <h2>Cauchy's Integral Formula</h2>
  <amp-mathml layout="container" data-formula="\[f(a) = \frac{1}{2\pi i} \oint\frac{f(z)}{z-a}dz\]">
  </amp-mathml>
  <h2>Double angle formula for Cosines</h2>
  <amp-mathml layout="container" data-formula="\[ \cos(θ+φ)=\cos(θ)\cos(φ)−\sin(θ)\sin(φ) \]">
  </amp-mathml>
  <h2>Inline formula.</h2>
  This is an example of a formula placed  inline in the middle of a block of text. <amp-mathml layout="container" inline data-formula="\[ \cos(θ+φ) \]"></amp-mathml> This shows how the formula will fit inside a block of text and can be styled with CSS.

  `;
  describes.integration('mathml render', {
    body: '<amp-mathml layout="container" data-formula="\[x = {-b \pm \sqrt{b^2-4ac} \over 2a}.\]"></amp-mathml>',
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });
console.log('test';)
    it('should create iframe that is resized to something bigger than 1px', () => {
      const mathiframe = win.document.getElementById('sidebarOpener');
      console.log( 'waitForIframeToLoad' );
      const openedPromise = waitForIframeToLoad(win.document);

      return openedPromise.then(() => {

        expect(win.document.activeElement).to.equal(openerButton);
      });
    });
  });
});

function waitForIframeToLoad(document) {
  return poll('wait for mathml iframe to render', () => {
    const rendered = document.getElementById('MathJax-Element-1-Frame');
    return rendered.style.display == '';
  });
}
