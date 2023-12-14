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

describes.sandboxed('amp-video', {}, (env) => {
  runVideoPlayerIntegrationTests(env, (fixture) => {
    const video = fixture.doc.createElement('amp-video');
    video.setAttribute('src', '/examples/av/ForBiggerJoyrides-tiny.mp4');
    return video;
  });
});

describes.sandboxed('amp-video-iframe', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-video-iframe');
      video.setAttribute('src', '/examples/amp-video-iframe/frame.html');
      video.setAttribute('poster', 'https://placekitten.com/800/450');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed('amp-youtube', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-youtube');
      video.setAttribute('data-videoid', 'O0QDEXZhow4');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed('amp-dailymotion', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-dailymotion');
      video.setAttribute('data-videoid', 'x3rdtfy');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed('amp-3q-player', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-3q-player');
      video.setAttribute('data-id', 'c8dbe7f4-7f7f-11e6-a407-0cc47a188158');
      return video;
    },
    null,
    20000
  );
});

//TODO(aghassemi,#8264): Unskip when integration is fixed.
describes.sandboxed.skip('amp-nexxtv-player', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-nexxtv-player');
      video.setAttribute('data-mediaid', 'PTPFEC4U184674');
      video.setAttribute('data-client', '583');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed('amp-ima-video', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-ima-video');
      video.setAttribute('width', 640);
      video.setAttribute('height', 360);
      video.setAttribute('data-width', '640');
      video.setAttribute('data-height', '360');
      video.setAttribute('data-src', '/examples/av/ForBiggerJoyrides-tiny.mp4');
      video.setAttribute(
        'data-tag',
        'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator='
      );
      video.setAttribute('data-poster', '/examples/img/ima-poster.png');
      return video;
    },
    'amp-ima-video',
    20000
  );
});

describes.sandboxed('amp-brid-player', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-brid-player');
      video.setAttribute('data-partner', '264');
      video.setAttribute('data-player', '4144');
      video.setAttribute('data-video', '13663');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed.skip('amp-brightcove', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-brightcove');
      video.setAttribute('data-account-id', '1290862519001');
      video.setAttribute('data-player-id', 'SyIOV8yWM');
      video.setAttribute('data-video-id', 'amp-test-video');
      return video;
    },
    null,
    20000
  );
});

describes.sandboxed.skip('amp-delight-player', {}, (env) => {
  runVideoPlayerIntegrationTests(
    env,
    (fixture) => {
      const video = fixture.doc.createElement('amp-delight-player');
      video.setAttribute('data-content-id', '-LLoCCZqWi18O73b6M0w');
      return video;
    },
    null,
    20000
  );
});
