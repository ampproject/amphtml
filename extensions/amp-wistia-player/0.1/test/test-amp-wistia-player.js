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

import '../amp-wistia-player';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-wistia-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {buildLayoutElement} = getVideoIframeTestHelpers(env, TAG, {});

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-media-hashed-id': 'u8p9wq6mq8',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://fast.wistia.net/embed/iframe/u8p9wq6mq8'
    );
  });

  it('requires data-media-hashed-id', () => {
    const error = /The data-media-hashed-id attribute is required for/;
    expectAsyncConsoleError(error, 1);
    return buildLayoutElement({}).should.eventually.be.rejectedWith(error);
  });
});
