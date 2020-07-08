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

import '../amp-sidebar';
import * as lolex from 'lolex';
import {ActionService} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {Keys} from '../../../../src/utils/key-codes';
import {Services} from '../../../../src/services';
import {assertScreenReaderElement} from '../../../../testing/test-helper';
import {clearModalStack, getModalStackLength} from '../../../../src/modal';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';

// Represents the correct value of KeyboardEvent.which for the Escape key
const KEYBOARD_EVENT_WHICH_ESCAPE = 27;

describes.realWin(
  'amp-sidebar 0.1 version',
  {
    win: {
      /* window spec */
      location: '...',
      historyOff: false,
    },
    amp: {
      /* amp spec */
      runtimeOn: false,
      extensions: ['amp-sidebar:0.1'],
    },
  },
  (env) => {
    let win, doc;
    let platform;
    let clock;
    let owners;
    let timer;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);
      platform = Services.platformFor(win);
      owners = Services.ownersForDoc(doc);
    });

    afterEach(() => {
      clearModalStack();
    });

    function getAmpSidebar(options) {
      options = options || {};
      const ampSidebar = doc.createElement('amp-sidebar');
      const list = doc.createElement('ul');
      for (let i = 0; i < 10; i++) {
        const li = doc.createElement('li');
        li.innerHTML = 'Menu item ' + i;
        list.appendChild(li);
      }
      ampSidebar.appendChild(list);
      const anchor = doc.createElement('a');
      anchor.href = '#section1';
      ampSidebar.appendChild(anchor);
      if (options.toolbars) {
        getToolbars(options, ampSidebar);
      }
      if (options.side) {
        ampSidebar.setAttribute('side', options.side);
      }
      if (options.closeText) {
        ampSidebar.setAttribute(
          'data-close-button-aria-label',
          options.closeText
        );
      }
      ampSidebar.setAttribute('id', 'sidebar1');
      ampSidebar.setAttribute('layout', 'nodisplay');
      doc.body.appendChild(ampSidebar);
      return ampSidebar
        .build()
        .then(() => {
          return ampSidebar.layoutCallback();
        })
        .then(() => {
          const impl = ampSidebar.implementation_;
          if (options.toolbars) {
            env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
              callback();
            });
          }
          env.sandbox.stub(impl, 'mutateElement').callsFake((callback) => {
            callback();
            return Promise.resolve();
          });

          if (options.stubHistory) {
            env.sandbox.stub(impl, 'getHistory_').returns({
              push: env.sandbox.stub().resolves(11),
              pop: env.sandbox.stub().resolves(11),
            });
          }
          return ampSidebar;
        });
    }

    function getToolbars(options, ampSidebar) {
      // Create our individual toolbars
      options.toolbars.forEach((toolbarObj) => {
        const navToolbar = doc.createElement('nav');

        //Create/Set toolbar-target
        const toolbarTarget = doc.createElement('div');
        if (toolbarObj.toolbarTarget) {
          toolbarTarget.setAttribute('id', toolbarObj.toolbarTarget);
          navToolbar.setAttribute('toolbar-target', toolbarObj.toolbarTarget);
        } else {
          toolbarTarget.setAttribute('id', 'toolbar-target');
          navToolbar.setAttribute('toolbar-target', 'toolbar-target');
        }
        doc.body.appendChild(toolbarTarget);

        // Set the toolbar media
        if (toolbarObj.media) {
          navToolbar.setAttribute('toolbar', toolbarObj.media);
        } else {
          navToolbar.setAttribute('toolbar', '(min-width: 768px)');
        }
        const toolbarList = doc.createElement('ul');
        for (let i = 0; i < 3; i++) {
          const li = doc.createElement('li');
          li.innerHTML = 'Toolbar item ' + i;
          toolbarList.appendChild(li);
        }
        navToolbar.appendChild(toolbarList);
        ampSidebar.appendChild(navToolbar);
      });
    }

    /** Helper for invoking open/close/toggle actions on amp-sidebar. */
    function execute(impl, method, trust = ActionTrust.HIGH) {
      impl.executeAction({
        method,
        trust,
        satisfiesTrust: (min) => trust >= min,
      });
    }

    describe('amp-sidebar', () => {
      it('should apply overlay class', () => {
        return getAmpSidebar().then((sidebarElement) => {
          assert(sidebarElement.classList.contains('i-amphtml-overlay'));
        });
      });

      it(
        'should replace text to screen reader ' +
          'button in data-close-button-aria-label',
        () => {
          return getAmpSidebar({
            'closeText': 'data-close-button-aria-label',
          }).then((sidebarElement) => {
            const closeButton = sidebarElement.lastElementChild;
            expect(closeButton.textContent).to.equal(
              'data-close-button-aria-label'
            );
          });
        }
      );

      it('should open from left is side is not specified', () => {
        return getAmpSidebar().then((sidebarElement) => {
          expect(sidebarElement.getAttribute('side')).to.equal('left');
        });
      });

      it('should open from right is side right is specified', () => {
        return getAmpSidebar({'side': 'right'}).then((sidebarElement) => {
          expect(sidebarElement.getAttribute('side')).to.equal('right');
        });
      });

      it('should create mask element in DOM', () => {
        return getAmpSidebar({'stubHistory': true}).then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          execute(impl, 'open');
          expect(
            doc.querySelectorAll('.i-amphtml-sidebar-mask').length
          ).to.equal(1);
        });
      });

      it('should create an invisible close button for screen readers only', () => {
        return getAmpSidebar().then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          impl.close_ = env.sandbox.spy();
          const closeButton = sidebarElement.lastElementChild;
          expect(closeButton).to.exist;
          expect(closeButton.tagName).to.equal('BUTTON');
          assertScreenReaderElement(closeButton, {index: 1});
          expect(closeButton.textContent).to.equal('Close the sidebar');
          expect(impl.close_).to.have.not.been.called;
          closeButton.click();
          expect(impl.close_).to.be.calledOnce;
        });
      });

      it('should open sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar();
        const impl = sidebarElement.implementation_;
        const screenReaderCloseButton = sidebarElement.querySelector(
          'button.i-amphtml-screen-reader'
        );
        clock = lolex.install({
          target: impl.win,
          toFake: ['Date', 'setTimeout'],
        });
        const historyPushSpy = env.sandbox.spy();
        const historyPopSpy = env.sandbox.spy();
        owners.scheduleLayout = env.sandbox.spy();
        impl.getHistory_ = function () {
          return {
            push() {
              historyPushSpy();
              return Promise.resolve(11);
            },
            pop() {
              historyPopSpy();
              return Promise.resolve(11);
            },
          };
        };

        impl.openOrCloseTimeOut_ = 10;

        execute(impl, 'open');
        await impl.mutateElement(() => {});
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
        expect(sidebarElement.getAttribute('role')).to.equal('menu');

        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
        expect(impl.historyId_).to.not.equal('-1');
        expect(owners.scheduleLayout).to.not.be.called;

        clock.tick(600);
        expect(doc.activeElement).to.equal(screenReaderCloseButton);
        expect(sidebarElement).to.not.have.display('none');
        expect(owners.scheduleLayout).to.be.calledOnce;

        // second call to open_() should be a no-op and not increase call
        // counts.
        execute(impl, 'open');
        await impl.mutateElement(() => {});
        expect(owners.scheduleLayout).to.be.calledOnce;
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
      });

      it('ignore repeated calls to open', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = sidebarElement.implementation_;

        execute(impl, 'open');
        expect(getModalStackLength()).to.equal(1);
        execute(impl, 'open');
        expect(getModalStackLength()).to.equal(1);
      });

      it('ignore repeated calls to close', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = sidebarElement.implementation_;

        execute(impl, 'open');
        execute(impl, 'close');
        // If this was not ignored, it would throw an error.
        execute(impl, 'close');
      });

      it('close on history back', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = sidebarElement.implementation_;

        execute(impl, 'open');

        // history "back"
        const history = impl.getHistory_();
        history.push.firstCall.args[0]();
        await new Promise((resolve) => {
          env.sandbox
            .stub(impl.action_, 'trigger')
            .callsFake((element, name) => {
              if (name == 'sidebarClose') {
                resolve();
              }
            });
        });

        expect(sidebarElement).to.have.display('none');
      });

      it('close on history back immediately for iOS', async () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'isSafari').returns(true);

        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = sidebarElement.implementation_;

        execute(impl, 'open');
        // history "back"
        const history = impl.getHistory_();
        history.push.firstCall.args[0]();

        expect(sidebarElement).to.have.display('none');
      });

      it('should close sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = sidebarElement.implementation_;
        clock = lolex.install({
          target: impl.win,
          toFake: ['Date', 'setTimeout'],
        });
        owners.schedulePause = env.sandbox.spy();
        const historyPushSpy = env.sandbox.spy();
        const historyPopSpy = env.sandbox.spy();
        owners.scheduleLayout = env.sandbox.spy();
        impl.getHistory_ = function () {
          return {
            push() {
              historyPushSpy();
              return Promise.resolve(11);
            },
            pop() {
              historyPopSpy();
              return Promise.resolve(11);
            },
          };
        };
        impl.historyId_ = 100;

        execute(impl, 'open');
        await impl.mutateElement(() => {});

        impl.openOrCloseTimeOut_ = 10;
        execute(impl, 'close');
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
        clock.tick(600);
        expect(sidebarElement).to.have.display('none');
        expect(owners.schedulePause).to.be.calledOnce;
        expect(historyPopSpy).to.be.calledOnce;
        expect(impl.historyId_).to.equal(-1);

        // second call to close_() should be a no-op and not increase call
        // counts.
        execute(impl, 'close');
        expect(owners.schedulePause).to.be.calledOnce;
        expect(historyPopSpy).to.be.calledOnce;
      });

      it('should toggle sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const screenReaderCloseButton = sidebarElement.querySelector(
          'button.i-amphtml-screen-reader'
        );
        const impl = sidebarElement.implementation_;
        clock = lolex.install({
          target: impl.win,
          toFake: ['Date', 'setTimeout'],
        });
        owners.scheduleLayout = env.sandbox.spy();
        owners.schedulePause = env.sandbox.spy();

        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
        expect(sidebarElement.getAttribute('role')).to.equal('menu');
        expect(doc.activeElement).to.not.equal(screenReaderCloseButton);

        execute(impl, 'toggle');

        await impl.mutateElement(() => {});
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
        clock.tick(600);
        expect(doc.activeElement).to.equal(screenReaderCloseButton);
        expect(sidebarElement).to.not.have.display('none');
        expect(owners.scheduleLayout).to.be.calledOnce;

        execute(impl, 'toggle');

        await impl.mutateElement(() => {});
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
        clock.tick(600);
        expect(sidebarElement).to.have.display('none');
        expect(owners.schedulePause).to.be.calledOnce;
      });

      it('should close sidebar on escape', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          clock = lolex.install({
            target: impl.win,
            toFake: ['Date', 'setTimeout'],
          });
          owners.schedulePause = env.sandbox.spy();

          expect(sidebarElement.hasAttribute('open')).to.be.false;
          execute(impl, 'open');
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          const eventObj = doc.createEventObject
            ? doc.createEventObject()
            : doc.createEvent('Events');
          if (eventObj.initEvent) {
            eventObj.initEvent('keydown', true, true);
          }
          eventObj.key = Keys.ESCAPE;
          eventObj.which = KEYBOARD_EVENT_WHICH_ESCAPE;
          const el = doc.documentElement;
          el.dispatchEvent
            ? el.dispatchEvent(eventObj)
            : el.fireEvent('onkeydown', eventObj);
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          clock.tick(600);
          expect(sidebarElement).to.have.display('none');
          expect(owners.schedulePause).to.be.calledOnce;
        });
      });

      it('should reflect state of the sidebar', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          clock = lolex.install({
            target: impl.win,
            toFake: ['Date', 'setTimeout'],
          });
          owners.schedulePause = env.sandbox.spy();
          owners.scheduleResume = env.sandbox.spy();

          expect(sidebarElement.hasAttribute('open')).to.be.false;
          clock.tick(600);
          expect(owners.schedulePause).to.have.not.been.called;
          expect(owners.scheduleResume).to.have.not.been.called;

          execute(impl, 'toggle');

          expect(sidebarElement.hasAttribute('open')).to.be.true;
          clock.tick(600);
          expect(owners.schedulePause).to.have.not.been.called;
          expect(owners.scheduleResume).to.be.calledOnce;

          execute(impl, 'toggle');

          expect(sidebarElement.hasAttribute('open')).to.be.false;
          clock.tick(600);
          expect(owners.schedulePause).to.be.calledOnce;
          expect(owners.scheduleResume).to.be.calledOnce;

          execute(impl, 'toggle');

          expect(sidebarElement.hasAttribute('open')).to.be.true;
          clock.tick(600);
          expect(owners.schedulePause).to.be.calledOnce;
          expect(owners.scheduleResume).to.have.callCount(2);

          execute(impl, 'toggle');

          expect(sidebarElement.hasAttribute('open')).to.be.false;
          clock.tick(600);
          expect(owners.schedulePause).to.have.callCount(2);
          expect(owners.scheduleResume).to.have.callCount(2);
        });
      });

      it.skip('should fix scroll leaks on ios safari', () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'isSafari').returns(true);
        return getAmpSidebar().then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          const scrollLeakSpy = env.sandbox.spy(
            impl,
            'fixIosElasticScrollLeak_'
          );
          impl.buildCallback();
          expect(scrollLeakSpy).to.be.calledOnce;
        });
      });

      it.skip('should adjust for IOS safari bottom bar', () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'isSafari').returns(true);
        return getAmpSidebar().then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          const compensateIosBottombarSpy = env.sandbox.spy(
            impl,
            'compensateIosBottombar_'
          );
          const initalChildrenCount = sidebarElement.children.length;
          execute(impl, 'open');
          expect(compensateIosBottombarSpy).to.be.calledOnce;
          // 10 lis + one top padding element inserted
          expect(sidebarElement.children.length).to.equal(
            initalChildrenCount + 1
          );
        });
      });

      it('should close sidebar if clicked on a non-local anchor', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const anchor = sidebarElement.getElementsByTagName('a')[0];
          anchor.href = '#newloc';
          const impl = sidebarElement.implementation_;
          clock = lolex.install({
            target: impl.win,
            toFake: ['Date', 'setTimeout'],
          });
          owners.schedulePause = env.sandbox.spy();
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          execute(impl, 'open');
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          const eventObj = doc.createEventObject
            ? doc.createEventObject()
            : doc.createEvent('Events');
          if (eventObj.initEvent) {
            eventObj.initEvent('click', true, true);
          }
          const ampDoc = sidebarElement.getAmpDoc();
          env.sandbox.stub(ampDoc, 'getUrl').returns(window.location.href);
          anchor.dispatchEvent
            ? anchor.dispatchEvent(eventObj)
            : anchor.fireEvent('onkeydown', eventObj);
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          clock.tick(600);
          expect(sidebarElement).to.have.display('none');
          expect(owners.schedulePause).to.be.calledOnce;
        });
      });

      it('should not close sidebar if clicked on a new origin navigation', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const anchor = sidebarElement.getElementsByTagName('a')[0];
          anchor.href = '#newloc';
          const impl = sidebarElement.implementation_;
          owners.schedulePause = env.sandbox.spy();
          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          execute(impl, 'open');
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          const eventObj = doc.createEventObject
            ? doc.createEventObject()
            : doc.createEvent('Events');
          if (eventObj.initEvent) {
            eventObj.initEvent('click', true, true);
          }
          const ampDoc = sidebarElement.getAmpDoc();
          env.sandbox.stub(ampDoc, 'getUrl').returns('http://example.com');
          anchor.dispatchEvent
            ? anchor.dispatchEvent(eventObj)
            : anchor.fireEvent('onkeydown', eventObj);
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          expect(sidebarElement).to.not.have.display('');
          expect(owners.schedulePause).to.have.not.been.called;
        });
      });

      it('should not close sidebar if clicked on new page navigation', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const anchor = sidebarElement.getElementsByTagName('a')[0];
          anchor.href = '#newloc';
          const impl = sidebarElement.implementation_;
          owners.schedulePause = env.sandbox.spy();

          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          execute(impl, 'open');
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          const eventObj = doc.createEventObject
            ? doc.createEventObject()
            : doc.createEvent('Events');
          if (eventObj.initEvent) {
            eventObj.initEvent('click', true, true);
          }
          const ampDoc = sidebarElement.getAmpDoc();
          env.sandbox
            .stub(ampDoc, 'getUrl')
            .returns('http://localhost:9876/context.html?old=context');
          anchor.dispatchEvent
            ? anchor.dispatchEvent(eventObj)
            : anchor.fireEvent('onkeydown', eventObj);
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          expect(sidebarElement).to.not.have.display('');
          expect(owners.schedulePause).to.have.not.been.called;
        });
      });

      it('should not close sidebar if clicked on non-anchor', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const li = sidebarElement.getElementsByTagName('li')[0];
          const impl = sidebarElement.implementation_;
          owners.schedulePause = env.sandbox.spy();

          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          expect(sidebarElement.hasAttribute('open')).to.be.false;
          execute(impl, 'open');
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          const eventObj = doc.createEventObject
            ? doc.createEventObject()
            : doc.createEvent('Events');
          if (eventObj.initEvent) {
            eventObj.initEvent('click', true, true);
          }
          li.dispatchEvent
            ? li.dispatchEvent(eventObj)
            : li.fireEvent('onkeydown', eventObj);
          expect(sidebarElement.hasAttribute('open')).to.be.true;
          expect(sidebarElement.hasAttribute('aria-hidden')).to.be.false;
          expect(sidebarElement).to.not.have.display('');
          expect(owners.schedulePause).to.have.not.been.called;
        });
      });

      it('should trigger actions on open and close', () => {
        return getAmpSidebar({stubHistory: true}).then((sidebarElement) => {
          const impl = sidebarElement.implementation_;
          const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
          env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
            callback();
          });
          owners.scheduleLayout = env.sandbox.stub();

          execute(impl, 'open', /* trust */ 123);
          expect(triggerSpy).to.be.calledOnce;
          expect(triggerSpy).to.be.calledWith(
            impl.element,
            'sidebarOpen',
            env.sandbox.match.any,
            /* trust */ 123
          );

          execute(impl, 'close', /* trust */ 456);
          expect(triggerSpy).to.be.calledTwice;
          expect(triggerSpy).to.be.calledWith(
            impl.element,
            'sidebarClose',
            env.sandbox.match.any,
            /* trust */ 456
          );
        });
      });
    });

    describe('amp-sidebar - toolbars in amp-sidebar', () => {
      // Tests for amp-sidebar 1.0
      it('should not create toolbars without <nav toolbar />', () => {
        return getAmpSidebar().then((sidebarElement) => {
          const headerElements = doc.getElementsByTagName('header');
          const toolbarElements = doc.querySelectorAll('[toolbar]');
          expect(headerElements.length).to.be.equal(0);
          expect(toolbarElements.length).to.be.equal(0);
          expect(sidebarElement.implementation_.toolbars_.length).to.be.equal(
            0
          );
        });
      });

      it('should create a toolbar element within the toolbar-target', () => {
        return getAmpSidebar({
          toolbars: [{}],
        }).then((sidebarElement) => {
          expect(sidebarElement.implementation_.toolbars_.length).to.be.equal(
            1
          );
        });
      });

      it(
        'should create multiple toolbar elements, ' +
          'within their respective containers',
        () => {
          return getAmpSidebar({
            toolbars: [
              {},
              {
                media: '(min-width: 1024px)',
              },
            ],
          }).then((sidebarElement) => {
            expect(sidebarElement.implementation_.toolbars_.length).to.be.equal(
              2
            );
          });
        }
      );
    });
  }
);

describes.realWin(
  'amp-sidebar component with runtime on',
  {
    amp: {
      extensions: ['amp-sidebar:0.1'],
      runtimeOn: true,
    },
  },
  (env) => {
    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = createElementWithAttributes(
        env.win.document,
        'amp-sidebar',
        {'layout': 'nodisplay'}
      );
      env.win.document.body.appendChild(element);
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();

      ['open', 'close', 'toggle'].forEach((method) => {
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
  }
);
