/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-overflow-button';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin(
  'amp-overflow-button',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-overflow-button'],
    },
  },
  (env) => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
    });

    it('should contain "See more" when built without cta attribute', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-overflow-button',
        {}
      );
      win.document.body.appendChild(element);

      await element.whenBuilt();
      expect(element.querySelector('button').textContent).to.equal('See more');
    });

    it('should have the default color when built without color attribute', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-overflow-button',
        {}
      );
      win.document.body.appendChild(element);

      await element.whenBuilt();
      expect(element.querySelector('button').getAttribute('style')).to.equal(
        'color: #0058FF; border: 2px solid #0058FF;'
      );
    });

    it('should contain "Show more" when built with cta attribute set to "Show more"', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-overflow-button',
        {
          cta: 'Show more',
        }
      );
      win.document.body.appendChild(element);

      await element.whenBuilt();
      expect(element.querySelector('button').textContent).to.equal('Show more');
    });

    it('should have the color "#B80000" when built with color attribute set to "#B80000"', async () => {
      element = createElementWithAttributes(
        win.document,
        'amp-overflow-button',
        {
          color: '#B80000',
        }
      );
      win.document.body.appendChild(element);

      await element.whenBuilt();
      expect(element.querySelector('button').getAttribute('style')).to.equal(
        'color: #B80000;  border-color: #B80000;'
      );
    });
  }
);
