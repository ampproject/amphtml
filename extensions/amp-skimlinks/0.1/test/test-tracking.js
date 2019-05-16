/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CustomEventReporterBuilder} from '../../../../src/extension-analytics';
import {pubcode} from './constants';
import helpersFactory from './helpers';

import {
  DEFAULT_CONFIG,
  PLATFORM_NAME,
  XCUST_ATTRIBUTE_NAME,
} from '../constants';

const {
  pageTrackingUrl: PAGE_IMPRESSION_TRACKING_URL,
  linksTrackingUrl: LINKS_IMPRESSIONS_TRACKING_URL,
  nonAffiliateTrackingUrl: NA_CLICK_TRACKING_URL,
} = DEFAULT_CONFIG;

describes.fakeWin(
  'test-tracking',
  {
    amp: {
      extensions: ['amp-skimlinks'],
    },
  },
  env => {
    let helpers;
    let createAnchorReplacementObj;

    beforeEach(() => {
      helpers = helpersFactory(env);

      createAnchorReplacementObj = (initialUrl, setNull) => {
        const anchor = helpers.createAnchor(initialUrl);
        const replacementUrl = setNull
          ? null
          : `https://go.redirectingat.com/?url=${initialUrl}`;

        return {anchor, replacementUrl};
      };
    });

    function setupTrackingService(skimOptions, trackingInfo) {
      trackingInfo = Object.assign(
        {pageImpressionId: 'page-imp-id', guid: 'guid'},
        trackingInfo
      );
      const trackingService = helpers.createTrackingWithStubAnalytics(
        skimOptions
      );
      trackingService.setTrackingInfo(trackingInfo);

      return trackingService;
    }

    function createFakeAnchorReplacementList() {
      return [
        createAnchorReplacementObj('http://merchant1.com/', false),
        createAnchorReplacementObj('http://merchant2.com/', false),
        createAnchorReplacementObj('http://merchant1.com/', false),
      ];
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

        it('Should setup the page-impressions analytics correctly', () => {
          helpers.createTrackingWithStubAnalytics();
          const trackStub = CustomEventReporterBuilder.prototype.track;
          expect(
            trackStub.withArgs('page-impressions', PAGE_IMPRESSION_TRACKING_URL)
              .calledOnce
          ).to.be.true;
        });

        it('Should setup the link-impressions analytics correctly', () => {
          helpers.createTrackingWithStubAnalytics();
          const trackStub = CustomEventReporterBuilder.prototype.track;
          expect(
            trackStub.withArgs(
              'link-impressions',
              LINKS_IMPRESSIONS_TRACKING_URL
            ).calledOnce
          ).to.be.true;
        });

        it('Should setup the non-affiliate-click analytics correctly', () => {
          helpers.createTrackingWithStubAnalytics();
          const trackStub = CustomEventReporterBuilder.prototype.track;
          expect(
            trackStub.withArgs('non-affiliate-click', NA_CLICK_TRACKING_URL)
              .calledOnce
          ).to.be.true;
        });
      });

      it('Should call both page and link impressions analytics if AE links', () => {
        const urls = {
          'https://merchants.com/product': {'ae': 1, 'count': 1},
        };
        trackingService = helpers.createTrackingWithStubAnalytics();
        env.sandbox
          .stub(trackingService, 'extractAnchorTrackingInfo_')
          .returns({numberAffiliateLinks: 1, urls});

        trackingService.sendImpressionTracking([]);
        const stub = trackingService.analytics_.trigger;
        expect(stub.withArgs('page-impressions').calledOnce).to.be.true;
        expect(stub.withArgs('link-impressions').calledOnce).to.be.true;
      });

      it('Should only call page impressions analytics if no AE links', () => {
        trackingService = helpers.createTrackingWithStubAnalytics();
        env.sandbox
          .stub(trackingService, 'extractAnchorTrackingInfo_')
          .returns({numberAffiliateLinks: 0, urls: []});

        trackingService.sendImpressionTracking([]);
        const stub = trackingService.analytics_.trigger;
        expect(stub.withArgs('page-impressions').calledOnce).to.be.true;
        expect(stub.withArgs('link-impressions').called).to.be.false;
      });

      it(
        'Should not call page nor link impressions if skimOptions ' +
          '"tracking" is false',
        () => {
          trackingService = helpers.createTrackingWithStubAnalytics({
            tracking: false,
          });
          env.sandbox
            .stub(trackingService, 'extractAnchorTrackingInfo_')
            .returns({numberAffiliateLinks: 0, urls: []});

          trackingService.sendImpressionTracking([]);
          const stub = trackingService.analytics_.trigger;
          expect(stub.withArgs('page-impressions').called).to.be.false;
          expect(stub.withArgs('link-impressions').called).to.be.false;
        }
      );

      describe('Page impressions analytics', () => {
        it('Should call page impression tracking with correct data', () => {
          const expectedData = {
            pub: pubcode,
            pag: 'CANONICAL_URL',
            pref: 'my-page-referrer',
            tz: 'TIMEZONE',
            uuid: 'page-impressions-id',
            guid: 'user-guid',
            slc: 0,
            jsl: 0, // Always 0 for AMP.
            t: 1,
            jv: PLATFORM_NAME,
          };
          trackingService = setupTrackingService(null, {
            pageImpressionId: expectedData.uuid,
            guid: expectedData.guid,
          });
          trackingService.sendImpressionTracking([]);
          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'page-impressions'
          );

          expect(urlVars.data).to.be.a.string;
          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData).to.deep.equal(expectedData);
        });

        it('Should set slc param correctly', () => {
          const trackingService = helpers.createTrackingWithStubAnalytics({});
          trackingService.sendImpressionTracking(
            createFakeAnchorReplacementList()
          );
          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'page-impressions'
          );

          expect(urlVars.data).to.be.a.string;
          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData.slc).to.equal(3);
        });

        it('Should send the xcust to the page impressions request', () => {
          trackingService = setupTrackingService({
            customTrackingId: 'xcust-id',
          });
          trackingService.sendImpressionTracking([]);

          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'page-impressions'
          );
          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData.uc).to.equal('xcust-id');
        });

        it('Should not send excludedDomains', () => {
          const excludedDomain = 'go.redirectingat.com';
          const trackingService = helpers.createTrackingWithStubAnalytics({
            excludedDomains: [excludedDomain],
          });

          trackingService.sendImpressionTracking([
            {
              anchor: helpers.createAnchor(`https://${excludedDomain}`),
              replacementUrl: 'https://go.skimresources.com',
            },
          ]);

          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'page-impressions'
          );

          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData.slc).to.equal(0);
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
            dl: {
              'http://merchant1.com/': {ae: 1, count: 1},
            },
            hae: 1,
            typ: 'l',
            jv: PLATFORM_NAME,
          };
          trackingService = setupTrackingService(null, {
            pageImpressionId: expectedData.uuid,
            guid: expectedData.guid,
          });
          trackingService.sendImpressionTracking([
            createAnchorReplacementObj('http://merchant1.com/', false),
          ]);
          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'link-impressions'
          );

          expect(urlVars.data).to.be.a.string;
          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData).to.deep.equal(expectedData);
        });
      });

      it('Should set dl and hae', () => {
        const trackingService = helpers.createTrackingWithStubAnalytics({});
        trackingService.sendImpressionTracking(
          createFakeAnchorReplacementList()
        );
        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'link-impressions'
        );

        expect(urlVars.data).to.be.a.string;
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.dl).to.deep.equal({
          'http://merchant1.com/': {count: 2, ae: 1},
          'http://merchant2.com/': {count: 1, ae: 1},
        });

        expect(trackingData.hae).to.equal(1);
      });

      it('Should not send excludedDomains', () => {
        const excludedDomain = 'go.redirectingat.com';
        const trackingService = helpers.createTrackingWithStubAnalytics({
          excludedDomains: [excludedDomain],
        });

        const anchorList = createFakeAnchorReplacementList().concat([
          {
            anchor: helpers.createAnchor(`https://${excludedDomain}`),
            replacementUrl: null,
          },
        ]);

        trackingService.sendImpressionTracking(anchorList);

        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'link-impressions'
        );

        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.dl).to.deep.equal({
          'http://merchant1.com/': {count: 2, ae: 1},
          'http://merchant2.com/': {count: 1, ae: 1},
        });
      });

      it('Should not send NA links', () => {
        const trackingService = helpers.createTrackingWithStubAnalytics({});
        trackingService.sendImpressionTracking(
          createFakeAnchorReplacementList().concat([
            createAnchorReplacementObj('http://non-merchant.com/', true),
          ])
        );
        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'link-impressions'
        );

        expect(urlVars.data).to.be.a.string;
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.dl).to.deep.equal({
          'http://merchant1.com/': {count: 2, ae: 1},
          'http://merchant2.com/': {count: 1, ae: 1},
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
          pref: 'my-page-referrer',
          url: anchor.href,
          xtz: 'TIMEZONE',
          uuid: 'page-impressions-id',
          site: 'false',
          product: '1',
          jv: PLATFORM_NAME,
        };

        const trackingService = setupTrackingService(null, {
          pageImpressionId: expectedData.uuid,
          guid: expectedData.guid,
        });

        trackingService.sendNaClickTracking(anchor);
        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'non-affiliate-click'
        );
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
        const trackingService = setupTrackingService({
          customTrackingId: 'xcust-id',
        });

        const anchor = helpers.createAnchor('https://non-merchant.com/test');

        trackingService.sendNaClickTracking(anchor);

        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'non-affiliate-click'
        );
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.custom).to.equal('xcust-id');
      });

      it('Should send xcust set on the link with the na tracking', () => {
        const trackingService = setupTrackingService();

        const anchor = helpers.createAnchor('https://non-merchant.com/test');
        anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

        trackingService.sendNaClickTracking(anchor);
        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'non-affiliate-click'
        );
        const trackingData = JSON.parse(urlVars.data);
        expect(trackingData.custom).to.equal('xcust-id-on-link');
      });

      it(
        'Should prioritise xcust set on the link over global xcust with ' +
          'the NA tracking',
        () => {
          const trackingService = setupTrackingService({
            customTrackingId: 'xcust-id',
          });

          const anchor = helpers.createAnchor('https://non-merchant.com/test');
          anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

          trackingService.sendNaClickTracking(anchor);
          const urlVars = helpers.getAnalyticsUrlVars(
            trackingService,
            'non-affiliate-click'
          );
          const trackingData = JSON.parse(urlVars.data);
          expect(trackingData.custom).to.equal('xcust-id-on-link');
        }
      );

      it('Should add the rnd query parameter', () => {
        const trackingService = setupTrackingService({
          customTrackingId: 'xcust-id',
        });

        const anchor = helpers.createAnchor('https://non-merchant.com/test');
        anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'xcust-id-on-link');

        trackingService.sendNaClickTracking(anchor);
        const urlVars = helpers.getAnalyticsUrlVars(
          trackingService,
          'non-affiliate-click'
        );

        expect(urlVars.rnd).to.be.equal('RANDOM');
      });

      it('Should not send excludedDomains', () => {
        const trackingService = setupTrackingService({
          excludedDomains: ['non-merchant.com'],
        });
        const anchor = helpers.createAnchor('https://non-merchant.com/test');

        trackingService.sendNaClickTracking(anchor);

        const stub = trackingService.analytics_.trigger;
        expect(stub.withArgs('non-affiliate-click').called).to.be.false;
      });
    });
  }
);
