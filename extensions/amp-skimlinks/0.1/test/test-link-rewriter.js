/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as chunkModule from '../../../../src/chunk';
import {AmpEvents} from '../../../../src/amp-events';
import {LinkReplacementCache} from '../link-rewriter/link-replacement-cache';
import {LinkRewriter} from '../link-rewriter/link-rewriter';
import {LinkRewriterManager} from '../link-rewriter/link-rewriter-manager';
import {
  ORIGINAL_URL_ATTRIBUTE,
  PRIORITY_META_TAG_NAME,
  EVENTS as linkRewriterEvents,
} from '../link-rewriter/constants';
import {Services} from '../../../../src/services';
import {TwoStepsResponse} from '../link-rewriter/two-steps-response';
import {createCustomEvent} from '../../../../src/event-helper';

const CLICK_EVENT = {
  type: 'click',
};

describes.fakeWin('LinkRewriterManager', {amp: true}, env => {
  let rootDocument, linkRewriterManager, win;
  let sendEventHelper, registerLinkRewriterHelper, addPriorityMetaTagHelper;

  beforeEach(() => {
    win = env.win;
    rootDocument = env.ampdoc.getRootNode();
    env.sandbox.spy(rootDocument, 'addEventListener');
    env.sandbox.spy(rootDocument, 'querySelector');

    // Chunk executes the provided task when the browser is Idle. We can
    // execute the task straight away for the purpose of the test.
    env.sandbox.stub(chunkModule, 'chunk').callsFake((node, task) => {
      task();
    });
    linkRewriterManager = new LinkRewriterManager(env.ampdoc);

    // Helper functions
    registerLinkRewriterHelper = vendorName => {
      const linkRewriter = linkRewriterManager.registerLinkRewriter(
        vendorName,
        env.sandbox.stub(),
        {}
      );
      env.sandbox.stub(linkRewriter, 'onDomUpdated');

      return linkRewriter;
    };

    sendEventHelper = (eventType, data) => {
      const event = createCustomEvent(win, eventType, data, {bubbles: true});
      rootDocument.dispatchEvent(event);
    };

    addPriorityMetaTagHelper = priorityRule => {
      env.sandbox.stub(Services, 'documentInfoForDoc').returns({
        metaTags: {[PRIORITY_META_TAG_NAME]: priorityRule},
      });

      linkRewriterManager = new LinkRewriterManager(env.ampdoc);
    };
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('When starting service', () => {
    it('Should listen for DOM_UPDATE', () => {
      const spy = rootDocument.addEventListener.withArgs(AmpEvents.DOM_UPDATE);
      expect(spy.calledOnce).to.be.true;
    });

    it('Should set default priorityList when no meta tag', () => {
      expect(linkRewriterManager.priorityList_).to.deep.equal([]);
    });

    it('Should read meta tag if available', () => {
      addPriorityMetaTagHelper(' vendor1  vendor3 vendor2 ');
      expect(linkRewriterManager.priorityList_).to.deep.equal([
        'vendor1',
        'vendor3',
        'vendor2',
      ]);
    });
  });

  describe('When registering new link rewriter', () => {
    it('Should simply add the link rewriter if no other link rewriter', () => {
      expect(linkRewriterManager.linkRewriters_.length).to.equal(0);
      const linkRewriter = registerLinkRewriterHelper('amp-skimlinks');
      expect(linkRewriterManager.linkRewriters_).to.deep.equal([linkRewriter]);
    });

    it('Should set the highest priority in the first position', () => {
      linkRewriterManager.priorityList_ = ['vendor2', 'vendor1'];

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor1,
      ]);
    });

    it('Should set lower priority in the last position', () => {
      linkRewriterManager.priorityList_ = ['vendor2', 'vendor1'];
      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor1,
      ]);
    });

    it('Should be able to insert linkRewriter in the middle', () => {
      linkRewriterManager.priorityList_ = ['vendor2', 'vendor1', 'vendor3'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor1,
        linkRewriterVendor3,
      ]);
    });

    it('Should set link rewriters with no priorities at the end', () => {
      linkRewriterManager.priorityList_ = ['vendor2', 'vendor1'];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor3,
      ]);

      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
      const linkRewriterVendor4 = registerLinkRewriterHelper('vendor4');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor1,
        linkRewriterVendor3,
        linkRewriterVendor4,
      ]);
    });

    it('Should ignore if priority contains unregistered rewriters', () => {
      linkRewriterManager.priorityList_ = [
        'vendor2',
        'vendor4',
        'vendor1',
        'vendor3',
      ];

      const linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
      const linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');
      const linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');

      expect(linkRewriterManager.linkRewriters_).to.deep.equal([
        linkRewriterVendor2,
        linkRewriterVendor1,
        linkRewriterVendor3,
      ]);
    });

    it('Should call .onDomUpdate() after registering linkRewriter', () => {
      env.sandbox
        .stub(LinkRewriter.prototype, 'onDomUpdated')
        .returns(Promise.resolve());
      const linkRewriter = linkRewriterManager.registerLinkRewriter(
        'vendor',
        env.sandbox.stub(),
        {}
      );
      expect(linkRewriter.onDomUpdated.calledOnce).to.be.true;
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
      env.sandbox.spy(linkRewriterManager, 'getSuitableLinkRewritersForLink_');
    });

    describe('Send click event', () => {
      let linkRewriterVendor1, linkRewriterVendor2, linkRewriterVendor3;

      function getEventData() {
        return linkRewriterVendor1.events.fire.firstCall.args[0].eventData;
      }

      beforeEach(() => {
        linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
        linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
        linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

        env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor1.events, 'fire');
        env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(false);
        env.sandbox.stub(linkRewriterVendor2.events, 'fire');
        env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        env.sandbox.stub(linkRewriterVendor3.events, 'fire');
      });

      it('Should only send click event to suitable link rewriters', () => {
        linkRewriterManager.maybeRewriteLink(
          rootDocument.createElement('a'),
          CLICK_EVENT
        );

        expect(linkRewriterVendor1.events.fire.calledOnce).to.be.true;
        expect(linkRewriterVendor2.events.fire.called).to.be.false;
        expect(linkRewriterVendor3.events.fire.calledOnce).to.be.true;
      });

      it('Should contain the name of the chosen link rewriter', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox.stub(linkRewriterVendor3, 'rewriteAnchorUrl').returns(true);

        linkRewriterManager.maybeRewriteLink(
          rootDocument.createElement('a'),
          CLICK_EVENT
        );

        expect(getEventData(linkRewriterVendor1).linkRewriterId).to.equal(
          'vendor1'
        );
        expect(getEventData(linkRewriterVendor2).linkRewriterId).to.equal(
          'vendor1'
        );
        expect(getEventData(linkRewriterVendor3).linkRewriterId).to.equal(
          'vendor1'
        );
      });

      it('Should contain the target anchor', () => {
        env.sandbox.stub(linkRewriterVendor1, 'rewriteAnchorUrl').returns(true);
        const anchor = rootDocument.createElement('a');

        linkRewriterManager.maybeRewriteLink(anchor, CLICK_EVENT);

        expect(getEventData(linkRewriterVendor1).anchor).to.equal(anchor);
      });

      it('Should set linkRewriterId to null when no replacement', () => {
        env.sandbox
          .stub(linkRewriterVendor1, 'rewriteAnchorUrl')
          .returns(false);
        env.sandbox.stub(linkRewriterVendor2, 'rewriteAnchorUrl').returns(true);
        env.sandbox
          .stub(linkRewriterVendor3, 'rewriteAnchorUrl')
          .returns(false);

        linkRewriterManager.maybeRewriteLink(
          rootDocument.createElement('a'),
          CLICK_EVENT
        );

        expect(getEventData(linkRewriterVendor1).linkRewriterId).to.be.null;
        // vendor2 has isWatchingLink to false therefore can not replace.
        expect(getEventData(linkRewriterVendor2).linkRewriterId).to.be.null;
        expect(getEventData(linkRewriterVendor3).linkRewriterId).to.be.null;
      });

      it('Should set the clickType', () => {
        const contextMenuEvent = {type: 'contextmenu'};
        linkRewriterManager.maybeRewriteLink(
          rootDocument.createElement('a'),
          contextMenuEvent
        );
        expect(getEventData(linkRewriterVendor1).clickType).to.equal(
          'contextmenu'
        );
        expect(getEventData(linkRewriterVendor2).clickType).to.equal(
          'contextmenu'
        );
        expect(getEventData(linkRewriterVendor3).clickType).to.equal(
          'contextmenu'
        );
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
          env.sandbox.stub(linkRewriterVendor1.events, 'fire');
          env.sandbox
            .stub(linkRewriterVendor2, 'isWatchingLink')
            .returns(false);
          env.sandbox.stub(linkRewriterVendor2.events, 'fire');
          env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor3.events, 'fire');
        });

        it('Should ignore not suitable link rewriter', () => {
          env.sandbox
            .stub(linkRewriterVendor1, 'rewriteAnchorUrl')
            .returns(true);
          env.sandbox
            .stub(linkRewriterVendor2, 'rewriteAnchorUrl')
            .returns(false);

          linkRewriterManager.maybeRewriteLink(
            rootDocument.createElement('a'),
            CLICK_EVENT
          );

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
        });

        it('Should try the next one if no replacement', () => {
          env.sandbox
            .stub(linkRewriterVendor1, 'rewriteAnchorUrl')
            .returns(false);
          env.sandbox
            .stub(linkRewriterVendor2, 'rewriteAnchorUrl')
            .returns(false);
          env.sandbox
            .stub(linkRewriterVendor3, 'rewriteAnchorUrl')
            .returns(true);

          linkRewriterManager.maybeRewriteLink(
            rootDocument.createElement('a'),
            CLICK_EVENT
          );

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });
      });

      describe('With page level priorities', () => {
        beforeEach(() => {
          addPriorityMetaTagHelper('vendor3 vendor1');
          linkRewriterManager = new LinkRewriterManager(env.ampdoc);
          linkRewriterVendor1 = registerLinkRewriterHelper('vendor1');
          linkRewriterVendor2 = registerLinkRewriterHelper('vendor2');
          linkRewriterVendor3 = registerLinkRewriterHelper('vendor3');

          env.sandbox.stub(linkRewriterVendor1, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor2, 'isWatchingLink').returns(true);
          env.sandbox.stub(linkRewriterVendor3, 'isWatchingLink').returns(true);
        });

        it('Should respect page level priorities', () => {
          env.sandbox
            .stub(linkRewriterVendor1, 'rewriteAnchorUrl')
            .returns(true);
          env.sandbox
            .stub(linkRewriterVendor2, 'rewriteAnchorUrl')
            .returns(true);
          env.sandbox
            .stub(linkRewriterVendor3, 'rewriteAnchorUrl')
            .returns(true);

          linkRewriterManager.maybeRewriteLink(
            rootDocument.createElement('a'),
            CLICK_EVENT
          );

          expect(linkRewriterVendor1.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });

        it('Should respect anchor level priorities', () => {
          env.sandbox
            .stub(linkRewriterVendor1, 'rewriteAnchorUrl')
            .returns(false);
          env.sandbox
            .stub(linkRewriterVendor2, 'rewriteAnchorUrl')
            .returns(true);
          env.sandbox
            .stub(linkRewriterVendor3, 'rewriteAnchorUrl')
            .returns(true);

          const anchor = rootDocument.createElement('a');
          // Overwrite global priority
          anchor.setAttribute('data-link-rewriters', 'vendor1 vendor3');

          linkRewriterManager.maybeRewriteLink(anchor, CLICK_EVENT);

          expect(linkRewriterVendor1.rewriteAnchorUrl.calledOnce).to.be.true;
          expect(linkRewriterVendor2.rewriteAnchorUrl.called).to.be.false;
          expect(linkRewriterVendor3.rewriteAnchorUrl.calledOnce).to.be.true;
        });
      });
    });
  });
});

