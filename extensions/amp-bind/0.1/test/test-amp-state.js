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

describes.realWin(
  'AmpState',
  {
    amp: {
      runtimeOn: false,
      extensions: ['amp-bind:0.1'],
    },
  },
  env => {
    let win;
    let sandbox;
    let fetchStub;
    let getViewerAuthTokenIfAvailableStub;

    let element;
    let ampState;

    // Viewer-related vars.
    let viewer;
    let whenFirstVisiblePromise;
    let whenFirstVisiblePromiseResolve;

    function getAmpState() {
      const el = win.document.createElement('amp-state');
      el.setAttribute('id', 'myAmpState');
      win.document.body.appendChild(el);
      return el;
    }

    beforeEach(() => {
      ({win, sandbox} = env);

      viewer = Services.viewerForDoc(win.document);

      whenFirstVisiblePromise = new Promise(resolve => {
        whenFirstVisiblePromiseResolve = resolve;
      });
      sandbox
        .stub(viewer, 'whenFirstVisible')
        .callsFake(() => whenFirstVisiblePromise);

      element = getAmpState();
      ampState = element.implementation_;

      sandbox.spy(ampState, 'fetchAndUpdate_');
      sandbox.spy(ampState, 'prepareAndSendFetch_');
      sandbox.stub(ampState, 'updateState_');
      getViewerAuthTokenIfAvailableStub = sandbox
        .stub(xhrUtils, 'getViewerAuthTokenIfAvailable')
        .returns(Promise.resolve());
      fetchStub = sandbox
        .stub(ampState, 'fetch_')
        .returns(Promise.resolve({baz: 'qux'}));
    });

    it('should fetch json if `src` attribute exists', () => {
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      // IMPORTANT: No CORS fetch should happen until viewer is visible.
      expect(ampState.fetch_).to.not.have.been.called;
      expect(ampState.updateState_).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      return whenFirstVisiblePromise
        .then(() => {
          expect(ampState.fetchAndUpdate_).calledWithExactly(/* isInit */ true);
          return getViewerAuthTokenIfAvailableStub();
        })
        .then(() => {
          return ampState.fetch_();
        })
        .then(() => {
          expect(ampState.updateState_).calledWithMatch({baz: 'qux'});
        });
    });

    it('should trigger "fetch-error" if fetch fails', function*() {
      whenFirstVisiblePromiseResolve();
      fetchStub.returns(Promise.reject());

      const actions = {trigger: sandbox.spy()};
      sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      yield whenFirstVisiblePromise;
      yield getViewerAuthTokenIfAvailableStub();
      yield ampState.fetch_();

      expect(ampState.updateState_).to.not.be.called;
      expect(actions.trigger).to.be.calledWithExactly(
        ampState,
        'fetch-error',
        /* event */ null,
        ActionTrust.LOW
      );
    });

    it('should register action refresh', () => {
      sandbox.spy(ampState, 'registerAction');
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      whenFirstVisiblePromiseResolve();
      return whenFirstVisiblePromise.then(() => {
        expect(ampState.registerAction).calledWithExactly(
          'refresh',
          sinon.match.any,
          ActionTrust.HIGH
        );
      });
    });

    it('should call fetchAndUpdate on refresh', () => {
      sandbox.spy(ampState, 'registerAction');
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      whenFirstVisiblePromiseResolve();
      return whenFirstVisiblePromise
        .then(() => {
          return ampState.executeAction({
            method: 'refresh',
            satisfiesTrust: () => true,
          });
        })
        .then(() => {
          expect(ampState.fetchAndUpdate_).calledWithExactly(
            /* isInit */ false,
            /* opt_refresh */ true
          );
        });
    });

    it('should parse its child script', () => {
      element.innerHTML =
        '<script type="application/json">{"foo": "bar"}</script>';
      element.build();

      expect(ampState.fetchAndUpdate_).to.not.have.been.called;
      expect(ampState.fetch_).to.not.have.been.called;
      expect(ampState.updateState_).calledWithMatch({foo: 'bar'});
    });

    it('should parse child and fetch `src` if both provided', () => {
      element.innerHTML =
        '<script type="application/json">{"foo": "bar"}</script>';
      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      // IMPORTANT: No CORS fetch should happen until viewer is visible.
      expect(ampState.fetch_).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      return whenFirstVisiblePromise
        .then(() => {
          expect(ampState.updateState_).calledWithMatch({foo: 'bar'});
          expect(ampState.fetchAndUpdate_).calledWithExactly(/* isInit */ true);
          return getViewerAuthTokenIfAvailableStub();
        })
        .then(() => {
          return ampState.fetch_();
        })
        .then(() => {
          expect(ampState.updateState_).calledWithMatch({baz: 'qux'});
        });
    });

    it('should fetch json if `src` is mutated', () => {
      sandbox.stub(viewer, 'hasBeenVisible').returns(false);

      element.setAttribute('src', 'https://foo.com/bar?baz=1');
      element.build();

      // IMPORTANT: No CORS fetch should happen until viewer is visible.
      expect(ampState.fetchAndUpdate_).to.have.been.calledOnce;
      expect(ampState.fetch_).to.not.have.been.called;

      allowConsoleError(() => {
        element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
      });

      expect(ampState.fetchAndUpdate_).to.have.been.calledOnce;
      expect(ampState.fetch_).to.not.have.been.called;

      viewer.hasBeenVisible.returns(true);
      element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});

      expect(ampState.fetchAndUpdate_).to.have.been.calledTwice;
      expect(ampState.fetch_).to.not.have.been.called;

      whenFirstVisiblePromiseResolve();
      return whenFirstVisiblePromise
        .then(() => getViewerAuthTokenIfAvailableStub())
        .then(() => ampState.fetch_())
        .then(() => {
          expect(ampState.updateState_).calledWithMatch({baz: 'qux'});
        });
    });

    it(
      'should fetch with auth token if `crossorigin` attribute exists' +
        ' with `amp-viewer-auth-token-via-post`',
      () => {
        sandbox.stub(viewer, 'hasBeenVisible').returns(false);
        getViewerAuthTokenIfAvailableStub.returns(Promise.resolve('idToken'));

        element.setAttribute('src', 'https://foo.com/bar?baz=1');
        element.setAttribute('crossorigin', 'amp-viewer-auth-token-via-post');
        element.build();

        // IMPORTANT: No CORS fetch should happen until viewer is visible.
        expect(ampState.fetchAndUpdate_).to.have.been.calledOnce;
        expect(ampState.fetch_).to.not.have.been.called;

        allowConsoleError(() => {
          element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});
        });

        expect(ampState.fetchAndUpdate_).to.have.been.calledOnce;
        expect(ampState.fetch_).to.not.have.been.called;

        viewer.hasBeenVisible.returns(true);
        element.mutatedAttributesCallback({src: 'https://foo.com/bar?baz=1'});

        expect(ampState.fetchAndUpdate_).to.have.been.calledTwice;
        expect(ampState.fetch_).to.not.have.been.called;

        whenFirstVisiblePromiseResolve();
        return whenFirstVisiblePromise
          .then(() => ampState.prepareAndSendFetch_({win}, element))
          .then(() => {
            expect(fetchStub).to.have.been.called;
            expect(fetchStub.firstCall.args.slice(-1).pop()).to.be.equal(
              'idToken'
            );
            expect(ampState.updateState_).calledWithMatch({baz: 'qux'});
          });
      }
    );
  }
);
