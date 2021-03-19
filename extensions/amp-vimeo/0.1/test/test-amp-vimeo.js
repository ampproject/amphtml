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
import {VideoUtils} from '../../../../src/utils/video';

describes.realWin(
  'amp-vimeo',
  {
    amp: {
      extensions: ['amp-vimeo'],
    },
  },
  (env) => {
    let win, doc, videoUtilsMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      videoUtilsMock = env.sandbox.stub(VideoUtils, 'isAutoplaySupported');
      videoUtilsMock.returns(Promise.resolve(true));
    });

    async function getVimeo(
      videoId,
      opt_responsive,
      opt_doNotTrack,
      opt_isAutoPlay
    ) {
      const vimeo = doc.createElement('amp-vimeo');
      vimeo.setAttribute('data-videoid', videoId);
      vimeo.setAttribute('width', '111');
      vimeo.setAttribute('height', '222');
      if (opt_responsive) {
        vimeo.setAttribute('layout', 'responsive');
      }
      if (opt_doNotTrack) {
        vimeo.setAttribute('do-not-track', '');
      }
      if (opt_isAutoPlay) {
        vimeo.setAttribute('autoplay', '');
      }
      doc.body.appendChild(vimeo);
      await vimeo.buildInternal();
      await vimeo.layoutCallback();
      return vimeo;
    }

    it('renders', async () => {
      const vimeo = await getVimeo('123');
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://player.vimeo.com/video/123');
    });

    it('renders responsively', async () => {
      const vimeo = await getVimeo('234', true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('requires data-videoid', () => {
      return getVimeo('').should.eventually.be.rejectedWith(
        /The data-videoid attribute is required for/
      );
    });

    it('renders do-not-track src url', async () => {
      const vimeo = await getVimeo('2323', false, true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe.src).to.equal('https://player.vimeo.com/video/2323?dnt=1');
    });

    it('should append muted=1 if video is autoplay', async () => {
      const vimeo = await getVimeo('0123', true, false, true);
      const iframe = vimeo.querySelector('iframe');
      expect(iframe.src).to.equal(
        'https://player.vimeo.com/video/0123?muted=1'
      );
    });

    it('unlayoutCallback', async () => {
      const vimeo = await getVimeo('0123', true, false, true);
      vimeo.unlayoutCallback();
      expect(vimeo.querySelector('iframe')).to.be.null;
    });
  }
);
