// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {createElementWithAttributes} from '#core/dom';
import {utf8Encode} from '#core/types/string/bytes';

import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {SafeframeHostApi, removeSafeframeListener} from '../safeframe-host';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-doubleclick-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};

const rawCreative = `
  <script>
  parent./*OK*/postMessage(
      JSON.stringify(/** @type {!JsonObject} */ ({
        e: 'sentinel',
        c: '1234',
      })), '*');
  parent./*OK*/postMessage(
      JSON.stringify(/** @type {!JsonObject} */ ({
        s: 'creative_geometry_update',
        p: '{"width":"1px","height":"250px","sentinel":"sentinel"}',
      })), '*');
  </script>`;

const mockPromise = {
  then: (callback) => {
    callback();
    return {
      catch: () => {},
    };
  },
};

/**
 * Sets up the necessary mocks and stubs to render a fake fluid creative in unit
 * tests.
 * @param {!AmpAdNetworkDoubleclickImpl} impl
 * @param {!Object} sandbox Sinon sandbox to mock out properties.
 * @param {boolean=} resize Whether resize is permitted.
 */
function createScaffoldingForFluidRendering(impl, sandbox, resize = true) {
  impl.getVsync = () => {
    return {
      run: (runArgs) => {
        runArgs.mutate();
      },
    };
  };
  impl.buildCallback();
  impl.attemptChangeHeight = resize
    ? () => Promise.resolve()
    : () => Promise.reject('Creative in viewport');
  sandbox.stub(impl, 'sendXhrRequest').returns(
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(utf8Encode(rawCreative)),
      headers: {has: () => false, get: () => undefined},
    })
  );
  impl.sentinel = 'sentinel';
  impl.initiateAdRequest();
  impl.safeframeApi_ = new SafeframeHostApi(impl, true, impl.creativeSize_);
  sandbox./*OK*/ stub(impl.safeframeApi_, 'setupGeom_');
}

