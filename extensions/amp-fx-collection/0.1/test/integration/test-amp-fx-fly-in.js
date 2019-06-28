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

import {isExperimentOn, toggleExperiment} from '../../../../../src/experiments';

describe.skip('amp-fx-collection', function() {
  const css = `
    .spacer {
      height: 100vh;
      width: 100%;
      background-color: red;
    }

    #animTarget {
      height: 100px;
      width: 100%;
      top: 20vh;
      background-color: green;
    }
  `;

  const extensions = ['amp-fx-collection'];

  // Can't test a default `fly-in-left` animation as the
  // `data-fly-in-distance` and `data-duration` parameters differ/device.
  const bodyLeft = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fly-in-left"
      data-duration="500ms"
      data-fly-in-distance="25%"
      data-margin-start="20%">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fly-in-left'",
    {
      body: bodyLeft,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
        toggleExperiment(win, 'amp-fx-fly-in', true, false);
      });
      //TODO(esth, #19392): Fails on Firefox 63.0.0
      it.skip('runs fly-in-left animation with default parameters', () => {
        expect(isExperimentOn(win, 'amp-fx-fly-in')).to.be.true;
        const initialLeft = getComputedLeft(win);
        win.scrollTo(0, 0.5 * getViewportHeight(win));
        return timeout(2000).then(() => {
          expect(getComputedLeft(win)).to.be.above(initialLeft);
        });
      });
    }
  );

  // Can't test a default `fly-in-right` animation as the
  // `data-fly-in-distance` and `data-duration` parameters differ/device.
  const bodyRight = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fly-in-right"
      data-duration="500ms"
      data-fly-in-distance="25%"
      data-margin-start="20%">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fly-in-right'",
    {
      body: bodyRight,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
        toggleExperiment(win, 'amp-fx-fly-in', true, false);
      });
      //TODO(esth, #19392): Fails on Firefox 63.0.0
      it.skip('runs fly-in-right animation with default parameters', () => {
        expect(isExperimentOn(win, 'amp-fx-fly-in')).to.be.true;
        const initialLeft = getComputedLeft(win);
        win.scrollTo(0, 0.5 * getViewportHeight(win));
        return timeout(2000).then(() => {
          expect(getComputedLeft(win)).to.be.below(initialLeft);
        });
      });
    }
  );

  // Can't test a default `fly-in-bottom` animation as the
  // `data-fly-in-distance` and `data-duration` parameters differ/device.
  const bodyBottom = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fly-in-bottom"
      data-duration="500ms"
      data-fly-in-distance="25%"
      data-margin-start="20%">
    </div>
    <div class="spacer"></div>
  `;

  describes.integration(
    "amp-fx='fly-in-bottom'",
    {
      body: bodyBottom,
      css,
      extensions,
    },
    env => {
      let win;
      beforeEach(() => {
        win = env.win;
        toggleExperiment(win, 'amp-fx-fly-in', true, false);
      });

      it('runs fly-in-bottom animation with default parameters', () => {
        expect(isExperimentOn(win, 'amp-fx-fly-in')).to.be.true;
        const initialTop = getComputedTop(win);
        win.scrollTo(0, 0.5 * getViewportHeight(win));
        return timeout(2000).then(() => {
          expect(getComputedTop(win)).to.be.below(initialTop);
        });
      });
    }
  );
});

function getComputedTop(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return animTarget.getBoundingClientRect().top;
}

function getComputedLeft(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return animTarget.getBoundingClientRect().left;
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
