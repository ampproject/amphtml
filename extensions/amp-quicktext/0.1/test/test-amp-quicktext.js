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

import '../amp-quicktext';

describes.realWin(
  'amp-quicktext',
  {
    amp: {
      extensions: ['amp-quicktext'],
    },
  },
  env => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
      element = win.document.createElement('amp-quicktext');
      element.setAttribute('license', '8mxHy-jBUk');
      element.setAttribute('tags', 'amp-demo,test');
      element.setAttribute('layout', 'nodisplay');
      win.document.body.appendChild(element);
    });

    it('should render component', () => {
      win = env.win;
      element.build();
      expect(element).to.be.ok;
    });

    it('should pass attributes', () => {
      element.build();
      expect(element.hasAttribute('license')).to.equal(true);
      expect(element.hasAttribute('lang')).to.equal(false);
      expect(element.hasAttribute('tags')).to.equal(true);
      expect(element.hasAttribute('url')).to.equal(false);
    });
  }
);
