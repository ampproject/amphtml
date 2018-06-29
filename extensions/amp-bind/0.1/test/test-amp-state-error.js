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
import {Services} from '../../../../src/services';
import {AmpEvents} from '../../../../src/amp-events';
import {ActionTrust} from '../../../../src/action-constants';

describes.realWin('AmpState', {
  amp: {
    runtimeOn: true,
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

  function getAmpState() {
    const el = win.document.createElement('amp-state');
    el.setAttribute('id', 'myAmpState');
  //   on="submit-success:AMP.setState({
  //     rooms: event.response
  // })"
    el.setAttribute('on', 'error:AMP.setState({error: "error"})');
    win.document.body.appendChild(el);
    return el;
  }

  beforeEach(() => {
    ({win, sandbox} = env);
    viewer = Services.viewerForDoc(win.document);
    whenFirstVisiblePromise = new Promise(resolve => {
      whenFirstVisiblePromiseResolve = resolve;
    });
    sandbox.stub(viewer, 'whenFirstVisible')
        .callsFake(() => whenFirstVisiblePromise);

    element = getAmpState();
    ampState = element.implementation_;

    sandbox.spy(ampState, 'fetchAndUpdate_');
    sandbox.stub(ampState, 'updateState_');
    sandbox.stub(ampState, 'fetch_')
    .returns(Promise.reject(new Error('intentional')));
  });


  it('should launch error event on fetch failure', () => {
    element.setAttribute('src', 'https://foo.com/bar?baz=1');
    element.build();

    // IMPORTANT: No CORS fetch should happen until viewer is visible.
    expect(ampState.fetchAndUpdate_).to.not.have.been.called;
    expect(ampState.fetch_).to.not.have.been.called;
    expect(ampState.updateState_).to.not.have.been.called;

    const actionService = {
      trigger: sandbox.spy(),
    };

    sandbox.stub(Services, 'actionServiceForDoc').returns(actionService);
    const triggerWithArgs =
    actionService.trigger.withArgs(element, 'error', AmpEvents.ERROR, ActionTrust.HIGH);
    
    whenFirstVisiblePromiseResolve();
    return whenFirstVisiblePromise.then(() => {
      expect(ampState.fetchAndUpdate_).calledWithExactly(/* isInit */ true);
      return ampState.fetch_();
    }).catch(error => {
      expect(triggerWithArgs).to.have.been.calledOnce;
    });
  });
});
