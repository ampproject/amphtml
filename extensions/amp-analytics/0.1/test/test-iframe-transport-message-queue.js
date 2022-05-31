import {createElementWithAttributes} from '#core/dom';

import {IframeTransportMessageQueue} from '../iframe-transport-message-queue';

describes.realWin(
  'amp-analytics.iframe-transport-message-queue',
  {amp: true},
  (env) => {
    let frame;
    let queue;

    beforeEach(() => {
      frame = createElementWithAttributes(env.win.document, 'iframe', {
        'sandbox': 'allow-scripts',
        'name': 'some_name',
      });
      frame.src = 'http://example.test';
      frame.sentinel = '42';
      queue = new IframeTransportMessageQueue(env.win, frame);
    });

    it('is empty when first created ', () => {
      expect(queue.queueSize()).to.equal(0);
    });

    it('is not ready until setIsReady() is called ', () => {
      expect(queue.isReady()).to.be.false;
      queue.setIsReady();
      expect(queue.isReady()).to.be.true;
    });

    it('queues messages when not ready to send ', () => {
      const beforeCount = queue.queueSize();
      queue.enqueue({creativeId: 'some_senderId', message: 'some_data'});
      queue.enqueue({creativeId: 'another_senderId', message: 'some_data'});
      const afterCount = queue.queueSize();
      expect(afterCount - beforeCount).to.equal(2);
    });

    it('flushes the queue when ready to send ', () => {
      queue.enqueue({creativeId: 'some_senderId', message: 'some_data'});
      queue.setIsReady();
      const afterCount = queue.queueSize();
      expect(afterCount).to.equal(0);
    });
  }
);
