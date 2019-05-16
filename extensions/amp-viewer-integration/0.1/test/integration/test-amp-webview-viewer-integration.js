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

import {AmpViewerIntegration} from '../../amp-viewer-integration';
import {WebviewViewerForTesting} from '../../webview-viewer-for-testing.js';

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
      return viewer.waitForHandshakeResponse();
    });

    afterEach(() => {
      document.body.removeChild(viewerEl);
    });

    it('should confirm the handshake', () => {
      console /*OK*/
        .log('sending handshake response');
      return viewer.waitForDocumentLoaded();
    });

    it('should handle unload correctly', () => {
      viewer.waitForDocumentLoaded().then(() => {
        const stub = sandbox.stub(viewer, 'handleUnload_');
        window.eventListeners.fire({type: 'unload'});
        expect(stub).to.be.calledOnce;
      });
    });
  });

  describes.fakeWin(
    'webview window init',
    {
      amp: {
        params: {
          webview: '1',
          origin: null,
        },
      },
    },
    env => {
      let integr;

      beforeEach(() => {
        integr = new AmpViewerIntegration(env.win);
      });

      it('should set source and origin for webview', () => {
        const stub = sandbox
          .stub(integr, 'webviewPreHandshakePromise_')
          .callsFake(() => new Promise(() => {}));
        integr.init();
        expect(stub).to.be.calledWith(/* source */ null, /* origin */ '');
      });
    }
  );
});
