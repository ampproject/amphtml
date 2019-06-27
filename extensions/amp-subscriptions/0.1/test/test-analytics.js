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

import {ActionStatus, SubscriptionAnalytics} from '../analytics';

describes.realWin('SubscriptionAnalytics', {amp: true}, env => {
  let analytics;
  let ampdoc;
  beforeEach(() => {
    ampdoc = env.ampdoc;
    analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
  });

  it('should not fail', () => {
    analytics.event('event1');
    analytics.serviceEvent('event1', 'serviceId');
  });

  it('should trigger a service event', () => {
    const stub = sandbox.stub(analytics, 'event');
    analytics.serviceEvent('event1', 'service1');
    expect(stub).to.be.calledOnce.calledWith('event1', {
      'serviceId': 'service1',
    });
  });

  it('should trigger an action event', () => {
    const stub = sandbox.stub(analytics, 'event');
    analytics.actionEvent('service1', 'action1', ActionStatus.SUCCESS);
    expect(stub).to.be.calledOnce.calledWith(
      'subscriptions-action-action1-success',
      {'serviceId': 'service1'}
    );
  });

  describe('listeners', () => {
    let eventStr;
    let eventObj;

    beforeEach(() => {
      analytics.registerEventListener(event => {
        eventStr = event;
        eventObj = analytics.getActionStatus(event);
      });
    });

    it('should notify listeners', () => {
      analytics.event('event');
      expect(eventStr).to.equal('event');

      analytics.serviceEvent('servEvent', '1');
      expect(eventStr).to.equal('servEvent');

      analytics.actionEvent('1', 'action', 'status');
      expect(eventStr).to.equal('subscriptions-action-action-status');
    });

    it('should decode action events', () => {
      analytics.actionEvent('1', 'action1', 'status1');
      expect(eventObj).to.deep.equal({
        action: 'action1',
        status: 'status1',
      });
    });
  });
});
