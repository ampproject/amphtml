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

import '../amp-poool';
import {poool} from '../../../../3p/poool';

describes.realWin('amp-poool', {
  amp: {
    extensions: ['amp-poool'],
  },
}, env => {

  let win, doc;
  const appId = 'Q9X1R-27SFS-MYC31-MCYQ1';
  const pageType = 'premium';

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getPoool(appId, pageType, forceWidget, debug, optResponsive) {
    const ampPoool = doc.createElement('amp-poool');

    ampPoool.setAttribute('height', 150);
    ampPoool.setAttribute('width', 80);
    ampPoool.setAttribute('data-app-id', appId);
    ampPoool.setAttribute('data-page-type', pageType);
    ampPoool.setAttribute('data-debug', debug);
    ampPoool.setAttribute('data-force-widget', forceWidget);
    if (optResponsive) {ampPoool.setAttribute('layout', 'responsive');}

    doc.body.appendChild(ampPoool);

    return ampPoool.build().then(() => {
      return ampPoool.layoutCallback();
    }).then(() => ampPoool);
  }

  it('renders iframe in amp-poool', () => {
    return getPoool(appId, pageType).then(ampPoool => {
      const iframe = ampPoool.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('renders responsively', () => {
    return getPoool(appId, pageType, 'question', false, true).then(poool => {
      const iframe = poool.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('adds poool paywall correctly', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);
    win.context = {
      tagName: 'AMP-POOOL',
    };

    poool(win, {
      appId: 'Q9X1R-27SFS-MYC31-MCYQ1',
      pageType: 'premium',
      layout: 'responsive',
      width: 150,
      height: 80,
    }, function() {
      const pooolWidget = doc.body.querySelector('#poool-widget');
      expect(pooolWidget).not.to.be.undefined;
      expect(pooolWidget.querySelector('.p3-widget')).to.not.be.null;
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getPoool(appId, pageType, 'gift', false).then(ampPoool => {
      const iframe = ampPoool.querySelector('iframe');
      expect(iframe).to.not.be.null;
      const obj = ampPoool.implementation_;
      obj.unlayoutCallback();
      expect(ampPoool.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
    });
  });

  // it('requires data-app-id', () => {
  //   return allowConsoleError(() => {
  //     return getPoool('', pageType, 'gift', true)
  //         .should.eventually.be.rejectedWith(
  //             /The data-app-id attribute is required for/
  //         );
  //   });
  // });
});
