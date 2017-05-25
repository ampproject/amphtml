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

import {KeyCodes} from '../../../../src/utils/key-codes';
import {createIframePromise} from '../../../../testing/iframe';
import {tryFocus} from '../../../../src/dom';
import '../amp-accordion';


describes.sandboxed('amp-accordion', {}, () => {

  function getAmpAccordion() {
    return createIframePromise().then(iframe => {
      iframe.win.sessionStorage.clear();
      const ampAccordion = iframe.doc.createElement('amp-accordion');
      ampAccordion.implementation_.mutateElement = fn => fn();
      for (let i = 0; i < 3; i++) {
        const section = iframe.doc.createElement('section');
        section.innerHTML = '<h2 tabindex="0">Section ' + i +
            '<span>nested stuff<span></h2><div id=\'test' + i +
            '\'>Loreum ipsum</div>';
        ampAccordion.appendChild(section);
        if (i == 1) {
          section.setAttribute('expanded', '');
        }
      }
      return iframe.addElement(ampAccordion).then(() => {
        return Promise.resolve({iframe, ampAccordion});
      });
    });
  }

  it('should expand when header of a collapsed section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      obj.ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault.called).to.be.true;
    });
  });

  it('should expand section when header\'s child is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const header = headerElements[0];
      const child = iframe.doc.createElement('div');
      header.appendChild(child);
      const clickEvent = {
        target: child,
        currentTarget: header,
        preventDefault: sandbox.spy(),
      };
      expect(header.parentNode.hasAttribute('expanded')).to.be.false;
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      obj.ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(header.parentNode.hasAttribute('expanded')).to.be.true;
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault).to.have.been.called;
    });
  });

  it('should collapse when header of an expanded section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      obj.ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
      expect(clickEvent.preventDefault).to.have.been.called;
    });
  });

  it('should allow for clickable links and buttons in header', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const a = iframe.doc.createElement('a');
      headerElements[0].appendChild(a);
      const aClickEvent = {
        target: a,
        preventDefault: sandbox.spy(),
      };
      obj.ampAccordion.implementation_.clickHandler_(aClickEvent);
      expect(aClickEvent.preventDefault).to.not.have.been.called;

      const button = iframe.doc.createElement('button');
      headerElements[0].appendChild(button);
      const buttonClickEvent = {
        target: button,
        preventDefault: sandbox.spy(),
      };
      obj.ampAccordion.implementation_.clickHandler_(buttonClickEvent);
      expect(buttonClickEvent.preventDefault).to.not.have.been.called;
    });
  });

  it('should expand when header of a collapsed section is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const keyDownEvent = {
        keyCode: KeyCodes.SPACE,
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      obj.ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(keyDownEvent.preventDefault.called).to.be.true;
    });
  });

  it('should NOT expand section when header\'s child is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const child = iframe.doc.createElement('div');
      headerElements[0].appendChild(child);
      const keyDownEvent = {
        keyCode: KeyCodes.ENTER,
        target: child,
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      obj.ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      expect(keyDownEvent.preventDefault.called).to.be.false;
    });
  });

  it('should collapse when header of an expanded section is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const keyDownEvent = {
        keyCode: KeyCodes.ENTER,
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      obj.ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
      expect(keyDownEvent.preventDefault.called).to.be.true;
    });
  });

  it('should be navigable by up and down arrow keys when ' +
     'any header has focus', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      // Focus the first header,
      tryFocus(headerElements[0]);
      const upArrowEvent = {
        keyCode: KeyCodes.UP_ARROW,
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      obj.ampAccordion.implementation_.keyDownHandler_(upArrowEvent);
      expect(iframe.doc.activeElement)
          .to.equal(headerElements[headerElements.length - 1]);
      const downArrowEvent = {
        keyCode: KeyCodes.DOWN_ARROW,
        target: headerElements[headerElements.length - 1],
        currentTarget: headerElements[headerElements.length - 1],
        preventDefault: sandbox.spy(),
      };
      obj.ampAccordion.implementation_.keyDownHandler_(downArrowEvent);
      expect(iframe.doc.activeElement).to.equal(headerElements[0]);
    });
  });

  it('should return correct sessionStorageKey', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const impl = obj.ampAccordion.implementation_;
      const url = iframe.win.location.href;
      impl.element.id = '321';
      const id = impl.getSessionStorageKey_();
      const correctId = 'amp-321-' + url;
      expect(id).to.be.equal(correctId);
    });
  });

  it('should set sessionStorage on change in expansion', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const impl = obj.ampAccordion.implementation_;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEventExpandElement = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      const clickEventCollapseElement = {
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(Object.keys(impl.currentState_)).to.have.length(0);
      impl.onHeaderPicked_(clickEventExpandElement);
      expect(Object.keys(impl.currentState_)).to.have.length(1);
      expect(impl.currentState_['test0']).to.be.true;
      impl.onHeaderPicked_(clickEventCollapseElement);
      expect(Object.keys(impl.currentState_)).to.have.length(2);
      expect(impl.currentState_['test0']).to.be.true;
      expect(impl.currentState_['test1']).to.be.false;
    });
  });

  it('should respect session states and expand/collapse', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const impl = obj.ampAccordion.implementation_;
      let headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
      impl.getSessionState_ = function() {
        return {
          'test0': true,
        };
      };
      impl.buildCallback();
      headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
      impl.getSessionState_ = function() {
        return {
          'test0': true,
          'test1': false,
        };
      };
      impl.buildCallback();
      headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
    });
  });

  it('should disable sessionStorage when opt-out', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const ampAccordion = obj.ampAccordion;
      const impl = obj.ampAccordion.implementation_;
      const setSessionStateSpy = sandbox.spy();
      const getSessionStateSpy = sandbox.spy();
      impl.win.sessionStorage.setItem = function() {
        setSessionStateSpy();
      };
      impl.win.sessionStorage.getItem = function() {
        getSessionStateSpy();
      };

      ampAccordion.setAttribute('disable-session-states', null);
      impl.buildCallback();
      expect(Object.keys(impl.currentState_)).to.have.length(0);
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEventExpandElement = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      impl.onHeaderPicked_(clickEventExpandElement);
      expect(getSessionStateSpy).to.not.have.been.called;
      expect(setSessionStateSpy).to.not.have.been.called;
      expect(Object.keys(impl.currentState_)).to.have.length(1);
    });
  });

  it('two accordions should not affect each other', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const ampAccordion1 = obj.ampAccordion;
      const ampAccordion2 = iframe.doc.createElement('amp-accordion');
      ampAccordion2.implementation_.mutateElement = fn => fn();
      for (let i = 0; i < 3; i++) {
        const section = iframe.doc.createElement('section');
        section.innerHTML = '<h2>Section ' + i +
            '<span>nested stuff<span></h2><div id=\'test' + i +
            '\'>Loreum ipsum</div>';
        ampAccordion2.appendChild(section);
      }
      return iframe.addElement(ampAccordion2).then(() => {
        ampAccordion1.implementation_.buildCallback();
        const headerElements1 = ampAccordion1.querySelectorAll(
          'section > *:first-child');
        const clickEventElement = {
          target: headerElements1[0],
          currentTarget: headerElements1[0],
          preventDefault: sandbox.spy(),
        };
        ampAccordion1.implementation_.onHeaderPicked_(clickEventElement);
        ampAccordion2.implementation_.buildCallback();
        const headerElements2 = ampAccordion2.querySelectorAll(
          'section > *:first-child');
        expect(headerElements1[0].parentNode.hasAttribute('expanded'))
            .to.be.true;
        expect(headerElements2[0].parentNode.hasAttribute('expanded'))
            .to.be.false;
      });
    });
  });
});
