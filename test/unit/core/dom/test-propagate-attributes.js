/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {propagateAttributes} from '#core/dom/propagate-attributes';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  getAttribute(key) {
    return this.attributes.get(key) || null;
  }

  hasAttributes() {
    return this.attributes.size !== 0;
  }
}

describes.sandboxed('Propagate Attributes', {}, () => {
  let sourceElement;

  beforeEach(() => {
    sourceElement = new FakeElement('img');
  });

  it('will not propagate undefined attributes', () => {
    const target = new FakeElement('div');
    expect(target.hasAttributes()).to.be.false;

    propagateAttributes(['data-test1'], sourceElement, target);
    expect(target.hasAttributes()).to.be.false;

    propagateAttributes(['data-test2', 'data-test3'], sourceElement, target);
    expect(target.hasAttributes()).to.be.false;
  });

  it('propagates defined attributes', () => {
    const target = new FakeElement('div');
    expect(target.hasAttributes()).to.be.false;

    sourceElement.setAttribute('data-test1', 'abc');
    sourceElement.setAttribute('data-test2', 'xyz');
    sourceElement.setAttribute('data-test3', '123');

    propagateAttributes('data-test1', sourceElement, target);
    expect(target.hasAttributes()).to.be.true;

    expect(target.getAttribute('data-test1')).to.equal('abc');
    expect(target.getAttribute('data-test2')).to.be.null;
    expect(target.getAttribute('data-test3')).to.be.null;

    propagateAttributes(['data-test2', 'data-test3'], sourceElement, target);
    expect(target.getAttribute('data-test2')).to.equal('xyz');
    expect(target.getAttribute('data-test3')).to.equal('123');
  });
});
