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

import {poll} from '../../testing/iframe';

function getScrollboundAnimationCss() {
  return `
    .spacer {
      height: 100vh;
    }
  `;
}
function getScrollboundAnimationFixture() {
  const css = `
  .spacer {
    height: 100vh;
    width: 2px;
  }

  #animTarget {
    opacity: 0;
    height: 10px;
    width: 100%;
    background-color: red;
  }
  `;
  const body = `
  <amp-animation id="anim" layout="nodisplay">
    <script type="application/json">
      {
      "duration": "100ms",
      "animations": [
        {
          "selector": "#animTarget",
          "fill": "both",
          "keyframes": [
            { "opacity": "0" },
            { "opacity": "1" }
          ]
        }
      ]
    }
    </script>
  </amp-animation>
  <div class="spacer"></div>
  <div>
    <amp-position-observer
      on="scroll:anim.seekTo(percent=event.percent)"
      layout="nodisplay">
    </amp-position-observer>

    <div id="animTarget"></div>
  </div>
  <div class="spacer"></div>
  `;

  return {css, body};
};
describe.configure().skipSauceLabs().run('amp-position-observer', function() {
  this.timeout(5000);
  const fixture = getScrollboundAnimationFixture();
  describes.integration('scrollbound animation', {
    body: fixture.body,
    css: fixture.css,
    extensions: ['amp-animation', 'amp-position-observer'],
    experiments: ['amp-animation', 'amp-position-observer'],
  }, env => {
    /*
     * scrollbound amp-animation will make the target will go
     * from opacity 0 to 1 with scroll.
     **/
    it('run animation with scroll', () => {
      const win = env.win;
      const doc = win.document;
      const animTarget = doc.querySelector('#animTarget');
      const getOpacity = () => {
        return parseFloat(win.getComputedStyle(animTarget).opacity);
      };

      const waitForOpacity = factor => {
        return poll('wait for opacity to be ' + factor, () => {
          return getOpacity() == factor;
        });
      };

      const getViewportHeight = () => {
        return doc.querySelector('.spacer').offsetHeight;
      };

      // Not visible yet, opacity = 0;
      expect(getOpacity()).to.equal(0);

      // Scroll bring to middle of viewport, height of target is 10
      win.scrollTo(0, getViewportHeight() / 2 + 5);
      // Half way: opacity = 0.5
      return waitForOpacity(0.5).then(() => {
        // Scroll to the end
        win.scrollTo(0, getViewportHeight() * 2);
        // All the way: opacity = 1;
        return waitForOpacity(1);
      }).then(() => {
        // Scroll back to the top
        win.scrollTo(0, 0);
        // Back to starting position: opacity: 0
        return waitForOpacity(0);
      });
    });
  });
});
