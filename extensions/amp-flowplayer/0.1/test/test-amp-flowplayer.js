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

import '../amp-flowplayer';
import { htmlFor } from "../../../../src/static-template"

describes.realWin('amp-flowplayer', {
  amp: {
    extensions: ['amp-flowplayer'],
  },
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getFlowplayer(attributes) {
    const fp = doc.createElement('amp-flowplayer');
    for (const key in attributes) {
      fp.setAttribute(key, attributes[key]);
    }
    fp.setAttribute('width', '320');
    fp.setAttribute('height', '180');
    fp.setAttribute('layout', 'responsive');
    const html = htmlFor(env.win.document);
    env.sandbox
      .stub(env.ampdoc.getHeadNode(), 'querySelector')
      .withArgs('meta[property="og:title"]')
      .returns(
        html`
          <meta property="og:title" content="title_tag" />
        `
      );
    doc.body.appendChild(fp);
    return fp.build().then(() => {
      fp.layoutCallback();
      return fp;
    });
  }

  it('renders', async () => {
    const fp = await getFlowplayer({
      'data-id': 'cad9d975-ccae-4757-88a3-a65ebb7419f8',
      'data-pid': 'cad9d975-ccae-4757-88a3-a65ebb7419f8',
    });
    const iframe = fp.querySelector('iframe');
    expect(iframe).to.not.be.null;
    expect(iframe.tagName).to.equal('IFRAME');
    expect(iframe.src).to.equal(
      'https://ljsp.lwcdn.com/api/video/embed.jsp?id=cad9d975-ccae-4757-88a3-a65ebb7419f8&pid=cad9d975-ccae-4757-88a3-a65ebb7419f8'
    );
    expect(iframe.className).to.match(/i-amphtml-fill-content/);
  });
});
