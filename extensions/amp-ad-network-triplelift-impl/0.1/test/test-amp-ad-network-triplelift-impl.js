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

import {AmpAdNetworkTripleliftImpl} from '../amp-ad-network-triplelift-impl';
import {
  AmpAdUIHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-ui';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {createElementWithAttributes} from '../../../../src/dom';
import {tripleliftIsA4AEnabled} from '../triplelift-a4a-config';

describes.realWin('triplelift-a4a-config', {amp: false}, env => {
  let doc;
  let win;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed',
      'data-use-a4a': 'true',
    });
    expect(tripleliftIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to useRemoteHtml', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed',
      'data-use-a4a': 'true',
    });
    const useRemoteHtml = true;
    expect(tripleliftIsA4AEnabled(win, element, useRemoteHtml)).to.be.false;
  });
  it('should fail a4a config predicate due to missing use-a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed',
    });
    expect(tripleliftIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-use-a4a': 'true',
    });
    expect(tripleliftIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to invalid src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://evil.com?hello=world&https://ib.3lift.com',
      'data-use-a4a': 'true',
    });
    expect(tripleliftIsA4AEnabled(win, element)).to.be.false;
  });
});

describes.realWin(
  'amp-ad-network-triplelift-impl',
  {
    amp: {
      extensions: ['amp-ad-network-triplelift-impl'],
    },
  },
  env => {
    let win, doc;
    let tripleliftImpl;
    let tripleliftImplElem;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      tripleliftImplElem = doc.createElement('amp-ad');
      tripleliftImplElem.setAttribute('type', 'triplelift');
      tripleliftImplElem.setAttribute(
        'src',
        'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed'
      );
      tripleliftImplElem.setAttribute('data-use-a4a', 'true');
      sandbox
        .stub(AmpAdNetworkTripleliftImpl.prototype, 'getSigningServiceNames')
        .callsFake(() => {
          return ['cloudflare'];
        });
      tripleliftImpl = new AmpAdNetworkTripleliftImpl(tripleliftImplElem);
    });

    describe('#isValidElement', () => {
      it('should be valid', () => {
        expect(tripleliftImpl.isValidElement()).to.be.true;
      });
      it('should NOT be valid (impl tag name)', () => {
        tripleliftImplElem = doc.createElement(
          'amp-ad-network-triplelift-impl'
        );
        tripleliftImplElem.setAttribute('type', 'triplelift');
        tripleliftImpl = new AmpAdNetworkTripleliftImpl(tripleliftImplElem);
        expect(tripleliftImpl.isValidElement()).to.be.false;
      });
    });

    describe('#getAdUrl', () => {
      it('should be valid', () => {
        expect(tripleliftImpl.getAdUrl()).to.equal(
          'https://amp.3lift.com/_a4a/amp/auction?inv_code=ampforadstest_main_feed'
        );
      });
    });
  }
);
