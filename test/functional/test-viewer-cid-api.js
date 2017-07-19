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
      'isTrustedViewer',
    ]);

    api = new ViewerCidApi(env.ampdoc);
  });

  describe('isSupported', () => {
    it('should return true if Viewer has CID capability', () => {
      viewerMock.hasCapability.withArgs('cid').returns(true);
      expect(api.isSupported()).to.be.true;
      expect(viewerMock.hasCapability).to.be.calledWith('cid');
    });

    it('should return false if Viewer has no CID capability', () => {
      viewerMock.hasCapability.withArgs('cid').returns(false);
      expect(api.isSupported()).to.be.false;
      expect(viewerMock.hasCapability).to.be.calledWith('cid');
    });
  });

  describe('getScopedCid', () => {

    function verifyClientIdApiInUse(used) {
      viewerMock.sendMessageAwaitResponse.withArgs('cid', dict({
        scope: 'AMP_ECID_GOOGLE',
        clientIdApi: used,
      })).returns(Promise.resolve('client-id-from-viewer'));
      return expect(api.getScopedCid('AMP_ECID_GOOGLE'))
          .to.eventually.equal('client-id-from-viewer');
    }

    it('should use client ID API from api if everything great', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return verifyClientIdApiInUse(true);
    });

    it('should not use client ID API if no opt in meta tag', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      return verifyClientIdApiInUse(false);
    });

    it('should not use client ID API if Viewer origin not whitelisted', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(false));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      return verifyClientIdApiInUse(false);
    });

    it('should not use client ID API if vendor not whitelisted', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="abodeanalytics">';
      return verifyClientIdApiInUse(false);
    });

    it('should not use client ID API if scope not whitelisted', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      viewerMock.sendMessageAwaitResponse.withArgs('cid', dict({
        scope: 'NON_WHITELISTED_SCOPE',
        clientIdApi: false,
      })).returns(Promise.resolve('client-id-from-viewer'));
      return expect(api.getScopedCid('NON_WHITELISTED_SCOPE'))
          .to.eventually.equal('client-id-from-viewer');
    });

    it('should return undefined if Viewer returns undefined', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      viewerMock.sendMessageAwaitResponse.withArgs('cid', dict({
        scope: 'AMP_ECID_GOOGLE',
        clientIdApi: true,
      })).returns(Promise.resolve());
      return expect(api.getScopedCid('AMP_ECID_GOOGLE'))
          .to.eventually.be.undefined;
    });

    it('should reject if Viewer rejects', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      viewerMock.sendMessageAwaitResponse.withArgs('cid', dict({
        scope: 'AMP_ECID_GOOGLE',
        clientIdApi: true,
      })).returns(Promise.reject('Client API error'));
      return expect(api.getScopedCid('AMP_ECID_GOOGLE'))
          .to.eventually.be.rejectedWith(/Client API error/);
    });
  });
});
