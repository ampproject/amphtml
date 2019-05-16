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

const config = describe.configure().ifChrome();
config.run('amp-fx-collection', function() {
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
      background-color: green;
    }
  `;

  const extensions = ['amp-fx-collection'];

  const defaultBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in-scroll">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in-scroll'",
    {
      body: defaultBody,
      css,
      extensions,
      timeout: 20000,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('runs fade-in-scroll animation with default parameters', () => {
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, 0.1 * getViewportHeight(win));
        return Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            // Since the animation is spread over 50% of the viewport,
            // scrolling 10% of the viewport should change the opacity by 20%
            expect(getOpacity(win)).to.equal(0.2);
            win.scrollTo(0, 0.4 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0.8);
            win.scrollTo(0, 0.5 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
            win.scrollTo(0, 0.7 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
            win.scrollTo(0, 0.4 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
          });
      });
    }
  );

  const marginSpecifiedBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in-scroll"
      data-margin-start='20%'
      data-margin-end='70%'>
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in-scroll'",
    {
      body: marginSpecifiedBody,
      css,
      extensions,
      timeout: 15000,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('runs fade-in-scroll animation with margins specified', () => {
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, 0.1 * getViewportHeight(win));
        return Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0);
            win.scrollTo(0, 0.2 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0);
            win.scrollTo(0, 0.4 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0.4);
          });
      });
    }
  );

  const repeatSpecifiedBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in-scroll"
      data-repeat>
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in-scroll'",
    {
      body: repeatSpecifiedBody,
      css,
      extensions,
      timeout: 20000,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('runs fade-in-scroll animation with repeat specified', () => {
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, 0.1 * getViewportHeight(win));
        return Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0.2);
            win.scrollTo(0, 0.4 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0.8);
            win.scrollTo(0, 0.5 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
            win.scrollTo(0, 0.7 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
            win.scrollTo(0, 0.4 * getViewportHeight(win));
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(0.8);
          });
      });
    }
  );
});

function getOpacity(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return parseFloat(win.getComputedStyle(animTarget).opacity);
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}
