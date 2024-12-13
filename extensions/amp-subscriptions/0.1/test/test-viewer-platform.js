import {Services} from '#service';

import {PageConfig} from '#third_party/subscriptions-project/config';

import {getWinOrigin} from '../../../../src/url';
import {Action, SubscriptionAnalytics} from '../analytics';
import {ENTITLEMENTS_REQUEST_TIMEOUT} from '../constants';
import {Dialog} from '../dialog';
import {Entitlement, GrantReason} from '../entitlement';
import {ServiceAdapter} from '../service-adapter';
import {ViewerSubscriptionPlatform} from '../viewer-subscription-platform';

describes.fakeWin('ViewerSubscriptionPlatform', {amp: true}, (env) => {
  let ampdoc;
  let win;
  let clock;
  let viewerPlatform;
  let serviceAdapter, sendAuthTokenStub;
  let resetPlatformsStub, messageCallback;
  const currentProductId = 'example.org:basic';
  const origin = 'origin';
  const entitlementData = {
    source: 'local',
    raw: 'raw',
    service: 'local',
    products: [currentProductId],
    subscriptionToken: 'token',
  };
  const nonGrantingEntitlementData = {
    source: 'local',
    raw: 'raw',
    service: 'local',
    products: ['example.org:registered_user'],
    subscriptionToken: 'token',
  };
  const fakeAuthToken = {
    'authorization': 'faketoken',
    'decryptedDocumentKey': 'decryptedDocumentKey',
  };
  const authUrl = 'https://subscribe.google.com/subscription/2/entitlements';
  const pingbackUrl = 'https://lipsum.com/login/pingback';
  const actionMap = {
    [Action.SUBSCRIBE]: 'https://lipsum.com/subscribe',
    [Action.LOGIN]: 'https://lipsum.com/login',
  };
  const serviceConfig = {
    'serviceId': 'local',
    'authorizationUrl': authUrl,
    'pingbackUrl': pingbackUrl,
    'actions': actionMap,
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    win = env.win;
    clock = env.sandbox.useFakeTimers();
    serviceAdapter = new ServiceAdapter(null);
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    env.sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    env.sandbox
      .stub(serviceAdapter, 'getPageConfig')
      .callsFake(() => new PageConfig(currentProductId, true));
    env.sandbox
      .stub(serviceAdapter, 'getDialog')
      .callsFake(() => new Dialog(ampdoc));
    env.sandbox
      .stub(serviceAdapter, 'getReaderId')
      .callsFake(() => Promise.resolve('reader1'));
    env.sandbox
      .stub(serviceAdapter, 'getEncryptedDocumentKey')
      .callsFake(() => Promise.resolve(null));
    resetPlatformsStub = env.sandbox.stub(serviceAdapter, 'resetPlatforms');
    env.sandbox
      .stub(Services.viewerForDoc(ampdoc), 'onMessage')
      .callsFake((message, cb) => {
        messageCallback = cb;
      });
    viewerPlatform = new ViewerSubscriptionPlatform(
      ampdoc,
      serviceConfig,
      serviceAdapter,
      origin
    );
    env.sandbox
      .stub(viewerPlatform.viewer_, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve(fakeAuthToken));
    sendAuthTokenStub = env.sandbox.stub(
      viewerPlatform,
      'sendAuthTokenErrorToViewer_'
    );
  });

  describe('getEntitlements', () => {
    it('should call verify() with authorization and decryptedDocKey', async () => {
      const entitlement = {};
      const verifyAuthTokenStub = env.sandbox
        .stub(viewerPlatform, 'verifyAuthToken_')
        .callsFake(() => Promise.resolve(entitlement));

      await viewerPlatform.getEntitlements();
      expect(verifyAuthTokenStub).to.be.calledWith(
        fakeAuthToken['authorization'],
        fakeAuthToken['decryptedDocumentKey']
      );
    });

    it('should send auth rejection message for rejected verification', async () => {
      const reason = 'Payload is expired';
      env.sandbox
        .stub(viewerPlatform, 'verifyAuthToken_')
        .callsFake(() => Promise.reject(new Error(reason)));

      await expect(
        viewerPlatform.getEntitlements()
      ).to.eventually.be.rejectedWith(reason);
      expect(sendAuthTokenStub).to.be.calledWith(reason);
    });

    it('should throw error if one is included with entitlements object', async () => {
      const reason = 'RPC error';

      viewerPlatform.viewer_.sendMessageAwaitResponse.restore();
      env.sandbox
        .stub(viewerPlatform.viewer_, 'sendMessageAwaitResponse')
        .callsFake(() => Promise.resolve({error: {message: reason}}));

      await expect(
        viewerPlatform.getEntitlements()
      ).to.eventually.be.rejectedWith(reason);
    });

    it('should throw error if entitlements request times out', async () => {
      viewerPlatform.viewer_.sendMessageAwaitResponse.restore();
      env.sandbox
        .stub(viewerPlatform.viewer_, 'sendMessageAwaitResponse')
        .callsFake(() => new Promise(() => {}));

      const entitlementsPromise = viewerPlatform.getEntitlements();
      clock.tick(ENTITLEMENTS_REQUEST_TIMEOUT + 1000);
      await expect(entitlementsPromise).to.be.rejectedWith('timeout');
    });

    it('should use domain in cryptokeys param to get encrypted doc key', async () => {
      env.sandbox
        .stub(viewerPlatform.viewer_, 'getParam')
        .withArgs('cryptokeys')
        .returns('test.com,hello.com');
      serviceAdapter.getEncryptedDocumentKey.restore();
      env.sandbox
        .stub(serviceAdapter, 'getEncryptedDocumentKey')
        .withArgs('hello.com')
        .returns('encryptedDocKey');
      viewerPlatform.viewer_.sendMessageAwaitResponse.restore();
      const sendMessageStub = env.sandbox
        .stub(viewerPlatform.viewer_, 'sendMessageAwaitResponse')
        .callsFake(() => Promise.resolve(fakeAuthToken));
      env.sandbox
        .stub(viewerPlatform, 'verifyAuthToken_')
        .callsFake(() => Promise.resolve({}));

      await viewerPlatform.getEntitlements();
      expect(sendMessageStub).to.be.calledWith('auth', {
        'publicationId': 'example.org',
        'productId': 'example.org:basic',
        'origin': 'origin',
        'encryptedDocumentKey': 'encryptedDocKey',
      });
    });
  });

  describe('subscriptionchange message', () => {
    it('should call resetPlatforms() on a subscriptionchange message', () => {
      messageCallback();
      expect(resetPlatformsStub).to.be.called;
    });
  });

  it('Should  allow prerender', () => {
    expect(viewerPlatform.isPrerenderSafe()).to.be.true;
  });

  describe('verifyAuthToken_', () => {
    const entitlement = Entitlement.parseFromJson(entitlementData);
    entitlement.service = 'local';

    it('should reject promise for expired payload', async () => {
      env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
        'aud': getWinOrigin(win),
        'exp': Date.now() / 1000 - 10,
        'entitlements': [entitlementData],
      }));

      await expect(
        viewerPlatform.verifyAuthToken_('faketoken')
      ).to.eventually.be.rejectedWith('Payload is expired​​​');
    });

    it('should reject promise for audience mismatch', async () => {
      env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
        'aud': 'random origin',
        'exp': Math.floor(Date.now() / 1000) + 5 * 60,
        'entitlements': [entitlementData],
      }));

      await expect(
        viewerPlatform.verifyAuthToken_('faketoken')
      ).to.eventually.be.rejectedWith(
        /The mismatching "aud" field: random origin/
      );
    });

    it('should resolve promise with entitlement (single entitlement)', async () => {
      env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
        'aud': getWinOrigin(win),
        'exp': Math.floor(Date.now() / 1000) + 5 * 60,
        'entitlements': entitlementData,
      }));

      const resolvedEntitlement =
        await viewerPlatform.verifyAuthToken_('faketoken');
      expect(resolvedEntitlement).to.be.not.undefined;
      expect(resolvedEntitlement.service).to.equal(entitlementData.service);
      expect(resolvedEntitlement.source).to.equal('viewer');
      expect(resolvedEntitlement.granted).to.be.equal(
        entitlementData.products.indexOf(currentProductId) !== -1
      );
      expect(resolvedEntitlement.grantReason).to.be.equal(
        GrantReason.SUBSCRIBER
      );
      // raw should be the data which was resolved via
      // sendMessageAwaitResponse.
      expect(resolvedEntitlement.raw).to.equal('faketoken');
      expect(resolvedEntitlement.decryptedDocumentKey).to.be.undefined;
    });

    it('should resolve promise with entitlement (array of entitlements)', async () => {
      env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
        'aud': getWinOrigin(win),
        'exp': Math.floor(Date.now() / 1000) + 5 * 60,
        'entitlements': [entitlementData],
      }));

      const resolvedEntitlement =
        await viewerPlatform.verifyAuthToken_('faketoken');
      expect(resolvedEntitlement).to.be.not.undefined;
      expect(resolvedEntitlement.service).to.equal(entitlementData.service);
      expect(resolvedEntitlement.source).to.equal('viewer');
      expect(resolvedEntitlement.granted).to.be.equal(
        entitlementData.products.indexOf(currentProductId) !== -1
      );
      expect(resolvedEntitlement.grantReason).to.be.equal(
        GrantReason.SUBSCRIBER
      );
      // raw should be the data which was resolved via
      // sendMessageAwaitResponse.
      expect(resolvedEntitlement.raw).to.equal('faketoken');
      expect(resolvedEntitlement.decryptedDocumentKey).to.be.undefined;
    });

    it('should resolve promise with entitlement and decryptedDocKey', async () => {
      env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
        'aud': getWinOrigin(win),
        'exp': Math.floor(Date.now() / 1000) + 5 * 60,
        'entitlements': [entitlementData],
      }));

      const resolvedEntitlement = await viewerPlatform.verifyAuthToken_(
        'faketoken',
        'decryptedDocumentKey'
      );
      expect(resolvedEntitlement.decryptedDocumentKey).to.equal(
        'decryptedDocumentKey'
      );
    });

    it(
      'should resolve granted entitlement, with metering in data if ' +
        'viewer only sends metering',
      async () => {
        env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
          'aud': getWinOrigin(win),
          'exp': Math.floor(Date.now() / 1000) + 5 * 60,
          'metering': {
            left: 3,
          },
        }));

        const resolvedEntitlement =
          await viewerPlatform.verifyAuthToken_('faketoken');
        expect(resolvedEntitlement).to.be.not.undefined;
        expect(resolvedEntitlement.service).to.equal('local');
        expect(resolvedEntitlement.granted).to.be.equal(true);
        expect(resolvedEntitlement.grantReason).to.be.equal(
          GrantReason.METERING
        );
        // raw should be the data which was resolved via
        // sendMessageAwaitResponse.
        expect(resolvedEntitlement.data).to.deep.equal({
          left: 3,
        });
      }
    );

    it(
      'should resolve granted entitlement, with metering in data if ' +
        'viewer non granting entitlement and metering',
      async () => {
        env.sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => ({
          'aud': getWinOrigin(win),
          'exp': Math.floor(Date.now() / 1000) + 5 * 60,
          'entitlements': [nonGrantingEntitlementData],
          'metering': {
            left: 3,
          },
        }));

        const resolvedEntitlement =
          await viewerPlatform.verifyAuthToken_('faketoken');
        expect(resolvedEntitlement).to.be.not.undefined;
        expect(resolvedEntitlement.service).to.equal('local');
        expect(resolvedEntitlement.granted).to.be.equal(true);
        expect(resolvedEntitlement.grantReason).to.be.equal(
          GrantReason.METERING
        );
        // raw should be the data which was resolved via
        // sendMessageAwaitResponse.
        expect(resolvedEntitlement.data).to.deep.equal({
          left: 3,
        });
      }
    );
  });

  describe('proxy methods', () => {
    it('should delegate getPlatformKey', () => {
      const proxyStub = env.sandbox.stub(
        viewerPlatform.platform_,
        'getPlatformKey'
      );
      viewerPlatform.getPlatformKey();
      expect(proxyStub).to.be.called;
    });

    it('should delegate isPingbackEnabled', () => {
      const proxyStub = env.sandbox.stub(
        viewerPlatform.platform_,
        'isPingbackEnabled'
      );
      viewerPlatform.isPingbackEnabled();
      expect(proxyStub).to.be.called;
    });

    it('should delegate pingback', () => {
      const proxyStub = env.sandbox.stub(viewerPlatform.platform_, 'pingback');
      viewerPlatform.pingback();
      expect(proxyStub).to.be.called;
    });

    it('should delegate getSupportedScoreFactor', () => {
      const proxyStub = env.sandbox.stub(
        viewerPlatform.platform_,
        'getSupportedScoreFactor'
      );
      viewerPlatform.getSupportedScoreFactor('currentViewer');
      expect(proxyStub).to.be.called;
    });
  });
});
