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
      skipRendering: false,
    });
  });

  it('do nothing flag', () => {
    // URL encoded '{"s":["amp","highlight"], "n": 1}'
    env.win.location = 'page.html#highlight=' +
      '%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%2C%20%22n%22%3A%201%7D';
    expect(getHighlightParam(env.ampdoc)).to.deep.equal({
      sentences: ['amp', 'highlight'],
      skipRendering: true,
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
  let root = null;
  beforeEach(() => {
    const {document} = env.win;
    root = document.createElement('div');
    document.body.appendChild(root);
    const div0 = document.createElement('div');
    div0.textContent = 'text in amp doc';
    root.appendChild(div0);
    const div1 = document.createElement('div');
    div1.textContent = 'highlighted text';
    root.appendChild(div1);
  });

  it('initialize with visibility=visible', () => {
    const {ampdoc} = env;
    const scrollStub = sandbox.stub(
        Services.viewportForDoc(ampdoc), 'animateScrollIntoView');
    scrollStub.returns(Promise.reject());
    const sendMsgStub = sandbox.stub(
        Services.viewerForDoc(ampdoc), 'sendMessage');

    const handler = new HighlightHandler(
        ampdoc,{sentences: ['amp', 'highlight']});

    expect(scrollStub).to.be.calledOnce;
    expect(scrollStub.firstCall.args.length).to.equal(1);
    expect(scrollStub.firstCall.args[0].style.pointerEvents).to.equal('none');

    // For some reason, expect(args).to.deep.equal does not work.
    expect(sendMsgStub.callCount).to.equal(2);
    expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
    expect(sendMsgStub.firstCall.args[1]).to.deep.equal(
        {state: 'found', scroll: 0});
    expect(sendMsgStub.secondCall.args[1]).to.deep.equal(
        {state: 'auto_scroll'});

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

  it('initialize with skipRendering', () => {
    const {ampdoc} = env;
    const scrollStub = sandbox.stub(
        Services.viewportForDoc(ampdoc), 'animateScrollIntoView');
    scrollStub.returns(Promise.reject());
    const sendMsgStub = sandbox.stub(
        Services.viewerForDoc(ampdoc), 'sendMessage');

    new HighlightHandler(ampdoc,
        {sentences: ['amp', 'highlight'], skipRendering: true});

    expect(scrollStub).not.to.be.called;

    // For some reason, expect(args).to.deep.equal does not work.
    expect(sendMsgStub.callCount).to.equal(1);
    expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
    expect(sendMsgStub.firstCall.args[1]).to.deep.equal(
        {state: 'found', scroll: 0});

    expect(root.innerHTML).to.equal(
        '<div>text in <span>amp</span> doc</div><div><span>highlight</span>' +
        'ed text</div>');
  });

  it('initialize with amp-access', () => {
    // Inject <script id="amp-access"> to emulate pages with <amp-access>.
    const {document} = env.win;
    const script = document.createElement('script');
    script.id = 'amp-access';
    document.body.appendChild(script);

    const {ampdoc} = env;
    const scrollStub = sandbox.stub(
        Services.viewportForDoc(ampdoc), 'animateScrollIntoView');
    scrollStub.returns(Promise.reject());
    const sendMsgStub = sandbox.stub(
        Services.viewerForDoc(ampdoc), 'sendMessage');

    new HighlightHandler(ampdoc, {sentences: ['amp', 'highlight']});

    expect(scrollStub).not.to.be.called;

    // For some reason, expect(args).to.deep.equal does not work.
    expect(sendMsgStub.callCount).to.equal(1);
    expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
    expect(sendMsgStub.firstCall.args[1]).to.deep.equal(
        {state: 'has_amp_access'});

    expect(root.innerHTML).to.equal(
        '<div>text in amp doc</div><div>highlighted text</div>');
  });

  it('calcTopToCenterHighlightedNodes_ center elements', () => {
    const handler = new HighlightHandler(env.ampdoc, {sentences: ['amp']});
    expect(handler.highlightedNodes_).not.to.be.null;

    const viewport = Services.viewportForDoc(env.ampdoc);
    sandbox.stub(viewport, 'getLayoutRect').returns({top: 500, bottom: 550});
    sandbox.stub(viewport, 'getHeight').returns(300);
    sandbox.stub(viewport, 'getPaddingTop').returns(50);

    // 525px (The center of the element) - 0.5 * 250px (window height) = 400px.
    expect(handler.calcTopToCenterHighlightedNodes_()).to.equal(400);
  });

  it('calcTopToCenterHighlightedNodes_ too tall element', () => {
    const handler = new HighlightHandler(env.ampdoc, {sentences: ['amp']});
    expect(handler.highlightedNodes_).not.to.be.null;

    const viewport = Services.viewportForDoc(env.ampdoc);
    sandbox.stub(viewport, 'getLayoutRect').returns({top: 500, bottom: 1000});
    sandbox.stub(viewport, 'getHeight').returns(300);
    sandbox.stub(viewport, 'getPaddingTop').returns(50);

    // Scroll to the top of the element because it's too tall.
    expect(handler.calcTopToCenterHighlightedNodes_()).to.equal(500);
  });
});
