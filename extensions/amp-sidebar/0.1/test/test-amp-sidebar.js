import '../amp-sidebar';
import * as fakeTimers from '@sinonjs/fake-timers';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {clearModalStack, getModalStackLength} from '#core/dom/modal';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {assertScreenReaderElement} from '#testing/helpers/service';

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
      if (options.disableSwipe) {
        ampSidebar.setAttribute('data-disable-swipe-close', '');
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
        .buildInternal()
        .then(() => {
          return ampSidebar.layoutCallback();
        })
        .then(() => ampSidebar.getImpl(false))
        .then((impl) => {
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
    function execute(impl, method, trust = ActionTrust_Enum.HIGH) {
      impl.executeAction({
        method,
        trust,
        satisfiesTrust: (min) => trust >= min,
      });
    }

    describe('amp-sidebar', () => {
      it('should apply overlay class', async () => {
        const sidebarElement = await getAmpSidebar();
        assert(sidebarElement.classList.contains('i-amphtml-overlay'));
      });

      it(
        'should replace text to screen reader ' +
          'button in data-close-button-aria-label',
        async () => {
          const sidebarElement = await getAmpSidebar({
            'closeText': 'data-close-button-aria-label',
          });
          const closeButton = sidebarElement.lastElementChild;
          expect(closeButton.textContent).to.equal(
            'data-close-button-aria-label'
          );
        }
      );

      it('should open from left is side is not specified', async () => {
        const sidebarElement = await getAmpSidebar();
        expect(sidebarElement.getAttribute('side')).to.equal('left');
      });

      it('should open from right is side right is specified', async () => {
        const sidebarElement = await getAmpSidebar({'side': 'right'});
        expect(sidebarElement.getAttribute('side')).to.equal('right');
      });

      it('should create mask element in DOM', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);
        execute(impl, 'open');
        expect(doc.querySelectorAll('.i-amphtml-sidebar-mask').length).to.equal(
          1
        );
      });

      it('should create styleable mask element in DOM', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);
        execute(impl, 'open');
        expect(doc.querySelectorAll('.amp-sidebar-mask').length).to.equal(1);
      });

      it('should create an invisible close button for screen readers only', async () => {
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);
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

      it('should open sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);
        env.sandbox.stub(sidebarElement, 'setAsContainerInternal');
        env.sandbox.stub(sidebarElement, 'removeAsContainerInternal');
        const screenReaderCloseButton = sidebarElement.querySelector(
          'button.i-amphtml-screen-reader'
        );
        clock = fakeTimers.withGlobal(impl.win).install({
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

        expect(sidebarElement.setAsContainerInternal).to.be.calledOnce;
        expect(sidebarElement.removeAsContainerInternal).to.not.be.called;
      });

      it('ignore repeated calls to open', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);

        execute(impl, 'open');
        expect(getModalStackLength()).to.equal(1);
        execute(impl, 'open');
        expect(getModalStackLength()).to.equal(1);
      });

      it('ignore repeated calls to close', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);

        execute(impl, 'open');
        execute(impl, 'close');
        // If this was not ignored, it would throw an error.
        execute(impl, 'close');
      });

      it('close on history back', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);

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
        const impl = await sidebarElement.getImpl(false);

        execute(impl, 'open');
        // history "back"
        const history = impl.getHistory_();
        history.push.firstCall.args[0]();

        expect(sidebarElement).to.have.display('none');
      });

      it('should close sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar({'stubHistory': true});
        const impl = await sidebarElement.getImpl(false);
        env.sandbox.stub(sidebarElement, 'setAsContainerInternal');
        env.sandbox.stub(sidebarElement, 'removeAsContainerInternal');
        clock = fakeTimers.withGlobal(impl.win).install({
          toFake: ['Date', 'setTimeout'],
        });

        // Sidebar has a child.
        const child = createElementWithAttributes(doc, 'amp-img', {
          layout: 'nodisplay',
        });
        sidebarElement.appendChild(child);
        env.sandbox.stub(child, 'unmount');

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

        expect(sidebarElement.removeAsContainerInternal).to.be.calledOnce;
        expect(child.unmount).to.be.calledOnce;
      });

      it('should toggle sidebar on button click', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const screenReaderCloseButton = sidebarElement.querySelector(
          'button.i-amphtml-screen-reader'
        );
        const impl = await sidebarElement.getImpl(false);
        clock = fakeTimers.withGlobal(impl.win).install({
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

      it('should close sidebar on escape', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const impl = await sidebarElement.getImpl(false);
        clock = fakeTimers.withGlobal(impl.win).install({
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
        eventObj.key = Keys_Enum.ESCAPE;
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

      it('should reflect state of the sidebar', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const impl = await sidebarElement.getImpl(false);
        clock = fakeTimers.withGlobal(impl.win).install({
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

      it.skip('should fix scroll leaks on ios safari', async () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'isSafari').returns(true);
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);
        env.sandbox.stub(timer, 'delay').callsFake(function (callback) {
          callback();
        });
        const scrollLeakSpy = env.sandbox.spy(impl, 'fixIosElasticScrollLeak_');
        impl.buildCallback();
        expect(scrollLeakSpy).to.be.calledOnce;
      });

      it.skip('should adjust for IOS safari bottom bar', async () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'isSafari').returns(true);
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);
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

      it('should close sidebar if clicked on a non-local anchor', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const anchor = sidebarElement.getElementsByTagName('a')[0];
        anchor.href = '#newloc';
        const impl = await sidebarElement.getImpl(false);
        clock = fakeTimers.withGlobal(impl.win).install({
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

      it('should not close sidebar if clicked on a new origin navigation', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const anchor = sidebarElement.getElementsByTagName('a')[0];
        anchor.href = '#newloc';
        const impl = await sidebarElement.getImpl(false);
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

      it('should not close sidebar if clicked on new page navigation', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const anchor = sidebarElement.getElementsByTagName('a')[0];
        anchor.href = '#newloc';
        const impl = await sidebarElement.getImpl(false);
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

      it('should not close sidebar if clicked on non-anchor', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const li = sidebarElement.getElementsByTagName('li')[0];
        const impl = await sidebarElement.getImpl(false);
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

      it('should trigger actions on open and close', async () => {
        const sidebarElement = await getAmpSidebar({stubHistory: true});
        const impl = await sidebarElement.getImpl(false);
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

      it('should disable swipe to close when attribute specified', async () => {
        const sidebarElement = await getAmpSidebar({disableSwipe: true});
        const impl = await sidebarElement.getImpl(false);
        expect(impl.disableSwipeClose_).to.be.true;
      });

      it('should not allow swipe on input range (slider) element', async () => {
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);

        const swipeMoveStub = env.sandbox.stub(
          impl.swipeToDismiss_,
          'swipeMove'
        );

        // Do not trigger swipeMove when swiping on an input range element
        const slider = document.createElement('input');
        slider.setAttribute('type', 'range');
        const fakeEvent = {target: slider};
        impl.handleSwipe_({}, fakeEvent);
        expect(swipeMoveStub).to.not.be.called;

        // Call swipeMove when swiping on any other type of element
        const input = document.createElement('input');
        const fakeEvent2 = {target: input};
        impl.handleSwipe_({}, fakeEvent2);
        expect(swipeMoveStub).to.be.called.calledOnce;
      });
    });

    describe('amp-sidebar - toolbars in amp-sidebar', () => {
      // Tests for amp-sidebar 1.0
      it('should not create toolbars without <nav toolbar />', async () => {
        const sidebarElement = await getAmpSidebar();
        const impl = await sidebarElement.getImpl(false);
        const headerElements = doc.getElementsByTagName('header');
        const toolbarElements = doc.querySelectorAll('[toolbar]');
        expect(headerElements.length).to.be.equal(0);
        expect(toolbarElements.length).to.be.equal(0);
        expect(impl.toolbars_.length).to.be.equal(0);
      });

      it('should create a toolbar element within the toolbar-target', async () => {
        const sidebarElement = await getAmpSidebar({
          toolbars: [{}],
        });
        const impl = await sidebarElement.getImpl(false);
        expect(impl.toolbars_.length).to.be.equal(1);
      });

      it(
        'should create multiple toolbar elements, ' +
          'within their respective containers',
        async () => {
          const sidebarElement = await getAmpSidebar({
            toolbars: [
              {},
              {
                media: '(min-width: 1024px)',
              },
            ],
          });
          const impl = await sidebarElement.getImpl(false);
          expect(impl.toolbars_.length).to.be.equal(2);
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
          ActionTrust_Enum.HIGH
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
            trust: ActionTrust_Enum.HIGH,
          })
        );
      });
    });
  }
);
