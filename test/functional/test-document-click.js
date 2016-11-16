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
import {
  installUrlReplacementsServiceForDoc,
} from '../../src/service/url-replacements-impl';
import {installDocumentInfoServiceForDoc,} from
    '../../src/service/document-info-impl';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../src/experiments';

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
  let viewport;
  let timerFuncSpy;
  let replaceStateForTargetSpy;
  let replaceStateForTargetPromise;
  let replaceStateForTargetResolver;

  beforeEach(() => {
    replaceStateForTargetPromise = new Promise(resolve => {
      replaceStateForTargetResolver = resolve;
    });
    sandbox = sinon.sandbox.create();
    preventDefaultSpy = sandbox.spy();
    scrollIntoViewSpy = sandbox.spy();
    timerFuncSpy = sandbox.stub();
    elem = {nodeType: 1};
    getElementByIdSpy = sandbox.stub();
    querySelectorSpy = sandbox.stub();
    replaceStateForTargetSpy = sandbox.stub();
    tgt = document.createElement('a');
    tgt.href = 'https://www.google.com';
    win = {
      document: {},
      location: {
        href: 'https://www.google.com/some-path?hello=world#link',
      },
      setTimeout: fn => {
        timerFuncSpy();
        fn();
      },
      Object,
      Math,
      services: {
        'viewport': {obj: {}},
      },
    };
    ampdoc = {
      win,
      isSingleDoc: () => true,
      getRootNode: () => {
        return {
          getElementById: getElementByIdSpy,
          querySelector: querySelectorSpy,
        };
      },
      getUrl: () => win.location.href,
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
      push: () => Promise.resolve(),
      replaceStateForTarget: hash => {
        replaceStateForTargetSpy(hash);
        return replaceStateForTargetPromise;
      },
    };
    installTimerService(win);
    installDocumentInfoServiceForDoc(ampdoc);
    installUrlReplacementsServiceForDoc(ampdoc);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when linking to a different origin or path', () => {

    beforeEach(() => {
      win.location.href = 'https://www.google.com/some-path?hello=world#link';
    });

    afterEach(() => {
      sandbox.restore();
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

    afterEach(() => {
      sandbox.restore();
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
      expect(replaceStateForTargetSpy.callCount).to.equal(1);
      expect(replaceStateForTargetSpy.args[0][0]).to.equal('#test');
    });

    it('should call scrollIntoView if element with id is found', () => {
      getElementByIdSpy.returns(elem);

      expect(replaceStateForTargetSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(replaceStateForTargetSpy.callCount).to.equal(1);
      expect(replaceStateForTargetSpy.args[0][0]).to.equal('#test');
      replaceStateForTargetResolver();
      return replaceStateForTargetPromise.then(() => {
        expect(scrollIntoViewSpy.callCount).to.equal(2);
        expect(timerFuncSpy).to.be.calledOnce;
      });
    });

    it('should call scrollIntoView if element with name is found', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);

      expect(replaceStateForTargetSpy.callCount).to.equal(0);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      replaceStateForTargetResolver();
      return replaceStateForTargetPromise.then(() => {
        expect(scrollIntoViewSpy.callCount).to.equal(2);
        expect(timerFuncSpy).to.be.calledOnce;
        expect(replaceStateForTargetSpy.callCount).to.equal(1);
        expect(replaceStateForTargetSpy.args[0][0]).to.equal('#test');
      });
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

    it('should call replaceStateForTarget before scrollIntoView', () => {
      getElementByIdSpy.returns(null);
      querySelectorSpy.returns(elem);
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(replaceStateForTargetSpy).to.have.been.calledOnce;
      expect(scrollIntoViewSpy).to.not.be.called;
      replaceStateForTargetResolver();
      return replaceStateForTargetPromise.then(() => {
        expect(timerFuncSpy).to.be.calledOnce;
        expect(scrollIntoViewSpy).to.be.calledTwice;
      });
    });

    it('should push and pop history state', () => {
      sandbox.stub(history, 'push');

      // Click -> push.
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(scrollIntoViewSpy.callCount).to.equal(0);
      expect(replaceStateForTargetSpy.callCount).to.equal(1);
      expect(replaceStateForTargetSpy.args[0][0]).to.equal('#test');
    });

    it('should push and pop history state with pre-existing hash', () => {
      win.location.href = 'https://www.google.com/some-path?hello=world#first';
      sandbox.stub(history, 'push');

      // Click -> push.
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ true, /* isIframed */ false);
      expect(replaceStateForTargetSpy.callCount).to.equal(1);
      expect(replaceStateForTargetSpy.args[0][0]).to.equal('#test');
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
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari */ false, /* isIframed */ true);
      expect(win.open).to.be.called;
      expect(win.open).to.be.calledWith('ftp://example.com/a', '_blank');
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything not embedded', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari */ false, /* isIframed */ false);
      expect(win.open).to.not.be.called;
      expect(win.open).to.not.be.calledWith('ftp://example.com/a', '_blank');
      expect(preventDefaultSpy.callCount).to.equal(0);
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
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ true, /* isIframed */ true);
      expect(win.open.called).to.be.true;
      expect(win.open.calledWith(
          'whatsapp://send?text=hello', '_top')).to.be.true;
      expect(preventDefaultSpy.callCount).to.equal(1);
    });

    it('should not do anything on when not embedded', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ true, /* isIframed */ false);
      expect(win.open).to.not.be.called;
      expect(win.open).to.not.be.calledWith(
          'whatsapp://send?text=hello', '_top');
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything for mailto: protocol', () => {
      tgt.href = 'mailto:hello@example.com';
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ true, /* isIframed */ true);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other non-safari iOS', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ false, /* isIframed */ true);
      expect(win.open.called).to.be.false;
      expect(preventDefaultSpy.callCount).to.equal(0);
    });

    it('should not do anything on other platforms', () => {
      onDocumentElementClick_(evt, ampdoc, viewport, history,
          /* isIosSafari*/ false, /* isIframed */ true);
      expect(win.top.location.href).to.equal('https://google.com');
      expect(preventDefaultSpy.callCount).to.equal(0);
    });
  });

  describe('link expansion', () => {
    it('should expand a link', () => {
      querySelectorSpy.returns({
        href: 'https://www.google.com',
      });
      toggleExperiment(win, 'link-url-replace', true);
      tgt.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
      tgt.setAttribute('data-amp-replace', 'QUERY_PARAM');
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(tgt.href).to.equal(
           'https://www.google.com/link?out=world');
    });

    it('should only expand with whitelist', () => {
      querySelectorSpy.returns({
        href: 'https://www.google.com',
      });
      toggleExperiment(win, 'link-url-replace', true);
      tgt.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(tgt.href).to.equal(
           'https://www.google.com/link?out=QUERY_PARAM(hello)');
    });

    it('should not expand a link with experiment off', () => {
      querySelectorSpy.returns({
        href: 'https://www.google.com',
      });
      toggleExperiment(win, 'link-url-replace', false);
      tgt.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
      tgt.setAttribute('data-amp-replace', 'QUERY_PARAM');
      onDocumentElementClick_(evt, ampdoc, viewport, history);
      expect(tgt.href).to.equal(
           'https://www.google.com/link?out=QUERY_PARAM(hello)');
    });
  });
});
