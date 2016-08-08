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
import {shareTrackingForOrNull} from '../../../../src/share-tracking-service';
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

  function getAmpShareTracking(optVendorUrl) {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-share-tracking', true);
      const el = iframe.doc.createElement('amp-share-tracking');
      if (optVendorUrl) {
        el.setAttribute('data-href', optVendorUrl);
      }
      const ampShareTracking = new AmpShareTracking(el);
      ampShareTracking.buildCallback();
      return ampShareTracking;
    });
  }

  it('should get incoming fragment starting with dot', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('.12345'));
    return getAmpShareTracking().then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.incomingFragment).to.equal('12345');
      });
    });
  });

  it('should get incoming fragment starting with dot and ignore ' +
      'other parameters', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('.12345&key=value'));
    return getAmpShareTracking().then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.incomingFragment).to.equal('12345');
      });
    });
  });

  it('should ignore incoming fragment if it is empty', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    return getAmpShareTracking().then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.incomingFragment).to.equal('');
      });
    });
  });

  it('should ignore incoming fragment if it does not start with dot', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve('12345'));
    return getAmpShareTracking().then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.incomingFragment).to.equal('');
      });
    });
  });

  it('should get outgoing fragment randomly if no vendor url ' +
      'is provided', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    return getAmpShareTracking().then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.outgoingFragment).to.equal('rAmDoM');
      });
    });
  });

  it('should get outgoing fragment from vendor if vendor url is provided ' +
      'and the response format is correct', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    const mockJsonResponse = {fragment: '54321'};
    xhrMock.onFirstCall().returns(Promise.resolve(mockJsonResponse));
    return getAmpShareTracking('http://foo.bar').then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.outgoingFragment).to.equal('54321');
      });
    });
  });

  it('should get empty outgoing fragment if vendor url is provided ' +
      'but the response format is NOT correct', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    xhrMock.onFirstCall().returns(Promise.resolve({foo: 'bar'}));
    return getAmpShareTracking('http://foo.bar').then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.outgoingFragment).to.equal('');
      });
    });
  });

  it('should call fetchJson with correct request when getting outgoing' +
      'fragment', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    xhrMock.onFirstCall().returns(Promise.resolve({fragment: '54321'}));
    return getAmpShareTracking('http://foo.bar').then(ampShareTracking => {
      const xhrCall = xhrMock.getCall(0);
      expect(xhrCall.args[0]).to.equal('http://foo.bar');
      expect(xhrCall.args[1]).to.jsonEqual({
        method: 'POST',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
        body: {},
      });
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.outgoingFragment).to.equal('54321');
      });
    });
  });

  it('should get empty outgoing fragment if vendor url is provided ' +
      'but the xhr fails', () => {
    viewerForMock.onFirstCall().returns(Promise.resolve(''));
    xhrMock.onFirstCall().returns(Promise.reject('404'));
    return getAmpShareTracking('http://foo.bar').then(ampShareTracking => {
      return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
        expect(fragments.outgoingFragment).to.equal('');
      });
    });
  });
});
