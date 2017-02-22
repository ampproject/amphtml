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

import '../../../amp-carousel/0.1/amp-carousel';
import {installBindForTesting} from '../bind-impl';
import {toggleExperiment} from '../../../../src/experiments';
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {createFixtureIframe} from '../../../../testing/iframe';
import {bindForDoc} from '../../../../src/bind';
import {installDocService} from '../../../../src/service/ampdoc-impl';

describe.configure().retryOnSaucelabs().run('integration amp-bind', () => {
  let iframe;
  let bind;
  const fixture = 'test/fixtures/amp-bind-integrations.html';

  beforeEach(() => {
    return createFixtureIframe(fixture).then(i => {
      iframe = i;
      const ampdocService = installDocService(iframe.win, true);
      const ampdoc = ampdocService.getAmpDoc(iframe.doc);
      iframe.ampdoc = ampdoc;
      chunkInstanceForTesting(iframe.ampdoc);
      toggleExperiment(iframe.win, 'amp-bind', true, true);
      bind = installBindForTesting(iframe.ampdoc);
      return iframe.ampdoc.whenReady();
    }).then(() => {
      return bind.waitForScanForTesting_();
    });
  });

  function waitForBindApplication() {
    return bindForDoc(iframe.ampdoc).then(() => {
      return bind.waitForBindApplicationForTesting_();
    });
  }

  //TODO(kmh287): Set all 'on' attributes in the test for clarity?
  function setButtonBinding(button, binding) {
    button.setAttribute('on', `tap:AMP.setState(${binding})`);
  }

  describe('amp-bind text integration', () => {
    it('should update text when text attribute binding changes', () => {
      const textElement = iframe.doc.getElementById('textElement');
      const button = iframe.doc.getElementById('mutateTextButton');
      expect(textElement.innerHTML).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.innerHTML).to.equal('hello world');
      });
    });

    it('should update CSS class when class binding changes', () => {
      const textElement = iframe.doc.getElementById('textElement');
      const button = iframe.doc.getElementById('mutateTextButton');
      expect(textElement.className).to.equal('original');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.className).to.equal('new');
      });
    });
  });

  describe('amp-bind amp-carousel integration', () => {
    it('should update dependent bindings on carousel slide changes', () => {
      const slideNum = iframe.doc.getElementById('slideNum');
      const carousel = iframe.doc.getElementById('carousel');
      const impl = carousel.implementation_;
      expect(slideNum.innerHTML).to.equal('0');
      impl.go(1, false /* animate */);
      return waitForBindApplication().then(() => {
        expect(slideNum.innerHTML).to.equal('1');
      });
    });

    it('should change slides when the slide attribute binding changes', () => {
      const carousel = iframe.doc.getElementById('carousel');
      const goToSlide1Button = iframe.doc.getElementById('goToSlide1Button');
      const impl = carousel.implementation_;
      // No previous slide as current slide is 0th side
      expect(impl.hasPrev()).to.be.false;
      goToSlide1Button.click();
      return waitForBindApplication().then(() => {
        // Has previous slide since the index has changed
        expect(impl.hasPrev()).to.be.true;
      });
    });
  });

  describe('amp-bind amp-img integration', () => {
    it('should change src when the src attribute binding changes', () => {
      const changeImgButton = iframe.doc.getElementById('changeImgButton');
      const img = iframe.doc.getElementById('image');
      expect(img.getAttribute('src')).to.equal('https://lh3.googleusercontent' +
        '.com/5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no');
      changeImgButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to.equal('https://lh3' +
          '.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9O' +
          'EIQ_QXcbubWIOdkY=w400-h300-no');
      });
    });

    it('should NOT change src when new value is a blocked URL', () => {
      const changeImgButton = iframe.doc.getElementById('changeImgButton');
      const img = iframe.doc.getElementById('image');
      const originalSrc = 'https://lh3.googleusercontent.com/' +
        '5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      expect(img.getAttribute('src')).to.equal(originalSrc);
      const newSrc = '__amp_source_origin';
      const blockedURLBinding = `imageSrc="${newSrc}"`;
      setButtonBinding(changeImgButton, blockedURLBinding);
      changeImgButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to.equal(originalSrc);
      });
    });

    it('should NOT change src when new value uses an invalid protocol', () => {
      const changeImgButton = iframe.doc.getElementById('changeImgButton');
      const img = iframe.doc.getElementById('image');
      const originalSrc = 'https://lh3.googleusercontent.com/' +
        '5rcQ32ml8E5ONp9f9-Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      expect(img.getAttribute('src')).to.equal(originalSrc);
      const ftpSrc = 'ftp://foo:bar@192.168.1.1/lol.jpg';
      const ftpBinding = `imageSrc="${ftpSrc}"`;
      setButtonBinding(changeImgButton, ftpBinding);
      changeImgButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to.equal(originalSrc);
        const telSrc = 'tel:1-555-867-5309';
        const telBinding = `imageSrc="${telSrc}"`;
        setButtonBinding(changeImgButton, telBinding);
        changeImgButton.click();
        return waitForBindApplication();
      }).then(() => {
        expect(img.getAttribute('src')).to.equal(originalSrc);
      });
    });

    it('should change alt when the alt attribute binding changes', () => {
      const changeImgButton = iframe.doc.getElementById('changeImgButton');
      const img = iframe.doc.getElementById('image');
      expect(img.getAttribute('alt')).to.equal('unbound');
      changeImgButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('alt')).to.equal('hello world');
      });
    });

    it('should change width and height when their bindings change', () => {
      const changeImgDimensButton =
        iframe.doc.getElementById('changeImgDimensButton');
      const img = iframe.doc.getElementById('image');
      expect(img.getAttribute('height')).to.equal('200');
      expect(img.getAttribute('width')).to.equal('200');
      changeImgDimensButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('height')).to.equal('300');
        expect(img.getAttribute('width')).to.equal('300');
      });
    });
  });

});