describes.fakeWin('Link Rewriter', {amp: true}, env => {
  let rootDocument;
  let createResolveResponseHelper, createLinkRewriterHelper;

  beforeEach(() => {
    // Chunk executes the provided task when the browser is Idle. We can
    // execute the task straight away for the purpose of the test.
    env.sandbox.stub(chunkModule, 'chunk').callsFake((node, task) => {
      task();
    });
    rootDocument = env.ampdoc.getRootNode();

    createResolveResponseHelper = (syncData, asyncData) => {
      const twoStepsResponse = new TwoStepsResponse(syncData, asyncData);
      return env.sandbox.stub().returns(twoStepsResponse);
    };

    createLinkRewriterHelper = (resolveFunction, options) => {
      resolveFunction = resolveFunction || createResolveResponseHelper();
      options = options || {};
      // Prevent scanning the page in the constructor
      env.sandbox
        .stub(LinkRewriter.prototype, 'scanLinksOnPage_')
        .returns(Promise.resolve());
      const linkRewriter = new LinkRewriter(
        rootDocument,
        'test',
        resolveFunction,
        options
      );
      linkRewriter.scanLinksOnPage_.restore();
      return linkRewriter;
    };
  });

  describe('Scan links on page', () => {
    const replacementUrl = 'https://redirect.com';

    it('Should raise an error resolveUnknownLinks returns wrong object', () => {
      const anchor1 = rootDocument.createElement('a');
      rootDocument.body.appendChild(anchor1);
      const resolveFunction = () => {};
      allowConsoleError(() =>
        expect(() => {
          createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();
        }).to.throw(
          'Invalid response from provided "resolveUnknownLinks" function.' +
            '"resolveUnknownLinks" should return an instance of TwoStepsResponse'
        )
      );
    });

    it('Should call resolveUnknownLinks if links on page', () => {
      const anchor1 = rootDocument.createElement('a');
      rootDocument.body.appendChild(anchor1);
      const resolveFunction = createResolveResponseHelper();
      createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();

      expect(resolveFunction.calledOnce).to.be.true;
    });

    it('Should not call resolveUnknownLinks if no links on page', () => {
      const resolveFunction = createResolveResponseHelper();
      createLinkRewriterHelper().scanLinksOnPage_();
      expect(resolveFunction.called).to.be.false;
    });

    it('Always update the anchor cache with unknown links', () => {
      const anchor = rootDocument.createElement('a');
      rootDocument.body.appendChild(anchor);

      // Make sure resolveFunction doesn't return sync nor async data.
      const resolveFunction = createResolveResponseHelper();
      const linkRewriter = createLinkRewriterHelper(resolveFunction);
      linkRewriter.scanLinksOnPage_();
      expect(linkRewriter.isWatchingLink(anchor)).to.be.true;
    });

    it('Update the anchor cache with synchronous response', () => {
      const anchor1 = rootDocument.createElement('a');
      const anchor2 = rootDocument.createElement('a');
      const anchor3 = rootDocument.createElement('a');

      rootDocument.body.appendChild(anchor1);
      rootDocument.body.appendChild(anchor2);
      rootDocument.body.appendChild(anchor3);
      const replacementUrl = 'https://redirect.com';
      const syncData = [
        {anchor: anchor1, replacementUrl},
        {anchor: anchor2, replacementUrl: null},
      ];
      const resolveFunction = createResolveResponseHelper(syncData);
      const linkRewriter = createLinkRewriterHelper(resolveFunction);
      linkRewriter.scanLinksOnPage_();

      expect(linkRewriter.getReplacementUrl(anchor1)).to.equal(replacementUrl);
      expect(linkRewriter.isWatchingLink(anchor2)).to.be.true;
      expect(linkRewriter.getReplacementUrl(anchor2)).to.be.null;
      // Should exist even in the map even if not returned
      expect(linkRewriter.isWatchingLink(anchor3)).to.be.true;
      expect(linkRewriter.getReplacementUrl(anchor3)).to.be.null;
    });

    it('Update the anchor cache with asynchronous response', () => {
      const anchor = rootDocument.createElement('a');
      rootDocument.body.appendChild(anchor);

      const asyncData = Promise.resolve([{anchor, replacementUrl}]);
      const resolveFunction = createResolveResponseHelper([], asyncData);
      const linkRewriter = createLinkRewriterHelper(resolveFunction);

      const promise = linkRewriter.scanLinksOnPage_();
      expect(linkRewriter.isWatchingLink(anchor)).to.be.true;
      expect(linkRewriter.getReplacementUrl(anchor)).to.be.null;

      return promise.then(() => {
        expect(linkRewriter.getReplacementUrl(anchor)).to.equal(replacementUrl);
      });
    });

    describe('Find all links on page', () => {
      it('Should find all the links on the page by default', () => {
        const anchor1 = rootDocument.createElement('a');
        const anchor2 = rootDocument.createElement('a');
        const anchor3 = rootDocument.createElement('a');

        rootDocument.body.appendChild(anchor1);
        rootDocument.body.appendChild(anchor2);
        rootDocument.body.appendChild(anchor3);

        const resolveFunction = createResolveResponseHelper();
        createLinkRewriterHelper(resolveFunction).scanLinksOnPage_();

        expect(resolveFunction.firstCall.args[0]).to.deep.equal([
          anchor1,
          anchor2,
          anchor3,
        ]);
      });

      it('Should find only the links matching linkSelector', () => {
        const anchor1 = rootDocument.createElement('a');
        const anchor2 = rootDocument.createElement('a');
        anchor2.classList.add('affiliate');
        const anchor3 = rootDocument.createElement('a');

        rootDocument.body.appendChild(anchor1);
        rootDocument.body.appendChild(anchor2);
        rootDocument.body.appendChild(anchor3);

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
        env.sandbox
          .stub(linkRewriter, 'scanLinksOnPage_')
          .returns(Promise.resolve());
        linkRewriter.onDomUpdated();
        expect(linkRewriter.scanLinksOnPage_.calledOnce).to.be.true;
      });

      it('Should remove detached anchor from internal cache', () => {
        // Anchor is not attached to the dom
        const anchor = rootDocument.createElement('a');
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.anchorReplacementCache_.updateLinkList([anchor]);
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.isWatchingLink(anchor)).to.be.false;
      });

      it('Should not call resolveUnknownLinks_ if no new links', () => {
        const anchor = rootDocument.createElement('a');
        rootDocument.body.appendChild(anchor);
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.isWatchingLink(anchor)).to.be.true;
        // Reset since resolveUnknownLinks_ has already been called during
        // first scanLinksOnPage_();
        linkRewriter.resolveUnknownLinks_.resetHistory();

        return linkRewriter.onDomUpdated().then(() => {
          expect(linkRewriter.resolveUnknownLinks_.called).to.be.false;
        });
      });

      it('Should call resolveUnknownLinks_ if new links', () => {
        const anchor1 = rootDocument.createElement('a');
        rootDocument.body.appendChild(anchor1);
        const linkRewriter = createLinkRewriterHelper();
        linkRewriter.scanLinksOnPage_();
        expect(linkRewriter.isWatchingLink(anchor1)).to.be.true;
        // Reset since resolveUnknownLinks_ has already been called during
        // first scanLinksOnPage_();
        linkRewriter.resolveUnknownLinks_.resetHistory();

        //Introduce new link on the page
        const anchor2 = rootDocument.createElement('a');
        rootDocument.body.appendChild(anchor2);

        return linkRewriter.onDomUpdated().then(() => {
          expect(linkRewriter.resolveUnknownLinks_.calledOnce).to.be.true;
          expect(
            linkRewriter.resolveUnknownLinks_.withArgs([anchor2]).calledOnce
          ).to.be.true;
        });
      });

      it('Should send PAGE_SCANNED event when onDomUpdated() is called', () => {
        const linkRewriter = createLinkRewriterHelper();
        env.sandbox.stub(linkRewriter.events, 'fire');
        const stub = linkRewriter.events.fire;
        const args = {
          type: linkRewriterEvents.PAGE_SCANNED,
        };

        return linkRewriter.onDomUpdated().then(() => {
          expect(stub.withArgs(args).calledOnce).to.be.true;
        });
      });
    });

    describe('isWatchingLink', () => {
      let anchor1, linkRewriter;

      beforeEach(() => {
        anchor1 = rootDocument.createElement('a');
        linkRewriter = createLinkRewriterHelper();
      });

      it('Should return true if the link is in the cache', () => {
        linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
        expect(linkRewriter.isWatchingLink(anchor1)).to.be.true;
      });
      it('Should return false if the link is not in the cache', () => {
        expect(linkRewriter.isWatchingLink(anchor1)).to.be.false;
      });
    });

    describe('getReplacementUrl', () => {
      let anchor1, linkRewriter;

      beforeEach(() => {
        anchor1 = rootDocument.createElement('a');
        linkRewriter = createLinkRewriterHelper();
      });

      it('Should return null if link does not exist in the cache', () => {
        expect(linkRewriter.getReplacementUrl(anchor1)).to.be.null;
      });

      it('Should return the value in stored in the cache', () => {
        const replacementUrl = 'https://replacement-url.com/';
        linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
        linkRewriter.anchorReplacementCache_.updateReplacementUrls([
          {anchor: anchor1, replacementUrl},
        ]);

        expect(linkRewriter.getReplacementUrl(anchor1)).to.be.equal(
          replacementUrl
        );
      });
    });
  });

  describe('rewriteAnchorUrl', () => {
    const initialUrl = 'https://initialurl.com/';
    let anchor1, linkRewriter;

    beforeEach(() => {
      anchor1 = rootDocument.createElement('a');
      anchor1.setAttribute('href', initialUrl);
      linkRewriter = createLinkRewriterHelper();
    });

    it('Should return false if anchor does not exist', () => {
      expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
      expect(anchor1.href).to.equal(initialUrl);
    });

    it('Should return false if anchor exist but does not have replacement url', () => {
      linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
      expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
      expect(anchor1.href).to.equal(initialUrl);
    });

    it('Should return false if href is the same as replacement url', () => {
      linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
      linkRewriter.anchorReplacementCache_.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: initialUrl},
      ]);

      expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.false;
      expect(anchor1.href).to.equal(initialUrl);
    });

    it('Should replace and return true if the url has been replaced', () => {
      const replacementUrl = 'https://replacementurl.com/';
      linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
      linkRewriter.anchorReplacementCache_.updateReplacementUrls([
        {anchor: anchor1, replacementUrl},
      ]);
      expect(linkRewriter.rewriteAnchorUrl(anchor1)).to.be.true;
      expect(anchor1.href).to.equal(replacementUrl);
    });

    it('Should set the original url attribute', () => {
      const replacementUrl = 'https://replacementurl.com/';
      linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
      linkRewriter.anchorReplacementCache_.updateReplacementUrls([
        {anchor: anchor1, replacementUrl},
      ]);
      linkRewriter.rewriteAnchorUrl(anchor1);

      expect(anchor1.getAttribute(ORIGINAL_URL_ATTRIBUTE)).to.equal(initialUrl);
    });

    it('Should restore the original link after the delay', done => {
      const replacementUrl = 'https://replacementurl.com/';
      linkRewriter.anchorReplacementCache_.updateLinkList([anchor1]);
      linkRewriter.anchorReplacementCache_.updateReplacementUrls([
        {anchor: anchor1, replacementUrl},
      ]);
      linkRewriter.rewriteAnchorUrl(anchor1);

      expect(anchor1.href).to.equal(replacementUrl);
      setTimeout(() => {
        expect(anchor1.href).to.equal(initialUrl);
        done();
      }, linkRewriter.restoreDelay_ + 1);
    });
  });
});

