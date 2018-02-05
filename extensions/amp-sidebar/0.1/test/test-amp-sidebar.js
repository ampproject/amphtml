
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
import {KeyCodes} from '../../../../src/utils/key-codes';
import {Services} from '../../../../src/services';
import {assertScreenReaderElement} from '../../../../testing/test-helper';


describes.realWin('amp-sidebar 0.1 version', {
  win: { /* window spec */
    location: '...',
    historyOff: false,
  },
  amp: { /* amp spec */
    runtimeOn: false,
    extensions: ['amp-sidebar:0.1'],
  },
}, env => {
  let win, doc;
  let platform;
  let clock;
  let timer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    timer = Services.timerFor(win);
    platform = Services.platformFor(win);
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
    if (options.open) {
      ampSidebar.setAttribute('open', '');
    }
    if (options.closeText) {
      ampSidebar.setAttribute('data-close-button-aria-label',
          options.closeText);
    };
    ampSidebar.setAttribute('id', 'sidebar1');
    ampSidebar.setAttribute('layout', 'nodisplay');
    doc.body.appendChild(ampSidebar);
    return ampSidebar.build().then(() => {
      return ampSidebar.layoutCallback();
    }).then(() => {
      if (options.toolbars) {
        sandbox.stub(timer, 'delay').callsFake(function(callback) {
          callback();
        });
      }
      return ampSidebar;
    });
  }

  function getToolbars(options, ampSidebar) {
    // Stub our sidebar operations, doing this here as it will
    // Ease testing our media queries
    const impl = ampSidebar.implementation_;
    sandbox.stub(impl.vsync_, 'mutate').callsFake(callback => {
      callback();
    });
    sandbox.stub(impl.vsync_, 'mutatePromise').callsFake(callback => {
      callback();
      return Promise.resolve();
    });
    // Create our individual toolbars
    options.toolbars.forEach(toolbarObj => {
      const navToolbar = doc.createElement('nav');

      //Create/Set toolbar-target
      const toolbarTarget = doc.createElement('div');
      if (toolbarObj.toolbarTarget) {
        toolbarTarget.setAttribute('id',
            toolbarObj.toolbarTarget);
        navToolbar.setAttribute('toolbar-target',
            toolbarObj.toolbarTarget);
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

  describe('amp-sidebar', () => {
    it('should apply overlay class', () => {
      return getAmpSidebar().then(sidebarElement => {
        expect(sidebarElement.classList.contains('i-amphtml-overlay'));
      });
    });

    it('should replace text to screen reader \
    button in data-close-button-aria-label', () => {
          return getAmpSidebar({'closeText':
        'data-close-button-aria-label'}).then(sidebarElement => {
            const closeButton = sidebarElement.lastElementChild;
            expect(closeButton.textContent)
                .to.equal('data-close-button-aria-label');
          });
        });

    it('should open from left is side is not specified', () => {
      return getAmpSidebar().then(sidebarElement => {
        expect(sidebarElement.getAttribute('side')).to.equal('left');
      });
    });

    it('should open from right is side right is specified', () => {
      return getAmpSidebar({'side': 'right'}).then(sidebarElement => {
        expect(sidebarElement.getAttribute('side')).to.equal('right');
      });
    });

    it('should create mask element in DOM', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        impl.open_();
        expect(doc.querySelectorAll('.i-amphtml-sidebar-mask').length)
            .to.equal(1);
      });
    });

    it('should create an invisible close \
    button for screen readers only', () => {
          return getAmpSidebar().then(sidebarElement => {
            const impl = sidebarElement.implementation_;
            impl.close_ = sandbox.spy();
            const closeButton = sidebarElement.lastElementChild;
            expect(closeButton).to.exist;
            expect(closeButton.tagName).to.equal('BUTTON');
            assertScreenReaderElement(closeButton);
            expect(closeButton.textContent).to.equal('Close the sidebar');
            expect(impl.close_).to.have.not.been.called;
            closeButton.click();
            expect(impl.close_).to.be.calledOnce;
          });
        });

    it('should open sidebar on button click', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        const historyPushSpy = sandbox.spy();
        const historyPopSpy = sandbox.spy();
        impl.scheduleLayout = sandbox.spy();
        impl.getHistory_ = function() {
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
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        impl.openOrCloseTimeOut_ = 10;

        impl.open_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        expect(sidebarElement.getAttribute('role')).to.equal('menu');

        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;
        expect(impl.historyId_).to.not.equal('-1');
        expect(impl.scheduleLayout).to.not.be.called;

        clock.tick(600);
        expect(doc.activeElement).to.equal(sidebarElement);
        expect(sidebarElement.style.display).to.equal('');
        expect(impl.scheduleLayout).to.be.calledOnce;

        // second call to open_() should be a no-op and not increase call counts.
        impl.open_();
        expect(impl.scheduleLayout).to.be.calledOnce;
        expect(historyPushSpy).to.be.calledOnce;
        expect(historyPopSpy).to.have.not.been.called;

      });
    });

    it('should close sidebar on button click', () => {
      return getAmpSidebar({'open': true}).then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.schedulePause = sandbox.spy();
        const historyPushSpy = sandbox.spy();
        const historyPopSpy = sandbox.spy();
        impl.scheduleLayout = sandbox.spy();
        impl.getHistory_ = function() {
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
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };

        impl.openOrCloseTimeOut_ = 10;
        impl.close_();
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
        clock.tick(600);
        expect(sidebarElement.style.display).to.equal('none');
        expect(impl.schedulePause).to.be.calledOnce;
        expect(historyPopSpy).to.be.calledOnce;
        expect(impl.historyId_).to.equal(-1);

        // second call to close_() should be a no-op and not increase call counts.
        impl.close_();
        expect(impl.schedulePause).to.be.calledOnce;
        expect(historyPopSpy).to.be.calledOnce;
      });
    });

    it('should toggle sidebar on button click', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.scheduleLayout = sandbox.spy();
        impl.schedulePause = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };

        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
        expect(sidebarElement.getAttribute('role')).to.equal('menu');
        expect(doc.activeElement).to.not.equal(sidebarElement);
        impl.toggle_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        clock.tick(600);
        expect(doc.activeElement).to.equal(sidebarElement);
        expect(sidebarElement.style.display).to.equal('');
        expect(impl.scheduleLayout).to.be.calledOnce;
        impl.toggle_();
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
        clock.tick(600);
        expect(sidebarElement.style.display).to.equal('none');
        expect(impl.schedulePause).to.be.calledOnce;
      });
    });

    it('should close sidebar on escape', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.schedulePause = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        impl.open_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        const eventObj = doc.createEventObject ?
          doc.createEventObject() : doc.createEvent('Events');
        if (eventObj.initEvent) {
          eventObj.initEvent('keydown', true, true);
        }
        eventObj.keyCode = KeyCodes.ESCAPE;
        eventObj.which = KeyCodes.ESCAPE;
        const el = doc.documentElement;
        el.dispatchEvent ?
          el.dispatchEvent(eventObj) : el.fireEvent('onkeydown', eventObj);
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
        clock.tick(600);
        expect(sidebarElement.style.display).to.equal('none');
        expect(impl.schedulePause).to.be.calledOnce;
      });
    });

    it('should reflect state of the sidebar', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.schedulePause = sandbox.spy();
        impl.scheduleResume = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };

        expect(impl.isOpen_()).to.be.false;
        clock.tick(600);
        expect(impl.schedulePause).to.have.not.been.called;
        expect(impl.scheduleResume).to.have.not.been.called;
        impl.toggle_();
        expect(impl.isOpen_()).to.be.true;
        clock.tick(600);
        expect(impl.schedulePause).to.have.not.been.called;
        expect(impl.scheduleResume).to.be.calledOnce;
        impl.toggle_();
        expect(impl.isOpen_()).to.be.false;
        clock.tick(600);
        expect(impl.schedulePause).to.be.calledOnce;
        expect(impl.scheduleResume).to.be.calledOnce;
        impl.toggle_();
        expect(impl.isOpen_()).to.be.true;
        clock.tick(600);
        expect(impl.schedulePause).to.be.calledOnce;
        expect(impl.scheduleResume).to.have.callCount(2);
        impl.toggle_();
        expect(impl.isOpen_()).to.be.false;
        clock.tick(600);
        expect(impl.schedulePause).to.have.callCount(2);
        expect(impl.scheduleResume).to.have.callCount(2);
      });
    });

    it.skip('should fix scroll leaks on ios safari', () => {
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(true);
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        sandbox.stub(timer, 'delay').callsFake(function(callback) {
          callback();
        });
        const scrollLeakSpy = sandbox.spy(impl, 'fixIosElasticScrollLeak_');
        impl.buildCallback();
        expect(scrollLeakSpy).to.be.calledOnce;
      });
    });

    it.skip('should adjust for IOS safari bottom bar', () => {
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(true);
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        sandbox.stub(timer, 'delay').callsFake(function(callback) {
          callback();
        });
        const compensateIosBottombarSpy =
            sandbox.spy(impl, 'compensateIosBottombar_');
        const initalChildrenCount = sidebarElement.children.length;
        impl.open_();
        expect(compensateIosBottombarSpy).to.be.calledOnce;
        // 10 lis + one top padding element inserted
        expect(sidebarElement.children.length)
            .to.equal(initalChildrenCount + 1);
      });
    });

    it('should close sidebar if clicked on a non-local anchor', () => {
      return getAmpSidebar().then(sidebarElement => {
        const anchor = sidebarElement.getElementsByTagName('a')[0];
        anchor.href = '#newloc';
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.schedulePause = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        impl.open_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        const eventObj = doc.createEventObject ?
          doc.createEventObject() : doc.createEvent('Events');
        if (eventObj.initEvent) {
          eventObj.initEvent('click', true, true);
        }
        sandbox.stub(sidebarElement, 'getAmpDoc').callsFake(() => {
          return {
            win: {
              location: {
                href: window.location.href,
              },
            },
          };
        });
        anchor.dispatchEvent ?
          anchor.dispatchEvent(eventObj) :
          anchor.fireEvent('onkeydown', eventObj);
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
        clock.tick(600);
        expect(sidebarElement.style.display).to.equal('none');
        expect(impl.schedulePause).to.be.calledOnce;
      });
    });

    it('should not close sidebar if \
       clicked on a new origin navigation', () => {
          return getAmpSidebar().then(sidebarElement => {
            const anchor = sidebarElement.getElementsByTagName('a')[0];
            anchor.href = '#newloc';
            const impl = sidebarElement.implementation_;
            impl.schedulePause = sandbox.spy();
            impl.vsync_ = {
              mutate(callback) {
                callback();
              },
            };
            sandbox.stub(timer, 'delay').callsFake(function(callback) {
              callback();
            });
            expect(sidebarElement.hasAttribute('open')).to.be.false;
            impl.open_();
            expect(sidebarElement.hasAttribute('open')).to.be.true;
            expect(sidebarElement.getAttribute('aria-hidden')).to.equal(
                'false');
            const eventObj = doc.createEventObject ?
              doc.createEventObject() : doc.createEvent('Events');
            if (eventObj.initEvent) {
              eventObj.initEvent('click', true, true);
            }
            sandbox.stub(sidebarElement, 'getAmpDoc').callsFake(() => {
              return {
                win: {
                  location: {
                    // Mocking navigating from example.com -> localhost:9876
                    href: 'http://example.com',
                  },
                },
              };
            });
            anchor.dispatchEvent ?
              anchor.dispatchEvent(eventObj) :
              anchor.fireEvent('onkeydown', eventObj);
            expect(sidebarElement.hasAttribute('open')).to.be.true;
            expect(sidebarElement.getAttribute('aria-hidden')).to.equal(
                'false');
            expect(sidebarElement.style.display).to.equal('');
            expect(impl.schedulePause).to.have.not.been.called;
          });
        });

    it('should not close sidebar if clicked on new page navigation', () => {
      return getAmpSidebar().then(sidebarElement => {
        const anchor = sidebarElement.getElementsByTagName('a')[0];
        anchor.href = '#newloc';
        const impl = sidebarElement.implementation_;
        impl.schedulePause = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        sandbox.stub(timer, 'delay').callsFake(function(callback) {
          callback();
        });
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        impl.open_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        const eventObj = doc.createEventObject ?
          doc.createEventObject() : doc.createEvent('Events');
        if (eventObj.initEvent) {
          eventObj.initEvent('click', true, true);
        }
        sandbox.stub(sidebarElement, 'getAmpDoc').callsFake(() => {
          return {
            win: {
              location: {
                // Mocking navigating from
                // /context.html?old=context -> /context.html
                href: 'http://localhost:9876/context.html?old=context',
              },
            },
          };
        });
        anchor.dispatchEvent ?
          anchor.dispatchEvent(eventObj) :
          anchor.fireEvent('onkeydown', eventObj);
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        expect(sidebarElement.style.display).to.equal('');
        expect(impl.schedulePause).to.have.not.been.called;
      });
    });

    it('should not close sidebar if clicked on non-anchor', () => {
      return getAmpSidebar().then(sidebarElement => {
        const li = sidebarElement.getElementsByTagName('li')[0];
        const impl = sidebarElement.implementation_;
        impl.schedulePause = sandbox.spy();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        sandbox.stub(timer, 'delay').callsFake(function(callback) {
          callback();
        });
        expect(sidebarElement.hasAttribute('open')).to.be.false;
        impl.open_();
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        const eventObj = doc.createEventObject ?
          doc.createEventObject() : doc.createEvent('Events');
        if (eventObj.initEvent) {
          eventObj.initEvent('click', true, true);
        }
        li.dispatchEvent ?
          li.dispatchEvent(eventObj) :
          li.fireEvent('onkeydown', eventObj);
        expect(sidebarElement.hasAttribute('open')).to.be.true;
        expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
        expect(sidebarElement.style.display).to.equal('');
        expect(impl.schedulePause).to.have.not.been.called;
      });
    });

    it('should listen to animationend/transitionend event', () => {
      return getAmpSidebar().then(sidebarElement => {
        const impl = sidebarElement.implementation_;
        clock = lolex.install(
            {target: impl.win, toFake: ['Date', 'setTimeout']});
        impl.boundOnAnimationEnd_ = sandbox.spy();
        impl.buildCallback();
        impl.vsync_ = {
          mutate(callback) {
            callback();
          },
        };
        const animationEndEvent = new Event(
            'animationend',
            {bubbles: true}
        );
        sidebarElement.firstChild.dispatchEvent(animationEndEvent);
        expect(impl.boundOnAnimationEnd_).to.be.calledOnce;
        const transitionEndEvent = new Event(
            'transitionend',
            {bubbles: true}
        );
        sidebarElement.firstChild.dispatchEvent(transitionEndEvent);
        expect(impl.boundOnAnimationEnd_).to.be.calledTwice;
      });
    });
  });

  describe('amp-sidebar - toolbars in amp-sidebar', () => {

    // Tests for amp-sidebar 1.0
    it('should not create toolbars without <nav toolbar />', () => {
      return getAmpSidebar().then(sidebarElement => {
        const headerElements = doc.getElementsByTagName('header');
        const toolbarElements = doc.querySelectorAll('[toolbar]');
        expect(headerElements.length).to.be.equal(0);
        expect(toolbarElements.length).to.be.equal(0);
        expect(sidebarElement.implementation_.toolbars_.length).to.be.equal(0);
      });
    });

    it('should create a toolbar element within the toolbar-target', () => {
      return getAmpSidebar({
        toolbars: [{}],
      }).then(sidebarElement => {
        expect(sidebarElement.implementation_.toolbars_.length)
            .to.be.equal(1);
      });
    });

    it('should create multiple toolbar elements, \
     within their respective containers', () => {
          return getAmpSidebar({
            toolbars: [{},
              {
                media: '(min-width: 1024px)',
              },
            ],
          }).then(sidebarElement => {
            expect(sidebarElement.implementation_.toolbars_.length)
                .to.be.equal(2);
          });
        });
  });
});
