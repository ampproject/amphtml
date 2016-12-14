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

import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {AmpAdUIHandler} from '../../../amp-ad/0.1/amp-ad-ui'; // eslint-disable-line no-unused-vars
import {
  AmpAdXOriginIframeHandler,    // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {utf8Encode} from '../../../../src/utils/bytes';
import * as sinon from 'sinon';

describe('amp-ad-network-doubleclick-impl', () => {

  let sandbox;
  let doubleclickImpl;
  let doubleclickImplElem;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    doubleclickImplElem = document.createElement('amp-ad');
    doubleclickImplElem.setAttribute('type', 'doubleclick');
    doubleclickImplElem.setAttribute('data-ad-client', 'adsense');
    sandbox.stub(AmpAdNetworkDoubleclickImpl.prototype,
                 'getSigningServiceNames',
        () => {
          return ['google'];
        });
    document.body.appendChild(doubleclickImplElem);
    doubleclickImpl = new AmpAdNetworkDoubleclickImpl(doubleclickImplElem);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(doubleclickImpl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      doubleclickImplElem =
        document.createElement('amp-ad-network-doubleclick-impl');
      doubleclickImplElem.setAttribute('type', 'doubleclick');
      doubleclickImplElem.setAttribute('data-ad-client', 'doubleclick');
      doubleclickImpl = new AmpAdNetworkDoubleclickImpl(doubleclickImplElem);
      expect(doubleclickImpl.isValidElement()).to.be.false;
    });
    it.skip('should be NOT valid (missing ad client)', () => {
      // TODO(taymonbeal): reenable this test after clarifying validation
      doubleclickImplElem.setAttribute('data-ad-client', '');
      doubleclickImplElem.setAttribute('type', 'doubleclick');
      expect(doubleclickImpl.isValidElement()).to.be.false;
    });
    it('should be valid (amp-embed)', () => {
      doubleclickImplElem = document.createElement('amp-embed');
      doubleclickImplElem.setAttribute('type', 'doubleclick');
      doubleclickImplElem.setAttribute('data-ad-client', 'doubleclick');
      doubleclickImpl = new AmpAdNetworkDoubleclickImpl(doubleclickImplElem);
      expect(doubleclickImpl.isValidElement()).to.be.true;
    });
  });

  describe('#extractCreativeAndSignature', () => {
    it('without signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(doubleclickImpl.extractCreativeAndSignature(
          creative,
          {
            get: function() { return undefined; },
            has: function() { return false; },
          })).to.eventually.deep.equal(
                {creative, signature: null});
      });
    });
    it('with signature', () => {
      return utf8Encode('some creative').then(creative => {
        return expect(doubleclickImpl.extractCreativeAndSignature(
          creative,
          {
            get: function(name) {
              return name == 'X-AmpAdSignature' ? 'AQAB' : undefined;
            },
            has: function(name) {
              return name === 'X-AmpAdSignature';
            },
          })).to.eventually.deep.equal(
              {creative, signature: base64UrlDecodeToBytes('AQAB')});
      });
    });
  });

  describe('#getAdUrl', () => {
    it('returns the right URL', () => {
      doubleclickImpl.onLayoutMeasure();
      return doubleclickImpl.getAdUrl().then(url => {
        expect(url).to.match(new RegExp(
          'https://securepubads\\.g\\.doubleclick\\.net/gampad/ads' +
          // Depending on how the test is run, it can get different results.
          '\\?adk=[0-9]+&gdfp_req=1&impl=ifr&sfv=A&sz=0x0&u_sd=2' +
          '&adtest=false' +
          '&is_amp=3&amp_v=%24internalRuntimeVersion%24' +
          '&d_imp=1&dt=[0-9]+&ifi=[0-9]+&adf=[0-9]+' +
          '&c=[0-9]+&output=html&nhd=1&biw=1050&bih=755' +
          '&adx=-10000&ady=-10000&u_ah=873&u_aw=1440&u_cd=24' +
          '&u_w=1440&u_h=900&u_tz=-[0-9]+&u_his=[0-9]+' +
          '&brdim=22%2C45%2C22%2C45%2C1440%2C23%2C1050%2C829%2C1050%2C755' +
          '&isw=1050&ish=755&dtd=[0-9]+' +
          '&url=https?%3A%2F%2F[a-zA-Z0-9.:%]+' +
          '&top=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+' +
          '(&loc=https?%3A%2F%2[a-zA-Z0-9.:%]+)?' +
          '&ref=https?%3A%2F%2Flocalhost%3A9876%2F%3Fid%3D[0-9]+'));
      });
    });
  });
});
