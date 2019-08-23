/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as analyticsSrc from '../../../../src/analytics';
import {
  AnalyticsEvents,
  AnalyticsVars,
  StoryAdAnalytics,
} from '../story-ad-analytics';

describes.realWin('amp-story-auto-ads:story-ad-analytics', {amp: true}, env => {
  let ampdoc;
  let win;
  let analytics;
  let triggerStub;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    analytics = new StoryAdAnalytics(ampdoc);
    triggerStub = sandbox.stub(analyticsSrc, 'triggerAnalyticsEvent');
  });

  describe('fireEvent', () => {
    it('calls the analytics trigger correctly', () => {
      const adIndex = 1;
      const loadTime = 1565731560523; // Arbitrary timestamp.
      const vars = {[AnalyticsVars.AD_LOADED]: loadTime};
      analytics.fireEvent(adIndex, AnalyticsEvents.AD_LOADED, vars);

      expect(triggerStub).to.be.calledWithExactly(
        win.document.body,
        AnalyticsEvents.AD_LOADED,
        {
          [AnalyticsVars.AD_INDEX]: 1,
          [AnalyticsVars.AD_LOADED]: loadTime,
          [AnalyticsVars.AD_UNIQUE_ID]: sinon.match.string,
        }
      );
    });

    it('contains all previous vars', () => {
      const loadTime = 1565731560523; // Arbitrary timestamp.
      const insertTime = 1565731560555; // Arbitrary timestamp.

      analytics.fireEvent(/* adIndex */ 2, AnalyticsEvents.AD_LOADED, {
        [AnalyticsVars.AD_LOADED]: loadTime,
      });
      analytics.fireEvent(/* adIndex */ 2, AnalyticsEvents.AD_INSERTED, {
        [AnalyticsVars.AD_INSERTED]: insertTime,
      });

      expect(triggerStub).to.be.calledTwice;
      expect(triggerStub.lastCall).to.be.calledWithExactly(
        win.document.body,
        AnalyticsEvents.AD_INSERTED,
        {
          [AnalyticsVars.AD_INDEX]: 2,
          [AnalyticsVars.AD_LOADED]: loadTime,
          [AnalyticsVars.AD_INSERTED]: insertTime,
          [AnalyticsVars.AD_UNIQUE_ID]: sinon.match.string,
        }
      );
    });
  });

  describe('setVar', () => {
    it('stores vars for each page for future analytics events', () => {
      analytics.setVar(/* adIndex */ 1, AnalyticsVars.CTA_TYPE, 'SHOP');
      analytics.setVar(/* adIndex */ 1, AnalyticsVars.POSITION, 7);

      analytics.setVar(/* adIndex */ 2, AnalyticsVars.CTA_TYPE, 'LEARN');
      analytics.setVar(/* adIndex */ 2, AnalyticsVars.POSITION, 14);

      analytics.fireEvent(/* adIndex */ 2, AnalyticsEvents.AD_VIEWED, {
        [AnalyticsVars.AD_VIEWED]: 12345,
      });

      expect(triggerStub).to.be.calledWithExactly(
        win.document.body,
        AnalyticsEvents.AD_VIEWED,
        {
          [AnalyticsVars.AD_INDEX]: 2,
          [AnalyticsVars.CTA_TYPE]: 'LEARN',
          [AnalyticsVars.POSITION]: 14,
          [AnalyticsVars.AD_VIEWED]: 12345,
          [AnalyticsVars.AD_UNIQUE_ID]: sinon.match.string,
        }
      );

      analytics.fireEvent(/* adIndex */ 1, AnalyticsEvents.AD_EXITED, {
        [AnalyticsVars.AD_EXITED]: 56789,
      });

      expect(triggerStub.lastCall).to.be.calledWithExactly(
        win.document.body,
        AnalyticsEvents.AD_EXITED,
        {
          [AnalyticsVars.AD_INDEX]: 1,
          [AnalyticsVars.CTA_TYPE]: 'SHOP',
          [AnalyticsVars.POSITION]: 7,
          [AnalyticsVars.AD_EXITED]: 56789,
          [AnalyticsVars.AD_UNIQUE_ID]: sinon.match.string,
        }
      );
    });
  });
});
