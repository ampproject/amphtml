import * as analyticsApi from '#utils/analytics';

import {
  ANALYTICS_EVENTS_ENUM,
  ANALYTICS_VARS_ENUM,
  StoryAdAnalytics,
} from '../story-ad-analytics';

describes.realWin(
  'amp-story-auto-ads:story-ad-analytics',
  {amp: true},
  (env) => {
    let ampdoc;
    let win;
    let analytics;
    let triggerStub;
    let ampStoryAutoAdsEl;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      analytics = new StoryAdAnalytics(ampdoc);
      triggerStub = env.sandbox.stub(analyticsApi, 'triggerAnalyticsEvent');
      const doc = win.document;
      ampStoryAutoAdsEl = doc.createElement('amp-story-auto-ads');
      doc.body.appendChild(ampStoryAutoAdsEl);
    });

    describe('fireEvent', () => {
      it('calls the analytics trigger correctly', () => {
        const adIndex = 1;
        const loadTime = 1565731560523; // Arbitrary timestamp.
        const vars = {[ANALYTICS_VARS_ENUM.AD_LOADED]: loadTime};
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          adIndex,
          ANALYTICS_EVENTS_ENUM.AD_LOADED,
          vars
        );
        expect(triggerStub).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          ANALYTICS_EVENTS_ENUM.AD_LOADED,
          {
            [ANALYTICS_VARS_ENUM.AD_INDEX]: 1,
            [ANALYTICS_VARS_ENUM.AD_LOADED]: loadTime,
            [ANALYTICS_VARS_ENUM.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });

      it('contains all previous vars', () => {
        const loadTime = 1565731560523; // Arbitrary timestamp.
        const insertTime = 1565731560555; // Arbitrary timestamp.

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          ANALYTICS_EVENTS_ENUM.AD_LOADED,
          {
            [ANALYTICS_VARS_ENUM.AD_LOADED]: loadTime,
          }
        );
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          ANALYTICS_EVENTS_ENUM.AD_INSERTED,
          {
            [ANALYTICS_VARS_ENUM.AD_INSERTED]: insertTime,
          }
        );

        expect(triggerStub).to.be.calledTwice;
        expect(triggerStub.lastCall).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          ANALYTICS_EVENTS_ENUM.AD_INSERTED,
          {
            [ANALYTICS_VARS_ENUM.AD_INDEX]: 2,
            [ANALYTICS_VARS_ENUM.AD_LOADED]: loadTime,
            [ANALYTICS_VARS_ENUM.AD_INSERTED]: insertTime,
            [ANALYTICS_VARS_ENUM.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });

      it('persists unique id per creative across calls', () => {
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // adIndex
          ANALYTICS_EVENTS_ENUM.AD_LOADED,
          {
            [ANALYTICS_VARS_ENUM.AD_LOADED]: Date.now(),
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // Different adIndex
          ANALYTICS_EVENTS_ENUM.AD_LOADED,
          {
            [ANALYTICS_VARS_ENUM.AD_LOADED]: Date.now(),
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // Same adIndex
          ANALYTICS_EVENTS_ENUM.AD_INSERTED,
          {
            [ANALYTICS_VARS_ENUM.AD_INSERTED]: Date.now(),
          }
        );

        const {firstCall, secondCall, thirdCall} = triggerStub;
        const firstCallId = firstCall.lastArg[ANALYTICS_VARS_ENUM.AD_UNIQUE_ID];
        const secondCallId =
          secondCall.lastArg[ANALYTICS_VARS_ENUM.AD_UNIQUE_ID];
        const thirdCallId = thirdCall.lastArg[ANALYTICS_VARS_ENUM.AD_UNIQUE_ID];

        // Same adIndex should have same id.
        expect(firstCallId).to.equal(thirdCallId);
        // Different adIndex.
        expect(secondCallId).not.to.equal(thirdCallId);
      });
    });

    describe('setVar', () => {
      it('stores vars for each page for future analytics events', () => {
        analytics.setVar(/* adIndex */ 1, ANALYTICS_VARS_ENUM.CTA_TYPE, 'SHOP');
        analytics.setVar(/* adIndex */ 1, ANALYTICS_VARS_ENUM.POSITION, 7);

        analytics.setVar(
          /* adIndex */ 2,
          ANALYTICS_VARS_ENUM.CTA_TYPE,
          'LEARN'
        );
        analytics.setVar(/* adIndex */ 2, ANALYTICS_VARS_ENUM.POSITION, 14);

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          ANALYTICS_EVENTS_ENUM.AD_VIEWED,
          {
            [ANALYTICS_VARS_ENUM.AD_VIEWED]: 12345,
          }
        );

        expect(triggerStub).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          ANALYTICS_EVENTS_ENUM.AD_VIEWED,
          {
            [ANALYTICS_VARS_ENUM.AD_INDEX]: 2,
            [ANALYTICS_VARS_ENUM.CTA_TYPE]: 'LEARN',
            [ANALYTICS_VARS_ENUM.POSITION]: 14,
            [ANALYTICS_VARS_ENUM.AD_VIEWED]: 12345,
            [ANALYTICS_VARS_ENUM.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // adIndex
          ANALYTICS_EVENTS_ENUM.AD_EXITED,
          {
            [ANALYTICS_VARS_ENUM.AD_EXITED]: 56789,
          }
        );

        expect(triggerStub.lastCall).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          ANALYTICS_EVENTS_ENUM.AD_EXITED,
          {
            [ANALYTICS_VARS_ENUM.AD_INDEX]: 1,
            [ANALYTICS_VARS_ENUM.CTA_TYPE]: 'SHOP',
            [ANALYTICS_VARS_ENUM.POSITION]: 7,
            [ANALYTICS_VARS_ENUM.AD_EXITED]: 56789,
            [ANALYTICS_VARS_ENUM.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });
    });
  }
);
