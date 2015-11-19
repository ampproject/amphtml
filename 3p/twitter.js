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

import {loadScript} from '../src/3p';
import {setStyles} from '../src/style';

/**
 * Produces the Twitter API object for the passed in callback. If the current
 * frame is the master frame it makes a new one by injecting the respective
 * script, otherwise it schedules the callback for the script from the master
 * window.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getTwttr(global, cb) {
  if (context.isMaster) {
    global.twttrCbs = [cb];
    loadScript(global, 'https://platform.twitter.com/widgets.js', () => {
      for (let i = 0; i < global.twttrCbs.length; i++) {
        global.twttrCbs[i](global.twttr);
      }
      global.twttrCbs.push = function(cb) {
        cb(global.twttr);
      };
    });
  } else {
    // Because we rely on this global existing it is important that
    // this array is created synchronously after master selection.
    context.master.twttrCbs.push(cb);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function twitter(global, data) {
  const tweet = document.createElement('div');
  tweet.id = 'tweet';
  const width = data.initialWindowWidth;
  const height = data.initialWindowHeight;
  tweet.style.width = '100%';
  global.document.getElementById('c').appendChild(tweet);
  getTwttr(global, function(twttr) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    twttr.widgets.createTweet(data.tweetid, tweet, data)./*OK*/then(() => {
      const iframe = global.document.querySelector('#c iframe');
      // Unfortunately the tweet isn't really done at this time.
      // We listen for resize to learn when things are
      // really done.
      iframe.contentWindow.addEventListener('resize', function(e) {
        render();
      }, true);
      render();
    });
  });


  function render() {
    const iframe = global.document.querySelector('#c iframe');
    const body = iframe.contentWindow.document.body;
    context.updateDimensions(
        body./*OK*/offsetWidth,
        body./*OK*/offsetHeight + /* margins */ 20);
  }
}
