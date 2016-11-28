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

import {createIframePromise} from '../../testing/iframe';

// Is there a way to mark this .skip?  Neither describes.skip.sandboxed
// nor describes.sandboxed.skip works.
describes.sandboxed('alt nameframe', {}, () => {
  describes.realWin('nameframe', {}, env => {
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
      // Fails here.  srcdoc is not empty, so this iframe doesn't behave like a
      // cross-origin iframe.
      expect(iframe.getAttribute('srcdoc')).not.to.be.ok;
    });

    it('should load remote nameframe and succeed', done => {
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
      win.addEventListener('message', content => {
        expect(content.data.type).to.equal('creative rendered');
        done();
      });
      doc.body.appendChild(iframe);
    });
  });
});

describes.sandboxed('nameframe', {}, () => {
  let fixture;
  let win;
  let doc;
  let iframe;
  beforeEach(() => {
    return createIframePromise(/* runtimeOff */ true).then(f => {
      fixture = f;
      win = fixture.win;
      doc = fixture.doc;
      iframe = doc.createElement('iframe');
      iframe.src = 'http://localhost:9876/dist.3p/current/nameframe.max.html';
    });
  });

  it('should load remote nameframe and succeed with valid JSON input', done => {
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
    win.addEventListener('message', content => {
      expect(content.data.type).to.equal('creative rendered');
      done();
    });
    doc.body.appendChild(iframe);
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

function expectNoContent(win, done) {
  win.addEventListener('message', content => {
    expect(content.data).to.have.property('type');
    expect(content.data.type).to.equal('no-content');
    done();
  });
}
