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

import {HighlightHandler, getHighlightParam} from '../highlight-handler';
import {Messaging, WindowPortEmulator} from '../messaging/messaging';
import {Services} from '../../../../src/services';

describes.fakeWin('getHighlightParam', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  it('get a param', () => {
    // URL encoded '{"s":["amp","highlight"]}'.
    env.win.location = 'page.html#highlight=' +
        '%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%7D';
    expect(getHighlightParam(env.ampdoc)).to.deep.equal({
      sentences: ['amp', 'highlight'],
    });
  });

  it('no param', () => {
    env.win.location = 'page.html';
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('too large json', () => {
    const rep = 100 << 10;
    env.win.location = 'page.html#highlight=' +
        '['.repeat(rep) + ']'.repeat(rep);
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('too many sentences', () => {
    const sens = [];
    for (let i = 0; i < 20; i++) {
      sens.push('a');
    }
    env.win.location = 'page.html#highlight=' + JSON.stringify({'s': sens});
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('too many chars', () => {
    const sens = [];
    for (let i = 0; i < 5; i++) {
      sens.push('a'.repeat(400));
    }
    env.win.location = 'page.html#highlight=' + JSON.stringify({'s': sens});
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('if s is not array', () => {
    env.win.location = 'page.html#highlight=' +
        JSON.stringify({'s': 'invalid'});
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('empty in an array', () => {
    env.win.location = 'page.html#highlight=' +
        JSON.stringify({'s': ['a', '', 'b']});
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });

  it('number array', () => {
    env.win.location = 'page.html#highlight=' + JSON.stringify({'s': [1, 2]});
    expect(getHighlightParam(env.ampdoc)).to.be.a('null');
  });
});

describes.realWin('HighlightHandler', {
  // We can not overwrite win.location with realWin.
  amp: {
    ampdoc: 'single',
  },
}, env => {

  it('initialize with visibility=visible', () => {
    const {document} = env.win;
    const root = document.createElement('div');
    document.body.appendChild(root);
    const div0 = document.createElement('div');
    div0.textContent = 'text in amp doc';
    root.appendChild(div0);
    const div1 = document.createElement('div');
    div1.textContent = 'highlighted text';
    root.appendChild(div1);

    const {ampdoc} = env;
    const scrollStub = sandbox.stub(
        Services.viewportForDoc(ampdoc), 'animateScrollIntoView');
    const handler = new HighlightHandler(
        ampdoc,{sentences: ['amp', 'highlight']});

    expect(scrollStub).to.be.calledOnce;
    expect(scrollStub.firstCall.args.length).to.equal(2);
    expect(scrollStub.firstCall.args[0].textContent).to.equal('amp');
    expect(scrollStub.firstCall.args[1]).to.equal(500);
    expect(root.innerHTML).to.equal(
        '<div>text in <span style="background-color: rgb(255, 255, 0); ' +
          'color: rgb(51, 51, 51);">amp</span> doc</div><div>' +
          '<span style="background-color: rgb(255, 255, 0); color: ' +
          'rgb(51, 51, 51);">highlight</span>ed text</div>');

    const viewerOrigin = 'http://localhost:9876';
    const port = new WindowPortEmulator(
        window, viewerOrigin);
    port.addEventListener = function() {};
    port.postMessage = function() {};
    const messaging = new Messaging(env.win, port);

    handler.setupMessaging(messaging);
    messaging.handleRequest_({
      name: 'highlightDismiss',
    });
    expect(root.innerHTML).to.equal(
        '<div>text in <span style="">amp</span> doc</div><div>' +
          '<span style="">highlight</span>ed text</div>');
  });
});
