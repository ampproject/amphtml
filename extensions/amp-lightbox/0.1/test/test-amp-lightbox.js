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

import '../amp-lightbox';
import * as dom from '../../../../src/dom';
import {ActionService} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {Keys} from '../../../../src/utils/key-codes';
import {Services} from '../../../../src/services';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'amp-lightbox component',
  {
    amp: {
      extensions: ['amp-lightbox'],
      runtimeOn: true,
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function createLightbox() {
      const element = dom.createElementWithAttributes(doc, 'amp-lightbox', {
        'id': 'myLightbox',
        'layout': 'nodisplay',
      });
      doc.body.appendChild(element);

      return element;
    }

    function createOpeningButton(id) {
      const button = dom.createElementWithAttributes(doc, 'button', {
        'id': id,
        'on': 'tap:myLightbox.open',
      });
      button.textContent = 'Open lightbox';
      doc.body.appendChild(button);
      return button;
    }

    function createCloseButton() {
      const button = dom.createElementWithAttributes(doc, 'button', {
        'id': 'closeButton',
        'on': 'tap:myLightbox.close',
      });
      button.textContent = 'X';
      return button;
    }

    function createLink(id) {
      const oneLink = dom.createElementWithAttributes(doc, 'a', {
        'href': 'https://amp.dev/',
        'id': id,
      });
      oneLink.textContent = 'Something to focus on';
      return oneLink;
    }

    it('should allow default actions in email documents', async () => {
      doc.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, doc);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = createLightbox();
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      await dom.whenUpgradedToCustomElement(element);

      ['open', 'close'].forEach((method) => {
        action.execute(
          element,
          method,
          null,
          'source',
          'caller',
          'event',
          ActionTrust.HIGH
        );
        expect(element.enqueAction).to.be.calledWith(
          env.sandbox.match({
            actionEventType: '?',
            args: null,
            caller: 'caller',
            event: 'event',
            method,
            node: element,
            source: 'source',
            trust: ActionTrust.HIGH,
          })
        );
      });
    });

    it('should close on ESC', () => {
      const lightbox = createLightbox();
      const impl = lightbox.implementation_;
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const sourceElement = createOpeningButton('openBtn');
      const setupCloseSpy = env.sandbox.spy(impl, 'close');

      impl.open_({caller: sourceElement});
      impl.closeOnEscape_(new KeyboardEvent('keydown', {key: Keys.ENTER}));
      impl.closeOnEscape_(new KeyboardEvent('keydown', {key: Keys.ESCAPE}));
      expect(setupCloseSpy).to.be.calledOnce;
    });

    it('should not change focus or create a button if a focus has been made in the modal', () => {
      const openButton = createOpeningButton('openingButton');
      const lightbox = createLightbox();
      const myLink = createLink('randomLink');
      myLink.setAttribute('autofocus', '');
      lightbox.appendChild(myLink);

      const impl = lightbox.implementation_;
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };
      env.sandbox.stub(impl, 'hasCurrentFocus_').returns(true);
      const focusInModalSpy = env.sandbox.spy(impl, 'focusInModal_');
      const tryFocusSpy = env.sandbox.spy(dom, 'tryFocus');
      const createSRBtnSpy = env.sandbox.spy(
        impl,
        'createScreenReaderCloseButton_'
      );

      openButton.click();

      return whenCalled(focusInModalSpy).then(() => {
        expect(tryFocusSpy).to.be.calledWith(myLink);
        expect(createSRBtnSpy).not.to.be.called;
      });
    });

    it('should focus on close button if no handmade focus but has close button', () => {
      const lightbox = createLightbox();
      const closeButton = createCloseButton();
      lightbox.appendChild(closeButton);
      const impl = lightbox.implementation_;

      const tryFocusSpy = env.sandbox.spy(dom, 'tryFocus');
      const finalizeSpy = env.sandbox.spy(impl, 'finalizeOpen_');
      const createCloseButtonSpy = env.sandbox.spy(
        impl,
        'createScreenReaderCloseButton_'
      );
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const args = {};
      const openInvocation = {
        method: 'open',
        args,
        satisfiesTrust: () => true,
      };
      impl.executeAction(openInvocation);

      return whenCalled(finalizeSpy).then(() => {
        expect(createCloseButtonSpy).not.to.be.calledWith(closeButton);
        expect(tryFocusSpy).to.be.calledWith(closeButton);
      });
    });

    it('should create close button and focus on it if no handmade focus and no close button', () => {
      const lightbox = createLightbox();

      const impl = lightbox.implementation_;
      const tryFocusSpy = env.sandbox.spy(dom, 'tryFocus');
      const finalizeSpy = env.sandbox.spy(impl, 'finalizeOpen_');
      const createCloseButtonSpy = env.sandbox.spy(
        impl,
        'createScreenReaderCloseButton_'
      );
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const args = {};
      const openInvocation = {
        method: 'open',
        args,
        satisfiesTrust: () => true,
      };
      impl.executeAction(openInvocation);

      return whenCalled(finalizeSpy).then(() => {
        expect(createCloseButtonSpy).to.be.calledOnce;
        expect(tryFocusSpy).to.be.calledOnce;
      });
    });

    it('should stay in modal if focus stays in modal and close if outside', () => {
      const lightbox = createLightbox();
      const insideLink = createLink('insideLink');
      lightbox.appendChild(insideLink);
      const impl = lightbox.implementation_;

      const outsideLink = createLink('outsideLink');
      doc.body.appendChild(outsideLink);

      const finalizeSpy = env.sandbox.spy(impl, 'finalizeOpen_');
      const hasFocusStub = env.sandbox.stub(impl, 'hasCurrentFocus_');

      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const args = {};
      const openInvocation = {
        method: 'open',
        args,
        satisfiesTrust: () => true,
      };
      impl.executeAction(openInvocation);

      return whenCalled(finalizeSpy).then(() => {
        const closeSpy = env.sandbox.spy(impl, 'close');

        hasFocusStub.returns(true);
        dom.tryFocus(insideLink);
        expect(closeSpy).not.to.be.called;

        hasFocusStub.returns(false);
        dom.tryFocus(outsideLink);
        expect(closeSpy).to.be.calledOnce;
      });
    });

    it('should return focus to source element after close', () => {
      const openButton = createOpeningButton('openingButton');
      const lightbox = createLightbox();
      const closeButton = createCloseButton();
      lightbox.appendChild(closeButton);
      const impl = lightbox.implementation_;

      const openSpy = env.sandbox.spy(impl, 'finalizeOpen_');
      const closeSpy = env.sandbox.spy(impl, 'finalizeClose_');
      const tryFocusSpy = env.sandbox.spy(dom, 'tryFocus');
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      openButton.click();
      whenCalled(openSpy).then(() => closeButton.click());

      return whenCalled(closeSpy).then(() => {
        expect(tryFocusSpy).to.be.calledWith(openButton);
      });
    });

    it('should create `i-amphtml-ad-close-header` but no close button if param then focus on it', () => {
      const lightbox = createLightbox();
      lightbox.setAttribute('close-button', '');
      const impl = lightbox.implementation_;

      const tryFocusSpy = env.sandbox.spy(dom, 'tryFocus');
      const finalizeSpy = env.sandbox.spy(impl, 'finalizeOpen_');
      const tieSpy = env.sandbox.spy(impl, 'tieCloseButton_');
      const createCloseButtonSpy = env.sandbox.spy(
        impl,
        'createScreenReaderCloseButton_'
      );
      impl.getHistory_ = () => {
        return {
          pop: () => {},
          push: () => Promise.resolve(11),
        };
      };

      const args = {};
      const openInvocation = {
        method: 'open',
        args,
        satisfiesTrust: () => true,
      };
      impl.executeAction(openInvocation);

      return whenCalled(finalizeSpy).then(() => {
        expect(createCloseButtonSpy).not.to.be.called;
        expect(tieSpy).to.be.calledOnce;
        expect(tryFocusSpy).to.be.calledWith(impl.closeButtonHeader_);
      });
    });
  }
);
