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

import {
  ActionInvocation,
} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {AmpActionMacro} from '../amp-action-macro';
import {Services} from '../../../../src/services';
import {
  toggleExperiment,
} from '../../../../src/experiments';

describes.realWin('amp-action-macro', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-action-macro'],
  },
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    toggleExperiment(win, 'amp-action-macro', true);
  });

  function newActionMacro() {
    const actionMacro = doc.createElement('amp-action-macro');
    doc.body.appendChild(actionMacro);
    return actionMacro.build().then(() => {
      return actionMacro.layoutCallback();
    });
  }

  it('should build if experiment is on', done => {
    newActionMacro().then(() => {
      done();
    }, unused => {
      done(new Error('component should have built'));
    });
  });

  it('should not build if experiment is off', () => {
    return allowConsoleError(() => {
      toggleExperiment(env.win, 'amp-action-macro', false);
      return newActionMacro().catch(err => {
        expect(err.message).to.include('Experiment is off');
      });
    });
  });

  describe('registered action', () => {
    let macro;
    let callingMacroElement;
    let referrableMacro;
    let referrableMacroElement;
    let unreferrableMacro;
    let unreferrableMacroElement;
    beforeEach(() => {
      toggleExperiment(win, 'amp-action-macro', true);

      // This macro is referrable and can be invoked by the macro element(s)
      // defined after it.
      referrableMacroElement = doc.createElement('amp-action-macro');
      referrableMacroElement.setAttribute(
          'execute', 'target.execute(index=x,index=y)');
      referrableMacroElement.setAttribute('arguments', 'x,y');
      referrableMacroElement.setAttribute('id', 'amp-action-id-referrable');

      callingMacroElement = doc.createElement('amp-action-macro');
      callingMacroElement.setAttribute(
          'execute', 'target.execute(index=x,index=y)');
      callingMacroElement.setAttribute('arguments', 'x,y');
      callingMacroElement.setAttribute('id', 'amp-action-id');

      // This macro is not referrable as it is defined after the calling macro
      // element.
      unreferrableMacroElement = doc.createElement('amp-action-macro');
      unreferrableMacroElement.setAttribute(
          'execute', 'target.execute(index=x,index=y)');
      unreferrableMacroElement.setAttribute('arguments', 'x,y');
      unreferrableMacroElement.setAttribute('id', 'amp-action-id-unreferrable');

      doc.body.appendChild(referrableMacroElement);
      doc.body.appendChild(callingMacroElement);
      doc.body.appendChild(unreferrableMacroElement);
      referrableMacro = new AmpActionMacro(referrableMacroElement);
      macro = new AmpActionMacro(callingMacroElement);
      unreferrableMacro = new AmpActionMacro(unreferrableMacroElement);
    });

    it('should register execute action', () => {
      const registerAction = sandbox.stub(macro, 'registerAction');
      macro.buildCallback();
      expect(registerAction).to.have.been.called;
    });

    it('should validate caller argument vars against defined arguments',
        () => {
          const button = doc.createElement('button');
          // Given the caller is called with a invalid argument alias 'z'.
          const callerAction = new ActionInvocation(macro, 'execute',
              {z: 1}, button, button, {}, ActionTrust.HIGH, 'tap',
              'AMP-ACTION-MACRO');
          macro.buildCallback();
          expect(() => macro.execute_(callerAction)).to.throw(
              /Variable argument name "z" is not defined/
          );
        });

    it('should trigger macro action', () => {
      const actions = {trigger: sandbox.spy()};
      sandbox.stub(Services, 'actionServiceForDoc').returns(actions);
      const button = doc.createElement('button');
      // Given the caller was called with a valid defined argument alias
      // 'x'.
      const callerAction = new ActionInvocation(macro, 'execute', {x: 1},
          button, button, {}, ActionTrust.HIGH, 'tap', 'AMP-ACTION-MACRO');
      macro.buildCallback();
      macro.execute_(callerAction);
      expect(actions.trigger).to.have.been.called;
    });

    it('should not allow recursive calls', () => {
      const actions = {trigger: sandbox.spy()};
      sandbox.stub(Services, 'actionServiceForDoc').returns(actions);
      // Given the caller is the amp action macro that is also being invoked.
      const callerAction = new ActionInvocation(macro, 'execute', {x: 1},
          callingMacroElement, callingMacroElement, {}, ActionTrust.HIGH, 'tap',
          'AMP-ACTION-MACRO');
      macro.buildCallback();
      expect(() => macro.execute_(callerAction)).to.throw(
          /Action macro with ID "amp-action-id" cannot reference itself or macros defined after it/);
    });

    it('should allow calls to macros defined before itself', () => {
      const actions = {trigger: sandbox.spy()};
      sandbox.stub(Services, 'actionServiceForDoc').returns(actions);
      // Given the caller is an amp action macro that was defined before the
      // action macro being invoked.
      const callerAction = new ActionInvocation(macro, 'execute', {x: 1},
          referrableMacroElement, callingMacroElement, {},
          ActionTrust.HIGH, 'tap',
          'AMP-ACTION-MACRO');
      referrableMacro.buildCallback();
      referrableMacro.execute_(callerAction);
      expect(actions.trigger).to.have.been.called;
    });

    it('should not allow calls to macros defined after itself', () => {
      const actions = {trigger: sandbox.spy()};
      sandbox.stub(Services, 'actionServiceForDoc').returns(actions);
      // Given the caller is an amp action macro that was defined after the
      // action macro being invoked.
      const callerAction = new ActionInvocation(macro, 'execute', {x: 1},
          unreferrableMacroElement, callingMacroElement, {},
          ActionTrust.HIGH, 'tap',
          'AMP-ACTION-MACRO');
      unreferrableMacro.buildCallback();
      expect(() => unreferrableMacro.execute_(callerAction)).to.throw(
          /Action macro with ID "amp-action-id-unreferrable" cannot reference itself or macros defined after it/);
    });
  });

});
