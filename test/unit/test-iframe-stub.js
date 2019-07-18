/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  createIframeWithMessageStub,
  expectPostMessage,
} from '../../testing/iframe';

describe
  .configure()
  .skipFirefox()
  .run('test-iframe-createIframeWithMessageStub', () => {
    const data1 = {
      foo: 'bar',
      test: true,
      type: 'test',
    };

    const data2 = {
      num: 5,
    };

    let iframe;

    beforeEach(done => {
      iframe = createIframeWithMessageStub(window);
      document.body.appendChild(iframe);
      iframe.onload = () => {
        done();
      };
    });

    it('should get message from fragment and post back to parent window', () => {
      iframe.postMessageToParent(data1);
      return expectPostMessage(iframe.contentWindow, window, data1)
        .then(receivedMessage => {
          expect(receivedMessage).to.jsonEqual(data1);
        })
        .then(() => {
          iframe.postMessageToParent(data2);
          return expectPostMessage(iframe.contentWindow, window, data2);
        })
        .then(receivedMessage => {
          expect(receivedMessage).to.jsonEqual(data2);
        });
    });

    it('should echo back message to parent window', () => {
      iframe.contentWindow.postMessage(data1, '*');
      return iframe
        .expectMessageFromParent('test')
        .then(() => {
          iframe.contentWindow.postMessage(data2, '*');
          return iframe.expectMessageFromParent((data, msg) => {
            expect(data).to.jsonEqual(data2);
            expect(msg).to.jsonEqual(data2);
            return true;
          });
        })
        .then(() => {
          iframe.contentWindow.postMessage(
            'test-' + JSON.stringify(data2),
            '*'
          );
          return iframe.expectMessageFromParent((data, msg) => {
            expect(data).to.equal(null);
            expect(msg).to.equal('test-' + JSON.stringify(data2));
            return true;
          });
        })
        .then(() => {
          iframe.contentWindow.postMessage('amp-' + JSON.stringify(data2), '*');
          return iframe.expectMessageFromParent((data, msg) => {
            expect(data).to.jsonEqual(data2);
            expect(msg).to.equal('amp-' + JSON.stringify(data2));
            return true;
          });
        })
        .then(() => {
          iframe.contentWindow.postMessage(data2, '*');
          return iframe
            .expectMessageFromParent(() => {
              throw new Error('test');
            })
            .then(
              () => {
                throw new Error('should not get here');
              },
              () => {
                expect(true).to.equal(true);
              }
            );
        });
    });
  });
