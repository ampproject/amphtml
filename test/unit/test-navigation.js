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

import * as Impression from '../../src/impression';
import {Services} from '../../src/services';
import {addParamToUrl} from '../../src/url';
import {createElementWithAttributes} from '../../src/dom';
import {installUrlReplacementsServiceForDoc} from '../../src/service/url-replacements-impl';
import {macroTask} from '../../testing/yield';
import {maybeExpandUrlParamsForTesting} from '../../src/service/navigation';

describes.sandboxed('Navigation', {}, () => {
  let event;

  beforeEach(() => {
    event = {
      target: null,
      defaultPrevented: false,
      type: 'click',
    };
    event.preventDefault = function () {
      event.defaultPrevented = true;
    };
  });

  describes.fakeWin(
    'non-embed',
    {
      win: {
        location: 'https://www.google.com/some-path?hello=world#link',
      },
      amp: true,
    },
    (env) => {
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
      let customAnchor;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
        const {documentElement} = doc;

        handler = Services.navigationForDoc(documentElement);
        handler.isIframed_ = true;

        decorationSpy = env.sandbox.spy(Impression, 'getExtraParamsUrl');

        handleNavSpy = env.sandbox.spy(handler, 'handleNavigation_');

        handleCustomProtocolSpy = env.sandbox.spy(
          handler,
          'handleCustomProtocolClick_'
        );

        win.open = function () {};
        winOpenStub = env.sandbox.stub(win, 'open').callsFake(() => {
          return {};
        });

        const viewport = Services.viewportForDoc(doc);
        scrollIntoViewStub = env.sandbox.stub(viewport, 'scrollIntoView');

        const history = Services.historyForDoc(doc);
        replaceStateForTargetPromise = Promise.resolve();
        replaceStateForTargetStub = env.sandbox
          .stub(history, 'replaceStateForTarget')
          .callsFake(() => replaceStateForTargetPromise);

        anchor = doc.createElement('a');
        anchor.href = 'https://www.google.com/other';
        doc.body.appendChild(anchor);
        event.target = anchor;

        customAnchor = doc.createElement('a');
        customAnchor.href = 'https://www.google.com/custom';
        doc.body.appendChild(customAnchor);

        const urlReplacements = Services.urlReplacementsForDoc(documentElement);
        const urlReplacementStub = env.sandbox.stub(
          Services,
          'urlReplacementsForDoc'
        );
        urlReplacementStub.withArgs(anchor).returns(urlReplacements);
        urlReplacementStub.withArgs(customAnchor).returns(urlReplacements);

        elementWithId = doc.createElement('div');
        elementWithId.id = 'test';
        doc.body.appendChild(elementWithId);

        anchorWithName = doc.createElement('a');
        anchorWithName.setAttribute('name', 'test2');
        doc.body.appendChild(anchorWithName);
      });

      describe('discovery', () => {
        it('should select a direct link', () => {
          // TODO(alabiaga): throughout the file -- invoke the handler via the
          // document used to get the navigation service. e.g document.click().
          handler.handle_(event);
          expect(handleNavSpy).to.be.calledOnce;
          expect(handleNavSpy).to.be.calledWith(event, anchor);
          expect(handleCustomProtocolSpy).to.be.calledOnce;
          expect(handleCustomProtocolSpy).to.be.calledWith(event, anchor);
        });

        it('should select a custom linker target', () => {
          event.target = null;
          event['__AMP_CUSTOM_LINKER_TARGET__'] = customAnchor;
          handler.handle_(event);

          expect(handleNavSpy).to.be.calledOnce;
          expect(handleNavSpy).to.be.calledWith(event, customAnchor);
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

      describe('anchor mutators', () => {
        it('should not throw error if priority is already in use', () => {
          const priority = 10;
          handler.registerAnchorMutator((element) => {
            element.href += '?am=1';
          }, priority);
          expect(() =>
            handler.registerAnchorMutator((element) => {
              element.href += '?am=2';
            }, priority)
          ).to.not.throw();
        });

        it('should execute in order', () => {
          anchor.href = 'https://www.testing-1-2-3.org';
          let transformedHref;
          handler.registerAnchorMutator((element) => {
            element.href += '&second=2';
            transformedHref = element.href;
          }, 2);
          handler.registerAnchorMutator((element) => {
            element.href += '&first=1';
            transformedHref = element.href;
          }, 1);
          handler.registerAnchorMutator((element) => {
            element.href += '?third=3';
            transformedHref = element.href;
          }, 3);
          // If using a same priority, the order of registration is respected.
          handler.registerAnchorMutator((element) => {
            element.href += '&third=3-1';
            transformedHref = element.href;
          }, 3);
          handler.handle_(event);
          expect(transformedHref).to.equal(
            'https://www.testing-1-2-3.org/?third=3&third=3-1&second=2' +
              '&first=1'
          );
        });

        it('verify order of operations', () => {
          const expandVars = env.sandbox.spy(handler, 'expandVarsForAnchor_');
          const parseUrl = env.sandbox.spy(handler, 'parseUrl_');
          const obj = {
            callback: () => {},
          };
          const linkRuleSpy = env.sandbox.spy(obj, 'callback');
          handler.registerAnchorMutator(linkRuleSpy, 1);
          handler.handle_(event);
          // Verify that the expansion of variables occurs first
          // followed by the anchor transformation and then the parsing
          // of the possibly mutated anchor href into the location object
          // for navigation.handleNavClick.
          env.sandbox.assert.callOrder(expandVars, linkRuleSpy, parseUrl);
          expect(expandVars).to.be.calledOnce;
          // Verify that parseUrl is called once when the variables are
          // expanded, then after the anchor mutators and then once more
          // in handleNavClick
          expect(parseUrl).to.be.calledThrice;
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

        it('should only expand with allowlist', () => {
          anchor.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
          handler.handle_(event);
          expect(anchor.href).to.equal(
            'https://www.google.com/link?out=QUERY_PARAM(hello)'
          );
          expect(handleNavSpy).to.be.calledOnce;
        });

        it('should expand link if event type is right click', () => {
          anchor.href = 'https://www.google.com/link?out=QUERY_PARAM(hello)';
          anchor.setAttribute('data-amp-replace', 'QUERY_PARAM');
          event.type = 'contextmenu';
          handler.handle_(event);
          expect(anchor.href).to.equal('https://www.google.com/link?out=world');
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
            'https://www.google.com/other?gclid=123'
          );
          expect(handleNavSpy).to.be.calledOnce;
        });

        it('should append gclid and gclsrc to outgoing link', () => {
          win.location.href = test2Url;
          handler.handle_(event);
          expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=123&gclsrc=abcd'
          );
          expect(handleNavSpy).to.be.calledOnce;
        });

        it('should respect params in outgoing link', () => {
          anchor.href = 'https://www.google.com/other?gclid=456';
          win.location.href = test2Url;
          handler.handle_(event);
          expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=456&gclsrc=abcd'
          );
          expect(handleNavSpy).to.be.calledOnce;
        });

        it('should repsect data-amp-addparams', () => {
          anchor.setAttribute('data-amp-addparams', 'gclsrc=test');
          win.location.href = test2Url;
          handler.handle_(event);
          expect(anchor.href).to.equal(
            'https://www.google.com/other?gclsrc=test&gclid=123'
          );
          expect(handleNavSpy).to.be.calledOnce;
        });

        it('should respect async gclid and gclsrc assignment', () => {
          handler.handle_(event);
          expect(anchor.href).to.equal('https://www.google.com/other');
          expect(handleNavSpy).to.be.calledOnce;
          win.location.href = test2Url;
          handler.handle_(event);
          expect(anchor.href).to.equal(
            'https://www.google.com/other?gclid=123&gclsrc=abcd'
          );
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
          expect(winOpenStub).to.not.be.calledWith(
            'ftp://example.com/a',
            '_blank'
          );
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
          expect(winOpenStub.calledWith('whatsapp://send?text=hello', '_top'))
            .to.be.true;
          expect(event.defaultPrevented).to.be.true;
        });

        it('should not do anything on when not embedded', () => {
          handler.isIframed_ = false;
          handler.handle_(event);
          expect(winOpenStub).to.not.be.called;
          expect(winOpenStub).to.not.be.calledWith(
            'whatsapp://send?text=hello',
            '_top'
          );
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

        it(
          'should call querySelector on document if element with id is not ' +
            'found',
          () => {
            anchor.href = 'https://www.google.com/some-path?hello=world#test2';
            handler.handle_(event);
            expect(replaceStateForTargetStub).to.be.calledOnce;
            expect(replaceStateForTargetStub).to.be.calledWith('#test2');
            expect(scrollIntoViewStub).to.not.be.called;
            return replaceStateForTargetPromise.then(() => {
              expect(scrollIntoViewStub).to.be.called;
              expect(scrollIntoViewStub).to.be.calledWith(anchorWithName);
            });
          }
        );

        it('should call scrollIntoView twice if element with id is found', () => {
          handler.handle_(event);
          expect(replaceStateForTargetStub).to.be.calledOnce;
          expect(replaceStateForTargetStub).to.be.calledWith('#test');
          return replaceStateForTargetPromise
            .then(() => {
              expect(scrollIntoViewStub).to.have.callCount(1);
              return new Promise((resolve) => {
                setTimeout(resolve, 2);
              });
            })
            .then(() => {
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
          const stub = env.sandbox
            .stub(handler, 'navigateToAmpUrl')
            .returns(true);

          handler.handle_(event);

          expect(stub).to.be.calledOnce;
          expect(stub).calledWithExactly(
            'https://amp.pub.com/amp_page',
            '<a rel=amphtml>'
          );

          // If viewer handles it, we should prevent default and not handle nav
          // ourselves.
          expect(event.defaultPrevented).to.be.true;
          expect(handleNavSpy).to.not.be.called;
        });

        it('should behave normally if viewer does not support A2A', () => {
          const stub = env.sandbox
            .stub(handler, 'navigateToAmpUrl')
            .returns(false);

          handler.handle_(event);

          expect(stub).to.be.calledOnce;
          expect(stub).calledWithExactly(
            'https://amp.pub.com/amp_page',
            '<a rel=amphtml>'
          );

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

        it('should reject invalid protocols', () => {
          const newUrl = /*eslint no-script-url: 0*/ 'javascript:alert(1)';

          expect(win.location.href).to.equal('https://www.pub.com/');
          allowConsoleError(() => {
            handler.navigateTo(win, newUrl);
          });
          // No navigation so window location should be unchanged.
          expect(win.location.href).to.equal('https://www.pub.com/');
        });

        it('should navigate relative to source url', () => {
          // URLs relative to root.
          win.location.href =
            'https://cdn.ampproject.org/c/s/www.pub.com/dir/page.html';
          handler.navigateTo(win, '/abc.html');
          expect(win.location.href).to.equal('https://www.pub.com/abc.html');

          // URLs relative to current directory.
          win.location.href =
            'https://cdn.ampproject.org/c/s/www.pub.com/dir/page.html';
          handler.navigateTo(win, 'abc.html');
          expect(win.location.href).to.equal(
            'https://www.pub.com/dir/abc.html'
          );
        });

        it('should delegate navigation to viewer if necessary', () => {
          const meta = doc.createElement('meta');
          meta.setAttribute('name', 'amp-to-amp-navigation');
          meta.setAttribute('content', 'feature-foo, action-bar');
          ampdoc.getRootNode().head.appendChild(meta);

          const send = env.sandbox.stub(handler.viewer_, 'sendMessage');
          const hasCapability = env.sandbox.stub(
            handler.viewer_,
            'hasCapability'
          );
          hasCapability.returns(true);
          expect(win.location.href).to.equal('https://www.pub.com/');

          // Delegate to viewer if opt_requestedBy matches the <meta> tag content
          // and the viewer supports A2A.
          handler.navigateTo(
            win,
            'https://amp.pub.com/amp_page',
            'feature-foo'
          );
          expect(hasCapability).to.be.calledWithExactly('a2a');
          expect(send).to.be.calledOnce;
          expect(send).to.be.calledWithExactly('a2aNavigate', {
            requestedBy: 'feature-foo',
            url: 'https://amp.pub.com/amp_page',
          });
          expect(win.location.href).to.equal('https://www.pub.com/');

          // If opt_requestedBy doesn't match, navigate top normally.
          handler.navigateTo(win, 'https://amp.pub.com/amp_page', 'no-match');
          expect(send).to.be.calledOnce;
          expect(win.location.href).to.equal('https://amp.pub.com/amp_page');

          // If opt_requestedBy matches but viewer doesn't support A2A, navigate
          // top normally.
          send.reset();
          hasCapability.returns(false);
          handler.navigateTo(
            win,
            'https://amp.pub.com/different',
            'action-bar'
          );
          expect(send).to.not.be.called;
          expect(win.location.href).to.equal('https://amp.pub.com/different');
        });
      });

      describe('viewer intercept navigation', () => {
        let ampdoc;
        let viewerInterceptsNavigationSpy;
        let sendMessageStub;
        let hasCapabilityStub;

        beforeEach(() => {
          ampdoc = Services.ampdoc(doc);
          viewerInterceptsNavigationSpy = env.sandbox.spy(
            handler,
            'viewerInterceptsNavigation'
          );
          sendMessageStub = env.sandbox.stub(handler.viewer_, 'sendMessage');
          hasCapabilityStub = env.sandbox.stub(
            handler.viewer_,
            'hasCapability'
          );

          handler.isTrustedViewer_ = true;
          handler.isLocalViewer_ = false;
          hasCapabilityStub.returns(true);

          ampdoc
            .getRootNode()
            .documentElement.setAttribute('allow-navigation-interception', '');
        });

        it('should allow with trusted viewer', () => {
          handler.isTrustedViewer_ = true;
          handler.isLocalViewer_ = false;

          handler.handle_(event);

          expect(viewerInterceptsNavigationSpy).to.be.calledOnce;
          expect(viewerInterceptsNavigationSpy).to.be.calledWithExactly(
            'https://www.google.com/other',
            'intercept_click'
          );
          expect(sendMessageStub).to.be.calledOnce;
          expect(sendMessageStub).to.be.calledWithExactly('navigateTo', {
            url: 'https://www.google.com/other',
            requestedBy: 'intercept_click',
          });

          expect(event.defaultPrevented).to.be.true;
        });

        it('should allow with local viewer', () => {
          handler.isTrustedViewer_ = false;
          handler.isLocalViewer_ = true;

          handler.handle_(event);

          expect(
            ampdoc
              .getRootNode()
              .documentElement.hasAttribute('allow-navigation-interception')
          ).to.be.true;

          expect(viewerInterceptsNavigationSpy).to.be.calledOnce;
          expect(viewerInterceptsNavigationSpy).to.be.calledWithExactly(
            'https://www.google.com/other',
            'intercept_click'
          );
          expect(sendMessageStub).to.be.calledOnce;
          expect(sendMessageStub).to.be.calledWithExactly('navigateTo', {
            url: 'https://www.google.com/other',
            requestedBy: 'intercept_click',
          });

          expect(event.defaultPrevented).to.be.true;
        });

        it('should require trusted or local viewer', () => {
          handler.isTrustedViewer_ = false;
          handler.isLocalViewer_ = false;
          handler.handle_(event);

          expect(viewerInterceptsNavigationSpy).to.be.calledOnce;
          expect(viewerInterceptsNavigationSpy).to.be.calledWithExactly(
            'https://www.google.com/other',
            'intercept_click'
          );

          expect(sendMessageStub).to.not.be.called;
          expect(event.defaultPrevented).to.be.false;
        });

        it('should require interceptNavigation viewer capability', () => {
          hasCapabilityStub.returns(false);

          handler.handle_(event);

          expect(viewerInterceptsNavigationSpy).to.be.calledOnce;
          expect(viewerInterceptsNavigationSpy).to.be.calledWithExactly(
            'https://www.google.com/other',
            'intercept_click'
          );

          expect(sendMessageStub).to.not.be.called;
          expect(event.defaultPrevented).to.be.false;
        });

        it('should require opted in ampdoc', () => {
          ampdoc
            .getRootNode()
            .documentElement.removeAttribute('allow-navigation-interception');
          handler.handle_(event);

          expect(viewerInterceptsNavigationSpy).to.be.calledOnce;
          expect(viewerInterceptsNavigationSpy).to.be.calledWithExactly(
            'https://www.google.com/other',
            'intercept_click'
          );

          expect(sendMessageStub).to.not.be.called;
          expect(event.defaultPrevented).to.be.false;
        });
      });
    }
  );

  describes.realWin(
    'fie embed',
    {
      amp: {
        ampdoc: 'fie',
      },
    },
    (env) => {
      // TODO(dvoytenko, #11827): Make this test work on Safari.
      describe
        .configure()
        .skipSafari()
        .run('fie embed', () => {
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

            handler = ampdoc.__AMP_SERVICES.navigation.obj;
            winOpenStub = env.sandbox.stub(win, 'open').callsFake(() => {
              return {};
            });
            const viewport = parentWin.__AMP_SERVICES.viewport.obj;
            scrollIntoViewStub = env.sandbox.stub(viewport, 'scrollIntoView');
            const history = parentWin.__AMP_SERVICES.history.obj;
            replaceStateForTargetPromise = Promise.resolve();
            replaceStateForTargetStub = env.sandbox
              .stub(history, 'replaceStateForTarget')
              .callsFake(() => replaceStateForTargetPromise);

            anchor = doc.createElement('a');
            anchor.href = 'http://ads.localhost:8000/example';
            doc.body.appendChild(anchor);
            event.target = anchor;

            // Navigation uses the UrlReplacements service scoped to the event
            // target, but for testing stub in the top-level service for simplicity.
            const {documentElement} = parentWin.document;
            const urlReplacements = Services.urlReplacementsForDoc(
              documentElement
            );
            env.sandbox
              .stub(Services, 'urlReplacementsForDoc')
              .withArgs(anchor)
              .returns(urlReplacements);

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
    }
  );
});

describes.realWin('anchor-click-interceptor', {amp: true}, (env) => {
  let doc;
  let ampdoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    doc = ampdoc.win.document;
    installUrlReplacementsServiceForDoc(ampdoc);
  });

  it('should replace CLICK_X and CLICK_Y in href', () => {
    const a = createElementWithAttributes(doc, 'a', {
      href: 'http://example.com/?x=CLICK_X&y=CLICK_Y',
    });
    const div = createElementWithAttributes(doc, 'div', {});
    a.appendChild(div);
    doc.body.appendChild(a);

    // first click
    maybeExpandUrlParamsForTesting(ampdoc, {
      target: div,
      pageX: 12,
      pageY: 34,
    });
    expect(a.href).to.equal('http://example.com/?x=12&y=34');

    // second click
    maybeExpandUrlParamsForTesting(ampdoc, {
      target: div,
      pageX: 23,
      pageY: 45,
    });
    expect(a.href).to.equal('http://example.com/?x=23&y=45');
  });
});
