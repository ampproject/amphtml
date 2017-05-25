/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  getTrackImpressionPromise,
  maybeTrackImpression,
  resetTrackImpressionPromiseForTesting,
} from '../../src/impression';
import {toggleExperiment} from '../../src/experiments';
import {viewerForDoc} from '../../src/services';
import {xhrFor} from '../../src/services';
import * as sinon from 'sinon';

describe('impression', () => {

  let sandbox;
  let viewer;
  let xhr;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    viewer = viewerForDoc(window.document);
    sandbox.stub(viewer, 'getParam');
    xhr = xhrFor(window);
    expect(xhr.fetchJson).to.be.defined;
    sandbox.stub(xhr, 'fetchJson' () => {
      return Promise.resolve({
        json() {
          return Promise.resolve(null);
        },
      });
    });
    sandbox.spy(xhr, 'fetchJson');
    sandbox.stub(viewer, 'whenFirstVisible').returns(Promise.resolve());
    resetTrackImpressionPromiseForTesting();
  });

  afterEach(() => {
    toggleExperiment(window, 'alp', false);
    sandbox.restore();
  });

  it('should do nothing if the experiment is off', () => {
    viewer.getParam.throws(new Error('Should not be called'));
    maybeTrackImpression(window);
    return getTrackImpressionPromise().should.be.fulfilled;
  });

  it('should do nothing if there is no click arg', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('');
    maybeTrackImpression(window);
    expect(xhr.fetchJson).to.have.not.been.called;
    return getTrackImpressionPromise().should.be.fulfilled;
  });

  it('should do nothing if there is the click arg is http', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('http://www.example.com');
    maybeTrackImpression(window);
    expect(xhr.fetchJson).to.have.not.been.called;
    return getTrackImpressionPromise().should.be.fulfilled;
  });

  it('should invoke URL', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    maybeTrackImpression(window);
    expect(xhr.fetchJson).to.have.not.been.called;
    return Promise.resolve().then(() => {
      expect(xhr.fetchJson).to.be.calledOnce;
      const url = xhr.fetchJson.lastCall.args[0];
      const params = xhr.fetchJson.lastCall.args[1];
      expect(url).to.equal('https://www.example.com');
      expect(params).to.jsonEqual({
        credentials: 'include',
      });
    });
  });

  it('should do nothing if response is not received', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    xhr.fetchJson.returns(new Promise(resolve => {
      setTimeout(() => {
        resolve({
          json() {
            return Promise.resolve({
              'location': 'test_location?gclid=654321',
            });
          }
        });
      }, 5000);
    }));
    const clock = sandbox.useFakeTimers();
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
    clock.tick(2001);
    return promise.then(() => {
      expect(window.location.href).to.not.contain('gclid=654321');
    });
  });

  it('should resolve trackImpressionPromise after timeout', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    xhr.fetchJson.returns(new Promise(resolve => {
      setTimeout(() => {
        resolve({
          json() {
            return Promise.resolve(null);
          }
        });
      }, 10000);
    }));
    const clock = sandbox.useFakeTimers();
    maybeTrackImpression(window);
    return Promise.resolve().then(() => {
      clock.tick(8001);
      return getTrackImpressionPromise().should.be.fulfilled;
    });
  });

  it('should do nothing if get empty response', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    const prevHref = window.location.href;
    maybeTrackImpression(window);
    return Promise.resolve().then(() => {
      return Promise.resolve().then(() => {
        expect(window.location.href).to.equal(prevHref);
        return getTrackImpressionPromise().should.be.fulfilled;
      });
    });
  });

  it('should replace location href only with query params', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('https://www.example.com');

    xhr.fetchJson.returns(Promise.resolve({
      json() {
        return Promise.resolve({
          'location': 'test_location?gclid=123456&foo=bar&example=123',
        });
      },
    }));
    const prevHref = window.location.href;
    window.history.replaceState(null, '', prevHref + '?bar=foo&test=4321');
    maybeTrackImpression(window);
    return Promise.resolve().then(() => {
      return Promise.resolve().then(() => {
        expect(window.location.href).to.equal('http://localhost:9876/context.html'
            + '?bar=foo&test=4321&gclid=123456&foo=bar&example=123');
        window.history.replaceState(null, '', prevHref);
        return getTrackImpressionPromise().should.be.fulfilled;
      });
    });
  });
});
