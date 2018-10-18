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

const config = describe.configure().ifNewChrome();
config.run('amp-fx-collection', function() {
  this.timeout(100000);

  const css = `
    .spacer {
      height: 100vh;
      width: 100%;
      background-color: red;
    }

    #animTarget {
      opacity: 0;
      height: 100vh;
      width: 100%;
      background-image: https://picsum.photos/1600/900?image=981;
    }
  `;

  const extensions = ['amp-fx-collection'];

  const normalParallaxBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="parallax"
      data-parallax-factor="1">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration("amp-fx='parallax'", {
    body: normalParallaxBody,
    css,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('runs parallax animation with normal parallax', () => {
      expect(getTop(win)).to.equal(getViewportHeight(win));
      win.scrollTo(0, 0.1 * getViewportHeight(win));
      return Promise.resolve().then(timeout(2000))
          .then(() => {
            expect(getTop(win)).to.equal(0.9 * getViewportHeight(win));
          });
    });
  });

  const fastParallaxBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="parallax"
      data-parallax-factor="2">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration("amp-fx='parallax'", {
    body: fastParallaxBody,
    css,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('runs parallax animation with fast parallax', () => {
      expect(getTop(win)).to.equal(getViewportHeight(win));
      win.scrollTo(0, 0.1 * getViewportHeight(win));
      return Promise.resolve().then(timeout(2000))
          .then(() => {
            expect(getTop(win)).to.be.below(0.9 * getViewportHeight(win));
          });
    });
  });

  const slowParallaxBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="parallax"
      data-parallax-factor="0.5">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration("amp-fx='parallax'", {
    body: slowParallaxBody,
    css,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('runs parallax animation with slow parallax', () => {
      expect(getTop(win)).to.equal(getViewportHeight(win));
      win.scrollTo(0, 0.1 * getViewportHeight(win));
      return Promise.resolve().then(timeout(2000))
          .then(() => {
            expect(getTop(win)).to.be.above(0.9 * getViewportHeight(win));
          });
    });
  });
});

function getTop(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return parseFloat(animTarget.getBoundingClientRect().top);
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}
