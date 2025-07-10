import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {AmpAdNetworkInsuradsImpl} from '../amp-ad-network-insurads-impl';
import {Core} from '../core';
import {DoubleClickHelper} from '../doubleclick-helper';

describes.realWin(
  'AmpAdNetworkInsuradsImpl',
  {
    amp: {
      extensions: ['amp-ad-network-insurads-impl'],
    },
  },
  (env) => {
    let win, doc, sandbox;
    let element, impl;
    let coreMock, dcHelperMock;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      sandbox = env.sandbox;

      // 1. Stub all dependencies BEFORE the component is created.
      const documentInfo = {
        canonicalUrl: 'https://example.com/test-page',
      };
      sandbox.stub(Services, 'documentInfoForDoc').returns(documentInfo);

      // Stub the Core service's start method
      coreMock = {
        registerAdUnit: sandbox.spy(),
        sendUnitInit: sandbox.spy(),
      };
      sandbox.stub(Core, 'start').returns(coreMock);

      // Stub the DoubleClickHelper constructor
      dcHelperMock = {
        callMethod: sandbox.stub(),
      };

      // --- FIX: Provide a safe default for all method calls ---
      // Any call to callMethod will now return a resolved promise,
      // preventing hangs from unexpected async operations in the A4A lifecycle.
      dcHelperMock.callMethod.returns(Promise.resolve());

      // We can still override the default for specific methods like getAdUrl.
      dcHelperMock.callMethod
        .withArgs('getAdUrl')
        .returns(Promise.resolve('https://example.com/ad-url'));
      // --- END FIX ---

      sandbox
        .stub(DoubleClickHelper.prototype, 'constructor')
        .returns(dcHelperMock);

      // 2. Create the element.
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '300',
        'height': '250',
        'type': 'insurads',
        'data-slot': '/1234/example',
        'data-public-id': 'test-seller-id',
      });
      doc.body.appendChild(element);

      // 3. Let the AMP framework build the component and get the implementation.
      // This correctly runs the constructor and lifecycle methods.
      impl = await element.getImpl();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should register with the Core service on creation', () => {
      expect(Core.start).to.have.been.calledOnceWith(
        win,
        'https://example.com/test-page',
        'test-seller-id'
      );
      expect(coreMock.registerAdUnit).to.have.been.calledOnce;
    });

    it('should initialize with correct values', () => {
      // Now we can test the properties set by the constructor.
      expect(impl.publicId).to.equal('test-seller-id');
      expect(impl.canonicalUrl).to.equal('https://example.com/test-page');
      expect(element.getAttribute('data-enable-refresh')).to.equal('false');
    });

    it('should initialize DoubleClickHelper', () => {
      // Check that the constructor of our helper was called.
      expect(DoubleClickHelper.prototype.constructor).to.have.been.calledOnce;
      // Check that the constructor method within DoubleClick was called.
      expect(dcHelperMock.callMethod).to.have.been.calledWith(
        'constructor',
        element
      );
    });
  }
);
