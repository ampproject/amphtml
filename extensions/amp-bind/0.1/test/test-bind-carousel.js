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
import {Bind, installBindForTesting} from '../bind-impl';
import {toggleExperiment} from '../../../../src/experiments';
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {createIframePromise} from '../../../../testing/iframe';
import {bindForDoc} from '../../../../src/bind';
import * as sinon from 'sinon';

describes.realWin('test-scrollable-carousel', {amp: 1}, unused_env => {
  let iframe;
  let slideNum;
  let carousel;
  let bind;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise().then(i => {
      iframe = i;
      iframe.width = '300';
      iframe.height = '200';

      const div = iframe.doc.createElement('div');
      // Cannot create P element directly as bind property names [*] 
      // are not considered valid element names
      div.innerHTML = '<p [text]="selectedSlide">0</p>';
      slideNum = div.firstElementChild;
      iframe.doc.getElementById('parent').appendChild(slideNum);

      div.innerHTML = '<amp-carousel width="300" height="100" type="slides"' + 
          'id="carousel" on="slideChange:AMP.setState(selectedSlide=event.index)"' + 
          '[slide]="selectedSlide">';
      carouselElement = div.firstElementChild;

      const imgUrl = 'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
          'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const slideCount = 3;
      for (let i = 0; i < slideCount; i++) {
        const img = document.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '120');
        img.setAttribute('height', '100');
        img.style.width = '120px';
        img.style.height = '100px';
        img.id = 'img-' + i;
        carouselElement.appendChild(img);
      }
      return iframe.addElement(carouselElement)
    }).then(c => {
      carousel = c;
      toggleExperiment(iframe.win, 'amp-bind', true, true);
      chunkInstanceForTesting(iframe.ampdoc);
      bind = installBindForTesting(iframe.ampdoc);
      return iframe.ampdoc.whenReady();
    }).then(() => {
      return bind.scanPromise_;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should update dependent bindings when the carousel slide changes', () => {
    const impl = carousel.implementation_;
    iframe = iframe;
    expect(slideNum.innerHTML).to.equal('0');
    const triggerSpy = sandbox.spy(impl.action_, 'trigger');
    debugger;
    impl.goCallback(1, /* animate */ false);
    expect(triggerSpy).to.have.been.calledWith(
      carousel,
      'slideChange',
      /* CustomEvent */ sinon.match.has('detail', {index: 1}));
    return bind.evaluatePromise_.then(() => {
      expect(slideNum.innerHTML).to.equal('1');
    })
  });

  it('should change slides when the slide variable binding changes', () => {

  });

});
