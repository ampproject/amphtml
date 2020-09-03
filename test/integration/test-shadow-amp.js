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
import {BrowserController} from '../../testing/test-helper';

describes.integration(
  'AMP shadow v0',
  {
    amp: false,
    body: `
      <!-- unminified src for local-tests.js -->
      <script async src="/dist/amp-shadow.js"></script>
      <script async src="/dist/shadow-v0.js"></script>
      <div id="host"></div>
      <script>
        function fetchDocument(url) {
          var xhr = new XMLHttpRequest();
          return new Promise((resolve, reject) => {
            xhr.open('GET', url, true);
            xhr.responseType = 'document';
            xhr.setRequestHeader('Accept', 'text/html');
            xhr.onload = () => resolve(xhr.responseXML);
            xhr.send();
          });
        }

        (window.AMP = window.AMP || []).push(() => {
          const host = document.getElementById('host');
          const testUrl = 'http://localhost:9876/test/fixtures/served/shadow.html';
          fetchDocument(testUrl).then(doc => AMP.attachShadowDoc(host, doc, testUrl));
        });
      </script>
    `,
  },
  (env) => {
    let docController;
    let shadowDoc;

    beforeEach(async () => {
      docController = new BrowserController(env.win);
      await docController.waitForShadowRoot('#host', 25000);
      shadowDoc = env.win.document.getElementById('host').shadowRoot;
    });

    // TODO(kevinkimball, #26863): Flaky on Safari.
    it.configure().skipSafari('should attach shadow AMP document', () => {
      return expect(shadowDoc.body.innerText).to.include('Shadow AMP document');
    });

    // TODO(kevinkimball, #26863): Flaky on Safari.
    it.configure().skipSafari(
      'should layout amp-img component in shadow AMP document',
      async () => {
        const shadowDocController = new BrowserController(env.win, shadowDoc);
        await shadowDocController.waitForElementLayout('amp-img');
        return expect(
          shadowDoc.querySelectorAll('amp-img img[src]')
        ).to.have.length(1);
      }
    );
  }
);
