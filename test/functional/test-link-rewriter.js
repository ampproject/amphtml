import {AmpEvents} from '../../src/amp-events';
import {ORIGINAL_URL_ATTRIBUTE, PRIORITY_META_TAG_NAME, EVENTS as linkRewriterEvents} from '../../src/service/link-rewrite/constants';
import {anchorClickActions} from '../../src/service/navigation';
import {createCustomEvent} from '../../src/event-helper';
import {createTwoStepsResponse} from '../../src/service/link-rewrite/link-rewrite-classes';
import LinkRewriter from '../../src/service/link-rewrite/link-rewriter';
import LinkRewriterService from '../../src/service/link-rewrite/link-rewrite-service';

describes.fakeWin('Link Rewriter Service', {amp: true}, env => {
  let iframeDoc, linkRewriterService, win;
  let sendEventHelper, registerLinkRewriterHelper, addPriorityMetaTagHelper;


  beforeEach(() => {
    win = env.win;
    iframeDoc = env.ampdoc.getRootNode();
    env.sandbox.spy(iframeDoc, 'addEventListener');
    env.sandbox.spy(iframeDoc, 'querySelector');

    linkRewriterService = new LinkRewriterService(iframeDoc);

    // Helper functions
    registerLinkRewriterHelper = vendorName => {
      const linkRewriter = linkRewriterService.registerLinkRewriter(
          vendorName,
          env.sandbox.stub(),
          {}
      );
      env.sandbox.stub(linkRewriter, 'onDomUpdated');

      return linkRewriter;
    };

    sendEventHelper = (eventType, data) => {
      const event = createCustomEvent(win,
          eventType, data, {bubbles: true});
      iframeDoc.dispatchEvent(event);
    };

    addPriorityMetaTagHelper = priorityRule => {
      const meta = iframeDoc.createElement('meta');
      meta.setAttribute('name', PRIORITY_META_TAG_NAME);
      meta.setAttribute('content', priorityRule);
      iframeDoc.head.appendChild(meta);
      linkRewriterService = new LinkRewriterService(iframeDoc);
    };
  });


  afterEach(() => {
    env.sandbox.restore();
  });


  describe('When starting service', () => {
    it('Should listen for ANCHOR_CLICK', () => {
      const spy = iframeDoc.addEventListener.withArgs(AmpEvents.ANCHOR_CLICK);
      expect(spy.calledOnce).to.be.true;
    });

    it('Should listen for DOM_UPDATE', () => {
      const spy = iframeDoc.addEventListener.withArgs(AmpEvents.DOM_UPDATE);
      expect(spy.calledOnce).to.be.true;
    });

    it('Should set default priorityList when no meta tag', () => {
      expect(linkRewriterService.priorityList_).to.deep.equal([]);
    });

    it('Should read meta tag if available', () => {
      addPriorityMetaTagHelper(' vendor1  vendor3 vendor2 ');
      expect(linkRewriterService.priorityList_).to.deep.equal(['vendor1', 'vendor3', 'vendor2']);
    });
  });


  describe('When registering new link rewriter', () => {
    it('Should simply add the link rewriter if no other link rewriter', () => {
      expect(linkRewriterService.linkRewriters_.length).to.equal(0);
      const linkRewriter = registerLinkRewriterHelper('amp-skimlinks');
      expect(linkRewriterService.linkRewriters_).to.deep.equal([linkRewriter]);
    });

    it('Should set the highest priority in the first position', () => {
      linkRewriterService.priorityList_ = ['vendor2', 'vendor1'];

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1]);
    });

    it('Should set lower priority in the last position', () => {
      linkRewriterService.priorityList_ = ['vendor2', 'vendor1'];
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1]);
    });

    it('Should be insert linkRewriter in the middle', () => {
      linkRewriterService.priorityList_ = ['vendor2', 'vendor1', 'vendor3'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1, linkRewriterVendor3]);
    });

    it('Should set link rewriters with no priorities at the end', () => {
      linkRewriterService.priorityList_ = ['vendor2', 'vendor1'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor3]);

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterService.linkRewriters_).to.deep.equal(
          [linkRewriterVendor2, linkRewriterVendor1, linkRewriterVendor3]);
    });
  });


  describe('On dom update', () => {
    it('Should notify all the links rewriter', () => {
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

      sendEventHelper(AmpEvents.DOM_UPDATE);

      expect(linkRewriterVendor1.onDomUpdated.calledOnce).to.be.true;
      expect(linkRewriterVendor2.onDomUpdated.calledOnce).to.be.true;
      expect(linkRewriterVendor3.onDomUpdated.calledOnce).to.be.true;
    });
  });


  describe('On click', () => {
    beforeEach(() => {
      env.sandbox.spy(linkRewriterService, 'getSuitableLinkRewritersForLink_');
    });

    describe('Allowed click action types', () => {
      it('Should return if action type not allowed', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_CUSTOM_PROTOCOL,
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.called).to.be.false;
      });

      it('Should handle clicks of type "navigate-outbound"', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: iframeDoc.createElement('a'),
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.calledOnce).to.be.true;
      });

      it('Should support clicks of type "open-context-menu"', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.OPEN_CONTEXT_MENU,
          anchor: iframeDoc.createElement('a'),
        });
        expect(linkRewriterService.getSuitableLinkRewritersForLink_.calledOnce).to.be.true;
      });
    });


    describe('Send click event', () => {
      let linkRewriterVendor1, linkRewriterVendor2, linkRewriterVendor3;

      function getEventData() {
        return linkRewriterVendor1.events.send.firstCall.args[1];
      }

      beforeEach(() => {
        linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
        linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
        linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

        env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor1.events, 'send');
        env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(false);
        env.sandbox.stub(linkRewriterVendor2.events, 'send');
        env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor3.events, 'send');
      });

      it('Should only send click event to suitable link rewriters', () => {
        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: iframeDoc.createElement('a'),
        });

        expect(linkRewriterVendor1.events.send.calledOnce).to.be.true;
        expect(linkRewriterVendor2.events.send.called).to.be.false;
        expect(linkRewriterVendor3.events.send.calledOnce).to.be.true;
      });

      it('Should contain the name of the chosen link rewriter', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: iframeDoc.createElement('a'),
        });

        expect(getEventData(linkRewriterVendor1).replacedBy).to.equal('vendor1');
        expect(getEventData(linkRewriterVendor2).replacedBy).to.equal('vendor1');
        expect(getEventData(linkRewriterVendor3).replacedBy).to.equal('vendor1');
      });

      it('Should set replacedBy to null when no replacement', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(false);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(false);

        sendEventHelper(AmpEvents.ANCHOR_CLICK, {
          clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
          anchor: iframeDoc.createElement('a'),
        });

        expect(getEventData(linkRewriterVendor1).replacedBy).to.be.null;
        // vendor2 has isWatchingLink to false therefore can not replace.
        expect(getEventData(linkRewriterVendor2).replacedBy).to.be.null;
        expect(getEventData(linkRewriterVendor3).replacedBy).to.be.null;
      });
    });


    describe('Calls rewriteAnchorUrl on the most suitable linkRewriter', () => {
      let linkRewriterVendor1, linkRewriterVendor2, linkRewriterVendor3;

      describe('Without page level priorities', () => {
        beforeEach(() => {
          linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
          linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
          linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

          env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor1.events, 'send');
          env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(false);
          env.sandbox.stub(linkRewriterVendor2.events, 'send');
          env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor3.events, 'send');
        });

        it('Should ignore not suitable link rewriter', () => {
          env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
          env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(false);

          sendEventHelper(AmpEvents.ANCHOR_CLICK, {
            clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
            anchor: iframeDoc.createElement('a'),
          });

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
        });

        it('Should try the next one if no replacement', () => {
          env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(false);
          env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(false);
          env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

          sendEventHelper(AmpEvents.ANCHOR_CLICK, {
            clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
            anchor: iframeDoc.createElement('a'),
          });

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });
      });


      describe('With page level priorities', () => {
        beforeEach(() => {
          addPriorityMetaTagHelper('vendor3 vendor1');
          linkRewriterService = new LinkRewriterService(iframeDoc);
          linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
          linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
          linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

          env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        });

        it('Should respect page level priorities', () => {
          env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
          env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
          env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

          sendEventHelper(AmpEvents.ANCHOR_CLICK, {
            clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
            anchor: iframeDoc.createElement('a'),
          });

          expect(linkRewriterVendor1.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });

        it('Should respect anchor level priorities', () => {
          env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(false);
          env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
          env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

          const anchor = iframeDoc.createElement('a');
          // Overwrite global priority
          anchor.setAttribute('data-link-rewriters', 'vendor1 vendor3');

          sendEventHelper(AmpEvents.ANCHOR_CLICK, {
            clickActionType: anchorClickActions.NAVIGATE_OUTBOUND,
            anchor,
          });

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });
      });
    });
  });
});



