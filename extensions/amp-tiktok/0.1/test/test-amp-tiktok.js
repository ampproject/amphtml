/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-tiktok';
import {createElementWithAttributes, isAmpElement} from '../../../../src/dom';

describes.realWin(
  'amp-tiktok',
  {
    amp: {
      extensions: ['amp-tiktok'],
    },
  },
  (env) => {
    let win;
    let doc;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = env.sandbox.useFakeTimers();
      clock.tick(0);
    });

    async function getTiktok() {
      const tiktok = createElementWithAttributes(win.document, 'amp-tiktok', {
        layout: 'responsive',
        width: '325px',
        height: '730px',
        'data-src':
          'https://www.tiktok.com/@scout2015/video/6718335390845095173',
      });
      doc.body.appendChild(tiktok);
      return tiktok
        .buildInternal()
        .then(() => {
          return tiktok.layoutCallback();
        })
        .then(() => tiktok);
    }

    async function sendFakeMessage(tiktok, iframe, details) {
      const impl = await tiktok.getImpl(false);
      impl.handleTiktokMessages_({
        origin: 'https://www.tiktok.com',
        source: iframe.contentWindow,
        data: JSON.stringify(details),
      });
    }

    it('renders', async () => {
      const tiktok = await getTiktok();
      const iframe = tiktok.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.tiktok.com/embed/v2/6718335390845095173?lang=en-US'
      );
    });

    it('resizes in response to messges from Tiktok iframe', async () => {
      const tiktok = await getTiktok();
      const impl = await tiktok.getImpl(false);
      const iframe = tiktok.querySelector('iframe');
      const forceChangeHeight = env.sandbox.spy(impl, 'forceChangeHeight');
      expect(iframe).to.not.be.null;
      const newHeight = 900;
      await sendFakeMessage(tiktok, iframe, {height: newHeight});
      await Promise.resolve().then(() => {
        clock.tick(2000);
      });
      expect(forceChangeHeight).to.be.calledOnce;
      expect(forceChangeHeight.firstCall.args[0]).to.equal(newHeight);
    });
  }
);
