/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-css-validator';

describes.realWin(
  'amp-css-validator',
  {
    amp: {
      extensions: ['amp-css-validator'],
    },
  },
  env => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
    });

    function buildAmpCssValidator() {
      element = win.document.createElement('amp-css-validator');
      element.setAttribute('layout', 'nodisplay');
      element.setAttribute('width', '0');
      element.setAttribute('height', '0');
      env.win.document.body.appendChild(element);
      return element.build().then(() => element);
    }

    it('should warn unused styles', () => {
      win = env.win;
      const style = win.document.createElement('style');
      const unusedStyleElement = win.document.createElement('div');
      style.setAttribute('amp-custom', '');
      style.innerHTML += '.amp-unused-style { font-size: 16px; }';
      win.document.head.appendChild(style);
      win.document.body.appendChild(unusedStyleElement);

      return buildAmpCssValidator(element).then(() => {
        expect(console.warn).to.have.been.called;
      });
    });

    it('should not warn used styles', () => {
      win = env.win;
      const style = win.document.createElement('style');
      const usedStyleElement = win.document.createElement('div');
      usedStyleElement.setAttribute('class', 'amp-used-style');
      style.setAttribute('amp-custom', '');
      style.innerHTML += '.amp-used-style { font-size: 16px; }';
      win.document.head.appendChild(style);
      win.document.body.appendChild(usedStyleElement);

      return buildAmpCssValidator(element).then(() => {
        expect(console.warn).to.have.not.been.called;
      });
    });
  }
);
