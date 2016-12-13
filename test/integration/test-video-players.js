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

/**
 * Runs the video manager integration test suite against a video player that
 * implements the video interface (@see ../../src/video-interface.js)
 *
 * To include a new video player to the test suite, simply:
 * (1) Include the component's script file in test/fixtures/video-players.html
 * (2) Add a test here and create your component with the required attributes.
 *     Note that attributes such as layout, width, height and autoplay are
 *     automatically added by the test suite.
 * @fileoverview
 */

import {runVideoPlayerIntegrationTests} from './test-video-players-helper';

describe('amp-video', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-video');
    video.setAttribute('src', 'https://commondatastorage.googleapis.com' +
      '/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');
    return video;
  });
});

describe('amp-youtube', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-youtube');
    video.setAttribute('data-videoid', 'mGENRKrdoGY');
    return video;
  });
});
