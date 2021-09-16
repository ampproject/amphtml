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
import '../amp-apester-media';
import {Services} from '../../../../src/services';

describes.realWin(
  'amp-apester-media',
  {
    amp: {
      extensions: ['amp-apester-media'],
    },
  },
  (env) => {
    let win, doc;
    let xhrMock;
    let changeSizeSpy;
    let attemptChangeSizeSpy;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    afterEach(() => {
      if (xhrMock) {
        xhrMock.verify();
      }
    });

    async function getApester(attributes, opt_responsive) {
      const media = doc.createElement('amp-apester-media');
      const regularResponse = {
        status: 200,
        message: 'ok',
        payload: {
          interactionId: '5aaa70c79aaf0c5443078d31',
          data: {
            size: {width: '600', height: '404'},
          },
          layout: {
            id: '557d52c059081084b94845c3',
            name: 'multi poll two',
            directive: 'multi-poll-two',
          },
          language: 'en',
        },
      };
      const playlistResponse = {
        status: 200,
        message: 'ok',
        payload: [
          {
            interactionId: '5aaa70c79aaf0c5443078d31',
            data: {
              size: {width: '600', height: '404'},
            },
            layout: {
              id: '557d52c059081084b94845c3',
              name: 'multi poll two',
              directive: 'multi-poll-two',
            },
            language: 'en',
          },
        ],
      };
      const currentResopnse =
        attributes && attributes['data-apester-channel-token']
          ? playlistResponse
          : regularResponse;

      xhrMock = env.sandbox.mock(Services.xhrFor(win));
      if (attributes) {
        xhrMock.expects('fetchJson').returns(
          Promise.resolve({
            status: 200,
            json() {
              return Promise.resolve(currentResopnse);
            },
          })
        );
      } else {
        xhrMock.expects('fetchJson').never();
      }
      for (const key in attributes) {
        media.setAttribute(key, attributes[key]);
      }
      media.setAttribute('width', '600');
      media.setAttribute('height', '390');
      //todo test width?
      if (opt_responsive) {
        media.setAttribute('layout', 'responsive');
      }
      doc.body.appendChild(media);
      await media.build();

      const impl = await media.getImpl();
      changeSizeSpy = env.sandbox.spy(impl, 'forceChangeHeight');
      attemptChangeSizeSpy = env.sandbox.spy(impl, 'attemptChangeHeight');

      await media.layoutCallback();
      return media;
    }

    it('renders', () => {
      return getApester({
        'data-apester-media-id': '5aaa70c79aaf0c5443078d31',
      }).then((ape) => {
        const iframe = ape.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).not.to.be.null;
        const placeholder = ape.querySelector('div[placeholder]');
        expect(placeholder).to.not.be.null;
        expect(placeholder.getAttribute('aria-label')).to.equal(
          'Loading Apester Media'
        );
        const url = new URL(iframe.src);
        const qs = new URLSearchParams(url.searchParams);
        expect(url.hostname).to.equal('renderer.apester.com');
        expect(url.pathname).to.equal('/interaction/5aaa70c79aaf0c5443078d31');
        expect(qs.get('sdk')).to.equal('amp');
        expect(qs.get('type')).to.equal('editorial');
        expect(changeSizeSpy).to.be.calledOnce;
        expect(changeSizeSpy.args[0][0]).to.equal('404');
      });
    });
    it('propagates aria label to placeholder image', () => {
      return getApester({
        'data-apester-media-id': '5aaa70c79aaf0c5443078d31',
        'aria-label': 'scintilating video',
      }).then((ape) => {
        const placeholder = ape.querySelector('div[placeholder]');
        expect(placeholder).to.not.be.null;
        expect(placeholder.getAttribute('aria-label')).to.equal(
          'Loading - scintilating video'
        );
      });
    });
    it('render playlist', () => {
      return getApester({
        'data-apester-channel-token': '57a36e1e96cd505a7f01ed12',
      }).then((ape) => {
        const iframe = ape.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).not.to.be.null;
        const url = new URL(iframe.src);
        const qs = new URLSearchParams(url.searchParams);
        expect(url.hostname).to.equal('renderer.apester.com');
        expect(url.pathname).to.equal('/interaction/5aaa70c79aaf0c5443078d31');
        expect(qs.get('sdk')).to.equal('amp');
        expect(qs.get('type')).to.equal('playlist');
        expect(attemptChangeSizeSpy).to.be.calledOnce;
        expect(attemptChangeSizeSpy.args[0][0]).to.equal('404');
      });
    });

    //todo responsive layout isn't fully supported yet, just a stub
    it('renders responsively', () => {
      return getApester(
        {
          'data-apester-media-id': '5aaa70c79aaf0c5443078d31',
          width: '500',
        },
        true
      ).then((ape) => {
        const iframe = ape.querySelector('iframe');
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('removes iframe after unlayoutCallback', async () => {
      const ape = await getApester({
        'data-apester-media-id': '5aaa70c79aaf0c5443078d31',
      });
      const tag = await ape.getImpl();
      const iframe = ape.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).not.to.be.null;
      const url = new URL(iframe.src);
      expect(url.hostname).to.equal('renderer.apester.com');
      expect(url.pathname).to.equal('/interaction/5aaa70c79aaf0c5443078d31');
      tag.unlayoutCallback();
      expect(ape.querySelector('iframe')).to.be.null;
      expect(tag.iframe_).to.be.null;
    });

    it('requires media-id or channel-token', () => {
      allowConsoleError(() => {
        expect(getApester()).to.be.rejectedWith(
          /The media-id attribute is required for/
        );
      });
    });
  }
);
