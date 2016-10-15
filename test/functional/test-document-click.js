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
import {installTimerService} from '../../src/service/timer-impl';
import * as sinon from 'sinon';

describe('test-document-click onDocumentElementClick_', () => {
  let sandbox;
  let evt;
  let doc;
  let win;
  let ampdoc;
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
  let timerFuncSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    preventDefaultSpy = sandbox.spy();
    scrollIntoViewSpy = sandbox.spy();
    timerFuncSpy = sandbox.spy();
    replaceLocSpy = sandbox.spy();
    elem = {nodeType: 1};
    getElementByIdSpy = sandbox.stub();
    querySelectorSpy = sandbox.stub();
    tgt = document.createElement('a');
    tgt.href = 'https://www.google.com';
    win = {
      location: {
        href: 'https://www.google.com/some-path?hello=world#link',
        replace: replaceLocSpy,
      },
      setTimeout: fn => {
        timerFuncSpy();
        fn();
      },
    };
    ampdoc = {
      win,
      getRootNode: () => {
        return {
          getElementById: getElementByIdSpy,
          querySelector: querySelectorSpy,
        };
      },
    };
    doc = {defaultView: win};
    docElem = {
      nodeType: 1,
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
    installTimerService(win);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when linking to a different origin or path', () => {

    beforeEach(() => {
      win.location.href = 'https://www.google.com/some-path?hello=world#link';
    });

    it('should not do anything on path change', () => {
      tgt.href = 'https://www.google.com/some-other-path';
      onDocumentElementClick_(evt, ampdoc, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything on origin change', () => {
      tgt.href = 'https://maps.google.com/some-path#link';
      onDocumentElementClick_(evt, ampdoc, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything when there is no hash', () => {
      tgt.href = 'https://www.google.com/some-path';
      onDocumentElementClick_(evt, ampdoc, viewport, history);

      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
      expect(preventDefaultSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
    });

    it('should not do anything on a query change', () => {
      tgt.href = 'https://www.google.com/some-path?hello=foo#link';
      onDocumentElementClick_(evt, ampdoc, viewport, history);

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
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(querySelectorSpy.callCount).to.equal(0);
    });

    it('should always call preventDefault', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(null);
      expect(preventDefaultSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything if no anchor is found', () => {
      evt.target = document.createElement('span');
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(0);
      expect(querySelectorSpy.callCount).to.equal(0);
    });

    it('should call querySelector on document if element with id is not ' +
       'found', () => {
      getElementByIdSpy.returns(null);
      expect(getElementByIdSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(querySelectorSpy.callCount).to.equal(1);
    });

    it('should not call scrollIntoView if element with id is not found or ' +
       'anchor with name is not found, but should still update URL', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(null);
      expect(getElementByIdSpy.callCount).to.equal(0);

      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(getElementByIdSpy.callCount).to.equal(1);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should call scrollIntoView if element with id is found', () => {
      getElementByIdSpy.returns(elem);

      expect(replaceLocSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(2);
      expect(timerFuncSpy).to.be.calledOnce;
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should call scrollIntoView if element with name is found', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);

      expect(replaceLocSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(2);
      expect(timerFuncSpy).to.be.calledOnce;
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');
    });

    it('should use escaped css selectors', () => {
      tgt.href = 'https://www.google.com/some-path?hello=world#test%20hello';
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);

      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(querySelectorSpy).to.be.calledWith('a[name="test\\%20hello"]');

      querySelectorSpy.reset();
      tgt.href = 'https://www.google.com/some-path?hello=world#test"hello';
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(querySelectorSpy).to.be.calledWith('a[name="test\\"hello"]');
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
      onDocumentElementClick_(evt, ampdoc, viewport, history);

      expect(timerFuncSpy).to.be.calledOnce;
      expect(ops).to.have.length(3);
      expect(ops[0]).to.equal('location.replace');
      expect(ops[1]).to.equal('scrollIntoView');
    });

    it('should push and pop history state', () => {
      let historyOnPop;
      const historyPushStub = sandbox.stub(history, 'push', onPop => {
        historyOnPop = onPop;
      });

      // Click -> push.
      onDocumentElementClick_(evt, ampdoc, viewport, history);
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
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(historyPushStub.callCount).to.equal(1);
      expect(replaceLocSpy.callCount).to.equal(1);
      expect(replaceLocSpy.args[0][0]).to.equal('#test');

      // Pop.
      historyOnPop();
      expect(replaceLocSpy.callCount).to.equal(2);
      expect(replaceLocSpy.args[1][0]).to.equal('#first');
    });
  });

  describe('when linking to ftp: protocol', () => {
    beforeEach(() => {
      win.open = sandbox.spy();
      win.parent = {};
      win.top = {
        location: {
          href: 'https://google.com',
        },
      };
      tgt.href = 'ftp://example.com/a';
    });

    it('should always open in _blank when embedded', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(win.open.called).to.be.true;
      expect(win.open.calledWith(
          'ftp://example.com/a', '_blank')).to.be.true;
      expect(preventDefaultSpy.callCount).to.equal(1);
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

    it('should open link in _top on Safari iOS when embedded', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history, true);
      expect(win.open.called).to.be.true;
      expect(win.open.calledWith(
          'whatsapp://send?text=hello', '_top')).to.be.true;
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything for mailto: protocol', () => {
      tgt.href = 'mailto:hello@example.com';
      onDocumentElementClick_(evt, ampdoc, viewport, history, true);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other non-safari iOS', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history, false);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other platforms', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history, false);
      expect(win.top.location.href).to.equal('https://google.com');
      expect(preventDefaultSpy.callCount).to.equal(0);
    });
  });
});