describes.fakeWin('LinkReplacementCache', {amp: true}, env => {
  let rootDocument, cache, anchor1, anchor2, anchor3;

  beforeEach(() => {
    rootDocument = env.ampdoc.getRootNode();
    anchor1 = rootDocument.createElement('a');
    anchor2 = rootDocument.createElement('a');
    anchor3 = rootDocument.createElement('a');
    cache = new LinkReplacementCache();
  });

  describe('When updating the list of anchors', () => {
    it('Should add new anchors in the store', () => {
      cache.updateLinkList([anchor1, anchor2, anchor3]);
      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: null},
        {anchor: anchor2, replacementUrl: null},
        {anchor: anchor3, replacementUrl: null},
      ]);
    });

    it('Should delete anchors removed from the DOM', () => {
      // anchor2 was initially in the DOM
      cache.updateLinkList([anchor1, anchor2, anchor3]);

      // anchor2 does not exist in the DOM anymore
      cache.updateLinkList([anchor1, anchor3]);
      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: null},
        {anchor: anchor3, replacementUrl: null},
      ]);
    });

    it('Should keep pre-existing replacement URL when updating', () => {
      // anchor2 was initially in the DOM
      cache.updateLinkList([anchor1, anchor2, anchor3]);
      cache.replacementList_ = [
        null,
        'https://replaceanchor2.com',
        'http://replaceanchor3.com',
      ];
      // anchor2 does not exist in the DOM anymore
      cache.updateLinkList([anchor1, anchor3]);
      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: null},
        {anchor: anchor3, replacementUrl: 'http://replaceanchor3.com'},
      ]);
    });
  });

  describe('When updating replacement urls', () => {
    beforeEach(() => {
      cache.updateLinkList([anchor1, anchor2, anchor3]);
    });

    it('Should update the replacement urls', () => {
      cache.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: '/new-url2'},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);

      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: '/new-url2'},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);
    });

    it('Should not touched other items of the cache', () => {
      // Intialise with a value
      cache.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: '/new-url2'},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);

      // Partial update to new value.
      cache.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: '/somethingelse'},
      ]);

      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: '/somethingelse'},
        {anchor: anchor2, replacementUrl: '/new-url2'},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);
    });

    it('Should be able to overwrite with null value', () => {
      // Intialise with a value
      cache.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: '/new-url2'},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);

      // Partial update, reset anchor2 to no replacement.
      cache.updateReplacementUrls([{anchor: anchor2, replacementUrl: null}]);

      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: null},
        {anchor: anchor3, replacementUrl: '/new-url3'},
      ]);
    });

    it('Should ignore anchors that are not in the cache', () => {
      const unregisteredAnchor = rootDocument.createElement('a');
      // Intialise with a value
      cache.updateReplacementUrls([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: unregisteredAnchor, replacementUrl: '/test'},
      ]);

      expect(cache.getAnchorReplacementList()).to.deep.equal([
        {anchor: anchor1, replacementUrl: '/new-url1'},
        {anchor: anchor2, replacementUrl: null},
        {anchor: anchor3, replacementUrl: null},
      ]);
    });
  });
});
