import '../amp-bind';
import {ActionTrust_Enum} from '#core/constants/action-constants';

import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {UrlReplacementPolicy_Enum} from '../../../../src/batched-json';

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

    beforeEach(async () => {
      ({ampdoc, win} = env);

      whenFirstVisiblePromise = new Promise((resolve, reject) => {
        whenFirstVisiblePromiseResolve = resolve;
        whenFirstVisiblePromiseReject = reject;
      });
      env.sandbox
        .stub(ampdoc, 'whenFirstVisible')
        .returns(whenFirstVisiblePromise);
      env.sandbox.stub(ampdoc, 'hasBeenVisible').returns(false);

      element = getAmpState();
      ampState = await element.getImpl(false);

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
      await element.buildInternal();

      whenFirstVisiblePromiseReject();
      await whenFirstVisiblePromise.catch(() => {});

      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).to.not.have.been.called;
    });

    it('should fetch if `src` attribute exists', async () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.buildInternal();

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await macroTask();

      expect(ampState.fetch_).to.have.been.calledOnce;
      expect(ampState.fetch_).to.have.been.calledWithExactly(
        /* ampdoc */ env.sandbox.match.any,
        UrlReplacementPolicy_Enum.ALL,
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
      await element.buildInternal();

      expect(actions.trigger).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await macroTask();

      expect(actions.trigger).to.have.been.calledWithExactly(
        element,
        'fetch-error',
        /* event */ null,
        ActionTrust_Enum.LOW
      );
    });

    it('should register "refresh" action', async () => {
      env.sandbox.spy(ampState, 'registerAction');

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.buildInternal();

      expect(ampState.registerAction).calledWithExactly(
        'refresh',
        env.sandbox.match.any
      );
    });

    it('should fetch on "refresh"', async () => {
      env.sandbox.spy(ampState, 'registerAction');

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.buildInternal();

      const action = {method: 'refresh', satisfiesTrust: () => true};
      await ampState.executeAction(action);

      // Fetch via "refresh" should also wait for doc visible.
      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await one macro-task to let viewer/fetch promise chains resolve.
      await macroTask();

      // One call from build(), one call from "refresh" action.
      expect(ampState.fetch_).to.have.been.calledTwice;
    });

    it('should parse its child script', async () => {
      element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
      await element.buildInternal();

      expect(bind.setState).calledWithMatch(
        {myAmpState: {local: 'data'}},
        {skipEval: true, skipAmpState: false}
      );

      // await one macro-task to let viewer/fetch promise chains resolve.
      await macroTask();

      expect(ampState.fetch_).to.not.have.been.called;
    });

    it('should parse child and fetch `src` if both provided', async () => {
      element.innerHTML =
        '<script type="application/json">{"local": "data"}</script>';
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.buildInternal();

      // No fetch should happen until doc is visible.
      expect(ampState.fetch_).to.not.have.been.called;
      expect(bind.setState).calledWithMatch(
        {myAmpState: {local: 'data'}},
        {skipEval: true, skipAmpState: false}
      );

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await a single macro-task to let promise chains resolve.
      await macroTask();

      expect(bind.setState).calledWithMatch(
        {myAmpState: {remote: 'data'}},
        {skipEval: true, skipAmpState: false}
      );
    });

    it('should not fetch if `src` is mutated and doc is not visible', async () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      await element.buildInternal();

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
      await element.buildInternal();

      // No fetch should happen until doc is visible.
      expect(ampState.fetch_).to.not.have.been.called;

      ampdoc.hasBeenVisible.returns(true);

      element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});

      whenFirstVisiblePromiseResolve();
      await whenFirstVisiblePromise;

      // await a single macro-task to let promise chains resolve.
      await macroTask();

      expect(ampState.fetch_).to.have.been.called;
      expect(bind.setState).calledWithMatch(
        {myAmpState: {remote: 'data'}},
        {skipEval: false, skipAmpState: true}
      );
    });
  }
);
