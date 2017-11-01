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

import {IframeTransportMessageQueue} from '../iframe-transport-message-queue';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin('amp-analytics.iframe-transport-message-queue', {amp: true},
    env => {
      let frame;
      let queue;

      beforeEach(() => {
        frame = createElementWithAttributes(env.win.document, 'iframe', {
          'sandbox': 'allow-scripts',
          'name': 'some_name',
        });
        frame.src = 'https://www.google.com';
        frame.sentinel = '42';
        queue = new IframeTransportMessageQueue(env.win, frame);
      });

      afterEach(() => {
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
    });
