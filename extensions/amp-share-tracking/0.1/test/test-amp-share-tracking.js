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
import {
  AmpShareTracking,
  ShareTrackingService,
} from '../amp-share-tracking';
import {Viewer} from '../../../../src/service/viewer-impl';
import {Xhr} from '../../../../src/service/xhr-impl';
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';

describe('amp-share-tracking', () => {
  let sandbox;
  let shareTrackingService;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    shareTrackingService = {
      getIncomingFragment: () => Promise.resolve('inFragment'),
      getOutgoingFragment: () => Promise.resolve('outFragment'),
    };
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
      ampShareTracking.createdCallback();
      ampShareTracking.shareTrackingService_ = shareTrackingService;
      return ampShareTracking;
    });
  }

  it('should get vendor url from data-href', () => {
    return getAmpShareTracking('http://foo.bar').then(ampShareTracking => {
      ampShareTracking.buildCallback().then(() => {
        expect(ampShareTracking.vendorHref).to.equal('http://foo.bar');
      });
    });
  });

  it('should get incoming/outging fragment from service', () => {
    return getAmpShareTracking().then(ampShareTracking => {
      ampShareTracking.buildCallback().then(() => {
        expect(ampShareTracking.incomingFragment).to.equal('inFragment');
        expect(ampShareTracking.outgoingFragment).to.equal('outFragment');
        expect(ampShareTracking.vendorHref).to.be.null;
      });
    });
  });

  describe('ShareTrackingService', () => {
    let service;
    let viewerForMock;
    let xhrMock;

    beforeEach(() => {
      service = new ShareTrackingService(window);
      viewerForMock = sandbox.stub(Viewer.prototype,
          'getShareTrackingIncomingFragment');
      xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');
    });

    it('should get incoming fragment starting with dot', () => {
      service.win_.location.hash = '.12345';
      service.getIncomingFragment().then(str => {
        expect(str).to.equal('12345');
      });
    });

    it('should get incoming fragment starting with dot ' +
        'and ignore any parameters', () => {
      service.win_.location.hash = '.12345&key=value';
      service.getIncomingFragment().then(str => {
        expect(str).to.equal('12345');
      });
    });

    it('should get incoming fragment from the viewer ' +
        'if fragment is empty', () => {
      service.win_.location.hash = '';
      viewerForMock.onFirstCall().returns(Promise.resolve('12345'));
      service.getIncomingFragment().then(str => {
        expect(str).to.equal('12345');
      });
    });

    it('should get incoming fragment from the viewer ' +
        'if no fragment starting with dot is provided', () => {
      service.win_.location.hash = '54321';
      viewerForMock.onFirstCall().returns(Promise.resolve('12345'));
      service.getIncomingFragment().then(str => {
        expect(str).to.equal('12345');
      });
    });

    it('should get outgoing fragment randomly if no vendor url ' +
        'is provided', () => {
      service.getRandomFragment = () => 'rAmDoM';
      return service.getOutgoingFragment().then(str => {
        expect(str).to.equal('rAmDoM');
      });
    });

    it('should get outgoing fragment from vendor if vendor url is provided ' +
        'and the response format is correct', () => {
      const mockJsonResponse = {outgoingFragment: '54321'};
      xhrMock.onFirstCall().returns(Promise.resolve(mockJsonResponse));
      return service.getOutgoingFragment('http://foo.bar').then(str => {
        expect(str).to.equal('54321');
      });
    });

    it('should get outgoing fragment randomly if vendor url is provided ' +
        'but the response format is NOT correct', () => {
      const mockJsonResponse = {foo: 'bar'};
      service.getRandomFragment = () => 'rAmDoM';
      xhrMock.onFirstCall().returns(Promise.resolve(mockJsonResponse));
      return service.getOutgoingFragment('http://foo.bar').then(str => {
        expect(str).to.equal('rAmDoM');
      });
    });
  });

});
