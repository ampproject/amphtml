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

import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';
import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';
import {getBuildDom} from '../../../src/preact/build-dom';

const spec = {amp: true, frameStyle: {width: '300px'}};

describes.realWin('collectProps', spec, (env) => {
  let win, doc, html;
  let Impl, component, lastProps;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    html = htmlFor(doc);

    Impl = class extends PreactBaseElement {};
    Impl['loadable'] = true;
    Impl['unloadOnPause'] = true;
    Impl['props'] = {
      'captioned': {attr: 'data-captioned'},
      'shortcode': {attr: 'data-shortcode'},
      'title': {attr: 'title'},
      'minFontSize': {attr: 'min-font-size', type: 'number', media: true},
    };
    Impl['usesShadowDom'] = true;
    Impl['layoutSizeDefined'] = true;

    component = env.sandbox.stub().callsFake((props) => {
      lastProps = props;
      return Preact.createElement('div', {id: 'component'});
    });
    Impl['Component'] = component;
  });

  it('should collect props', () => {
    const el = createElementWithAttributes(doc, 'amp-element', {
      'data-shortcode': 'fBwFP',
      'min-font-size': '(max-width: 301px) 72, 84',
      'title': 'Testing testing 123',
      'width': '381',
      'height': '381',
      'layout': 'responsive',
    });
    const props = getBuildDom(Impl, doc, el);
    console.error(JSON.stringify(props));
  });
});
