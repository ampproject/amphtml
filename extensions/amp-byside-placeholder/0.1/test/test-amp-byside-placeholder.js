/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpBysidePlaceholder} from '../amp-byside-placeholder';

describes.realWin('amp-byside-placeholder', {
  amp: {
    extensions: ['amp-byside-placeholder'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getElement(data, opts) {
    const elem = doc.createElement('amp-byside-placeholder');
    elem.setAttribute('data-label', data.label || '');
    elem.setAttribute('data-webcareId', data.webcareId || '');
    elem.setAttribute('width', '111');
    elem.setAttribute('height', '222');
    elem.setAttribute('alt', 'Testing BySide Placeholder');

    doc.body.appendChild(elem);
    return elem.build().then(() => {
      return elem.layoutCallback();
    }).then(() => elem);
  }

  function testIframe(iframe, elem, data) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.startsWith(elem.baseURL_);
  }

  it('renders', () => {
    const data = {label: 'amp', webcareId: 'F15B000CB5'};
    const attr = {};

    return getElement(data, attr).then(elem => {
      testIframe(elem.querySelector('iframe'), elem, data);
    });
  });

  it('requires data-label', () => {
    const data = {webcareId: 'xxxx'};
    const attr = {};

    expect(getElement(data, attr)).to.be.rejectedWith(
        /The data-label attribute is required for/);
  });

  it('requires data-webcareId', () => {
    const data = {label: 'placholder-label'};
    const attr = {};

    expect(getElement(data, attr)).to.be.rejectedWith(
        /The data-webcareId attribute is required for/);
  });
});
