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

import '../amp-call-tracking';
import {clearResponseCache} from '../amp-call-tracking';
import {createIframePromise} from '../../../../testing/iframe';
import {xhrFor} from '../../../../src/services';
import * as sinon from 'sinon';


describe('amp-call-tracking', () => {
  let sandbox;
  let xhrMock = null;

  function getTestIframe() {
    return createIframePromise().then(iframe => {
      xhrMock = sandbox.mock(xhrFor(iframe.win));
      return iframe;
    });
  }

  function getCallTrackingEl(iframe, config = {}) {
    const hyperlink = document.createElement('a');
    const callTrackingEl = iframe.doc.createElement('amp-call-tracking');

    callTrackingEl.setAttribute('config', config.url);

    hyperlink.setAttribute('href', `tel:${config.defaultNumber}`);
    hyperlink.textContent = config.defaultContent || config.defaultNumber;

    callTrackingEl.appendChild(hyperlink);

    return iframe.addElement(callTrackingEl);
  }

  function mockXhrResponse(iframe, url, response) {
    xhrMock
        .expects('fetchJson')
        .withArgs(url)
        .returns(Promise.resolve({
          json() {
            return Promise.resolve(response);
          },
        }));
  }

  function expectHyperlinkToBe(callTrackingEl, href, textContent) {
    const hyperlink = callTrackingEl.getRealChildren()[0];

    expect(hyperlink.getAttribute('href')).to.equal(href);
    expect(hyperlink.textContent).to.equal(textContent);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    clearResponseCache();

    xhrMock.verify();
    sandbox.restore();
  });

  it('should render with required response fields', () => {
    const url = 'https://example.com/test.json';

    const defaultNumber = '123456';
    const defaultContent = '+1 (23) 456';

    const phoneNumber = '981234';

    return getTestIframe().then(iframe => {
      mockXhrResponse(iframe, url, {phoneNumber});

      return getCallTrackingEl(iframe, {
        url,
        defaultNumber,
        defaultContent,
      }).then(callTrackingEl => {
        expectHyperlinkToBe(callTrackingEl, `tel:${phoneNumber}`, phoneNumber);
      });
    });
  });

  it('should use all response fields to compose hyperlink', () => {
    const url = 'https://example.com/test.json';

    const defaultNumber = '123456';
    const defaultContent = '+1 (23) 456';

    const phoneNumber = '187654321';
    const formattedPhoneNumber = '+1 (87) 654-321';

    return getTestIframe().then(iframe => {
      mockXhrResponse(iframe, url, {phoneNumber, formattedPhoneNumber});

      return getCallTrackingEl(iframe, {
        url,
        defaultNumber,
        defaultContent,
      }).then(callTrackingEl => {
        expectHyperlinkToBe(
          callTrackingEl, `tel:${phoneNumber}`, formattedPhoneNumber);
      });
    });
  });

  it('should fail when response does not contain a phoneNumber field', () => {
    const url = 'https://example.com/test.json';

    const defaultNumber = '123456';
    const defaultContent = '+1 (23) 456';

    return getTestIframe().then(iframe => {
      mockXhrResponse(iframe, url, {});

      return expect(getCallTrackingEl(iframe, {
        url,
        defaultNumber,
        defaultContent,
      })).rejectedWith(/Response must contain a non-empty phoneNumber field/);
    });
  });
});
