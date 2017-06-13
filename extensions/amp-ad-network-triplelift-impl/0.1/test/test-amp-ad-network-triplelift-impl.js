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
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import * as sinon from 'sinon';
import {tripleliftIsA4AEnabled} from '../triplelift-a4a-config';
import {createElementWithAttributes} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';

describe('triplelift-a4a-config', () => {
  let doc;
  let win;
  beforeEach(() => {
    return createIframePromise().then(f => {
      doc = f.doc;
      win = f.win;
    });
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed',
      'data-use-a4a': 'true',
    });
    expect(tripleliftIsA4AEnabled(win, element)).to.be.true;
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

describe('amp-ad-network-triplelift-impl', () => {

  let sandbox;
  let tripleliftImpl;
  let tripleliftImplElem;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    tripleliftImplElem = document.createElement('amp-ad');
    tripleliftImplElem.setAttribute('type', 'triplelift');
    tripleliftImplElem.setAttribute('src',
'https://ib.3lift.com/ttj?inv_code=ampforadstest_main_feed');
    tripleliftImplElem.setAttribute('data-use-a4a','true');
    sandbox.stub(AmpAdNetworkTripleliftImpl.prototype, 'getSigningServiceNames',
      () => {
        return ['cloudflare'];
      });
    tripleliftImpl = new AmpAdNetworkTripleliftImpl(tripleliftImplElem);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(tripleliftImpl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      tripleliftImplElem =
document.createElement('amp-ad-network-triplelift-impl');
      tripleliftImplElem.setAttribute('type', 'triplelift');
      tripleliftImpl = new AmpAdNetworkTripleliftImpl(tripleliftImplElem);
      expect(tripleliftImpl.isValidElement()).to.be.false;
    });
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      expect(tripleliftImpl.getAdUrl()).to.equal(
'https://amp.3lift.com/_a4a/amp/auction?inv_code=ampforadstest_main_feed');
    });
  });

  describe('#extractCreativeAndSignature', () => {
    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(tripleliftImpl.extractCreativeAndSignature(
          creative,
          {
            get() { return undefined; },
            has() { return false; },
          })).to.eventually.deep.equal(
            {creative, signature: null}
          );
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(tripleliftImpl.extractCreativeAndSignature(
          creative,
          {
            get(name) {
              return name == 'X-AmpAdSignature' ? 'AQAB' : undefined;
            },
            has(name) {
              return name === 'X-AmpAdSignature';
            },
          })).to.eventually.deep.equal(
            {creative, signature: base64UrlDecodeToBytes('AQAB')}
          );
      });
    });
  });
});
