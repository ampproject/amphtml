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
import {installAmpdocServices,} from '../../../../src/runtime';

describe('integration amp-bind', () => {
  let iframe;
  let bind;
  const fixture = 'test/fixtures/amp-bind-integrations.html'

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

  describe('amp-bind text integration', () => {
    it('should update text when text attribute binding changes', () => {
      const textElement = iframe.doc.getElementById('textElement');
      const button = iframe.doc.getElementById('boundTextButton');
      expect(textElement.innerHTML).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.innerHTML).to.equal('hello world');
      })
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
      const slideNum = iframe.doc.getElementById('slideNum');
      const carousel = iframe.doc.getElementById('carousel');
      const goToSlide1Button = iframe.doc.getElementById('goToSlide1Button');
      const impl = carousel.implementation_;
      expect(impl.slideIndex_).to.equal(0);
      goToSlide1Button.click();
      return waitForBindApplication().then(() => {
        expect(impl.slideIndex_).to.equal(1);
      });
    });
  });



});
