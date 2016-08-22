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
  let apiHandler;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    const adImpl = new BaseElement(adElement);
    apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
    testIndex++;
  });

  afterEach(() => {
    sandbox.restore();
    apiHandler = null;
  });

  describe('startUp test', () => {
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

    it('embed-state API', () => {
      const embedStateData = {
        sentinel: 'amp3ptest' + testIndex,
        type: 'send-embed-state',
      };

      const embedStateDataReply = 'amp-' + JSON.stringify({
        inViewport: false,
        pageHidden: false,
        type: 'embed-state',
        sentinel: 'amp3ptest' + testIndex,
      });

      iframe.postMessageToParent(embedStateData);
      return iframe.expectMessageFromParent(embedStateDataReply);
    });

    it('render-start API resolve promise', () => {
      const renderStartData = {
        sentinel: 'amp3ptest' + testIndex,
        type: 'render-start',
      };
      expect(iframe.style.visibility).to.equal('hidden');
      iframe.postMessageToParent(renderStartData);
      return startUpPromise.then(() => {
        expect(iframe.style.visibility).to.equal('');
      });
    });

    it('time out resolve promise', () => {
      apiHandler.renderStartPromise_ = Promise.reject(new Error());
      return startUpPromise.then(() => {
        throw new Error('must have failed');
      }, error => {
        expect(error.message).to.match(/render-start-event timed out/);
      });
    });
  });
});
