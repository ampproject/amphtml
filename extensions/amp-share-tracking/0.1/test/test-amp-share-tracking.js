/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createIframePromise} from '../../../../testing/iframe';
import {AmpShareTracking} from '../amp-share-tracking';
import {Viewer} from '../../../../src/service/viewer-impl';
import {Xhr} from '../../../../src/service/xhr-impl';
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';

describe('amp-share-tracking', () => {
  let sandbox;
  let viewerForMock;
  let xhrMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    viewerForMock = sandbox.stub(Viewer.prototype, 'getFragment');
    xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpShareTracking(optVendorUrl, optStubGetIncomingFragment,
        optStubGetOutgoingFragment) {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-share-tracking', true);
      const el = iframe.doc.createElement('amp-share-tracking');
      if (optVendorUrl) {
        el.setAttribute('data-href', optVendorUrl);
      }
      const ampShareTracking = new AmpShareTracking(el);
      if (optStubGetIncomingFragment) {
        sandbox.stub(ampShareTracking, 'getIncomingFragment',
            () => optStubGetIncomingFragment);
      }
      if (optStubGetOutgoingFragment) {
        sandbox.stub(ampShareTracking, 'getOutgoingFragment',
            () => optStubGetOutgoingFragment);
      }
      return ampShareTracking;
    });
  }

  it('should get vendor url from data-href', () => {
    return getAmpShareTracking(
      /*vendorUrl*/'http://foo.bar',
      /*stubGetIncomingFragment*/Promise.resolve(),
      /*stubGetOutgoingFragment*/Promise.resolve()).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(() => {
          expect(ampShareTracking.vendorHref).to.equal('http://foo.bar');
        });
      });
  });

  it('should get incoming fragment starting with dot', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('.12345'));
    return getAmpShareTracking(
      /*vendorUrl*/undefined,
      /*stubGetIncomingFragment*/undefined,
      /*stubGetOutgoingFragment*/Promise.resolve()).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.equal('12345');
          expect(fragments.outgoingFragment).to.be.undefined;
        });
      });
  });

  it('should get incoming fragment starting with dot and ignore ' +
      'other parameters', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('.12345&key=value'));
    return getAmpShareTracking(
      /*vendorUrl*/undefined,
      /*stubGetIncomingFragment*/undefined,
      /*stubGetOutgoingFragment*/Promise.resolve()).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.equal('12345');
          expect(fragments.outgoingFragment).to.be.undefined;
        });
      });
  });

  it('should ignore incoming fragment if it is empty', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve());
    return getAmpShareTracking(
      /*vendorUrl*/undefined,
      /*stubGetIncomingFragment*/undefined,
      /*stubGetOutgoingFragment*/Promise.resolve()).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.be.undefined;
          expect(fragments.outgoingFragment).to.be.undefined;
        });
      });
  });

  it('should ignore incoming fragment if it does not start with dot', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('12345'));
    return getAmpShareTracking(
      /*vendorUrl*/undefined,
      /*stubGetIncomingFragment*/undefined,
      /*stubGetOutgoingFragment*/Promise.resolve()).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.be.undefined;
          expect(fragments.outgoingFragment).to.be.undefined;
        });
      });
  });

  it('should get outgoing fragment randomly if no vendor url ' +
      'is provided', () => {
    return getAmpShareTracking(
      /*vendorUrl*/undefined,
      /*stubGetIncomingFragment*/Promise.resolve(),
      /*stubGetOutgoingFragment*/undefined).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.be.undefined;
          expect(fragments.outgoingFragment).to.equal('rAmDoM');
        });
      });
  });

  it('should get outgoing fragment from vendor if vendor url is provided ' +
      'and the response format is correct', () => {
    const mockJsonResponse = {outgoingFragment: '54321'};
    xhrMock.onFirstCall().returns(Promise.resolve(mockJsonResponse));
    return getAmpShareTracking(
      /*vendorUrl*/'http://foo.bar',
      /*stubGetIncomingFragment*/Promise.resolve(),
      /*stubGetOutgoingFragment*/undefined).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.be.undefined;
          expect(fragments.outgoingFragment).to.equal('54321');
        });
      });
  });

  it('should get outgoing fragment randomly if vendor url is provided ' +
      'but the response format is NOT correct', () => {
    const mockJsonResponse = {foo: 'bar'};
    xhrMock.onFirstCall().returns(Promise.resolve(mockJsonResponse));
    return getAmpShareTracking(
      /*vendorUrl*/'http://foo.bar',
      /*stubGetIncomingFragment*/Promise.resolve(),
      /*stubGetOutgoingFragment*/undefined).then(ampShareTracking => {
        ampShareTracking.buildCallback();
        return ampShareTracking.shareTrackingFragments.then(fragments => {
          expect(fragments.incomingFragment).to.be.undefined;
          expect(fragments.outgoingFragment).to.equal('rAmDoM');
        });
      });
  });
});
