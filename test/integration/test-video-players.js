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
import {toggleExperiment} from '../../src/experiments';


//TODO(aghassemi,#7822): We have to skip iOS for video tests since videos
// can't play SauceLab's iOS simulator. We need real devices instead.

describe.configure().skipIos().run('amp-video', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-video');
    video.setAttribute('src', '/examples/av/ForBiggerJoyrides.mp4');
    return video;
  });
});

describe.configure().skipIos().run('amp-youtube', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-youtube');
    video.setAttribute('data-videoid', 'O0QDEXZhow4');
    return video;
  });
});

describe.configure().skipIos().run('amp-3q-player', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-3q-player');
    video.setAttribute('data-id', 'c8dbe7f4-7f7f-11e6-a407-0cc47a188158');
    return video;
  });
});

//TODO(aghassemi,#8264): Unskip when integration is fixed.
describe.skip('amp-nexxtv-player', () => {
  runVideoPlayerIntegrationTests(fixture => {
    const video = fixture.doc.createElement('amp-nexxtv-player');
    video.setAttribute('data-mediaid', 'PTPFEC4U184674');
    video.setAttribute('data-client', '583');
    return video;
  });
});

describe.configure().skipIos().run('amp-ima-video', () => {
  runVideoPlayerIntegrationTests(fixture => {
    toggleExperiment(window, 'amp-ima-video', true);
    const video = fixture.doc.createElement('amp-ima-video');
    video.setAttribute('width', 640);
    video.setAttribute('height', 360);
    video.setAttribute('data-width', '640');
    video.setAttribute('data-height', '360');
    video.setAttribute('data-src', '/examples/av/ForBiggerJoyrides.mp4');
    video.setAttribute('data-tag', 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=');
    video.setAttribute('data-poster', '/examples/img/ima-poster.png');
    return video;
  });
});

