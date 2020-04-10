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

import {ActionInvocation, ActionService} from '../../src/service/action-impl';
import {ActionTrust} from '../../src/action-constants';

function createExecElement(id, enqueAction, defaultActionAlias) {
  const execElement = document.createElement('amp-element');
  execElement.setAttribute('id', id);
  execElement.enqueAction = enqueAction;
  execElement.getDefaultActionAlias = defaultActionAlias;
  return execElement;
}


function getActionInvocation(element, action, opt_tagOrTarget) {
  return new ActionInvocation(
    element,
    action,
    /* args */ null,
    'source',
    'caller',
    'event',
    ActionTrust.HIGH,
    'tap',
    opt_tagOrTarget || element.tagName
  );
}

describes.realWin(
  'Action allowlist on components',
  {
    amp: {
      ampdoc: 'single',
      runtimeOn: true,
      extensions: ['amp-carousel'],
    },
  },
  (env) => {
    let action;
    let target;
    let spy;
    let getDefaultActionAlias;
    beforeEach(() => {
      spy = env.sandbox.spy();
      getDefaultActionAlias = env.sandbox.stub();
      target = createExecElement('foo', spy, getDefaultActionAlias);
    });

    describe('with null action allowlist', () => {
      beforeEach(() => {
        action = new ActionService(env.ampdoc, env.win.document);
      });

      afterEach(() => {
        action = null;
      });

      it('should allow all actions by default', () => {
        const i = getActionInvocation(target, 'setState', 'AMP');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow all actions case insensitive', () => {
        const i = getActionInvocation(target, 'setState', 'amp');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });
    });

    describe('with non-null action allowlist', () => {
      beforeEach(() => {
        action = new ActionService(env.ampdoc, env.win.document);
        action.setWhitelist([
          {tagOrTarget: 'AMP', method: 'pushState'},
          {tagOrTarget: 'AMP', method: 'setState'},
          {tagOrTarget: '*', method: 'show'},
          {tagOrTarget: 'amp-element', method: 'defaultAction'},
        ]);
      });

      it('should allow default actions if alias is registered default', () => {
        // Given that 'defaultAction' is a registered default action.
        getDefaultActionAlias.returns('defaultAction');
        // Expect the 'activate' call to invoke it.
        const i = getActionInvocation(target, 'activate', null);
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow whitelisted actions with wildcard target', () => {
        const i = getActionInvocation(target, 'show', 'DIV');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should not allow non-whitelisted actions', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        env.sandbox.stub(action, 'error_');
        expect(action.invoke_(i)).to.be.null;
        expect(action.error_).to.be.calledWith(
          '"AMP.print" is not whitelisted ' +
            '[{"tagOrTarget":"AMP","method":"pushState"},' +
            '{"tagOrTarget":"AMP","method":"setState"},' +
            '{"tagOrTarget":"*","method":"show"},' +
            '{"tagOrTarget":"amp-element","method":"defaultAction"}].'
        );
      });

      it('should allow adding actions to the whitelist', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        action.addToWhitelist('AMP', 'print');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });
    });

    it('should not allow any action with empty whitelist', () => {
      action = new ActionService(env.ampdoc, env.win.document);
      action.setWhitelist([]);
      const i = getActionInvocation(target, 'print', 'AMP');
      env.sandbox.stub(action, 'error_');
      expect(action.invoke_(i)).to.be.null;
      expect(action.error_).to.be.calledWith(
        '"AMP.print" is not whitelisted [].'
      );
    });

    it('should ignore unparseable whitelist entries', () => {
      action = new ActionService(env.ampdoc, env.win.document);
      action.setWhitelist([
        {tagOrTarget: 'AMP', method: 'pushState'},
        {invalidEntry: 'invalid'},
        {},
        {tagOrTarget: 'AMP', method: 'setState'},
        {tagOrTarget: '*', method: 'show'},
        {tagOrTarget: '*'},
        {method: 'show'},
      ]);
      expect(action.whitelist_).to.deep.equal([
        {tagOrTarget: 'AMP', method: 'pushState'},
        {tagOrTarget: 'AMP', method: 'setState'},
        {tagOrTarget: '*', method: 'show'},
      ]);
      const i = getActionInvocation(target, 'setState', 'AMP');
      action.invoke_(i);
      expect(spy).to.be.calledWithExactly(i);
    });

    describe('email documents', () => {
      beforeEach(() => {
        env.win.document.documentElement.setAttribute('amp4email', '');
        action = new ActionService(env.ampdoc, env.win.document);
      });

      it('should supply default actions allowlist', () => {
        action = new ActionService(env.ampdoc, env.win.document);
        const i = new ActionInvocation(
          target,
          'toggleClass', // hardcoded default
          /* args */ null,
          'source',
          'caller',
          'event',
          ActionTrust.HIGH,
          'tap',
          'AMP'
        );
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should add actions to the allowlist for amp-carousel', () => {
        action = new ActionService(env.ampdoc, env.win.document);
        const i = new ActionInvocation(
          target,
          'toggleClass', // hardcoded default
          /* args */ null,
          'source',
          'caller',
          'event',
          ActionTrust.HIGH,
          'tap',
          'AMP'
        );
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });
    });
  }
);
