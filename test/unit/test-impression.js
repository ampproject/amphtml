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

import {Services} from '../../src/services';
import {
  getExtraParamsUrl,
  getTrackImpressionPromise,
  isTrustedReferrer,
  maybeTrackImpression,
  resetTrackImpressionPromiseForTesting,
  shouldAppendExtraParams,
} from '../../src/impression';
import {macroTask} from '../../testing/yield';
import {toggleExperiment} from '../../src/experiments';
import {user} from '../../src/log';

describe('impression', () => {
  let sandbox;
  let viewer;
  let xhr;
  let isTrustedViewer;
  let referrer = 'http://do-not-trust-me.com';
  let warnStub;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    viewer = Services.viewerForDoc(window.document);
    sandbox.stub(viewer, 'getParam');
    sandbox.stub(viewer, 'hasCapability');
    xhr = Services.xhrFor(window);
    expect(xhr.fetchJson).to.exist;
    const stub = sandbox.stub(xhr, 'fetchJson');
    warnStub = sandbox.stub(user(), 'warn');
    stub.returns(
      Promise.resolve({
        json() {
          return Promise.resolve(null);
        },
      })
    );
    sandbox.stub(viewer, 'whenFirstVisible').returns(Promise.resolve());
    isTrustedViewer = false;
    sandbox.stub(viewer, 'isTrustedViewer').callsFake(() => {
      return Promise.resolve(isTrustedViewer);
    });
    sandbox.stub(viewer, 'getReferrerUrl').callsFake(() => {
      return Promise.resolve(referrer);
    });
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

  it('should resolve if no click no replaceUrl', () => {
    toggleExperiment(window, 'alp', true);
    viewer.getParam.withArgs('click').returns('');
    viewer.hasCapability.withArgs('replaceUrl').returns(false);
    maybeTrackImpression(window);
    return getTrackImpressionPromise();
  });

  it('should resolve trackImpressionPromise after timeout', () => {
    toggleExperiment(window, 'alp', true);
    viewer.hasCapability.withArgs('replaceUrl').returns(true);
    viewer.getParam.withArgs('replaceUrl').returns('https://www.example.com');
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    const clock = sandbox.useFakeTimers();
    maybeTrackImpression(window);
    clock.tick(8001);
    return getTrackImpressionPromise();
  });

  it('should resolve after clickUrl and replaceUrl', () => {
    toggleExperiment(window, 'alp', true);
    viewer.hasCapability.withArgs('replaceUrl').returns(true);
    viewer.getParam.withArgs('replaceUrl').returns('https://www.example.com');
    viewer.getParam.withArgs('click').returns('https://www.example.com');
    sandbox.stub(viewer, 'sendMessageAwaitResponse').callsFake(message => {
      if (message == 'getReplaceUrl') {
        return Promise.resolve({'replaceUrl': undefined});
      }
    });
    xhr.fetchJson.returns(
      Promise.resolve({
        json() {
          return Promise.resolve({
            'location': '',
          });
        },
      })
    );
    maybeTrackImpression(window);
    return getTrackImpressionPromise();
  });

  describe('clickUrl', () => {
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

    it('should invoke click URL with experiment on', function*() {
      sandbox.spy(viewer, 'sendMessageAwaitResponse');
      toggleExperiment(window, 'alp', true);
      isTrustedViewer = false;
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      maybeTrackImpression(window);
      expect(xhr.fetchJson).to.have.not.been.called;
      yield macroTask();
      expect(xhr.fetchJson).to.be.calledOnce;
      const url = xhr.fetchJson.lastCall.args[0];
      const params = xhr.fetchJson.lastCall.args[1];
      expect(url).to.equal('https://www.example.com');
      expect(params).to.jsonEqual({
        credentials: 'include',
        requireAmpResponseSourceOrigin: false,
      });
    });

    it('should invoke click URL in trusted viewer', function*() {
      toggleExperiment(window, 'alp', false);
      isTrustedViewer = true;
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      maybeTrackImpression(window);
      expect(xhr.fetchJson).to.have.not.been.called;
      yield macroTask();
      expect(xhr.fetchJson).to.be.calledOnce;
      const url = xhr.fetchJson.lastCall.args[0];
      const params = xhr.fetchJson.lastCall.args[1];
      expect(url).to.equal('https://www.example.com');
      expect(params).to.jsonEqual({
        credentials: 'include',
        requireAmpResponseSourceOrigin: false,
      });
    });

    it('should invoke click URL for trusted referrer', function*() {
      toggleExperiment(window, 'alp', false);
      isTrustedViewer = false;
      referrer = 'https://t.co/docref';
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      maybeTrackImpression(window);
      expect(xhr.fetchJson).to.have.not.been.called;
      yield macroTask();
      expect(xhr.fetchJson).to.be.calledOnce;
      const url = xhr.fetchJson.lastCall.args[0];
      const params = xhr.fetchJson.lastCall.args[1];
      expect(url).to.equal('https://www.example.com');
      expect(params).to.jsonEqual({
        credentials: 'include',
        requireAmpResponseSourceOrigin: false,
      });
    });

    it('should do nothing if response is not received', () => {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      xhr.fetchJson.returns(
        new Promise(() => {
          // never resolves
        })
      );
      const {href} = window.location;
      const clock = sandbox.useFakeTimers();
      maybeTrackImpression(window);
      clock.tick(8001);
      return getTrackImpressionPromise().then(() => {
        expect(window.location.href).to.equal(href);
      });
    });

    it('should do nothing if get empty response', function*() {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      const prevHref = window.location.href;
      maybeTrackImpression(window);
      yield macroTask();
      expect(window.location.href).to.equal(prevHref);
    });

    it('should resolve if get no content response', function*() {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      xhr.fetchJson.returns(
        Promise.resolve({
          // No-content response
          status: 204,
        })
      );
      maybeTrackImpression(window);
      return getTrackImpressionPromise().then(() => {
        expect(warnStub).to.not.be.called;
      });
    });

    it('should still resolve on request error', function*() {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      xhr.fetchJson.returns(
        Promise.resolve({
          status: 404,
        })
      );
      maybeTrackImpression(window);
      return getTrackImpressionPromise().then(() => {
        expect(warnStub).to.be.calledOnce;
      });
    });

    it('should resolve trackImpressionPromise if resolve click', () => {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');
      viewer.hasCapability.withArgs('replaceUrl').returns(false);
      xhr.fetchJson.returns(
        Promise.resolve({
          json() {
            return Promise.resolve({
              'location': '',
            });
          },
        })
      );
      maybeTrackImpression(window);
      return getTrackImpressionPromise();
    });

    it('should replace location href only with query params', () => {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns('https://www.example.com');

      xhr.fetchJson.returns(
        Promise.resolve({
          json() {
            return Promise.resolve({
              'location': 'test_location?gclid=123456&foo=bar&example=123',
            });
          },
        })
      );
      const prevHref = window.location.href;
      window.history.replaceState(null, '', prevHref + '?bar=foo&test=4321');
      maybeTrackImpression(window);
      return getTrackImpressionPromise().then(() => {
        expect(window.location.href).to.equal(
          'http://localhost:9876/context.html' +
            '?bar=foo&test=4321&gclid=123456&foo=bar&example=123'
        );
        window.history.replaceState(null, '', prevHref);
      });
    });
  });

  describe('replaceUrl', () => {
    it('do nothing if no init replaceUrl param', function*() {
      toggleExperiment(window, 'alp', true);
      sandbox.spy(viewer, 'replaceUrl');
      viewer.hasCapability.withArgs('replaceUrl').returns(true);
      maybeTrackImpression(window);
      yield macroTask();
      expect(viewer.replaceUrl).to.have.not.been.called;
      return getTrackImpressionPromise().should.be.fulfilled;
    });

    it('should use init replaceUrl parm if viewer has no capability', () => {
      toggleExperiment(window, 'alp', true);
      viewer.hasCapability.withArgs('replaceUrl').returns(false);
      viewer.getParam
        .withArgs('replaceUrl')
        .returns('http://localhost:9876/v/s/f.com/?gclid=1234&amp_js_v=1&init');
      const prevHref = window.location.href;
      maybeTrackImpression(window);
      return getTrackImpressionPromise().then(() => {
        expect(window.location.href).to.equal(
          'http://localhost:9876/v/s/f.com/?gclid=1234&amp_js_v=1&init'
        );
        window.history.replaceState(null, '', prevHref);
      });
    });

    it('should request replaceUrl if viewer signals', function*() {
      toggleExperiment(window, 'alp', true);
      sandbox.spy(viewer, 'sendMessageAwaitResponse');
      viewer.getParam.withArgs('replaceUrl').returns('http://www.example.com');
      viewer.hasCapability.withArgs('replaceUrl').returns(true);
      maybeTrackImpression(window);
      yield macroTask();
      expect(viewer.sendMessageAwaitResponse).has.been.calledOnce;
    });

    it('should resolve if receive viewer response', () => {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('click').returns(undefined);
      viewer.getParam.withArgs('replaceUrl').returns('http://www.example.com');
      viewer.hasCapability.withArgs('replaceUrl').returns(true);
      sandbox.stub(viewer, 'sendMessageAwaitResponse').callsFake(message => {
        if (message == 'getReplaceUrl') {
          return Promise.resolve({'replaceUrl': undefined});
        }
      });
      maybeTrackImpression(window);
      return getTrackImpressionPromise();
    });

    it('should replace location href with replaceUrl from viewer', () => {
      toggleExperiment(window, 'alp', true);
      viewer.getParam.withArgs('replaceUrl').returns('http://www.example.com');
      viewer.hasCapability.withArgs('replaceUrl').returns(true);
      sandbox.stub(viewer, 'sendMessageAwaitResponse').callsFake(message => {
        if (message == 'getReplaceUrl') {
          return Promise.resolve({
            'replaceUrl':
              'http://localhost:9876/v/s/f.com/?gclid=1234&amp_js_v=1',
          });
        }
      });
      const prevHref = window.location.href;
      window.history.replaceState(
        null,
        '',
        prevHref + '?bar=foo&test=4321#hash'
      );
      maybeTrackImpression(window);
      return getTrackImpressionPromise().then(() => {
        expect(window.location.href).to.equal(
          'http://localhost:9876/v/s/f.com/?gclid=1234&amp_js_v=1#hash'
        );
        window.history.replaceState(null, '', prevHref);
      });
    });
  });

  it('shouldAppendExtraParams', () => {
    const div = window.document.createElement('amp-analytics');
    div.setAttribute('type', 'fake');
    const ampdocApi = {
      whenReady: () => {
        return Promise.resolve();
      },
      getBody: () => {
        return window.document.body;
      },
    };
    window.document.body.appendChild(div);
    return shouldAppendExtraParams(ampdocApi).then(res => {
      expect(res).to.be.false;
      const div2 = window.document.createElement('amp-analytics');
      div2.setAttribute('type', 'googleanalytics');
      window.document.body.appendChild(div2);
      return shouldAppendExtraParams(ampdocApi).then(res => {
        expect(res).to.be.true;
      });
    });
  });

  describe('getExtraParamsUrl', () => {
    let windowApi;

    beforeEach(() => {
      const WindowApi = function() {};
      windowApi = new WindowApi();
      windowApi.location = {};
    });

    afterEach(() => {});

    it('should append gclid and gclsrc from window href', () => {
      const target = window.document.createElement('a');
      target.href = 'https://www.test.com?a=1&b=2&c=QUERY_PARAM(c)';
      windowApi.location.href = 'www.current.com?gclid=123&gclsrc=abc';
      expect(getExtraParamsUrl(windowApi, target)).to.equal(
        'gclid=QUERY_PARAM(gclid)&gclsrc=QUERY_PARAM(gclsrc)'
      );
    });

    it('should respect window location href', () => {
      const target = window.document.createElement('a');
      target.href = 'https://www.test.com?a=1&b=2&c=QUERY_PARAM(c)';
      windowApi.location.href = 'www.current.com';
      expect(getExtraParamsUrl(windowApi, target)).to.equal('');
      windowApi.location.href = 'www.current.com?gclid=123';
      expect(getExtraParamsUrl(windowApi, target)).to.equal(
        'gclid=QUERY_PARAM(gclid)'
      );
      windowApi.location.href = 'www.current.com?gclid=123&gclsrc=abc';
      expect(getExtraParamsUrl(windowApi, target)).to.equal(
        'gclid=QUERY_PARAM(gclid)&gclsrc=QUERY_PARAM(gclsrc)'
      );
    });

    it('should respect param in url', () => {
      const target = window.document.createElement('a');
      target.href = 'https://www.test.com?a=1&b=2&gclid=123';
      windowApi.location.href = 'www.current.com?gclid=123&gclsrc=abc';
      expect(getExtraParamsUrl(windowApi, target)).to.equal(
        'gclsrc=QUERY_PARAM(gclsrc)'
      );
    });

    it('should respect param in data-amp-addparams', () => {
      const target = window.document.createElement('a');
      target.href = 'https://www.test.com?a=1&b=2&gclid=123';
      target.setAttribute('data-amp-addparams', 'gclid=QUERY_PARAM(gclid)');
      windowApi.location.href = 'www.current.com?gclid=123&gclsrc=abc';
      expect(getExtraParamsUrl(windowApi, target)).to.equal(
        'gclsrc=QUERY_PARAM(gclsrc)'
      );
    });
  });

  describe('isTrustedReferrer', () => {
    /**
     * Tests trust determination by referrer.
     * @param {string} referrer URL under test.
     * @param {boolean} toBeTrusted The expected outcome.
     */
    function test(referrer, toBeTrusted) {
      it('testing ' + referrer, () => {
        expect(isTrustedReferrer(referrer)).to.equal(toBeTrusted);
      });
    }

    it('should return true for whitelisted hosts', () => {
      test('https://t.co/docref', true);
    });

    it('should not trust host as referrer with http', () => {
      test('http://t.co/asdf', false);
    });

    it('should not trust non-whitelisted hosts', () => {
      test('https://www.t.co/asdf', false);
      test('https://t.com/asdf', false);
      test('https://t.cn/asdf', false);
    });
  });
});
