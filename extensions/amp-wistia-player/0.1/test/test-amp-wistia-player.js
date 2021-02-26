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
import * as dom from '../../../../src/dom';

describes.realWin(
  'amp-wistia-player',
  {
    amp: {
      extensions: ['amp-wistia-player'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getWistiaEmbed(mediaId) {
      const wistiaEmbed = doc.createElement('amp-wistia-player');
      wistiaEmbed.setAttribute('data-media-hashed-id', mediaId);
      wistiaEmbed.setAttribute('width', '512');
      wistiaEmbed.setAttribute('height', '360');
      doc.body.appendChild(wistiaEmbed);
      return wistiaEmbed
        .buildInternal()
        .then(() => wistiaEmbed.layoutCallback())
        .then(() => wistiaEmbed);
    }

    describe('rendering', () => {
      it('renders', () => {
        return getWistiaEmbed('u8p9wq6mq8').then((wistiaEmbed) => {
          const iframe = wistiaEmbed.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.tagName).to.equal('IFRAME');
          expect(iframe.src).to.equal(
            'https://fast.wistia.net/embed/iframe/u8p9wq6mq8'
          );
        });
      });

      it('requires data-media-hashed-id', () => {
        return getWistiaEmbed('').should.eventually.be.rejectedWith(
          /The data-media-hashed-id attribute is required for/
        );
      });

      it('removes iframe after unlayoutCallback', async () => {
        const player = await getWistiaEmbed('u8p9wq6mq8');
        const playerIframe = player.querySelector('iframe');
        expect(playerIframe).to.not.be.null;

        const impl = await player.getImpl(false);
        impl.unlayoutCallback();
        expect(player.querySelector('iframe')).to.be.null;
        expect(impl.iframe_).to.be.null;
      });
    });

    describe('methods', () => {
      let impl;
      beforeEach(async () => {
        const player = await getWistiaEmbed('u8p9wq6mq8');
        impl = await player.getImpl(false);
      });

      it('is interactive', () => {
        expect(impl.isInteractive()).to.be.true;
      });

      it('plays', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.play();
        expect(spy).to.be.calledWith('amp-play');
      });

      it('can pause', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.pause();
        expect(spy).to.be.calledWith('amp-pause');
      });

      it('can mute', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.mute();
        expect(spy).calledWith('amp-mute');
      });

      it('can unmute', () => {
        const spy = env.sandbox.spy(impl, 'sendCommand_');
        impl.unmute();
        expect(spy).calledWith('amp-unmute');
      });

      it('can enter fullscreen', () => {
        const spy = env.sandbox.spy(dom, 'fullscreenEnter');
        impl.fullscreenEnter();
        expect(spy).calledWith(impl.iframe_);
      });

      it('can exit fullscreen', () => {
        const spy = env.sandbox.spy(dom, 'fullscreenExit');
        impl.fullscreenExit();
        expect(spy).calledWith(impl.iframe_);
        expect(impl.isFullscreen()).to.be.false;
      });
    });
  }
);
