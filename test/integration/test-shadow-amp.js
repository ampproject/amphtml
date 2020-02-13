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
      <!-- minified src for single-pass-tests.js -->
      <script async src="/dist/shadow-v0.js"></script>
      <div id="host"></div>
      <script>
        function parseDoc() {
          return new DOMParser().parseFromString(\`
            <!doctype html>
            <html amp lang="en">
              <head>
                <meta charset="utf-8">
                <script async src="https://cdn.ampproject.org/v0.js"></script>
                <title>Hello, AMPs</title>
                <link rel="canonical" href="https://amp.dev/documentation/guides-and-tutorials/start/create/basic_markup/">
                <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
                <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
              </head>
              <body>
                <h1>Shadow AMP document</h1>
                <amp-img src="https://placekitten.com/640/480" layout="responsive" width="640" height="480"></amp-img>
              </body>
            </html>
          \`, 'text/html');
        }
        (window.AMP = window.AMP || []).push(() => {
          const host = document.getElementById('host');
          AMP.attachShadowDoc(host, parseDoc(), testUrl));
        });
      </script>
    `,
  },
  env => {
    let docController;
    let shadowDoc;

    beforeEach(async () => {
      docController = new BrowserController(env.win);
      await docController.waitForShadowRoot('#host', 15000);
      shadowDoc = env.win.document.getElementById('host').shadowRoot;
    });

    it('should attach shadow AMP document', () => {
      return expect(shadowDoc.body.innerText).to.include('Shadow AMP document');
    });

    it('should layout amp-img component in shadow AMP document', async () => {
      const shadowDocController = new BrowserController(env.win, shadowDoc);
      await shadowDocController.waitForElementLayout('amp-img');
      return expect(
        shadowDoc.querySelectorAll('amp-img img[src]')
      ).to.have.length(1);
    });
  }
);
