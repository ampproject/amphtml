import {parseQueryString} from '#core/types/string/url';

import {DEFAULT_SKIM_OPTIONS, pubcode} from './constants';
import helpersFactory from './helpers';

import {parseUrlDeprecated} from '../../../../src/url';
import {XCUST_ATTRIBUTE_NAME} from '../constants';
import {Waypoint} from '../waypoint';

describes.fakeWin(
  'Waypoint',
  {
    amp: {
      extensions: ['amp-skimlinks'],
    },
  },
  (env) => {
    let helpers;
    let trackingService;
    let waypoint;
    beforeEach(() => {
      helpers = helpersFactory(env);
    });

    function getFakeTrackingInfo(data) {
      return {
        pubcode,
        pageImpressionId: 'page_impression_id',
        customTrackingId: null,
        guid: 'user_guid',
        ...data,
      };
    }

    beforeEach(() => {
      trackingService = helpers.createTrackingWithStubAnalytics();
      env.sandbox
        .stub(trackingService, 'getTrackingInfo')
        .returns(getFakeTrackingInfo());
      env.sandbox
        .stub(env.ampdoc.win.document, 'referrer')
        .value('referrer_url');
      helpers.mockServiceGetter('documentInfoForDoc', {
        canonicalUrl: 'canonical_url',
      });
      env.sandbox.stub(Date.prototype, 'getTimezoneOffset').returns('-120');
      waypoint = new Waypoint(
        env.ampdoc,
        DEFAULT_SKIM_OPTIONS,
        trackingService,
        'referrer_url'
      );
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    describe('getAffiliateUrl', () => {
      let replacementUrl;
      let queryParams;
      let anchor;
      const destinationUrl = 'https://test.com/path/to?isAdmin=true';

      function getQueryParams(url) {
        return parseQueryString(parseUrlDeprecated(url).search);
      }

      beforeEach(() => {
        anchor = helpers.createAnchor(destinationUrl);
        replacementUrl = waypoint.getAffiliateUrl(anchor);
        queryParams = getQueryParams(replacementUrl);
      });

      it('Sends the pubcode', () => {
        expect(queryParams.id).to.equal(pubcode);
      });
      it('Sends the destination url', () => {
        expect(queryParams.url).to.equal(destinationUrl);
      });

      it('Sends the sref', () => {
        expect(queryParams.sref).to.equal('canonical_url');
      });

      it('Sends the pref', () => {
        expect(queryParams.pref).to.equal('referrer_url');
      });

      it('Sends the xguid (GUID)', () => {
        expect(queryParams.xguid).to.equal('user_guid');
      });

      it('Sends the xuuid (impression id)', () => {
        expect(queryParams.xuuid).to.equal('page_impression_id');
      });

      it('Sends the xtz (timezone)', () => {
        expect(queryParams.xtz).to.equal('-120');
      });

      it('Sends xs (source app)', () => {
        expect(queryParams.xs).to.equal('1');
      });

      describe('custom-tracking-id (xcust)', () => {
        const trackingInfo = getFakeTrackingInfo({
          customTrackingId: 'globalTrackingId',
        });

        it('Does not send the xcust if not provided as skimOption', () => {
          expect(queryParams.xcust).to.be.undefined;
        });

        it('Sends the xcust if provided on the link', () => {
          anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'linkTrackingId');
          replacementUrl = waypoint.getAffiliateUrl(anchor);
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('linkTrackingId');
        });

        it('Sends the xcust if provided as skimOption', () => {
          trackingService.getTrackingInfo.returns(trackingInfo);
          replacementUrl = waypoint.getAffiliateUrl(anchor);
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('globalTrackingId');
        });

        it('Sends the xcust if provided on the link and as skimOption', () => {
          anchor.setAttribute(XCUST_ATTRIBUTE_NAME, 'linkTrackingId');
          replacementUrl = waypoint.getAffiliateUrl(anchor);
          queryParams = getQueryParams(replacementUrl);
          expect(queryParams.xcust).to.be.equal('linkTrackingId');
        });
      });
    });
  }
);
