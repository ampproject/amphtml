/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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


import {ViewerCidApi} from '../../src/service/viewer-cid-api';
import {mockServiceForDoc} from '../../testing/test-helper';
import {dict} from '../../src/utils/object';

describes.realWin('viewerCidApi', {amp: true}, env => {
  let ampdoc;
  let api;
  let sandbox;
  let viewerMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    sandbox = env.sandbox;
    viewerMock = mockServiceForDoc(sandbox, ampdoc, 'viewer', [
      'sendMessageAwaitResponse',
      'hasCapability',
      'getViewerOrigin',
    ]);

    api = new ViewerCidApi(env.ampdoc);
  });

  describe('getScopedCidFromViewer', () => {
    it('should call Viewer API', () => {
      api.getScopedCidFromViewer('some-scope');
      expect(viewerMock.sendMessageAwaitResponse).to.be.calledWith('cid', dict({
        scope: 'some-scope',
        clientIdApi: true,
      }));
    });
  });

  describe('shouldGetScopedCidFromViewer', () => {
    it('should resolve to true if everything great', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.google.com'));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return expect(api.shouldGetScopedCidFromViewer('AMP_ECID_GOOGLE'))
          .to.eventually.be.true;
    });

    it('should resolve to false if Viewer does not support CID API', () => {
      viewerMock.hasCapability.withArgs('cid').returns(false);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.google.com'));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return expect(api.shouldGetScopedCidFromViewer('AMP_ECID_GOOGLE'))
          .to.eventually.be.false;
    });

    it('should resolve to false if no opt in meta tag', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.google.com'));

      return expect(api.shouldGetScopedCidFromViewer('AMP_ECID_GOOGLE'))
          .to.eventually.be.false;
    });

    it('should resolve to false if Viewer origin not whitelisted', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.amazon.com'));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return expect(api.shouldGetScopedCidFromViewer('AMP_ECID_GOOGLE'))
          .to.eventually.be.false;
    });

    it('should resolve to false if vendor not whitelisted', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.google.com'));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="abodeanalytics">';
      return expect(api.shouldGetScopedCidFromViewer('AMP_ECID_GOOGLE'))
          .to.eventually.be.false;
    });

    it('should resolve to false if scope not whitelisted', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      viewerMock.getViewerOrigin.returns(Promise.resolve('www.google.com'));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return expect(api.shouldGetScopedCidFromViewer('NON_WHITELISTED_SCOPE'))
          .to.eventually.be.false;
    });
  });
});
