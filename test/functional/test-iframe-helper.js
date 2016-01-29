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
import * as IframeHelper from '../../src/iframe-helper';
import * as sinon from 'sinon';

describe('iframe-helper', function() {
  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/base/test/fixtures/served/iframe-intersection.html';

  let testIframe;
  let sandbox;

  function getIframe(src) {
    const i = document.createElement('iframe');
    i.src = src;
    document.body.appendChild(i);
    return i;
  }

  beforeEach(() => {
    testIframe = getIframe(iframeSrc);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    testIframe.parentNode.removeChild(testIframe);
    testIframe = null;
    sandbox.restore();
  });


  it('should listen to iframe messages', () => {
    return new Promise(resolve => {
      IframeHelper.listen(testIframe, 'send-intersections', () => {
        resolve();
      });
    });
  });

  it('should un-listen after first hit', () => {
    const removeEventListenerSpy = sandbox.spy(window, 'removeEventListener');
    listen = function() {return unlisten;};
    return new Promise(resolve => {
      IframeHelper.listenOnce(testIframe, 'send-intersections', () => {
        resolve(resolve);
      });
    }).then(resolve => {
      expect(removeEventListenerSpy.callCount).to.equal(1);
      resolve();
    });
  });

  it('should set sentinel on postMessage data', () => {
    postMessageSpy = sinon/*OK*/.spy(testIframe.contentWindow, 'postMessage');
    return new Promise(resolve => {
      IframeHelper.postMessage(
        testIframe, 'testMessage', {}, 'http://google.com');
      expect(postMessageSpy.getCall(0).args[0].sentinel).to.equal('amp');
      expect(postMessageSpy.getCall(0).args[0].type).to.equal('testMessage');
      // Very important to do this outside of the sandbox, or else hell
      // breaks loose.
      postMessageSpy/*OK*/.restore();
      resolve();
    });
  });
});
