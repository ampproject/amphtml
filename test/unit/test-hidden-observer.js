/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {FakeMutationObserver} from '../../testing/fake-dom';
import {Services} from '../../src/services';

describes.fakeWin('HiddenObserver', {
  amp: true,
}, env => {
  let hiddenObserver;
  let sandbox;
  let MutationObserver;

  function setupSingletonMutationObserver(opt_cb = () => {}) {
    const mo = new FakeMutationObserver(opt_cb);
    MutationObserver = sandbox.stub().callsFake(function() {
      return mo;
    });
    env.win.MutationObserver = MutationObserver;
    return mo;
  }

  beforeEach(() => {
    sandbox = env.sandbox;
    hiddenObserver = Services.hiddenObserverForDoc(env.ampdoc);
  });

  it('initializes mutation observer on first listen', () => {
    const mo = setupSingletonMutationObserver();
    const observe = sandbox.spy(mo, 'observe');

    hiddenObserver.add(() => {});

    expect(MutationObserver).to.have.been.calledOnce;
    expect(observe).to.have.been.calledOnceWith(env.win.document);
  });

  it('keeps mutation observer on second listen', () => {
    const mo = setupSingletonMutationObserver();
    const observe = sandbox.spy(mo, 'observe');

    hiddenObserver.add(() => {});
    hiddenObserver.add(() => {});

    expect(MutationObserver).to.have.been.calledOnce;
    expect(observe).to.have.been.calledOnce;
  });

  it('frees mutation observer after last unlisten', () => {
    const mo = setupSingletonMutationObserver();
    const disconnect = sandbox.spy(mo, 'disconnect');

    const unlisten = hiddenObserver.add(() => {});
    unlisten();

    expect(disconnect).to.have.been.calledOnce;
  });

  it('keeps mutation observer after second-to-last unlisten', () => {
    const mo = setupSingletonMutationObserver();
    const disconnect = sandbox.spy(mo, 'disconnect');

    const unlisten = hiddenObserver.add(() => {});
    const unlisten2 = hiddenObserver.add(() => {});

    unlisten();
    expect(disconnect).not.to.have.been.called;

    unlisten2();
    expect(disconnect).to.have.been.calledOnce;
  });

  it('passes MutationRecords to handler', function*() {
    const stub = sandbox.stub();
    const mo = setupSingletonMutationObserver(stub);

    const mutation = {};
    const mutation2 = {};
    mo.__mutate(mutation);
    yield mo.__mutate(mutation2);

    expect(stub).to.have.been.calledOnceWith([mutation, mutation2]);
  });
});
