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

//TODO(aghassemi,#10878): Run in all platforms.
//TODO(aghasemi, #10877): in-a-box, FIE integration tests.
const config = describe.configure().ifNewChrome();
config.run('amp-position-observer', function() {
  this.timeout(100000);

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

  const extensions = ['amp-animation', 'amp-position-observer'];
  const experiments = ['amp-animation'];

  const scrollboundBody = `
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

  /*
  * scrollbound amp-animation will make the target will go
  * from opacity 0 to 1 with scroll.
  **/
  describes.integration('scrollbound animation', {
    body: scrollboundBody,
    css,
    extensions,
    experiments,
  }, env => {
    it('runs animation with scroll', () => {
      // Not visible yet, opacity = 0;
      expect(getOpacity(env.win)).to.equal(0);

      // Scroll bring to middle of viewport, height of target is 10
      env.win.scrollTo(0, getViewportHeight(env.win) / 2 + 5);
      // Half way: opacity = 0.5
      return waitForOpacity(env.win, 'equals', 0.5).then(() => {
        // Scroll to the end
        env.win.scrollTo(0, getViewportHeight(env.win) * 2);
        // All the way: opacity = 1;
        return waitForOpacity(env.win, 'equals', 1);
      }).then(() => {
        // Scroll back to the top
        env.win.scrollTo(0, 0);
        // Back to starting position: opacity: 0
        return waitForOpacity(env.win, 'equals', 0);
      });
    });
  });


  const animationSceneBody = `
    <amp-animation id="anim" layout="nodisplay">
      <script type="application/json">
        {
        "duration": "120s",
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
        intersection-ratios="0.5"
        viewport-margins="10vh"
        on="enter:anim.start;exit:anim.pause"
        layout="nodisplay">
      </amp-position-observer>

      <div id="animTarget"></div>
    </div>
    <div class="spacer"></div>
    `;

  /*
  * Animation scene will start when 50% visible above the 10vh margin
  * and paused when 50% invisible below the 10vh margin.
  * There is no scrollbound behavior, purely time-based animation.
  **/
  describes.integration('animation scene', {
    body: animationSceneBody,
    css,
    extensions,
    experiments,
  }, env => {

    it('plays/pauses animation scene based on visibility', () => {
      // Not visible yet, opacity = 0;
      expect(getOpacity(env.win)).to.equal(0);
      // Scroll to edge of visibility
      // ratio is 0.5 and height of element is 10
      // exclusion margin is 10% of viewport
      // so we need to scroll = 10% * vh + 5px;
      const scrollBy = getViewportHeight(env.win) * 0.1 + 5;
      env.win.scrollTo(0, scrollBy);
      return waitForOpacity(env.win, 'greater-than', 0).then(() => {
        // Scroll to the end
        env.win.scrollTo(0, getViewportHeight(env.win) * 2);

        // Now we need to ensure opacity is not changing anymore to prove
        // animation is paused.
        return ensureOpacityIsNoChangingAnymore(env.win);
      }).then(() => {
        // Ok, animation is paused and given the long duration, opacity must be
        // stuck somewhere between 0 and 1
        const opacity = getOpacity(env.win);
        expect(opacity).to.be.above(0);
        expect(opacity).to.be.below(1);
      });

    });
  });
});

function getOpacity(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return parseFloat(win.getComputedStyle(animTarget).opacity);
}

function waitForOpacity(win, comparison, factor) {
  return poll('wait for opacity to ' + comparison + ': ' + factor, () => {
    if (comparison == 'equals') {
      return getOpacity(win) == factor;
    }

    if (comparison == 'greater-than') {
      return getOpacity(win) > factor;
    }
  });
}

function ensureOpacityIsNoChangingAnymore(win) {
  return new Promise((resolve, reject) => {
    win.setTimeout(() => {
      const currOpacity = getOpacity(win);
      win.setTimeout(() => {
        if (currOpacity == getOpacity(win)) {
          resolve();
        } else {
          reject('opacity changed, animation is not paused');
        }
      }, 200);
    }, 200);
  });
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}
