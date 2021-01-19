/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-redbull-player';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-redbull-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {buildLayoutElement} = getVideoIframeTestHelpers(env, TAG, {});

  it('renders the Red Bull player', async () => {
    const element = await buildLayoutElement({
      'data-param-videoid':
        'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://player.redbull.com/amp/amp-iframe.html?videoId=' +
        encodeURIComponent(
          'rrn:content:videos:3965a26c-052e-575f-a28b-ded6bee23ee1:en-INT'
        ) +
        '&skinId=com&ampTagId=rbvideo&locale=global'
    );
  });

  it('fails without videoId', () => {
    return buildLayoutElement({}).should.eventually.be.rejectedWith(
      /The data-param-videoid attribute is required/
    );
  });
});
