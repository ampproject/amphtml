/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

describes.sandboxed('nameframe', {}, () => {
  describes.realWin('frame load', {}, env => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should load from ampproject.net', () => {
      win.addEventListener('message', event => {
        console.log('Got message', event);
      }, false);
      const domain = win.location.origin;
      const iframe = doc.createElement('iframe');
      iframe.src = 'https://3p.ampproject.net/nameframe.html';
      iframe.name = `<html>
<body>
<script>
window.parent.postMessage('creative rendered', ${domain});
console.log('sending message');
</script>
</body>
</html>`;
      doc.body.appendChild(iframe);
    });

  });
});
