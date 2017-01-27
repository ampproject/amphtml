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

import {AmpAdNetworkCloudflareImpl} from '../amp-ad-network-cloudflare-impl';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import * as sinon from 'sinon';
import {cloudflareIsA4AEnabled} from '../cloudflare-a4a-config';
import {createElementWithAttributes} from '../../../../src/dom';
import {createIframePromise} from '../../../../testing/iframe';

describe('cloudflare-a4a-config', () => {
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
      src: '/ad.html',
      'data-a4a': 'true',
    });
    expect(cloudflareIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to missing a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: '/ad.html',
    });
    expect(cloudflareIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-a4a': 'true',
    });
    expect(cloudflareIsA4AEnabled(win, element)).to.be.false;
  });
});

describe('amp-ad-network-cloudflare-impl', () => {

  let sandbox;
  let cloudflareImpl;
  let cloudflareImplElem;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    cloudflareImplElem = document.createElement('amp-ad');
    cloudflareImplElem.setAttribute('type', 'cloudflare');
    cloudflareImplElem.setAttribute('src', '/fake_a4a.json.html');
    cloudflareImplElem.setAttribute('data-a4a','true');
    sandbox.stub(AmpAdNetworkCloudflareImpl.prototype, 'getSigningServiceNames',
      () => {
        return ['cloudflare','cloudflare-dev'];
      });
    cloudflareImpl = new AmpAdNetworkCloudflareImpl(cloudflareImplElem);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(cloudflareImpl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      cloudflareImplElem =
document.createElement('amp-ad-network-cloudflare-impl');
      cloudflareImplElem.setAttribute('type', 'cloudflare');
      cloudflareImpl = new AmpAdNetworkCloudflareImpl(cloudflareImplElem);
      expect(cloudflareImpl.isValidElement()).to.be.false;
    });
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      expect(cloudflareImpl.getAdUrl()).to.equal(
'/extensions/amp-ad-network-cloudflare-impl/0.1/data/fake_a4a.json.html');
    });
  });

  describe('#extractCreativeAndSignature', () => {
    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(cloudflareImpl.extractCreativeAndSignature(
          creative,
          {
            get: function() { return undefined; },
            has: function() { return false; },
          })).to.eventually.deep.equal(
            {creative, signature: null}
          );
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(cloudflareImpl.extractCreativeAndSignature(
          creative,
          {
            get: function(name) {
              return name == 'X-AmpAdSignature' ? 'AQAB' : undefined;
            },
            has: function(name) {
              return name === 'X-AmpAdSignature';
            },
          })).to.eventually.deep.equal(
            {creative, signature: base64UrlDecodeToBytes('AQAB')}
          );
      });
    });
  });
});
