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

import {computedStyle} from '../../../../../src/style';
import {isExperimentOn, toggleExperiment} from '../../../../../src/experiments';

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
      height: 100px;
      width: 100%;
      top: 20vh;
      background-color: green;
    }
  `;

  const extensions = ['amp-fx-collection'];

  const defaultBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fly-in-bottom"
      data-fly-in-distance="25%"
      data-duration="1000ms" style="color: red; background-color: green;">
      Test text
    </div>
    <div class="spacer"></div>
  `;

  describes.integration("amp-fx='fly-in-bottom'", {
    body: defaultBody,
    css,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-fx-fly-in', true, false);
    });

    it('runs fly-in-bottom animation', () => {
      expect(isExperimentOn(win, 'amp-fx-fly-in')).to.be.true;
      win.scrollTo(0, 0.8 * getViewportHeight(win));
      return Promise.resolve().then(timeout(100000))
          .then(() => {
            expect(getAttributeTop(win)).to.equal('calc(30px + 25vh)');
            expect(getComputedTop(win)).to.equal(0.2 * getViewportHeight(win) + 'px');
          });
    });
  });
});

function getAttributeTop(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return animTarget.style.getPropertyValue('top');
}

function getComputedTop(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return computedStyle(win, animTarget).top;
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}

