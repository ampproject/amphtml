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

import '../amp-brid-player';
import {VideoEvents} from '../../../../src/video-interface';
import {
  expectRealIframeSrcEquals,
  getVideoIframeTestHelpers,
} from '../../../../testing/iframe-video';

const TAG = 'amp-brid-player';

describes.realWin(TAG, {amp: {extensions: [TAG]}}, (env) => {
  const {
    buildLayoutElement: getBridPlayer,
    listenToForwardedEvent: listenToEventFromMessage,
  } = getVideoIframeTestHelpers(env, TAG, {
    origin: 'https://services.brid.tv',
    layoutMessage: 'Brid|0|trigger|ready',
  });

  it('renders', async () => {
    const element = await getBridPlayer({
      'data-partner': '264',
      'data-player': '4144',
      'data-video': '13663',
    });
    const iframe = element.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.tagName).to.equal('IFRAME');
    expectRealIframeSrcEquals(
      iframe,
      'https://services.brid.tv/services/iframe/video/13663/264/4144/0/1/?amp=1'
    );
  });

  it('requires data-partner', () => {
    return allowConsoleError(() => {
      return getBridPlayer({
        'data-player': '4144',
        'data-video': '13663',
      }).should.eventually.be.rejectedWith(
        /The data-partner attribute is required for/
      );
    });
  });

  it('requires data-player', () => {
    return allowConsoleError(() => {
      return getBridPlayer({
        'data-partner': '264',
        'data-video': '13663',
      }).should.eventually.be.rejectedWith(
        /The data-player attribute is required for/
      );
    });
  });

  it('should forward events', async () => {
    const element = await getBridPlayer({
      'data-partner': '1177',
      'data-player': '979',
      'data-video': '5204',
    });
    await listenToEventFromMessage(
      element,
      VideoEvents.PLAYING,
      'Brid|0|trigger|play'
    );
    await listenToEventFromMessage(
      element,
      VideoEvents.MUTED,
      'Brid|0|volume|0'
    );
    await listenToEventFromMessage(
      element,
      VideoEvents.PAUSE,
      'Brid|0|trigger|pause'
    );
    await listenToEventFromMessage(
      element,
      VideoEvents.UNMUTED,
      'Brid|0|volume|1'
    );
  });

  describe('createPlaceholderCallback', () => {
    it('should create a placeholder image', async () => {
      const element = await getBridPlayer({
        'data-partner': '264',
        'data-player': '979',
        'data-video': '13663',
      });
      const img = element.querySelector('amp-img');
      expect(img).to.not.be.null;
      expect(img.getAttribute('src')).to.equal(
        'https://cdn.brid.tv/live/partners/264/snapshot/13663.jpg'
      );
      expect(img.getAttribute('layout')).to.equal('fill');
      expect(img.hasAttribute('placeholder')).to.be.true;
      expect(img.getAttribute('alt')).to.equal('Loading video');
      expect(img.getAttribute('referrerpolicy')).to.equal('origin');
    });

    it('should propagate aria label for placeholder image', async () => {
      const element = await getBridPlayer({
        'data-partner': '264',
        'data-player': '979',
        'data-video': '13663',
        'aria-label': 'great video',
      });
      const img = element.querySelector('amp-img');
      expect(img).to.not.be.null;
      expect(img.getAttribute('alt')).to.equal('Loading video - great video');
    });

    it('should create a fallback for default snapshot', async () => {
      const element = await getBridPlayer({
        'data-partner': '264',
        'data-player': '979',
        'data-video': '13663',
      });
      const img = element.querySelector('amp-img');
      const fallbackImg = img.querySelector('amp-img');
      expect(fallbackImg).to.not.be.null;
      expect(fallbackImg.getAttribute('src')).to.equal(
        'https://cdn.brid.tv/live/default/defaultSnapshot.png'
      );
      expect(fallbackImg.getAttribute('layout')).to.equal('fill');
      expect(fallbackImg.hasAttribute('fallback')).to.be.true;
      expect(fallbackImg.getAttribute('referrerpolicy')).to.equal('origin');
    });
  });
});
