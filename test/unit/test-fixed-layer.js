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

import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {FakeMutationObserver, FakeWindow} from '../../testing/fake-dom';
import {FixedLayer} from '../../src/service/fixed-layer';
import {Services} from '../../src/services';
import {endsWith} from '../../src/string';
import {
  installHiddenObserverForDoc,
} from '../../src/service/hidden-observer-impl';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {toggle} from '../../src/style';
import {toggleExperiment} from '../../src/experiments';
import {user} from '../../src/log';

describes.sandboxed('FixedLayer', {}, () => {
  let documentApi;
  let ampdoc;
  let vsyncApi;
  let vsyncTasks;
  let docBody, docElem;
  let element1;
  let element2;
  let element3;
  let element4;
  let element5;
  let element6;
  let allRules;
  let timer;

  beforeEach(() => {
    allRules = {};

    docBody = createElement('docBody');
    docBody.id = 'doc-body-id';
    docElem = createElement('docElem');

    element1 = createElement('element1');
    element2 = createElement('element2');
    element3 = createElement('element3');
    element4 = createElement('element4');
    element5 = createElement('element5');
    element6 = createElement('element6');
    docBody.appendChild(element1);
    docBody.appendChild(element2);
    docBody.appendChild(element3);
    docBody.appendChild(element4);
    docBody.appendChild(element5);
    docBody.appendChild(element6);

    const invalidRule = createValidRule('#invalid', 'fixed',
        [element1, element3]);
    documentApi = {
      styleSheets: [
        // Will be ignored due to being a link.
        {
          ownerNode: document.createElement('link'),
          cssRules: [invalidRule],
        },
        // Will be ignored because it's disabled
        {
          ownerNode: createStyleNode(),
          disabled: true,
          cssRules: [invalidRule],
        },
        // Will be ignored because it's a boilerplate
        {
          ownerNode: createStyleNode('amp-boilerplate'),
          cssRules: [invalidRule],
        },
        // Will be ignored because it's a runtime
        {
          ownerNode: createStyleNode('amp-runtime'),
          cssRules: [invalidRule],
        },
        // Will be ignored because it's an extension
        {
          ownerNode: createStyleNode('amp-extension', 'amp-fit-text'),
          cssRules: [invalidRule],
        },
        // Valid stylesheet with amp-custom
        {
          ownerNode: createStyleNode('amp-custom'),
          cssRules: [
            createValidRule('#amp-custom-rule1', 'fixed', [element1]),
            createValidRule('#doc-body-id #amp-custom-rule1', 'fixed',
                [element1]),
            createValidRule('#amp-custom-rule2', 'fixed', [element1, element2]),
            createUnrelatedRule('#amp-custom-rule3', [element3]),
            createValidRule('#amp-custom-rule4', 'sticky',
                [element2, element4]),
            createValidRule('#amp-custom-rule5', '-webkit-sticky', [element5]),
            {
              type: 4,
              cssRules: [
                createValidRule('#amp-custom-media-rule1', 'fixed', [element1]),
              ],
            },
            {
              type: 12,
              cssRules: [
                createValidRule('#amp-custom-supports-rule1', 'fixed',
                    [element2]),
              ],
            },
            // Uknown rule.
            {
              type: 3,
            },
          ],
        },
        // Valid stylesheet without amp-custom
        {
          ownerNode: createStyleNode(),
          cssRules: [
            createValidRule('#other-rule1', 'fixed', [element1]),
            createValidRule('#other-rule2', 'fixed', [element2]),
            createUnrelatedRule('#other-rule3', [element1, element3]),
          ],
        },
      ],
      querySelectorAll: selector => {
        if (!allRules[selector]) {
          return null;
        }
        return allRules[selector].elements;
      },
      contains: elem => {
        return (!!elem.parentElement);
      },
      defaultView: {
        setTimeout: window.setTimeout,
        clearTimeout: window.clearTimeout,
        Promise: window.Promise,
        MutationObserver: FakeMutationObserver,
        getComputedStyle: elem => {
          return elem.computedStyle;
        },
        navigator: window.navigator,
        location: window.location,
        cookie: '',
      },
      createElement: name => {
        return createElement(name);
      },
      documentElement: docElem,
      body: docBody,
    };
    documentApi.defaultView.document = documentApi;
    ampdoc = new AmpDocSingle(documentApi.defaultView);
    installHiddenObserverForDoc(ampdoc);
    installPlatformService(documentApi.defaultView);
    installTimerService(documentApi.defaultView);
    timer = Services.timerFor(documentApi.defaultView);

    vsyncTasks = [];
    vsyncApi = {
      runPromise: task => {
        vsyncTasks.push(task);
        return Promise.resolve();
      },
      mutate: mutator => {
        vsyncTasks.push({mutate: mutator});
      },
    };
  });

  class FakeAttributes {
    constructor() {
      const attrs = [];
      attrs.setNamedItem = function({name, value}) {
        for (let i = 0; i < this.length; i++) {
          if (this[i].name === name) {
            this[i].value = value;
            return;
          }
        }
        this.push(new FakeAttr(name, value));
      };
      return attrs;
    }
  }
  class FakeAttr {
    constructor(name, value) {
      this.name = name;
      this.value = value;
    }

    cloneNode() {
      return new FakeAttr(this.name, this.value);
    }
  }
  function createElement(id) {
    const children = [];
    const elem = {
      id,
      ownerDocument: documentApi,
      autoTop: '',
      tagName: id,
      toString: () => {
        return id;
      },
      style: {
        _top: '15px',
        _bottom: '',
        _position: '',
        _opacity: '0.9',
        _visibility: 'visible',
        _transition: '',

        get top() {
          return this._top;
        },
        set top(v) {
          elem.style.setProperty('top', v);
        },
        get bottom() {
          return this._bottom;
        },
        set bottom(v) {
          elem.style.setProperty('bottom', v);
        },
        get position() {
          return this._position;
        },
        set position(v) {
          elem.style.setProperty('position', v);
        },
        get opacity() {
          return this._opacity;
        },
        set opacity(v) {
          elem.style.setProperty('opacity', v);
        },
        get visibility() {
          return this._visibility;
        },
        set visibility(v) {
          elem.style.setProperty('visibility', v);
        },
        get transition() {
          return this._transition;
        },
        set transition(v) {
          elem.style.setProperty('transition', v);
        },
        setProperty(prop, value, priority) {
          const privProp = '_' + prop;

          // Override if important
          if (priority === 'important') {
            elem.style[privProp] = `${value} !${priority}`;
          } else if (elem.style[privProp] ||
              !endsWith(elem.computedStyle[prop], '!important')) {
            if (prop === 'transition' && !value &&
                endsWith(elem.style[privProp] || '', '!important')) {
              // Emulate a stupid Safari bug.
              // noop.
            } else {
              // If element style is already set, we can override
              // Or, if computed style is not important priority
              elem.style[privProp] = value;
            }
          }
        },
      },
      computedStyle: {
        opacity: '0.9',
        visibility: 'visible',
        _top: '',
        get top() {
          if (elem.computedStyle.transition &&
              elem.style.transition !== '' &&
              elem.style.transition !== 'none !important') {
            return this._oldTop;
          }
          if (elem.style.bottom) {
            return elem.autoTop || this._top;
          }
          return this._top;
        },
        set top(val) {
          this._oldTop = this._top;
          this._top = val;
        },
        bottom: '',
        zIndex: '',
        transform: '',
        position: '',
        transition: '',
      },
      matches: () => true,
      compareDocumentPosition: other => {
        if (other.id > id) {
          return Node.DOCUMENT_POSITION_FOLLOWING;
        }
        return Node.DOCUMENT_POSITION_PRECEDING;
      },
      hasAttribute(name) {
        for (let i = 0; i < this.attributes.length; i++) {
          if (this.attributes[i].name === name) {
            return true;
          }
        }
        return false;
      },
      getAttribute(name) {
        for (let i = 0; i < this.attributes.length; i++) {
          if (this.attributes[i].name === name) {
            return this.attributes[i].value;
          }
        }
        return null;
      },
      setAttribute(name, value) {
        if (name.includes('[')) {
          throw new Error('invalid characters');
        }
        for (let i = 0; i < this.attributes.length; i++) {
          if (this.attributes[i].name === name) {
            this.attributes[i].value = value;
            return;
          }
        }
        this.attributes.push(new FakeAttr(name, value));
      },
      removeAttribute(name) {
        for (let i = 0; i < this.attributes.length; i++) {
          if (this.attributes[i].name === name) {
            this.attributes.splice(i, 1);
            return;
          }
        }
      },
      attributes: new FakeAttributes(),
      appendChild: child => {
        child.parentElement = elem;
        children.push(child);
      },
      removeChild: child => {
        const index = children.indexOf(child);
        if (index != -1) {
          children.splice(index, 1);
        }
        child.parentElement = null;
      },
      replaceChild: (newChild, oldChild) => {
        oldChild.parentElement = null;
        if (children.indexOf(oldChild) != -1) {
          children.splice(children.indexOf(oldChild), 1);
        }
        newChild.parentElement = elem;
        children.push(newChild);
      },
      cloneNode() {
        return createElement(this.id);
      },
      get offsetTop() {
        return parseFloat(elem.computedStyle.top);
      },
      set innerHTML(html) {
        if (html === '') {
          this.firstElementChild = null;
          return;
        }
        // Updating the placeholder means we have to update the tests.
        expect(html.trim()).to.equal(
            '<i-amphtml-fpa style="display: none"></i-amphtml-fpa>');
        this.firstElementChild = createElement('i-amphtml-fpa');
        toggle(this.firstElementChild, false);
      },
    };
    return elem;
  }

  function createStyleNode(attr, value) {
    const node = document.createElement('style');
    if (attr) {
      node.setAttribute(attr, value || '');
    }
    return node;
  }

  function createValidRule(selector, position, elements) {
    const rule = {
      type: 1,
      selectorText: selector,
      style: {position},
      elements,
    };
    if (allRules[selector]) {
      throw new Error('dup selector');
    }
    allRules[selector] = rule;
    return rule;
  }

  function createUnrelatedRule(selector, elements) {
    const rule = {
      type: 1,
      selectorText: selector,
      style: {},
      elements,
    };
    if (allRules[selector]) {
      throw new Error('dup selector');
    }
    allRules[selector] = rule;
    return rule;
  }

  // TODO(jridgewell, #11827): Make this test work on Safari.
  describe.configure().skipSafari().run('no-transfer', () => {
    let fixedLayer;

    beforeEach(() => {
      fixedLayer = new FixedLayer(ampdoc, vsyncApi,
          /* borderTop */ 0, /* paddingTop */ 11, /* transfer */ false);
      fixedLayer.setup();
    });

    it('should initialize fixed layer to null', () => {
      expect(fixedLayer.transferLayer_).to.be.null;
    });

    it('should discover all potentials', () => {
      function expectFe(actual, expected) {
        expect(actual.id).to.equal(expected.id, `${expected.id} wrong`);
        expect(actual.element).to.equal(expected.element,
            `${expected.id}: wrong element`);
        expect(actual.position).to.equal(expected.position,
            `${expected.id}: wrong position`);
        expect(JSON.stringify(actual.selectors))
            .to.equal(JSON.stringify(expected.selectors),
                `${expected.id}: wrong selectors`);
      }

      expect(fixedLayer.elements_).to.have.length(5);
      expectFe(fixedLayer.elements_[0], {
        id: 'F0',
        element: element1,
        position: 'fixed',
        selectors: [
          '#amp-custom-rule1',
          '#doc-body-id #amp-custom-rule1',
          '#amp-custom-rule2',
          '#amp-custom-media-rule1',
          '#other-rule1',
        ],
      });
      expectFe(fixedLayer.elements_[1], {
        id: 'F1',
        element: element2,
        position: 'fixed',
        selectors: [
          '#amp-custom-rule2',
          '#amp-custom-supports-rule1',
          '#other-rule2',
        ],
      });
      expectFe(fixedLayer.elements_[2], {
        id: 'F2',
        element: element2,
        position: 'sticky',
        selectors: [
          '#amp-custom-rule4',
        ],
      });
      expectFe(fixedLayer.elements_[3], {
        id: 'F3',
        element: element4,
        position: 'sticky',
        selectors: [
          '#amp-custom-rule4',
        ],
      });
      expectFe(fixedLayer.elements_[4], {
        id: 'F4',
        element: element5,
        position: 'sticky',
        selectors: [
          '#amp-custom-rule5',
        ],
      });
      expect(fixedLayer.isDeclaredFixed(element1)).to.be.true;
      expect(fixedLayer.isDeclaredSticky(element1)).to.be.false;
      expect(fixedLayer.isDeclaredFixed(element2)).to.be.true;
      expect(fixedLayer.isDeclaredSticky(element2)).to.be.true;
      expect(fixedLayer.isDeclaredFixed(element3)).to.be.false;
      expect(fixedLayer.isDeclaredSticky(element3)).to.be.false;
      expect(fixedLayer.isDeclaredSticky(element4)).to.be.true;
      expect(fixedLayer.isDeclaredSticky(element5)).to.be.true;
    });

    it('should add and remove element directly', () => {
      const updateStub = sandbox.stub(fixedLayer, 'update');
      expect(fixedLayer.elements_).to.have.length(5);

      // Add.
      fixedLayer.addElement(element6);
      expect(updateStub).to.be.calledOnce;
      expect(fixedLayer.elements_).to.have.length(6);
      const fe = fixedLayer.elements_[5];
      expect(fe.id).to.equal('F5');
      expect(fe.element).to.equal(element6);
      expect(fe.selectors).to.deep.equal(['*']);
      expect(fe.forceTransfer).to.be.undefined;

      // Remove.
      fixedLayer.removeElement(element6);
      expect(fixedLayer.elements_).to.have.length(5);

      // Add with forceTransfer=true.
      fixedLayer.addElement(element6, true);
      expect(updateStub).to.have.callCount(2);
      expect(fixedLayer.elements_).to.have.length(6);
      const fe1 = fixedLayer.elements_[5];
      expect(fe1.id).to.equal('F6');
      expect(fe1.element).to.equal(element6);
      expect(fe1.selectors).to.deep.equal(['*']);
      expect(fe1.forceTransfer).to.be.true;

      // Remove.
      fixedLayer.removeElement(element6);
      expect(fixedLayer.elements_).to.have.length(5);

      // Add with forceTransfer=false.
      fixedLayer.addElement(element6, false);
      expect(updateStub).to.have.callCount(3);
      expect(fixedLayer.elements_).to.have.length(6);
      const fe2 = fixedLayer.elements_[5];
      expect(fe2.id).to.equal('F7');
      expect(fe2.element).to.equal(element6);
      expect(fe2.selectors).to.deep.equal(['*']);
      expect(fe2.forceTransfer).to.be.false;

      // Remove.
      fixedLayer.removeElement(element6);
      expect(fixedLayer.elements_).to.have.length(5);
    });

    it('should remove node when disappeared from DOM', () => {
      docBody.removeChild(element1);
      expect(fixedLayer.elements_).to.have.length(5);
      fixedLayer.update();
      expect(fixedLayer.elements_).to.have.length(4);
    });

    it('should remove all candidates', () => {
      // element2 is both fixed and sticky.
      docBody.removeChild(element2);
      expect(fixedLayer.elements_).to.have.length(5);
      fixedLayer.update();
      expect(fixedLayer.elements_).to.have.length(3);
    });

    it('should collect updates', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      // F0: element1
      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].sticky).to.be.false;
      expect(state['F0'].top).to.equal('');
      expect(state['F0'].zIndex).to.equal('');

      // F1: element2
      expect(state['F1'].fixed).to.equal(false);
      expect(state['F1'].sticky).to.equal(false);

      // F2: element3
      expect(state['F2'].fixed).to.equal(false);
      expect(state['F2'].sticky).to.equal(false);

      // F3: element4
      expect(state['F3'].fixed).to.be.false;
      expect(state['F3'].sticky).to.be.false;
      expect(state['F3'].top).to.equal('');
      expect(state['F3'].zIndex).to.equal('');

      // F4: element5
      expect(state['F4'].fixed).to.be.false;
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('');
      expect(state['F4'].zIndex).to.equal('');
    });

    it('should support vendor-based sticky', () => {
      element5.computedStyle['position'] = '-webkit-sticky';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F4'].sticky).to.be.true;
    });

    it('should disregard non-fixed position', () => {
      element1.computedStyle['position'] = 'static';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'static';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.false;
      expect(state['F1'].fixed).to.be.false;
      expect(state['F4'].fixed).to.be.false;
    });

    it('should disregard invisible element, but for fixed only', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 0;
      element1.offsetHeight = 0;
      element5.computedStyle['position'] = 'sticky';
      element5.offsetWidth = 0;
      element5.offsetHeight = 0;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.false;
      expect(state['F1'].fixed).to.be.false;
      expect(state['F4'].sticky).to.be.true;
    });

    it('should disregard display:none element', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['display'] = 'none';
      element5.computedStyle['position'] = 'sticky';
      element5.offsetWidth = 10;
      element5.offsetHeight = 10;
      element5.computedStyle['display'] = 'none';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.false;
      expect(state['F1'].fixed).to.be.false;
      expect(state['F4'].sticky).to.be.false;
    });

    it('should tolerate getComputedStyle = null', () => {
      // See #3096 and https://bugzilla.mozilla.org/show_bug.cgi?id=548397
      documentApi.defaultView.getComputedStyle = () => null;

      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.false;
      expect(state['F0'].sticky).to.be.false;
      expect(state['F0'].transferrable).to.be.false;
      expect(state['F0'].top).to.equal('');
      expect(state['F0'].zIndex).to.equal('');

      expect(state['F1'].fixed).to.be.false;
      expect(state['F1'].sticky).to.be.false;
    });

    it('should collect for top != auto', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '11px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].sticky).to.be.false;
      expect(state['F0'].top).to.equal('11px');

      expect(state['F4'].fixed).to.be.false;
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('11px');
    });

    it('should collect for top = auto, but not update top', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = 'auto';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = 'auto';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].sticky).to.be.false;
      expect(state['F0'].top).to.equal('');

      expect(state['F4'].fixed).to.be.false;
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('');
    });

    it('should work around top=0 for sticky', () => {
      // See http://crbug.com/703816.
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '0px';
      element5.autoTop = '12px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('');
    });

    it('should work around top=0 for sticky when offset = 0', () => {
      // See http://crbug.com/703816.
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '0px';
      element5.autoTop = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('0px');
    });

    it('should NOT work around top=0 for sticky for non-implicit top', () => {
      // See http://crbug.com/703816.
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '0px';
      element5.autoTop = '12px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('');
    });

    it('should collect for implicit top = auto, but not update top', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '0px';
      element1.autoTop = '12px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.autoTop = '12px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('');
    });

    it('should override implicit top = auto to 0 when equals padding', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.autoTop = '0px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '11px';
      element5.autoTop = '11px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('0px');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('11px');
    });

    it('should override implicit top = auto to 0 and padding + border', () => {
      fixedLayer.borderTop_ = 1;
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '12px';
      element1.autoTop = '0px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '12px';
      element5.autoTop = '12px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('0px');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('12px');
    });

    it('should override implicit top = auto to 0 w/transient padding', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.autoTop = '0px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '11px';
      element5.autoTop = '11px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('0px');

      // Update to transient padding.
      sandbox.stub(fixedLayer, 'update').callsFake(() => {});
      fixedLayer.updatePaddingTop(22, /* transient */ true);
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('0px');
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('11px');
      expect(fixedLayer.paddingTop_).to.equal(22);
      expect(fixedLayer.committedPaddingTop_).to.equal(11);

      // Update to non-transient padding.
      fixedLayer.updatePaddingTop(22, /* transient */ false);
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal(''); // Reset completely.
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('11px');
      expect(fixedLayer.paddingTop_).to.equal(22);
      expect(fixedLayer.committedPaddingTop_).to.equal(22);
    });

    it('should always collect and update top = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '0px';
      element1.autoTop = '0px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '0px';
      element5.autoTop = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('0px');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('0px');
    });

    it('should handle transitions', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['transition'] = 'all .4s ease';
      element1.computedStyle['top'] = '0px';
      element1.autoTop = '0px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['transition'] = 'all .4s ease';
      element5.computedStyle['top'] = '0px';
      element5.autoTop = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].top).to.equal('0px');
      expect(element1.style.transition).to.equal('none !important');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].top).to.equal('0px');
      expect(element5.style.transition).to.equal('none !important');

      vsyncTasks[0].mutate({});
      expect(element1.style.transition).to.equal('');
      expect(element5.style.transition).to.equal('');
    });

    it('should mutate element to fixed without top', () => {
      const fe = fixedLayer.elements_[0];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        sticky: false,
        top: '',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.stickyNow).to.be.false;
      expect(fe.element.style.top).to.equal('15px');
      expect(fixedLayer.transferLayer_).to.be.null;
    });

    it('should mutate element to sticky without top', () => {
      const fe = fixedLayer.elements_[4];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: false,
        sticky: true,
        top: '',
      });

      expect(fe.fixedNow).to.be.false;
      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('15px');
      expect(fixedLayer.transferLayer_).to.be.null;
    });

    it('should mutate element to fixed with top', () => {
      const fe = fixedLayer.elements_[0];
      element1.style.top = '';
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        top: '17px',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');
    });

    it('should add needed padding to sticky top if transferring', () => {
      const fe = fixedLayer.elements_[4];
      fixedLayer.transfer_ = true;
      fe.element.style.top = '';
      fixedLayer.mutateElement_(fe, 1, {
        sticky: true,
        top: '17px',
      });

      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('17px');
    });

    it('should not add unneeded padding to sticky top if transferring', () => {
      const fe = fixedLayer.elements_[4];
      fixedLayer.transfer_ = true;
      fixedLayer.paddingTop_ = 0;
      fe.element.style.top = '';
      fixedLayer.mutateElement_(fe, 1, {
        sticky: true,
        top: '17px',
      });

      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px - 11px)');
    });

    it('should mutate element to sticky with top', () => {
      const fe = fixedLayer.elements_[4];
      fixedLayer.mutateElement_(fe, 1, {
        sticky: true,
        top: '17px',
      });

      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');
    });

    it('should reset top upon being removed from fixedlayer', () => {
      expect(fixedLayer.elements_).to.have.length(5);

      // Add.
      fixedLayer.addElement(element6, '*');
      expect(fixedLayer.elements_).to.have.length(6);
      const fe = fixedLayer.elements_[5];
      expect(fe.id).to.equal('F5');
      expect(fe.element).to.equal(element6);
      expect(fe.selectors).to.deep.equal(['*']);
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        top: '17px',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');
      // Remove.
      fixedLayer.vsync_ = {
        mutate(callback) {
          callback();
        },
      };
      fixedLayer.removeElement(element6);
      expect(fixedLayer.elements_).to.have.length(5);
      expect(element6.style.top).to.equal('');
    });

    it('should reset sticky top upon being removed from fixedlayer', () => {
      expect(fixedLayer.elements_).to.have.length(5);

      const fe = fixedLayer.elements_[4];
      fixedLayer.mutateElement_(fe, 1, {
        sticky: true,
        top: '17px',
      });

      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');

      // Remove.
      fixedLayer.vsync_ = {
        mutate(callback) {
          callback();
        },
      };
      fixedLayer.removeElement(element5);
      expect(fixedLayer.elements_).to.have.length(4);
      expect(element5.style.top).to.equal('');
    });

    it('should transform fixed elements with anchored top', () => {
      const fe = fixedLayer.elements_[0];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        top: '17px',
      });
      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.equal('translateY(-10px)');
      expect(fe.element.style.transition).to.equal('none');

      // Reset back.
      fixedLayer.transformMutate(null);
      expect(fe.element.style.transform).to.equal('');
      expect(fe.element.style.transition).to.equal('');
    });

    it('should NOT transform sticky elements with anchored top', () => {
      const fe = fixedLayer.elements_[4];
      fixedLayer.mutateElement_(fe, 1, {
        sticky: true,
        top: '17px',
      });
      expect(fe.stickyNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.be.undefined;
      expect(fe.element.style.transition).to.equal('');

      // Reset back.
      fixedLayer.transformMutate(null);
      expect(fe.element.style.transform).to.be.undefined;
      expect(fe.element.style.transition).to.equal('');
    });

    it('should compound transform with anchored top', () => {
      const fe = fixedLayer.elements_[0];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        top: '17px',
        transform: 'scale(2)',
      });

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.equal('scale(2) translateY(-10px)');
    });

    it('should NOT transform fixed elements w/o anchored top', () => {
      const fe = fixedLayer.elements_[0];
      fe.element.style.transform = '';
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        top: '',
      });
      expect(fe.fixedNow).to.be.true;

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.equal('');
    });

    it('should user error when inline styles may be overriden', () => {
      // Set both attribute and property since element1 is a fake element.
      element1.setAttribute('style', 'bottom: 10px');
      element1.style.bottom = '10px';

      const userError = sandbox.stub(user(), 'error');
      fixedLayer.setup();
      // Expect error regarding inline styles.
      expect(userError).calledWithMatch('FixedLayer',
          /not supported yet for fixed or sticky elements/);
    });

    describe('hidden toggle', () => {
      let mutationObserver;
      beforeEach(() => {
        toggleExperiment(documentApi.defaultView, 'hidden-mutation-observer',
            true);
        fixedLayer.observeHiddenMutations();
        mutationObserver =
          Services.hiddenObserverForDoc(ampdoc).mutationObserver_;
      });

      it('should trigger an update', () => {
        element1.computedStyle['position'] = 'fixed';
        element1.offsetWidth = 10;
        element1.offsetHeight = 10;
        element1.computedStyle['display'] = 'none';

        expect(vsyncTasks).to.have.length(1);
        const state = {};
        vsyncTasks[0].measure(state);

        expect(state['F0'].fixed).to.be.false;

        element1.computedStyle['display'] = '';

        sandbox.stub(timer, 'delay').callsFake(callback => {
          callback();
        });
        return mutationObserver.__mutate({
          attributeName: 'hidden',
        }).then(() => {
          expect(vsyncTasks).to.have.length(2);
          const state = {};
          vsyncTasks[0].measure(state);

          expect(state['F0'].fixed).to.be.true;
          expect(state['F0'].top).to.equal('');
          expect(state['F0'].zIndex).to.equal('');
        });
      });
    });
  });

  describe('with-transfer', () => {
    let fixedLayer;

    const borderTop = 0;
    const paddingTop = 11;
    const transfer = true;

    beforeEach(() => {
      fixedLayer = new FixedLayer(ampdoc, vsyncApi, borderTop, paddingTop,
          transfer);
      fixedLayer.setup();
    });

    it('should not instantiate transfer layer on setup', () => {
      const win = new FakeWindow();
      const ampdoc = new AmpDocSingle(win);
      installPlatformService(win);
      installTimerService(win);

      const fixedLayer = new FixedLayer(
          ampdoc, vsyncApi, borderTop, paddingTop, transfer);
      fixedLayer.setup();
      expect(fixedLayer.transferLayer_).to.be.null;
    });

    it('should collect turn off transferrable', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element5.computedStyle['position'] = 'sticky';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.false;

      expect(state['F1'].fixed).to.equal(false);

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;
    });

    it('should collect turn on transferrable with top = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;
      expect(state['F0'].top).to.equal('0px');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;
      expect(state['F4'].top).to.equal('0px');
    });

    it('should collect turn on transferrable with top != 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '2px';
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '2px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;
      expect(state['F0'].top).to.equal('2px');

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;
      expect(state['F4'].top).to.equal('2px');
    });

    it('should collect turn on transferrable with bottom = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '';
      element1.computedStyle['bottom'] = '0px';
      element5.computedStyle['position'] = 'sticky';
      element5.computedStyle['top'] = '';
      element5.computedStyle['bottom'] = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;
    });

    it('should not disregard invisible element if it has forceTransfer', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 0;
      element1.offsetHeight = 0;
      element5.computedStyle['position'] = 'sticky';

      expect(vsyncTasks).to.have.length(1);
      let state = {};
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.be.false;
      expect(state['F0'].transferrable).to.be.false;
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;

      // Add.
      state = {};
      fixedLayer.setupElement_(element1, '*', 'fixed', true);
      expect(vsyncTasks).to.have.length(1);
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;
    });

    it('should disregard element if it has forceTransfer=false', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';
      element5.computedStyle['position'] = 'sticky';

      expect(vsyncTasks).to.have.length(1);
      let state = {};
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;
      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;

      // Add.
      state = {};
      fixedLayer.setupElement_(element1, '*', 'fixed', false);
      expect(vsyncTasks).to.have.length(1);
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.false;
    });

    it('should collect turn on transferrable with bottom != 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.style['top'] = '';
      element1.computedStyle['top'] = '';
      element1.computedStyle['bottom'] = '2px';
      element5.computedStyle['position'] = 'sticky';
      element5.style['top'] = '';
      element5.computedStyle['top'] = '';
      element5.computedStyle['bottom'] = '2px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.be.true;

      expect(state['F4'].sticky).to.be.true;
      expect(state['F4'].transferrable).to.be.false;
    });

    it('should collect z-index', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['zIndex'] = '101';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].zIndex).to.equal('101');
    });

    it('should transfer element', () => {
      const fe = fixedLayer.elements_[0];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fe.placeholder).to.have.attribute('hidden');

      expect(fixedLayer.transferLayer_).to.exist;
      const layer = fixedLayer.transferLayer_.layer_;
      expect(layer.style['pointerEvents']).to.equal('none');

      expect(fe.element.parentElement).to.equal(layer);
      expect(fe.element.style['pointer-events']).to.equal('initial');
      expect(fe.element.style['zIndex']).to.equal('calc(10001 + 11)');
    });

    it('should ignore transfer when non-transferrable', () => {
      const fe = fixedLayer.elements_[0];
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        transferrable: false,
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.not.exist;
      expect(fixedLayer.transferLayer_).to.not.exist;
    });

    it('should return transfered element if it no longer matches', () => {
      const fe = fixedLayer.elements_[0];
      fe.element.matches = () => false;
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fixedLayer.transferLayer_).to.exist;
      expect(fe.element.parentElement)
          .to.not.equal(fixedLayer.transferLayer_.layer_);
      expect(fe.placeholder.parentElement).to.be.null;
      expect(fe.element.style.zIndex).to.equal('');
    });

    it('should remove transfered element if it no longer exists', () => {
      const fe = fixedLayer.elements_[0];

      // Add.
      fixedLayer.mutateElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });
      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fe.element.parentElement)
          .to.equal(fixedLayer.transferLayer_.layer_);
      expect(fixedLayer.transferLayer_).to.exist;
      expect(fixedLayer.transferLayer_.layer_.id).to.equal('doc-body-id');

      // Remove from DOM.
      fe.element.parentElement.removeChild(fe.element);
      fixedLayer.mutateElement_(fe, 1, {
        fixed: false,
        transferrable: false,
      });
      expect(fe.fixedNow).to.be.false;
      expect(fe.placeholder.parentElement).to.not.exist;
    });

    it('should disregard transparent element', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';
      element1.computedStyle['opacity'] = '0';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].transferrable).to.equal(false);
    });

    it('should force transfer for visibility=hidden element', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';
      element1.computedStyle['visibility'] = 'hidden';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].transferrable).to.equal(true);
    });

    it('should user error when inline styles may be overriden', () => {
      // Set both attribute and property since element1 is a fake element.
      element1.setAttribute('style', 'bottom: 10px');
      element1.style.bottom = '10px';

      const userError = sandbox.stub(user(), 'error');
      fixedLayer.setup();
      // Expect error regarding inline styles.
      expect(userError).calledWithMatch('FixedLayer',
          /not supported yet for fixed or sticky elements/);
    });

    describe('hidden toggle', () => {
      let mutationObserver;
      beforeEach(() => {
        toggleExperiment(documentApi.defaultView, 'hidden-mutation-observer',
            true);
        fixedLayer.observeHiddenMutations();
        mutationObserver =
          Services.hiddenObserverForDoc(ampdoc).mutationObserver_;
      });

      it('should trigger an update', () => {
        element1.computedStyle['position'] = 'fixed';
        element1.offsetWidth = 10;
        element1.offsetHeight = 10;
        element1.computedStyle['display'] = 'none';

        expect(vsyncTasks).to.have.length(1);
        const state = {};
        vsyncTasks[0].measure(state);

        expect(state['F0'].fixed).to.be.false;

        element1.computedStyle['display'] = '';

        sandbox.stub(timer, 'delay').callsFake(callback => {
          callback();
        });
        return mutationObserver.__mutate({
          attributeName: 'hidden',
        }).then(() => {
          expect(vsyncTasks).to.have.length(2);
          const state = {};
          vsyncTasks[0].measure(state);

          expect(state['F0'].fixed).to.be.true;
          expect(state['F0'].top).to.equal('');
          expect(state['F0'].zIndex).to.equal('');
        });
      });
    });

    it('should sync attributes between body and layer', () => {
      const {body} = ampdoc.win.document;

      // Necessary to create the fixed layer
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';
      fixedLayer.vsync_ = {
        runPromise({measure, mutate}, state) {
          measure(state);
          mutate(state);
          return Promise.resolve();
        },
      };

      body.setAttribute('test', 'hello');
      fixedLayer.update();
      expect(fixedLayer.transferLayer_).to.exist;
      const layer = fixedLayer.transferLayer_.layer_;
      expect(layer.getAttribute('test')).to.equal('hello');

      body.removeAttribute('test');
      body.setAttribute('test1', 'hello1');
      body.setAttribute('test2', 'hello2');
      fixedLayer.update();
      expect(layer.getAttribute('test')).to.equal(null);
      expect(layer.getAttribute('test1')).to.equal('hello1');
      expect(layer.getAttribute('test2')).to.equal('hello2');

      body.removeAttribute('test1');
      body.removeAttribute('test2');
      fixedLayer.update();
      expect(layer.getAttribute('test')).to.equal(null);
      expect(layer.getAttribute('test1')).to.equal(null);
      expect(layer.getAttribute('test2')).to.equal(null);

      body.attributes.push(new FakeAttr('[class]', 'amp-bind'));
      fixedLayer.update();
      expect(layer.getAttribute('[class]')).to.equal('amp-bind');

      // [i-amphtml-lightbox] is an exception and should be preserved.
      layer.setAttribute('i-amphtml-lightbox', '');
      fixedLayer.update();
      expect(layer.hasAttribute('i-amphtml-lightbox')).to.be.true;
      expect(body.hasAttribute('i-amphtml-lightbox')).to.be.false;
    });

    it('should sync invalid-named attributes to layer', () => {
      // Holy poop it's hard to inject an invalid-named attribute.
      // This is a sanity check using real Elements to ensure we can insert
      // a cloned attribute into another element.
      let div = document.createElement('div');
      div.innerHTML = '<div [class]="amp-bind"></div>';
      div = div.firstElementChild;
      const attr = div.attributes[0];
      expect(attr.name).to.equal('[class]');
      expect(attr.value).to.equal('amp-bind');

      const body = document.createElement('body');
      body.attributes.setNamedItem(attr.cloneNode(false));

      expect(div.getAttribute('[class]')).to.equal('amp-bind');
      expect(body.getAttribute('[class]')).to.equal('amp-bind');
      expect(body.attributes.getNamedItem('[class]')).to.not.equal(
          div.attributes.getNamedItem('[class]'));
    });
  });
});