describes.fakeWin('Link Rewriter', {amp: true}, env => {
  let iframeDoc;
  let createResolveResponseHelper, createLinkRewriterHelper;

  beforeEach(() => {
    iframeDoc = env.ampdoc.getRootNode();

    createResolveResponseHelper = (syncData, asyncData) => {
      const twoStepsResponse = createTwoStepsResponse(syncData, asyncData);
      return env.sandbox.stub().returns(twoStepsResponse);
    };

    createLinkRewriterHelper = (resolveFunction, options) => {
      resolveFunction = resolveFunction || createResolveResponseHelper();
      options = options || {};
      // Prevent scanning the page in the constructor
      env.sandbox.stub(LinkRewriter.prototype, 'scanLinksOnPage_');
      const linkRewriter = new LinkRewriter(iframeDoc, 'test', resolveFunction, options);
      linkRewriter.scanLinksOnPage_.restore();
      return linkRewriter;
    };
  });


  describe('Scan links on page', () => {
    const replacementUrl = 'https://redirect.com';

    it('Should scan the page when creating linkRewriter', () => {
      env.sandbox.stub(LinkRewriter.prototype, 'scanLinksOnPage_');
      const linkRewriter = new LinkRewriter(iframeDoc, 'test', () => {}, {});
      expect(linkRewriter.scanLinksOnPage_.calledOnce).to.be.true;
    });

    it('Should raise an error resolveUnknownLinks returns wrong object', () => {
      const anchor1 = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor1);
      const resolveFunction = () => { };
      allowConsoleError(() => expect(() => {
        createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();
      }).to.throw('Invalid response from provided resolveUnknownLinks, use the return value of createTwoStepsResponse(syncResponse, asyncResponse)'));
    });

    it('Should call resolveUnknownLinks if links on page', () => {
      const anchor1 = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor1);
      const resolveFunction = createResolveResponseHelper();
      createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();

      expect(resolveFunction.calledOnce).to.be.true;
    });

    it('Should not call resolveUnknownLinks if no links on page', () => {
      const resolveFunction = createResolveResponseHelper();
      createLinkRewriterHelper().scanLinksOnPage_();
      expect(resolveFunction.called).to.be.false;
    });

    it('Always update the anchor Map with unknown links', () => {
      const anchor = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor);

      // Make sure resolveFunction doesn't return sync nor async data.
      const resolveFunction = createResolveResponseHelper();
      const linkRewriter = createLinkRewriterHelper(resolveFunction);
      linkRewriter.scanLinksOnPage_();
      expect(linkRewriter.anchorReplacementMap_.has(anchor)).to.be.true;
    });

    it('Should raise an error if synchronous response data is malformed', () => {
      const anchor = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor);

      const syncData = [{}];
      const resolveFunction = createResolveResponseHelper(syncData);
      allowConsoleError(() => expect(() => {
        createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();
      }).to.throw('Expected anchorReplacementTuple, use "createAnchorReplacementTuple()"'));
    });

    it('Update the anchor Map with synchronous response', () => {
      const anchor1 = iframeDoc.createElement('a');
      const anchor2 = iframeDoc.createElement('a');
      const anchor3 = iframeDoc.createElement('a');

      iframeDoc.body.appendChild(anchor1);
      iframeDoc.body.appendChild(anchor2);
      iframeDoc.body.appendChild(anchor3);
      const replacementUrl = 'https://redirect.com';
      const syncData = [[anchor1, replacementUrl], [anchor2, null]];
      const resolveFunction = createResolveResponseHelper(syncData);
      const linkRewriter = createLinkRewriterHelper(resolveFunction);
      linkRewriter.scanLinksOnPage_();

      expect(linkRewriter.anchorReplacementMap_.get(anchor1)).to.equal(replacementUrl);
      expect(linkRewriter.anchorReplacementMap_.has(anchor2)).to.be.true;
      expect(linkRewriter.anchorReplacementMap_.get(anchor2)).to.be.null;
      // Should exist even in the map even if not returned
      expect(linkRewriter.anchorReplacementMap_.has(anchor3)).to.be.true;
      expect(linkRewriter.anchorReplacementMap_.get(anchor3)).to.be.undefined;
    });

    // Don't know how to catch the async error and expect it at the same time.
    it.skip('Should raise an error if async response data is malformed', () => {
      expectAsyncConsoleError('Expected anchorReplacementTuple, use "createAnchorReplacementTuple()', 1);
      const anchor = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor);

      const resolveFunction = createResolveResponseHelper(null, Promise.resolve([{}]));
      const linkRewriter = createLinkRewriterHelper(resolveFunction);

      return linkRewriter.scanLinksOnPage_();
    });

    it('Update the anchor Map with asynchronous response', () => {
      const anchor = iframeDoc.createElement('a');
      iframeDoc.body.appendChild(anchor);

      const asyncData = Promise.resolve([[anchor, replacementUrl]]);
      const resolveFunction = createResolveResponseHelper([], asyncData);
      const linkRewriter = createLinkRewriterHelper(resolveFunction);

      const promise = linkRewriter.scanLinksOnPage_();
      expect(linkRewriter.anchorReplacementMap_.has(anchor)).to.be.true;
      expect(linkRewriter.anchorReplacementMap_.get(anchor)).to.be.undefined;

      return promise.then(() => {
        expect(linkRewriter.anchorReplacementMap_.get(anchor)).to.equal(replacementUrl);
      });
    });

    describe('Find all links on page', () => {
      it('Should find all the links on the page by default', () => {
        const anchor1 = iframeDoc.createElement('a');
        const anchor2 = iframeDoc.createElement('a');
        const anchor3 = iframeDoc.createElement('a');

        iframeDoc.body.appendChild(anchor1);
        iframeDoc.body.appendChild(anchor2);
        iframeDoc.body.appendChild(anchor3);

        const resolveFunction = createResolveResponseHelper();
        createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();

        expect(resolveFunction.firstCall.args[0]).to.deep.equal([anchor1, anchor2, anchor3]);
      });

      it('Should find only the links matching linkSelector', () => {
        const anchor1 = iframeDoc.createElement('a');
        const anchor2 = iframeDoc.createElement('a');
        anchor2.classList.add('affiliate');
        const anchor3 = iframeDoc.createElement('a');

        iframeDoc.body.appendChild(anchor1);
        iframeDoc.body.appendChild(anchor2);
        iframeDoc.body.appendChild(anchor3);

        const resolveFunction = createResolveResponseHelper();
        createLinkRewriterHelper(resolveFunction, {
          linkSelector: 'a.affiliate',
        }).scanLinksOnPage_();

        expect(resolveFunction.firstCall.args[0]).to.deep.equal([anchor2]);
      });
    });


    describe('In dynamic page', () => {
      it('Should scan the when onDomUpdated() is called', () => {
        const linkRewriter = createLinkRewriterHelper();
        env.sandbox.stub(linkRewriter, 'scanLinksOnPage_').returns(Promise.resolve());
        linkRewriter.onDomUpdated();
        expect(linkRewriter.scanLinksOnPage_.calledOnce).to.be.true;
      });

      it('Should remove detached anchor from internal Map', () => {
        // Anchor is not attached to the dom
        const anchor = iframeDoc.createElement('a');
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.anchorReplacementMap_.set(anchor, 'https://replacementurl.com');
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.anchorReplacementMap_.has(anchor)).to.be.false;
      });

      it('Should not call resolveUnknownLinks_ if no new links', () => {
        const anchor = iframeDoc.createElement('a');
        iframeDoc.body.appendChild(anchor);
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.anchorReplacementMap_.has(anchor)).to.be.true;
        // Reset since resolveUnknownLinks_ has already been called during first scanLinksOnPage_();
        linkRewriter.resolveUnknownLinks_.resetHistory();

        return linkRewriter.onDomUpdated().then(() => {
          expect(linkRewriter.resolveUnknownLinks_.called).to.be.false;
        });
      });

      it('Should call resolveUnknownLinks_ if new links', () => {
        const anchor1 = iframeDoc.createElement('a');
        iframeDoc.body.appendChild(anchor1);
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.anchorReplacementMap_.has(anchor1)).to.be.true;
        // Reset since resolveUnknownLinks_ has already been called during first scanLinksOnPage_();
        linkRewriter.resolveUnknownLinks_.resetHistory();

        //Introduce new link on the page
        const anchor2 = iframeDoc.createElement('a');
        iframeDoc.body.appendChild(anchor2);

        return linkRewriter.onDomUpdated().then(() => {
          expect(linkRewriter.resolveUnknownLinks_.calledOnce).to.be.true;
          expect(linkRewriter.resolveUnknownLinks_.withArgs([anchor2]).calledOnce).to.be.true;
        });
      });

      it('Should send PAGE_SCANNED event when onDomUpdated() is called', () => {
        const linkRewriter = createLinkRewriterHelper();
        env.sandbox.stub(linkRewriter.events, 'send');
        return linkRewriter.onDomUpdated().then(() => {
          const stub = linkRewriter.events.send;
          expect(stub.withArgs(linkRewriterEvents.PAGE_SCANNED).calledOnce).to.be.true;
        });
      });
    });

    describe.only('rewriteAnchorUrl', () => {
      const initialUrl = 'https://initialurl.com/';
      let anchor1, linkRewriter;

      beforeEach(() => {
        anchor1 = iframeDoc.createElement('a');
        anchor1.setAttribute('href', initialUrl);
        linkRewriter = createLinkRewriterHelper();
      });

      it('Should return false if anchor does not exist', () => {
        expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
        expect(anchor1.href).to.equal(initialUrl);
      });

      it('Should return false if anchor exist but without replacement url', () => {
        linkRewriter.anchorReplacementMap_.set(anchor1, null);
        expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
        expect(anchor1.href).to.equal(initialUrl);
      });

      it('Should return false if href is the same as replacement url', () => {
        linkRewriter.anchorReplacementMap_.set(anchor1, initialUrl);
        expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
        expect(anchor1.href).to.equal(initialUrl);
      });

      it('Should replace and return true if the url has been replaced', () => {
        const replacementUrl = 'https://replacementurl.com/';
        linkRewriter.anchorReplacementMap_.set(anchor1, replacementUrl);
        expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.true;
        expect(anchor1.href).to.equal(replacementUrl);
      });

      it('Should set the original url attribute', () => {
        const replacementUrl = 'https://replacementurl.com/';
        linkRewriter.anchorReplacementMap_.set(anchor1, replacementUrl);
        linkRewriter.rewriteAnchorUrl(anchor1);

        expect(anchor1.getAttribute(ORIGINAL_URL_ATTRIBUTE)).to.equal(initialUrl);
      });

      it('Should restore the original link after the delay', done => {
        const replacementUrl = 'https://replacementurl.com/';
        linkRewriter.anchorReplacementMap_.set(anchor1, replacementUrl);
        linkRewriter.rewriteAnchorUrl(anchor1);

        expect(anchor1.href).to.equal(replacementUrl);
        setTimeout(() => {
          expect(anchor1.href).to.equal(initialUrl);
          done();
        }, linkRewriter.restoreDelay_ + 1);
      });
    });

    describe('isWatchingLink', () => {
      it('Should return true if the link is in the Map', () => {

      });
      it('Should return false if the link is not in the Map', () => {

      });
    });

    describe('getReplacementUrl', () => {
      it('Should return null if link does not exist in the anchorReplacementMap_', () => {

      });
      it('Should return the value in stored in the anchorReplacementMap_', () => {

      });
    });

  });

  // describe('')
});

