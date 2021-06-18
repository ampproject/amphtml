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
    expect(el.innerHTML).equals(
      `<div style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; contain: strict;"><div style="position: relative; width: 100%; height: 100%; overflow: hidden;"><iframe allowtransparency="true" frameborder="0" loading="auto" part="iframe" scrolling="no" src="https://www.instagram.com/p/fBwFP/embed/?cr=1&amp;v=12" title="Testing testing 123" style="opacity: 0; width: 100%; height: 100%; content-visibility: auto;"></iframe></div></div>`
    );
  });
});
