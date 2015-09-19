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
import {setStyles} from '../src/style'

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
      }
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
  tweet.style.height = height + 'px';
  tweet.style.width = width + 'px';
  var container = document.createElement('div');
  // This container makes the iframe always as big as the
  // parent wants the iframe to be instead of extending
  // to the dimensions of the content.
  setStyles(container, {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden'
  });
  container.appendChild(tweet);
  global.document.getElementById('c').appendChild(container);
  getTwttr(global).then(function(twttr) {
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
  });

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
    setStyles(tweet, {
      position: 'absolute',
      transformOrigin: 'top left',
      transform: 'scale(' + scale + ')'
    });
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
}
