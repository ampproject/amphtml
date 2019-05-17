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

import {WebviewViewerForTesting} from '../../viewer-initiated-handshake-viewer-for-testing';

describes.sandboxed('AmpWebviewViewerIntegration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';
  // TODO(aghassemi): Investigate failure in beforeEach. #10974.
  describe.skip('Handshake', function() {
    let viewerEl;
    let viewer;

    beforeEach(() => {
      const loc = window.location;
      const ampDocUrl = `${loc.protocol}//iframe.${loc.hostname}:${
        loc.port
      }${ampDocSrc}`;

      viewerEl = document.createElement('div');
      document.body.appendChild(viewerEl);
      viewer = new WebviewViewerForTesting(viewerEl, '1', ampDocUrl, true);
    });

    afterEach(() => {
      document.body.removeChild(viewerEl);
    });

    it('should confirm the handshake', () => {
      return viewer.waitForHandshakeResponse();
    });

    it('should handle unload correctly', () => {
      viewer.waitForHandshakeResponse().then(() => {
        const stub = sandbox.stub(viewer, 'handleUnload_');
        window.eventListeners.fire({type: 'unload'});
        expect(stub).to.be.calledOnce;
      });
    });
  });
});
