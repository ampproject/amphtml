
/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {platformFor} from '../../../../src/platform';
import {timerFor} from '../../../../src/timer';
import {assertScreenReaderElement} from '../../../../testing/test-helper';
import * as sinon from 'sinon';
import '../amp-sidebar';

adopt(window);

describe('amp-sidebar', () => {
  let sandbox;
  let platform;
  let timer;

  function getAmpSidebar(options) {
    options = options || {};
    return createIframePromise().then(iframe => {
      const ampSidebar = iframe.doc.createElement('amp-sidebar');
      const list = iframe.doc.createElement('ul');
      for (let i = 0; i < 10; i++) {
        const li = iframe.doc.createElement('li');
        li.innerHTML = 'Menu item ' + i;
        list.appendChild(li);
      }
      ampSidebar.appendChild(list);
      const anchor = iframe.doc.createElement('a');
      anchor.href = '#section1';
      ampSidebar.appendChild(anchor);
      if (options.side) {
        ampSidebar.setAttribute('side', options.side);
      }
      if (options.open) {
        ampSidebar.setAttribute('open', '');
      }
      ampSidebar.setAttribute('id', 'sidebar1');
      ampSidebar.setAttribute('layout', 'nodisplay');
      return iframe.addElement(ampSidebar).then(() => {
        timer = timerFor(iframe.win);
        return {iframe, ampSidebar};
      });
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    platform = platformFor(window);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should open from left is side is not specified', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      expect(sidebarElement.getAttribute('side')).to.equal('left');
    });
  });

  it('should open from right is side right is specified', () => {
    return getAmpSidebar({'side': 'right'}).then(obj => {
      const sidebarElement = obj.ampSidebar;
      expect(sidebarElement.getAttribute('side')).to.equal('right');
    });
  });

  it('should create mask element in DOM', () => {
    return getAmpSidebar().then(obj => {
      const iframe = obj.iframe;
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      impl.open_();
      expect(iframe.doc.querySelectorAll('.-amp-sidebar-mask').length)
          .to.equal(1);
    });
  });

  it('should create an invisible close button for screen readers only', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.close_ = sandbox.spy();
      const closeButton = sidebarElement.lastElementChild;
      expect(closeButton).to.exist;
      expect(closeButton.tagName).to.equal('BUTTON');
      assertScreenReaderElement(closeButton);
      expect(impl.close_.callCount).to.equal(0);
      closeButton.click();
      expect(impl.close_.callCount).to.equal(1);
    });
  });

  it('should open sidebar on button click', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      const historyPushSpy = sandbox.spy();
      const historyPopSpy = sandbox.spy();
      impl.scheduleLayout = sandbox.spy();
      impl.getHistory_ = function() {
        return {
          push: function() {
            historyPushSpy();
            return Promise.resolve(11);
          },
          pop: function() {
            historyPopSpy();
            return Promise.resolve(11);
          },
        };
      };
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      timer.cancel = sandbox.spy();
      impl.openOrCloseTimeOut_ = 10;

      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      expect(sidebarElement.getAttribute('role')).to.equal('menu');
      expect(obj.iframe.doc.activeElement).to.equal(sidebarElement);
      expect(sidebarElement.style.display).to.equal('');
      expect(timer.cancel.callCount).to.equal(1);
      expect(impl.scheduleLayout.callCount).to.equal(1);
      expect(historyPushSpy.callCount).to.equal(1);
      expect(historyPopSpy.callCount).to.equal(0);
      expect(impl.historyId_).to.not.equal('-1');

      // second call to open_() should be a no-op and not increase call counts.
      impl.open_();
      expect(impl.scheduleLayout.callCount).to.equal(1);
      expect(historyPushSpy.callCount).to.equal(1);
      expect(historyPopSpy.callCount).to.equal(0);

    });
  });

  it('should close sidebar on button click', () => {
    return getAmpSidebar({'open': true}).then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.schedulePause = sandbox.spy();
      const historyPushSpy = sandbox.spy();
      const historyPopSpy = sandbox.spy();
      impl.scheduleLayout = sandbox.spy();
      impl.getHistory_ = function() {
        return {
          push: function() {
            historyPushSpy();
            return Promise.resolve(11);
          },
          pop: function() {
            historyPopSpy();
            return Promise.resolve(11);
          },
        };
      };
      impl.historyId_ = 100;
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });

      timer.cancel = sandbox.spy();
      impl.openOrCloseTimeOut_ = 10;
      impl.close_();
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
      expect(timer.cancel.callCount).to.equal(1);
      expect(impl.schedulePause.callCount).to.equal(1);
      expect(historyPopSpy.callCount).to.equal(1);
      expect(impl.historyId_).to.equal(-1);

      // second call to close_() should be a no-op and not increase call counts.
      impl.close_();
      expect(impl.schedulePause.callCount).to.equal(1);
      expect(historyPopSpy.callCount).to.equal(1);
    });
  });

  it('should toggle sidebar on button click', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.scheduleLayout = sandbox.spy();
      impl.schedulePause = sandbox.spy();
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.getAttribute('role')).to.equal('menu');
      expect(obj.iframe.doc.activeElement).to.not.equal(sidebarElement);
      impl.toggle_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      expect(obj.iframe.doc.activeElement).to.equal(sidebarElement);
      expect(sidebarElement.style.display).to.equal('');
      expect(impl.scheduleLayout.callCount).to.equal(1);
      impl.toggle_();
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
      expect(impl.schedulePause.callCount).to.equal(1);
    });
  });

  it('should close sidebar on escape', () => {
    return getAmpSidebar().then(obj => {
      const iframe = obj.iframe;
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.schedulePause = sandbox.spy();
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      const eventObj = document.createEventObject ?
          document.createEventObject() : document.createEvent('Events');
      if (eventObj.initEvent) {
        eventObj.initEvent('keydown', true, true);
      }
      eventObj.keyCode = 27;
      eventObj.which = 27;
      const el = iframe.doc.documentElement;
      el.dispatchEvent ?
          el.dispatchEvent(eventObj) : el.fireEvent('onkeydown', eventObj);
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
      expect(impl.schedulePause.callCount).to.equal(1);
    });
  });


  it('should close sidebar if clicked on anchor', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const anchor = sidebarElement.getElementsByTagName('a')[0];
      const impl = sidebarElement.implementation_;
      impl.schedulePause = sandbox.spy();
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      const eventObj = document.createEventObject ?
          document.createEventObject() : document.createEvent('Events');
      if (eventObj.initEvent) {
        eventObj.initEvent('click', true, true);
      }
      anchor.dispatchEvent ?
          anchor.dispatchEvent(eventObj) :
          anchor.fireEvent('onkeydown', eventObj);
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
      expect(impl.schedulePause.callCount).to.equal(1);
    });
  });


  it('should not close sidebar if clicked on non-anchor', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const li = sidebarElement.getElementsByTagName('li')[0];
      const impl = sidebarElement.implementation_;
      impl.schedulePause = sandbox.spy();
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      const eventObj = document.createEventObject ?
          document.createEventObject() : document.createEvent('Events');
      if (eventObj.initEvent) {
        eventObj.initEvent('click', true, true);
      }
      li.dispatchEvent ?
          li.dispatchEvent(eventObj) :
          li.fireEvent('onkeydown', eventObj);
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      expect(sidebarElement.style.display).to.equal('');
      expect(impl.schedulePause.callCount).to.equal(0);
    });
  });

  it('should reflect state of the sidebar', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.schedulePause = sandbox.spy();
      impl.scheduleResume = sandbox.spy();
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      expect(impl.isOpen_()).to.be.false;
      expect(impl.schedulePause.callCount).to.equal(0);
      expect(impl.scheduleResume.callCount).to.equal(0);
      impl.toggle_();
      expect(impl.isOpen_()).to.be.true;
      expect(impl.schedulePause.callCount).to.equal(0);
      expect(impl.scheduleResume.callCount).to.equal(1);
      impl.toggle_();
      expect(impl.isOpen_()).to.be.false;
      expect(impl.schedulePause.callCount).to.equal(1);
      expect(impl.scheduleResume.callCount).to.equal(1);
      impl.toggle_();
      expect(impl.isOpen_()).to.be.true;
      expect(impl.schedulePause.callCount).to.equal(1);
      expect(impl.scheduleResume.callCount).to.equal(2);
      impl.toggle_();
      expect(impl.isOpen_()).to.be.false;
      expect(impl.schedulePause.callCount).to.equal(2);
      expect(impl.scheduleResume.callCount).to.equal(2);
    });
  });

  it.skip('should fix scroll leaks on ios safari', () => {
    sandbox.stub(platform, 'isIos').returns(true);
    sandbox.stub(platform, 'isSafari').returns(true);
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      const scrollLeakSpy = sandbox.spy(impl, 'fixIosElasticScrollLeak_');
      impl.buildCallback();
      expect(scrollLeakSpy.callCount).to.equal(1);
    });
  });

  it.skip('should adjust for IOS safari bottom bar', () => {
    sandbox.stub(platform, 'isIos').returns(true);
    sandbox.stub(platform, 'isSafari').returns(true);
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      sandbox.stub(timer, 'delay', function(callback) {
        callback();
      });
      const compensateIosBottombarSpy =
          sandbox.spy(impl, 'compensateIosBottombar_');
      const initalChildrenCount = sidebarElement.children.length;
      impl.open_();
      expect(compensateIosBottombarSpy.callCount).to.equal(1);
      // 10 lis + one top padding element inserted
      expect(sidebarElement.children.length).to.equal(initalChildrenCount + 1);
    });
  });
});
