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
  let iframe;
  let apiHandler;
  let testIndex = 0;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    const adImpl = new BaseElement(adElement);
    apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
    const beforeAttachedToDom = element => {
      element.setAttribute('data-amp-3p-sentinel', 'amp3ptest' + testIndex);
      apiHandler.startUp(element, true);
    };
    return createIframeWithMessageStub(window, beforeAttachedToDom)
        .then(newIframe => {
          iframe = newIframe;
        });
  });

  afterEach(() => {
    sandbox.restore();
    apiHandler = null;
    testIndex++;
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
});

