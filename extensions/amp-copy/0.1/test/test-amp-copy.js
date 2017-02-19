
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
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-copy';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-copy', () => {
  /**
   * Function to add an amp-copy to our testing iframe
   *
   * @param attributes - An object, containing the attributes
   *    "name" as the keys, and the "value" it should be set to as the values.
   */
  function getAmpCopy(attributes) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ampCopy = iframe.doc.createElement('amp-copy');
      Object.keys(attributes).forEach((attribute) => {
        ampCopy.setAttribute(attribute, attributes[attribute]);
      });
      return iframe.addElement(ampCopy);
    });
  }

  /**
   * Function to get the document inside of our testing iframe
   *
   * @returns Iframe document element
   */
  function getIframeDocument() {
    return document.getElementsByTagName('iframe')[0].contentWindow.document;
  }

  it('renders', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "input",
      "height": "100px",
      "width": "300px"
    }).then(ampCopy => {
      expect(ampCopy).to.exist;
    });
  });

  it('renders responsively', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "input",
      "layout": "responsive",
      "height": "100px",
      "width": "300px"
    }).then(ampCopy => {
      expect(ampCopy).to.exist;
      expect(ampCopy.className).to.contain('i-amphtml-layout-responsive');
    });
  });

  it('requires copy-text', () => {
    return getAmpCopy({
      "text-element": "input",
      "layout": "responsive",
      "height": "100px",
      "width": "300px"
    }).should.eventually.be.rejectedWith(/copy-text/);
  });

  it('requires text-element', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "layout": "responsive",
      "height": "100px",
      "width": "300px"
    }).should.eventually.be.rejectedWith(/text-element/);
  });

  it('requires text-element to be "input" or "textarea"', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "span",
      "layout": "responsive",
      "height": "100px",
      "width": "300px"
    }).should.eventually.be.rejectedWith(/textarea/);
  });

  it('should focus on displayedText_ when copy button is clicked', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "input",
      "height": "100px",
      "width": "300px"
    }).then(ampCopy => {
      expect(ampCopy).to.exist;
      let copyButton = ampCopy.getElementsByClassName("amp-copy-button")[0];
      copyButton.click();
      let copyText = ampCopy.getElementsByClassName("amp-copy-input")[0];
      expect(getIframeDocument().activeElement).to.equal(copyText);
    });
  });

  it('should hide copy button when copy button is clicked', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "input",
      "height": "100px",
      "width": "300px"
    }).then(ampCopy => {
      expect(ampCopy).to.exist;
      let copyButton = ampCopy.getElementsByClassName("amp-copy-button")[0];
      copyButton.click();
      expect(ampCopy.getElementsByClassName("amp-copy-button").length)
        .to.be.below(1);
    });
  });

  it('should show copy notification when copy button is clicked', () => {
    return getAmpCopy({
      "copy-text": "amp-copy test",
      "text-element": "input",
      "height": "100px",
      "width": "300px"
    }).then(ampCopy => {
      expect(ampCopy).to.exist;
      let copyButton = ampCopy.getElementsByClassName("amp-copy-button")[0];
      copyButton.click();
      expect(ampCopy.getElementsByClassName("amp-copy-notification").length)
        .to.be.above(0);
    });
  });
});
