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
import {ampdocServiceFor} from '../../../../src/ampdoc';

describe.configure().retryOnSaucelabs().run('integration amp-bind', function() {
  let iframe;
  let ampdoc;
  let bind;
  const fixture = 'test/fixtures/amp-bind-integrations.html';

  this.timeout(5000);

  beforeEach(() => {

    return createFixtureIframe(fixture).then(i => {
      iframe = i;
      toggleExperiment(iframe.win, 'amp-bind', true, true);
      return iframe.awaitEvent('amp:load:start', 1);
    }).then(() => {
      const ampdocService = ampdocServiceFor(iframe.win);
      ampdoc = ampdocService.getAmpDoc(iframe.doc);
      chunkInstanceForTesting(ampdoc);
      bind = installBindForTesting(ampdoc);
      return bind.initializePromiseForTesting();
    });
  });

  function waitForBindApplication() {
    return bindForDoc(ampdoc).then(() => {
      return bind.setStatePromiseForTesting();
    });
  }

  describe('text integration', () => {
    it('should update text when text attribute binding changes', () => {
      const textElement = iframe.doc.getElementById('textElement');
      const button = iframe.doc.getElementById('mutateTextButton');
      expect(textElement.textContent).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.textContent).to.equal('hello world');
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

  describe('amp-carousel integration', () => {
    it('should update dependent bindings on carousel slide changes', () => {
      const slideNum = iframe.doc.getElementById('slideNum');
      const carousel = iframe.doc.getElementById('carousel');
      const impl = carousel.implementation_;
      expect(slideNum.textContent).to.equal('0');
      impl.go(1, false /* animate */);
      return waitForBindApplication().then(() => {
        expect(slideNum.textContent).to.equal('1');
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

});
