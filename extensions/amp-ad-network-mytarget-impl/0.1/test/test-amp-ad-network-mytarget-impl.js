/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAdNetworkMyTargetImpl} from '../amp-ad-network-mytarget-impl';
import {
  AmpAdUIHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-ui';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {createElementWithAttributes} from '../../../../src/dom';
import {myTargetIsA4AEnabled} from '../mytarget-a4a-config';

describes.realWin('mytarget-a4a-config', {amp: false}, env => {
  let doc;
  let win;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-ad-slot': '197378',
      'data-use-a4a': 'true',
    });
    expect(myTargetIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to useRemoteHtml', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-ad-slot': '197378',
      'data-use-a4a': 'true',
    });
    const useRemoteHtml = true;
    expect(myTargetIsA4AEnabled(win, element, useRemoteHtml)).to.be.false;
  });
  it('should fail a4a config predicate due to missing use-a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-ad-slot': '197378',
    });
    expect(myTargetIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing data-ad-slot', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-use-a4a': 'true',
    });
    expect(myTargetIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to empty data-ad-slot', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-ad-slot': '',
      'data-use-a4a': 'true',
    });
    expect(myTargetIsA4AEnabled(win, element)).to.be.false;
  });
});

describes.realWin(
  'amp-ad-network-mytarget-impl',
  {
    amp: {
      extensions: ['amp-ad-network-mytarget-impl'],
    },
  },
  env => {
    let win, doc;
    let mytargetImpl;
    let mytargetImplElem;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      mytargetImplElem = doc.createElement('amp-ad');
      mytargetImplElem.setAttribute('type', 'mytarget');
      mytargetImplElem.setAttribute('data-ad-slot', '197378');
      mytargetImplElem.setAttribute('data-use-a4a', 'true');
      env.sandbox
        .stub(AmpAdNetworkMyTargetImpl.prototype, 'getSigningServiceNames')
        .callsFake(() => {
          return ['cloudflare'];
        });
      mytargetImpl = new AmpAdNetworkMyTargetImpl(mytargetImplElem);
    });

    describe('#isValidElement', () => {
      it('should be valid', () => {
        expect(mytargetImpl.isValidElement()).to.be.true;
      });
      it('should NOT be valid (impl tag name)', () => {
        mytargetImplElem = doc.createElement('amp-ad-network-mytarget-impl');
        mytargetImplElem.setAttribute('type', 'triplelift');
        mytargetImpl = new AmpAdNetworkMyTargetImpl(mytargetImplElem);
        expect(mytargetImpl.isValidElement()).to.be.false;
      });
    });

    describe('#getRenderingMethod', () => {
      it('should be equal to "nameframe"', () => {
        expect(mytargetImpl.getNonAmpCreativeRenderingMethod()).to.equal(
          'nameframe'
        );
      });
    });

    describe('#getAdUrl', () => {
      it('should be valid', () => {
        expect(mytargetImpl.getAdUrl()).to.equal(
          'https://ad.mail.ru/adp/?q=197378'
        );
      });
    });

    describe('#getAdUrl with query parameters', () => {
      it('should add query parameters', () => {
        mytargetImplElem.setAttribute('data-ad-query', 'preview=1');
        mytargetImpl = new AmpAdNetworkMyTargetImpl(mytargetImplElem);
        expect(mytargetImpl.getAdUrl()).to.equal(
          'https://ad.mail.ru/adp/?q=197378&preview=1'
        );
      });

      it('should encode query parameters', () => {
        mytargetImplElem.setAttribute(
          'data-ad-query',
          'preview=1&test=foo|bar'
        );
        mytargetImpl = new AmpAdNetworkMyTargetImpl(mytargetImplElem);
        expect(mytargetImpl.getAdUrl()).to.equal(
          'https://ad.mail.ru/adp/?q=197378&preview=1&test=foo%7Cbar'
        );
      });
    });
  }
);
