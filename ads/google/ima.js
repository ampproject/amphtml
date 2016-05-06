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

import {loadScript} from '../../src/3p'

/**
 * Loads the IMA SDK.
 *
 * @param {!Window} global
 * @param {function()} cb
 */
function getImaSdk(global, cb) {
  // video.js player
  loadScript(global, '//vjs.zencdn.net/5.3/video.min.js', cb);
  // IMA SDK library
  loadScript(global, '//imasdk.googleapis.com/js/sdkloader/ima3.js', cb);
  // video.js contrib-ads plugin (used by IMA plugin)
  // TODO(sbusolits): Figure out where to host this.
  loadScript(global, 'http://gvabox.com/sbusolits/amp/js/videojs.ads.js', cb);
  // IMA plugin
  // TODO(sbusolits): Figure out where to host this.
  loadScript(global, 'http://gvabox.com/sbusolits/amp/js/videojs.ima.js', cb);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ima(global, data) {
  const videoPlayer = global.document.createElement('video');
  videoPlayer.id = 'content_video';
  videoPlayer.className = 'video-js vjs-default-skin';
  videoPlayer.setAttribute('width', data.width);
  videoPlayer.setAttribute('height', data.height);
  const contentSrc = global.document.createElement('source');
  contentSrc.setAttribute('src', data.src);
  contentSrc.setAttribute('type', data.mime);
  videoPlayer.appendChild(contentSrc);
  global.document.getElementById('c').appendChild(videoPlayer);

  global.myIMACount = 0;
  getImaSdk(global, () => {
    global.myIMACount++;
    if (global.myIMACount < 4) {
      return;
    }
    var options = {
      id: 'content_video',
      adTagUrl: data.tag,
      nativeControlsForTouch: false
    };

    var player = videojs('content_video');
    player.ima(options);

    // Remove controls from the player on iPad to stop native controls from stealing
    // our click
    var contentPlayer =  document.getElementById('content_video_html5_api');
    if ((navigator.userAgent.match(/iPad/i) ||
          navigator.userAgent.match(/Android/i)) &&
        contentPlayer.hasAttribute('controls')) {
      contentPlayer.removeAttribute('controls');
    }

    // Initialize the ad container when the video player is clicked, but only the
    // first time it's clicked.
    var startEvent = 'click';
    if (navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
      startEvent = 'tap';
    }

    player.one(startEvent, function() {
        player.ima.initializeAdDisplayContainer();
        player.ima.requestAds();
        player.play();
    });
  });
}
