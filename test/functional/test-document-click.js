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

import {onDocumentElementClick_} from '../../src/document-click';
import {platform} from '../../src/platform';
import * as sinon from 'sinon';

describe('test-document-click onDocumentElementClick_', () => {
  let sandbox;
  let evt;
  let doc;
  let win;
  let history;
  let tgt;
  let elem;
  let docElem;
  let getElementByIdSpy;
  let preventDefaultSpy;
  let scrollIntoViewSpy;
  let querySelectorSpy;
  let replaceLocSpy;
  let viewport;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    preventDefaultSpy = sandbox.spy();
    scrollIntoViewSpy = sandbox.spy();
    replaceLocSpy = sandbox.spy();
    elem = {};
    getElementByIdSpy = sandbox.stub();
    querySelectorSpy = sandbox.stub();
    tgt = document.createElement('a');
    tgt.href = 'https://www.google.com';
    doc = {
      getElementById: getElementByIdSpy,
      querySelector: querySelectorSpy,
      defaultView: {
        location: {
          href: 'https://www.google.com/some-path?hello=world#link',
          replace: replaceLocSpy,
        },
      },
    };
    win = doc.defaultView;
    docElem = {
      ownerDocument: doc,
    };
    evt = {
      currentTarget: docElem,
      target: tgt,
      preventDefault: preventDefaultSpy,
    };
    viewport = {
      scrollIntoView: scrollIntoViewSpy,
    };
    history = {
      push: () => {},
    };
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  describe('when linking to a different origin or path', () => {

    beforeEach(() => {
      win.location.href = 'https://www.google.com/some-path?hello=world#link';
    });

    it('should not do anything on path change', () => {
      tgt.href = 'https://www.google.com/some-other-path';
      onDocumentElementClick_(evt, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything on origin change', () => {
      tgt.href = 'https://maps.google.com/some-path#link';
      onDocumentElementClick_(evt, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything when there is no hash', () => {
      tgt.href = 'https://www.google.com/some-path';
      onDocumentElementClick_(evt, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything on a query change', () => {
      tgt.href = 'https://www.google.com/some-path?hello=foo#link';
      onDocumentElementClick_(evt, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });
  });

  describe('when linking to identifier', () => {

    beforeEach(() => {
      win.location.href = 'https://www.google.com/some-path?hello=world';
      tgt.href = 'https://www.google.com/some-path?hello=world#test';
    });

    it('should call getElementById on document', () => {
      getElementByIdSpy.returns(elem);
      expect(getElementByIdSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(querySelectorSpy.callCount).to.equal(0);
    });

    it('should always call preventDefault', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(null);
      expect(preventDefaultSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, viewport, history);
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything if no anchor is found', () => {
      evt.target = document.createElement('span');
      onDocumentElementClick_(evt, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
    });

    it('should call querySelector on document if element with id is not ' +
       'found', () => {
      getElementByIdSpy.returns(null);
      expect(getElementByIdSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(querySelectorSpy.callCount).to.equal(1);
    });

    it('should not call scrollIntoView if element with id is not found or ' +
       'anchor with name is not found, but should still update URL', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(null);
      expect(getElementByIdSpy.callCount).to.equal(0);

      onDocumentElementClick_(evt, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should call scrollIntoView if element with id is found', () => {
      getElementByIdSpy.returns(elem);

      expect(replaceLocSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(1);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should call scrollIntoView if element with name is found', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);

      expect(replaceLocSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(1);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should call location.replace before scrollIntoView', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);

      const ops = [];
      win.location.replace = () => {
        ops.push('location.replace');
      };
      viewport.scrollIntoView = () => {
        ops.push('scrollIntoView');
      };
      onDocumentElementClick_(evt, viewport, history);

      expect(ops).to.have.length(2);
      expect(ops[0]).to.equal('location.replace');
      expect(ops[1]).to.equal('scrollIntoView');
    });

    it('should push and pop history state', () => {
      let historyOnPop;
      const historyPushStub = sandbox.stub(history, 'push', onPop => {
        historyOnPop = onPop;
      });

      // Click -> push.
      onDocumentElementClick_(evt, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
      expect(historyPushStub.callCount).to.equal(1);
      expect(historyOnPop).to.exist;

      // Pop.
      historyOnPop();
      expect(replaceLocSpy.callCount).to.equal(2);
      expect(replaceLocSpy.args[1][0]).to.equal('#');
    });

    it('should push and pop history state with pre-existing hash', () => {
      win.location.href = 'https://www.google.com/some-path?hello=world#first';
      let historyOnPop;
      const historyPushStub = sandbox.stub(history, 'push', onPop => {
        historyOnPop = onPop;
      });

      // Click -> push.
      onDocumentElementClick_(evt, viewport, history);
      expect(historyPushStub.callCount).to.equal(1);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');

      // Pop.
      historyOnPop();
      expect(replaceLocSpy.callCount).to.equal(2);
      expect(replaceLocSpy.args[1][0]).to.equal('#first');
    });
  });

  describe('when linking to custom protocols e.g. whatsapp:', () => {
    beforeEach(() => {
      win.open = sandbox.spy();
      win.parent = {};
      win.top = {
        location: {
          href: 'https://google.com',
        },
      };
      tgt.href = 'whatsapp://send?text=hello';
    });

    it('should set top.location.href on Safari iOS when embedded', () => {
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(true);
      onDocumentElementClick_(evt, viewport, history);
      expect(win.open.called).to.be.true;
      expect(win.open.calledWith(
          'whatsapp://send?text=hello', '_blank')).to.be.true;
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything for mailto: protocol', () => {
      tgt.href = 'mailto:hello@example.com';
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(true);
      onDocumentElementClick_(evt, viewport, history);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other non-safari iOS', () => {
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(false);
      onDocumentElementClick_(evt, viewport, history);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other platforms', () => {
      sandbox.stub(platform, 'isIos').returns(false);
      sandbox.stub(platform, 'isSafari').returns(false);
      onDocumentElementClick_(evt, viewport, history);
      expect(win.top.location.href).to.equal('https://google.com');
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything if not embedded', () => {
      sandbox.stub(platform, 'isIos').returns(true);
      sandbox.stub(platform, 'isSafari').returns(true);
      win.parent = undefined;
      onDocumentElementClick_(evt, viewport, history);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });
  });
});
