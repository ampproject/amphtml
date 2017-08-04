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

describes.sandboxed('alt nameframe', {}, () => {
  describes.realWin('nameframe', {allowExternalResources: true}, env => {
    let fixture;
    let win;
    let doc;
    let iframe;
    beforeEach(() => {
      fixture = env;
      win = fixture.win;
      doc = win.document;
      iframe = doc.createElement('iframe');
      iframe.src = 'http://localhost:9876/dist.3p/current/nameframe.max.html';
    });

    it('should load remote nameframe and succeed w/ valid JSON', () => {
      let messageContent;
      iframe.name = JSON.stringify({
        creative: `<html>
                   <body>
                     <script>
                       window.parent.postMessage(
                               {type: 'creative rendered'}, '*');
                     </script>
                   </body>
                   </html>`,
      });
      doc.body.appendChild(iframe);
      return new Promise(resolve => {
        win.addEventListener('message', content => {
          messageContent = content;
          resolve();
        });
      }).then(() => {
        expect(messageContent.data.type).to.equal('creative rendered');
      });
    });

    it('should fail if JSON is not paresable', done => {
      iframe.name = 'not valid JSON';
      expectNoContent(win, done);
      doc.body.appendChild(iframe);
    });

    it('should fail if JSON is valid, but missing creative field', done => {
      iframe.name = JSON.stringify({fnord: 'some meaningless data'});
      expectNoContent(win, done);
      doc.body.appendChild(iframe);
    });

    it('should fail if JSON is missing altogether', done => {
      iframe.name = null;
      expectNoContent(win, done);
      doc.body.appendChild(iframe);
    });
  });
});

function expectNoContent(win, done) {
  win.addEventListener('message', content => {
    expect(content.data).to.have.property('type');
    expect(content.data.type).to.equal('no-content');
    done();
  });
}
