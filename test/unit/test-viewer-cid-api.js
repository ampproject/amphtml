import {ViewerCidApi} from '#service/viewer-cid-api';

import {mockServiceForDoc} from '#testing/helpers/service';

describes.realWin('viewerCidApi', {amp: true}, (env) => {
  let ampdoc;
  let api;
  let viewerMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    viewerMock = mockServiceForDoc(env.sandbox, ampdoc, 'viewer', [
      'sendMessageAwaitResponse',
      'hasCapability',
      'isTrustedViewer',
    ]);

    api = new ViewerCidApi(env.ampdoc);
  });

  describe('isSupported', () => {
    it('should return true if Viewer is trusted and has CID capability', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));
      viewerMock.hasCapability.withArgs('cid').returns(true);
      return expect(api.isSupported()).to.eventually.be.true;
    });

    it('should return false if Viewer has no CID capability', () => {
      viewerMock.isTrustedViewer.returns(new Promise(() => {}));
      viewerMock.hasCapability.withArgs('cid').returns(false);
      return expect(api.isSupported()).to.eventually.be.false;
    });

    it('should return false if Viewer is not trusted', () => {
      viewerMock.isTrustedViewer.returns(Promise.resolve(false));
      viewerMock.hasCapability.withArgs('cid').returns(true);
      return expect(api.isSupported()).to.eventually.be.false;
    });
  });

  describe('getScopedCid', () => {
    function verifyClientIdApiInUse(used) {
      viewerMock.sendMessageAwaitResponse.returns(
        Promise.resolve('client-id-from-viewer')
      );
      return api
        .getScopedCid(used ? 'api-key' : undefined, 'AMP_ECID_GOOGLE')
        .then((cid) => {
          expect(cid).to.equal('client-id-from-viewer');
          const payload = {
            'scope': 'AMP_ECID_GOOGLE',
            'clientIdApi': used,
            'canonicalOrigin': 'http://localhost:9876',
          };
          if (used) {
            payload['apiKey'] = 'api-key';
          }
          expect(viewerMock.sendMessageAwaitResponse).to.be.calledWith(
            'cid',
            payload
          );
        });
    }

    it('should use client ID API from api if everything great', () => {
      return verifyClientIdApiInUse(true);
    });

    it('should not use client ID API if no opt in meta tag', () => {
      return verifyClientIdApiInUse(false);
    });

    it('should not use client ID API if scope not allowlisted', () => {
      viewerMock.sendMessageAwaitResponse
        .withArgs('cid', {
          'scope': 'NON_ALLOWLISTED_SCOPE',
          'clientIdApi': false,
          'canonicalOrigin': 'http://localhost:9876',
        })
        .returns(Promise.resolve('client-id-from-viewer'));
      return expect(
        api.getScopedCid(undefined, 'NON_ALLOWLISTED_SCOPE')
      ).to.eventually.equal('client-id-from-viewer');
    });

    it('should return undefined if Viewer returns undefined', () => {
      viewerMock.sendMessageAwaitResponse.returns(Promise.resolve());
      return expect(api.getScopedCid('api-key', 'AMP_ECID_GOOGLE')).to
        .eventually.be.undefined;
    });

    it('should reject if Viewer rejects', () => {
      viewerMock.sendMessageAwaitResponse.returns(
        Promise.reject('Client API error')
      );
      return expect(
        api.getScopedCid('api-key', 'AMP_ECID_GOOGLE')
      ).to.eventually.be.rejectedWith(/Client API error/);
    });
  });
});
