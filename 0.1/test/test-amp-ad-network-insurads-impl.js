import {AmpAdNetworkInsuradsImpl} from '../amp-ad-network-insurads-impl';

describes.realWin(
  'AmpAdNetworkInsuradsImpl',
  {
    amp: {
      extensions: ['amp-ad-network-insurads-impl'],
    },
  },
  (env) => {
    let win, doc, impl, elem;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      // Create amp-ad element
      elem = doc.createElement('amp-ad');
      elem.setAttribute('type', 'insurads');
      elem.setAttribute('data-slot', '/1234/example');
      elem.setAttribute('data-multi-size', '300x250,320x50');
      doc.body.appendChild(elem);

      // Stub signing service if needed
      env.sandbox
        .stub(AmpAdNetworkInsuradsImpl.prototype, 'getSigningServiceNames')
        .returns(['google']);

      impl = new AmpAdNetworkInsuradsImpl(elem);
    });

    it('should return a valid ad URL with lockedId param', () => {
      const adUrl = impl.getAdUrl();
      expect(adUrl).to.be.a('string');
      expect(adUrl).to.include('&lockedId=');
    });

    it('should inherit from doubleclick and call super.getAdUrl', () => {
      const spy = env.sandbox.spy(
        AmpAdNetworkInsuradsImpl.prototype.__proto__,
        'getAdUrl'
      );
      impl.getAdUrl();
      expect(spy).to.have.been.called;
    });

    // Optional: test other behavior unique to your extension
  }
);
