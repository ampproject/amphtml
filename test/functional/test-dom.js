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
import * as sinon from 'sinon';


describe('DOM', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    dom.setScopeSelectorSupportedForTesting(undefined);
    sandbox.restore();
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

  it('closest should find itself', () => {
    const element = document.createElement('div');

    const child = document.createElement('div');
    element.appendChild(child);

    expect(dom.closest(child, () => true)).to.equal(child);
    expect(dom.closestNode(child, () => true)).to.equal(child);
    expect(dom.closestByTag(child, 'div')).to.equal(child);
    expect(dom.closestByTag(child, 'DIV')).to.equal(child);
  });

  it('closest should find first match', () => {
    const parent = document.createElement('parent');

    const element = document.createElement('element');
    parent.appendChild(element);

    const child = document.createElement('child');
    element.appendChild(child);

    expect(dom.closest(child, e => e.tagName == 'CHILD')).to.equal(child);
    expect(dom.closestNode(child, e => e.tagName == 'CHILD')).to.equal(child);
    expect(dom.closestByTag(child, 'child')).to.equal(child);

    expect(dom.closest(child, e => e.tagName == 'ELEMENT')).to.equal(element);
    expect(dom.closestNode(child, e => e.tagName == 'ELEMENT'))
        .to.equal(element);
    expect(dom.closestByTag(child, 'element')).to.equal(element);

    expect(dom.closest(child, e => e.tagName == 'PARENT')).to.equal(parent);
    expect(dom.closestNode(child, e => e.tagName == 'PARENT')).to.equal(parent);
    expect(dom.closestByTag(child, 'parent')).to.equal(parent);
  });

  it('closestNode should find nodes as well as elements', () => {
    const fragment = document.createDocumentFragment();

    const element = document.createElement('div');
    fragment.appendChild(element);

    const text = document.createTextNode('abc');
    element.appendChild(text);

    expect(dom.closestNode(text, () => true)).to.equal(text);
    expect(dom.closestNode(text, n => n.nodeType == 1)).to.equal(element);
    expect(dom.closestNode(text, n => n.nodeType == 11)).to.equal(fragment);
  });

  it('closest should find first match', () => {
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
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT1'))
        .to.equal(element1);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT2'))
        .to.equal(element2);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT3'))
        .to.be.null;
  });

  it('childElements should find all matches', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(dom.childElements(parent, () => true).length).to.equal(2);
    expect(dom.childElements(parent, e => e.tagName == 'ELEMENT1').length)
        .to.equal(1);
    expect(dom.childElements(parent, e => e.tagName == 'ELEMENT2').length)
        .to.equal(1);
    expect(dom.childElements(parent, e => e.tagName == 'ELEMENT3').length)
        .to.be.equal(0);
  });

  it('childNodes should find all matches', () => {
    const parent = document.createElement('parent');
    parent.appendChild(document.createTextNode('text1'));
    parent.appendChild(document.createTextNode('text2'));
    parent.appendChild(document.createElement('element'));
    expect(dom.childNodes(parent, () => true).length).to.equal(3);
    expect(dom.childNodes(parent, node => node.textContent == 'text1').length)
        .to.equal(1);
    expect(dom.childNodes(parent, node => node.textContent == 'text2').length)
        .to.equal(1);
    expect(dom.childNodes(parent, node => node.textContent == 'text3').length)
        .to.equal(0);
    expect(dom.childNodes(parent, node => node.tagName == 'ELEMENT').length)
        .to.equal(1);
    expect(dom.childNodes(parent, node => node.tagName == 'ELEMENT2').length)
        .to.equal(0);
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
    dom.setScopeSelectorSupportedForTesting(false);
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

    expect(dom.childElementsByTag(parent, 'element1'))
        .to.deep.equal([element1]);
    expect(dom.childElementsByTag(parent, 'element23'))
        .to.deep.equal([element2, element3]);
    expect(dom.childElementsByTag(parent, 'element3'))
        .to.deep.equal([]);
  }

  it('childElementsByTag should find first match', testChildElementsByTag);

  it('childElementsByTag should find first match (polyfill)', () => {
    dom.setScopeSelectorSupportedForTesting(false);
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
    dom.setScopeSelectorSupportedForTesting(false);
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
    dom.setScopeSelectorSupportedForTesting(false);
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

  describe('contains', () => {
    let connectedElement;
    let connectedChild;
    let disconnectedElement;
    let disconnectedChild;

    beforeEach(() => {
      connectedElement = document.createElement('div');
      connectedChild = document.createElement('div');
      disconnectedElement = document.createElement('div');
      disconnectedChild = document.createElement('div');

      connectedElement.appendChild(connectedChild);
      disconnectedElement.appendChild(disconnectedChild);
      document.body.appendChild(connectedElement);
    });

    afterEach(() => {
      dom.removeElement(connectedElement);
    });

    it('should use document.contains or fallback as available', () => {
      expect(dom.documentContains(document, connectedElement)).to.be.true;
      expect(dom.documentContains(document, connectedChild)).to.be.true;
      expect(dom.documentContains(document, disconnectedElement)).to.be.false;
      expect(dom.documentContains(document, disconnectedChild)).to.be.false;
    });

    it('should polyfill document.contains', () => {
      expect(dom.documentContainsPolyfillInternal_(
          document, connectedElement)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, connectedChild)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, disconnectedElement)).to.be.false;
      expect(dom.documentContainsPolyfillInternal_(
          document, disconnectedChild)).to.be.false;
    });

    it('should be inclusionary for documentElement', () => {
      expect(dom.documentContains(
          document, document.documentElement)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, document.documentElement)).to.be.true;
    });

    it('should be inclusionary for document itself', () => {
      expect(dom.documentContains(
          document, document)).to.be.true;
      expect(dom.documentContainsPolyfillInternal_(
          document, document)).to.be.true;
    });
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
      const spy = sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy.callCount).to.equal(1);
    });

    it('should wait until child is available', () => {
      const spy = sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy.callCount).to.equal(0);

      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (spy.callCount > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
        parent.appendChild(child);
      }).then(() => {
        expect(spy.callCount).to.equal(1);
      });
    });

    it('should prefer MutationObserver and disconnect when done', () => {
      let mutationCallback;
      const mutationObserver = {
        observe: sandbox.spy(),
        disconnect: sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: {
            MutationObserver: callback => {
              mutationCallback = callback;
              return mutationObserver;
            },
          },
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy.callCount).to.equal(0);
      expect(mutationObserver.observe.callCount).to.equal(1);
      expect(mutationObserver.observe.firstCall.args[0]).to.equal(parent);
      expect(mutationObserver.observe.firstCall.args[1])
          .to.deep.equal({childList: true});
      expect(mutationCallback).to.exist;

      // False callback.
      mutationCallback();
      expect(spy.callCount).to.equal(0);
      expect(mutationObserver.disconnect.callCount).to.equal(0);

      // True callback.
      checkFuncValue = true;
      mutationCallback();
      expect(spy.callCount).to.equal(1);
      expect(mutationObserver.disconnect.callCount).to.equal(1);
    });

    it('should fallback to polling without MutationObserver', () => {
      let intervalCallback;
      const win = {
        setInterval: callback => {
          intervalCallback = callback;
          return 123;
        },
        clearInterval: sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: win,
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy.callCount).to.equal(0);
      expect(intervalCallback).to.exist;

      // False callback.
      intervalCallback();
      expect(spy.callCount).to.equal(0);
      expect(win.clearInterval.callCount).to.equal(0);

      // True callback.
      checkFuncValue = true;
      intervalCallback();
      expect(spy.callCount).to.equal(1);
      expect(win.clearInterval.callCount).to.equal(1);
    });

    it('should wait for body', () => {
      return dom.waitForBodyPromise(document).then(() => {
        expect(document.body).to.exist;
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
  });

  describe('openWindowDialog', () => {
    let windowApi;
    let windowMock;

    beforeEach(() => {
      windowApi = {
        open: () => {throw new Error('not mocked');},
      };
      windowMock = sandbox.mock(windowApi);
    });

    afterEach(() => {
      windowMock.verify();
    });

    it('should return on first success', () => {
      const dialog = {};
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .returns(dialog)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_blank', 'width=1');
      expect(res).to.equal(dialog);
    });

    it('should retry on first null', () => {
      const dialog = {};
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .returns(null)
          .once();
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top')
          .returns(dialog)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_blank', 'width=1');
      expect(res).to.equal(dialog);
    });

    it('should retry on first undefined', () => {
      const dialog = {};
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .returns(undefined)
          .once();
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top')
          .returns(dialog)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_blank', 'width=1');
      expect(res).to.equal(dialog);
    });

    it('should retry on first exception', () => {
      const dialog = {};
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .throws(new Error('intentional'))
          .once();
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top')
          .returns(dialog)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_blank', 'width=1');
      expect(res).to.equal(dialog);
    });

    it('should return the final result', () => {
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .returns(undefined)
          .once();
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top')
          .returns(null)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_blank', 'width=1');
      expect(res).to.be.null;
    });

    it('should return the final exception', () => {
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_blank', 'width=1')
          .throws(new Error('intentional1'))
          .once();
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top')
          .throws(new Error('intentional2'))
          .once();
      expect(() => {
        dom.openWindowDialog(windowApi, 'https://example.com/',
            '_blank', 'width=1');
      }).to.throw(/intentional2/);
    });

    it('should retry only non-top target', () => {
      windowMock.expects('open')
          .withExactArgs('https://example.com/', '_top', 'width=1')
          .returns(null)
          .once();
      const res = dom.openWindowDialog(windowApi, 'https://example.com/',
          '_top', 'width=1');
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
});
