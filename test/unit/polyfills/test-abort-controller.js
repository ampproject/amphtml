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

import {install} from '../../../src/polyfills/abort-controller';

describes.realWin('AbortController', {}, (env) => {
  let win;
  let controller, signal;

  beforeEach(() => {
    win = env.win;

    delete win.AbortController;
    delete win.AbortSignal;
    install(win);

    controller = new win.AbortController();
    signal = controller.signal;
  });

  it('should create AbortController and signal', () => {
    expect(signal).to.exist;
    expect(signal.aborted).to.be.false;
    expect(signal.onabort).to.be.null;
  });

  it('should abort signal without listener', () => {
    controller.abort();
    expect(signal.aborted).to.be.true;
  });

  it('should abort signal with listener', () => {
    const spy = env.sandbox.spy();
    signal.onabort = spy;
    expect(signal.onabort).to.equal(spy);

    controller.abort();
    expect(signal.aborted).to.be.true;
    expect(spy).to.be.calledOnce;
    const event = spy.firstCall.firstArg;
    expect(event).to.contain({
      type: 'abort',
      bubbles: false,
      cancelable: false,
      target: signal,
      currentTarget: signal,
    });
  });

  it('should only call listener once', () => {
    const spy = env.sandbox.spy();
    signal.onabort = spy;
    expect(signal.onabort).to.equal(spy);

    controller.abort();
    expect(spy).to.be.calledOnce;

    controller.abort();
    expect(spy).to.be.calledOnce;
  });
});
