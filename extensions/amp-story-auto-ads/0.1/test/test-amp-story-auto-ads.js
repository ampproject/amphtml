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
import {AmpStoryAutoAds} from '../amp-story-auto-ads';
import {macroTask} from '../../../../testing/yield';

const NOOP = () => {};

describes.realWin('amp-story-auto-ads', {
  amp: {
    extensions: [
      'amp-story:1.0',
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

  describe('visible attribute', () => {
    beforeEach(() => {
      sandbox.stub(autoAds, 'analyticsEvent_').returns(NOOP);
      autoAds.adPagesCreated_ = 1;
      autoAds.adPageIds_ = {'ad-page-1': 1};
    });

    it('sets the visible attribute when showing', () => {
      const setVisibleStub = sandbox.stub(autoAds, 'setVisibleAttribute_');
      sandbox.stub(autoAds, 'startNextAdPage_').returns(NOOP);
      // Switching to ad page.
      autoAds.handleActivePageChange_(/* pageIndex */ 1,
          /* pageId */ 'ad-page-1');
      expect(setVisibleStub.calledOnce).to.be.true;
    });

    it('removes the visible attribute when showing', () => {
      const removeVisibleStub = sandbox.stub(autoAds,
          'removeVisibleAttribute_');
      autoAds.idOfAdShowing_ = 'ad-page-1';
      autoAds.handleActivePageChange_(/* pageIndex */ 2,
          /* pageId */ 'non-ad-page');
      expect(removeVisibleStub.calledOnce).to.be.true;
    });
  });

  describe('analytics triggers', () => {
    it('should fire "story-ad-insert" upon insertion', () => {
      autoAds.uniquePagesCount_ = 10;
      autoAds.adPagesCreated_ = 1;
      sandbox.stub(autoAds, 'startNextAdPage_');
      sandbox.stub(autoAds, 'tryToPlaceAdAfterPage_').returns(/* placed */ 1);
      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.handleActivePageChange_(3, 'fakePage');
      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-insert',
          {'insertTime': sinon.match.number});
    });

    it('should fire "story-ad-discard" upon discarded ad', () => {
      autoAds.uniquePagesCount_ = 10;
      autoAds.adPagesCreated_ = 1;
      sandbox.stub(autoAds, 'startNextAdPage_');
      sandbox.stub(autoAds, 'tryToPlaceAdAfterPage_').returns(/* discard */ 2);
      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.handleActivePageChange_(3, 'fakePage');
      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-discard',
          {'discardTime': sinon.match.number});
    });

    it('should fire "story-ad-load" upon ad load', function* () {
      const signals = {whenSignal: () => Promise.resolve()};
      const fakeImpl = {signals: () => signals};
      const ad = win.document.createElement('amp-ad');
      ad.getImpl = () => Promise.resolve(fakeImpl);
      sandbox.stub(autoAds, 'createAdElement_').returns(ad);
      autoAds.adPageEls_ = [ad];

      const page = win.document.createElement('amp-story-page');
      sandbox.stub(autoAds, 'createPageElement_').returns(page);
      page.getImpl = () => Promise.resolve({delegateVideoAutoplay: () => {}});

      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.createAdPage_();
      yield macroTask();

      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-load',
          {'loadTime': sinon.match.number});
    });

    it('should fire "story-ad-request" upon ad request', () => {
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

    it('should fire "story-ad-view" upon ad visible', () => {
      autoAds.ampStory_ = {
        element: storyElement,
        addPage: NOOP,
      };
      autoAds.setVisibleAttribute_ = NOOP;
      autoAds.adPagesCreated_ = 1;
      const page = win.document.createElement('amp-story-page');
      sandbox.stub(autoAds, 'createAdPage_').returns(page);
      page.getImpl = () => Promise.resolve();

      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.adPageIds_ = {'ad-page-1': 1};
      autoAds.handleActivePageChange_(1, 'ad-page-1');

      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-view',
          {'viewTime': sinon.match.number});
    });

    it('should fire "story-ad-exit" upon ad exit', () => {
      autoAds.ampStory_ = {
        element: storyElement,
        addPage: NOOP,
      };
      autoAds.adPagesCreated_ = 1;
      const page = win.document.createElement('amp-story-page');
      sandbox.stub(autoAds, 'createAdPage_').returns(page);
      page.getImpl = () => Promise.resolve();

      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.idOfAdShowing_ = 'ad-page-1';
      autoAds.handleActivePageChange_(1, 'page-3');

      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('story-ad-exit',
          {'exitTime': sinon.match.number});
    });
  });

  describe('analyticsEvent_', () => {
    let triggerStub;

    beforeEach(() => {
      triggerStub = sandbox.stub(analytics, 'triggerAnalyticsEvent');
      autoAds.analyticsData_ = {1: {}};
    });

    it('should trigger the appropriate event', () => {
      const vars = {
        adIndex: 1,
        foo: 1,
      };

      autoAds.analyticsEvent_('my-event', vars);
      expect(triggerStub).calledWith(sinon.match.any, 'my-event',
          sinon.match(vars));
    });

    it('should aggregate data from previous events', () => {
      autoAds.analyticsEvent_('event-1', {adIndex: 1, foo: 1});
      autoAds.analyticsEvent_('event-2', {adIndex: 1, bar: 2});
      autoAds.analyticsEvent_('event-3', {adIndex: 1, baz: 3});
      expect(triggerStub).calledThrice;
      expect(triggerStub).calledWith(sinon.match.any, 'event-3',
          sinon.match({
            adIndex: 1,
            foo: 1,
            bar: 2,
            baz: 3,
          }));
    });
  });

  describe('analyticsEventWithCurrentAd_', () => {
    it('should add the current ad index and call #analyticsEvent_', () => {
      const analyticsStub = sandbox.stub(autoAds, 'analyticsEvent_');
      autoAds.analyticsEventWithCurrentAd_('cool-event', {foo: 1});
      expect(analyticsStub).to.be.called;
      expect(analyticsStub).to.have.been.calledWithMatch('cool-event',
          {foo: 1});
    });
  });

  describe('creation of attributes', () => {
    it('should not allow blacklisted attributes', () => {
      Object.assign(autoAds.config_['ad-attributes'], {
        height: 100,
        width: 100,
        layout: 'responsive',
      });

      const adElement = autoAds.createAdElement_();
      expect(adElement.hasAttribute('type')).to.be.true;
      expect(adElement.hasAttribute('data-slot')).to.be.true;
      expect(adElement.hasAttribute('width')).to.be.false;
      expect(adElement.hasAttribute('height')).to.be.false;
      expect(adElement.getAttribute('layout')).to.equal('fill');
    });

    it('should stringify attributes given as objects', () => {
      Object.assign(autoAds.config_['ad-attributes'], {
        'rtc-config': {
          vendors: {
            vendor1: {'SLOT_ID': 1},
            vendor2: {'PAGE_ID': 'abc'},
          },
        },
      });

      const adElement = autoAds.createAdElement_();
      expect(adElement.getAttribute('rtc-config'))
          .to.equal('{"vendors":{"vendor1":{"SLOT_ID":1},' +
          '"vendor2":{"PAGE_ID":"abc"}}}');
    });
  });
});
