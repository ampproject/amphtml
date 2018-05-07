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
import * as analytics from '../../../../src/analytics';
import * as sinon from 'sinon';
import {AmpStoryAutoAds} from '../amp-story-auto-ads';
import {macroTask} from '../../../../testing/yield';

const NOOP = () => {};

describes.realWin('amp-story-auto-ads', {
  amp: {
    extensions: [
      'amp-story-auto-ads',
    ],
  },
}, env => {

  let win;
  let adElement;
  let storyElement;
  let autoAds;

  beforeEach(() => {
    win = env.win;
    adElement = win.document.createElement('amp-story-auto-ads');
    storyElement = win.document.createElement('amp-story');
    win.document.body.appendChild(storyElement);
    storyElement.appendChild(adElement);
    autoAds = new AmpStoryAutoAds(adElement);
    autoAds.config_ = {
      'ad-attributes': {
        type: 'doubleclick',
        'data-slot': '/30497360/samfrank_native_v2_a4a',
      },
    };
  });

  describe('glass pane', () => {
    let page;
    let pane;

    beforeEach(() => {
      page = autoAds.createAdPage_();
      pane = page.querySelector('.i-amphtml-glass-pane');
    });

    it('should create glassPane', () => {
      expect(pane).to.exist;
    });

    it('glass pane should have full viewport grid parent', () => {
      const parent = pane.parentElement;
      expect(parent.tagName).to.equal('AMP-STORY-GRID-LAYER');
      expect(parent.getAttribute('template')).to.equal('fill');
    });
  });

  describe('analytics triggers', () => {
    it('should fire upon insertion', () => {
      autoAds.uniquePagesCount_ = 10;
      sandbox.stub(autoAds, 'startNextPage_');
      sandbox.stub(autoAds, 'tryToPlaceAdAfterPage_').returns(/* placed */ 1);
      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.handleActivePageChange_(3, 'fakePage');
      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-insert',
          {'insertTime': sinon.match.number});
    });

    it('should fire upon discarded ad', () => {
      autoAds.uniquePagesCount_ = 10;
      sandbox.stub(autoAds, 'startNextPage_');
      sandbox.stub(autoAds, 'tryToPlaceAdAfterPage_').returns(/* discard */ 2);
      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.handleActivePageChange_(3, 'fakePage');
      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-discard',
          {'discardTime': sinon.match.number});
    });

    it('should fire upon ad load', function* () {
      const signals = {whenSignal: () => Promise.resolve()};
      const fakeImpl = {signals: () => signals};
      const ad = win.document.createElement('amp-ad');
      ad.getImpl = () => Promise.resolve(fakeImpl);
      sandbox.stub(autoAds, 'createAdElement_').returns(ad);

      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.createAdPage_();
      yield macroTask();

      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-load',
          {'loadTime': sinon.match.number});
    });

    it('should fire upon ad request', () => {
      autoAds.ampStory_ = {
        element: storyElement,
        addPage: NOOP,
      };
      const page = win.document.createElement('amp-story-page');
      sandbox.stub(autoAds, 'createAdPage_').returns(page);
      page.getImpl = () => Promise.resolve();

      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.schedulePage_();

      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-request',
          {'requestTime': sinon.match.number});
    });
  });

  describe('analyticsEvent_', () => {
    let triggerStub;

    beforeEach(() => {
      triggerStub = sandbox.stub(analytics, 'triggerAnalyticsEvent');
    });

    it('should trigger the appropriate event', () => {
      const vars = {
        adIndex: 0,
        foo: 1,
      };
      autoAds.analyticsEvent_('my-event', vars);
      expect(triggerStub).calledWith(sinon.match.any, 'my-event',
          sinon.match(vars));
    });

    it('should aggregate data from previous events', () => {
      autoAds.analyticsEvent_('event-1', {foo: 1});
      autoAds.analyticsEvent_('event-2', {bar: 2});
      autoAds.analyticsEvent_('event-3', {baz: 3});
      expect(triggerStub).calledThrice;
      expect(triggerStub).calledWith(sinon.match.any, 'event-3',
          sinon.match({
            adIndex: 0,
            foo: 1,
            bar: 2,
            baz: 3,
          }));
    });
  });
});
