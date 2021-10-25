// TODO(malteubl) Move somewhere else since this is not an ad.

import {setStyles} from '#core/dom/style';

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
  setStyles(tweet, {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  global.document.getElementById('c').appendChild(tweet);
  getTwttr(global, function (twttr) {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;

    if (data.tweetid) {
      twttr.widgets
        .createTweet(cleanupTweetId_(data.tweetid), tweet, data)
        ./*OK*/ then((el) => tweetCreated(twttr, el));
    } else if (data.momentid) {
      twttr.widgets
        .createMoment(data.momentid, tweet, data)
        ./*OK*/ then((el) => tweetCreated(twttr, el));
    } else if (data.timelineSourceType) {
      // Extract properties starting with 'timeline'.
      const timelineData = Object.keys(data)
        .filter((prop) => prop.startsWith('timeline'))
        .reduce((newData, prop) => {
          newData[stripPrefixCamelCase(prop, 'timeline')] = data[prop];
          return newData;
        }, {});
      twttr.widgets
        .createTimeline(timelineData, tweet, data)
        ./*OK*/ then((el) => tweetCreated(twttr, el));
    }
  });

  /**
   * Handles a tweet or moment being created, resizing as necessary.
   * @param {!Object} twttr
   * @param {?Element} el
   */
  function tweetCreated(twttr, el) {
    if (!el) {
      global.context.noContentAvailable();
      return;
    }

    resize(/** @type {!Element} */ (el));
    twttr.events.bind('resize', (event) => {
      // To be safe, make sure the resize event was triggered for the widget we
      // created below.
      if (el === event.target) {
        resize(/** @type {!Element} */ (el));
      }
    });
  }

  /**
   * @param {!Element} container
   */
  function resize(container) {
    const height = container./*OK*/ offsetHeight;
    // 0 height is always wrong and we should get another resize request
    // later.
    if (height == 0) {
      return;
    }
    global.context.updateDimensions(
      container./*OK*/ offsetWidth,
      height + /* margins */ 20
    );
  }

  /**
   * @param {string} input
   * @param {string} prefix
   * @return {*} TODO(#23582): Specify return type
   */
  function stripPrefixCamelCase(input, prefix) {
    const stripped = input.replace(new RegExp('^' + prefix), '');
    return stripped.charAt(0).toLowerCase() + stripped.substr(1);
  }
}

/**
 * @param {string} tweetid
 * @visibleForTesting
 * @return {*} TODO(#23582): Specify return type
 */
export function cleanupTweetId_(tweetid) {
  // 1)
  // Handle malformed ids such as
  // https://twitter.com/abc123/status/585110598171631616
  tweetid = tweetid.toLowerCase();
  let match = tweetid.match(/https:\/\/twitter.com\/[^\/]+\/status\/(\d+)/);
  if (match) {
    return match[1];
  }

  // 2)
  // Handle malformed ids such as
  // 585110598171631616?ref_src
  match = tweetid.match(/^(\d+)\?ref.*/);
  if (match) {
    return match[1];
  }

  return tweetid;
}
