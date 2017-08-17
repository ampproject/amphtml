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

import {Services} from '../../../../src/services';
import {
  AmpAdNetworkDoubleclickImpl,
  resetRtcStateForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {createElementWithAttributes} from '../../../../src/dom';
import {Xhr} from '../../../../src/service/xhr-impl';
// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';

describes.realWin('DoubleClick Fast Fetch RTC', {amp: true}, env => {
  let impl;
  let element;
  let sandbox;
  let xhrMock;

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    resetRtcStateForTesting();
    const doc = env.win.document;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
    });
    const rtcConf = createElementWithAttributes(
        env.win.document, 'script',
        {type: 'application/json', id: 'amp-rtc'});
    rtcConf.innerHTML = JSON.stringify({
      endpoint: 'https://example-publisher.com/rtc/',
    });
    env.win.document.head.appendChild(rtcConf);
    xhrMock = sandbox.stub(Xhr.prototype, 'fetchJson');
  });

  afterEach(() => {
    sandbox.restore();
    impl = null;
    xhrMock = null;
    resetRtcStateForTesting();
    const rtcConf = env.win.document.getElementById('amp-rtc');
    env.win.document.head.removeChild(rtcConf);
  });

  function mockRtcExecution(rtcResponse, element, opt_textFunction) {
    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);
    let textFunction = () => {
      return Promise.resolve(JSON.stringify(rtcResponse));
    };
    textFunction = opt_textFunction || textFunction;
    xhrMock.returns(
        Promise.resolve({
          redirected: false,
          status: 200,
          text: textFunction,
        })
    );
    impl.populateAdUrlState();
    return impl.executeRtc_(env.win.document);
  }

  function setRtcConfig(rtcConfigJson) {
    const rtcConf = env.win.document.getElementById('amp-rtc');
    rtcConf.innerText = JSON.stringify(rtcConfigJson);
  }

  it('should add just targeting to impl', () => {
    const targeting = {'sport': 'baseball'};
    const jsonTargeting = {
      targeting,
    };
    return mockRtcExecution({
      targeting,
    }, element).then(() => {
      expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
    });
  });

  it('should add just categoryExclusions to impl', () => {
    const categoryExclusions = {'sport': 'baseball'};
    const jsonTargeting = {
      categoryExclusions,
    };
    return mockRtcExecution({
      categoryExclusions,
    }, element).then(() => {
      expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
    });
  });

  it('should add targeting and categoryExclusions to impl', () => {
    const targeting = {'sport': 'baseball'};
    const categoryExclusions = {'age': '18-25'};
    const jsonTargeting = {
      targeting,
      categoryExclusions,
    };
    return mockRtcExecution({
      targeting,
      categoryExclusions,
    }, element).then(() => {
      expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
    });
  });

  it('should deep merge targeting and categoryExclusions from amp-ad', () => {
    const rtcResponse = {
      targeting: {'food': {
        'kids': ['chicken fingers', 'pizza']},
        'sports': 'baseball'},
      categoryExclusions: {'age': '18-25'}};
    const contextualTargeting =
    '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
    const jsonTargeting = {
      targeting: {
        'food': {
          'kids': ['chicken fingers', 'pizza'],
          'adults': 'cheese',
        },
        'sports': 'baseball'},
      categoryExclusions: {'age': '18-25'}};
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
      'json': contextualTargeting,
    });
    return mockRtcExecution(rtcResponse, element).then(() => {
      expect(impl.jsonTargeting_).to.deep.equal(jsonTargeting);
    });
  });

  it('should send two RTC callouts per page with SWR', () => {
    const rtcResponse = {
      targeting: {'food': {
        'kids': ['chicken fingers', 'pizza']},
        'sports': 'baseball'},
      categoryExclusions: {'age': '18-25'}};
    let contextualTargeting =
    '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
      'json': contextualTargeting,
    });
    mockRtcExecution(rtcResponse, element);

    contextualTargeting =
    '{"targeting": {"food": {"adults": "wine"}}}';
    const secondElement = createElementWithAttributes(
        env.win.document, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
          'json': contextualTargeting,
        });
    return mockRtcExecution(rtcResponse, secondElement).then(() => {
      expect(xhrMock).to.be.calledTwice;
    });
  });

  it('should send one RTC callout per page with SWR disabled', () => {
    setRtcConfig({
      'endpoint': 'https://example-publisher.com/rtc/',
      'disableStaleWhileRevalidate': true,
    });
    const rtcResponse = {
      targeting: {'food': {
        'kids': ['chicken fingers', 'pizza']},
        'sports': 'baseball'},
      categoryExclusions: {'age': '18-25'}};
    let contextualTargeting =
    '{"targeting": {"food": {"kids": "fries", "adults": "cheese"}}}';
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'width': '200',
      'height': '50',
      'type': 'doubleclick',
      'layout': 'fixed',
      'json': contextualTargeting,
    });
    mockRtcExecution(rtcResponse, element);

    contextualTargeting =
    '{"targeting": {"food": {"adults": "wine"}}}';
    const secondElement = createElementWithAttributes(
        env.win.document, 'amp-ad', {
          'width': '200',
          'height': '50',
          'type': 'doubleclick',
          'layout': 'fixed',
          'json': contextualTargeting,
        });
    return mockRtcExecution(rtcResponse, secondElement).then(() => {
      expect(xhrMock).to.be.calledOnce;
    });
  });

  it('should not send RTC if url invalid', () => {
    const rtcConf = env.win.document.getElementById('amp-rtc');
    rtcConf.innerText = '{'
        + '"endpoint": "http://example-publisher.com/rtc/",'
        + '"sendAdRequestOnFailure": false'
        + '}';

    const targeting = {'sport': 'baseball'};
    return mockRtcExecution({
      targeting,
    }, element).then(() => {
      expect(xhrMock).to.not.be.called;
    });
  });

  it('should resolve on empty RTC response', () => {
    return mockRtcExecution('', element).then(() => {
      // All that we are expecting here is that a Promise.reject doesn't
      // bubble up
    }).catch(() => {
      expect(false).to.be.true;
    });
  });

  it('should resolve on RTC failure if specified', () => {
    const badRtcResponse = 'wrong: "unparseable}';
    const jsonFunc = () => {
      return Promise.resolve(JSON.parse(badRtcResponse));
    };
    return mockRtcExecution(badRtcResponse, element, jsonFunc).then(() => {
      // All that we are expecting here is that a Promise.reject doesn't
      // bubble up
    }).catch(() => {
      expect(false).to.be.true;
    });
  });

  it('should reject on RTC failure if specified', () => {
    setRtcConfig({
      'endpoint': 'https://example-publisher.com/rtc/',
      'sendAdRequestOnFailure': false,
    });
    const badRtcResponse = 'wrong: "unparseable}';
    const jsonFunc = () => {
      return Promise.resolve(JSON.parse(badRtcResponse));
    };
    return mockRtcExecution(badRtcResponse, element, jsonFunc).then(() => {
      expect(false).to.be.true;
    }).catch(err => {
      expect(err.match(/Unexpected token/)).to.be.ok;
    });
  });

  it('should bypass caching if specified', () => {
    setRtcConfig({
      'endpoint': 'https://example-publisher.com/rtc/',
      'sendAdRequestOnFailure': true,
      'disableStaleWhileRevalidate': true,
    });

    const targeting = {'sport': 'baseball'};
    return mockRtcExecution({targeting}, element).then(() => {
      expect(xhrMock).to.be.calledOnce;
    });
  });

  it('should timeout slow response, then do not send without RTC', () => {
    setRtcConfig({
      'endpoint': 'https://example-publisher.com/rtc/',
      'sendAdRequestOnFailure': false,
    });
    const targeting = {'sport': 'baseball'};
    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);

    xhrMock.returns(
        Services.timerFor(env.win).promise(1200).then(() => {
          return Promise.resolve({
            redirected: false,
            status: 200,
            json: () => {
              return Promise.resolve({targeting});
            },
          });
        }));
    impl.populateAdUrlState();
    return impl.executeRtc_(env.win.document).then(() => {
      // this then block should never run.
      expect(true).to.be.false;
    }).catch(err => {
      // Have to get substring, because the error message has
      // three 0 width blank space characters added to it
      // automatically by the log constructor.
      expect(err.substring(0, 7)).to.equal('timeout');
    });
  });

  it('should timeout slow response, then send without RTC', () => {
    setRtcConfig({
      'endpoint': 'https://example-publisher.com/rtc/',
    });
    const targeting = {'sport': 'baseball'};

    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);

    xhrMock.returns(
        Services.timerFor(env.win).promise(1200).then(() => {
          return Promise.resolve({
            redirected: false,
            status: 200,
            json: () => {
              return Promise.resolve({targeting});
            },
          });
        }));
    impl.populateAdUrlState();
    return impl.executeRtc_(env.win.document).then(result => {
      expect(result.artc).to.equal(-1);
      expect(result.ati).to.equal(3);
    }).catch(() => {
      // Should not error.
      expect(true).to.be.false;
    });
  });
});
