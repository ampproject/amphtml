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

import {PlayingStates} from '../../../../src/video-interface';
import {Services} from '../../../../src/services';
import AmpViqeoPlayer from '../amp-viqeo-player';

describes.realWin(
  'amp-viqeo-player',
  {
    amp: {
      extensions: ['amp-viqeo-player'],
    },
    allowExternalResources: true,
  },
  function(env) {
    this.timeout(4000);
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it.skip('test-get-data', () => {
      return getViqeo().then(p => {
        const {viqeoElement, entry, viqeo} = p;
        expect(entry.video.element).to.equal(viqeoElement);
        expect(entry.video instanceof AmpViqeoPlayer).to.equal(true);
        expect(entry.video).to.equal(viqeo);
        expect(viqeo instanceof AmpViqeoPlayer).to.equal(true);
      });
    });

    describe('test-requires-attributes', () => {
      it('requires data-videoid', () => {
        const error = /The data-videoid attribute is required for/;
        expectAsyncConsoleError(error);
        return getViqeo({viqeoId: null}).should.eventually.be.rejectedWith(
          error
        );
      });

      it('requires data-profileid', () => {
        const error = /The data-profileid attribute is required for/;
        expectAsyncConsoleError(error);
        return getViqeo({
          viqeoProfileId: null,
        }).should.eventually.be.rejectedWith(error);
      });
    });

    describe.skip('test-playing-actions', () => {
      it('renders responsively', () => {
        return getViqeo().then(p => {
          const iframe = p.viqeoElement.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        });
      });

      it('should propagate autoplay to ad iframe', () => {
        return getViqeo({opt_params: {autoplay: ''}}).then(p => {
          const iframe = p.viqeoElement.querySelector('iframe');
          const data = JSON.parse(iframe.name).attributes;
          expect(data).to.be.ok;
          expect(data._context).to.be.ok;
          expect(data._context.autoplay).to.equal(true);
        });
      });

      it(
        'should propagate autoplay=false ' +
          'if element has not autoplay attribute to ad iframe',
        () => {
          return getViqeo().then(p => {
            const iframe = p.viqeoElement.querySelector('iframe');
            const data = JSON.parse(iframe.name).attributes;
            expect(data).to.be.ok;
            expect(data._context).to.be.ok;
            return expect(data._context.autoplay).to.equal(false);
          });
        }
      );

      it('should paused without autoplay', () => {
        return getViqeo().then(p => {
          const curState = p.videoManager.getPlayingState(p.viqeo);
          return expect(curState).to.equal(PlayingStates.PAUSED);
        });
      });
    });

    describe('createPlaceholderCallback', () => {
      it('should create a placeholder image', () => {
        return getViqeo().then(p => {
          const img = p.viqeoElement.querySelector('amp-img');
          expect(img).to.not.be.null;
          expect(img.getAttribute('src')).to.equal(
            'https://cdn.viqeo.tv/preview/922d04f30b66f1a32eb2.jpg'
          );
          expect(img.getAttribute('layout')).to.equal('fill');
          expect(img.hasAttribute('placeholder')).to.be.true;
          expect(img.getAttribute('referrerpolicy')).to.equal('origin');
          expect(img.getAttribute('alt')).to.equal('Loading video');
        });
      });
    });

    function getViqeo(params) {
      const {
        id,
        viqeoProfileId,
        viqeoId,
        width,
        height,
        opt_params,
      } = Object.assign(
        {
          id: 'myVideo',
          viqeoProfileId: 184,
          viqeoId: '922d04f30b66f1a32eb2',
          width: 320,
          height: 180,
          opt_params: {},
        },
        params
      );

      const viqeoElement = doc.createElement('amp-viqeo-player');

      id && viqeoElement.setAttribute('id', id);
      viqeoProfileId &&
        viqeoElement.setAttribute('data-profileid', viqeoProfileId);

      viqeoId && viqeoElement.setAttribute('data-videoid', viqeoId);

      width && viqeoElement.setAttribute('width', width);
      height && viqeoElement.setAttribute('height', height);

      opt_params &&
        Object.keys(opt_params).forEach(key => {
          viqeoElement.setAttribute(key, opt_params[key]);
        });

      doc.body.appendChild(viqeoElement);
      return viqeoElement
        .build()
        .then(() => {
          viqeoElement.layoutCallback.bind(viqeoElement);
        })
        .then(() => {
          const videoManager = Services.videoManagerForDoc(doc);
          const entry = videoManager.getEntryForElement_(viqeoElement);
          return Promise.resolve({
            viqeoElement,
            videoManager,
            entry,
            viqeo: entry.video,
          });
        });
    }
  }
);
