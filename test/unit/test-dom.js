/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import * as dom from '../../src/dom';
import {BaseElement} from '../../src/base-element';
import {createAmpElementForTesting} from '../../src/custom-element';
import {isElement} from '../../src/core/types';
import {loadPromise} from '../../src/event-helper';
import {setScopeSelectorSupportedForTesting} from '../../src/core/dom/css';
import {setShadowDomSupportedVersionForTesting} from '../../src/core/dom/web-components';
import {toArray} from '../../src/core/types/array';

describes.sandboxed('DOM', {}, (env) => {
  afterEach(() => {
    setScopeSelectorSupportedForTesting(undefined);
    setShadowDomSupportedVersionForTesting(undefined);
  });

  it('should remove all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));
    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    dom.removeChildren(element);
    expect(element.children.length).to.equal(0);
    expect(element.firstChild).to.equal(null);
    expect(element.textContent).to.equal('');
  });

  it('should copy all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));

    const other = document.createElement('div');
    dom.copyChildren(element, other);

    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    expect(other.children.length).to.equal(1);
    expect(other.firstChild).to.not.equal(null);
    expect(other.firstChild.tagName).to.equal('DIV');
    expect(other.textContent).to.equal('ABC');
  });

  it('isConnectedNode', () => {
    expect(dom.isConnectedNode(document)).to.be.true;

    const a = document.createElement('div');
    expect(dom.isConnectedNode(a)).to.be.false;

    const b = document.createElement('div');
    b.appendChild(a);

    document.body.appendChild(b);
    expect(dom.isConnectedNode(a)).to.be.true;

    const shadow = a.attachShadow({mode: 'open'});
    const c = document.createElement('div');
    shadow.appendChild(c);
    expect(dom.isConnectedNode(c)).to.be.true;

    document.body.removeChild(b);
    expect(dom.isConnectedNode(c)).to.be.false;
  });

  it('isConnectedNode (no Node.p.isConnected)', () => {
    env.sandbox.deleteProperty(Node.prototype, 'isConnected');
    expect(dom.isConnectedNode(document)).to.be.true;

    const a = document.createElement('div');
    expect(dom.isConnectedNode(a)).to.be.false;

    const b = document.createElement('div');
    b.appendChild(a);

    document.body.appendChild(b);
    expect(dom.isConnectedNode(a)).to.be.true;

    const shadow = a.attachShadow({mode: 'open'});
    const c = document.createElement('div');
    shadow.appendChild(c);
    expect(dom.isConnectedNode(c)).to.be.true;

    document.body.removeChild(b);
    expect(dom.isConnectedNode(c)).to.be.false;
  });

  it('rootNodeFor', () => {
    const a = document.createElement('div');
    expect(dom.rootNodeFor(a)).to.equal(a);

    const b = document.createElement('div');
    a.appendChild(b);
    expect(dom.rootNodeFor(b)).to.equal(a);

    const c = document.createElement('div');
    b.appendChild(c);
    expect(dom.rootNodeFor(c)).to.equal(a);
  });

  it('rootNodeFor (no Node.p.getRootNode)', () => {
    env.sandbox.deleteProperty(Node.prototype, 'getRootNode');

    const a = document.createElement('div');
    expect(dom.rootNodeFor(a)).to.equal(a);

    const b = document.createElement('div');
    a.appendChild(b);
    expect(dom.rootNodeFor(b)).to.equal(a);

    const c = document.createElement('div');
    b.appendChild(c);
    expect(dom.rootNodeFor(c)).to.equal(a);

    const polyfill = document.createElement('i-amphtml-shadow-root');
    const e = document.createElement('div');
    polyfill.appendChild(e);
    a.appendChild(polyfill);
    expect(dom.rootNodeFor(e)).to.equal(polyfill);
  });

  describe('isShadowRoot', () => {
    it('should yield false for non-nodes', () => {
      expect(dom.isShadowRoot(null)).to.be.false;
      expect(dom.isShadowRoot(undefined)).to.be.false;
      expect(dom.isShadowRoot('')).to.be.false;
      expect(dom.isShadowRoot(11)).to.be.false;
    });

    it('should yield false for other types of nodes', () => {
      expect(dom.isShadowRoot(document.createElement('div'))).to.be.false;
      expect(dom.isShadowRoot(document.createTextNode('abc'))).to.be.false;
    });

    it('should yield true for natively-supported createShadowRoot API', () => {
      const element = document.createElement('div');
      if (element.createShadowRoot) {
        const shadowRoot = element.createShadowRoot();
        expect(dom.isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield true for natively-supported attachShadow API', () => {
      const element = document.createElement('div');
      if (element.attachShadow) {
        const shadowRoot = element.attachShadow({mode: 'open'});
        expect(dom.isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield false for document-fragment non-shadow-root node', () => {
      const fragment = document.createDocumentFragment();
      expect(dom.isShadowRoot(fragment)).to.be.false;
    });

    it('should yield true for polyfill', () => {
      expect(dom.isShadowRoot(document.createElement('i-amphtml-shadow-root')))
        .to.be.true;
    });
  });

  it('closest should find itself', () => {
    const element = document.createElement('div');

    const child = document.createElement('div');
    element.appendChild(child);

    expect(dom.closest(child, () => true)).to.equal(child);
    expect(dom.closestNode(child, () => true)).to.equal(child);
    expect(dom.closestAncestorElementBySelector(child, 'div')).to.equal(child);
    expect(dom.closestAncestorElementBySelector(child, 'DIV')).to.equal(child);
  });

  it('closest should stop search at opt_stopAt', () => {
    const cbSpy = env.sandbox.spy();
    const cb = (el) => {
      cbSpy();
      return el.tagName == 'DIV';
    };
    const element = document.createElement('div');

    const child = document.createElement('p');
    const grandchild = document.createElement('img');
    child.appendChild(grandchild);
    element.appendChild(child);
    expect(dom.closest(grandchild, cb)).to.equal(element);
    expect(cbSpy).to.be.calledThrice;

    expect(dom.closest(grandchild, cb, child)).to.be.null;
    expect(cbSpy).to.have.callCount(4);
  });

  it('closest should find first match', () => {
    const parent = document.createElement('parent');

    const element = document.createElement('element');
    parent.appendChild(element);

    const child = document.createElement('child');
    element.appendChild(child);

    expect(dom.closest(child, (e) => e.tagName == 'CHILD')).to.equal(child);
    expect(dom.closestNode(child, (e) => e.tagName == 'CHILD')).to.equal(child);
    expect(dom.closestAncestorElementBySelector(child, 'child')).to.equal(
      child
    );

    expect(dom.closest(child, (e) => e.tagName == 'ELEMENT')).to.equal(element);
    expect(dom.closestNode(child, (e) => e.tagName == 'ELEMENT')).to.equal(
      element
    );
    expect(dom.closestAncestorElementBySelector(child, 'element')).to.equal(
      element
    );

    expect(dom.closest(child, (e) => e.tagName == 'PARENT')).to.equal(parent);
    expect(dom.closestNode(child, (e) => e.tagName == 'PARENT')).to.equal(
      parent
    );
    expect(dom.closestAncestorElementBySelector(child, 'parent')).to.equal(
      parent
    );
  });

  it('closestNode should find nodes as well as elements', () => {
    const fragment = document.createDocumentFragment();

    const element = document.createElement('div');
    fragment.appendChild(element);

    const text = document.createTextNode('abc');
    element.appendChild(text);

    expect(dom.closestNode(text, () => true)).to.equal(text);
    expect(dom.closestNode(text, isElement)).to.equal(element);
    expect(dom.closestNode(text, (n) => n.nodeType == 11)).to.equal(fragment);
  });

  it('closestAncestorElementBySelector should find first match', () => {
    const parent = document.createElement('parent');
    parent.className = 'parent';
    parent.id = 'parent';

    const element = document.createElement('element');
    element.id = 'element';
    element.className = 'element';
    parent.appendChild(element);

    const child = document.createElement('child');
    child.id = 'child';
    child.className = 'child';
    element.appendChild(child);

    expect(dom.closestAncestorElementBySelector(child, 'child')).to.equal(
      child
    );
    expect(dom.closestAncestorElementBySelector(child, '.child')).to.equal(
      child
    );
    expect(dom.closestAncestorElementBySelector(child, '#child')).to.equal(
      child
    );

    expect(dom.closestAncestorElementBySelector(child, 'element')).to.equal(
      element
    );
    expect(dom.closestAncestorElementBySelector(child, '.element')).to.equal(
      element
    );
    expect(dom.closestAncestorElementBySelector(child, '#element')).to.equal(
      element
    );

    expect(dom.closestAncestorElementBySelector(child, 'parent')).to.equal(
      parent
    );
    expect(dom.closestAncestorElementBySelector(child, '.parent')).to.equal(
      parent
    );
    expect(dom.closestAncestorElementBySelector(child, '#parent')).to.equal(
      parent
    );
  });

  it('elementByTag should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element');
    parent.appendChild(element1);

    const element2 = document.createElement('element');
    parent.appendChild(element2);

    expect(dom.elementByTag(parent, 'element')).to.equal(element1);
    expect(dom.elementByTag(parent, 'ELEMENT')).to.equal(element1);
  });

  it('childElement should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(dom.childElement(parent, () => true)).to.equal(element1);
    expect(dom.childElement(parent, (e) => e.tagName == 'ELEMENT1')).to.equal(
      element1
    );
    expect(dom.childElement(parent, (e) => e.tagName == 'ELEMENT2')).to.equal(
      element2
    );
    expect(dom.childElement(parent, (e) => e.tagName == 'ELEMENT3')).to.be.null;
  });

  it('childElements should find all matches', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(dom.childElements(parent, () => true).length).to.equal(2);
    expect(
      dom.childElements(parent, (e) => e.tagName == 'ELEMENT1').length
    ).to.equal(1);
    expect(
      dom.childElements(parent, (e) => e.tagName == 'ELEMENT2').length
    ).to.equal(1);
    expect(
      dom.childElements(parent, (e) => e.tagName == 'ELEMENT3').length
    ).to.be.equal(0);
  });

  it('childNodes should find all matches', () => {
    const parent = document.createElement('parent');
    parent.appendChild(document.createTextNode('text1'));
    parent.appendChild(document.createTextNode('text2'));
    parent.appendChild(document.createElement('element'));
    expect(dom.childNodes(parent, () => true).length).to.equal(3);
    expect(
      dom.childNodes(parent, (node) => node.textContent == 'text1').length
    ).to.equal(1);
    expect(
      dom.childNodes(parent, (node) => node.textContent == 'text2').length
    ).to.equal(1);
    expect(
      dom.childNodes(parent, (node) => node.textContent == 'text3').length
    ).to.equal(0);
    expect(
      dom.childNodes(parent, (node) => node.tagName == 'ELEMENT').length
    ).to.equal(1);
    expect(
      dom.childNodes(parent, (node) => node.tagName == 'ELEMENT2').length
    ).to.equal(0);
  });

  function testChildElementByTag() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    const element3 = document.createElement('element3');
    element1.appendChild(element3);

    expect(dom.childElementByTag(parent, 'element1')).to.equal(element1);
    expect(dom.childElementByTag(parent, 'element2')).to.equal(element2);
    expect(dom.childElementByTag(parent, 'element3')).to.be.null;
    expect(dom.childElementByTag(parent, 'element4')).to.be.null;
  }

  it('childElementByTag should find first match', testChildElementByTag);

  it('childElementByTag should find first match (polyfill)', () => {
    setScopeSelectorSupportedForTesting(false);
    testChildElementByTag();
  });

  function testChildElementsByTag() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element23');
    parent.appendChild(element2);

    const element3 = document.createElement('element23');
    parent.appendChild(element3);

    expect(toArray(dom.childElementsByTag(parent, 'element1'))).to.deep.equal([
      element1,
    ]);
    expect(toArray(dom.childElementsByTag(parent, 'element23'))).to.deep.equal([
      element2,
      element3,
    ]);
    expect(toArray(dom.childElementsByTag(parent, 'element3'))).to.deep.equal(
      []
    );
  }

  it('childElementsByTag should find first match', testChildElementsByTag);

  it('childElementsByTag should find first match (polyfill)', () => {
    setScopeSelectorSupportedForTesting(false);
    testChildElementsByTag();
  });

  function testChildElementByAttr() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    element1.setAttribute('attr1', '1');
    element1.setAttribute('attr12', '1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    element2.setAttribute('attr2', '2');
    element2.setAttribute('attr12', '2');
    parent.appendChild(element2);

    const element3 = document.createElement('element2');
    element3.setAttribute('on-child', '');
    element2.appendChild(element3);

    expect(dom.childElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(dom.childElementByAttr(parent, 'attr12')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr3')).to.be.null;
    expect(dom.childElementByAttr(parent, 'on-child')).to.be.null;
  }

  it('childElementByAttr should find first match', testChildElementByAttr);

  it('childElementByAttr should find first match', () => {
    setScopeSelectorSupportedForTesting(false);
    testChildElementByAttr();
  });

  function testChildElementsByAttr() {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    element1.setAttribute('attr1', '1');
    element1.setAttribute('attr12', '1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    element2.setAttribute('attr2', '2');
    element2.setAttribute('attr12', '2');
    parent.appendChild(element2);

    const element3 = document.createElement('element2');
    element3.setAttribute('on-child', '');
    element2.appendChild(element3);

    expect(dom.childElementsByAttr(parent, 'attr1').length).to.equal(1);
    expect(dom.childElementsByAttr(parent, 'attr2').length).to.equal(1);
    expect(dom.childElementsByAttr(parent, 'attr12').length).to.equal(2);
    expect(dom.childElementsByAttr(parent, 'attr3').length).to.be.equal(0);
    expect(dom.childElementsByAttr(parent, 'on-child').length).to.be.equal(0);
  }

  it('childElementsByAttr should find all matches', testChildElementsByAttr);

  it('childElementsByAttr should find all matches', () => {
    setScopeSelectorSupportedForTesting(false);
    testChildElementsByAttr();
  });

  it('lastChildElementByAttr should find last match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    element1.setAttribute('attr1', '1');
    element1.setAttribute('attr12', '1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    element2.setAttribute('attr2', '2');
    element2.setAttribute('attr12', '2');
    parent.appendChild(element2);

    const element3 = document.createElement('element2');
    element3.setAttribute('on-child', '');
    element2.appendChild(element3);

    expect(dom.lastChildElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(dom.lastChildElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(dom.lastChildElementByAttr(parent, 'attr12')).to.equal(element2);
    expect(dom.lastChildElementByAttr(parent, 'attr3')).to.be.null;
    expect(dom.lastChildElementByAttr(parent, 'on-child')).to.be.null;
  });

  it('ancestorElements should find all matches', () => {
    const parent = document.createElement('parent');
    const element1 = document.createElement('element1');
    parent.appendChild(element1);
    const element2 = document.createElement('element2');
    element1.appendChild(element2);
    expect(dom.ancestorElements(element2, () => true).length).to.equal(2);
    expect(
      dom.ancestorElements(element2, (e) => e.tagName == 'ELEMENT1').length
    ).to.equal(1);
    expect(
      dom.ancestorElements(element1, (e) => e.tagName == 'PARENT').length
    ).to.equal(1);
    expect(
      dom.ancestorElements(parent, (e) => e.tagName == 'ELEMENT3').length
    ).to.be.equal(0);
  });

  it('ancestorElementsByTag should find all matches', () => {
    const parent = document.createElement('parent');
    const element1 = document.createElement('element1');
    parent.appendChild(element1);
    const element2 = document.createElement('element2');
    element1.appendChild(element2);
    expect(dom.ancestorElementsByTag(element2, 'ELEMENT1').length).to.equal(1);
    expect(dom.ancestorElementsByTag(element1, 'PARENT').length).to.equal(1);
    expect(dom.ancestorElementsByTag(element2, 'ELEMENT3').length).to.be.equal(
      0
    );
  });

  it('iterateCursor should loop through every element in a NodeList', () => {
    const fragment = document.createDocumentFragment();
    [0, 1, 2].forEach(() => fragment.appendChild(document.createElement('i')));

    const iSpy = env.sandbox.spy();
    dom.iterateCursor(fragment.querySelectorAll('i'), iSpy);
    expect(iSpy).to.be.calledThrice;

    const bSpy = env.sandbox.spy();
    dom.iterateCursor(fragment.querySelectorAll('b'), bSpy);
    expect(bSpy).to.have.not.been.called;
  });

  it('iterateCursor should allow null elements in a list', () => {
    const list = ['wow', null, 'cool'];

    const spy = env.sandbox.spy();
    dom.iterateCursor(list, spy);
    expect(spy).to.be.calledThrice;
  });

  function testScopedQuerySelector() {
    const grandparent = document.createElement('div');

    const parent = document.createElement('div');
    grandparent.appendChild(parent);

    const element1 = document.createElement('div');
    parent.appendChild(element1);

    expect(dom.scopedQuerySelector(parent, 'div')).to.equal(element1);
    expect(dom.scopedQuerySelector(grandparent, 'div div')).to.equal(element1);
  }

  it('scopedQuerySelector should find first match', testScopedQuerySelector);

  it('scopedQuerySelector should find first match (polyfill)', () => {
    setScopeSelectorSupportedForTesting(false);
    testScopedQuerySelector();
  });

  function testScopedQuerySelectorAll() {
    const grandparent = document.createElement('div');

    const parent = document.createElement('div');
    grandparent.appendChild(parent);

    const element1 = document.createElement('div');
    parent.appendChild(element1);

    const element2 = document.createElement('div');
    parent.appendChild(element2);

    expect(toArray(dom.scopedQuerySelectorAll(parent, 'div'))).to.deep.equal([
      element1,
      element2,
    ]);
    expect(
      toArray(dom.scopedQuerySelectorAll(grandparent, 'div div'))
    ).to.deep.equal([element1, element2]);
  }

  it(
    'scopedQuerySelectorAll should find all matches',
    testScopedQuerySelectorAll
  );

  it('scopedQuerySelectorAll should find all matches (polyfill)', () => {
    setScopeSelectorSupportedForTesting(false);
    testScopedQuerySelectorAll();
  });

  describe('waitFor', () => {
    let parent;
    let child;

    beforeEach(() => {
      parent = document.createElement('div');
      child = document.createElement('div');
    });

    function contains() {
      return parent.contains(child);
    }

    it('should immediately return if child is available', () => {
      parent.appendChild(child);
      const spy = env.sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy).to.be.calledOnce;
    });

    it('should wait until child is available', () => {
      const spy = env.sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy).to.have.not.been.called;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (spy.callCount > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
        parent.appendChild(child);
      }).then(() => {
        expect(spy).to.be.calledOnce;
      });
    });

    it('should prefer MutationObserver and disconnect when done', () => {
      let mutationCallback;
      const mutationObserver = {
        observe: env.sandbox.spy(),
        disconnect: env.sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: {
            MutationObserver: (callback) => {
              mutationCallback = callback;
              return mutationObserver;
            },
          },
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = env.sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy).to.have.not.been.called;
      expect(mutationObserver.observe).to.be.calledOnce;
      expect(mutationObserver.observe.firstCall.args[0]).to.equal(parent);
      expect(mutationObserver.observe.firstCall.args[1]).to.deep.equal({
        childList: true,
      });
      expect(mutationCallback).to.exist;

      // False callback.
      mutationCallback();
      expect(spy).to.have.not.been.called;
      expect(mutationObserver.disconnect).to.have.not.been.called;

      // True callback.
      checkFuncValue = true;
      mutationCallback();
      expect(spy).to.be.calledOnce;
      expect(mutationObserver.disconnect).to.be.calledOnce;
    });

    it('should fallback to polling without MutationObserver', () => {
      let intervalCallback;
      const win = {
        setInterval: (callback) => {
          intervalCallback = callback;
          return 123;
        },
        clearInterval: env.sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: win,
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = env.sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy).to.have.not.been.called;
      expect(intervalCallback).to.exist;

      // False callback.
      intervalCallback();
      expect(spy).to.have.not.been.called;
      expect(win.clearInterval).to.have.not.been.called;

      // True callback.
      checkFuncValue = true;
      intervalCallback();
      expect(spy).to.be.calledOnce;
      expect(win.clearInterval).to.be.calledOnce;
    });

    it('should wait for body', () => {
      return dom.waitForBodyOpenPromise(document).then(() => {
        expect(document.body).to.exist;
      });
    });

    it('should wait for body even if doc is complete', () => {
      return new Promise((resolve, reject) => {
        const doc = {
          readyState: 'complete',
          body: null,
          documentElement: {
            ownerDocument: {
              defaultView: {
                setInterval() {
                  return window.setInterval.apply(window, arguments);
                },
                clearInterval() {
                  return window.clearInterval.apply(window, arguments);
                },
              },
            },
          },
        };
        setTimeout(() => {
          doc.body = {};
        }, 50);
        dom.waitForBodyOpen(doc, () => {
          try {
            expect(doc.body).to.exist;
            resolve();
          } catch (e) {
            reject(new Error("body doesn't exist"));
          }
        });
      });
    });

    it('should yield body asap even if doc is not complete', () => {
      return new Promise((resolve, reject) => {
        const doc = {
          readyState: 'loading',
          body: null,
          documentElement: {
            ownerDocument: {
              defaultView: {
                setInterval() {
                  return window.setInterval.apply(window, arguments);
                },
                clearInterval() {
                  return window.clearInterval.apply(window, arguments);
                },
              },
            },
          },
        };
        setTimeout(() => {
          doc.body = {};
        }, 50);
        dom.waitForBodyOpen(doc, () => {
          try {
            expect(doc.body).to.exist;
            resolve();
          } catch (e) {
            reject(new Error("body doesn't exist"));
          }
        });
      });
    });
  });

  describe('getDataParamsFromAttributes', () => {
    it('should return key-value for data-param- attributes', () => {
      const element = document.createElement('element');
      element.setAttribute('attr1', '1');
      element.setAttribute('data-param-hello', '2');
      element.setAttribute('data-param-from-the-other-side', '3');
      const params = dom.getDataParamsFromAttributes(element);
      expect(params.hello).to.be.equal('2');
      expect(params.fromTheOtherSide).to.be.equal('3');
      expect(params.attr1).to.be.undefined;
    });

    it('should return key-value for custom data attributes', () => {
      const element = document.createElement('element');
      element.setAttribute('data-vars-event-name', 'click');
      const params = dom.getDataParamsFromAttributes(
        element,
        null,
        /^vars(.+)/
      );
      expect(params.eventName).to.be.equal('click');
    });
  });

  describe('hasNextNodeInDocumentOrder', () => {
    it('should return true when the element has a nextSibling', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const sibling = document.createElement('div');
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      parent.appendChild(sibling);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
    });

    it('should return true when element ancestor has nextSibling', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const uncle = document.createElement('div');
      const ancestor = document.createElement('div');
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      ancestor.appendChild(parent);
      ancestor.appendChild(uncle);
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
    });

    it('should return false when ancestor with sibling with stop node', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const uncle = document.createElement('div');
      const ancestor = document.createElement('div');
      ancestor.appendChild(parent);
      ancestor.appendChild(uncle);
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
      expect(dom.hasNextNodeInDocumentOrder(element, parent)).to.be.false;
    });
  });

  describe('openWindowDialog', () => {
    let windowApi;
    let windowMock;

    beforeEach(() => {
      windowApi = {
        open: () => {
          throw new Error('not mocked');
        },
      };
      windowMock = env.sandbox.mock(windowApi);
    });

    afterEach(() => {
      windowMock.verify();
    });

    it('should return on first success', () => {
      const dialog = {};
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .returns(dialog)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'width=1'
      );
      expect(res).to.equal(dialog);
    });

    it('should retry on first null', () => {
      const dialog = {};
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .returns(null)
        .once();
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top')
        .returns(dialog)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'width=1'
      );
      expect(res).to.equal(dialog);
    });

    it('should retry on first undefined', () => {
      const dialog = {};
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .returns(undefined)
        .once();
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top')
        .returns(dialog)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'width=1'
      );
      expect(res).to.equal(dialog);
    });

    it('should retry on first exception', () => {
      const dialog = {};
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .throws(new Error('intentional'))
        .once();
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top')
        .returns(dialog)
        .once();
      allowConsoleError(() => {
        const res = dom.openWindowDialog(
          windowApi,
          'https://example.com/',
          '_blank',
          'width=1'
        );
        expect(res).to.equal(dialog);
      });
    });

    it('should return the final result', () => {
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .returns(undefined)
        .once();
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top')
        .returns(null)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'width=1'
      );
      expect(res).to.be.null;
    });

    it('should return the final exception', () => {
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'width=1')
        .throws(new Error('intentional1'))
        .once();
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top')
        .throws(new Error('intentional2'))
        .once();
      allowConsoleError(() => {
        expect(() => {
          dom.openWindowDialog(
            windowApi,
            'https://example.com/',
            '_blank',
            'width=1'
          );
        }).to.throw(/intentional2/);
      });
    });

    it('should not retry with noopener set', () => {
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_blank', 'noopener,width=1')
        .returns(null)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_blank',
        'noopener,width=1'
      );
      expect(res).to.be.null;
    });

    it('should retry only non-top target', () => {
      windowMock
        .expects('open')
        .withExactArgs('https://example.com/', '_top', 'width=1')
        .returns(null)
        .once();
      const res = dom.openWindowDialog(
        windowApi,
        'https://example.com/',
        '_top',
        'width=1'
      );
      expect(res).to.be.null;
    });
  });

  describe('isJsonScriptTag', () => {
    it('should return true for <script type="application/json">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'application/json');
      expect(dom.isJsonScriptTag(element)).to.be.true;
    });

    it('should return true for <script type="aPPLication/jSon">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'aPPLication/jSon');
      expect(dom.isJsonScriptTag(element)).to.be.true;
    });

    it('should return false for <script type="text/javascript">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'text/javascript');
      expect(dom.isJsonScriptTag(element)).to.be.false;
    });

    it('should return false for <div type="application/json">', () => {
      const element = document.createElement('div');
      element.setAttribute('type', 'application/json');
      expect(dom.isJsonScriptTag(element)).to.be.false;
    });
  });

  describe('escapeHtml', () => {
    it('should tolerate empty string', () => {
      expect(dom.escapeHtml('')).to.equal('');
    });

    it('should ignore non-escapes', () => {
      expect(dom.escapeHtml('abc')).to.equal('abc');
    });

    it('should subsctitute escapes', () => {
      expect(dom.escapeHtml('a<b>&c"d\'e`f')).to.equal(
        'a&lt;b&gt;&amp;c&quot;d&#x27;e&#x60;f'
      );
    });
  });

  describe('tryFocus', () => {
    it('should call focus on the element', () => {
      const element = {
        focus() {},
      };
      const focusSpy = env.sandbox.spy(element, 'focus');
      dom.tryFocus(element);
      expect(focusSpy).to.have.been.called;
    });

    it('should not throw exception if element focus throws exception', () => {
      const element = {
        focus() {
          throw new Error('Cannot focus');
        },
      };
      const focusSpy = env.sandbox.spy(element, 'focus');
      expect(() => dom.tryFocus(element)).to.not.throw();
      expect(focusSpy).to.have.been.called;
    });
  });

  describe('matches', () => {
    let div, img1, iframe, ampEl;
    beforeEach(() => {
      ampEl = document.createElement('x-ad');
      ampEl.className = 'i-amphtml-element';
      ampEl.id = 'ampEl';
      iframe = document.createElement('iframe');
      div = document.createElement('div');
      div.id = 'div';
      img1 = document.createElement('x-img');
      img1.id = 'img1';
      div.appendChild(img1);
      iframe.srcdoc = div.outerHTML;
      document.body.appendChild(ampEl);

      const loaded = loadPromise(iframe);
      ampEl.appendChild(iframe);
      return loaded;
    });

    afterEach(() => {
      document.body.removeChild(ampEl);
    });

    it('finds element by id', () => {
      expect(dom.matches(ampEl, '#ampEl')).to.be.true;
      [div, img1, iframe].map((el) => {
        expect(dom.matches(el, '#ampEl')).to.be.false;
      });
    });

    it('finds element by tagname', () => {
      expect(dom.matches(div, 'div')).to.be.true;
      [ampEl, img1, iframe].map((el) => {
        expect(dom.matches(el, 'div')).to.be.false;
      });
    });
  });

  it('isEnabled', () => {
    expect(dom.isEnabled(document)).to.be.true;

    const a = document.createElement('button');
    expect(dom.isEnabled(a)).to.be.true;

    a.disabled = true;
    expect(dom.isEnabled(a)).to.be.false;

    a.disabled = false;
    expect(dom.isEnabled(a)).to.be.true;

    const b = document.createElement('fieldset');
    b.appendChild(a);
    expect(dom.isEnabled(a)).to.be.true;

    b.disabled = true;
    expect(dom.isEnabled(a)).to.be.false;

    b.removeChild(a);
    const c = document.createElement('legend');
    c.appendChild(a);
    b.appendChild(c);
    expect(dom.isEnabled(a)).to.be.true;
  });

  it(
    'templateContentClone on a <template> element (browser supports' +
      ' HTMLTemplateElement)',
    () => {
      const template = document.createElement('template');
      template.innerHTML = '<span>123</span><span>456<em>789</em></span>';
      const content = dom.templateContentClone(template);

      const spans = content.querySelectorAll('span');
      expect(spans.length).to.equal(2);
      expect(spans[0].innerHTML).to.equal('123');
      expect(spans[1].innerHTML).to.equal('456<em>789</em>');
    }
  );

  it(
    'templateContentClone on a <template> element (simulate a browser' +
      ' that does not support HTMLTemplateElement)',
    () => {
      const template = document.createElement('div');
      template.innerHTML = '<span>123</span><span>456<em>789</em></span>';
      const content = dom.templateContentClone(template);

      const spans = content.querySelectorAll('span');
      expect(spans.length).to.equal(2);
      expect(spans[0].innerHTML).to.equal('123');
      expect(spans[1].innerHTML).to.equal('456<em>789</em>');
    }
  );

  it('should implement containsNotSelf', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    const uncle = document.createElement('div');
    const grandparent = document.createElement('div');
    grandparent.appendChild(parent);
    grandparent.appendChild(uncle);
    parent.appendChild(child);

    expect(dom.containsNotSelf(grandparent, grandparent)).to.be.false;
    expect(dom.containsNotSelf(grandparent, parent)).to.be.true;
    expect(dom.containsNotSelf(grandparent, uncle)).to.be.true;
    expect(dom.containsNotSelf(grandparent, child)).to.be.true;

    expect(dom.containsNotSelf(parent, parent)).to.be.false;
    expect(dom.containsNotSelf(parent, uncle)).to.be.false;
    expect(dom.containsNotSelf(parent, grandparent)).to.be.false;
    expect(dom.containsNotSelf(parent, child)).to.be.true;
  });

  describe('domOrderComparator', () => {
    it('should sort elements by dom order', () => {
      //
      // <div id='elem1'>
      //   <div id='elem2'>
      //      <div id='elem3'>
      //   <div id='elem4'>
      //
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const elem3 = document.createElement('div');
      const elem4 = document.createElement('div');

      elem1.appendChild(elem2);
      elem2.appendChild(elem3);
      elem1.appendChild(elem4);

      expect(dom.domOrderComparator(elem1, elem1)).to.equal(0);
      expect(dom.domOrderComparator(elem1, elem2)).to.equal(-1);
      expect(dom.domOrderComparator(elem1, elem3)).to.equal(-1);
      expect(dom.domOrderComparator(elem1, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem2, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem2, elem2)).to.equal(0);
      expect(dom.domOrderComparator(elem2, elem3)).to.equal(-1);
      expect(dom.domOrderComparator(elem2, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem3, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem3, elem2)).to.equal(1);
      expect(dom.domOrderComparator(elem3, elem3)).to.equal(0);
      expect(dom.domOrderComparator(elem3, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem4, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem2)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem3)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem4)).to.equal(0);
    });
  });
});

