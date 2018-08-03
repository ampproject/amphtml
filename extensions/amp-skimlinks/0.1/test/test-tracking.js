import {Services} from '../../../../src/services';
import {XCUST_ATTRIBUTE_NAME} from '../constants';
import {pubcode} from './constants';
import helpersFactory from './helpers';

describes.realWin('test-tracking', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let win, ampdoc, document, xhr;
  let helpers;
  const startTime = new Date().getTime();
  beforeEach(() => {
    win = env.win;
    document = win.document;
    ampdoc = env.ampdoc;
    xhr = Services.xhrFor(win);
    helpers = helpersFactory(env);
  });

  function setupTrackingService(skimOptions, trackingInfo) {
    trackingInfo = Object.assign(
        {pageImpressionId: 'page-imp-id', guid: 'guid'},
        trackingInfo
    );
    const trackingService = helpers.createTrackingWithStubAnalytics(skimOptions);
    trackingService.setTrackingInfo(trackingInfo);

    return trackingService;
  }

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('sendImpressionTracking', () => {
    let mock;
    let trackingService;
    beforeEach(() => {

    });

    afterEach(() => {
      // mock.verify();
    });


    function createFakeAnchorReplacementMap() {
      const map = new Map();
      const a1 = helpers.createAnchor('http://merchant1.com/');
      const a2 = helpers.createAnchor('http://merchant2.com/');
      const a3 = helpers.createAnchor('http://non-merchant.com/');
      const a4 = helpers.createAnchor('http://merchant1.com/');

      map.set(a1, `https://goredirectingat.com/url=${a1.href}`);
      map.set(a2, `https://goredirectingat.com/url=${a2.href}`);
      map.set(a3, null);
      map.set(a4, `https://goredirectingat.com/url=${a4.href}`);

      return map;
    }

    // it('Should call impression and link tracking', () => {
    //   trackingService = helpers.createTrackingWithStubAnalytics();
    //   mock = env.sandbox.mock(trackingService);
    //   // use .returns to avoid calling the actual function
    //   mock.expects('sendPageImpressionTracking_').once().returns();
    //   // use .returns to avoid calling the actual function
    //   mock.expects('sendLinkImpressionTracking_').once().returns();

    //   trackingService.sendImpressionTracking({}, new Map(), startTime);
    // });

    // it('Should not call impression and link tracking if tracking is false', () => {
    //   trackingService = helpers.createTrackingWithStubAnalytics({tracking: false});
    //   mock = env.sandbox.mock(trackingService);
    //   mock.expects('sendPageImpressionTracking_').never();
    //   mock.expects('sendLinkImpressionTracking_').never();

    //   trackingService.sendImpressionTracking({}, new Map(), startTime);
    // });

    describe.skip('amp-analytics setup', () => {
      it('Should generate a page impression id', () => {

      });
      it('Set the sendBeacon flag to true', () => {

      });
    });

    it('Should call both page impressions and link impressions analytics', () => {
      trackingService = helpers.createTrackingWithStubAnalytics();
      trackingService.extractAnchorTrackingInfo_ = env.sandbox.stub()
          .returns({numberAffiliateLinks: 0, urls: []});

      trackingService.sendImpressionTracking({}, new Map(), startTime);
      const stub = trackingService.analytics_.trigger;
      expect(stub.withArgs('page-impressions').calledOnce).to.be.true;
      expect(stub.withArgs('link-impressions').calledOnce).to.be.true;
    });

    it('Should not call page impressions nor link impressions analytics if skimOptions "tracking" is false', () => {
      trackingService = helpers.createTrackingWithStubAnalytics({tracking: false});
      trackingService.extractAnchorTrackingInfo_ = env.sandbox.stub()
          .returns({numberAffiliateLinks: 0, urls: []});

      trackingService.sendImpressionTracking({}, new Map(), startTime);
      const stub = trackingService.analytics_.trigger;
      expect(stub.withArgs('page-impressions').calledOnce).to.be.false;
      expect(stub.withArgs('link-impressions').calledOnce).to.be.false;
    });


    describe('Page impressions analytics', () => {
      it('Should call page impression tracking with correct data', () => {
        const expectedData = {
          pub: pubcode,
          pag: 'CANONICAL_URL',
          pref: 'DOCUMENT_REFERRER',
          tz: 'TIMEZONE',
          uuid: 'page-impressions-id',
          guid: 'user-guid',
          slc: 0,
          jsl: 200,
          t: 1,
        };
        trackingService = setupTrackingService(null, {
          pageImpressionId: expectedData.uuid,
          guid: expectedData.guid,
        });
        trackingService.sendImpressionTracking({}, new Map(), startTime);
        const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'page-impressions');

        expect(urlVars.data).to.be.a.string;
        const trackingData = JSON.parse(urlVars.data);
        // Test 'jsl' separately since we can't controle its value.
        expect(trackingData.jsl).to.be.a('number').but.not.to.equal(0); // Arbitrary number
        trackingData.jsl = expectedData.jsl; // Already verified, replace by fixed value.
        expect(trackingData).to.deep.equal(expectedData);
      });


      it('Should set slc param correctly', () => {
        const trackingService = helpers.createTrackingWithStubAnalytics({});
        trackingService.sendImpressionTracking({}, createFakeAnchorReplacementMap(), startTime);
        const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'page-impressions');

        expect(urlVars.data).to.be.a.string;
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.slc).to.equal(3);
      });


      it('Should send the xcust to the page impressions request', () => {
        trackingService = setupTrackingService({customTrackingId: 'xcust-id'});
        trackingService.sendImpressionTracking({}, new Map(), startTime);

        const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'page-impressions');
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.uc).to.equal('xcust-id');
      });
    });

    describe('Link impressions analytics', () => {
      it('Should call link impressions tracking', () => {
        const expectedData = {
          pub: pubcode,
          pag: 'CANONICAL_URL',
          tz: 'TIMEZONE',
          uuid: 'page-impressions-id',
          guid: 'user-guid',
          dl: {},
          hae: 0,
          typ: 'l',
        };
        trackingService = setupTrackingService(null, {
          pageImpressionId: expectedData.uuid,
          guid: expectedData.guid,
        });
        trackingService.sendImpressionTracking({}, new Map(), startTime);
        const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'link-impressions');

        expect(urlVars.data).to.be.a.string;
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData).to.deep.equal(expectedData);
      });
    });

    it('Should set dl and hae', () => {
      const trackingService = helpers.createTrackingWithStubAnalytics({});
      trackingService.sendImpressionTracking({}, createFakeAnchorReplacementMap(), startTime);
      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'link-impressions');

      expect(urlVars.data).to.be.a.string;
      const trackingData = JSON.parse(urlVars.data);
      expect(trackingData.dl).to.deep.equal({
        'http://merchant1.com/': {count: 2, ae: 1},
        'http://merchant2.com/': {count: 1, ae: 1},
        'http://non-merchant.com/': {count: 1, ae: 0},
      });

      expect(trackingData.hae).to.equal(1);
    });

  });

  describe('sendNaClickTracking', () => {
    it('Should send non-affiliate click tracking', () => {
      const anchor = helpers.createAnchor('https://non-merchant.com/test');
      const expectedData = {
        pubcode,
        referrer: 'CANONICAL_URL',
        pref: 'DOCUMENT_REFERRER',
        url: anchor.href,
        xtz: 'TIMEZONE',
        uuid: 'page-impressions-id',
        site: 'false',
        product: '1',
      };

      const trackingService = setupTrackingService(null, {
        pageImpressionId: expectedData.uuid,
        guid: expectedData.guid,
      });

      trackingService.sendNaClickTracking(anchor);
      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'non-affiliate-click');
      expect(urlVars.data).to.be.a.string;
      const trackingData = JSON.parse(urlVars.data);
      expect(trackingData).to.deep.equal(expectedData);
    });

    it('Should not send tracking if "tracking" skimOption is false', () => {
      const trackingService = setupTrackingService({tracking: false});

      const anchor = helpers.createAnchor('https://non-merchant.com/test');

      trackingService.sendNaClickTracking(anchor);

      const stub = trackingService.analytics_.trigger;
      expect(stub.withArgs('non-affiliate-click').calledOnce).to.be.false;
    });

    it('Should send the global xcust with the na tracking', () => {
      const trackingService = setupTrackingService({customTrackingId: 'xcust-id'});

      const anchor = helpers.createAnchor('https://non-merchant.com/test');

      trackingService.sendNaClickTracking(anchor);

      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'non-affiliate-click');
      const trackingData = JSON.parse(urlVars.data);
      expect(trackingData.custom).to.equal('xcust-id');
    });

    it('Should send xcust set on the link with the na tracking', () => {
      const trackingService = setupTrackingService();

      const anchor = helpers.createAnchor('https://non-merchant.com/test');
      anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

      trackingService.sendNaClickTracking(anchor);
      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'non-affiliate-click');
      const trackingData = JSON.parse(urlVars.data);
      expect(trackingData.custom).to.equal('xcust-id-on-link');
    });

    it('Should prioritise xcust set on the link over global xcust with the na tracking', () => {
      const trackingService = setupTrackingService({customTrackingId: 'xcust-id'});

      const anchor = helpers.createAnchor('https://non-merchant.com/test');
      anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

      trackingService.sendNaClickTracking(anchor);
      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'non-affiliate-click');
      const trackingData = JSON.parse(urlVars.data);
      expect(trackingData.custom).to.equal('xcust-id-on-link');
    });
  });
});
