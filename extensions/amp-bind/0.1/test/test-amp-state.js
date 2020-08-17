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
import {ActionTrust} from '../../../../src/action-constants';
import {Services} from '../../../../src/services';
import {UrlReplacementPolicy} from '../../../../src/batched-json';

describes.realWin(
  'AmpState',
  {
    amp: {
      runtimeOn: false,
      extensions: ['amp-bind:0.1'],
    },
  },
  (env) => {
    let win;
    let ampdoc;

    let element;
    let ampState;
    let bind;

    // Viewer-related vars.
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
      ({win, ampdoc} = env);

      whenFirstVisiblePromise = new Promise((resolve, reject) => {
        whenFirstVisiblePromiseResolve = resolve;
        whenFirstVisiblePromiseReject = reject;
      });
      env.sandbox
        .stub(ampdoc, 'whenFirstVisible')
        .returns(whenFirstVisiblePromise);
      env.sandbox.stub(ampdoc, 'hasBeenVisible').returns(false);

      element = getAmpState();
      ampState = element.implementation_;

      // TODO(choumx): Remove stubbing of private function fetch_() once
      // batchFetchJsonFor() is easily stub-able.
      env.sandbox
        .stub(ampState, 'fetch_')
        .returns(Promise.resolve({remote: 'data'}));

      bind = {setState: env.sandbox.stub()};
      env.sandbox.stub(Services, 'bindForDocOrNull').resolves(bind);
    });

    it('should not fetch until doc is visible', async () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      whenFirstVisiblePromiseReject();
      await whenFirstVisiblePromise.catch(() => {});

      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).to.not.have.been.called;
    });

    it('should fetch if `src` attribute exists', async () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(ampState.fetch_).to.have.been.calledOnce;
      expect(ampState.fetch_).to.have.been.calledWithExactly(
        /* ampdoc */ env.sandbox.match.any,
        UrlReplacementPolicy.ALL,
        /* refresh */ env.sandbox.match.falsy
      );

      expect(bind.setState).calledWithMatch(
        {myAmpState: {remote: 'data'}},
        {skipEval: true, skipAmpState: false}
      );
    });

    it('should trigger "fetch-error" if fetch fails', async () => {
      ampState.fetch_.returns(Promise.reject());

      const actions = {trigger: env.sandbox.spy()};
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      expect(actions.trigger).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(actions.trigger).to.have.been.calledWithExactly(
        element,
        'fetch-error',
        /* event */ null,
        ActionTrust.LOW
      );
    });

    it('should register "refresh" action', async () => {
      env.sandbox.spy(ampState, 'registerAction');

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      expect(ampState.registerAction).calledWithExactly(
        'refresh',
        env.sandbox.match.any
      );
    });

    it('should fetch on "refresh"', async () => {
      env.sandbox.spy(ampState, 'registerAction');

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      const action = {method: 'refresh', satisfiesTrust: () => true};
      await ampState.executeAction(action);

      // Fetch via "refresh" should also wait for doc visible.
      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      // One call from build(), one call from "refresh" action.
      expect(ampState.fetch_).to.have.been.calledTwice;
    });

    it('should parse its child script', async () => {
      element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
      await element.build();

      expect(bind.setState).calledWithMatch(
        {myAmpState: {local: 'data'}},
        {skipEval: true, skipAmpState: false}
      );

      // await one macro-task to let viewer/fetch promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(ampState.fetch_).to.not.have.been.called;
    });

    it('should parse child and fetch `src` if both provided', async () => {
      element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.build();

      // No fetch should happen until doc is visible.
      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).calledWithMatch(
        {myAmpState: {local: 'data'}},
        {skipEval: true, skipAmpState: false}
      );

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await a single macro-task to let promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(bind.setState).calledWithMatch(
        {myAmpState: {remote: 'data'}},
        {skipEval: true, skipAmpState: false}
      );
    });

    it('should not fetch if `src` is mutated and doc is not visible', () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      // No fetch should happen until doc is visible.
      expect(ampState.fetch_).to.not.have.been.called;

      allowConsoleError(() => {
        element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
      });

      // Doc still not visible.
      expect(ampState.fetch_).to.not.have.been.called;
    });

    it('should fetch json if `src` is mutated', async () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      // No fetch should happen until doc is visible.
      expect(ampState.fetch_).to.not.have.been.called;

      ampdoc.hasBeenVisible.returns(true);

      element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await a single macro-task to let promise chains resolve.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(ampState.fetch_).to.have.been.called;
      expect(bind.setState).calledWithMatch(
        {myAmpState: {remote: 'data'}},
        {skipEval: false, skipAmpState: true}
      );
    });
  }
);
