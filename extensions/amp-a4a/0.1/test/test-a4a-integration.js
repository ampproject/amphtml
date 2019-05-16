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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {AMP_SIGNATURE_HEADER} from '../signature-verifier';
import {FetchMock, networkFailure} from './fetch-mock';
import {MockA4AImpl, TEST_URL} from './utils';
import {createIframePromise} from '../../../../testing/iframe';
import {getA4ARegistry, signingServerURLs} from '../../../../ads/_a4a-config';
import {installCryptoService} from '../../../../src/service/crypto-impl';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {loadPromise} from '../../../../src/event-helper';
import {
  resetScheduledElementForTesting,
  upgradeOrRegisterElement,
} from '../../../../src/service/custom-element-registry';
import {data as validCSSAmp} from './testdata/valid_css_at_rules_amp.reserialized';

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
  expect(
    element.querySelector('iframe[srcdoc]'),
    'does not have a friendly iframe child'
  ).to.not.be.ok;
  const child = element.querySelector('iframe[src]');
  expect(child, 'iframe child').to.be.ok;
  expect(child.getAttribute('src')).to.contain.string(src);
  expect(element, 'ad tag').to.be.visible;
  expect(child, 'iframe child').to.be.visible;
}

describe('integration test: a4a', () => {
  let sandbox;
  let fixture;
  let fetchMock;
  let adResponse;
  let a4aElement;
  let a4aRegistry;
  beforeEach(() => {
    sandbox = sinon.sandbox;
    a4aRegistry = getA4ARegistry();
    a4aRegistry['mock'] = () => {
      return true;
    };
    return createIframePromise().then(f => {
      fixture = f;
      fetchMock = new FetchMock(fixture.win);
      for (const serviceName in signingServerURLs) {
        fetchMock.getOnce(signingServerURLs[serviceName], {
          body: validCSSAmp.publicKeyset,
          headers: {'Content-Type': 'application/jwk-set+json'},
        });
      }
      fetchMock.getOnce(
        TEST_URL + '&__amp_source_origin=about%3Asrcdoc',
        () => adResponse,
        {name: 'ad'}
      );
      adResponse = {
        headers: {'AMP-Access-Control-Allow-Source-Origin': 'about:srcdoc'},
        body: validCSSAmp.reserialized,
      };
      adResponse.headers[AMP_SIGNATURE_HEADER] = validCSSAmp.signatureHeader;
      installDocService(fixture.win, /* isSingleDoc */ true);
      installCryptoService(fixture.win);
      upgradeOrRegisterElement(fixture.win, 'amp-a4a', MockA4AImpl);
      const {doc} = fixture;
      a4aElement = doc.createElement('amp-a4a');
      a4aElement.setAttribute('width', 200);
      a4aElement.setAttribute('height', 50);
      a4aElement.setAttribute('type', 'mock');
    });
  });

  afterEach(() => {
    fetchMock./*OK*/ restore();
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
    delete a4aRegistry['mock'];
  });

  it('should render a single AMP ad in a friendly iframe', () => {
    return fixture.addElement(a4aElement).then(unusedElement => {
      return expectRenderedInFriendlyIframe(a4aElement, 'Hello, world.');
    });
  });

  it('should fall back to 3p when no signature is present', () => {
    delete adResponse.headers[AMP_SIGNATURE_HEADER];
    return fixture.addElement(a4aElement).then(unusedElement => {
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  });

  it('should not send request if display none', () => {
    a4aElement.style.display = 'none';
    return fixture.addElement(a4aElement).then(element => {
      expect(fetchMock.called('ad')).to.be.false;
      expect(element.querySelector('iframe')).to.not.be.ok;
    });
  });

  it('should fall back to 3p when the XHR fails', () => {
    adResponse = Promise.reject(networkFailure());
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    const forceCollapseStub = sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string('Testing network error');
      expect(error.message).to.contain.string('AMP-A4A-');
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
      expect(forceCollapseStub).to.not.be.called;
    });
  });

  it('should collapse slot when creative response has code 204', () => {
    adResponse.status = 204;
    adResponse.body = null;
    const forceCollapseStub = sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );
    return fixture.addElement(a4aElement).then(() => {
      expect(forceCollapseStub).to.be.calledOnce;
    });
  });

  it('should collapse slot when creative response.arrayBuffer() is empty', () => {
    adResponse.body = '';
    const forceCollapseStub = sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );
    return fixture.addElement(a4aElement).then(unusedElement => {
      expect(forceCollapseStub).to.be.calledOnce;
    });
  });

  it('should continue to show old creative after refresh and no fill', () => {
    return fixture.addElement(a4aElement).then(() => {
      return expectRenderedInFriendlyIframe(a4aElement, 'Hello, world.').then(
        () => {
          const a4a = new MockA4AImpl(a4aElement);
          const initiateAdRequestMock = sandbox
            .stub(MockA4AImpl.prototype, 'initiateAdRequest')
            .callsFake(() => {
              a4a.adPromise_ = Promise.resolve();
              // This simulates calling forceCollapse, without tripping
              // up any unrelated asserts.
              a4a.isRefreshing = false;
            });
          const tearDownSlotMock = sandbox.stub(
            MockA4AImpl.prototype,
            'tearDownSlot'
          );
          tearDownSlotMock.returns(undefined);
          const destroyFrameSpy = sandbox.spy(
            MockA4AImpl.prototype,
            'destroyFrame'
          );
          const callback = sandbox.spy();
          return a4a.refresh(callback).then(() => {
            expect(initiateAdRequestMock).to.be.called;
            expect(tearDownSlotMock).to.be.called;
            expect(destroyFrameSpy).to.not.be.called;
            expect(callback).to.be.called;
          });
        }
      );
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
