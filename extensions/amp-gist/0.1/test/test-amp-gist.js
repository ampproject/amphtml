/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-gist';


describes.realWin('amp-gist', {
  amp: {
    extensions: ['amp-gist'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getIns(gistid, file) {
    const ins = doc.createElement('amp-gist');
    ins.setAttribute('data-gistid', gistid);
    ins.setAttribute('height', '237');
    if (file) {
      ins.setAttribute('data-file', file);
    }
    doc.body.appendChild(ins);
    return ins.build().then(() => ins.layoutCallback()).then(() => ins);
  }

  it('renders responsively', () => {
    return getIns('b9bb35bc68df68259af94430f012425f').then(ins => {
      const iframe = ins.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('renders responsively with specific file', () => {
    return getIns('b9bb35bc68df68259af94430f012425f', 'hello-world.html')
        .then(ins => {
          const iframe = ins.querySelector('iframe');
          expect(iframe).to.not.be.null;
          expect(iframe.className).to.match(/i-amphtml-fill-content/);
        });
  });

  it('Rejects because data-gistid is missing', () => {
    expect(getIns('')).to.be.rejectedWith(
        /The data-gistid attribute is required for/);
  });
});
