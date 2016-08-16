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
import {AmpAd3PImpl} from '../amp-ad-3p-impl';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describe('amp-ad-api-handler', () => {
  let sandbox;
  let container;
  let testIframe;
  let testAdElement;
  let testAd;
  let testApiHandler;
  const iframeSrc = 'http://ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
  function insert(iframe) {
    container.doc.body.appendChild(iframe);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    testAdElement = document.createElement('amp-ad');
    testAd = new AmpAd3PImpl(testAdElement);
    testApiHandler = new AmpAdApiHandler(testAd, testAd.element);
    return createIframePromise().then(c => {
      container = c;
      const i = c.doc.createElement('iframe');
      i.src = iframeSrc;
      testIframe = i;
    });
  });

  afterEach(() => {
    sandbox.restore();
    testAdElement = null;
    testAd = null;
    testApiHandler = null;
  });

  it('embed-state API', () => {
    expect(testApiHandler.embedStateApi_).length.to.be.null;
    testIframe.setAttribute(
        'data-amp-3p-sentinel', 'amp3ptest');
    testApiHandler.startUp(testIframe, true);
    insert(testIframe);
    expect(testApiHandler.embedStateApi_).to.not.be.null;
    return new Promise(resolve => {
      testApiHandler.sendEmbedInfo_ = () => {
        resolve(testApiHandler);
      };
      testIframe.onload = function() {
        testIframe.contentWindow.postMessage({
          sentinel: 'amp-test',
          type: 'subscribeToEmbedState',
          is3p: true,
          amp3pSentinel: 'amp3ptest',
        }, '*');
        testApiHandler.iframe_.src = iframeSrc;
      };
      expect(testApiHandler.embedStateApi_.clientWindows_.length).to.equal(0);
    }).then(testApiHandler => {
      expect(testApiHandler.embedStateApi_.clientWindows_.length).to.equal(1);
    });
  });
});
