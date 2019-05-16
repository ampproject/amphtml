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

describe('amp-accordion', function() {
  this.timeout(10000);
  const extensions = ['amp-accordion'];
  const body = `
  <amp-accordion media="(min-width: 500px)" id="media-accordion">
    <section>
      <h1>
        Title
      </h1>
      <p>Bunch of awesome content</p>
    </section>
  </amp-accordion>
  `;
  describes.integration(
    'amp-accordion',
    {
      body,
      extensions,
    },
    env => {
      let win, iframe, doc;
      beforeEach(() => {
        win = env.win;
        iframe = env.iframe;
        doc = win.document;
        iframe.width = 300;
      });

      it('should respect the media attribute', () => {
        const accordion = doc.getElementById('media-accordion');
        expect(iframe.clientWidth).to.equal(300);
        expect(accordion.className).to.match(/i-amphtml-hidden-by-media-query/);
        iframe.width = 600;
        expect(iframe.clientWidth).to.equal(600);
        return timeout(200).then(() => {
          expect(accordion.className).to.not.match(
            /i-amphtml-hidden-by-media-query/
          );
        });
      });
    }
  );
});

/**
 * @param {number} ms
 * @return {!Promise}
 */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
