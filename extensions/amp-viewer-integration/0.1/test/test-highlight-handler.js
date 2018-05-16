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

import {Services} from '../../../../src/services';
import {HighlightHandler} from '../highlight-handler';
import {Messaging, WindowPortEmulator} from '../messaging/messaging';

describes.fakeWin('HighlightHandler', {
  win: {
    // URL encoded '{"s":["amp","highlight"]}'.
    location: 'page.html#highlight=%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%7D'
  },
  amp: {
    ampdoc: 'single'
  },
}, env=>{

  it('initialize with visibility=visible', ()=>{
    let document = env.win.document;
    let root = document.createElement('div');
    document.body.appendChild(root);
    let div0 = document.createElement('div');
    div0.textContent = 'text in amp doc';
    root.appendChild(div0);
    let div1 = document.createElement('div');
    div1.textContent = 'highlighted text';
    root.appendChild(div1);

    let ampdoc = env.ampdoc;
    let scrollStub = sandbox.stub(Services.viewportForDoc(ampdoc), 'animateScrollIntoView');
    let handler = new HighlightHandler(ampdoc);

    expect(scrollStub).to.be.calledOnce;
    expect(scrollStub.firstCall.args.length).to.equal(2);
    expect(scrollStub.firstCall.args[0].textContent).to.equal('amp');
    expect(scrollStub.firstCall.args[1]).to.equal(500);
    expect(root.innerHTML).to.equal(
        '<div>text in <span style="background-color: rgb(255, 255, 0); color: rgb(51, 51, 51);">amp</span> doc</div><div><span style="background-color: rgb(255, 255, 0); color: rgb(51, 51, 51);">highlight</span>ed text</div>');

    const viewerOrigin = 'http://localhost:9876';
    const port = new WindowPortEmulator(
        window, viewerOrigin);
    port.addEventListener = function() {};
    port.postMessage = function() {};
    let messaging = new Messaging(env.win, port);

    handler.setupMessaging(messaging);
    messaging.handleRequest_({
      name: 'highlightDismiss',
    });
    expect(root.innerHTML).to.equal(
        '<div>text in <span style="">amp</span> doc</div><div><span style="">highlight</span>ed text</div>');
  });
});
