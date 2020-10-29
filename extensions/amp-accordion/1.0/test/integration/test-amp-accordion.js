/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {waitFor} from '../../../../../testing/test-helper';

describe
  .configure()
  .skipEdge()
  .run('amp-accordion', function () {
    this.timeout(10000);
    const extensions = ['amp-accordion', 'amp-bind'];
    const body = `
  <amp-accordion media="(min-width: 500px)" id="media-accordion">
    <section >
      <h1>
        Title
      </h1>
      <p>Bunch of awesome content</p>
    </section>
  </amp-accordion>
  <div>
    <button on="tap:AMP.setState({section: true})"></button>
    <button on="tap:AMP.setState({section: false})"></button>
</div>
  `;
    describes.integration(
      'amp-accordion',
      {
        body,
        extensions,
      },
      (env) => {
        let win, iframe, doc;
        beforeEach(() => {
          win = env.win;
          iframe = env.iframe;
          doc = win.document;
          iframe.width = 300;
        });

        it('should respect the media attribute', async () => {
          const accordion = doc.getElementById('media-accordion');
          expect(iframe.clientWidth).to.equal(300);
          expect(accordion.className).to.match(
            /i-amphtml-hidden-by-media-query/
          );
          iframe.width = 600;
          expect(iframe.clientWidth).to.equal(600);
          return timeout(200).then(() => {
            expect(accordion.className).to.not.match(
              /i-amphtml-hidden-by-media-query/
            );
          });
        });

        it('should expand and collapse section with amp-bind', async () => {
          const accordion = doc.getElementById('media-accordion');
          const section = accordion.children[0];
          section.setAttribute('data-amp-bind-expanded', 'section');

          const button1 = doc.createElement('button');
          const button2 = doc.createElement('button');
          button1.setAttribute('on', 'tap:AMP.setState({section1: true})');
          button2.setAttribute('on', 'tap:AMP.setState({section1: false})');
          doc.appendChild(button1);
          doc.appendChild(button2);

          async function waitForBindExpanded(el, expanded) {
            const isExpandedOrNot = () =>
              el.lastElementChild.hidden === !expanded;
            await waitFor(isExpandedOrNot, 'element expanded updated');
          }

          expect(section.lastElementChild).to.have.attribute('hidden');
          button1.click();
          await waitForBindExpanded(section, true);
          expect(section.lastElementChild).to.not.have.attribute('hidden');

          button2.click();
          await waitForBindExpanded(section, false);
          expect(section.lastElementChild).to.have.attribute('hidden');
        });
      }
    );
  });

/**
 * @param {number} ms
 * @return {!Promise}
 */
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
