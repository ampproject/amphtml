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

import {Messaging} from '../../messaging/messaging';
import {getWinOrigin, serializeQueryString} from '../../../../../src/url';

describes.sandboxed('AmpViewerMessagingIntegration', {}, () => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';

  describe
    .configure()
    .ifChrome()
    .run('Handshake', () => {
      let viewerIframe;
      let iframeOrigin;

      beforeEach(() => {
        const loc = window.location;
        viewerIframe = document.createElement('iframe');
        iframeOrigin = `http://iframe.localhost:${loc.port}`;
        document.body.appendChild(viewerIframe);
      });

      afterEach(() => {
        document.body.removeChild(viewerIframe);
      });

      it('should wait for the handshake', () => {
        const params = serializeQueryString({
          origin: getWinOrigin(window),
        });
        const ampDocUrl = `${iframeOrigin}${ampDocSrc}#${params}`;
        viewerIframe.setAttribute('src', ampDocUrl);

        return Messaging.waitForHandshakeFromDocument(
          window,
          viewerIframe.contentWindow,
          iframeOrigin
        )
          .then((messaging) => {
            messaging.setDefaultHandler(() => Promise.resolve());
            return new Promise((resolve) =>
              messaging.registerHandler('documentLoaded', resolve)
            );
          })
          .then((name) => {
            expect(name).to.equal('documentLoaded');
          });
      });

      it('should work on opaque origin with messaging token', () => {
        const params = serializeQueryString({
          origin: getWinOrigin(window),
          messagingToken: 'test-token',
        });
        const ampDocUrl = `${iframeOrigin}${ampDocSrc}#${params}`;
        viewerIframe.setAttribute('sandbox', 'allow-scripts');
        viewerIframe.setAttribute('src', ampDocUrl);

        return Messaging.waitForHandshakeFromDocument(
          window,
          viewerIframe.contentWindow,
          'null',
          'test-token'
        )
          .then((messaging) => {
            messaging.setDefaultHandler(() => Promise.resolve());
            return new Promise((resolve) =>
              messaging.registerHandler('documentLoaded', resolve)
            );
          })
          .then((name) => {
            expect(name).to.equal('documentLoaded');
          });
      });

      it('should perform polling handshake', function () {
        this.timeout(2000);

        const params = serializeQueryString({
          origin: getWinOrigin(window),
          cap: 'handshakepoll',
        });
        const ampDocUrl = `${iframeOrigin}${ampDocSrc}#${params}`;
        viewerIframe.setAttribute('src', ampDocUrl);

        return Messaging.initiateHandshakeWithDocument(
          viewerIframe.contentWindow
        )
          .then((messaging) => {
            messaging.setDefaultHandler(() => Promise.resolve());
            return new Promise((resolve) =>
              messaging.registerHandler('documentLoaded', resolve)
            );
          })
          .then((name) => {
            expect(name).to.equal('documentLoaded');
          });
      });

      it('should fail if messaging token is wrong', () => {
        const params = serializeQueryString({
          origin: getWinOrigin(window),
          messagingToken: 'foo',
        });
        const ampDocUrl = `${iframeOrigin}${ampDocSrc}#${params}`;
        viewerIframe.setAttribute('src', ampDocUrl);

        return Messaging.waitForHandshakeFromDocument(
          window,
          viewerIframe.contentWindow,
          iframeOrigin,
          'bar'
        ).then((messaging) => {
          const handlerStub = window.sandbox.stub();
          messaging.setDefaultHandler(handlerStub);
          expect(handlerStub).to.not.have.been.called;
        });
      });
    });
});
