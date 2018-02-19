/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {createElementWithAttributes} from '../../../../src/dom';
import {utf8Encode} from '../../../../src/utils/bytes';

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


describes.realWin('DoubleClick Fast Fetch Fluid', realWinConfig, env => {
  let impl;
  let multiSizeImpl;
  let element;
  let multiSizeElement;
  let sandbox;

  const initialSize = {width: 0, height: 0};

  beforeEach(() => {
    sandbox = env.sandbox;
    env.win.AMP_MODE.test = true;
    const doc = env.win.document;
    // TODO(a4a-cam@): This is necessary in the short term, until A4A is
    // smarter about host document styling.  The issue is that it needs to
    // inherit the AMP runtime style element in order for shadow DOM-enclosed
    // elements to behave properly.  So we have to set up a minimal one here.
    const ampStyle = doc.createElement('style');
    ampStyle.setAttribute('amp-runtime', 'scratch-fortesting');
    doc.head.appendChild(ampStyle);
    doc.body.appendChild(createElementWithAttributes(
        env.win.document, 'div', {
          'style': 'width: 1px; height: 1000px;',
        }));
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
        multiSizeElement, env.win.document, env.win);

    const getLayout = () => 'fluid';
    impl.getLayout = getLayout;
    impl.isLayoutSupported('fluid');
    impl.experimentalNonAmpCreativeRenderMethod_ = 'safeframe';
    multiSizeImpl.getLayout = getLayout;
    multiSizeImpl.isLayoutSupported('fluid');
    multiSizeImpl.experimentalNonAmpCreativeRenderMethod_ = 'safeframe';
  });

  afterEach(() => {
    sandbox.restore();
    impl = null;
  });

  it('should start with height 0', () => {
    impl.buildCallback();
    expect(element.getAttribute('style')).to.match(/height: 0px/);
  });

  it('should be fluid enabled', () => {
    expect(impl.isFluid_).to.be.true;
  });

  it('should have a supported layout', () => {
    expect(impl.isLayoutSupported('fluid')).to.be.true;
  });

  it('should NOT load delayed impression amp-pixels', () => {
    const fireDelayedImpressionsSpy =
        sandbox.spy(impl, 'fireDelayedImpressions');
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
    impl.initiateAdRequest();
    return impl.adPromise_.then(() => {
      expect(impl.adUrl_).to.be.ok;
      expect(impl.adUrl_).to.match(/[&?]sz=320x50/);
    });
  });

  it('should contain mulitple sizes in ad request', () => {
    multiSizeImpl.initiateAdRequest();
    return multiSizeImpl.adPromise_.then(() => {
      expect(multiSizeImpl.adUrl_).to.be.ok;
      expect(multiSizeImpl.adUrl_).to.match(
          /[&?]sz=320x50%7C300x200%7C150x50/);
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
    impl.getVsync = () => {
      return {
        run: runArgs => {
          runArgs.mutate();
        },
      };
    };
    impl.buildCallback();
    const rawCreative = `
        <script>
        parent./*OK*/postMessage(
            JSON.stringify(/** @type {!JsonObject} */ ({
              e: 'sentinel',
            })), '*');
        parent./*OK*/postMessage(
            JSON.stringify(/** @type {!JsonObject} */ ({
              s: 'creative_geometry_update',
              p: '{"width":"1px","height":"1px","sentinel":"sentinel"}',
            })), '*');
        </script>`;
    impl.getAdditionalContextMetadata();
    const safeframeApi = impl.safeframeApi_;
    sandbox.stub(safeframeApi, "setupGeom_");
    const connectMessagingChannelSpy =
        sandbox.spy(safeframeApi, 'connectMessagingChannel');
    const onFluidResizeSpy = sandbox.spy(safeframeApi, 'onFluidResize_');
    impl.attemptChangeHeight = () => Promise.resolve();
    impl.sentinel = 'sentinel';
    impl.initiateAdRequest();
    return impl.adPromise_.then(() => {
      impl.creativeBody_ = utf8Encode(rawCreative);
      return impl.layoutCallback().then(() => {
        expect(connectMessagingChannelSpy).to.be.calledOnce;
        expect(onFluidResizeSpy).to.be.calledOnce;
      }).then(() => {
        console.log("foo");
      });
    });
  });

});
