import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {AmpAdNetworkInsuradsImpl} from '../amp-ad-network-insurads-impl';

describes.realWin(
  'AmpAdNetworkInsuradsImpl',
  {
    amp: {
      extensions: ['amp-ad-network-insurads-impl'],
    },
  },
  (env) => {
    let win, doc;
    let element;
    let impl;
    let sandbox;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      sandbox = env.sandbox;

      // Mock Services.documentInfoForDoc
      const documentInfo = {
        canonicalUrl: 'https://example.com/test-page',
      };
      sandbox.stub(Services, 'documentInfoForDoc').returns(documentInfo);

      // Create amp-ad element
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '300',
        'height': '250',
        'type': 'insurads',
        'data-slot': '/1234/example',
        'data-public-id': 'test-seller-id',
        'data-multi-size': '300x250,320x50',
      });
      doc.body.appendChild(element);

      impl = new AmpAdNetworkInsuradsImpl(element);

      // Stub internal components
      impl.dCHelper = {
        callMethod: sandbox
          .stub()
          .returns(Promise.resolve('https://example.com/test-page')),
      };
      impl.engagement_ = {
        isEngaged: () => true,
      };
      impl.core_ = {
        sendAppInit: sandbox.stub(),
      };
      impl.lockedid = 'LOCKED_ID';
    });

    afterEach(() => {
      element.remove();
    });

    it('should initialize with correct values', () => {
      expect(impl.slot).to.equal('/1234/example');
      expect(impl.sellerId).to.equal('test-seller-id');
      expect(impl.canonicalUrl).to.equal('https://example.com/test-page');
      expect(element.getAttribute('data-enable-refresh')).to.equal('false');
    });

    it('buildCallback should setup messaging', () => {
      impl.buildCallback();

      expect(impl.realtimeMessaging_.sendAppInit).to.be.calledWith(
        'LOCKED_ID',
        true,
        true,
        'https://example.com/test-page'
      );
    });

    it('getAdUrl should apply nextRefresh parameters', async () => {
      impl.nextRefresh = {
        parameters: [
          {key: 'iu', value: '/new/slot'},
          {key: 'sz', value: '300x250'},
        ],
      };

      const url = new URL(await impl.getAdUrl());

      expect(url.searchParams.get('iu')).to.equal('/new/slot');
      expect(url.searchParams.get('sz')).to.equal('300x250');
    });
  }
);
