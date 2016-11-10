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
  setStyles(tweet, {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  global.document.getElementById('c').appendChild(tweet);
  getTwttr(global, function(twttr) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;

    let twitterWidgetSandbox;
    twttr.events.bind('resize', event => {
      // To be safe, make sure the resize event was triggered for the widget we created below.
      if (twitterWidgetSandbox === event.target) {
        resize(twitterWidgetSandbox);
      }
    });

    twttr.widgets.createTweet(data.tweetid, tweet, data)./*OK*/then(el => {
      if (el) {
        // Not a deleted tweet
        twitterWidgetSandbox = el;
        resize(twitterWidgetSandbox);
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
