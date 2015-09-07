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

import {BaseElement} from '../../src/base-element';

describe('BaseElement', () => {

  let div;
  let element;

  beforeEach(() => {
    div = document.createElement('div');
    element = new BaseElement(div);
  });

  it('getPlaceholder - niente', () => {
    expect(element.getPlaceholder()).to.equal(null);
  });

  it('getPlaceholder', () => {
    let placeholder = document.createElement('div');
    placeholder.setAttribute('placeholder', '');
    div.appendChild(placeholder);
    expect(element.getPlaceholder()).to.equal(placeholder);
  });

  it('getRealChildren - niente', () => {
    expect(element.getRealChildNodes().length).to.equal(0);
    expect(element.getRealChildren().length).to.equal(0);
  });

  it('getRealChildren', () => {
    div.appendChild(document.createElement('i-amp-service'));
    div.appendChild(document.createTextNode('abc'));
    div.appendChild(document.createElement('content'));

    let nodes = element.getRealChildNodes();
    expect(nodes.length).to.equal(2);
    expect(nodes[0].textContent).to.equal('abc');
    expect(nodes[1].tagName.toLowerCase()).to.equal('content');

    let elements = element.getRealChildren();
    expect(elements.length).to.equal(1);
    expect(elements[0].tagName.toLowerCase()).to.equal('content');
  });

  it('propagateAttributes - niente', () => {
    let target = document.createElement('div');
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test1'], target);
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test2', 'data-test3'], target);
    expect(target.hasAttributes()).to.be.false;
  });

  it('propagateAttributes', () => {
    let target = document.createElement('div');
    expect(target.hasAttributes()).to.be.false;

    div.setAttribute('data-test1', 'abc');
    div.setAttribute('data-test2', 'xyz');
    div.setAttribute('data-test3', '123');

    element.propagateAttributes(['data-test1'], target);
    expect(target.hasAttributes()).to.be.true;

    expect(target.getAttribute('data-test1')).to.equal('abc');
    expect(target.getAttribute('data-test2')).to.be.null;
    expect(target.getAttribute('data-test3')).to.be.null;

    element.propagateAttributes(['data-test2', 'data-test3'], target);
    expect(target.getAttribute('data-test2')).to.equal('xyz');
    expect(target.getAttribute('data-test3')).to.equal('123');
  });
});
