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

import '../amp-accordion';
import {KeyCodes} from '../../../../src/utils/key-codes';
import {tryFocus} from '../../../../src/dom';


describes.realWin('amp-accordion', {
  amp: {
    extensions: ['amp-accordion'],
  },
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpAccordion() {
    win.sessionStorage.clear();
    const ampAccordion = doc.createElement('amp-accordion');
    for (let i = 0; i < 3; i++) {
      const section = doc.createElement('section');
      section.innerHTML = '<h2 tabindex="0">Section ' + i +
          '<span>nested stuff<span></h2><div id=\'test' + i +
          '\'>Loreum ipsum</div>';
      ampAccordion.appendChild(section);
      if (i == 1) {
        section.setAttribute('expanded', '');
      }
    }
    doc.body.appendChild(ampAccordion);
    return ampAccordion.build().then(() => {
      ampAccordion.implementation_.mutateElement = fn => fn();
      return ampAccordion.layoutCallback();
    }).then(() => ampAccordion);
  }

  it('should expand when toggle action is triggered on a collapsed section',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[0].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('false');
          impl.toggle_(headerElements[0].parentNode);
          expect(headerElements[0].parentNode
              .hasAttribute('expanded')).to.be.true;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('true');
        });
      });

  it('should collapse when toggle action is triggered on a expanded section',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.true;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('true');
          impl.toggle_(headerElements[1].parentNode);
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('false');
        });
      });

  it('should expand when expand action is triggered on a collapsed section',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[0].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('false');
          impl.expand_(headerElements[0].parentNode);
          expect(headerElements[0]
              .parentNode.hasAttribute('expanded')).to.be.true;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('true');
        });
      });

  it('should stay expanded on the expand action when expanded',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.true;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('true');
          impl.expand_(headerElements[1].parentNode);
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.true;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('true');
        });
      });

  it('should collapse on the collapse action when expanded',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.true;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('true');
          impl.collapse_(headerElements[1].parentNode);
          expect(headerElements[1].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[1]
              .getAttribute('aria-expanded')).to.equal('false');
        });
      });

  it('should stay collapsed on the collapse action when collapsed',
      () => {
        return getAmpAccordion().then(ampAccordion => {
          const impl = ampAccordion.implementation_;
          const headerElements = doc.querySelectorAll(
              'section > *:first-child');
          expect(headerElements[0].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('false');
          impl.collapse_(headerElements[0].parentNode);
          expect(headerElements[0].parentNode
              .hasAttribute('expanded')).to.be.false;
          expect(headerElements[0]
              .getAttribute('aria-expanded')).to.equal('false');
        });
      });

  it('should expand when header of a collapsed section is clicked', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault.called).to.be.true;
    });
  });

  it('should expand section when header\'s child is clicked', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const header = headerElements[0];
      const child = doc.createElement('div');
      header.appendChild(child);
      const clickEvent = {
        target: child,
        currentTarget: header,
        preventDefault: sandbox.spy(),
      };
      expect(header.parentNode.hasAttribute('expanded')).to.be.false;
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(header.parentNode.hasAttribute('expanded')).to.be.true;
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault).to.have.been.called;
    });
  });

  it('should collapse when header of an expanded section is clicked', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      ampAccordion.implementation_.onHeaderPicked_(clickEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
      expect(clickEvent.preventDefault).to.have.been.called;
    });
  });

  it('should allow for clickable links in header', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const a = doc.createElement('a');
      headerElements[0].appendChild(a);
      const aClickEvent = {
        target: a,
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      ampAccordion.implementation_.clickHandler_(aClickEvent);
      expect(aClickEvent.preventDefault).to.not.have.been.called;
    });
  });

  it('should expand when header of a collapsed section is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const keyDownEvent = {
        keyCode: KeyCodes.SPACE,
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(keyDownEvent.preventDefault.called).to.be.true;
    });
  });

  it('should NOT expand section when header\'s child is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const child = doc.createElement('div');
      headerElements[0].appendChild(child);
      const keyDownEvent = {
        keyCode: KeyCodes.ENTER,
        target: child,
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      expect(keyDownEvent.preventDefault.called).to.be.false;
    });
  });

  it('should collapse when header of an expanded section is ' +
     'activated via keyboard', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      const keyDownEvent = {
        keyCode: KeyCodes.ENTER,
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      ampAccordion.implementation_.keyDownHandler_(keyDownEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
      expect(keyDownEvent.preventDefault.called).to.be.true;
    });
  });

  it('should be navigable by up and down arrow keys when ' +
     'any header has focus', () => {
    return getAmpAccordion().then(ampAccordion => {
      const headerElements = doc.querySelectorAll(
          'section > *:first-child');
      // Focus the first header,
      tryFocus(headerElements[0]);
      expect(doc.activeElement)
          .to.equal(headerElements[0]);
      const upArrowEvent = {
        keyCode: KeyCodes.UP_ARROW,
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      ampAccordion.implementation_.keyDownHandler_(upArrowEvent);
      expect(doc.activeElement)
          .to.equal(headerElements[headerElements.length - 1]);
      const downArrowEvent = {
        keyCode: KeyCodes.DOWN_ARROW,
        target: headerElements[headerElements.length - 1],
        currentTarget: headerElements[headerElements.length - 1],
        preventDefault: sandbox.spy(),
      };
      ampAccordion.implementation_.keyDownHandler_(downArrowEvent);
      expect(doc.activeElement).to.equal(headerElements[0]);
    });
  });

  it('should return correct sessionStorageKey', () => {
    return getAmpAccordion().then(ampAccordion => {
      const impl = ampAccordion.implementation_;
      const url = win.location.href;
      impl.element.id = '321';
      const id = impl.getSessionStorageKey_();
      const correctId = 'amp-321-' + url;
      expect(id).to.be.equal(correctId);
    });
  });

  it('should set sessionStorage on change in expansion', () => {
    return getAmpAccordion().then(ampAccordion => {
      const impl = ampAccordion.implementation_;
      const headerElements = doc.querySelectorAll(
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
    return getAmpAccordion().then(ampAccordion => {
      const impl = ampAccordion.implementation_;
      let headerElements = doc.querySelectorAll(
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
      headerElements = doc.querySelectorAll(
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
      headerElements = doc.querySelectorAll(
          'section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
    });
  });

  it('should disable sessionStorage when opt-out', () => {
    return getAmpAccordion().then(ampAccordion => {
      const impl = ampAccordion.implementation_;
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
      const headerElements = doc.querySelectorAll(
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
    return getAmpAccordion().then(ampAccordion => {
      const ampAccordion1 = ampAccordion;
      const ampAccordion2 = doc.createElement('amp-accordion');
      for (let i = 0; i < 3; i++) {
        const section = doc.createElement('section');
        section.innerHTML = '<h2>Section ' + i +
            '<span>nested stuff<span></h2><div id=\'test' + i +
            '\'>Loreum ipsum</div>';
        ampAccordion2.appendChild(section);
      }
      doc.body.appendChild(ampAccordion2);
      return ampAccordion2.build().then(() => {
        ampAccordion.implementation_.mutateElement = fn => fn();
        return ampAccordion.layoutCallback();
      }).then(() => {
        const headerElements1 = ampAccordion1.querySelectorAll(
            'section > *:first-child');
        const clickEventElement = {
          target: headerElements1[0],
          currentTarget: headerElements1[0],
          preventDefault: sandbox.spy(),
        };
        ampAccordion1.implementation_.onHeaderPicked_(clickEventElement);
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
