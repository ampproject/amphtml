import * as AmpAnalytics from '#utils/analytics';
import {user} from '#utils/log';

import {
  ActionStatus,
  SubscriptionAnalytics,
  SubscriptionAnalyticsEvents,
} from '../analytics';

//--> env.sandbox.stub(ServiceUrl, 'adsUrl', url => serverUrl + url);

const TAG = 'amp-subscriptions';
const OPT_VARS = {'serviceId': 'platform1'};
const INT_VARS = {
  'action': 'action1',
  'status': ActionStatus.SUCCESS,
};

describes.realWin('SubscriptionAnalytics', {amp: true}, (env) => {
  let analytics;
  let ampdoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
  });

  it('should not fail', () => {
    analytics.event('event1');
    analytics.serviceEvent('event1', 'serviceId');
    analytics.actionEvent('platform1', 'action1', ActionStatus.SUCCESS);
  });

  describe('internal routing', () => {
    let eventStub;

    beforeEach(() => {
      eventStub = env.sandbox.stub(analytics, 'event');
    });

    it('should trigger a service event', () => {
      analytics.serviceEvent('event1', 'platform1');
      expect(eventStub).to.be.calledOnce.calledWith('event1', OPT_VARS);
    });

    it('should trigger an action event', () => {
      analytics.actionEvent('platform1', 'action1', ActionStatus.SUCCESS);
      expect(eventStub).to.be.calledOnce.calledWith(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        OPT_VARS,
        INT_VARS
      );
    });
  });

  describe('external routing', () => {
    let userLogStub;
    let ampLogStub;

    beforeEach(() => {
      userLogStub = env.sandbox.stub(user(), 'info');
      ampLogStub = env.sandbox.stub(AmpAnalytics, 'triggerAnalyticsEvent');
    });

    it('should log an event', () => {
      analytics.event(SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED);
      expect(userLogStub).to.be.calledOnce.calledWith(
        TAG,
        SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED,
        ''
      );
      expect(ampLogStub).to.be.calledOnce.calledWith(
        analytics.element_,
        SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED,
        {}
      );
    });

    it('should log an action event', () => {
      analytics.actionEvent('platform1', 'action1', ActionStatus.SUCCESS);
      expect(userLogStub).to.be.calledOnce.calledWith(
        TAG,
        'subscriptions-action-action1-success',
        OPT_VARS
      );
      expect(ampLogStub).to.be.calledOnce.calledWith(
        analytics.element_,
        'subscriptions-action-action1-success',
        OPT_VARS
      );
    });

    it('should log a service event', () => {
      analytics.serviceEvent(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        'platform1'
      );
      expect(userLogStub).to.be.calledOnce.calledWith(
        TAG,
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        OPT_VARS
      );
      expect(ampLogStub).to.be.calledOnce.calledWith(
        analytics.element_,
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        OPT_VARS
      );
    });
  });

  describe('listeners', () => {
    let eventStr;
    let optParams;
    let intParams;

    beforeEach(() => {
      analytics.registerEventListener((event, optVars, intVars) => {
        eventStr = event;
        optParams = optVars;
        intParams = intVars;
      });
    });

    it('should notify about events', () => {
      analytics.event('event');
      expect(eventStr).to.equal('event');
      expect(optParams).to.deep.equal({});
      expect(intParams).to.deep.equal({});
    });

    it('should notify about service events', () => {
      analytics.serviceEvent('servEvent', 'platform1');
      expect(eventStr).to.equal('servEvent');
      expect(optParams).to.deep.equal(OPT_VARS);
      expect(intParams).to.deep.equal({});
    });

    it('should notify about action events', () => {
      analytics.actionEvent('platform1', 'action1', ActionStatus.SUCCESS);
      expect(eventStr).to.equal(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION
      );
      expect(optParams).to.deep.equal(OPT_VARS);
      expect(intParams).to.deep.equal(INT_VARS);
    });
  });
});
