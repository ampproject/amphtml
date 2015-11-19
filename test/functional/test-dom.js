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


describe('DOM', () => {

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
    expect(dom.closestByTag(child, 'child')).to.equal(child);

    expect(dom.closest(child, e => e.tagName == 'ELEMENT')).to.equal(element);
    expect(dom.closestByTag(child, 'element')).to.equal(element);

    expect(dom.closest(child, e => e.tagName == 'PARENT')).to.equal(parent);
    expect(dom.closestByTag(child, 'parent')).to.equal(parent);
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

    expect(dom.childElement(parent, e => true)).to.equal(element1);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT1'))
        .to.equal(element1);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT2'))
        .to.equal(element2);
    expect(dom.childElement(parent, e => e.tagName == 'ELEMENT3'))
        .to.be.null;
  });

  it('childElementByTag should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    parent.appendChild(element2);

    expect(dom.childElementByTag(parent, 'element1')).to.equal(element1);
    expect(dom.childElementByTag(parent, 'element2')).to.equal(element2);
    expect(dom.childElementByTag(parent, 'element3')).to.be.null;
  });

  it('childElementByAttr should find first match', () => {
    const parent = document.createElement('parent');

    const element1 = document.createElement('element1');
    element1.setAttribute('attr1', '1');
    element1.setAttribute('attr12', '1');
    parent.appendChild(element1);

    const element2 = document.createElement('element2');
    element2.setAttribute('attr2', '2');
    element2.setAttribute('attr12', '2');
    parent.appendChild(element2);

    expect(dom.childElementByAttr(parent, 'attr1')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr2')).to.equal(element2);
    expect(dom.childElementByAttr(parent, 'attr12')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr12', '1')).to.equal(element1);
    expect(dom.childElementByAttr(parent, 'attr12', '2')).to.equal(element2);
    expect(dom.childElementByAttr(parent, 'attr12', '3')).to.be.null;
    expect(dom.childElementByAttr(parent, 'attr3')).to.be.null;
  });
});
