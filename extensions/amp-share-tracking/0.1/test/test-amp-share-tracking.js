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

import {AmpShareTracking} from '../amp-share-tracking';
import {History} from '../../../../src/service/history-impl';
import {Xhr} from '../../../../src/service/xhr-impl';
import {shareTrackingForOrNull} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';
import * as bytes from '../../../../src/utils/bytes';

describes.fakeWin('amp-share-tracking', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-share-tracking'],
  },
}, env => {
  let win;
  let ampdoc;
  let historyGetFragmentStub;
  let historyUpdateFragmentStub;
  let xhrStub;
  let randomBytesStub;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    historyGetFragmentStub = sandbox.stub(History.prototype, 'getFragment');
    historyUpdateFragmentStub = sandbox.stub(History.prototype,
        'updateFragment');
    xhrStub = sandbox.stub(Xhr.prototype, 'fetchJson');
    randomBytesStub = sandbox.stub(bytes, 'getCryptoRandomBytesArray');
    toggleExperiment(win, 'amp-share-tracking', true);
  });

  afterEach(() => {
    toggleExperiment(win, 'amp-share-tracking', false);
  });

  function getAmpShareTracking(optVendorUrl) {
    const element = win.document.createElement('amp-share-tracking');
    if (optVendorUrl) {
      element.setAttribute('data-href', optVendorUrl);
    }
    element.getAmpDoc = () => ampdoc;
    const ampShareTracking = new AmpShareTracking(element);
    ampShareTracking.buildCallback();
    return ampShareTracking;
  }

  it('should get incoming fragment starting with dot', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve('.12345'));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.incomingFragment).to.equal('12345');
    });
  });

  it('should get incoming fragment starting with dot and ignore ' +
      'other parameters', () => {
    historyGetFragmentStub.onFirstCall()
        .returns(Promise.resolve('.12345&key=value'));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.incomingFragment).to.equal('12345');
    });
  });

  it('should ignore incoming fragment if it is empty', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.incomingFragment).to.equal('');
    });
  });

  it('should ignore incoming fragment if it does not start with dot', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve('12345'));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.incomingFragment).to.equal('');
    });
  });

  it('should get outgoing fragment randomly if no vendor url is provided ' +
      'and win.crypto is availble, update the url fragment correctly ' +
      'when original fragment is empty', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    randomBytesStub.onFirstCall().returns(new Uint8Array([1, 2, 3, 4, 5, 6]));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      // the base64url of byte array [1, 2, 3, 4, 5, 6]
      expect(fragments.outgoingFragment).to.equal('AQIDBAUG');
      expect(historyUpdateFragmentStub.withArgs('.AQIDBAUG')).to.be
          .calledOnce;
    });
  });

  it('should get outgoing fragment randomly if no vendor url is provided ' +
      'and win.crypto is availble, update the url fragment correctly ' +
      'when original fragment only contains share tracking fragment', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve('.12345'));
    randomBytesStub.onFirstCall().returns(new Uint8Array([1, 2, 3, 4, 5, 6]));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      // the base64url of byte array [1, 2, 3, 4, 5, 6]
      expect(fragments.outgoingFragment).to.equal('AQIDBAUG');
      expect(historyUpdateFragmentStub.withArgs('.AQIDBAUG')).to.be
          .calledOnce;
    });
  });

  it('should get outgoing fragment randomly if no vendor url is provided ' +
      'and win.crypto is availble, update the url fragment correctly ' +
      'when original fragment contains share tracking fragment and ' +
      'other fragments', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(
        '.12345&key=value'));
    randomBytesStub.onFirstCall().returns(new Uint8Array([1, 2, 3, 4, 5, 6]));
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      // the base64url of byte array [1, 2, 3, 4, 5, 6]
      expect(fragments.outgoingFragment).to.equal('AQIDBAUG');
      expect(historyUpdateFragmentStub.withArgs('.AQIDBAUG&key=value'))
          .to.be.calledOnce;
    });
  });

  it('should get outgoing fragment randomly if no vendor url ' +
      'is provided and fallback to Math.random generation', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    sandbox.stub(Math, 'random').returns(0.123456789123456789);
    randomBytesStub.onFirstCall().returns(null);
    const ampShareTracking = getAmpShareTracking();
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.outgoingFragment).to.equal('H5rdN8Eh');
      expect(historyUpdateFragmentStub.withArgs('.H5rdN8Eh')).to.be
          .calledOnce;
    });
  });

  it('should get outgoing fragment from vendor if vendor url is provided ' +
      'and the response format is correct', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    const mockJsonResponse = {fragment: '54321'};
    xhrStub.onFirstCall().returns(Promise.resolve({
      json() {
        return Promise.resolve(mockJsonResponse);
      },
    }));
    const ampShareTracking = getAmpShareTracking('http://foo.bar');
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(fragments.outgoingFragment).to.equal('54321');
      expect(historyUpdateFragmentStub.withArgs('.54321')).to.be.calledOnce;
    });
  });

  it('should get empty outgoing fragment if vendor url is provided ' +
      'but the response format is NOT correct', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    xhrStub.onFirstCall().returns(Promise.resolve({
      json() {
        return Promise.resolve({foo: 'bar'});
      },
    }));
    const ampShareTracking = getAmpShareTracking('http://foo.bar');
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(historyUpdateFragmentStub).to.not.be.called;
      expect(fragments.outgoingFragment).to.equal('');
    });
  });

  it('should call fetchJson with correct request when getting outgoing' +
      'fragment', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    xhrStub.onFirstCall().returns(Promise.resolve({
      json() {
        return Promise.resolve({fragment: '54321'});
      },
    }));
    const ampShareTracking = getAmpShareTracking('http://foo.bar');
    const xhrCall = xhrStub.getCall(0);
    expect(xhrCall.args[0]).to.equal('http://foo.bar');
    expect(xhrCall.args[1]).to.jsonEqual({
      method: 'POST',
      credentials: 'include',
      body: {},
    });
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(historyUpdateFragmentStub.withArgs('.54321')).to.be.calledOnce;
      expect(fragments.outgoingFragment).to.equal('54321');
    });
  });

  it('should get empty outgoing fragment if vendor url is provided ' +
      'but the xhr fails', () => {
    historyGetFragmentStub.onFirstCall().returns(Promise.resolve(''));
    xhrStub.onFirstCall().returns(Promise.reject({
      status: 404,
      json() {
        return Promise.reject('404 bad json');
      },
    }));
    const ampShareTracking = getAmpShareTracking('http://foo.bar');
    return shareTrackingForOrNull(ampShareTracking.win).then(fragments => {
      expect(historyGetFragmentStub).to.be.calledOnce;
      expect(historyUpdateFragmentStub).to.not.be.called;
      expect(fragments.outgoingFragment).to.equal('');
    });
  });
});
