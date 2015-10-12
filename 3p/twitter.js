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

import {writeScript, executeAfterWriteScript} from '../src/3p';
import {setStyles} from '../src/style';

/**
 * Returns the Twitter API object. If the current frame is the master
 * frame it makes a new one by injecting the respective script, otherwise
 * it retrieves a promise for the script from the master window.
 * @param {!Window} global
 */
function getTwttr(global) {
  if (context.isMaster) {
    return global.twttrPromise = new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.onload = function() {
        resolve(global.twttr);
      };
      s.onerror = reject;
      global.document.body.appendChild(s);
    });
  } else {
    // Because we rely on this global existing it is important that
    // this promise is created synchronously after master selection.
    return context.master.twttrPromise;
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function twitter(global, data) {
  var tweet = document.createElement('div');
  tweet.id = 'tweet';
  var width = data.initialWindowWidth;
  var height = data.initialWindowHeight;
  tweet.style.width = '100%';
  global.document.getElementById('c').appendChild(tweet);
  getTwttr(global).then(function(twttr) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    twttr.widgets.createTweet(data.tweetid, tweet, data).then(() => {
      var iframe = global.document.querySelector('#c iframe');
      // Unfortunately the tweet isn't really done when the promise
      // resolves. We listen for resize to learn when things are
      // really done.
      iframe.contentWindow.addEventListener('resize', function(e) {
        render();
      }, true);
      render();
    });
  });


  function render() {
    var iframe = global.document.querySelector('#c iframe');
    var body = iframe.contentWindow.document.body;
    context.updateDimensions(
        body./*OK*/offsetWidth,
        body./*OK*/offsetHeight + /* margins */ 20);
  }
}
