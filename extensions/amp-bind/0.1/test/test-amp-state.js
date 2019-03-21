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
import * as xhrUtils from '../../../../src/utils/xhr-utils';
import {ActionTrust} from '../../../../src/action-constants';
import {Services} from '../../../../src/services';
import {UrlReplacementPolicy} from '../../../../src/batched-json';

describes.realWin('AmpState', {
  amp: {
    runtimeOn: false,
    extensions: ['amp-bind:0.1'],
  },
}, env => {
  let win;
  let sandbox;

  let element;
  let ampState;

  // Viewer-related vars.
  let viewer;
  let whenFirstVisiblePromise;
  let whenFirstVisiblePromiseResolve;
  let whenFirstVisiblePromiseReject;

  function getAmpState() {
    const el = win.document.createElement('amp-state');
    el.setAttribute('id', 'myAmpState');
    win.document.body.appendChild(el);
    return el;
  }

  beforeEach(() => {
    ({win, sandbox} = env);

    viewer = Services.viewerForDoc(win.document);
    whenFirstVisiblePromise = new Promise((resolve, reject) => {
      whenFirstVisiblePromiseResolve = resolve;
      whenFirstVisiblePromiseReject = reject;
    });
    sandbox.stub(viewer, 'whenFirstVisible').returns(whenFirstVisiblePromise);
    sandbox.stub(viewer, 'hasBeenVisible').returns(false);

    element = getAmpState();
    ampState = element.implementation_;

    sandbox.stub(xhrUtils, 'getViewerAuthTokenIfAvailable')
        .returns(Promise.resolve());

    // We should only stub fetch_() and updateState_() on ampState.
    sandbox.stub(ampState, 'fetch_').returns(Promise.resolve({remote: 'data'}));
    sandbox.stub(ampState, 'updateState_');
  });

  it('should not fetch until viewer is visible', function*() {
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    whenFirstVisiblePromiseReject();
    yield whenFirstVisiblePromise;

    expect(ampState.fetch_).to.not.have.been.called;
    expect(ampState.updateState_).to.not.have.been.called;
  });

  it('should fetch if `src` attribute exists', function*() {
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield one macro-task to let viewer/fetch promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(ampState.fetch_).to.have.been.calledOnce;
    expect(ampState.fetch_).to.have.been.calledWithExactly(
        /* ampdoc */ sinon.match.any,
        UrlReplacementPolicy.ALL,
        /* refresh */ sinon.match.falsy,
        /* token */ sinon.match.falsy);

    expect(ampState.updateState_).calledWithMatch({remote: 'data'});
  });

  it('should trigger "fetch-error" if fetch fails', function*() {
    ampState.fetch_.returns(Promise.reject());

    const actions = {trigger: sandbox.spy()};
    sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    expect(actions.trigger).to.not.have.been.called;

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield one macro-task to let viewer/fetch promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(actions.trigger).to.have.been.calledWithExactly(
        element, 'fetch-error', /* event */ null, ActionTrust.LOW);
  });

  it('should register "refresh" action', function*() {
    sandbox.spy(ampState, 'registerAction');

    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    expect(ampState.registerAction)
        .calledWithExactly('refresh', sinon.match.any, ActionTrust.HIGH);
  });

  it('should fetch on "refresh"', function*() {
    sandbox.spy(ampState, 'registerAction');

    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    const action = {method: 'refresh', satisfiesTrust: () => true};
    yield ampState.executeAction(action);

    // Fetch via "refresh" should also wait for viewer visible.
    expect(ampState.fetch_).to.not.have.been.called;
    expect(ampState.updateState_).to.not.have.been.called;

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield one macro-task to let viewer/fetch promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    // One call from build(), one call from "refresh" action.
    expect(ampState.fetch_).to.have.been.calledTwice;
  });

  it('should parse its child script', function*() {
    element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
    element.build();

    expect(ampState.updateState_).calledWithMatch({local: 'data'});

    // Yield one macro-task to let viewer/fetch promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(ampState.fetch_).to.not.have.been.called;
  });

  it('should parse child and fetch `src` if both provided', function*() {
    element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    // No fetch should happen until viewer is visible.
    expect(ampState.fetch_).to.not.have.been.called;
    expect(ampState.updateState_).calledWithMatch({local: 'data'});

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield a single macro-task to let promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(ampState.updateState_).calledWithMatch({remote: 'data'});
  });

  it('should not fetch if `src` is mutated and viewer is not visible', () => {
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    // No fetch should happen until viewer is visible.
    expect(ampState.fetch_).to.not.have.been.called;

    allowConsoleError(() => {
      element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
    });

    // Viewer still not visible.
    expect(ampState.fetch_).to.not.have.been.called;
  });

  it('should fetch json if `src` is mutated', function*() {
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    // No fetch should happen until viewer is visible.
    expect(ampState.fetch_).to.not.have.been.called;

    viewer.hasBeenVisible.returns(true);

    element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield a single macro-task to let promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(ampState.fetch_).to.have.been.called;
    expect(ampState.updateState_).calledWithMatch({remote: 'data'});
  });

  it('should fetch with token if ' +
      '[crossorigin="amp-viewer-auth-token-via-post"]`', function*() {
    xhrUtils.getViewerAuthTokenIfAvailable.returns(Promise.resolve('idToken'));

    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
    element.build();

    whenFirstVisiblePromiseResolve();
    yield whenFirstVisiblePromise;

    // Yield a single macro-task to let promise chains resolve.
    yield new Promise(resolve => setTimeout(resolve, 0));

    expect(ampState.fetch_).to.have.been.calledOnce;
    expect(ampState.fetch_).to.have.been.calledWithExactly(
        /* ampdoc */ sinon.match.any,
        UrlReplacementPolicy.ALL,
        /* refresh */ sinon.match.falsy,
        'idToken');

    expect(ampState.updateState_).calledWithMatch({remote: 'data'});
  });
});
