import {CustomEventReporterBuilder} from '../../../../src/extension-analytics';
import {pubcode} from './constants';
import helpersFactory from './helpers';


import {
  LINKS_IMPRESSIONS_TRACKING_URL,
  NA_CLICK_TRACKING_URL,
  PAGE_IMPRESSION_TRACKING_URL,
  XCUST_ATTRIBUTE_NAME,
} from '../constants';


describes.fakeWin('test-tracking', {
  amp: {
    extensions: ['amp-skimlinks'],
  },
}, env => {
  let win;
  let helpers;
  const startTime = new Date().getTime();
  beforeEach(() => {
    win = env.win;
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

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('sendImpressionTracking', () => {
    let trackingService;

    describe('amp-analytics setup', () => {
      it('Should generate a page impression id', () => {
        const trackingService1 = helpers.createTrackingWithStubAnalytics();
        const impressionId1 = trackingService1.trackingInfo_.pageImpressionId;
        // Restore the already stub CustomEventReporterBuilder.prototype
        // inside `createTrackingWithStubAnalytics` to avoid errors.
        env.sandbox.restore();
        const trackingService2 = helpers.createTrackingWithStubAnalytics();
        const impressionId2 = trackingService2.trackingInfo_.pageImpressionId;
        expect(impressionId1.length).to.equal(32);
        expect(impressionId1).to.not.equal(impressionId2);
      });

      it('Set the sendBeacon flag to true', () => {

      });

      it('Setup the page-impressions analytics correctly', () => {
        helpers.createTrackingWithStubAnalytics();
        const trackStub = CustomEventReporterBuilder.prototype.track;
        expect(trackStub.withArgs(
            'page-impressions',
            PAGE_IMPRESSION_TRACKING_URL
        ).calledOnce).to.be.true;
      });

      it('Setup the link-impressions analytics correctly', () => {
        helpers.createTrackingWithStubAnalytics();
        const trackStub = CustomEventReporterBuilder.prototype.track;
        expect(trackStub.withArgs(
            'link-impressions',
            LINKS_IMPRESSIONS_TRACKING_URL,
        ).calledOnce).to.be.true;
      });

      it('Setup the non-affiliate-click analytics correctly', () => {
        helpers.createTrackingWithStubAnalytics();
        const trackStub = CustomEventReporterBuilder.prototype.track;
        expect(trackStub.withArgs(
            'non-affiliate-click',
            NA_CLICK_TRACKING_URL,
        ).calledOnce).to.be.true;
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
      expect(stub.withArgs('page-impressions').called).to.be.false;
      expect(stub.withArgs('link-impressions').called).to.be.false;
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
        expect(trackingData.jsl).to.be.a('number').but.not.to.equal(0);
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
      expect(stub.withArgs('non-affiliate-click').called).to.be.false;
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

    it('Should add the rnd query parameter', () => {
      const trackingService = setupTrackingService({customTrackingId: 'xcust-id'});

      const anchor = helpers.createAnchor('https://non-merchant.com/test');
      anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

      trackingService.sendNaClickTracking(anchor);
      const urlVars = helpers.getAnalyticsUrlVars(trackingService, 'non-affiliate-click');

      expect(urlVars.rnd).to.be.equal('RANDOM');
    });
  });
});
