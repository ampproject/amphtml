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

import {AmpAdNetworkGmosspImpl} from '../amp-ad-network-gmossp-impl';
import {
  AmpAdUIHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-ui';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import * as sinon from 'sinon';
import {gmosspIsA4AEnabled} from '../gmossp-a4a-config';
import {createElementWithAttributes} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';

describe('gmossp-a4a-config', () => {
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
      src: 'https://sp.gmossp-sp.jp/ads/ssp.ad?space_id=33303&is_a4a=1',
      'data-use-a4a': 'true',
    });
    expect(gmosspIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to missing use-a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://sp.gmossp-sp.jp/ads/ssp.ad?space_id=33303&is_a4a=1',
    });
    expect(gmosspIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-use-a4a': 'true',
    });
    expect(gmosspIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to invalid src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://evil.com?hello=world&https://sp.gmossp-sp.jp',
      'data-use-a4a': 'true',
    });
    expect(gmosspIsA4AEnabled(win, element)).to.be.false;
  });
});

describe('amp-ad-network-gmossp-impl', () => {

  let sandbox;
  let gmosspImpl;
  let gmosspImplElem;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    gmosspImplElem = document.createElement('amp-ad');
    gmosspImplElem.setAttribute('type', 'gmossp');
    gmosspImplElem.setAttribute('src',
        'https://sp.gmossp-sp.jp/ads/ssp.ad?space_id=33303&is_a4a=1');
    gmosspImplElem.setAttribute('data-use-a4a', 'true');
    sandbox.stub(AmpAdNetworkGmosspImpl.prototype, 'getSigningServiceNames',
        () => {
          return ['google'];
        });
    gmosspImpl = new AmpAdNetworkGmosspImpl(gmosspImplElem);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(gmosspImpl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      gmosspImplElem =
document.createElement('amp-ad-network-gmossp-impl');
      gmosspImplElem.setAttribute('type', 'gmossp');
      gmosspImpl = new AmpAdNetworkGmosspImpl(gmosspImplElem);
      expect(gmosspImpl.isValidElement()).to.be.false;
    });
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const base = 'https://sp.gmossp-sp.jp/ads/ssp.ad?';
      expect(gmosspImpl.getAdUrl().substring(0, base.length)).to.equal(base);
    });
  });

  describe('#extractCreativeAndSignature', () => {
    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(gmosspImpl.extractCreativeAndSignature(
            creative,
            {
              get: function() { return undefined; },
              has() { return false; },
            })).to.eventually.deep.equal(
            {creative, signature: null}
          );
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(gmosspImpl.extractCreativeAndSignature(
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
