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

import '../amp-gfycat';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-gfycat';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement,
    listenToForwardedEvent,
  } = getVideoIframeTestHelpers(env, TAG, {origin: 'https://gfycat.com'});

  it('renders', async () => {
    const element = await buildLayoutElement({
      'data-gfyid': 'LeanMediocreBeardeddragon',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://gfycat.com/ifr/LeanMediocreBeardeddragon'
    );
  });

  it('noautoplay', async () => {
    const element = await buildLayoutElement({
      'data-gfyid': 'LeanMediocreBeardeddragon',
      noautoplay: '',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expectRealIframeSrcEquals(
      iframe,
      'https://gfycat.com/ifr/LeanMediocreBeardeddragon?autoplay=0'
    );
  });

  it('should forward events', async () => {
    const element = await buildLayoutElement({
      'data-gfyid': 'LeanMediocreBeardeddragon',
    });
    await listenToForwardedEvent(element, VideoEvents.PLAYING, 'playing');
    await listenToForwardedEvent(element, VideoEvents.PAUSE, 'paused');
  });

  it('requires data-gfyid', () => {
    return allowConsoleError(() => {
      return buildLayoutElement({}).should.eventually.be.rejectedWith(
        /The data-gfyid attribute is required for/
      );
    });
  });

  it('renders placeholder with an alt', async () => {
    const element = await buildLayoutElement({
      'data-gfyid': 'LeanMediocreBeardeddragon',
      'alt': 'test alt label',
    });
    const placeholder = element.querySelector('amp-img');
    expect(placeholder).to.not.be.null;
    expect(placeholder.getAttribute('alt')).to.equal(
      'Loading gif test alt label'
    );
  });

  it('renders placeholder with an aria-label', async () => {
    const element = await buildLayoutElement({
      'data-gfyid': 'LeanMediocreBeardeddragon',
      'aria-label': 'test aria label',
    });
    const placeholder = element.querySelector('amp-img');
    expect(placeholder).to.not.be.null;
    expect(placeholder.getAttribute('alt')).to.equal(
      'Loading gif test aria label'
    );
  });
});
