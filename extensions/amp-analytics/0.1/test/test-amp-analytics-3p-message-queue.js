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

import {
  MESSAGE_THROTTLE_TIME,
  AmpAnalytics3pNewCreativeMessageQueue,
  AmpAnalytics3pEventMessageQueue,
} from '../amp-analytics-3p-message-queue';
import {
  AMP_ANALYTICS_3P_MESSAGE_TYPE,
} from '../../../../src/3p-analytics-common';
import {IframeMessagingClient} from '../../../../3p/iframe-messaging-client';
import {Timer} from '../../../../src/service/timer-impl';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';

adopt(window);

const queueTypes = [
  {
    queueType: AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
    queueBuilder: iframeMessagingClient => {
      return new AmpAnalytics3pNewCreativeMessageQueue(
        window, iframeMessagingClient);
    },
  },
  {
    queueType: AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
    queueBuilder: iframeMessagingClient => {
      return new AmpAnalytics3pEventMessageQueue(window, iframeMessagingClient);
    },
  },
];

queueTypes.forEach(entry => {
  const queueType = entry.queueType;
  const queueBuilder = entry.queueBuilder;

  describe('amp-analytics.amp-analytics-3p-message-queue: ' + queueType, () => {
    const iframeMessagingClient = new IframeMessagingClient(window);
    iframeMessagingClient.setSentinel('foo');
    let sandbox;
    let queue;
    let timer;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      queue = queueBuilder(iframeMessagingClient);
      timer = new Timer(window);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('is empty when first created ', () => {
      expect(queue.queueSize()).to.equal(0);
    });

    it('is not ready until setIsReady() is called ', () => {
      expect(queue.isReady()).to.be.false;
      queue.setIsReady();
      expect(queue.isReady()).to.be.true;
    });

    it('builds messages of the proper type ', () => {
      const message = queue.buildMessage();
      expect(message.type).to.equal(queueType);
    });

    it('queues messages when not ready to send ', () => {
      const beforeCount = queue.queueSize();
      queue.enqueue('some_senderId', 'some_data');
      queue.enqueue('another_senderId', 'some_data');
      const afterCount = queue.queueSize();
      expect(afterCount - beforeCount).to.equal(2);
    });

    it('flushes the queue when ready to send ', () => {
      queue.enqueue('some_senderId', 'some_data');
      queue.setIsReady(); // Expected to flush the queue, but no more often than
      // every MESSAGE_THROTTLE_TIME ms
      return timer.promise(MESSAGE_THROTTLE_TIME * 1.5).then(() => {
        if (!queue.queueSize()) {
          return Promise.resolve(); // Queue did flush
        }
        return Promise.reject(); // Queue did not flush
      });
    });

    it('does not flush the queue too often ', () => {
      queue.setIsReady(); // Expected to flush the queue, but no more often than
      // every MESSAGE_THROTTLE_TIME ms
      queue.enqueue('sender' + String(Math.random()), 'some_data');
      timer.poll(MESSAGE_THROTTLE_TIME * 0.1, () => {
        return !queue.queueSize();
      }).then(() => {
        // Queue just flushed within the past 1/10th of the throttling interval
        queue.enqueue('sender' + String(Math.random()), 'some_data');
        return timer.promise(MESSAGE_THROTTLE_TIME * 0.1).then(() => {
          if (queue.queueSize()) {
            return Promise.resolve(); // Queue did not flush too soon
          }
          return Promise.reject(); // Queue flushed too soon
        });
      });
    });
  });
});

describe('amp-analytics.amp-analytics-3p-message-queue: Additional Event' +
  ' Queue Tests', () => {
  const iframeMessagingClient = new IframeMessagingClient(window);
  iframeMessagingClient.setSentinel('foo');
  let sandbox;
  let queue;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    queue = new AmpAnalytics3pEventMessageQueue(window, iframeMessagingClient);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('groups messages from same sender ', () => {
    queue.enqueue('letter_sender', 'A');
    queue.enqueue('letter_sender', 'B');
    queue.enqueue('letter_sender', 'C');
    queue.enqueue('number_sender', '1');
    queue.enqueue('number_sender', '2');
    queue.enqueue('number_sender', '3');
    queue.enqueue('number_sender', '4');
    const letterCount = queue.messagesFor('letter_sender').length;
    const numberCount = queue.messagesFor('number_sender').length;
    expect(queue.queueSize()).to.equal(2);
    expect(letterCount).to.equal(3);
    expect(numberCount).to.equal(4);
  });
});


describe('amp-analytics.amp-analytics-3p-message-queue: Additional New' +
  ' Creative Queue Tests', () => {
  const iframeMessagingClient = new IframeMessagingClient(window);
  iframeMessagingClient.setSentinel('foo');
  let sandbox;
  let queue;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    queue = new AmpAnalytics3pNewCreativeMessageQueue(window,
      iframeMessagingClient);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('only allows one message per sender ', () => {
    queue.enqueue('letter_sender', 'A');
    queue.enqueue('number_sender', '1');

    expect(() => {
      queue.enqueue('letter_sender', 'B');
    }).to.throw(/Replacing existing extra data/);

    expect(() => {
      queue.enqueue('number_sender', '2');
    }).to.throw(/Replacing existing extra data/);
  });
});

