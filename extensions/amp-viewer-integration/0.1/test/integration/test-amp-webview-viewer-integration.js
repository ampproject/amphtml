import {AmpViewerIntegration} from '../../amp-viewer-integration';
import {WebviewViewerForTesting} from '../../webview-viewer-for-testing';

describes.sandboxed('AmpWebviewViewerIntegration', {}, (env) => {
  const ampDocSrc = '/test/fixtures/served/ampdoc-with-messaging.html';
  // TODO(aghassemi): Investigate failure in beforeEach. #10974.
  describe.skip('Handshake', function () {
    let viewerEl;
    let viewer;

    beforeEach(() => {
      const loc = window.location;
      const ampDocUrl = `${loc.protocol}//iframe.${loc.hostname}:${loc.port}${ampDocSrc}`;

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
      return viewer.waitForDocumentLoaded().then(() => {
        const stub = env.sandbox.stub(viewer, 'handleUnload_');
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
    (env) => {
      let integr;

      beforeEach(() => {
        env.sandbox.useFakeTimers();
        integr = new AmpViewerIntegration(env.win);
      });

      it('should set source and origin for webview', () => {
        const stub = env.sandbox
          .stub(integr, 'webviewPreHandshakePromise_')
          .callsFake(() => new Promise(() => {}));
        integr.init();
        expect(stub).to.be.calledWith(/* source */ null, /* origin */ '');
      });
    }
  );
});
