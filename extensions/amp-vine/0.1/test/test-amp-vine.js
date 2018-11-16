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

import '../amp-vine';


describes.realWin('amp-vine', {
  amp: {
    extensions: ['amp-vine'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getVine(vineId, opt_responsive) {
    const vine = doc.createElement('amp-vine');
    vine.setAttribute('data-vineid', vineId);
    vine.setAttribute('width', 400);
    vine.setAttribute('height', 400);
    if (opt_responsive) {
      vine.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(vine);
    return vine.build().then(() => vine.layoutCallback()).then(() => vine);
  }

  it('renders', () => {
    return getVine('MdKjXez002d').then(vine => {
      const iframe = vine.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://vine.co/v/MdKjXez002d/embed/simple');
    });
  });

  it('renders responsively', () => {
    return getVine('MdKjXez002d', true).then(vine => {
      const iframe = vine.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('requires data-vineid', () => {
    return getVine('').should.eventually.be.rejectedWith(
        /The data-vineid attribute is required for/);
  });
});
