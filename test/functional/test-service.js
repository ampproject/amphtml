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

import {
  fromClass,
  getExistingServiceForWindow,
  getExistingServiceForDoc,
  getParentWindowFrameElement,
  getService,
  getServicePromise,
  getServiceForDoc,
  getServicePromiseForDoc,
  resetServiceForTesting,
  setParentWindow,
} from '../../src/service';
import {loadPromise} from '../../src/event-helper';
import * as sinon from 'sinon';


describe('service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('window singletons', () => {

    let Class;
    let count;
    let factory;

    beforeEach(() => {
      count = 0;
      factory = sandbox.spy(() => {
        return ++count;
      });
      Class = class {
        constructor() {
          this.count = ++count;
        }
      };
      resetServiceForTesting(window, 'a');
      resetServiceForTesting(window, 'b');
      resetServiceForTesting(window, 'c');
      resetServiceForTesting(window, 'e1');
    });

    it('should make per window singletons', () => {
      const a1 = getService(window, 'a', factory);
      const a2 = getService(window, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory.callCount).to.equal(1);
      expect(factory.args[0][0]).to.equal(window);

      const b1 = getService(window, 'b', factory);
      const b2 = getService(window, 'b', factory);
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory.callCount).to.equal(2);
      expect(factory.args[1][0]).to.equal(window);
    });

    it('should make instances from class', () => {

      const a1 = fromClass(window, 'a', Class);
      const a2 = fromClass(window, 'a', Class);
      expect(a1).to.equal(a2);
      expect(a1.count).to.equal(1);

      const b1 = fromClass(window, 'b', Class);
      const b2 = fromClass(window, 'b', Class);
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
    });

    it('should work without a factory', () => {
      const c1 = getService(window, 'c', factory);
      const c2 = getService(window, 'c');
      expect(c1).to.equal(c2);
      expect(factory.callCount).to.equal(1);
    });

    it('should return the service when it exists', () => {
      const c1 = getService(window, 'c', factory);
      const c2 = getExistingServiceForWindow(window, 'c');
      expect(c1).to.equal(c2);
    });

    it('should throw before creation', () => {
      getService(window, 'another service to avoid NPE', () => {});
      expect(() => {
        getExistingServiceForWindow(window, 'c');
      }).to.throw();
    });

    it('should fail without factory on initial setup', () => {
      expect(() => {
        getService(window, 'not-present');
      }).to.throw(/not given and service missing not-present/);
    });

    it('should provide a promise that resolves when registered', () => {
      const p1 = getServicePromise(window, 'e1');
      const p2 = getServicePromise(window, 'e1');
      getService(window, 'e1', function() {
        return 'from e1';
      });
      return p1.then(s1 => {
        expect(s1).to.equal('from e1');
        return p2.then(s2 => {
          expect(s2).to.equal(s1);
          expect(factory.callCount).to.equal(0);
        });
      });
    });

    it('should resolve service for a child window', () => {
      const c = getService(window, 'c', factory);

      // A child.
      const child = {};
      setParentWindow(child, window);
      expect(getService(child, 'c', factory)).to.equal(c);
      expect(getExistingServiceForWindow(child, 'c')).to.equal(c);

      // A grandchild.
      const grandchild = {};
      setParentWindow(grandchild, child);
      expect(getService(grandchild, 'c', factory)).to.equal(c);
      expect(getExistingServiceForWindow(grandchild, 'c')).to.equal(c);
    });
  });

  describe('ampdoc singletons', () => {

    let windowApi;
    let ampdoc;
    let ampdocMock;
    let node;
    let count;
    let factory;

    beforeEach(() => {
      count = 0;
      factory = sandbox.spy(() => {
        return ++count;
      });
      windowApi = {};
      ampdoc = {
        isSingleDoc: () => false,
        win: windowApi,
      };
      ampdocMock = sandbox.mock(ampdoc);
      const ampdocServiceApi = {getAmpDoc: () => ampdoc};

      getService(windowApi, 'ampdoc', () => ampdocServiceApi);
      node = {nodeType: 1, ownerDocument: {defaultView: windowApi}};
      resetServiceForTesting(windowApi, 'a');
      resetServiceForTesting(windowApi, 'b');
      resetServiceForTesting(windowApi, 'c');
      resetServiceForTesting(windowApi, 'e1');
    });

    it('should make per ampdoc singletons and store them in window', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);

      const a1 = getServiceForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory.callCount).to.equal(1);
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;

      const b1 = getServiceForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b', factory);
      const b3 = getExistingServiceForDoc(node, 'b');
      expect(b1).to.equal(b2);
      expect(b1).to.equal(b3);
      expect(b1).to.not.equal(a1);
      expect(factory.callCount).to.equal(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.services['b']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons via ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);

      const a1 = getServiceForDoc(ampdoc, 'a', factory);
      const a2 = getServiceForDoc(ampdoc, 'a', factory);
      const a3 = getExistingServiceForDoc(ampdoc, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(a3);
      expect(a1).to.equal(1);
      expect(factory.callCount).to.equal(1);
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons and store them in ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(false).atLeast(1);

      const a1 = getServiceForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory.callCount).to.equal(1);
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.not.exist;
      expect(ampdoc.services['a']).to.exist;

      const b1 = getServiceForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b', factory);
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory.callCount).to.equal(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.services['b']).to.not.exist;
      expect(ampdoc.services['b']).to.exist;
    });

    it('should work without a factory', () => {
      const c1 = getServiceForDoc(node, 'c', factory);
      const c2 = getServiceForDoc(node, 'c');
      expect(c1).to.equal(c2);
      expect(factory.callCount).to.equal(1);
    });

    it('should fail without factory on initial setup', () => {
      expect(() => {
        getServiceForDoc(node, 'not-present');
      }).to.throw(/not given and service missing not-present/);
    });

    it('should provide a promise that resolves when registered', () => {
      const p1 = getServicePromiseForDoc(node, 'e1');
      const p2 = getServicePromiseForDoc(node, 'e1');
      getServiceForDoc(node, 'e1', function() {
        return 'from e1';
      });
      return p1.then(s1 => {
        expect(s1).to.equal('from e1');
        return p2.then(s2 => {
          expect(s2).to.equal(s1);
          expect(factory.callCount).to.equal(0);
        });
      });
    });

    it('should resolve service for a child window', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);
      const c = getServiceForDoc(node, 'c', factory);

      // A child.
      const childWin = {};
      const childWinNode =
          {nodeType: 1, ownerDocument: {defaultView: childWin}};
      setParentWindow(childWin, windowApi);
      expect(getServiceForDoc(childWinNode, 'c', factory)).to.equal(c);
      expect(getExistingServiceForDoc(childWinNode, 'c')).to.equal(c);

      // A grandchild.
      const grandchildWin = {};
      const grandChildWinNode =
          {nodeType: 1, ownerDocument: {defaultView: grandchildWin}};
      setParentWindow(grandchildWin, childWin);
      expect(getServiceForDoc(grandChildWinNode, 'c', factory)).to.equal(c);
      expect(getExistingServiceForDoc(grandChildWinNode, 'c')).to.equal(c);
    });
  });


  describe('getParentWindowFrameElement', () => {
    let iframe;

    beforeEach(() => {
      iframe = document.createElement('iframe');
      const promise = loadPromise(iframe);
      const html = '<div id="one"></div>';
      if ('srcdoc' in iframe) {
        iframe.srcdoc = html;
        document.body.appendChild(iframe);
      } else {
        iframe.src = 'about:blank';
        document.body.appendChild(iframe);
        const childDoc = iframe.contentWindow.document;
        childDoc.open();
        childDoc.write(html);
        childDoc.close();
      }
      return promise.then(() => {
        setParentWindow(iframe.contentWindow, window);
      });
    });

    afterEach(() => {
      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
    });

    it('should return frameElement', () => {
      const div = iframe.contentWindow.document.getElementById('one');
      expect(getParentWindowFrameElement(div, window)).to.equal(iframe);
    });

    it('should return null when not parented', () => {
      iframe.contentWindow.__AMP_TOP = null;
      const div = iframe.contentWindow.document.getElementById('one');
      expect(getParentWindowFrameElement(div, window)).to.equal(null);
    });

    it('should survive exceptions', () => {
      const childWin = {};
      Object.defineProperties(childWin, {
        frameElement: {
          get: () => {throw new Error('intentional');},
        },
      });
      setParentWindow(childWin, window);
      const el = {ownerDocument: {defaultView: childWin}};
      expect(getParentWindowFrameElement(el, window)).to.equal(null);
    });
  });
});
