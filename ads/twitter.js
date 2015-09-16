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
  var width = data.width;
  var height = data.height;
  tweet.style.height = height + 'px';
  tweet.style.width = width + 'px';
  global.document.getElementById('c').appendChild(tweet);
  var s = document.createElement('script');
  s.src = 'https://platform.twitter.com/widgets.js';
  s.onload = function() {
    twttr.widgets.createTweet(data.tweetid, tweet, data).then(() => {
      window.onresize = resize;
      var iframe = global.document.querySelector('#c iframe');
      // Unfortunately the tweet isn't really done when the promise
      // resolves. We listen for resize to learn when things are
      // really done.
      iframe.contentWindow.addEventListener('resize', function(e) {
        // Stop propagation in capture phase to avoid the tweet
        // auto resizing itself.
        e.stopPropagation();
        render();
      }, true)
      render();
    });
  };

  function resize() {
    // On resize we reset our base dimensions.
    width = window.innerWidth;
    height = window.innerHeight;
    render();
  }

  function render() {
    var iframe = global.document.querySelector('#c iframe');
    var offsetHeight = iframe.contentWindow.document.body.offsetHeight +
        /* margins */ 20;
    var offsetWidth = iframe.offsetWidth;
    var scale = window.innerHeight / offsetHeight;
    if (context.mode.development && scale != 1) {
      console/*OK*/.info('Ideal tweet size for tweet id:', data.tweetid,
          'width="' + iframe.offsetWidth +'" height="' + offsetHeight + '"',
          data);
    }
    tweet.style.position = 'absolute';
    tweet.style.transformOrigin = 'top left';
    tweet.style.transform = 'scale(' + scale + ')';
    // Alright, here we get from hacky into monkey patch territory.
    // We do not want the Tweet embed to know that we scaled it, because
    // then it may just redraw based on the new space.
    // This, of course, could break due to all kinds of changes in the
    // Twitter code. May we rest in peace.
    iframe.getBoundingClientRect = function() {
      return {
        width: width,
        height: height
      };
    };
  }

  global.document.body.appendChild(s);
}
