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

import '../amp-vimeo';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-vimeo';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {buildLayoutElement} = getVideoIframeTestHelpers(env, TAG, {});

  it('renders', async () => {
    const element = await buildLayoutElement({'data-videoid': '123'});
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(iframe, 'https://player.vimeo.com/video/123');
  });

  it('requires data-videoid', () => {
    const error = /The data-videoid attribute is required for/;
    expectAsyncConsoleError(error, 1);
    return buildLayoutElement({}).should.eventually.be.rejectedWith(error);
  });

  it('renders do-not-track src url', async () => {
    const element = await buildLayoutElement({
      'data-videoid': '2323',
      'do-not-track': '',
    });
    const iframe = element.querySelector('iframe');
    expectRealIframeSrcEquals(
      iframe,
      'https://player.vimeo.com/video/2323?dnt=1'
    );
  });
});
