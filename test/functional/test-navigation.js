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

import '../../src/service/navigation';
import * as Impression from '../../src/impression';
import {Services} from '../../src/services';
import {addParamToUrl} from '../../src/url';
import {macroTask} from '../../testing/yield';


describes.sandboxed('Navigation', {}, () => {
  let event;

  beforeEach(() => {
    event = {
      target: null,
      defaultPrevented: false,
    };
    event.preventDefault = function() {
      event.defaultPrevented = true;
    };
  });

  describes.fakeWin('non-embed', {
    win: {
      location: 'https://www.google.com/some-path?hello=world#link',
    },
    amp: true,
  }, env => {
    let win, doc;
    let handler;
    let decorationSpy;
    let handleNavSpy;
    let handleCustomProtocolSpy;
    let winOpenStub;
    let scrollIntoViewStub;
    let replaceStateForTargetStub;
    let replaceStateForTargetPromise;
    let anchor;
    let elementWithId;
    let anchorWithName;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      handler = Services.navigationForDoc(doc);
      handler.isIframed_ = true;
      decorationSpy = sandbox.spy(Impression, 'getExtraParamsUrl');
      handleNavSpy = sandbox.spy(handler, 'handleNavClick_');
      handleCustomProtocolSpy = sandbox.spy(handler,
          'handleCustomProtocolClick_');
      win.open = function() {};
      winOpenStub = sandbox.stub(win, 'open').callsFake(() => {
        return {};
      });
      const viewport = Services.viewportForDoc(doc);
      scrollIntoViewStub = sandbox.stub(viewport, 'scrollIntoView');
      const history = Services.historyForDoc(doc);
      replaceStateForTargetPromise = Promise.resolve();
      replaceStateForTargetStub = sandbox.stub(
          history, 'replaceStateForTarget').callsFake(
          () => replaceStateForTargetPromise);

      anchor = doc.createElement('a');
      anchor.href = 'https://www.google.com/other';
      doc.body.appendChild(anchor);
      event.target = anchor;

      elementWithId = doc.createElement('div');
      elementWithId.id = 'test';
      doc.body.appendChild(elementWithId);

      anchorWithName = doc.createElement('a');
      anchorWithName.setAttribute('name', 'test2');
      doc.body.appendChild(anchorWithName);
    });

    describe('discovery', () => {
      it('should select a direct link', () => {
        handler.handle_(event);
        expect(handleNavSpy).to.be.calledOnce;
        expect(handleNavSpy).to.be.calledWith(event, anchor);
        expect(handleCustomProtocolSpy).to.be.calledOnce;
        expect(handleCustomProtocolSpy).to.be.calledWith(event, anchor);
      });

      it('should NOT handle custom protocol when not iframed', () => {
        handler.isIframed_ = false;
        handler.handle_(event);
        expect(handleCustomProtocolSpy).to.be.calledOnce;
        expect(handleCustomProtocolSpy).to.have.returned(false);
      });

      it('should discover a link from a nested target', () => {
        const target = doc.createElement('span');
        anchor.appendChild(target);
        event.target = target;
        handler.handle_(event);
        expect(handleNavSpy).to.be.calledOnce;
        expect(handleNavSpy).to.be.calledWith(event, anchor);
        expect(handleCustomProtocolSpy).to.be.calledOnce;
        expect(handleCustomProtocolSpy).to.be.calledWith(event, anchor);
      });

      it('should NOT proceed if event is cancelled', () => {
        event.preventDefault();
        handler.handle_(event);
        expect(handleNavSpy).to.not.be.called;
        expect(handleCustomProtocolSpy).to.not.be.called;
      });

      it('should ignore a target without link', () => {
        const target = doc.createElement('span');
        doc.body.appendChild(target);
        event.target = target;
        handler.handle_(event);
        expect(handleNavSpy).to.not.be.called;
        expect(handleCustomProtocolSpy).to.not.be.called;
      });

      it('should ignore a link without href', () => {
        anchor.removeAttribute('href');
        handler.handle_(event);
        expect(handleNavSpy).to.not.be.called;
        expect(handleCustomProtocolSpy).to.not.be.called;
      });
    });

    describe('link expansion', () => {
      it('should expand a link', () => {
        anchor.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
        anchor.setAttribute('data-amp-replace', 'QUERY_PARAM');
        handler.handle_(event);
        expect(anchor.href).to.equal('https://www.google.com/link?out=world');
        expect(handleNavSpy).to.be.calledOnce;
      });

      it('should only expand with whitelist', () => {
        anchor.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/link?out=QUERY_PARAM(hello)');
        expect(handleNavSpy).to.be.calledOnce;
      });
    });

    describe('link decoration', () => {
      let originLocation;
      let test1Url;
      let test2Url;
      beforeEach(() => {
        // set canonical url;
        handler.isEmbed_ = false;
        handler.appendExtraParams_ = true;
        originLocation = win.location.href;
        test1Url = addParamToUrl(originLocation, 'gclid', '123');
        test2Url = addParamToUrl(test1Url, 'gclsrc', 'abcd');
        const ga = win.document.createElement('amp-analytics');
        ga.setAttribute('type', 'googleanalytics');
        win.document.body.appendChild(ga);
      });

      afterEach(() => {
        win.location.href = originLocation;
      });

      it('should decorate for page w/ ga tag', function* () {
        handler.isEmbed_ = false;
        yield macroTask();
        handler.handle_(event);
        expect(decorationSpy).to.be.calledOnce;
      });

      it('should not decorate for page w/o ga tag', function* () {
        handler.isEmbed_ = false;
        const ga = win.document.getElementsByTagName('amp-analytics');
        ga[0].parentNode.removeChild(ga[0]);
        yield macroTask();
        handler.handle_(event);
        expect(decorationSpy).to.not.be.called;
      });

      it('should not decorate for embed', () => {
        handler.isEmbed_ = true;
        handler.handle_(event);
        expect(decorationSpy).to.not.be.called;
      });

      it('should only decorate w/ params exists in sourceUrl', () => {
        win.location.href = test1Url;
        handler.handle_(event);
        expect(decorationSpy).to.be.called;
        expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=123');
        expect(handleNavSpy).to.be.calledOnce;
      });

      it('should append gclid and gclsrc to outgoing link', () => {
        win.location.href = test2Url;
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=123&gclsrc=abcd');
        expect(handleNavSpy).to.be.calledOnce;
      });

      it('should respect params in outgoing link', () => {
        anchor.href = 'https://www.google.com/other?gclid=456';
        win.location.href = test2Url;
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=456&gclsrc=abcd');
        expect(handleNavSpy).to.be.calledOnce;
      });

      it('should repsect data-amp-addparams', () => {
        anchor.setAttribute('data-amp-addparams', 'gclsrc=test');
        win.location.href = test2Url;
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/other?gclsrc=test&gclid=123');
        expect(handleNavSpy).to.be.calledOnce;
      });

      it('should respect async gclid and gclsrc assignment', () => {
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/other');
        expect(handleNavSpy).to.be.calledOnce;
        win.location.href = test2Url;
        handler.handle_(event);
        expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=123&gclsrc=abcd');
        expect(handleNavSpy).to.be.calledTwice;
      });
    });

    describe('when linking to ftp: protocol', () => {
      beforeEach(() => {
        anchor.href = 'ftp://example.com/a';
      });

      it('should always open in _blank when embedded', () => {
        handler.handle_(event);
        expect(winOpenStub).to.be.calledOnce;
        expect(winOpenStub).to.be.calledWith('ftp://example.com/a', '_blank');
        expect(event.defaultPrevented).to.be.true;
      });

      it('should not do anything not embedded', () => {
        handler.isIframed_ = false;
        handler.handle_(event);
        expect(winOpenStub).to.not.be.called;
        expect(winOpenStub).to.not.be.calledWith('ftp://example.com/a', '_blank');
        expect(event.defaultPrevented).to.be.false;
      });
    });

    describe('when linking to custom protocols e.g. whatsapp:', () => {
      beforeEach(() => {
        handler.isIosSafari_ = true;
        anchor.href = 'whatsapp://send?text=hello';
      });

      it('should open link in _top on Safari iOS when embedded', () => {
        handler.handle_(event);
        expect(winOpenStub).to.be.calledOnce;
        expect(winOpenStub.calledWith(
            'whatsapp://send?text=hello', '_top')).to.be.true;
        expect(event.defaultPrevented).to.be.true;
      });

      it('should not do anything on when not embedded', () => {
        handler.isIframed_ = false;
        handler.handle_(event);
        expect(winOpenStub).to.not.be.called;
        expect(winOpenStub).to.not.be.calledWith(
            'whatsapp://send?text=hello', '_top');
        expect(event.defaultPrevented).to.be.false;
      });

      it('should not do anything for mailto: protocol', () => {
        anchor.href = 'mailto:hello@example.com';
        handler.handle_(event);
        expect(winOpenStub).to.not.be.called;
        expect(event.defaultPrevented).to.be.false;
      });

      it('should not do anything on other non-safari iOS', () => {
        handler.isIosSafari_ = false;
        handler.handle_(event);
        expect(winOpenStub).to.not.be.called;
        expect(event.defaultPrevented).to.be.false;
      });

      it('should not do anything on other platforms', () => {
        handler.isIosSafari_ = false;
        handler.handle_(event);
        expect(winOpenStub).to.not.be.called;
        expect(event.defaultPrevented).to.be.false;
      });
    });

    describe('when linking to a different origin or path', () => {
      it('should not do anything on path change', () => {
        anchor.href = 'https://www.google.com/some-other-path';
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.false;
        expect(winOpenStub).to.not.be.called;
        expect(scrollIntoViewStub).to.not.be.called;
        expect(anchor.getAttribute('target')).to.be.null;
      });

      it('should not do anything on origin change', () => {
        anchor.href = 'https://maps.google.com/some-path#link';
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.false;
        expect(winOpenStub).to.not.be.called;
        expect(scrollIntoViewStub).to.not.be.called;
        expect(anchor.getAttribute('target')).to.be.null;
      });

      it('should not do anything when there is no hash', () => {
        anchor.href = 'https://www.google.com/some-path';
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.false;
        expect(winOpenStub).to.not.be.called;
        expect(scrollIntoViewStub).to.not.be.called;
        expect(anchor.getAttribute('target')).to.be.null;
      });

      it('should not do anything on a query change', () => {
        anchor.href = 'https://www.google.com/some-path?hello=foo#link';
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.false;
        expect(winOpenStub).to.not.be.called;
        expect(scrollIntoViewStub).to.not.be.called;
        expect(anchor.getAttribute('target')).to.be.null;
      });
    });

    describe('when linking to identifier', () => {
      beforeEach(() => {
        anchor.href = 'https://www.google.com/some-path?hello=world#test';
      });

      it('should find element by id', () => {
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.true;
        expect(replaceStateForTargetStub).to.be.calledOnce;
        expect(replaceStateForTargetStub).to.be.calledWith('#test');
        expect(scrollIntoViewStub).to.not.be.called;
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.be.called;
          expect(scrollIntoViewStub).to.be.calledWith(elementWithId);
        });
      });

      it('should always call preventDefault', () => {
        elementWithId.id = 'something-else';
        handler.handle_(event);
        expect(event.defaultPrevented).to.be.true;
        expect(replaceStateForTargetStub).to.be.calledOnce;
        expect(replaceStateForTargetStub).to.be.calledWith('#test');
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.not.be.called;
        });
      });

      it('should call querySelector on document if element with id is not ' +
         'found', () => {
        anchor.href = 'https://www.google.com/some-path?hello=world#test2';
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.be.calledOnce;
        expect(replaceStateForTargetStub).to.be.calledWith('#test2');
        expect(scrollIntoViewStub).to.not.be.called;
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.be.called;
          expect(scrollIntoViewStub).to.be.calledWith(anchorWithName);
        });
      });

      it('should call scrollIntoView twice if element with id is found', () => {
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.be.calledOnce;
        expect(replaceStateForTargetStub).to.be.calledWith('#test');
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.have.callCount(1);
          return new Promise(resolve => {
            setTimeout(resolve, 2);
          });
        }).then(() => {
          expect(scrollIntoViewStub).to.have.callCount(2);
        });
      });

      it('should use escaped css selectors with spaces', () => {
        anchor.href =
            'https://www.google.com/some-path?hello=world#test%20hello';
        anchorWithName.setAttribute('name', 'test%20hello');
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.be.calledWith('#test%20hello');
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.be.calledWith(anchorWithName);
        });
      });

      it('should use escaped css selectors with quotes', () => {
        anchor.href =
            'https://www.google.com/some-path?hello=world#test%22hello';
        anchorWithName.setAttribute('name', 'test%22hello');
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.be.calledWith('#test%22hello');
        return replaceStateForTargetPromise.then(() => {
          expect(scrollIntoViewStub).to.be.calledWith(anchorWithName);
        });
      });

      it('should push and pop history state with pre-existing hash', () => {
        win.location.href =
            'https://www.google.com/some-path?hello=world#first';
        handler.isIosSafari_ = true;
        handler.isIframed_ = false;
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.be.calledOnce;
        expect(replaceStateForTargetStub).to.be.calledWith('#test');
      });

      it('should only scroll same hash, no history changes', () => {
        win.location.href =
            'https://www.google.com/some-path?hello=world#test';
        handler.handle_(event);
        expect(replaceStateForTargetStub).to.not.be.called;
        expect(scrollIntoViewStub).to.be.calledOnce;
        expect(scrollIntoViewStub).to.be.calledWith(elementWithId);
      });
    });

    describe('when linking to rel=amphtml', () => {
      beforeEach(() => {
        anchor.href = 'https://amp.pub.com/amp_page';
        anchor.setAttribute('rel', 'unused amphtml unused');
      });

      it('should delegate navigation if viewer supports A2A', () => {
        const stub =
            sandbox.stub(handler.viewer_, 'navigateToAmpUrl').returns(true);

        handler.handle_(event);

        expect(stub).to.be.calledOnce;
        expect(stub).calledWithExactly(
            'https://amp.pub.com/amp_page', '<a rel=amphtml>');

        // If viewer handles it, we should prevent default and not handle nav
        // ourselves.
        expect(event.defaultPrevented).to.be.true;
        expect(handleNavSpy).to.not.be.called;
      });

      it('should behave normally if viewer does not support A2A', () => {
        const stub =
            sandbox.stub(handler.viewer_, 'navigateToAmpUrl').returns(false);

        handler.handle_(event);

        expect(stub).to.be.calledOnce;
        expect(stub).calledWithExactly(
            'https://amp.pub.com/amp_page', '<a rel=amphtml>');

        // If viewer doesn't handles it, we should not prevent default and
        // handle nav ourselves.
        expect(event.defaultPrevented).to.be.false;
        expect(handleNavSpy).to.be.calledOnce;
      });
    });

    describe('navigateTo', () => {
      let ampdoc;

      beforeEach(() => {
        ampdoc = Services.ampdoc(doc);
        win.location.href = 'https://www.pub.com/';
      });

      // TODO(choumx, #14336): Fails due to console errors.
      it.skip('should reject invalid protocols', () => {
        const newUrl = /*eslint no-script-url: 0*/ 'javascript:alert(1)';

        expect(win.location.href).to.equal('https://www.pub.com/');
        handler.navigateTo(win, newUrl);
        // No navigation so window location should be unchanged.
        expect(win.location.href).to.equal('https://www.pub.com/');
      });

      it('should delegate navigation to viewer if necessary', () => {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'amp-to-amp-navigation');
        meta.setAttribute('content', 'feature-foo, action-bar');
        ampdoc.getRootNode().head.appendChild(meta);

        const stub =
            sandbox.stub(handler.viewer_, 'navigateToAmpUrl').returns(true);
        expect(win.location.href).to.equal('https://www.pub.com/');

        // Delegate to viewer if opt_requestedBy matches the <meta> tag content
        // and the viewer supports A2A.
        handler.navigateTo(win, 'https://amp.pub.com/amp_page', 'feature-foo');
        expect(stub).to.be.calledOnce;
        expect(stub).to.be.calledWithExactly(
            'https://amp.pub.com/amp_page', 'feature-foo');
        expect(win.location.href).to.equal('https://www.pub.com/');

        // If opt_requestedBy doesn't match, navigate top normally.
        handler.navigateTo(win, 'https://amp.pub.com/amp_page', 'no-match');
        expect(stub).to.be.calledOnce;
        expect(win.location.href).to.equal('https://amp.pub.com/amp_page');

        // If opt_requestedBy matches but viewer doesn't support A2A, navigate
        // top normally.
        stub.returns(false);
        handler.navigateTo(win, 'https://amp.pub.com/different', 'action-bar');
        expect(stub).to.be.calledTwice;
        expect(stub).to.be.calledWithExactly(
            'https://amp.pub.com/different', 'action-bar');
        expect(win.location.href).to.equal('https://amp.pub.com/different');
      });
    });
  });

  describes.realWin('fie embed', {
    amp: {
      ampdoc: 'fie',
    },
  }, env => {
    // TODO(dvoytenko, #11827): Make this test work on Safari.
    describe.configure().skipSafari().run('fie embed', () => {
      let win, doc;
      let parentWin;
      let ampdoc;
      let embed;
      let handler;
      let winOpenStub;
      let scrollIntoViewStub;
      let replaceStateForTargetStub;
      let replaceStateForTargetPromise;
      let anchor;
      let elementWithId;
      let anchorWithName;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
        ampdoc = env.ampdoc;
        parentWin = env.parentWin;
        embed = env.embed;

        handler = win.services.navigation.obj;
        winOpenStub = sandbox.stub(win, 'open').callsFake(() => {
          return {};
        });
        const viewport = parentWin.services.viewport.obj;
        scrollIntoViewStub = sandbox.stub(viewport, 'scrollIntoView');
        const history = parentWin.services.history.obj;
        replaceStateForTargetPromise = Promise.resolve();
        replaceStateForTargetStub = sandbox.stub(
            history, 'replaceStateForTarget').callsFake(
            () => replaceStateForTargetPromise);

        anchor = doc.createElement('a');
        anchor.href = 'http://ads.localhost:8000/example';
        doc.body.appendChild(anchor);
        event.target = anchor;

        elementWithId = doc.createElement('div');
        elementWithId.id = 'test';
        doc.body.appendChild(elementWithId);

        anchorWithName = doc.createElement('a');
        anchorWithName.setAttribute('name', 'test2');
        doc.body.appendChild(anchorWithName);
      });

      it('should adopt correctly to embed', () => {
        expect(handler.ampdoc).to.equal(ampdoc);
        expect(handler.rootNode_).to.equal(embed.win.document);
        expect(handler.isEmbed_).to.be.true;
      });

      describe('when linking to a different origin or path', () => {
        it('should update target to _blank', () => {
          anchor.href = 'https://www.google.com/some-other-path';
          handler.handle_(event);
          expect(event.defaultPrevented).to.be.false;
          expect(winOpenStub).to.not.be.called;
          expect(scrollIntoViewStub).to.not.be.called;
          expect(anchor.getAttribute('target')).to.equal('_blank');
        });

        it('should keep the target when specified', () => {
          anchor.href = 'https://www.google.com/some-other-path';
          anchor.setAttribute('target', '_top');
          handler.handle_(event);
          expect(event.defaultPrevented).to.be.false;
          expect(winOpenStub).to.not.be.called;
          expect(scrollIntoViewStub).to.not.be.called;
          expect(anchor.getAttribute('target')).to.equal('_top');
        });

        it('should reset the target when illegal specified', () => {
          anchor.href = 'https://www.google.com/some-other-path';
          anchor.setAttribute('target', '_self');
          handler.handle_(event);
          expect(event.defaultPrevented).to.be.false;
          expect(winOpenStub).to.not.be.called;
          expect(scrollIntoViewStub).to.not.be.called;
          expect(anchor.getAttribute('target')).to.equal('_blank');
        });
      });

      describe('when linking to identifier', () => {
        beforeEach(() => {
          anchor.href = 'http://ads.localhost:8000/example#test';
        });

        it('should NOT do anything, but cancel the event', () => {
          handler.handle_(event);
          expect(event.defaultPrevented).to.be.true;
          expect(replaceStateForTargetStub).to.not.be.called;
          expect(scrollIntoViewStub).to.not.be.called;
        });
      });
    });
  });
});
