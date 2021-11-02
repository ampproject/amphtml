import {getWinOrigin, serializeQueryString} from '../../../../../src/url';
import {Messaging} from '../../messaging/messaging';

describes.sandboxed('AmpViewerMessagingIntegration', {}, (env) => {
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
          const handlerStub = env.sandbox.stub();
          messaging.setDefaultHandler(handlerStub);
          expect(handlerStub).to.not.have.been.called;
        });
      });
    });
});
