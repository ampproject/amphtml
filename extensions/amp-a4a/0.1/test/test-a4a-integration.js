// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {getA4ARegistry, signingServerURLs} from '#ads/_a4a-config';

import {installDocService} from '#service/ampdoc-impl';
import {installCryptoService} from '#service/crypto-impl';
import {
  resetScheduledElementForTesting,
  upgradeOrRegisterElement,
} from '#service/custom-element-registry';

import {loadPromise} from '#utils/event-helper';

import {createIframePromise} from '#testing/iframe';

import {FetchMock, networkFailure} from './fetch-mock';
import {data as validCSSAmp} from './testdata/valid_css_at_rules_amp.reserialized';
import {MockA4AImpl, TEST_URL} from './utils';

import {AMP_SIGNATURE_HEADER} from '../signature-verifier';

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
async function expectRenderedInFriendlyIframe(element, srcdoc) {
  expect(element, 'ad element').to.be.ok;
  const child = element.querySelector('iframe[srcdoc]');
  expect(child, 'iframe child').to.be.ok;
  await loadPromise(child);
  expect(child.contentDocument.body.innerHTML).to.contain.string(srcdoc);
  const childDocument = child.contentDocument.documentElement;
  expect(childDocument, 'iframe doc').to.be.ok;
  expect(element, 'ad tag').to.be.visible;
  expect(child, 'iframe child').to.be.visible;
  expect(childDocument, 'ad creative content doc').to.be.visible;
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

describes.sandboxed('integration test: a4a', {}, (env) => {
  let fixture;
  let fetchMock;
  let adResponse;
  let a4aElement;
  let a4aRegistry;
  beforeEach(async () => {
    a4aRegistry = getA4ARegistry();
    a4aRegistry['mock'] = () => {
      return true;
    };
    fixture = await createIframePromise();
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
      body: validCSSAmp.reserialized,
    };
    if (!adResponse.headers) {
      adResponse.headers = {};
    }
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

  afterEach(() => {
    fetchMock./*OK*/ restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
    delete a4aRegistry['mock'];
  });

  it('should render a single AMP ad in a friendly iframe', async () => {
    await fixture.addElement(a4aElement);
    return expectRenderedInFriendlyIframe(a4aElement, 'Hello, world.');
  });

  // TODO(#27189): remove crypto checks as part of no signing cleanup.
  if (!NO_SIGNING_RTV) {
    it('should fall back to 3p when no signature is present', async () => {
      delete adResponse.headers[AMP_SIGNATURE_HEADER];
      await fixture.addElement(a4aElement);
      return expectRenderedInXDomainIframe(a4aElement, TEST_URL);
    });
  }

  it('should not send request if display none', async () => {
    a4aElement.style.display = 'none';
    const element = await fixture.addElement(a4aElement);
    expect(fetchMock.called('ad')).to.be.false;
    expect(element.querySelector('iframe')).to.not.be.ok;
  });

  it('should fall back to 3p when the XHR fails', async () => {
    adResponse = Promise.reject(networkFailure());
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    const forceCollapseStub = env.sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );

    try {
      await fixture.addElement(a4aElement);
    } catch (error) {
      expect(error.message).to.contain.string('Testing network error');
      expect(error.message).to.contain.string('AMP-A4A-');
      expectRenderedInXDomainIframe(a4aElement, TEST_URL);
      expect(forceCollapseStub).to.not.be.called;
    }
  });

  it('should collapse slot when creative response has code 204', async () => {
    adResponse.status = 204;
    adResponse.body = null;
    const forceCollapseStub = env.sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );
    await fixture.addElement(a4aElement);
    return expect(forceCollapseStub).to.be.calledOnce;
  });

  it('should collapse slot when creative response.arrayBuffer() is empty', async () => {
    adResponse.body = '';
    const forceCollapseStub = env.sandbox.spy(
      MockA4AImpl.prototype,
      'forceCollapse'
    );
    await fixture.addElement(a4aElement);
    return expect(forceCollapseStub).to.be.calledOnce;
  });

  it('should continue to show old creative after refresh and no fill', async () => {
    await fixture.addElement(a4aElement);
    await expectRenderedInFriendlyIframe(a4aElement, 'Hello, world.');
    const a4a = new MockA4AImpl(a4aElement);
    const initiateAdRequestMock = env.sandbox
      .stub(MockA4AImpl.prototype, 'initiateAdRequest')
      .callsFake(() => {
        a4a.adPromise_ = Promise.resolve();
        // This simulates calling forceCollapse, without tripping
        // up any unrelated asserts.
        a4a.isRefreshing = false;
      });
    const tearDownSlotMock = env.sandbox.stub(
      MockA4AImpl.prototype,
      'tearDownSlot'
    );
    tearDownSlotMock.returns(undefined);
    const destroyFrameSpy = env.sandbox.spy(
      MockA4AImpl.prototype,
      'destroyFrame'
    );
    const callback = env.sandbox.spy();
    await a4a.refresh(callback);
    expect(initiateAdRequestMock).to.be.called;
    expect(tearDownSlotMock).to.be.called;
    expect(destroyFrameSpy).to.not.be.called;
    expect(callback).to.be.called;
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
