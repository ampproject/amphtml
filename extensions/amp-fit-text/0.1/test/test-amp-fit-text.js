/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Timer} from '../../../../src/timer';
import {createIframePromise} from '../../../../testing/iframe';
require('../../../../build/all/v0/amp-fit-text-0.1.max');
import {calculateFontSize_} from '../../../../build/all/v0/amp-fit-text-0.1.max';
import {adopt} from '../../../../src/runtime';

adopt(window);


describe('amp-fit-text component', () => {

  function getFitText(text, opt_responsive) {
    return createIframePromise().then(iframe => {
      var ft = iframe.doc.createElement('amp-fit-text');
      ft.setAttribute('width', '111');
      ft.setAttribute('height', '222');
      ft.style.fontFamily = 'Arial';
      ft.style.fontSize = '17px';
      ft.style.lineHeight = '17px';
      ft.style.overflow = 'hidden';
      ft.style.width = '111px';
      ft.style.height = '222px';
      ft.style.position = 'relative';
      if (opt_responsive) {
        ft.setAttribute('layout', 'responsive');
      }
      ft.textContent = text;
      iframe.doc.body.appendChild(ft);
      return new Timer(window).promise(16).then(() => {
        ft.implementation_.layoutCallback();
        return ft;
      });
    });
  }

  it('renders', () => {
    var text = 'Lorem ipsum';
    return getFitText(text).then(ft => {
      var content = ft.querySelector('.-amp-fit-text-content');
      expect(content).to.not.equal(null);
      expect(content.textContent).to.equal(text);
    });
  });

});


describe('amp-fit-text calculateFontSize', () => {

  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.fontFamily = 'Arial';
    element.style.lineHeight = '1em';
    element.style.position = 'relative';
    element.style.width = '200px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should always fit on one line', () => {
    element.innerHTML = 'A';
    expect(calculateFontSize_(element, 20, 6, 72)).to.equal(20);
    expect(calculateFontSize_(element, 10, 6, 72)).to.equal(10);
    expect(calculateFontSize_(element, 40, 6, 72)).to.equal(40);
  });

  it('should hit min', () => {
    element.innerHTML = 'A';
    expect(calculateFontSize_(element, 6, 6, 72)).to.equal(6);
    expect(calculateFontSize_(element, 3, 6, 72)).to.equal(6);
  });

  it('should hit max', () => {
    element.innerHTML = 'A';
    expect(calculateFontSize_(element, 72, 6, 72)).to.equal(72);
    expect(calculateFontSize_(element, 80, 6, 72)).to.equal(72);
  });

  it('should always fit on two lines', () => {
    element.innerHTML = 'A<br>B';
    expect(calculateFontSize_(element, 20, 6, 72)).to.equal(10);
  });
});
