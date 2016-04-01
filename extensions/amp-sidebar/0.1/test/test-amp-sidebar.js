
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
import {toggleExperiment} from '../../../../src/experiments';
require('../amp-sidebar');

adopt(window);

describe('amp-sidebar', () => {
  let sandbox;

  function getAmpSidebar(options) {
    options = options || {};
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-sidebar', true);
      const ampSidebar = iframe.doc.createElement('amp-sidebar');
      const list = iframe.doc.createElement('ul');
      for (let i = 0; i < 10; i++) {
        const li = iframe.doc.createElement('li');
        li.innerHTML = 'Menu item ' + i;
        list.appendChild(li);
      }
      ampSidebar.appendChild(list);
      if (options.side) {
        ampSidebar.setAttribute('side', options.side);
      }
      ampSidebar.setAttribute('id', 'sidebar1');
      return iframe.addElement(ampSidebar).then(() => {
        return Promise.resolve({
          iframe: iframe,
          ampSidebar: ampSidebar,
        });
      });
    });
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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
      impl.mutateElement = function(callback) {
        callback();
      };
      impl.open_();
      expect(iframe.doc.querySelectorAll('.-amp-sidebar-mask').length)
          .to.equal(1);
    });
  });

  it('should open sidebar on button click', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.mutateElement = function(callback) {
        callback();
      };
      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      expect(sidebarElement.style.display).to.equal('block');
    });
  });

  it('should close sidebar on button click', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.mutateElement = function(callback) {
        callback();
      };
      impl.close_();
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
    });
  });

  it('should toggle sidebar on button click', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.mutateElement = function(callback) {
        callback();
      };
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      impl.toggle_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('false');
      expect(sidebarElement.style.display).to.equal('block');
      impl.toggle_();
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
      expect(sidebarElement.style.display).to.equal('none');
    });
  });

  it('should close sidebar on escape', () => {
    return getAmpSidebar().then(obj => {
      const iframe = obj.iframe;
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.mutateElement = function(callback) {
        callback();
      };
      expect(sidebarElement.hasAttribute('open')).to.be.false;
      impl.open_();
      expect(sidebarElement.hasAttribute('open')).to.be.true;
      expect(sidebarElement.style.display).to.equal('block');
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
      expect(sidebarElement.style.display).to.equal('none');
      expect(sidebarElement.getAttribute('aria-hidden')).to.equal('true');
    });
  });

  it('should reflect state of the sidebar', () => {
    return getAmpSidebar().then(obj => {
      const sidebarElement = obj.ampSidebar;
      const impl = sidebarElement.implementation_;
      impl.mutateElement = function(callback) {
        callback();
      };
      expect(impl.isOpen_()).to.be.false;
      impl.toggle_();
      expect(impl.isOpen_()).to.be.true;
      impl.toggle_();
      expect(impl.isOpen_()).to.be.false;
    });
  });
});
