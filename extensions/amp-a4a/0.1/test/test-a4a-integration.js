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

chai.Assertion.addMethod('renderedInFriendlyIframe', function (srcdoc) {
  const obj = this._obj;
  this.assert(obj,
      'amp ad element should be #{exp}, got #{act}',  // if true message
      'amp ad element should not be #{exp}, got #{act}',  // if negated message
      'truthy',  // expected
      obj);      // actual
  const elementName = obj.tagName.toLowerCase();
  const child = obj.querySelector('iframe[srcdoc]');
  this.assert(child,
      `child of amp ad element ${elementName} should be #{exp}, got #{act}`,
      `child of amp ad element ${elementName} should not be #{exp}, got #{act}`,
      'truthy',
      child);
  this.assert(child.getAttribute('srcdoc').indexOf(srcdoc) >= 0,
      `iframe child of amp ad element ${elementName} should contain #{exp}, ` +
      'was #{act}',
      `iframe child of amp ad element ${elementName} should not contain ` +
      '#{exp}, was #{act}',
      srcdoc,
      child.getAttribute('srcdoc'));
  const childBody = child.contentDocument.body;
  this.assert(childBody,
      `iframe child of amp ad element ${elementName} should have #{exp}`,
      `iframe child of amp ad element ${elementName} should have #{exp}, ` +
      'got #{act}',
      'body tag',
      childBody);
  // I would like to just invoke the .visible assertion from test/_init_test.js,
  // but it doesn't work to just do this.assert(child).visible.  So just copy
  // the test code from _init_test.js.  Bleh.
  [obj, child, childBody].forEach(toTest => {
    const computedStyle =
        toTest.ownerDocument.defaultView.getComputedStyle(toTest);
    const visibility = computedStyle.getPropertyValue('visibility');
    const opacity = computedStyle.getPropertyValue('opacity');
    const tagName = toTest.tagName.toLowerCase();
    this.assert(
        visibility === 'visible' && parseInt(opacity, 10) > 0,
        'expected element \'' +
        tagName + '\' to be #{exp}, got #{act}. with classes: ' + obj.className,
        'expected element \'' +
        tagName + '\' not to be #{exp}. with classes: ' + obj.className,
        'visible',
        visibility);
  });
});

chai.Assertion.addMethod('renderedInXDomainIframe', function (src) {
  const obj = this._obj;
  this.assert(obj,
      'amp ad element should be #{exp}, got #{act}',  // if true message
      'amp ad element should not be #{exp}, got #{act}',  // if negated message
      'truthy',  // expected
      obj);      // actual
  const elementName = obj.tagName.toLowerCase();
  const friendlyChild = obj.querySelector('iframe[srcdoc]');
  this.assert(!friendlyChild,
      `child of amp ad element ${elementName} should not be cross-domain`,
      `child of amp ad element ${elementName} should be cross-domain`);
  const child = obj.querySelector('iframe[src]');
  this.assert(child,
      `child of amp ad element ${elementName} should be #{exp}, got #{act}`,
      `child of amp ad element ${elementName} should not be #{exp}, got #{act}`,
      'truthy',
      child);
  this.assert(child.getAttribute('src').indexOf(src) >= 0,
      `iframe child of amp ad element ${elementName} src should contain ` +
      '#{exp}, was #{act}',
      `iframe child of amp ad element ${elementName} src should not contain ` +
      '#{exp}, was #{act}',
      src,
      child.getAttribute('src'));
  // I would like to just invoke the .visible assertion from test/_init_test.js,
  // but it doesn't work to just do this.assert(child).visible.  So just copy
  // the test code from _init_test.js.  Bleh.
  [obj, child].forEach(toTest => {
    const computedStyle =
        toTest.ownerDocument.defaultView.getComputedStyle(toTest);
    const visibility = computedStyle.getPropertyValue('visibility');
    const opacity = computedStyle.getPropertyValue('opacity');
    const tagName = toTest.tagName.toLowerCase();
    this.assert(
        visibility === 'visible' && parseInt(opacity, 10) > 0,
        'expected element \'' +
        tagName + '\' to be #{exp}, got #{act}. with classes: ' + obj.className,
        'expected element \'' +
        tagName + '\' not to be #{exp}. with classes: ' + obj.className,
        'visible',
        visibility);
  });
});

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
      expect(element).to.be.renderedInFriendlyIframe('Hello, world.');
    });
  });

  it('should fall back to 3p when no signature is present', () => {
    mockResponse.headers.delete(SIGNATURE_HEADER);
    return fixture.addElement(a4aElement).then(element => {
      expect(element).to.be.renderedInXDomainIframe(TEST_URL);
    });
  });

  it('should fall back to 3p when the XHR fails', () => {
    xhrMock.resetBehavior();
    xhrMock.throws(new Error('Testing network error'));
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string('Testing network error');
      expect(error.message).to.contain.string('amp-a4a:');
      expect(a4aElement).to.be.renderedInXDomainIframe(TEST_URL);
    });
  });

  it('should fall back to 3p when extractCreative throws', () => {
    sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature').throws(
        new Error('Testing extractCreativeAndSignature error'));
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string(
          'Testing extractCreativeAndSignature error');
      expect(error.message).to.contain.string('amp-a4a:');
      expect(a4aElement).to.be.renderedInXDomainIframe(TEST_URL);
    });
  });

  it('should fall back to 3p when extractCreative returns empty sig', () => {
    sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature')
        .onFirstCall().returns({
          creative: stringToArrayBuffer(validCSSAmp.reserialized),
          signature: null,
        })
        .onSecondCall().throws(new Error(
            'Testing extractCreativeAndSignature should not occur error'));
    return fixture.addElement(a4aElement).then(element => {
      expect(element).to.be.renderedInXDomainIframe(TEST_URL);
    })
  });

  it('should fall back to 3p when extractCreative returns empty creative', () => {
    sandbox.stub(MockA4AImpl.prototype, 'extractCreativeAndSignature')
        .onFirstCall().returns({
          creative: null,
          signature: validCSSAmp.signature,
        })
        .onSecondCall().throws(new Error(
        'Testing extractCreativeAndSignature should not occur error'));
    // TODO(tdrl) Currently layoutCallback rejects, even though something *is*
    // rendered.  This should be fixed in a refactor, and we should change this
    // .catch to a .then.
    return fixture.addElement(a4aElement).catch(error => {
      expect(error.message).to.contain.string('Key failed to validate');
      expect(error.message).to.contain.string('amp-a4a:');
      expect(a4aElement).to.be.renderedInXDomainIframe(TEST_URL);
    })
  });
});
