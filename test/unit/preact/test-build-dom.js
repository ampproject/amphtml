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

import {BaseElement as AmpInstagramBE} from '../../../extensions/amp-instagram/1.0/base-element';
import {createElementWithAttributes} from '#core/dom';
import {getBuildDom} from '#preact/build-dom';
import {expect} from 'chai';

const spec = {amp: true, frameStyle: {width: '300px'}};

describes.realWin('collectProps', spec, (env) => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should collect props', () => {
    const el = createElementWithAttributes(doc, 'amp-instagram', {
      'data-shortcode': 'fBwFP',
      'title': 'Testing testing 123',
      'width': '381',
      'height': '381',
      'layout': 'responsive',
    });

    const buildDom = getBuildDom(AmpInstagramBE);
    buildDom(doc, el);
    expect(el.innerHTML).equals(`<button>42</button>`);
  });
});
