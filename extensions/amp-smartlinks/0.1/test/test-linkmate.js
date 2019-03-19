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
import {AmpSmartlinks} from '../amp-smartlinks';
import {Linkmate} from '../linkmate';
import {Services} from '../../../../src/services';
import {TwoStepsResponse} from
  '../../../amp-skimlinks/0.1/link-rewriter/two-steps-response';

const helpersFactory = env => {
  const {win} = env;

  return {
    createAmpSmartlinks(extensionAttrs) {
      const ampTag = document.createElement('amp-smartlinks');

      for (const attr in extensionAttrs) {
        ampTag.setAttribute(attr, extensionAttrs[attr]);
      }
      ampTag.getAmpDoc = () => env.ampdoc;

      return new AmpSmartlinks(ampTag);
    },
    createAnchor(href) {
      const anchor = win.document.createElement('a');
      anchor.href = href;

      return anchor;
    },
  };
};

describes.fakeWin('amp-smartlinks',
    {amp: {extensions: ['amp-smartlinks']}},
    env => {
      let helpers, xhr, linkmate;

      beforeEach(() => {
        xhr = Services.xhrFor(env.win);
        helpers = helpersFactory(env);
      });

      beforeEach(() => {
        env.sandbox
            .stub(DocumentReady, 'whenDocumentReady')
            .returns(Promise.reject());
      });

      afterEach(() => {
        env.sandbox.restore();
      });

      describe('runLinkmate', () => {
        let anchorList, mockFetch, response;

        beforeEach(() => {
          const linkmateOptions = {
            exclusiveLinks: false,
            publisherID: 999,
            linkAttribute: 'href',
          };
          linkmate = new Linkmate(
              env.ampdoc,
              xhr,
              linkmateOptions,
          );
          anchorList = [
            'http://fakelink.example',
            'http://fakelink2.example',
            'https://examplelocklink.example/#locklink',
          ].map(helpers.createAnchor);
        });

        beforeEach(() => {
          mockFetch = env.sandbox.mock(xhr);

          response = {
            json: () => Promise.resolve({}),
          };
        });

        afterEach(() => {
          mockFetch.verify();
        });

        it('Should fire an API call if none exists', () => {
          env.sandbox.spy(linkmate, 'postToLinkmate_');
          env.sandbox.stub(linkmate, 'mapLinks_');

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));

          const linkmateResponse = linkmate.runLinkmate(anchorList);

          expect(linkmate.postToLinkmate_.calledOnce).to.be.true;
          expect(linkmateResponse).to.be.instanceof(TwoStepsResponse);
        });

        it('Should fire an API call if anchorList changed', () => {
          env.sandbox.spy(linkmate, 'postToLinkmate_');
          env.sandbox.stub(linkmate, 'mapLinks_');

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          const linkmateResponse = linkmate.runLinkmate(anchorList);

          linkmate.anchorList_ = anchorList;
          const newAnchorList = [
            'http://totallynewlink.example',
            'http://fakelink2.example',
            'https://examplelocklink.example/#locklink',
          ].map(helpers.createAnchor);

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          const linkmateResponse2 = linkmate.runLinkmate(newAnchorList);

          expect(linkmate.postToLinkmate_.calledTwice).to.be.true;
          expect(linkmateResponse).to.be.instanceof(TwoStepsResponse);
          expect(linkmateResponse2).to.be.instanceof(TwoStepsResponse);
        });

        it('Should map new anchors', () => {
          env.sandbox.spy(linkmate, 'postToLinkmate_');
          env.sandbox.spy(linkmate, 'mapLinks_');

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          const linkmateResponse = linkmate.runLinkmate(anchorList);

          linkmate.anchorList_ = anchorList;
          linkmate.linkmateResponse_ = [{a: 'b'}];
          const newAnchorList = [
            'http://totallynewlink.example',
            'http://fakelink2.example',
            'https://examplelocklink.example/#locklink',
          ].map(helpers.createAnchor);

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          const linkmateResponse2 = linkmate.runLinkmate(newAnchorList);

          expect(linkmate.postToLinkmate_.calledTwice).to.be.true;
          expect(linkmate.mapLinks_.calledOnce).to.be.true;
          expect(linkmateResponse).to.be.instanceof(TwoStepsResponse);
          expect(linkmateResponse2).to.be.instanceof(TwoStepsResponse);
        });

        it('Should do nothing if no new anchors', () => {
          env.sandbox.spy(linkmate, 'postToLinkmate_');
          env.sandbox.stub(linkmate, 'mapLinks_');

          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          const linkmateResponse = linkmate.runLinkmate(anchorList);

          linkmate.anchorList_ = anchorList;
          linkmate.linkmateResponse_ = [{a: 'b'}];
          const syncResponse = linkmate.runLinkmate(anchorList);

          expect(linkmate.postToLinkmate_.calledOnce).to.be.true;
          expect(linkmate.postToLinkmate_.calledTwice).to.be.false;
          expect(syncResponse).to.not.be.null;
          expect(linkmateResponse).to.be.instanceof(TwoStepsResponse);
        });
      });

      describe('postToLinkmate_', () => {
        let mockFetch;

        beforeEach(() => {
          mockFetch = env.sandbox.mock(xhr);
        });

        afterEach(() => {
          mockFetch.verify();
        });

        it('Should build payload', () => {
          const linkmateOptions = {
            exclusiveLinks: false,
            publisherID: 999,
            linkAttribute: 'href',
          };
          linkmate = new Linkmate(
              env.ampdoc,
              xhr,
              linkmateOptions,
          );
          const response = {
            json: () => Promise.resolve({}),
          };

          env.sandbox.spy(linkmate, 'postToLinkmate_');
          env.sandbox
              .stub(linkmate, 'buildLinksPayload_')
              .returns({});
          env.sandbox
              .stub(linkmate, 'getEditInfo_')
              .returns({});
          mockFetch
              .expects('fetchJson')
              .once()
              .returns(Promise.resolve(response));
          linkmate.postToLinkmate_();

          expect(linkmate.buildLinksPayload_.calledOnce).to.be.true;
          expect(linkmate.getEditInfo_.calledOnce).to.be.true;
        });
      });

      describe('buildLinksPayload_', () => {
        let anchorList;

        beforeEach(() => {
          const linkmateOptions = {
            exclusiveLinks: false,
            publisherID: 999,
            linkAttribute: 'href',
          };
          linkmate = new Linkmate(
              env.ampdoc,
              xhr,
              linkmateOptions,
          );

          anchorList = [
            'http://fakelink.example',
            'http://fakelink2.example',
            'https://examplelocklink.example/#locklink',
          ].map(helpers.createAnchor);
        });

        it('Should build payload from anchorList', () => {
          env.sandbox.spy(linkmate, 'buildLinksPayload_');

          const expectedPayload = [{
            'raw_url': 'http://fakelink.example/',
            'exclusive_match_requested': false,
          }, {
            'raw_url': 'http://fakelink2.example/',
            'exclusive_match_requested': false,
          }, {
            'raw_url': 'https://examplelocklink.example/#locklink',
            'exclusive_match_requested': true,
          }];

          const linkPayload = linkmate.buildLinksPayload_(anchorList);

          expect(linkPayload).to.deep.equal(expectedPayload);
        });

        it('Should build all exclusive links if requested', () => {
          env.sandbox.spy(linkmate, 'buildLinksPayload_');

          linkmate.requestExclusiveLinks_ = true;
          const expectedPayload = [{
            'raw_url': 'http://fakelink.example/',
            'exclusive_match_requested': true,
          }, {
            'raw_url': 'http://fakelink2.example/',
            'exclusive_match_requested': true,
          }, {
            'raw_url': 'https://examplelocklink.example/#locklink',
            'exclusive_match_requested': true,
          }];

          const linkPayload = linkmate.buildLinksPayload_(anchorList);

          expect(linkPayload).to.deep.equal(expectedPayload);
        });

        it('Should skip existing shop-links', () => {
          env.sandbox.spy(linkmate, 'buildLinksPayload_');

          anchorList = [
            'http://fakelink.example',
            'http://http://shop-links.co/999',
            'https://examplelocklink.example/#locklink',
          ].map(helpers.createAnchor);

          const expectedPayload = [{
            'raw_url': 'http://fakelink.example/',
            'exclusive_match_requested': false,
          }, {
            'raw_url': 'https://examplelocklink.example/#locklink',
            'exclusive_match_requested': true,
          }];

          const linkPayload = linkmate.buildLinksPayload_(anchorList);

          expect(linkPayload).to.deep.equal(expectedPayload);
        });

        it('Should add amp flag to existing shop-links', () => {
          env.sandbox.spy(linkmate, 'buildLinksPayload_');

          anchorList = [
            'http://http://shop-links.co/999',
          ].map(helpers.createAnchor);

          const expectedAnchor = 'http://http//shop-links.co/999?amp=true';

          const linkPayload = linkmate.buildLinksPayload_(anchorList);

          expect(linkPayload).to.deep.equal([]);
          expect(anchorList[0].href).to.equal(expectedAnchor);
        });
      });

      describe('getEditInfo_', () => {
        it('Should build edit info payload', () => {
          const linkmateOptions = {
            exclusiveLinks: false,
            publisherID: 999,
            linkAttribute: 'href',
          };
          linkmate = new Linkmate(
              env.ampdoc,
              xhr,
              linkmateOptions,
          );
          const envRoot = env.ampdoc.getRootNode();
          envRoot.title = 'Fake Website Title';

          env.sandbox
              .stub(env.ampdoc, 'getUrl')
              .returns('http://fakewebsite.example/');
          env.sandbox.spy(linkmate, 'getEditInfo_');

          const expectedPayload = {
            'name': 'Fake Website Title',
            'url': 'http://fakewebsite.example/',
          };

          const editPayload = linkmate.getEditInfo_();

          expect(editPayload).to.deep.equal(expectedPayload);
        });
      });

      describe('mapLinks_', () => {
        let anchorList;

        beforeEach(() => {
          const linkmateOptions = {
            exclusiveLinks: false,
            publisherID: 999,
            linkAttribute: 'href',
          };
          linkmate = new Linkmate(
              env.ampdoc,
              xhr,
              linkmateOptions,
          );

          anchorList = [
            'http://fakelink.example/',
            'http://fakelink2.example/',
            'http://fakelink2.example/',
            'https://nonmonetizedlink.example/',
          ].map(helpers.createAnchor);
        });

        it('Should map API response to anchorList', () => {
          env.sandbox.spy(linkmate, 'mapLinks_');
          const linkmateResponse = [{
            'auction_id': '1661245605416735203',
            'exclusive_match_requested': false,
            'pub_id': 999,
            'url': 'http://fakelink.example/',
          }, {
            'auction_id': '1667546956215651271',
            'exclusive_match_requested': false,
            'pub_id': 999,
            'url': 'http://fakelink2.example/',
          }];
          linkmate.anchorList_ = anchorList;
          linkmate.linkmateResponse_ = linkmateResponse;

          const expectedMapping = [{
            anchor: anchorList[0],
            replacementUrl: `https://shop-links.co/${linkmateResponse[0]['auction_id']}/?amp=true`,
          }, {
            anchor: anchorList[1],
            replacementUrl: `https://shop-links.co/${linkmateResponse[1]['auction_id']}/?amp=true`,
          }, {
            anchor: anchorList[2],
            replacementUrl: `https://shop-links.co/${linkmateResponse[1]['auction_id']}/?amp=true`,
          }];

          const actualMapping = linkmate.mapLinks_();

          expect(actualMapping).to.deep.equal(expectedMapping);
        });
      });
    }
);
