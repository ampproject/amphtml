import * as analyticsApi from '#utils/analytics';

import {
  AnalyticsEvents_Enum,
  AnalyticsVars_Enum,
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
        const vars = {[AnalyticsVars_Enum.AD_LOADED]: loadTime};
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          adIndex,
          AnalyticsEvents_Enum.AD_LOADED,
          vars
        );
        expect(triggerStub).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          AnalyticsEvents_Enum.AD_LOADED,
          {
            [AnalyticsVars_Enum.AD_INDEX]: 1,
            [AnalyticsVars_Enum.AD_LOADED]: loadTime,
            [AnalyticsVars_Enum.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });

      it('contains all previous vars', () => {
        const loadTime = 1565731560523; // Arbitrary timestamp.
        const insertTime = 1565731560555; // Arbitrary timestamp.

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          AnalyticsEvents_Enum.AD_LOADED,
          {
            [AnalyticsVars_Enum.AD_LOADED]: loadTime,
          }
        );
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          AnalyticsEvents_Enum.AD_INSERTED,
          {
            [AnalyticsVars_Enum.AD_INSERTED]: insertTime,
          }
        );

        expect(triggerStub).to.be.calledTwice;
        expect(triggerStub.lastCall).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          AnalyticsEvents_Enum.AD_INSERTED,
          {
            [AnalyticsVars_Enum.AD_INDEX]: 2,
            [AnalyticsVars_Enum.AD_LOADED]: loadTime,
            [AnalyticsVars_Enum.AD_INSERTED]: insertTime,
            [AnalyticsVars_Enum.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });

      it('persists unique id per creative across calls', () => {
        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // adIndex
          AnalyticsEvents_Enum.AD_LOADED,
          {
            [AnalyticsVars_Enum.AD_LOADED]: Date.now(),
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // Different adIndex
          AnalyticsEvents_Enum.AD_LOADED,
          {
            [AnalyticsVars_Enum.AD_LOADED]: Date.now(),
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // Same adIndex
          AnalyticsEvents_Enum.AD_INSERTED,
          {
            [AnalyticsVars_Enum.AD_INSERTED]: Date.now(),
          }
        );

        const {firstCall, secondCall, thirdCall} = triggerStub;
        const firstCallId = firstCall.lastArg[AnalyticsVars_Enum.AD_UNIQUE_ID];
        const secondCallId =
          secondCall.lastArg[AnalyticsVars_Enum.AD_UNIQUE_ID];
        const thirdCallId = thirdCall.lastArg[AnalyticsVars_Enum.AD_UNIQUE_ID];

        // Same adIndex should have same id.
        expect(firstCallId).to.equal(thirdCallId);
        // Different adIndex.
        expect(secondCallId).not.to.equal(thirdCallId);
      });
    });

    describe('setVar', () => {
      it('stores vars for each page for future analytics events', () => {
        analytics.setVar(/* adIndex */ 1, AnalyticsVars_Enum.CTA_TYPE, 'SHOP');
        analytics.setVar(/* adIndex */ 1, AnalyticsVars_Enum.POSITION, 7);

        analytics.setVar(/* adIndex */ 2, AnalyticsVars_Enum.CTA_TYPE, 'LEARN');
        analytics.setVar(/* adIndex */ 2, AnalyticsVars_Enum.POSITION, 14);

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          2, // adIndex
          AnalyticsEvents_Enum.AD_VIEWED,
          {
            [AnalyticsVars_Enum.AD_VIEWED]: 12345,
          }
        );

        expect(triggerStub).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          AnalyticsEvents_Enum.AD_VIEWED,
          {
            [AnalyticsVars_Enum.AD_INDEX]: 2,
            [AnalyticsVars_Enum.CTA_TYPE]: 'LEARN',
            [AnalyticsVars_Enum.POSITION]: 14,
            [AnalyticsVars_Enum.AD_VIEWED]: 12345,
            [AnalyticsVars_Enum.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );

        analytics.fireEvent(
          ampStoryAutoAdsEl,
          1, // adIndex
          AnalyticsEvents_Enum.AD_EXITED,
          {
            [AnalyticsVars_Enum.AD_EXITED]: 56789,
          }
        );

        expect(triggerStub.lastCall).to.be.calledWithExactly(
          ampStoryAutoAdsEl,
          AnalyticsEvents_Enum.AD_EXITED,
          {
            [AnalyticsVars_Enum.AD_INDEX]: 1,
            [AnalyticsVars_Enum.CTA_TYPE]: 'SHOP',
            [AnalyticsVars_Enum.POSITION]: 7,
            [AnalyticsVars_Enum.AD_EXITED]: 56789,
            [AnalyticsVars_Enum.AD_UNIQUE_ID]: env.sandbox.match.string,
          }
        );
      });
    });
  }
);
