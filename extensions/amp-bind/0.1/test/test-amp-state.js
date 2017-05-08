/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-bind';
import {viewerForDoc} from '../../../../src/services';

describes.realWin('AmpState', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-state:0.1'],
  },
}, env => {
  let ampState;
  let fetchSpy;
  let batchedJsonStub;
  let updateStub;

  // Viewer-related vars.
  let viewer;
  let whenFirstVisiblePromise;
  let whenFirstVisiblePromiseResolve;

  function getAmpState() {
    const el = env.win.document.createElement('amp-state');
    el.setAttribute('id', 'myAmpState');
    env.win.document.body.appendChild(el);
    return el;
  }

  beforeEach(() => {
    viewer = viewerForDoc(env.win.document);

    whenFirstVisiblePromise = new Promise(resolve => {
      whenFirstVisiblePromiseResolve = resolve;
    });

    env.sandbox.stub(viewer, 'whenFirstVisible', () => whenFirstVisiblePromise);

    ampState = getAmpState();
    const impl = ampState.implementation_;

    fetchSpy = env.sandbox.spy(impl, 'fetchSrcAndUpdateState_');
    batchedJsonStub = env.sandbox.stub(impl, 'fetchBatchedJsonFor_')
        .returns(Promise.resolve({baz: 'qux'}));
    updateStub = env.sandbox.stub(impl, 'updateState_');
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  it('should fetch json at build if `src` attribute exists', () => {
    ampState.setAttribute('src', 'https://foo.com/bar?baz=1');
    ampState.build();

    // IMPORTANT: No CORS fetch should happen until viewer is visible.
    expect(fetchSpy).to.not.have.been.called;
    expect(batchedJsonStub).to.not.have.been.called;
    expect(updateStub).to.not.have.been.called;

    whenFirstVisiblePromiseResolve();
    return whenFirstVisiblePromise.then(() => {
      expect(fetchSpy).calledWithExactly(/* isInit */ true);
      return ampState.implementation_.updateStatePromise;
    }).then(() => {
      expect(updateStub).calledWithMatch({baz: 'qux'});
    });
  });

  it('should parse its child script', () => {
    ampState.innerHTML = '<script type="application/json">' +
        '{"foo": "bar"}</script>';
    ampState.build();

    // IMPORTANT: No parsing should happen until viewer is visible.
    expect(fetchSpy).to.not.have.been.called;
    expect(batchedJsonStub).to.not.have.been.called;
    expect(updateStub).to.not.have.been.called;

    whenFirstVisiblePromiseResolve();
    return whenFirstVisiblePromise.then(() => {
      expect(fetchSpy).to.not.have.been.called;
      expect(updateStub).calledWithMatch({foo: 'bar'});
    });
  });

  it('should parse child and fetch `src` if both provided at build', () => {
    ampState.innerHTML = '<script type="application/json">' +
        '{"foo": "bar"}</script>';
    ampState.setAttribute('src', 'https://foo.com/bar?baz=1');
    ampState.build();

    // IMPORTANT: No parsing should happen until viewer is visible.
    expect(fetchSpy).to.not.have.been.called;
    expect(batchedJsonStub).to.not.have.been.called;
    expect(updateStub).to.not.have.been.called;

    whenFirstVisiblePromiseResolve();
    return whenFirstVisiblePromise.then(() => {
      expect(updateStub).calledWithMatch({foo: 'bar'});
      expect(fetchSpy).calledWithExactly(/* isInit */ true);
      return ampState.implementation_.updateStatePromise;
    }).then(() => {
      expect(updateStub).calledWithMatch({baz: 'qux'});
    });
  });

  it('should fetch json if `src` is mutated', () => {
    ampState.setAttribute('src', 'https://foo.com/bar?baz=1');
    ampState.build();

    // IMPORTANT: No CORS fetch should happen until viewer is visible.
    const isVisibleStub = env.sandbox.stub(viewer, 'isVisible');
    isVisibleStub.returns(false);
    ampState.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
    expect(fetchSpy).to.not.have.been.called;
    expect(batchedJsonStub).to.not.have.been.called;

    isVisibleStub.returns(true);
    ampState.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
    expect(fetchSpy).calledWithExactly(/* isInit */ false);
    return ampState.implementation_.updateStatePromise.then(() => {
      expect(updateStub).calledWithMatch({baz: 'qux'});
    });
  });
});
