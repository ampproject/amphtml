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

import '../amp-byside-placeholder';

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

  function getElement(data, attr) {
    const elem = doc.createElement('amp-byside-placeholder');
    elem.setAttribute('data-label', data.label || '');
    if (attr.label) {
      elem.setAttribute('label', attr.label);
    }
    elem.setAttribute('data-webcare-id', data.webcareId || '');
    if (attr.webcareId) {
      elem.setAttribute('webcare-id', attr.webcareId);
    }
    elem.setAttribute('width', attr.width || '111');
    elem.setAttribute('height', attr.height || '222');
    elem.setAttribute('alt', attr.alt || 'Testing BySide Placeholder');

    if (attr.resizable) {
      elem.setAttribute('resizable');
    }

    doc.body.appendChild(elem);

    return elem.build().then(() => elem.layoutCallback()).then(() => elem);
  }

  it('renders', () => {
    const data = {label: 'amp-simple', webcareId: 'D6604AE5D0'};
    const attr = {};

    return getElement(data, attr).then(elem => {
      const iframe = elem.querySelector('iframe');

      expect(iframe).to.not.be.null;
      expect(iframe.fakeSrc).to.satisfy(src => {
        return src.startsWith(elem.implementation_.baseUrl_);
      });
    });
  });

  it('requires data-label', () => {
    const data = {webcareId: 'D6604AE5D0'};
    const attr = {};

    expect(getElement(data, attr)).to.eventually.be.rejectedWith(
        /The data-label attribute is required for/);
  });

  it('requires data-webcare-id', () => {
    const data = {label: 'placholder-label'};
    const attr = {};

    expect(getElement(data, attr)).to.eventually.be.rejectedWith(
        /The data-webcare-id attribute is required for/);
  });

  it('generates correct default origin', () => {
    const data = {
      label: 'placholder-label',
      webcareId: 'D6604AE5D0',
    };
    const attr = {};

    expect(getElement(data, attr)).to.eventually.satisfy(function(elem) {
      return elem.implementation_.origin_ === 'https://webcare.byside.com';
    });
  });

  it('generates correct provided agent domain', () => {
    const agentDomain = 'sa1';
    const data = {
      label: 'placholder-label',
      webcareId: 'D6604AE5D0',
      agentDomain,
    };
    const attr = {};

    expect(getElement(data, attr)).to.eventually.satisfy(function(elem) {
      return elem.implementation_.origin_ === 'https://' + agentDomain + '.byside.com';
    });
  });
});