describes.realWin('FixedLayer', {}, env => {
  let win, doc;
  let ampdoc;
  let fixedLayer;
  let transferLayer;
  let root;
  let shadowRoot;
  let container;

  const vsyncTasks = [];
  const vsyncApi = {
    runPromise: task => {
      vsyncTasks.push(task);
      return Promise.resolve();
    },
    mutate: mutator => {
      vsyncTasks.push({mutate: mutator});
    },
  };

  // Can only test when Shadow DOM is available.
  describe.configure().if(() => Element.prototype.attachShadow).run('shadow ' +
      'transfer', function() {
    beforeEach(function() {
      win = env.win;
      doc = win.document;

      installPlatformService(win);
      installTimerService(win);
      ampdoc = new AmpDocSingle(win);
      shadowRoot = win.document.body.attachShadow({mode: 'open'});
      fixedLayer = new FixedLayer(ampdoc, vsyncApi,
          /* borderTop */ 0, /* paddingTop */ 11, /* transfer */ true);
      fixedLayer.setup();
      transferLayer = fixedLayer.getTransferLayer_();
      root = transferLayer.getRoot();
      container = doc.createElement('div');
      doc.body.appendChild(container);
    });

    it('should create layer correctly', () => {
      expect(root.parentNode).to.equal(shadowRoot);
      expect(root.id).to.equal('i-amphtml-fixed-layer');
      expect(root.style.position).to.equal('absolute');
      expect(root.style.top).to.equal('0px');
      expect(root.style.left).to.equal('0px');
      expect(root.style.width).to.equal('0px');
      expect(root.style.height).to.equal('0px');
      expect(root.style.overflow).to.equal('hidden');
      expect(root.style.visibility).to.equal('');
      expect(root.children).to.have.length(1);
      expect(root.children[0].tagName).to.equal('SLOT');
      expect(root.children[0].name).to.equal('i-amphtml-fixed');
    });

    it('should transfer element', () => {
      const element = doc.createElement('div');
      container.appendChild(element);
      const fe = {element, id: 'F0'};
      transferLayer.transferTo(fe);

      // Element stays where it was.
      expect(element.parentElement).to.equal(container);
      expect(element.getAttribute('slot')).to.equal('i-amphtml-fixed');
      expect(root.children).to.have.length(1);

      // Ensure that repeat slotting doesn't change anything.
      transferLayer.transferTo(fe);
      expect(element.getAttribute('slot')).to.equal('i-amphtml-fixed');
      expect(root.children).to.have.length(1);
    });

    it('should return element', () => {
      const element = doc.createElement('div');
      container.appendChild(element);
      const fe = {element, id: 'F0'};
      transferLayer.transferTo(fe);
      expect(element.getAttribute('slot')).to.equal('i-amphtml-fixed');
      expect(root.children).to.have.length(1);

      // The slot distribution is canceled, but the slot itself is kept.
      transferLayer.returnFrom(fe);
      expect(element.getAttribute('slot')).to.be.null;
      expect(root.children).to.have.length(1);

      // Ensure that repeat slotting doesn't change anything.
      transferLayer.transferTo(fe);
      expect(element.getAttribute('slot')).to.equal('i-amphtml-fixed');
      expect(root.children).to.have.length(1);
    });
  });
});
