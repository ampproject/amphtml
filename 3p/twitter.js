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

// TODO(malteubl) Move somewhere else since this is not an ad.

import {loadScript} from './3p';

/**
 * Produces the Twitter API object for the passed in callback. If the current
 * frame is the master frame it makes a new one by injecting the respective
 * script, otherwise it schedules the callback for the script from the master
 * window.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getTwttr(global, cb) {
  loadScript(global, 'https://platform.twitter.com/widgets.js', () => {
    cb(global.twttr);
  });
  // Temporarily disabled the code sharing between frames.
  // The iframe throttling implemented in modern browsers can break with this,
  // because things may execute in frames that are currently throttled, even
  // though they are needed in the main frame.
  // See https://github.com/ampproject/amphtml/issues/3220
  //
  // computeInMasterFrame(global, 'twttrCbs', done => {
  //  loadScript(global, 'https://platform.twitter.com/widgets.js', () => {
  //    done(global.twttr);
  //  });
  //}, cb);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function twitter(global, data) {
  const tweet = global.document.createElement('div');
  tweet.id = 'tweet';
  tweet.style.width = '100%';
  tweet.style.display = 'flex';
  tweet.style.alignItems = 'center';
  tweet.style.justifyContent = 'center';
  global.document.getElementById('c').appendChild(tweet);
  getTwttr(global, function(twttr) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    twttr.widgets.createTweet(data.tweetid, tweet, data)./*OK*/then(() => {
      const iframe = global.document.querySelector('#c iframe');
      // There is no iframe if the tweet was deleted. Thanks for resolving
      // the promise, though :)
      if (iframe && iframe.contentWindow) {
        // Unfortunately the tweet isn't really done at this time.
        // We listen for resize to learn when things are
        // really done.
        iframe.contentWindow.addEventListener('resize', function() {
          resize(iframe.contentWindow.document.body);
        }, true);
        resize(iframe.contentWindow.document.body);
      } else if (global.MutationObserver) {
        // If no iframe is created, Twitter likely went into their ShadowDOM
        // based pass. MutationObserver should definitely be available then.
        // Because Twitter does not actually provide an event for when
        // rendering is done, we use a MutationObserver and schedule a measure
        // operation whenever any elements were added to the DOM.
        let timeout;
        function measure() {
          // Throttle if multiple things happen at once.
          clearTimeout(timeout);
          timeout = setTimeout(function() {
            const root = global.document.querySelector('#tweet *');
            if (root) {
              resize(root);
            }
          }, 0);
        }
        const observer = new MutationObserver(measure);
        observer.observe(global.document.querySelector('#c'), {
          subtree: true,
          childList: true,
        });
        measure();
      } else {
        console./*OK*/error('No iframe or shadow root found for tweet.');
      }
    });
  });

  function resize(container) {
    const height = container./*OK*/offsetHeight;
    // 0 height is always wrong and we should get another resize request
    // later.
    if (height == 0) {
      return;
    }
    context.updateDimensions(
        container./*OK*/offsetWidth,
        height + /* margins */ 20);
  }
}
