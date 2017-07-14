/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

window.name = '{"sentinel": "42"}';
import {
  router,
  AmpAnalytics3pMessageRouter,
} from '../../../../3p/ampanalytics-lib';
import {
  AMP_ANALYTICS_3P_MESSAGE_TYPE,
} from '../../../../src/3p-analytics-common';
import {dev} from '../../../../src/log';
import {Timer} from '../../../../src/service/timer-impl';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

adopt(window);

/**
 * @const {number}
 * Testing postMessage necessarily involves race conditions. Set this high
 * enough to avoid flakiness.
 */
const POST_MESSAGE_DELAY = 100;

describe('ampanalytics-lib', () => {
  let sandbox;
  const iframeMessagingClient = router.getIframeMessagingClient();
  const timer = new Timer(window);
  const newCreativeMessage =
    /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
    ({
      type: AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
      data: {'123': 'hello, world!'},
    });
  let badAssertsCounterStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    window.onNewAmpAnalyticsInstance = null;
    router.reset();
    badAssertsCounterStub = sandbox.stub();
    sandbox.stub(dev(), 'assert', (condition, msg) => {
      if (!condition) {
        badAssertsCounterStub(msg);
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('fails to create router if no window.name ', () => {
    const oldWindowName = window.name;;
    expect(() => {
      window.name = '';
      new AmpAnalytics3pMessageRouter(window);
    }).to.throw(/Cannot read property 'sentinel' of undefined/);
    window.name = oldWindowName;
  });

  it('sets sentinel from window.name.sentinel ', () => {
    expect(router.getSentinel()).to.equal('42');
  });

  it('initially has empty creativeMessageRouters mapping ', () => {
    expect(Object.keys(router.getCreativeMethodRouters()).length).to.equal(0);
  });

  it('routes to a AmpAnalytics3pCreativeMessageRouter ', () => {
    const message =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
      ({
        type: AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
        data: {'123': 'hello, world!'},
      });
    let receivedCreativeId;
    let receivedExtraData;
    window.onNewAmpAnalyticsInstance = creativeMessageRouter => {
      // Any exceptions thrown here are caught by the library. So, use closure.
      receivedCreativeId = creativeMessageRouter.getCreativeId();
      receivedExtraData = creativeMessageRouter.getExtraData();
    };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, message);
    return timer.promise(POST_MESSAGE_DELAY).then(() => {
      expect(Object.keys(router.getCreativeMethodRouters()).length).to.equal(1);
      expect(receivedCreativeId).to.equal('123');
      expect(receivedExtraData).to.equal('hello, world!');
    });
  });

  it('does not allow duplicate extraData ', () => {
    window.onNewAmpAnalyticsInstance = () => { };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return timer.promise(POST_MESSAGE_DELAY).then(() => {
      expect(badAssertsCounterStub.calledOnce).to.be.true;
      expect(badAssertsCounterStub.alwaysCalledWith(
          'Duplicate new creative message for 123')).to.be.true;
    });
  });

  it('asserts when onNewAmpAnalyticsInstance is not implemented ', () => {
    window.onNewAmpAnalyticsInstance = null;
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return timer.promise(POST_MESSAGE_DELAY).then(() => {
      expect(badAssertsCounterStub.calledOnce).to.be.true;
      expect(badAssertsCounterStub.alwaysCalledWith(
          sinon.match(/Must implement onNewAmpAnalyticsInstance/))).to.be.true;
      return Promise.resolve();
    });
  });

  it('rejects an event message from an unknown creative ', () => {
    const eventMessage =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
      ({
        type: AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
        data: {'456': ['something happened in an unknown creative']},
      });
    window.onNewAmpAnalyticsInstance = creativeMessageRouter => {
      creativeMessageRouter.registerAmpAnalytics3pEventsListener(() => { });
      iframeMessagingClient./*OK*/sendMessage(
          AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT, eventMessage);
    };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return timer.promise(POST_MESSAGE_DELAY).then(() => {
      expect(badAssertsCounterStub.calledOnce).to.be.true;
      const re = 'Discarding event message received prior to new creative' +
        ' message for 456';
      expect(badAssertsCounterStub.alwaysCalledWith(
          sinon.match(new RegExp(re)))).to.be.true;
    });
  });

  it('makes registration function available ', () => {
    window.onNewAmpAnalyticsInstance = creativeMessageRouter => {
      expect(
          creativeMessageRouter.registerAmpAnalytics3pEventsListener).to.exist;
    };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return Promise.resolve();
  });

  it('receives an event message ', () => {
    const eventMessage =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
      ({
        type: AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
        data: {'123': ['something happened']},
      });
    window.onNewAmpAnalyticsInstance = creativeMessageRouter => {
      creativeMessageRouter.registerAmpAnalytics3pEventsListener(events => {
        expect(events.length).to.equal(1);
      });
      iframeMessagingClient./*OK*/sendMessage(
          AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT, eventMessage);
    };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return Promise.resolve();
  });

  it('receives multiple event messages ', () => {
    const eventMessage =
      /** @type {../../../src/3p-analytics-common.AmpAnalytics3pNewCreative} */
      ({
        type: AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
        data: {
          '123': [
            'something happened',
            'something else happened',
            'a third thing happened',
          ],
        },
      });
    window.onNewAmpAnalyticsInstance = creativeMessageRouter => {
      creativeMessageRouter.registerAmpAnalytics3pEventsListener(events => {
        expect(events.length).to.equal(3);
      });
      iframeMessagingClient./*OK*/sendMessage(
          AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT, eventMessage);
    };
    iframeMessagingClient./*OK*/sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE, newCreativeMessage);
    return Promise.resolve();
  });
});
