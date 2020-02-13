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
      height: 100px;
      width: 100%;
      background-color: green;
    }
  `;

  const extensions = ['amp-fx-collection'];

  const defaultBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in'",
    {
      body: defaultBody,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('runs fade-in animation with default parameters', () => {
        // Not visible yet, opacity = 0;
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, 0.2 * getViewportHeight(win));
        return Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
          });
      });
    }
  );

  const marginSpecific = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in"
      data-margin-start='50%'>
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in'",
    {
      body: marginSpecific,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('margin-start specified', () => {
        // Not visible yet, opacity = 0;
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, 0.5 * getViewportHeight(win));
        return Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
          });
      });
    }
  );

  const durationSpecific = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in"
      data-duration='2000ms'>
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fade-in'",
    {
      body: durationSpecific,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
      });

      it('duration specified', () => {
        // Not visible yet, opacity = 0;
        expect(getOpacity(win)).to.equal(0);
        win.scrollTo(0, getViewportHeight(win));
        Promise.resolve()
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.be.above(0);
            expect(getOpacity(win)).to.be.below(1);
          })
          .then(timeout(2000))
          .then(() => {
            expect(getOpacity(win)).to.equal(1);
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
