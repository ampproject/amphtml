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

import {AmpAdApiHandler} from '../amp-ad-api-handler';
import {BaseElement} from '../../../../src/base-element';
import {createIframeWithMessageStub} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describe('amp-ad-api-handler', () => {
  let sandbox;
  let adImpl;
  let apiHandler;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
    testIndex++;
  });

  afterEach(() => {
    sandbox.restore();
    apiHandler = null;
  });

  describe('iframe that is initialized by startUp()', () => {
    let iframe;
    let startUpPromise;
    const beforeAttachedToDom = element => {
      element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      startUpPromise = apiHandler.startUp(element, true);
    };
    beforeEach(() => {
      return createIframeWithMessageStub(window, beforeAttachedToDom)
        .then(newIframe => {
          iframe = newIframe;
        });
    });

    it('should be able to use embed-state API', () => {
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'send-embed-state',
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        inViewport: false,
        pageHidden: false,
        type: 'embed-state',
        sentinel: 'amp3ptest' + testIndex,
      }));
    });

    it('should resolve startUp() when render-start API is called', () => {
      expect(iframe.style.visibility).to.equal('hidden');
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'render-start',
      });
      return startUpPromise.then(() => {
        expect(iframe.style.visibility).to.equal('');
      });
    });

    it('should be able to use embed-size API, change size deny', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.reject(new Error('for testing'));
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
        width: 114,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-denied',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('114');
      });
    });

    it('should be able to use embed-size API, change size succeed', () => {
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
        width: 114,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: 114,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('114');
      });
    });

    it('should be able to use embed-size API to resize height only', () => {
      iframe.height = 11;
      iframe.width = 22;
      sandbox.stub(adImpl, 'attemptChangeSize', () => {
        return Promise.resolve();
      });
      iframe.postMessageToParent({
        sentinel: 'amp3ptest' + testIndex,
        type: 'embed-size',
        height: 217,
      });
      return iframe.expectMessageFromParent('amp-' + JSON.stringify({
        requestedWidth: undefined,
        requestedHeight: 217,
        type: 'embed-size-changed',
        sentinel: 'amp3ptest' + testIndex,
      })).then(() => {
        expect(iframe.height).to.equal('217');
        expect(iframe.width).to.equal('22');
      });
    });
  });
});
