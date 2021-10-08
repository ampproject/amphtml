import {createElementWithAttributes} from '#core/dom';
import {setScopeSelectorSupportedForTesting} from '#core/dom/css-selectors';
import * as query from '#core/dom/query';
import {isElement} from '#core/types';
import {toArray} from '#core/types/array';

import {loadPromise} from '#utils/event-helper';

/** Helper to execute test cases with and without the polyfills. */
function itWithPolyfill(description, testFn) {
  it(description, testFn);
  it(`${description} (polyfill)`, () => {
    setScopeSelectorSupportedForTesting(false);
    testFn();
  });
}

describes.sandboxed('DOM - query helpers', {}, (env) => {
  afterEach(() => {
    setScopeSelectorSupportedForTesting(undefined);
  });

  itWithPolyfill('scopedQuerySelector should find first match', () => {
    const grandparent = document.createElement('div');

    const parent = document.createElement('div');
    grandparent.appendChild(parent);

    const element1 = document.createElement('div');
    parent.appendChild(element1);

    expect(query.scopedQuerySelector(parent, 'div')).to.equal(element1);
    expect(query.scopedQuerySelector(grandparent, 'div div')).to.equal(
      element1
    );
  });

  itWithPolyfill('scopedQuerySelectorAll should find all matches', () => {
    const grandparent = document.createElement('div');

    const parent = document.createElement('div');
    grandparent.appendChild(parent);

    const element1 = document.createElement('div');
    parent.appendChild(element1);

    const element2 = document.createElement('div');
    parent.appendChild(element2);

    expect(toArray(query.scopedQuerySelectorAll(parent, 'div'))).to.deep.equal([
      element1,
      element2,
    ]);
    expect(
      toArray(query.scopedQuerySelectorAll(grandparent, 'div div'))
    ).to.deep.equal([element1, element2]);
  });

  describe('realChildElements and realChildNodes', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
    });

    it('realChildElements should return nothing', () => {
      expect(query.realChildNodes(element).length).to.equal(0);
      expect(query.realChildElements(element).length).to.equal(0);
    });

    it('realChildElements should return content-only nodes', () => {
      const createWithAttr = (attr) =>
        createElementWithAttributes(document, 'div', {[attr]: ''});

      element.appendChild(document.createElement('i-amp-service'));
      element.appendChild(createWithAttr('placeholder'));
      element.appendChild(createWithAttr('fallback'));
      element.appendChild(createWithAttr('overflow'));
      element.appendChild(document.createTextNode('abc'));
      element.appendChild(document.createElement('content'));

      const nodes = query.realChildNodes(element);
      expect(nodes.length).to.equal(2);
      expect(nodes[0].textContent).to.equal('abc');
      expect(nodes[1].tagName.toLowerCase()).to.equal('content');

      const elements = query.realChildElements(element);
      expect(elements.length).to.equal(1);
      expect(elements[0].tagName.toLowerCase()).to.equal('content');
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
      expect(query.matches(ampEl, '#ampEl')).to.be.true;
      [div, img1, iframe].map((el) => {
        expect(query.matches(el, '#ampEl')).to.be.false;
      });
    });

    it('finds element by tagname', () => {
      expect(query.matches(div, 'div')).to.be.true;
      [ampEl, img1, iframe].map((el) => {
        expect(query.matches(el, 'div')).to.be.false;
      });
    });
  });

  describe('closest', () => {
    it('should find itself', () => {
      const element = document.createElement('div');

      const child = document.createElement('div');
      element.appendChild(child);

      expect(query.closest(child, () => true)).to.equal(child);
      expect(query.closestNode(child, () => true)).to.equal(child);
      expect(query.closestAncestorElementBySelector(child, 'div')).to.equal(
        child
      );
      expect(query.closestAncestorElementBySelector(child, 'DIV')).to.equal(
        child
      );
    });

    it('should stop search at opt_stopAt', () => {
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
      expect(query.closest(grandchild, cb)).to.equal(element);
      expect(cbSpy).to.be.calledThrice;

      expect(query.closest(grandchild, cb, child)).to.be.null;
      expect(cbSpy).to.have.callCount(4);
    });

    it('should find first match', () => {
      const parent = document.createElement('parent');

      const element = document.createElement('element');
      parent.appendChild(element);

      const child = document.createElement('child');
      element.appendChild(child);

      expect(query.closest(child, (e) => e.tagName == 'CHILD')).to.equal(child);
      expect(query.closestNode(child, (e) => e.tagName == 'CHILD')).to.equal(
        child
      );
      expect(query.closestAncestorElementBySelector(child, 'child')).to.equal(
        child
      );

      expect(query.closest(child, (e) => e.tagName == 'ELEMENT')).to.equal(
        element
      );
      expect(query.closestNode(child, (e) => e.tagName == 'ELEMENT')).to.equal(
        element
      );
      expect(query.closestAncestorElementBySelector(child, 'element')).to.equal(
        element
      );

      expect(query.closest(child, (e) => e.tagName == 'PARENT')).to.equal(
        parent
      );
      expect(query.closestNode(child, (e) => e.tagName == 'PARENT')).to.equal(
        parent
      );
      expect(query.closestAncestorElementBySelector(child, 'parent')).to.equal(
        parent
      );
    });
  });

  it('closestNode should find nodes as well as elements', () => {
    const fragment = document.createDocumentFragment();

    const element = document.createElement('div');
    fragment.appendChild(element);

    const text = document.createTextNode('abc');
    element.appendChild(text);

    expect(query.closestNode(text, () => true)).to.equal(text);
    expect(query.closestNode(text, isElement)).to.equal(element);
    expect(query.closestNode(text, (n) => n.nodeType == 11)).to.equal(fragment);
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

    expect(query.closestAncestorElementBySelector(child, 'child')).to.equal(
      child
    );
    expect(query.closestAncestorElementBySelector(child, '.child')).to.equal(
      child
    );
    expect(query.closestAncestorElementBySelector(child, '#child')).to.equal(
      child
    );

    expect(query.closestAncestorElementBySelector(child, 'element')).to.equal(
      element
    );
    expect(query.closestAncestorElementBySelector(child, '.element')).to.equal(
      element
    );
    expect(query.closestAncestorElementBySelector(child, '#element')).to.equal(
      element
    );

    expect(query.closestAncestorElementBySelector(child, 'parent')).to.equal(
      parent
    );
    expect(query.closestAncestorElementBySelector(child, '.parent')).to.equal(
      parent
    );
    expect(query.closestAncestorElementBySelector(child, '#parent')).to.equal(
      parent
    );
  });

  it('elementByTag should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element');
    parent.appendChild(element1);

    const element2 = document.createElement('element');
    parent.appendChild(element2);

    expect(query.elementByTag(parent, 'element')).to.equal(element1);
    expect(query.elementByTag(parent, 'ELEMENT')).to.equal(element1);
  });

  it('childElement should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(query.childElement(parent, () => true)).to.equal(element1);
    expect(query.childElement(parent, (e) => e.tagName == 'ELEMENT1')).to.equal(
      element1
    );
    expect(query.childElement(parent, (e) => e.tagName == 'ELEMENT2')).to.equal(
      element2
    );
    expect(query.childElement(parent, (e) => e.tagName == 'ELEMENT3')).to.be
      .null;
  });

  it('childElements should find all matches', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(query.childElements(parent, () => true).length).to.equal(2);
    expect(
      query.childElements(parent, (e) => e.tagName == 'ELEMENT1').length
    ).to.equal(1);
    expect(
      query.childElements(parent, (e) => e.tagName == 'ELEMENT2').length
    ).to.equal(1);
    expect(
      query.childElements(parent, (e) => e.tagName == 'ELEMENT3').length
    ).to.be.equal(0);
  });

  it('childNodes should find all matches', () => {
    const parent = document.createElement('parent');
    parent.appendChild(document.createTextNode('text1'));
    parent.appendChild(document.createTextNode('text2'));
    parent.appendChild(document.createElement('element'));
    expect(query.childNodes(parent, () => true).length).to.equal(3);
    expect(
      query.childNodes(parent, (node) => node.textContent == 'text1').length
    ).to.equal(1);
    expect(
      query.childNodes(parent, (node) => node.textContent == 'text2').length
    ).to.equal(1);
    expect(
      query.childNodes(parent, (node) => node.textContent == 'text3').length
    ).to.equal(0);
    expect(
      query.childNodes(parent, (node) => node.tagName == 'ELEMENT').length
    ).to.equal(1);
    expect(
      query.childNodes(parent, (node) => node.tagName == 'ELEMENT2').length
    ).to.equal(0);
  });

  itWithPolyfill('childElementByTag should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    const element3 = document.createElement('element3');
    element1.appendChild(element3);

    expect(query.childElementByTag(parent, 'element1')).to.equal(element1);
    expect(query.childElementByTag(parent, 'element2')).to.equal(element2);
    expect(query.childElementByTag(parent, 'element3')).to.be.null;
    expect(query.childElementByTag(parent, 'element4')).to.be.null;
  });

  itWithPolyfill('childElementsByTag should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element23');
    parent.appendChild(element2);

    const element3 = document.createElement('element23');
    parent.appendChild(element3);

    expect(toArray(query.childElementsByTag(parent, 'element1'))).to.deep.equal(
      [element1]
    );
    expect(
      toArray(query.childElementsByTag(parent, 'element23'))
    ).to.deep.equal([element2, element3]);
    expect(toArray(query.childElementsByTag(parent, 'element3'))).to.deep.equal(
      []
    );
  });

  itWithPolyfill('childElementByAttr should find first match', () => {
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

    expect(query.childElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(query.childElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(query.childElementByAttr(parent, 'attr12')).to.equal(element1);
    expect(query.childElementByAttr(parent, 'attr3')).to.be.null;
    expect(query.childElementByAttr(parent, 'on-child')).to.be.null;
  });

  itWithPolyfill('childElementsByAttr should find all matches', () => {
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

    expect(query.childElementsByAttr(parent, 'attr1').length).to.equal(1);
    expect(query.childElementsByAttr(parent, 'attr2').length).to.equal(1);
    expect(query.childElementsByAttr(parent, 'attr12').length).to.equal(2);
    expect(query.childElementsByAttr(parent, 'attr3').length).to.be.equal(0);
    expect(query.childElementsByAttr(parent, 'on-child').length).to.be.equal(0);
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

    expect(query.lastChildElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(query.lastChildElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(query.lastChildElementByAttr(parent, 'attr12')).to.equal(element2);
    expect(query.lastChildElementByAttr(parent, 'attr3')).to.be.null;
    expect(query.lastChildElementByAttr(parent, 'on-child')).to.be.null;
  });

  it('ancestorElements should find all matches', () => {
    const parent = document.createElement('parent');
    const element1 = document.createElement('element1');
    parent.appendChild(element1);
    const element2 = document.createElement('element2');
    element1.appendChild(element2);
    expect(query.ancestorElements(element2, () => true).length).to.equal(2);
    expect(
      query.ancestorElements(element2, (e) => e.tagName == 'ELEMENT1').length
    ).to.equal(1);
    expect(
      query.ancestorElements(element1, (e) => e.tagName == 'PARENT').length
    ).to.equal(1);
    expect(
      query.ancestorElements(parent, (e) => e.tagName == 'ELEMENT3').length
    ).to.be.equal(0);
  });

  it('ancestorElementsByTag should find all matches', () => {
    const parent = document.createElement('parent');
    const element1 = document.createElement('element1');
    parent.appendChild(element1);
    const element2 = document.createElement('element2');
    element1.appendChild(element2);
    expect(query.ancestorElementsByTag(element2, 'ELEMENT1').length).to.equal(
      1
    );
    expect(query.ancestorElementsByTag(element1, 'PARENT').length).to.equal(1);
    expect(
      query.ancestorElementsByTag(element2, 'ELEMENT3').length
    ).to.be.equal(0);
  });
});
