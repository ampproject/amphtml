/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {BaseElement} from '../../src/base-element';
import {ElementStub} from '../../src/element-stub';
import {
  copyElementToChildWindow,
  getElementClassForTesting,
  registerElement,
  resetScheduledElementForTesting,
  stubElementIfNotKnown,
  stubElementsForDoc,
  upgradeOrRegisterElement,
} from '../../src/service/custom-element-registry';
import {createElementWithAttributes} from '../../src/dom';

describes.realWin('CustomElement register', {amp: true}, (env) => {
  class ConcreteElement extends BaseElement {}

  let win, doc, ampdoc, extensions;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    extensions = env.extensions;
    ampdoc.declareExtension('amp-element1');
  });

  function insertElement(name) {
    const testElement = createElementWithAttributes(doc, name, {
      width: '300',
      height: '250',
      type: '_ping_',
      'data-aax_size': '300*250',
      'data-aax_pubname': 'abc123',
      'data-aax_src': '302',
    });
    doc.body.appendChild(testElement);
  }

  it('should go through stub/upgrade cycle', () => {
    registerElement(win, 'amp-element1', ElementStub);
    expect(getElementClassForTesting(win, 'amp-element1')).to.equal(
      ElementStub
    );

    // Pre-download elements are created as ElementStub.
    const element1 = doc.createElement('amp-element1');
    element1.setAttribute('layout', 'nodisplay');
    doc.body.appendChild(element1);
    expect(element1.implementation_).to.be.instanceOf(ElementStub);

    // Post-download, elements are upgraded.
    upgradeOrRegisterElement(win, 'amp-element1', ConcreteElement);
    expect(getElementClassForTesting(win, 'amp-element1')).to.equal(
      ConcreteElement
    );
    expect(element1.implementation_).to.be.instanceOf(ConcreteElement);

    // Elements created post-download and immediately upgraded.
    const element2 = doc.createElement('amp-element1');
    doc.body.appendChild(element1);
    expect(element2.implementation_).to.be.instanceOf(ConcreteElement);
  });

  it('should mark stubbed element as declared', () => {
    expect(ampdoc.declaresExtension('amp-element2')).to.be.false;

    const head = document.createElement('fake-head');
    const script = document.createElement('script');
    script.setAttribute('custom-element', 'amp-element2');
    head.appendChild(script);
    env.sandbox.stub(ampdoc, 'getHeadNode').callsFake(() => head);

    stubElementsForDoc(ampdoc);
    expect(ampdoc.declaresExtension('amp-element2')).to.be.true;
    expect(win.__AMP_EXTENDED_ELEMENTS['amp-element2']).to.equal(ElementStub);
  });

  it('should install pre-stubbed element extension', () => {
    const stub = env.sandbox.stub(extensions, 'installExtensionForDoc');

    stubElementIfNotKnown(win, 'amp-element2');
    expect(win.__AMP_EXTENDED_ELEMENTS['amp-element2']).to.equal(ElementStub);
    expect(ampdoc.declaresExtension('amp-element2')).to.be.false;
    expect(stub).to.not.be.called;

    const element = doc.createElement('amp-element2');
    doc.body.appendChild(element);
    expect(stub).to.be.calledOnce;
    expect(stub).to.be.calledWithExactly(ampdoc, 'amp-element2');
  });

  it('should not install declared pre-stubbed element extension', () => {
    ampdoc.declareExtension('amp-element2');
    const stub = env.sandbox.stub(extensions, 'installExtensionForDoc');

    stubElementIfNotKnown(win, 'amp-element2');
    expect(win.__AMP_EXTENDED_ELEMENTS['amp-element2']).to.equal(ElementStub);
    expect(ampdoc.declaresExtension('amp-element2')).to.be.true;
    expect(stub).to.not.be.called;

    const element = doc.createElement('amp-element2');
    element.setAttribute('layout', 'nodisplay');
    doc.body.appendChild(element);
    expect(stub).to.not.be.called;
  });

  it('should not install declared pre-installed element', () => {
    const stub = env.sandbox.stub(extensions, 'installExtensionForDoc');

    registerElement(win, 'amp-element1', ConcreteElement);
    expect(win.__AMP_EXTENDED_ELEMENTS['amp-element1']).to.equal(
      ConcreteElement
    );
    expect(ampdoc.declaresExtension('amp-element1')).to.be.true;
    expect(stub).to.not.be.called;

    const element = doc.createElement('amp-element1');
    element.setAttribute('layout', 'nodisplay');
    doc.body.appendChild(element);
    expect(stub).to.not.be.called;
  });

  it('insert script for amp-ad when script is not included', () => {
    insertElement('amp-ad');
    expect(
      doc.head.querySelectorAll('[custom-element="amp-ad"]')
    ).to.have.length(1);
  });

  it('insert script for amp-embed when script is not included', () => {
    insertElement('amp-embed');
    expect(
      doc.head.querySelectorAll('[custom-element="amp-embed"]')
    ).to.have.length(0);
    expect(
      doc.head.querySelectorAll('[custom-element="amp-ad"]')
    ).to.have.length(1);
  });

  it('insert script for amp-video when script is not included', () => {
    insertElement('amp-video');
    expect(
      doc.head.querySelectorAll('[custom-element="amp-video"]')
    ).to.have.length(1);
  });

  describe('no body', () => {
    let elements;
    let doc;
    let win;
    let elem1;
    let ampdoc;

    beforeEach(() => {
      elements = [];

      doc = {
        documentElement: {
          ownerDocument: doc,
        },
        head: {
          nodeType: /* ELEMENT */ 1,
          querySelectorAll: (selector) => {
            if (selector == 'script[custom-element],script[custom-template]') {
              return elements;
            }
            return [];
          },
        },
        body: {},
      };

      elem1 = {
        getAttribute: (name) => {
          if (name == 'custom-element') {
            return 'amp-test1';
          }
        },
        ownerDocument: doc,
      };
      elements.push(elem1);

      win = {
        document: doc,
        customElements: {
          define: env.sandbox.spy(),
        },
        Object: {
          create: (proto) => Object.create(proto),
        },
        HTMLElement,
        __AMP_EXTENDED_ELEMENTS: {},
      };
      doc.defaultView = win;

      ampdoc = new AmpDocSingle(win);
    });

    afterEach(() => {
      resetScheduledElementForTesting(win, 'amp-test1');
      resetScheduledElementForTesting(win, 'amp-test2');
    });

    it('should be stub elements when body available', () => {
      stubElementsForDoc(ampdoc);

      expect(win.__AMP_EXTENDED_ELEMENTS).to.exist;
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(ElementStub);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test2']).to.be.undefined;
      expect(win.customElements.define).to.be.calledOnce;
      expect(win.customElements.define.firstCall.args[0]).to.equal('amp-test1');
    });

    it('should repeat stubbing when body is not available', () => {
      doc.body = null; // Body not available

      stubElementsForDoc(ampdoc);

      expect(win.__AMP_EXTENDED_ELEMENTS).to.exist;
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(ElementStub);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test2']).to.be.undefined;
      expect(win.customElements.define).to.be.calledOnce;
      expect(win.customElements.define.firstCall.args[0]).to.equal('amp-test1');

      // Add more elements
      const elem2 = {
        getAttribute: (name) => {
          if (name == 'custom-element') {
            return 'amp-test2';
          }
        },
        ownerDocument: doc,
      };
      elements.push(elem2);

      // Body available. Stub again.
      doc.body = {};
      stubElementsForDoc(ampdoc);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(ElementStub);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test2']).to.equal(ElementStub);
      expect(win.customElements.define).to.have.callCount(2);
      expect(win.customElements.define.getCall(1).args[0]).to.equal(
        'amp-test2'
      );
    });

    it('should stub element when not stubbed yet', () => {
      // First stub is allowed.
      stubElementIfNotKnown(win, 'amp-test1');

      expect(win.__AMP_EXTENDED_ELEMENTS).to.exist;
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(ElementStub);
      expect(win.customElements.define).to.be.calledOnce;
      expect(win.customElements.define.firstCall.args[0]).to.equal('amp-test1');

      // Second stub is ignored.
      stubElementIfNotKnown(win, 'amp-test1');
      expect(win.customElements.define).to.be.calledOnce;
    });

    it('should copy or stub element definitions in a child window', () => {
      stubElementIfNotKnown(win, 'amp-test1');

      const define = env.sandbox.spy();
      const childWin = {
        Object,
        HTMLElement,
        customElements: {define},
      };

      copyElementToChildWindow(win, childWin, 'amp-test1');
      expect(childWin.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(
        ElementStub
      );
      const firstCallCount = define.callCount;
      expect(firstCallCount).to.equal(1);
      expect(define.getCall(firstCallCount - 1).args[0]).to.equal('amp-test1');

      copyElementToChildWindow(win, childWin, 'amp-test2');
      expect(childWin.__AMP_EXTENDED_ELEMENTS['amp-test1']).to.equal(
        ElementStub
      );
      expect(define.callCount).to.be.above(firstCallCount);
      expect(define.getCall(define.callCount - 1).args[0]).to.equal(
        'amp-test2'
      );
    });
  });
});