describes.realWin('DoubleClick Fast Fetch Fluid', realWinConfig, (env) => {
  let impl;
  let multiSizeImpl;
  let element;
  let multiSizeElement;

  const initialSize = {width: 0, height: 0};

  beforeEach(() => {
    env.win.__AMP_MODE.test = true;
    const doc = env.win.document;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    doc.body.appendChild(
      createElementWithAttributes(env.win.document, 'div', {
        'style': 'width: 1px; height: 1000px;',
      })
    );
    element = createElementWithAttributes(env.win.document, 'amp-ad', {
      'height': 'fluid',
      'type': 'doubleclick',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkDoubleclickImpl(element, env.win.document, env.win);
    multiSizeElement = createElementWithAttributes(env.win.document, 'amp-ad', {
      'height': 'fluid',
      'type': 'doubleclick',
      'data-multi-size': '300x200,150x50',
    });
    doc.body.appendChild(multiSizeElement);
    multiSizeImpl = new AmpAdNetworkDoubleclickImpl(
      multiSizeElement,
      env.win.document,
      env.win
    );

    const getLayout = () => 'fluid';
    impl.getLayout = getLayout;
    impl.isLayoutSupported('fluid');
    impl.experimentalNonAmpCreativeRenderMethod_ = 'safeframe';
    multiSizeImpl.getLayout = getLayout;
    multiSizeImpl.isLayoutSupported('fluid');
    multiSizeImpl.experimentalNonAmpCreativeRenderMethod_ = 'safeframe';
  });

  afterEach(() => {
    removeSafeframeListener();
    impl.cleanupAfterTest();
    impl = null;
  });

  it('should start with height 0', () => {
    impl.buildCallback();
    expect(element.getAttribute('style')).to.match(/height: 0px/);
  });

  it('should be fluid enabled', () => {
    expect(impl.isFluidRequest()).to.be.true;
  });

  it('should have a supported layout', () => {
    expect(impl.isLayoutSupported('fluid')).to.be.true;
  });

  it('should NOT load delayed impression amp-pixels', () => {
    const fireDelayedImpressionsSpy = env.sandbox.spy(
      impl,
      'fireDelayedImpressions'
    );
    const size = impl.extractSize({
      get(name) {
        switch (name) {
          case 'X-AmpImps':
            return 'https://a.com?a=b,https://b.com?c=d';
          case 'X-AmpRSImps':
            return 'https://c.com?e=f,https://d.com?g=h';
          default:
            return undefined;
        }
      },
      has(name) {
        return !!this.get(name);
      },
    });
    expect(size.width).to.equal(initialSize.width);
    expect(size.height).to.equal(initialSize.height);
    expect(fireDelayedImpressionsSpy).to.not.be.calledOnce;
  });

  it('should contain sz=320x50 in ad request by default', () => {
    impl.uiHandler = {
      isStickyAd: () => false,
    };
    impl.initiateAdRequest();
    return impl.adPromise_.then(() => {
      expect(impl.adUrl_).to.be.ok;
      expect(impl.adUrl_).to.match(/[&?]sz=320x50/);
    });
  });

  it('should contain mulitple sizes in ad request', () => {
    multiSizeImpl.uiHandler = {
      isStickyAd: () => false,
    };
    multiSizeImpl.initiateAdRequest();
    return multiSizeImpl.adPromise_.then(() => {
      expect(multiSizeImpl.adUrl_).to.be.ok;
      expect(multiSizeImpl.adUrl_).to.match(/[&?]sz=320x50%7C300x200%7C150x50/);
    });
  });

  it('should style iframe/slot correctly on multi-size creative', () => {
    multiSizeImpl.buildCallback();
    multiSizeImpl.sentinel = 'sentinel';
    multiSizeImpl.adPromise_ = Promise.resolve();
    multiSizeImpl.creativeBody_ = utf8Encode('foo');
    multiSizeImpl.returnedSize_ = {width: 250, height: 100};
    return multiSizeImpl.layoutCallback().then(() => {
      const iframeStyleString = multiSizeImpl.iframe.getAttribute('style');
      const slotStyleString = multiSizeImpl.element.getAttribute('style');
      expect(slotStyleString).to.match(/width: 250px/);
      expect(iframeStyleString).to.match(/position: relative/);
      expect(multiSizeImpl.element.getAttribute('height')).to.be.null;
    });
  });

  it('should have an iframe child with initial size 0x0', () => {
    impl.buildCallback();
    impl.sentinel = 'sentinel';
    impl.adPromise_ = Promise.resolve();
    impl.creativeBody_ = utf8Encode('foo');
    return impl.layoutCallback().then(() => {
      const styleString = impl.iframe.getAttribute('style');
      expect(styleString).to.match(/width: 0px/);
      expect(styleString).to.match(/height: 0px/);
    });
  });

  it('should fire delayed impression ping', () => {
    createScaffoldingForFluidRendering(impl, env.sandbox);
    const connectMessagingChannelSpy = env.sandbox./*OK*/ spy(
      impl.safeframeApi_,
      'connectMessagingChannel'
    );
    const onFluidResizeSpy = env.sandbox./*OK*/ spy(
      impl.safeframeApi_,
      'onFluidResize_'
    );
    return impl.adPromise_.then(() => {
      return impl.layoutCallback().then(() => {
        expect(connectMessagingChannelSpy).to.be.calledOnce;
        expect(onFluidResizeSpy).to.be.calledOnce;
      });
    });
  });

  it('should fire delayed impression ping, if creative partly visible', () => {
    createScaffoldingForFluidRendering(impl, env.sandbox, false);
    const connectMessagingChannelSpy = env.sandbox./*OK*/ spy(
      impl.safeframeApi_,
      'connectMessagingChannel'
    );
    const onFluidResizeSpy = env.sandbox./*OK*/ spy(
      impl.safeframeApi_,
      'onFluidResize_'
    );
    // Size must be non-zero to fire impression.
    impl.element.setAttribute('height', 1);
    impl.element.setAttribute('width', 1);
    return impl.adPromise_.then(() => {
      return impl.layoutCallback().then(() => {
        expect(connectMessagingChannelSpy).to.be.calledOnce;
        expect(onFluidResizeSpy).to.be.calledOnce;
      });
    });
  });

  it('should set height on iframe', () => {
    createScaffoldingForFluidRendering(impl, env.sandbox);
    return impl.adPromise_.then(() => {
      return impl.layoutCallback().then(() => {
        expect(impl.iframe.style.height).to.equal('250px');
      });
    });
  });

  it('should fire impression for AMP fluid creative', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    env.sandbox.stub(impl, 'setCssPosition_').returns(mockPromise);
    env.sandbox.stub(impl, 'attemptChangeHeight').returns(mockPromise);
    const delayedImpressionSpy = env.sandbox.spy(
      impl,
      'fireDelayedImpressions'
    );
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    impl.fluidImpressionUrl_ = 'http://www.foo.co.uk';
    impl.onCreativeRender(null, mockPromise);
    expect(delayedImpressionSpy.withArgs('http://www.foo.co.uk')).to.be
      .calledOnce;
  });

  it('should fire impression for AMP fluid creative, if partly visible', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    env.sandbox.stub(impl, 'setCssPosition_').returns(Promise.resolve());
    env.sandbox.stub(impl, 'attemptChangeHeight').returns(Promise.reject());
    const delayedImpressionSpy = env.sandbox.spy(
      impl,
      'fireDelayedImpressions'
    );
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    impl.fluidImpressionUrl_ = 'http://www.foo.co.uk';
    // Size must be non-zero to fire impression.
    impl.element.setAttribute('height', 1);
    impl.element.setAttribute('width', 1);
    return impl.expandFluidCreative_().then(() => {
      expect(delayedImpressionSpy.withArgs('http://www.foo.co.uk')).to.be
        .calledOnce;
    });
  });

  it('should not fire impression for AMP fluid creative', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    env.sandbox.stub(impl, 'setCssPosition_').returns(Promise.resolve());
    env.sandbox.stub(impl, 'attemptChangeHeight').returns(Promise.reject());
    const delayedImpressionSpy = env.sandbox.spy(
      impl,
      'fireDelayedImpressions'
    );
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    return impl.expandFluidCreative_().then(() => {
      expect(delayedImpressionSpy.withArgs('http://www.foo.co.uk')).to.not.be
        .calledOnce;
    });
  });

  it('should set expansion re-attempt flag after initial failure', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    const attemptChangeHeightStub = env.sandbox.stub(
      impl,
      'attemptChangeHeight'
    );
    attemptChangeHeightStub.returns(Promise.reject());
    env.sandbox.stub(impl, 'setCssPosition_').returns(Promise.resolve());
    env.sandbox
      .stub(impl, 'attemptToRenderCreative')
      .returns(Promise.resolve());
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    return impl.expandFluidCreative_().then(() => {
      expect(attemptChangeHeightStub).to.be.calledOnce;
      expect(impl.reattemptToExpandFluidCreative_).to.be.true;
    });
  });

  it('should re-attempt expansion after initial failure', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    const attemptChangeHeightStub = env.sandbox.stub(
      impl,
      'attemptChangeHeight'
    );
    attemptChangeHeightStub.returns(Promise.resolve());
    env.sandbox
      .stub(impl, 'attemptToRenderCreative')
      .returns(Promise.resolve());
    env.sandbox.stub(impl, 'setCssPosition_').returns(mockPromise);
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    impl.reattemptToExpandFluidCreative_ = true;
    // Should do nothing
    impl.viewportCallback(true);
    expect(attemptChangeHeightStub).to.not.be.called;
    impl.viewportCallback(false);
    expect(attemptChangeHeightStub).to.be.calledOnce;
  });

  it('should set position: static when measuring height on AMP fluid', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    const attemptChangeHeightStub = env.sandbox.stub(
      impl,
      'attemptChangeHeight'
    );
    const mutateElementStub = env.sandbox.stub(impl, 'mutateElement');
    attemptChangeHeightStub.returns(Promise.resolve());
    mutateElementStub.returns(Promise.resolve());
    env.sandbox
      .stub(impl, 'attemptToRenderCreative')
      .returns(Promise.resolve());
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    const setCssPositionSpy = env.sandbox.spy(impl, 'setCssPosition_');
    return impl.expandFluidCreative_().then(() => {
      expect(attemptChangeHeightStub).to.be.calledOnce;
      expect(setCssPositionSpy.withArgs('static')).to.be.calledOnce;
      expect(setCssPositionSpy.withArgs('absolute')).to.not.be.called;
    });
  });

  it('should set position: absoltute back when resizing fails', () => {
    impl.iframe = impl.win.document.createElement('iframe');
    impl.win.document.body.appendChild(impl.iframe);
    const attemptChangeHeightStub = env.sandbox.stub(
      impl,
      'attemptChangeHeight'
    );
    const mutateElementStub = env.sandbox.stub(impl, 'mutateElement');
    attemptChangeHeightStub.returns(Promise.reject());
    mutateElementStub.returns(Promise.resolve());
    env.sandbox
      .stub(impl, 'attemptToRenderCreative')
      .returns(Promise.resolve());
    impl.buildCallback();
    impl.isFluidRequest_ = true;
    impl.isVerifiedAmpCreative_ = true;
    const setCssPositionSpy = env.sandbox.spy(impl, 'setCssPosition_');
    return impl.expandFluidCreative_().then(() => {
      expect(attemptChangeHeightStub).to.be.calledOnce;
      expect(setCssPositionSpy.withArgs('static')).to.be.calledOnce;
      expect(setCssPositionSpy.withArgs('absolute')).to.be.calledOnce;
    });
  });
});
