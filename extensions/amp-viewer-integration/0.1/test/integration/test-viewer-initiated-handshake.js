import {WebviewViewerForTesting} from '../../viewer-initiated-handshake-viewer-for-testing';

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
    });

    afterEach(() => {
      document.body.removeChild(viewerEl);
    });

    it('should confirm the handshake', () => {
      return viewer.waitForHandshakeResponse();
    });

    it('should handle unload correctly', () => {
      viewer.waitForHandshakeResponse().then(() => {
        const stub = env.sandbox.stub(viewer, 'handleUnload_');
        window.eventListeners.fire({type: 'unload'});
        expect(stub).to.be.calledOnce;
      });
    });
  });
});
