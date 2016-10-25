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

import {stringToArrayBuffer, isStyleVisible} from './utils';
import {AmpA4A, RENDERING_TYPE_HEADER} from '../amp-a4a';
import {Xhr} from '../../../../src/service/xhr-impl';
import {Viewer} from '../../../../src/service/viewer-impl';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import {base64UrlDecodeToBytes} from '../../../../src/utils/base64';
import {cancellation} from '../../../../src/error';
import {createIframePromise} from '../../../../testing/iframe';
import {data as minimumAmp} from './testdata/minimum_valid_amp.reserialized';
import {data as regexpsAmpData} from './testdata/regexps.reserialized';
import {
    data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {data as testFragments} from './testdata/test_fragments';
import {data as expectations} from './testdata/expectations';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import '../../../../extensions/amp-ad/0.1/amp-ad-api-handler';
import {adConfig} from '../../../../ads/_config';
import {a4aRegistry} from '../../../../ads/_a4a-config';
import {resetScheduledElementForTesting, upgradeOrRegisterElement} from '../../../../src/custom-element';
import * as sinon from 'sinon';

/** @type {string} @private */
const SIGNATURE_HEADER = 'X-AmpAdSignature';

/** @type {string} @private */
const TEST_URL = 'https://test.location.org/ad/012345?args';

class MockA4AImpl extends AmpA4A {
  getAdUrl() {
    return Promise.resolve(TEST_URL);
  }

  extractCreativeAndSignature(responseArrayBuffer, responseHeaders) {
    return Promise.resolve({
      creative: responseArrayBuffer,
      signature: responseHeaders.has(SIGNATURE_HEADER) ?
          base64UrlDecodeToBytes(responseHeaders.get(SIGNATURE_HEADER)) : null,
    });
  }
}

describe('integration test: a4a', () => {
  let sandbox;
  let xhrMock;
  let fixture;
  let mockResponse;
  let a4aElement;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    xhrMock = sandbox.stub(Xhr.prototype, 'fetch');
    mockResponse = {
      arrayBuffer: function() {
        return Promise.resolve(stringToArrayBuffer(validCSSAmp.reserialized));
      },
      bodyUsed: false,
      headers: new Headers(),
    };
    mockResponse.headers.append(SIGNATURE_HEADER, validCSSAmp.signature);
    xhrMock.withArgs(TEST_URL, {
      mode: 'cors',
      method: 'GET',
      credentials: 'include',
      requireAmpResponseSourceOrigin: true,
    }).onFirstCall().returns(Promise.resolve(mockResponse));
    adConfig['mock'] = {};
    a4aRegistry['mock'] = () => {return true;};
    return createIframePromise().then(f => {
      fixture = f;
      installDocService(fixture.win, /* isSingleDoc */ true);
      upgradeOrRegisterElement(fixture.win, 'amp-a4a', MockA4AImpl);
      const doc = fixture.doc;
      a4aElement = doc.createElement('amp-a4a');
      a4aElement.setAttribute('width', 200);
      a4aElement.setAttribute('height', 50);
      a4aElement.setAttribute('type', 'mock');
    });
  });

  afterEach(() => {
    sandbox.restore();
    resetScheduledElementForTesting(window, 'amp-a4a');
    delete adConfig['mock'];
    delete a4aRegistry['mock'];
  });

  it('should render a single AMP ad in a friendly iframe', () => {
    return fixture.addElement(a4aElement).then(element => {
      const child = element.querySelector('iframe[srcdoc]');
      expect(child).to.be.ok;
      expect(child.getAttribute('srcdoc')).to.contain.string('Hello, world.');
      expect(isStyleVisible(fixture.win, element)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });

  it('should fall back to 3p when no signature is present', () => {
    mockResponse.headers.delete(SIGNATURE_HEADER);
    return fixture.addElement(a4aElement).then(element => {
      let child = element.querySelector('iframe[srcdoc]');
      expect(child).to.not.be.ok;
      child = element.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child.getAttribute('src')).to.contain.string(TEST_URL);
      expect(isStyleVisible(fixture.win, element)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });

  it('should fall back to 3p when the XHR fails', () => {
    xhrMock.resetBehavior();
    xhrMock.throws(new Error('Testing network error'));
    return fixture.addElement(a4aElement).then(element => {
      let child = element.querySelector('iframe[srcdoc]');
      expect(child).to.not.be.ok;
      child = element.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child.getAttribute('src')).to.contain.string(TEST_URL);
      expect(isStyleVisible(fixture.win, element)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });

  it('should fall back to 3p when extractCreative throws', () => {
    sinon.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature').throws(
        new Error('Testing extractCreativeAndSignature error'));
    return fixture.addElement(a4aElement).then(element => {
      let child = element.querySelector('iframe[srcdoc]');
      expect(child).to.not.be.ok;
      child = element.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child.getAttribute('src')).to.contain.string(TEST_URL);
      expect(isStyleVisible(fixture.win, element)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });
});
