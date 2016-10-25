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
    MockA4AImpl,
    stringToArrayBuffer,
    isStyleVisible,
    SIGNATURE_HEADER,
    TEST_URL,
} from './utils';
import {Xhr} from '../../../../src/service/xhr-impl';
import {createIframePromise} from '../../../../testing/iframe';
import {
    data as validCSSAmp,
} from './testdata/valid_css_at_rules_amp.reserialized';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import '../../../../extensions/amp-ad/0.1/amp-ad-api-handler';
import {adConfig} from '../../../../ads/_config';
import {a4aRegistry} from '../../../../ads/_a4a-config';
import {resetScheduledElementForTesting, upgradeOrRegisterElement} from '../../../../src/custom-element';
import * as sinon from 'sinon';


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
    // Note: Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string('Testing network error');
      expect(error.message).to.contain.string('amp-a4a:')
      let child = a4aElement.querySelector('iframe[srcdoc]');
      expect(child).to.not.be.ok;
      child = a4aElement.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child.getAttribute('src')).to.contain.string(TEST_URL);
      expect(isStyleVisible(fixture.win, a4aElement)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });

  it('should fall back to 3p when extractCreative throws', () => {
    sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature').throws(
        new Error('Testing extractCreativeAndSignature error'));
    // Note: Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string(
          'Testing extractCreativeAndSignature error');
      expect(error.message).to.contain.string('amp-a4a:')
      let child = a4aElement.querySelector('iframe[srcdoc]');
      expect(child).to.not.be.ok;
      child = a4aElement.querySelector('iframe[src]');
      expect(child).to.be.ok;
      expect(child.getAttribute('src')).to.contain.string(TEST_URL);
      expect(isStyleVisible(fixture.win, a4aElement)).to.be.true;
      expect(isStyleVisible(fixture.win, child)).to.be.true;
    });
  });
});
