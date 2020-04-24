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

import '../../extensions/amp-carousel/0.1/amp-carousel';
import '../../extensions/amp-image-lightbox/0.1/amp-image-lightbox';
import '../../extensions/amp-lightbox/0.1/amp-lightbox';
import '../../extensions/amp-list/0.1/amp-list';
import '../../extensions/amp-selector/0.1/amp-selector';
import '../../extensions/amp-sidebar/0.1/amp-sidebar';
import {ActionInvocation, ActionService} from '../../src/service/action-impl';
import {ActionTrust} from '../../src/action-constants';
import {AmpForm} from '../../extensions/amp-form/0.1/amp-form';
import {Services} from '../../src/services';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../src/dom';
import {whenCalled} from '../../testing/test-helper.js';

function createExecElement(id, enqueAction, defaultActionAlias) {
  const execElement = document.createElement('amp-element');
  execElement.setAttribute('id', id);
  return setExecElement(execElement, enqueAction, defaultActionAlias);
}

function setExecElement(element, enqueAction, defaultActionAlias) {
  element.enqueAction = enqueAction;
  element.getDefaultActionAlias = defaultActionAlias;
  return element;
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
  'Action whitelist on components',
  {
    amp: {
      runtimeOn: true,
      extensions: [
        'amp-carousel',
        'amp-form',
        'amp-image-lightbox',
        'amp-lightbox',
        'amp-list',
        'amp-selector',
        'amp-sidebar',
      ],
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

    describe('with null action whitelist', () => {
      beforeEach(() => {
        action = new ActionService(env.ampdoc, env.win.document);
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

    describe('with non-null action whitelist', () => {
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
        expect(action.error_).to.be.calledWithMatch(
          /"AMP.print" is not whitelisted/
        );
      });

      it('should allow adding actions to the whitelist', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        action.addToWhitelist('AMP', 'print');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow adding action lists to the whitelist', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        action.addToWhitelist('AMP', ['print']);
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

      it('should supply default actions whitelist', () => {
        const i = getActionInvocation(target, 'toggleClass', 'AMP');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should not allow non-default actions', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        env.sandbox.stub(action, 'error_');
        expect(action.invoke_(i)).to.be.null;
        expect(action.error_).to.be.calledWithMatch(
          /"AMP.print" is not whitelisted/
        );
      });

      describe('default component actions', () => {
        beforeEach(() => {
          env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
        });

        it('should add actions to the whitelist for amp-carousel[type=slides]', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-carousel',
            {
              'type': 'slides',
              'width': '400',
              'height': '300',
            }
          );
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          let i = getActionInvocation(element, 'goToSlide');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'toggleAutoplay');
          env.sandbox.stub(action, 'error_');
          expect(action.invoke_(i)).to.be.null;
          expect(action.error_).to.be.calledWithMatch(
            /"AMP.CAROUSEL.toggleAutoplay" is not whitelisted/
          );
        });

        it('should add actions to the whitelist for amp-carousel[type=carousel]', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-carousel',
            {
              'type': 'carousel',
              'width': '400',
              'height': '300',
            }
          );
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          let i = getActionInvocation(element, 'goToSlide');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'toggleAutoplay');
          env.sandbox.stub(action, 'error_');
          expect(action.invoke_(i)).to.be.null;
          expect(action.error_).to.be.calledWithMatch(
            /"AMP.CAROUSEL.toggleAutoplay" is not whitelisted/
          );
        });

        it('should add actions to the whitelist for amp-form', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'form',
            {'method': 'POST'}
          );
          const nameElement = createElementWithAttributes(
            env.win.document,
            'input',
            {'name': 'name', 'value': 'John Miller'}
          );
          element.appendChild(nameElement);
          const submitBtn = createElementWithAttributes(
            env.win.document,
            'input',
            {'type': 'submit'}
          );

          element.appendChild(submitBtn);
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          const form = new AmpForm(element, 'test-id');
          const clearSpy = env.sandbox.stub(form, 'handleClearAction_');
          let i = getActionInvocation(element, 'clear');
          action.invoke_(i);
          expect(clearSpy).to.be.called;

          env.sandbox.stub(form, 'submit_');
          const submitSpy = env.sandbox.stub(form, 'handleSubmitAction_');
          i = getActionInvocation(element, 'submit');
          action.invoke_(i);
          await whenCalled(submitSpy);
          expect(submitSpy).to.be.calledWithExactly(i);
        });

        it('should add actions to the whitelist for amp-image-lightbox', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-image-lightbox',
            {'layout': 'nodisplay'}
          );
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          element.implementation_.buildLightbox_();
          const i = getActionInvocation(element, 'open');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);
        });

        it('should add actions to the whitelist for amp-lightbox', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-lightbox',
            {'layout': 'nodisplay'}
          );
          const img = createElementWithAttributes(env.win.document, 'amp-img', {
            'src': '/examples/img/sample.jpg',
            'width': '640',
            'height': '480',
          });
          element.appendChild(img);
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          let i = getActionInvocation(element, 'open');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'close');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);
        });

        it('should add actions to the whitelist for amp-list', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-list',
            {
              'width': '300',
              'height': '100',
              'src': 'https://data.com/list.json',
            }
          );
          env.win.document.body.appendChild(element);
          setExecElement(
            element,
            spy,
            env.sandbox.stub().returns({'items': []})
          );
          await whenUpgradedToCustomElement(element);
          env.sandbox.stub(element.implementation_, 'fetchList_');

          let i = getActionInvocation(element, 'changeToLayoutContainer');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'refresh');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);
        });

        it('should add actions to the whitelist for amp-selector', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-selector',
            {'layout': 'container'}
          );
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          let i = getActionInvocation(element, 'clear');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'selectDown');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'selectUp');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'toggle');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);
        });

        it('should add actions to the whitelist for amp-sidebar', async () => {
          const element = createElementWithAttributes(
            env.win.document,
            'amp-sidebar',
            {'layout': 'nodisplay'}
          );
          env.win.document.body.appendChild(element);
          setExecElement(element, spy, env.sandbox.stub());
          await whenUpgradedToCustomElement(element);

          let i = getActionInvocation(element, 'open');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'close');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);

          i = getActionInvocation(element, 'toggle');
          action.invoke_(i);
          expect(spy).to.be.calledWithExactly(i);
        });
      });
    });
  }
);
