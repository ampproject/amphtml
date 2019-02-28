/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as DocumentReady from '../../../../src/document-ready';
import * as LinkmateOptions from '../linkmate-options';
import {AmpSmartlinks} from '../amp-smartlinks';
import {LinkRewriterManager} from
  '../../../amp-skimlinks/0.1/link-rewriter/link-rewriter-manager';
import {Services} from '../../../../src/services';

const helpersFactory = env => {
  return {
    createAmpSmartlinks(extensionAttrs) {
      const ampTag = document.createElement('amp-smartlinks');

      for (const attr in extensionAttrs) {
        ampTag.setAttribute(attr, extensionAttrs[attr]);
      }
      ampTag.getAmpDoc = () => env.ampdoc;
      return new AmpSmartlinks(ampTag);
    },
  };
};

describes.fakeWin('amp-smartlinks',
    {amp: {extensions: ['amp-smartlinks']}},
    env => {
      let ampSmartlinks, helpers, xhr;

      beforeEach(() => {
        xhr = Services.xhrFor(env.win);
        helpers = helpersFactory(env);
        env.sandbox
            .stub(DocumentReady, 'whenDocumentReady')
            .returns(Promise.reject());
      });

      afterEach(() => {
        env.sandbox.restore();
      });

      describe('getConfigOptions', () => {
        it('Should parse options', () => {
          env.sandbox.spy(LinkmateOptions, 'getConfigOptions');

          const smartlinkOptions = {
            'nrtv-account-name': 'thisisnotapublisher',
            'linkmate': '',
            'exclusive-links': '',
            'link-attribute': 'href',
            'link-selector': 'a',
          };
          ampSmartlinks = helpers.createAmpSmartlinks(smartlinkOptions);
          env.sandbox.stub(ampSmartlinks, 'runSmartlinks_');

          return ampSmartlinks.buildCallback().then(() => {
            expect(LinkmateOptions.getConfigOptions.calledOnce).to.be
                .true;
            expect(ampSmartlinks.linkmateOptions_).to.deep.equal({
              nrtvSlug: smartlinkOptions['nrtv-account-name'],
              linkmateEnabled: true,
              exclusiveLinks: true,
              linkAttribute: smartlinkOptions['link-attribute'],
              linkSelector: smartlinkOptions['link-selector'],
            });
          });
        });

        it('Should return handle bad options', () => {
          env.sandbox.spy(LinkmateOptions, 'getConfigOptions');

          const smartlinkOptions = {
            'nrtv-account-name': 'alwaysastring',
            'linkmate': 1234,
            'exclusive-links': 'monkeysatatypewriter',
          };
          ampSmartlinks = helpers.createAmpSmartlinks(smartlinkOptions);
          env.sandbox.stub(ampSmartlinks, 'runSmartlinks_');

          return ampSmartlinks.buildCallback().then(() => {
            expect(LinkmateOptions.getConfigOptions.calledOnce).to.be.true;
            expect(ampSmartlinks.linkmateOptions_).to.deep.equal({
              nrtvSlug: 'alwaysastring',
              linkmateEnabled: true,
              exclusiveLinks: true,
              linkAttribute: 'href',
              linkSelector: 'a',
            });
          });
        });
      });

      describe('getLinkmateOptions_', () => {
        it('Should fetch Linkmate Options from API', () => {
          const options = {
            'nrtv-account-name': 'testingconfigpub',
            'linkmate': '',
            'exclusive-links': '',
          };
          ampSmartlinks = helpers.createAmpSmartlinks(options);

          env.sandbox.spy(ampSmartlinks, 'getLinkmateOptions_');
          env.sandbox.stub(xhr, 'fetchJson');

          return ampSmartlinks.buildCallback().then(() => {
            expect(ampSmartlinks.getLinkmateOptions_.calledOnce).to.be.true;
          });
        });
      });

      describe('runSmartlinks_', () => {
        let fakeViewer;

        beforeEach(() => {
          const options = {
            'nrtv-account-name': 'thisisnotapublisher',
            'linkmate': '',
            'exclusive-links': '',
          };

          ampSmartlinks = helpers.createAmpSmartlinks(options);
          fakeViewer = Services.viewerForDoc(env.ampdoc);

          env.sandbox
              .stub(ampSmartlinks, 'getLinkmateOptions_')
              .returns(Promise.resolve({'publisher_id': 999}));
          env.sandbox.stub(xhr, 'fetchJson');
        });

        it('Should call postPageImpression_', () => {
          env.sandbox.spy(ampSmartlinks, 'postPageImpression_');

          return ampSmartlinks.buildCallback().then(() => {
            fakeViewer.whenFirstVisible().then(() => {
              expect(ampSmartlinks.postPageImpression_.calledOnce).to.be.true;
            });
          });
        });

        it('Should call initLinkRewriter_', () => {
          env.sandbox.spy(ampSmartlinks, 'initLinkRewriter_');

          return ampSmartlinks.buildCallback().then(() => {
            fakeViewer.whenFirstVisible().then(() => {
              expect(ampSmartlinks.initLinkRewriter_.calledOnce).to.be.true;
            });
          });
        });
      });

      describe('buildPageImpressionPayload_', () => {
        beforeEach(() => {
          const options = {
            'nrtv-account-name': 'thisisnotapublisher',
            'linkmate': '',
            'exclusive-links': '',
          };

          ampSmartlinks = helpers.createAmpSmartlinks(options);
        });

        it('Should build body correctly', () => {
          env.sandbox.spy(ampSmartlinks, 'buildPageImpressionPayload_');
          env.sandbox.stub(ampSmartlinks, 'postPageImpression_');
          env.sandbox
              .stub(ampSmartlinks, 'generateUUID_')
              .returns('acbacc4b-e171-4869-b32a-921f48659624');
          env.sandbox
              .stub(env.ampdoc, 'getUrl')
              .returns('http://fakewebsite.example/');

          const mockPub = 999;
          const mockUA = 'thisisnotauseragent';
          const expectedPayload = {
            'events': [{'is_amp': true}],
            'organization_id': mockPub,
            'organization_type': 'publisher',
            'user': {
              'page_session_uuid': 'acbacc4b-e171-4869-b32a-921f48659624',
              'source_url': 'http://fakewebsite.example/',
              'previous_url': '',
              'user_agent': mockUA,
            },
          };

          return ampSmartlinks.buildCallback().then(() => {
            ampSmartlinks.linkmateOptions_.publisherID = mockPub;
            ampSmartlinks.ampDoc_.win.navigator.userAgent = mockUA;

            const payload = ampSmartlinks.buildPageImpressionPayload_();
            expect(payload).to.deep.equals(expectedPayload);
          });
        });
      });

      describe('initSmartlinkRewriter_', () => {
        beforeEach(() => {
          const options = {
            'nrtv-account-name': 'thisisnotapublisher',
            'linkmate': '',
            'exclusive-links': '',
          };

          ampSmartlinks = helpers.createAmpSmartlinks(options);
          env.sandbox
              .stub(ampSmartlinks, 'getLinkmateOptions_')
              .returns(Promise.resolve({'publisher_id': 999}));
        });

        it('Should register link rewriter', () => {
          ampSmartlinks.linkRewriterService_ = new LinkRewriterManager(
              env.ampdoc
          );
          ampSmartlinks.linkmateOptions_ = {
            linkSelector: 'a',
          };
          env.sandbox.spy(ampSmartlinks.linkRewriterService_,
              'registerLinkRewriter');

          ampSmartlinks.initLinkRewriter_();
          const args = ampSmartlinks.linkRewriterService_.registerLinkRewriter
              .args[0];

          expect(ampSmartlinks.linkRewriterService_.registerLinkRewriter
              .calledOnce).to.be.true;
          // This is a constant value in amp-smartlinks.js
          expect(args[0]).to.equal('amp-smartlinks');
          expect(args[1]).to.be.a('function');
          expect(args[2].linkSelector).to.equal('a');
        });
      });
    }
);