describes.realWin(
  'DOM',
  {
    amp: {
      /* amp spec */
      ampdoc: 'single',
    },
  },
  (env) => {
    let doc;
    class TestElement extends BaseElement {}
    describe('whenUpgradeToCustomElement function', () => {
      beforeEach(() => {
        doc = env.win.document;
      });

      it('should not continue if element is not AMP element', () => {
        const element = doc.createElement('div');
        allowConsoleError(() => {
          expect(() => dom.whenUpgradedToCustomElement(element)).to.throw(
            'element is not AmpElement'
          );
        });
      });

      it('should resolve if element has already upgrade', () => {
        const element = doc.createElement('amp-img');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        return dom.whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });

      it('should resolve when element upgrade', () => {
        const element = doc.createElement('amp-test');
        element.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(element);
        env.win.setTimeout(() => {
          env.win.customElements.define(
            'amp-test',
            createAmpElementForTesting(env.win, TestElement)
          );
        }, 100);
        return dom.whenUpgradedToCustomElement(element).then((element) => {
          expect(element.whenBuilt).to.exist;
        });
      });
    });

    describe('toggleAttribute', () => {
      let el;

      beforeEach(() => {
        el = document.createElement('div');
      });

      it('should toggle to remove the attribute with an empty value', () => {
        el.setAttribute('foo', '');
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should toggle to remove the attribute with a non-empty value', () => {
        el.setAttribute('foo', 'asdf');
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should toggle to add the attribute', () => {
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.equal('');
      });

      it('should remove the attribute when forced', () => {
        el.setAttribute('foo', '');
        dom.toggleAttribute(el, 'foo', false);
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should not add the attribute when forced off', () => {
        dom.toggleAttribute(el, 'foo', false);
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should add the attribute when forced and it does not exist', () => {
        dom.toggleAttribute(el, 'foo', true);
        expect(el.getAttribute('foo')).to.equal('');
      });

      it('should leave the attribute when forced and it exists', () => {
        el.setAttribute('foo', 'asdf');
        dom.toggleAttribute(el, 'foo', true);
        expect(el.getAttribute('foo')).to.equal('asdf');
      });
    });

    describe('parseBooleanAttribute', () => {
      it('should return null for null/undefined', () => {
        expect(dom.parseBooleanAttribute(null)).to.be.undefined;
        expect(dom.parseBooleanAttribute(undefined)).to.be.undefined;
      });

      it('should return true for empty string', () => {
        expect(dom.parseBooleanAttribute('')).to.be.true;
      });

      it('should return true for "true" string', () => {
        expect(dom.parseBooleanAttribute('true')).to.be.true;
      });

      it('should return false for "false" string', () => {
        expect(dom.parseBooleanAttribute('false')).to.be.false;
      });

      it('should return true for a random string', () => {
        expect(dom.parseBooleanAttribute('a')).to.be.true;
      });
    });
  }
);
