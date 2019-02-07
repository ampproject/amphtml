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
    beforeEach(() => {
      toggleExperiment(win, 'amp-action-macro', true);
      const macroElement = doc.createElement('amp-action-macro');
      macroElement.setAttribute('action', 'target.execute(index=x,index=y)');
      macroElement.setAttribute('arguments', 'x,y');
      macroElement.setAttribute('id', 'amp-action-id');
      doc.body.appendChild(macroElement);
      macro = new AmpActionMacro(macroElement);
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
  });

});
