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

import {writeScript, executeAfterWriteScript} from '../src/3p'

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function twitter(global, data) {
  var tweet = document.createElement('div');
  tweet.id = 'tweet';
  global.document.getElementById('c').appendChild(tweet);
  var s = document.createElement('script');
  s.src = 'https://platform.twitter.com/widgets.js';
  s.onload = function() {
    twttr.widgets.createTweet(data.tweetid, tweet);
  };
  // Buggy, hacky, dirty.
  var redraw = global.onload = global.onresize = function() {
    var iframe = global.document.querySelector('#c iframe');
    if (!iframe) {
      setTimeout(redraw, 32); // Poll for the iframe
      return;
    }
    iframe.contentWindow.onresize = redraw;
    if (!iframe.offsetHeight) {
      setTimeout(redraw, 32); // Poll for the iframe to have a height.
      return;
    }
    var offsetHeight = iframe.offsetHeight + /* margins */ 20;
    var offsetWidth = iframe.offsetWidth;
    tweet.style.height = offsetHeight + 'px';
    tweet.style.width = offsetWidth + 'px';
    tweet.style.position = 'absolute';
    tweet.style.transformOrigin = 'top left';
    tweet.style.transform = 'scale(' + (window.innerHeight / offsetHeight) + ')';
  };
  global.document.body.appendChild(s);
}
