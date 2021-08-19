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

describes.sandboxed('DOM - propagate attributes', {}, () => {
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
