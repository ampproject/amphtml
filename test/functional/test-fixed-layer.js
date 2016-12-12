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
import {FixedLayer} from '../../src/service/fixed-layer';
import {installPlatformService} from '../../src/service/platform-impl';
import * as sinon from 'sinon';


describe('FixedLayer', () => {
  let sandbox;
  let documentApi;
  let ampdoc;
  let vsyncApi;
  let vsyncTasks;
  let docBody, docElem;
  let element1;
  let element2;
  let element3;
  let allRules;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    allRules = {};

    docBody = createElement('docBody');
    docElem = createElement('docElem');

    element1 = createElement('element1');
    element2 = createElement('element2');
    element3 = createElement('element3');
    docBody.appendChild(element1);
    docBody.appendChild(element2);
    docBody.appendChild(element3);

    const invalidRule = createValidRule('#invalid', [element1, element3]);
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
            createValidRule('#amp-custom-rule1', [element1]),
            createValidRule('#amp-custom-rule2', [element1, element2]),
            createUnrelatedRule('#amp-custom-rule3', [element3]),
            {
              type: 4,
              cssRules: [
                createValidRule('#amp-custom-media-rule1', [element1]),
              ],
            },
            {
              type: 12,
              cssRules: [
                createValidRule('#amp-custom-supports-rule1', [element2]),
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
            createValidRule('#other-rule1', [element1]),
            createValidRule('#other-rule2', [element2]),
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
        getComputedStyle: elem => {
          return {
            getPropertyValue: prop => {
              return elem.computedStyle[prop] || '';
            },
          };
        },
        navigator: window.navigator,
      },
      createElement: name => {
        return createElement(name);
      },
      documentElement: docElem,
      body: docBody,
    };
    documentApi.defaultView.document = documentApi;
    ampdoc = new AmpDocSingle(documentApi.defaultView);
    installPlatformService(documentApi.defaultView);

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

  afterEach(() => {
    sandbox.restore();
  });

  function createElement(id) {
    const attrs = {};
    const children = [];
    const elem = {
      id,
      autoOffsetTop: 17,
      toString: () => {
        return id;
      },
      style: {
        top: '',
        bottom: '',
        position: '',
        opacity: '0.9',
        visibility: 'visible',
      },
      computedStyle: {
        opacity: '0.9',
        visibility: 'visible',
      },
      matches: () => true,
      compareDocumentPosition: other => {
        if (id < other.id) {
          return 0x0A;
        }
        return 0;
      },
      getAttribute: name => {
        return attrs[name];
      },
      setAttribute: (name, value) => {
        attrs[name] = value;
      },
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
    };
    Object.defineProperty(elem, 'offsetTop', {
      get: () => {
        if (elem.style.top == 'auto' || elem.computedStyle.top == 'auto' ||
                elem.computedStyle.top == '') {
          return elem.autoOffsetTop;
        }
        return parseFloat(elem.computedStyle.top);
      },
    });
    return elem;
  }

  function createStyleNode(attr, value) {
    const node = document.createElement('style');
    if (attr) {
      node.setAttribute(attr, value || '');
    }
    return node;
  }

  function createValidRule(selector, elements) {
    const rule = {
      type: 1,
      selectorText: selector,
      style: {position: 'fixed'},
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


  describe('no-transfer', () => {
    let fixedLayer;

    beforeEach(() => {
      fixedLayer = new FixedLayer(ampdoc, vsyncApi,
          /* paddingTop */ 11, /* transfer */ false);
      fixedLayer.setup();
    });

    it('should initiale fixed layer to null', () => {
      expect(fixedLayer.fixedLayer_).to.be.null;
    });

    it('should discover all potentials', () => {
      function expectFe(actual, expected) {
        expect(actual.id).to.equal(expected.id, `${expected.id} wrong`);
        expect(actual.element).to.equal(expected.element,
            `${expected.id}: wrong element`);
        expect(JSON.stringify(actual.selectors))
            .to.equal(JSON.stringify(expected.selectors),
                `${expected.id}: wrong selectors`);
      }

      expect(fixedLayer.fixedElements_).to.have.length(2);
      expectFe(fixedLayer.fixedElements_[0], {
        id: 'F0',
        element: element1,
        selectors: [
          '#amp-custom-rule1',
          '#amp-custom-rule2',
          '#amp-custom-media-rule1',
          '#other-rule1',
        ],
      });
      expectFe(fixedLayer.fixedElements_[1], {
        id: 'F1',
        element: element2,
        selectors: [
          '#amp-custom-rule2',
          '#amp-custom-supports-rule1',
          '#other-rule2',
        ],
      });
      expect(fixedLayer.isDeclaredFixed(element1)).to.be.true;
      expect(fixedLayer.isDeclaredFixed(element2)).to.be.true;
      expect(fixedLayer.isDeclaredFixed(element3)).to.be.false;
    });

    it('should add and remove element directly', () => {
      const updateStub = sandbox.stub(fixedLayer, 'update');
      expect(fixedLayer.fixedElements_).to.have.length(2);

      // Add.
      fixedLayer.addElement(element3, '*');
      expect(updateStub.callCount).to.equal(1);
      expect(fixedLayer.fixedElements_).to.have.length(3);
      const fe = fixedLayer.fixedElements_[2];
      expect(fe.id).to.equal('F2');
      expect(fe.element).to.equal(element3);
      expect(fe.selectors).to.deep.equal(['*']);

      // Remove.
      fixedLayer.removeElement(element3);
      expect(fixedLayer.fixedElements_).to.have.length(2);

      //Add with forceTransfer
      fixedLayer.addElement(element3, '*', true);
      expect(updateStub.callCount).to.equal(2);
      expect(fixedLayer.fixedElements_).to.have.length(3);
      const fe1 = fixedLayer.fixedElements_[2];
      expect(fe1.id).to.equal('F3');
      expect(fe1.element).to.equal(element3);
      expect(fe1.selectors).to.deep.equal(['*']);
      expect(fe1.forceTransfer).to.be.true;

      // Remove.
      fixedLayer.removeElement(element3);
      expect(fixedLayer.fixedElements_).to.have.length(2);
    });

    it('should remove node when disappeared from DOM', () => {
      docBody.removeChild(element1);
      expect(fixedLayer.fixedElements_).to.have.length(2);
      fixedLayer.update();
      expect(fixedLayer.fixedElements_).to.have.length(1);
    });

    it('should collect updates', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('');
      expect(state['F0'].zIndex).to.equal('');

      expect(state['F1'].fixed).to.equal(false);
    });

    it('should disregard non-fixed position', () => {
      element1.computedStyle['position'] = 'static';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(false);
      expect(state['F1'].fixed).to.equal(false);
    });

    it('should disregard invisible element', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 0;
      element1.offsetHeight = 0;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(false);
      expect(state['F1'].fixed).to.equal(false);
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

      expect(state['F0'].fixed).to.equal(false);
      expect(state['F0'].transferrable).to.equal(false);
      expect(state['F0'].top).to.equal('');
      expect(state['F0'].zIndex).to.equal('');

      expect(state['F1'].fixed).to.equal(false);
    });

    it('should collect for top != auto', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('11px');
    });

    it('should collect for top = auto, but not update top', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = 'auto';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('');
    });

    it('should collect for implicit top = auto, but not update top', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '12px';
      element1.autoOffsetTop = 12;
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('');
    });

    it('should override implicit top = auto to 0 when equals padding', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.autoOffsetTop = 11;
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('0px');
    });

    it('should override implicit top = auto to 0 w/transient padding', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '11px';
      element1.autoOffsetTop = 11;
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('0px');

      // Update to transient padding.
      sandbox.stub(fixedLayer, 'update', () => {});
      fixedLayer.updatePaddingTop(22, /* transient */ true);
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('0px');
      expect(fixedLayer.paddingTop_).to.equal(22);
      expect(fixedLayer.committedPaddingTop_).to.equal(11);

      // Update to non-transient padding.
      fixedLayer.updatePaddingTop(22, /* transient */ false);
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal(''); // Reset completely.
      expect(fixedLayer.paddingTop_).to.equal(22);
      expect(fixedLayer.committedPaddingTop_).to.equal(22);
    });

    it('should always collect and update top = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.computedStyle['top'] = '0px';
      element1.autoOffsetTop = 0;
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.equal(true);
      expect(state['F0'].top).to.equal('0px');
    });

    it('should mutate element to fixed without top', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        top: '',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('');
      expect(fixedLayer.fixedLayer_).to.be.null;
    });

    it('should mutate element to fixed with top', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        top: '17px',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');
    });

    it('should reset top upon being removed from fixedlayer', () => {
      expect(fixedLayer.fixedElements_).to.have.length(2);

      // Add.
      fixedLayer.addElement(element3, '*');
      expect(fixedLayer.fixedElements_).to.have.length(3);
      const fe = fixedLayer.fixedElements_[2];
      expect(fe.id).to.equal('F2');
      expect(fe.element).to.equal(element3);
      expect(fe.selectors).to.deep.equal(['*']);
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        top: '17px',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.element.style.top).to.equal('calc(17px + 11px)');
      // Remove.
      fixedLayer.vsync_ = {
        mutate: function(callback) {
          callback();
        },
      };
      fixedLayer.removeElement(element3);
      expect(fixedLayer.fixedElements_).to.have.length(2);
      expect(element3.style.top).to.equal('');
    });

    it('should mutate element to non-fixed', () => {
      const fe = fixedLayer.fixedElements_[0];
      fe.fixedNow = true;
      fe.element.style.top = '27px';
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: false,
        top: '17px',
      });

      expect(fe.fixedNow).to.be.false;
      expect(fe.element.style.top).to.equal('');
    });

    it('should transform fixed elements with anchored top', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
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

    it('should compound transform with anchored top', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        top: '17px',
        transform: 'scale(2)',
      });

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.equal('scale(2) translateY(-10px)');
    });

    it('should NOT transform fixed elements w/o anchored top', () => {
      const fe = fixedLayer.fixedElements_[0];
      fe.element.style.transform = '';
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        top: '',
      });
      expect(fe.fixedNow).to.be.true;

      fixedLayer.transformMutate('translateY(-10px)');
      expect(fe.element.style.transform).to.equal('');
    });
  });

  describe('with-transfer', () => {
    let fixedLayer;

    beforeEach(() => {
      fixedLayer = new FixedLayer(ampdoc, vsyncApi,
          /* paddingTop */ 11, /* transfer */ true);
      fixedLayer.setup();
    });

    it('should initiale fixed layer to null', () => {
      expect(fixedLayer.transfer_).to.be.true;
      expect(fixedLayer.fixedLayer_).to.be.null;
    });

    it('should collect turn off transferrable', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(false);

      expect(state['F1'].fixed).to.equal(false);
    });

    it('should collect turn on transferrable with top = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(true);
      expect(state['F0'].top).to.equal('0px');
    });

    it('should collect turn off transferrable with top != 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['top'] = '2px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(false);
      expect(state['F0'].top).to.equal('2px');
    });

    it('should collect turn on transferrable with bottom = 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['bottom'] = '0px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(true);
    });

    it('should not disregard invisible element if it has forceTransfer', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 0;
      element1.offsetHeight = 0;

      expect(vsyncTasks).to.have.length(1);
      let state = {};
      vsyncTasks[0].measure(state);
      expect(state['F0'].fixed).to.be.false;
      expect(state['F0'].transferrable).to.equal(false);

      // Add.
      state = {};
      fixedLayer.setupFixedElement_(element1, '*', true);
      expect(vsyncTasks).to.have.length(1);
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(true);
    });

    it('should collect turn off transferrable with bottom != 0', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['bottom'] = '2px';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].transferrable).to.equal(false);
    });

    it('should collect z-index', () => {
      element1.computedStyle['position'] = 'fixed';
      element1.offsetWidth = 10;
      element1.offsetHeight = 10;
      element1.computedStyle['z-index'] = '101';

      expect(vsyncTasks).to.have.length(1);
      const state = {};
      vsyncTasks[0].measure(state);

      expect(state['F0'].fixed).to.be.true;
      expect(state['F0'].zIndex).to.equal('101');
    });

    it('should transfer element', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fe.placeholder.style['display']).to.equal('none');

      expect(fe.element.parentElement).to.equal(fixedLayer.fixedLayer_);
      expect(fe.element.style['pointer-events']).to.equal('initial');
      expect(fe.element.style['zIndex']).to.equal('calc(10001 + 11)');

      expect(fixedLayer.fixedLayer_).to.exist;
      expect(fixedLayer.fixedLayer_.style['pointerEvents']).to.equal('none');
    });

    it('should ignore transfer when non-transferrable', () => {
      const fe = fixedLayer.fixedElements_[0];
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        transferrable: false,
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.not.exist;
      expect(fixedLayer.fixedLayer_).to.not.exist;
      expect(fe.element.parentElement).to.not.equal(fixedLayer.fixedLayer_);
    });

    it('should return transfered element if it no longer matches', () => {
      const fe = fixedLayer.fixedElements_[0];
      fe.element.matches = () => false;
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });

      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fixedLayer.fixedLayer_).to.exist;
      expect(fe.element.parentElement).to.not.equal(fixedLayer.fixedLayer_);
      expect(fe.placeholder.parentElement).to.be.null;
      expect(fe.element.style.zIndex).to.equal('');
    });

    it('should remove transfered element if it no longer exists', () => {
      const fe = fixedLayer.fixedElements_[0];

      // Add.
      fixedLayer.mutateFixedElement_(fe, 1, {
        fixed: true,
        transferrable: true,
        zIndex: '11',
      });
      expect(fe.fixedNow).to.be.true;
      expect(fe.placeholder).to.exist;
      expect(fe.element.parentElement).to.equal(fixedLayer.fixedLayer_);
      expect(fixedLayer.fixedLayer_).to.exist;

      // Remove from DOM.
      fe.element.parentElement.removeChild(fe.element);
      fixedLayer.mutateFixedElement_(fe, 1, {
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
  });
});
