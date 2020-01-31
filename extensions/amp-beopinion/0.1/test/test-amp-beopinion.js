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

import '../amp-beopinion';
import {beop} from '../../../../3p/beop';

describes.realWin(
  'amp-beop',
  {
    amp: {
      extensions: ['amp-beop'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  env => {
    const accountId = '589446dd42ee0d6fdd9c3dfd';
    const contentId = '5a703a2f46e0fb00016d51b3';
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getAmpBeOp(accountId) {
      const ampBeOp = doc.createElement('amp-beop');
      ampBeOp.setAttribute('data-account', accountId);
      ampBeOp.setAttribute('data-content', contentId);
      ampBeOp.setAttribute('width', '111');
      ampBeOp.setAttribute('height', '222');
      doc.body.appendChild(ampBeOp);
      return ampBeOp
        .build()
        .then(() => ampBeOp.layoutCallback())
        .then(() => ampBeOp);
    }

    it('renders iframe in amp-beop', () => {
      return getAmpBeOp(accountId).then(ampBeOp => {
        const iframe = ampBeOp.firstChild;
        expect(iframe).to.not.be.null;
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('width')).to.equal('111');
        expect(iframe.getAttribute('height')).to.equal('222');
      });
    });

    it('adds container element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);
      win.context = {
        canonicalUrl: 'https://foo.bar/baz',
        tagName: 'AMP-BEOP',
      };

      beop(win, {
        account: accountId,
        content: contentId,
        width: 111,
        height: 222,
      });
      const content = doc.body.querySelector('.BeOpWidget');
      expect(content).not.to.be.undefined;
    });
  }
);
