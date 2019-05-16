/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-imgur';

describes.realWin(
  'amp-imgur',
  {
    amp: {
      extensions: ['amp-imgur'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getIns(imgurId) {
      const ins = doc.createElement('amp-imgur');
      ins.setAttribute('data-imgur-id', imgurId);
      ins.setAttribute('width', '1');
      ins.setAttribute('height', '1');
      ins.setAttribute('layout', 'responsive');
      doc.body.appendChild(ins);
      return ins
        .build()
        .then(() => ins.layoutCallback())
        .then(() => ins);
    }

    function testIframe(iframe) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal('https://imgur.com/2CnX7/embed?pub=true');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    }

    it('renders', () => {
      return getIns('2CnX7').then(ins => {
        testIframe(ins.querySelector('iframe'));
      });
    });

    it('resizes with JSON String message', () => {
      return getIns('2CnX7').then(ins => {
        const impl = ins.implementation_;
        const changeHeightSpy = sandbox.spy(impl, 'attemptChangeHeight');
        expect(changeHeightSpy).not.to.have.been.called;
        const event = {
          origin: 'https://imgur.com',
          source: impl.iframe_.contentWindow,
          data:
            '{"message":"resize_imgur","href":"https://imgur.com/2CnX7/embed?pub=true","height":396,"width":1400,"context":true}',
        };
        impl.handleImgurMessages_(event);
        expect(changeHeightSpy).to.have.been.calledWith(396);
      });
    });

    it('resizes with JSON Object message', () => {
      return getIns('2CnX7').then(ins => {
        const impl = ins.implementation_;
        const changeHeightSpy = sandbox.spy(impl, 'attemptChangeHeight');
        expect(changeHeightSpy).not.to.have.been.called;
        const event = {
          origin: 'https://imgur.com',
          source: impl.iframe_.contentWindow,
          data: {
            'message': 'resize_imgur',
            'href': 'https://imgur.com/2CnX7/embed?pub=true',
            'height': 400,
            'width': 1400,
            'context': true,
          },
        };
        impl.handleImgurMessages_(event);
        expect(changeHeightSpy).to.have.been.calledWith(400);
      });
    });
  }
);
