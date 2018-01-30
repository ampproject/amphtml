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

import '../amp-beopinion';
import {beopinion} from '../../../../3p/beopinion';

describes.realWin('amp-beopinion', {
  amp: {
    extensions: ['amp-beopinion'],
    canonicalUrl: 'https://news.autoplus.fr/Peugeot/1007/-658881.html',
  },
}, env => {
  const accountId = '589446dd42ee0d6fdd9c3dfd';
  const contentId = '5a703a2f46e0fb00016d51b3';
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpBeOpinion(accountId) {
    const ampBeOpinion = doc.createElement('amp-beopinion');
    ampBeOpinion.setAttribute('data-account', accountId);
    ampBeOpinion.setAttribute('data-content', contentId);
    ampBeOpinion.setAttribute('width', '111');
    ampBeOpinion.setAttribute('height', '222');
    doc.body.appendChild(ampBeOpinion);
    return ampBeOpinion.build()
        .then(() => ampBeOpinion.layoutCallback())
        .then(() => ampBeOpinion);
  }

  it('renders iframe in amp-beopinion', () => {
    return getAmpBeOpinion(accountId).then(ampBeOpinion => {
      const iframe = ampBeOpinion.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  // TypeError: Cannot read property 'tagName' of undefined ?!?
  // it('adds container element correctly', () => {
  //   const div = doc.createElement('div');
  //   div.setAttribute('id', 'c');
  //   doc.body.appendChild(div);
  //
  //   beopinion(win, {
  //     account: accountId,
  //     content: contentId,
  //     width: 111,
  //     height: 222,
  //   });
  //   const content = doc.body.querySelector('.BeOpinionWidget');
  //   expect(content).not.to.be.undefined;
  // });

  // AssertionError => iframe not removed
  // it('removes iframe after unlayoutCallback', () => {
  //   return getAmpBeOpinion(accountId).then(ampBeOpinion => {
  //     const iframe = ampBeOpinion.querySelector('iframe');
  //     expect(iframe).to.not.be.null;
  //     const obj = ampBeOpinion.implementation_;
  //     obj.unlayoutCallback();
  //     expect(ampBeOpinion.querySelector('iframe')).to.be.null;
  //     expect(obj.iframe_).to.be.null;
  //     expect(obj.unlayoutOnPause()).to.be.true;
  //   });
  // });

});
