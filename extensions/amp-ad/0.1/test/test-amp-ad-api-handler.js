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
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describe('amp-ad-api-handler', () => {
  let sandbox;
  let container;
  let iframe;
  let apiHandler;
  const iframeSrc = '//ads.localhost:' + location.port +
            '/base/test/fixtures/served/iframe.html';
  function insert(iframe) {
    container.doc.body.appendChild(iframe);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    const adImpl = new BaseElement(adElement);
    apiHandler = new AmpAdApiHandler(adImpl, adImpl.element);
    return createIframePromise().then(c => {
      container = c;
      iframe = c.doc.createElement('iframe');
      iframe.src = iframeSrc;
      iframe.setAttribute(
        'data-amp-3p-sentinel', 'amp3ptest');
      apiHandler.startUp(iframe, true);
      insert(iframe);
    });
  });

  afterEach(() => {
    sandbox.restore();
    apiHandler = null;
  });

  it('embed-state API', () => {
    return new Promise(resolve => {
      apiHandler.sendEmbedInfo_ = () => {
        resolve();
      };
      iframe.onload = () => {
        iframe.contentWindow.postMessage({
          sentinel: 'amp-test',
          type: 'subscribeToEmbedState',
          is3p: true,
          amp3pSentinel: 'amp3ptest',
        }, '*');
        apiHandler.iframe_.src = iframeSrc;
      };
      expect(apiHandler.embedStateApi_.clientWindows_).to.be.empty;
    }).then(() => {
      expect(apiHandler.embedStateApi_.clientWindows_.length).to.equal(1);
    });
  });
});
