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


describe.configure().ifNewChrome().run('amp-pan-zoom', function() {
  this.timeout(10000);
  const extensions = ['amp-pan-zoom'];
  const experiments = ['amp-pan-zoom'];
  const body = `
  <amp-pan-zoom id="amp-pan-zoom" layout="fixed" width="300" height="241">
    <amp-img id="img0"
      src="/examples/img/sample.jpg"
      width="641" height="481" layout="fixed"></amp-img>
  </amp-pan-zoom>
  `;
  describes.integration('amp-pan-zoom basic functionality', {
    body,
    extensions,
    experiments,
  }, env => {
    let win, doc, panZoom;
    beforeEach(() => {
      win = env.win;
      win.AMP_MODE.localDev = true;
      doc = win.document;
      panZoom = doc.getElementById('amp-pan-zoom');
      return panZoom.build().then(() => {
        return panZoom.layoutCallback();
      });
    });

    it('should build correctly', () => {
      expect(panZoom.children.length).to.equal(1);
      const content = panZoom.children[0];
      expect(content.classList.contains('i-amphtml-pan-zoom-child')).to.be.true;
    });

    it('should resize and center content', () => {
      const content = panZoom.children[0];
      expect(content.style.width).to.equal('300px');
      // 481 / 641 * 300 = 225
      expect(content.style.height).to.equal('225px');
      // (240 - 225) / 2 = 8
      expect(content.style.top).to.equal('8px');
      expect(content.style.left).to.equal('0px');
    });

  });

  const bodyWithConfigs = `
    <amp-pan-zoom id="amp-pan-zoom"
      initial-x="10"
      initial-y="5"
      initial-scale="2"
      max-scale="5"
      layout="fixed"
      width="300"
      height="240">
      <amp-img id="img0"
        src="/examples/img/sample.jpg"
        width="641" height="481" layout="fixed"></amp-img>
    </amp-pan-zoom>`;

  describes.integration('amp-pan-zoom basic functionality', {
    body: bodyWithConfigs,
    extensions,
    experiments,
  }, env => {
    let win, doc, panZoom;
    beforeEach(() => {
      win = env.win;
      win.AMP_MODE.localDev = true;
      doc = win.document;
      panZoom = doc.getElementById('amp-pan-zoom');
      return panZoom.build().then(() => {
        return panZoom.layoutCallback();
      });
    });

    it('should apply initial configurations correctly', () => {
      const content = panZoom.children[0];
      expect(content.style.transform).to.equal('translate(10px, 5px) scale(2)');
    });
  });
});

