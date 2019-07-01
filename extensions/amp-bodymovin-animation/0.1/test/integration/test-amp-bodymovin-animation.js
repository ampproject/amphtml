/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

describe
  .configure()
  .ifChrome()
  .run('amp-bodymovin-animation', function() {
    const extensions = ['amp-bodymovin-animation'];
    const bodymovinBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json">
    </amp-bodymovin-animation>
    <div id="stop" on="tap:anim.stop">Stop</div>`;

    describes.integration(
      'amp-bodymovin-animation iframe renders',
      {
        body: bodymovinBody,
        extensions,
      },
      unusedEnv => {
        // TODO(nainar): Add test.
      }
    );

    describes.integration(
      'amp-bodymovin-animation actions work',
      {
        body: bodymovinBody,
        extensions,
      },
      unusedEnv => {
        // TODO(nainar): Add test.
      }
    );

    const bodymovinNoAutoplayBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json"
      noautoplay>
    </amp-bodymovin-animation>
    <div id="play" on="tap:anim.play">Play</div>
    <div id="pause" on="tap:anim.pause">Pause</div>`;

    describes.integration(
      'amp-bodymovin-animation actions work',
      {
        body: bodymovinNoAutoplayBody,
        extensions,
      },
      unusedEnv => {
        // TODO(nainar): Add test.
      }
    );

    const bodymovinSeekToBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="testresource.json"
      noautoplay>
    </amp-bodymovin-animation>
    <div id="seekToHalf" on="tap:anim.seekTo(percent=0.5)">Seek to 1/2</div>`;

    describes.integration(
      'amp-bodymovin-animation actions work',
      {
        body: bodymovinSeekToBody,
        extensions,
      },
      unusedEnv => {
        // TODO(nainar): Add test.
      }
    );
  });
