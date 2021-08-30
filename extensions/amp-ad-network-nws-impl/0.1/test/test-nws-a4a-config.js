// These two are required for reasons internal to AMP
import '../../../amp-ad/0.1/amp-ad-ui';
import '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {AmpAdNetworkNwsImpl} from '../amp-ad-network-nws-impl';

describes.fakeWin('amp-ad-network-nws-impl', {amp: true}, (env) => {
  let win, doc, element, impl, preloadExtensionSpy;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'nws',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkNwsImpl(element);
    const extensions = Services.extensionsFor(impl.win);
    preloadExtensionSpy = env.sandbox.spy(extensions, 'preloadExtension');
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const dataSlot = '1';
      element.setAttribute('data-slot', dataSlot);
      expect(impl.getAdUrl()).to.equal(
        `https://svr.nws.ai/a4a?slot=${encodeURIComponent(dataSlot)}`
      );
    });
  });

  describe('#extractSize', () => {
    it('should not load amp-analytics without header', () => {
      impl.extractSize({
        get() {
          return undefined;
        },
        has() {
          return false;
        },
      });
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
    it('should load amp-analytics with header', () => {
      impl.extractSize({
        get(name) {
          switch (name) {
            case 'X-NWS':
              return '{"ampAnalytics": {}}';
            default:
              return undefined;
          }
        },
        has(name) {
          return !!this.get(name);
        },
      });
      expect(preloadExtensionSpy.withArgs('amp-analytics')).to.not.be.called;
    });
  });
});
