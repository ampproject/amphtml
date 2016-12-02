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

import {
    MockA4AImpl,
    SIGNATURE_HEADER,
    TEST_URL,
} from './utils';
import {Xhr} from '../../../../src/service/xhr-impl';
import {createIframePromise} from '../../../../testing/iframe';
import {
    data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {FetchResponseHeaders} from '../../../../src/service/xhr-impl';
import {adConfig} from '../../../../ads/_config';
import {a4aRegistry} from '../../../../ads/_a4a-config';
import {
    resetScheduledElementForTesting,
    upgradeOrRegisterElement,
} from '../../../../src/custom-element';
import {utf8Encode} from '../../../../src/utils/bytes';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {loadPromise} from '../../../../src/event-helper';
import * as sinon from 'sinon';

// Integration tests for A4A.  These stub out accesses to the outside world
// (e.g., XHR requests and interfaces to ad network-specific code), but
// otherwise test the complete A4A flow, without making assumptions about
// the structure of that flow.

/**
 * Checks various consistency properties on the friendly iframe created by
 * A4A privileged path rendering.  Note that this returns a Promise, so its
 * value must be returned from any test invoking it.
 *
 * @param {!Element} element amp-ad element to examine.
 * @param {string} srcdoc  A string that must occur somewhere in the friendly
 *   iframe `srcdoc` attribute.
 * @return {!Promise} Promise that executes assertions on friendly
 *   iframe contents.
 */
function expectRenderedInFriendlyIframe(element, srcdoc) {
  expect(element, 'ad element').to.be.ok;
  const child = element.querySelector('iframe[srcdoc]');
  expect(child, 'iframe child').to.be.ok;
  expect(child.getAttribute('srcdoc')).to.contain.string(srcdoc);
  return loadPromise(child).then(() => {
    const childDocument = child.contentDocument.documentElement;
    expect(childDocument, 'iframe doc').to.be.ok;
    expect(element, 'ad tag').to.be.visible;
    expect(child, 'iframe child').to.be.visible;
    expect(childDocument, 'ad creative content doc').to.be.visible;
  });
}

function expectRenderedInXDomainIframe(element, src) {
  // Note: Unlike expectRenderedInXDomainIframe, this doesn't return a Promise
  // because it doesn't (cannot) inspect the contents of the iframe.
  expect(element, 'ad element').to.be.ok;
  expect(element.querySelector('iframe[srcdoc]'),
      'does not have a friendly iframe child').to.not.be.ok;
  const child = element.querySelector('iframe[src]');
  expect(child, 'iframe child').to.be.ok;
  expect(child.getAttribute('src')).to.contain.string(src);
  expect(element, 'ad tag').to.be.visible;
  expect(child, 'iframe child').to.be.visible;
}

describe('integration test: a4a', () => {
  let sandbox;
  let xhrMock;
  let fixture;
  let mockResponse;
  let a4aElement;
  let headers;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    mockResponse = {
      arrayBuffer: function() {
        return utf8Encode(validCSSAmp.reserialized);
      },
      bodyUsed: false,
      headers: new FetchResponseHeaders({
        getResponseHeader(name) {
          return headers[name];
        },
      }),
    };
    headers = {};
    headers[SIGNATURE_HEADER] = validCSSAmp.signature;
    xhrMock.withArgs(TEST_URL, {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
      requireAmpResponseSourceOrigin: true,
    }).onFirstCall().returns(Promise.resolve(mockResponse));
    adConfig['mock'] = {};
    a4aRegistry['mock'] = () => {return true;};
    return createIframePromise().then(f => {
      fixture = f;
      installDocService(fixture.win, /* isSingleDoc */ true);
      upgradeOrRegisterElement(fixture.win, 'amp-a4a', MockA4AImpl);
      const doc = fixture.doc;
      a4aElement = doc.createElement('amp-a4a');
      a4aElement.setAttribute('width', 200);
      a4aElement.setAttribute('height', 50);
      a4aElement.setAttribute('type', 'mock');
    });
  });

  afterEach(() => {
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
    delete adConfig['mock'];
    delete a4aRegistry['mock'];
  });

  it('should render a single AMP ad in a friendly iframe', () => {
    return fixture.addElement(a4aElement).then(unusedElement => {
      return expectRenderedInFriendlyIframe(a4aElement, 'Hello, world.');
    });
  });

  it('should fall back to 3p when no signature is present', () => {
    delete headers[SIGNATURE_HEADER];
    return fixture.addElement(a4aElement).then(unusedElement => {
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  });

  it('should fall back to 3p when the XHR fails', () => {
    xhrMock.resetBehavior();
    xhrMock.throws(new Error('Testing network error'));
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string('Testing network error');
      expect(error.message).to.contain.string('AMP-A4A-');
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  });

  it('should fall back to 3p when extractCreative throws', () => {
    sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature').throws(
        new Error('Testing extractCreativeAndSignature error'));
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string(
          'Testing extractCreativeAndSignature error');
      expect(error.message).to.contain.string('amp-a4a:');
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  });

  it('should fall back to 3p when extractCreative returns empty sig', () => {
    const extractCreativeAndSignatureStub =
        sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature');
    extractCreativeAndSignatureStub.onFirstCall().returns({
      creative: utf8Encode(validCSSAmp.reserialized),
      signature: null,
    });
    return fixture.addElement(a4aElement).then(unusedElement => {
      expect(extractCreativeAndSignatureStub).to.be.calledOnce;
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  });

  it('should fall back to 3p when extractCreative returns empty creative',
      () => {
        sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature')
            .onFirstCall().returns({
              creative: null,
              signature: validCSSAmp.signature,
            })
            .onSecondCall().throws(new Error(
            'Testing extractCreativeAndSignature should not occur error'));
        // TODO(tdrl) Currently layoutCallback rejects, even though something
        // *is* rendered.  This should be fixed in a refactor, and we should
        // change this .catch to a .then.
        return fixture.addElement(a4aElement).catch(error => {
          expect(error.message).to.contain.string('Key failed to validate');
          expect(error.message).to.contain.string('amp-a4a:');
          expectRenderedInXDomainIframe(a4aElement, TEST_URL);
        });
      });

  // TODO(@ampproject/a4a): Need a test that double-checks that thrown errors
  // are propagated out and printed to console and/or sent upstream to error
  // logging systems.  This is a bit tricky, because it's handled by the AMP
  // runtime and can't be done within the context of a
  // fixture.addElement().then() or .catch().  This should be integrated into
  // all tests, so that we know precisely when errors are being reported and
  // to whom.
  it('should propagate errors out and report them to upstream error log');
});
