import {expect} from 'chai';

import {WindowInterface} from '#core/window/interface';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {PageConfig} from '#third_party/subscriptions-project/config';
import {
  ConfiguredRuntime,
  Entitlements,
  SubscribeResponse,
  Entitlement as SwgEntitlement,
} from '#third_party/subscriptions-project/swg';
import {GaaMeteringRegwall} from '#third_party/subscriptions-project/swg-gaa';

import {
  Action,
  ActionStatus,
  SubscriptionAnalytics,
} from '../../../amp-subscriptions/0.1/analytics';
import {SubscriptionsScoreFactor} from '../../../amp-subscriptions/0.1/constants';
import {
  Entitlement,
  GrantReason,
} from '../../../amp-subscriptions/0.1/entitlement';
import {ServiceAdapter} from '../../../amp-subscriptions/0.1/service-adapter';
import {
  AmpFetcher,
  GoogleSubscriptionsPlatform,
} from '../amp-subscriptions-google';

const PLATFORM_ID = 'subscribe.google.com';
const AMP_URL = 'myAMPurl.amp';

describes.realWin('AmpFetcher', {amp: true}, (env) => {
  let fetcher;
  let xhr;

  const sentUrl = 'url';
  const sentArray = [
    'embed',
    'tx',
    'refer',
    'utmS',
    'utmC',
    'utmM',
    'sku',
    true,
    ['exp1', 'exp2'],
    'version',
    'baseUrl',
  ];
  const sentMessage = {
    toArray: function () {
      return sentArray;
    },
  };
  const contentType = 'application/x-www-form-urlencoded;charset=UTF-8';
  const expectedBodyString = 'f.req=' + JSON.stringify(sentArray);

  beforeEach(() => {
    const {win} = env.ampdoc;
    fetcher = new AmpFetcher(win);
    xhr = Services.xhrFor(win);
  });

  it('should support beacon when beacon supported', async () => {
    const expectedBlob = new Blob([expectedBodyString], {type: contentType});
    env.sandbox.stub(WindowInterface, 'getSendBeacon').callsFake(() => {
      return (url, body) => {
        expect(url).to.equal(sentUrl);
        expect(body).to.deep.equal(expectedBlob);
      };
    });
    fetcher.sendBeacon(sentUrl, sentMessage);
  });

  it('should support beacon when beacon not supported', async () => {
    env.sandbox.stub(WindowInterface, 'getSendBeacon').callsFake(() => null);
    env.sandbox.stub(xhr, 'fetch').callsFake((url, init) => {
      expect(url).to.equal(sentUrl);
      expect(init).to.deep.equal({
        method: 'POST',
        headers: {'Content-Type': contentType},
        credentials: 'include',
        body: expectedBodyString,
      });
    });

    fetcher.sendBeacon(sentUrl, sentMessage);
  });
});

describes.realWin('amp-subscriptions-google', {amp: true}, (env) => {
  let ampdoc;
  let pageConfig;
  let platform;
  let serviceAdapter;
  let serviceAdapterMock;
  let getEncryptedDocumentKeyStub;
  let analyticsMock;
  let viewer;
  let xhr;
  let callbacks;
  let methods;
  let ackStub;
  let element;
  let entitlementResponse;
  let rtcButtonElement;
  let win;
  let subscriptionService;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    element = env.win.document.createElement('script');
    element.id = 'amp-subscriptions';
    env.win.document.head.appendChild(element);
    env.sandbox.stub(ampdoc, 'getUrl').callsFake(() => AMP_URL);
    pageConfig = new PageConfig('example.org:basic', true);
    xhr = Services.xhrFor(env.win);
    viewer = Services.viewerForDoc(ampdoc);
    ampdoc.params_['viewerUrl'] = 'https://www.google.com/other';
    subscriptionService = {};
    serviceAdapter = new ServiceAdapter(subscriptionService);
    serviceAdapterMock = env.sandbox.mock(serviceAdapter);
    env.sandbox
      .stub(serviceAdapter, 'getPageConfig')
      .callsFake(() => pageConfig);
    env.sandbox
      .stub(serviceAdapter, 'getReaderId')
      .callsFake(() => Promise.resolve('ari1'));
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    env.sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    analyticsMock = env.sandbox.mock(analytics);
    getEncryptedDocumentKeyStub = env.sandbox
      .stub(serviceAdapter, 'getEncryptedDocumentKey')
      .callsFake(() => {
        return null;
      });
    entitlementResponse = {
      source: 'google',
      products: ['example.org:basic'],
      subscriptionToken: 'tok1',
    };
    callbacks = {
      loginRequest: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnLoginRequest'
      ),
      linkComplete: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnLinkComplete'
      ),
      flowStarted: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnFlowStarted'
      ),
      flowCanceled: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnFlowCanceled'
      ),
      subscribeRequest: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnNativeSubscribeRequest'
      ),
      subscribeResponse: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'setOnPaymentResponse'
      ),
    };
    methods = {
      reset: env.sandbox.stub(ConfiguredRuntime.prototype, 'reset'),
      showContributionOptions: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'showContributionOptions'
      ),
      subscribe: env.sandbox.stub(ConfiguredRuntime.prototype, 'subscribe'),
      showOffers: env.sandbox.stub(ConfiguredRuntime.prototype, 'showOffers'),
      showAbbrvOffer: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'showAbbrvOffer'
      ),
      linkAccount: env.sandbox.stub(ConfiguredRuntime.prototype, 'linkAccount'),
      consumeShowcaseEntitlementJwt: env.sandbox.stub(
        ConfiguredRuntime.prototype,
        'consumeShowcaseEntitlementJwt'
      ),
    };
    ackStub = env.sandbox.stub(Entitlements.prototype, 'ack');
    toggleExperiment(win, 'swg-gpay-api', true);
    toggleExperiment(win, 'nonswgexp', true);
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
  });

  afterEach(() => {
    serviceAdapterMock.verify();
    analyticsMock.verify();
    toggleExperiment(win, 'swg-gpay-api', false);
  });

  /** Awaits N times. Allows promises to resolve. */
  async function flush(n = 100) {
    for (let i = 0; i < n; i++) {
      await 'tick';
    }
  }

  function callback(stub) {
    return stub.args[0][0];
  }

  it('should set the current URL in analytics', () => {
    const swgAnalytics = platform.runtime_.analytics();
    expect(swgAnalytics.getContext().getUrl()).to.equal(AMP_URL);
  });

  it('should reset runtime on platform reset', () => {
    expect(methods.reset).to.not.be.called;
    platform.reset();
    expect(methods.reset).to.be.calledOnce.calledWithExactly();
  });

  it('should listen on callbacks', () => {
    expect(callbacks.loginRequest).to.be.calledOnce;
  });

  it('should scope the runtime to one ampdoc', () => {
    expect(platform.runtime_.doc_.ampdoc_).to.equal(ampdoc);
  });

  it('should propagate experiment', () => {
    expect(platform.runtime_.payClient_.getType()).to.equal('PAYJS');
    expect(platform.runtime_.config()['experiments']).to.have.members([
      'gpay-api',
    ]);
  });

  it('should throw if enableLAA and enableMetering are set', () => {
    expect(
      () =>
        new GoogleSubscriptionsPlatform(
          ampdoc,
          {enableLAA: true, enableMetering: true},
          serviceAdapter
        )
    ).to.throw(/enableLAA and enableMetering are mutually exclusive/);
  });

  it('should check the fragment for GAA params first', () => {
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true},
      serviceAdapter
    );
    ampdoc.win.location.hash = 'gaa_at=la&gaa_sig=fromhash&gaa_n=123456';

    const parsedParams = platform.getUrlParams_();

    expect(parsedParams).to.eql({
      'gaa_at': 'la',
      'gaa_sig': 'fromhash',
      'gaa_n': '123456',
    });
  });

  it('should ignore the fragment if does not have have gaa_n', () => {
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true},
      serviceAdapter
    );
    ampdoc.win.location.hash = 'somthing=not_from_ga';

    const parsedParams = platform.getUrlParams_();

    expect(parsedParams).to.not.eql({
      'something': 'not_from_gaa',
    });
  });

  it('should ignore enableLAA and fallback if url params are missing', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://localhost'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true},
      serviceAdapter
    );
    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    await platform.getEntitlements();
    expect(fetchStub).to.be.calledOnce;
  });

  it('should ignore enableLAA and not fallback if url params are missing and enableEntitlements is false', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://localhost'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true, enableEntitlements: false},
      serviceAdapter
    );
    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    await platform.getEntitlements();
    expect(fetchStub).to.not.be.called;
  });

  it('should ignore enableLAA if url params have expired', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://localhost'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true},
      serviceAdapter
    );

    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 - 10).toString(16),
      'gaa_at': 'la',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });

    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );
    await platform.getEntitlements();
    expect(fetchStub).to.be.calledOnce;
  });

  it('should return LAA if url params present and are in timestamp', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://localhost'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true},
      serviceAdapter
    );
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 10).toString(16),
      'gaa_at': 'la',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );
    const ents = await platform.getEntitlements();
    expect(ents.service).to.not.be.null;
    expect(ents.source).to.equal('google:laa');
    expect(fetchStub).to.not.be.called;
  });

  it('should ignore valid LAA if referrer domain is not allowed', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://www.example.com'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true, enableEntitlements: false},
      serviceAdapter
    );
    ampdoc.win.__AMP_MODE.localDev = false;
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 10).toString(16),
      'gaa_at': 'la',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    const ents = await platform.getEntitlements();
    expect(ents).to.be.null;
    expect(fetchStub).to.not.be.called;
  });

  it('should ignore valid LAA if referrer protocol is not allowed', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://google.com'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableLAA: true, enableEntitlements: false},
      serviceAdapter
    );
    ampdoc.win.__AMP_MODE.localDev = false;
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 10).toString(16),
      'gaa_at': 'la',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    const ents = await platform.getEntitlements();
    expect(ents).to.be.null;
    expect(fetchStub).to.not.be.called;
  });

  it('requests entitlements with metering params if URL params are present and timestamp is valid', async () => {
    env.sandbox
      .stub(viewer, 'getReferrerUrl')
      .callsFake(() => Promise.resolve('http://localhost'));
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableMetering: true},
      serviceAdapter
    );
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 3600).toString(16),
      'gaa_at': 'g',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    env.sandbox
      .stub(serviceAdapter, 'loadMeteringState')
      .resolves({id: 'abc123'});
    const getEntitlementsStub = env.sandbox
      .stub(platform.runtime_, 'getEntitlements')
      .resolves(
        new Entitlements(
          'platformKey',
          'rawEntitlement',
          [
            new SwgEntitlement(
              'google:metering',
              ['example.org:basic'],
              'tok1'
            ),
          ],
          'example.org:basic'
        )
      );

    const ents = await platform.getEntitlements();
    expect(ents.service).to.not.be.null;
    expect(ents.source).to.equal('google:metering');

    const requestParams = getEntitlementsStub.getCall(0).args[0];
    expect(requestParams.metering).to.eql({state: {id: 'abc123'}});
  });

  it('should proxy fetch via AMP fetcher', async () => {
    const fetchStub = env.sandbox
      .stub(xhr, 'fetchJson')
      .callsFake((url, init) => {
        expect(url).to.match(/publication\/example.org/);
        expect(init).to.deep.equal({
          credentials: 'include',
          prerenderSafe: true,
        });
        return Promise.resolve({
          json: () => Promise.resolve({entitlements: entitlementResponse}),
        });
      });

    const ents = await platform.getEntitlements();
    expect(ents.service).to.equal(PLATFORM_ID);
    expect(fetchStub).to.be.calledOnce;
  });

  it('should proxy fetch non-granting response', async () => {
    const fetchStub = env.sandbox
      .stub(xhr, 'fetchJson')
      .callsFake((url, init) => {
        expect(url).to.match(/publication\/example.org/);
        expect(init).to.deep.equal({
          credentials: 'include',
          prerenderSafe: true,
        });
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              entitlements: {
                source: 'subscribe.google.com',
                products: ['example.org:registered_user'],
                subscriptionToken: 'tok1',
              },
            }),
        });
      });

    const ents = await platform.getEntitlements();
    expect(ents.source).to.equal(PLATFORM_ID);
    expect(ents.granted).to.be.false;
    expect(fetchStub).to.be.calledOnce;
  });

  it('should proxy fetch empty response', async () => {
    env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    const ents = await platform.getEntitlements();
    expect(ents).to.be.null;
  });

  it('should ack matching entitlements', async () => {
    env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () => Promise.resolve({entitlements: entitlementResponse}),
      })
    );

    await platform.getEntitlements();
    expect(ackStub).to.be.calledOnce;
  });

  it('should NOT ack non-matching entitlements', async () => {
    env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            entitlements: {},
          }),
      })
    );

    await platform.getEntitlements();
    expect(ackStub).to.not.be.called;
  });

  it('should ignore activate when granted', () => {
    platform.activate(
      new Entitlement({
        service: PLATFORM_ID,
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      })
    );
    expect(methods.showOffers).to.not.be.called;
    expect(methods.showAbbrvOffer).to.not.be.called;
  });

  it('should show offers on activate when not granted', async () => {
    platform.activate(new Entitlement({service: PLATFORM_ID, granted: false}));
    await flush();

    expect(methods.showOffers).to.be.calledOnce.calledWithExactly({
      list: 'amp',
    });
    expect(methods.showAbbrvOffer).to.not.be.called;
  });

  it('should show abbrv offer on activate when granted non-subscriber', async () => {
    platform.activate(
      new Entitlement({
        service: PLATFORM_ID,
        granted: true,
        grantReason: GrantReason.METERING,
      })
    );
    await flush();

    expect(methods.showAbbrvOffer).to.be.calledOnce.calledWithExactly({
      list: 'amp',
    });
    expect(methods.showOffers).to.not.be.called;
  });

  it('should override show offers with the grant for subscriber', () => {
    const entitlement = new Entitlement({service: PLATFORM_ID, granted: false});
    const grantEntitlement = new Entitlement({
      service: 'local',
      granted: true,
      grantReason: GrantReason.SUBSCRIBER,
    });
    platform.activate(entitlement, grantEntitlement);
    expect(methods.showOffers).to.not.be.called;
    expect(methods.showAbbrvOffer).to.not.be.called;
  });

  it('should override show offers with the grant non-subscriber', async () => {
    const entitlement = new Entitlement({service: PLATFORM_ID, granted: false});
    const grantEntitlement = new Entitlement({
      service: 'local',
      granted: true,
      grantReason: GrantReason.METERING,
    });
    platform.activate(entitlement, grantEntitlement);
    await flush();

    expect(methods.showOffers).to.not.be.called;
    expect(methods.showAbbrvOffer).to.be.calledOnce;
  });

  it('should consume showcase entitlement, if appropriate', async () => {
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableMetering: true},
      serviceAdapter
    );
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 10).toString(16),
      'gaa_at': 'g',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    const entitlement = new Entitlement({service: PLATFORM_ID, granted: true});
    const grantEntitlement = new Entitlement({
      service: 'local',
      granted: true,
      grantReason: GrantReason.METERING,
    });
    platform.activate(entitlement, grantEntitlement);
    await flush();

    expect(methods.consumeShowcaseEntitlementJwt).to.be.called;
  });

  it('should show showcase regwall, if appropriate', async () => {
    platform = new GoogleSubscriptionsPlatform(
      ampdoc,
      {enableMetering: true},
      serviceAdapter
    );
    env.sandbox.stub(platform, 'getUrlParams_').returns({
      'gaa_ts': (Date.now() / 1000 + 10).toString(16),
      'gaa_at': 'g',
      'gaa_sig': 'signature',
      'gaa_n': 123456,
    });
    env.sandbox.stub(serviceAdapter, 'loadMeteringState').resolves(null);
    env.sandbox.stub(platform.fetcher_, 'sendPostToPublisher').resolves();
    env.sandbox.stub(GaaMeteringRegwall, 'show').resolves();
    env.sandbox.stub(serviceAdapter, 'saveMeteringState').resolves();
    const entitlement = new Entitlement({service: PLATFORM_ID, granted: false});
    const continueSpy = env.sandbox.spy();
    platform.activate(entitlement, entitlement, continueSpy);
    await flush();

    expect(platform.fetcher_.sendPostToPublisher).to.be.calledOnce;
    expect(GaaMeteringRegwall.show).to.be.calledOnce;
    expect(serviceAdapter.saveMeteringState).to.be.calledOnce;
    expect(continueSpy).to.be.calledOnce;
  });

  it('should start linking flow when requested', async () => {
    serviceAdapterMock.expects('delegateActionToLocal').never();
    callback(callbacks.loginRequest)({linkRequested: true});
    await 'Event loop tick';
    expect(methods.linkAccount).to.be.calledOnce.calledWithExactly({
      ampReaderId: 'ari1',
    });
  });

  it('should delegate login when linking not requested', () => {
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.LOGIN, null)
      .returns(Promise.resolve(false))
      .once();
    callback(callbacks.loginRequest)({linkRequested: false});
    expect(methods.linkAccount).to.not.be.called;
  });

  it('should delegate login for a non-google viewer', () => {
    platform.isGoogleViewer_ = false;
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.LOGIN, null)
      .returns(Promise.resolve(false))
      .once();
    callback(callbacks.loginRequest)({linkRequested: true});
    expect(methods.linkAccount).to.not.be.called;
  });

  it('should not allow prerender for non-google viewer', () => {
    platform.isGoogleViewer_ = false;
    expect(platform.isPrerenderSafe()).to.be.false;
  });

  it('should reauthorize on complete linking', () => {
    analyticsMock
      .expects('actionEvent')
      .withExactArgs(PLATFORM_ID, Action.LINK, ActionStatus.SUCCESS)
      .once();
    serviceAdapterMock.expects('resetPlatforms').once();
    callback(callbacks.linkComplete)();
  });

  it('should reauthorize on canceled linking', () => {
    analyticsMock
      .expects('actionEvent')
      .withExactArgs(PLATFORM_ID, Action.LINK, ActionStatus.REJECTED)
      .once();
    serviceAdapterMock.expects('resetPlatforms').once();
    callback(callbacks.flowCanceled)({flow: 'linkAccount'});
  });

  describe('should log subscribe start', () => {
    let productId;
    let data;

    afterEach(() => {
      analyticsMock
        .expects('actionEvent')
        .withExactArgs(PLATFORM_ID, Action.SUBSCRIBE, ActionStatus.STARTED, {
          active: true,
          product: productId,
        })
        .once();
      callback(callbacks.flowStarted)({flow: Action.SUBSCRIBE, data});
    });
    it('should work without a productId', () => {
      productId = 'unknown productId';
    });

    it('should work with a productId', () => {
      productId = 'PRODUCTID';
      data = {
        product: productId,
      };
    });
  });

  it('should log subscribe cancel', () => {
    analyticsMock
      .expects('actionEvent')
      .withExactArgs(PLATFORM_ID, Action.SUBSCRIBE, ActionStatus.REJECTED)
      .once();
    callback(callbacks.flowCanceled)({flow: Action.SUBSCRIBE});
  });

  describe('should reauthorize on complete subscribe', () => {
    let productId;
    let entitlements;
    const platformKey = 'platformKey';

    afterEach(() => {
      analyticsMock
        .expects('actionEvent')
        .withExactArgs(PLATFORM_ID, Action.SUBSCRIBE, ActionStatus.SUCCESS, {
          active: true,
          product: productId,
        })
        .once();
      const promise = Promise.resolve();
      const response = new SubscribeResponse(
        null,
        null,
        null,
        entitlements,
        productId,
        () => promise,
        null
      );
      const resetPlatformsPromise = new Promise((resolve) => {
        env.sandbox.stub(serviceAdapter, 'resetPlatforms').callsFake(() => {
          resolve();
        });
      });
      callback(callbacks.subscribeResponse)(Promise.resolve(response));
      expect(methods.reset).to.not.be.called;
      return resetPlatformsPromise;
    });

    it('should work without entitlements', () => {
      productId = 'unknown subscriptionToken';
      entitlements = null;
    });

    it('should work with poorly formatted entitlements', () => {
      productId = 'unknown subscriptionToken';
      entitlements = new Entitlements(
        platformKey,
        null,
        [new SwgEntitlement(null, [productId], null)],
        productId
      );
    });

    it('should work with Google formatted entitlements', () => {
      productId = 'myProduct';
      const token = JSON.stringify({
        productId,
      });
      entitlements = new Entitlements(
        platformKey,
        null,
        [new SwgEntitlement('google', [productId], token)],
        productId
      );
    });
  });

  it('should delegate native subscribe request', () => {
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.SUBSCRIBE, null)
      .returns(Promise.resolve(false))
      .once();
    callback(callbacks.subscribeRequest)();
  });

  it('should reset on successful login', async () => {
    const loginResult = Promise.resolve(true);
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.LOGIN, null)
      .returns(loginResult)
      .once();
    callback(callbacks.loginRequest)({linkRequested: false});

    await loginResult;
    expect(methods.reset).to.be.calledOnce.calledWithExactly();
  });

  it('should NOT reset on failed login', async () => {
    const loginResult = Promise.resolve(false);
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.LOGIN, null)
      .returns(loginResult)
      .once();
    callback(callbacks.loginRequest)({linkRequested: false});

    await loginResult;
    expect(methods.reset).to.not.be.called;
  });

  it('should reset on successful subscribe', async () => {
    const loginResult = Promise.resolve(true);
    serviceAdapterMock
      .expects('delegateActionToLocal')
      .withExactArgs(Action.SUBSCRIBE, null)
      .returns(loginResult)
      .once();
    callback(callbacks.subscribeRequest)();

    await loginResult;
    expect(methods.reset).to.be.calledOnce.calledWithExactly();
  });

  it('should infer the viewer from viewerUrl', () => {
    delete ampdoc.params_['viewerUrl'];
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    expect(platform.isGoogleViewer_).to.be.false;

    ampdoc.params_['viewerUrl'] = 'https://www.google.com/other';
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    expect(platform.isGoogleViewer_).to.be.true;
  });

  it('should infer the viewer from origin', async () => {
    delete ampdoc.params_['viewerUrl'];
    let viewerOrigin = null;
    env.sandbox.stub(viewer, 'getViewerOrigin').callsFake(() => viewerOrigin);

    await 'Event loop tick';

    viewerOrigin = Promise.resolve('');
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    await viewerOrigin;
    expect(platform.isGoogleViewer_).to.be.false;

    // Other origin.
    viewerOrigin = Promise.resolve('https://other.com');
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    await viewerOrigin;
    expect(platform.isGoogleViewer_).to.be.false;

    // Google origin.
    viewerOrigin = Promise.resolve('https://google.com');
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    await viewerOrigin;
    expect(platform.isGoogleViewer_).to.be.true;
  });

  it('should allow prerender if in a google viewer', () => {
    ampdoc.params_['viewerUrl'] = 'https://www.google.com/other';
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    expect(platform.isPrerenderSafe()).to.be.true;
  });

  it('should attach button given to decorateUI', () => {
    const elem = env.win.document.createElement('div');
    const decorateStub = env.sandbox.stub(
      platform.runtime_.buttonApi_,
      'attach'
    );
    elem.textContent = 'some html';
    platform.decorateUI(elem, 'subscribe');
    expect(elem.textContent).to.be.equal('');
    expect(decorateStub).to.be.calledWith(elem);
  });

  it('should attach smartbutton given to decorateUI', () => {
    const elem = env.win.document.createElement('div');
    const attachStub = env.sandbox.stub(platform.runtime_, 'attachSmartButton');
    elem.textContent = 'some html';
    elem.setAttribute('subscriptions-lang', 'en');
    platform.decorateUI(elem, 'subscribe-smartbutton');
    expect(elem.textContent).to.be.equal('');
    expect(attachStub).to.be.calledWith(elem, {lang: 'en', theme: 'light'});
  });

  it('should use light smartbutton theme', () => {
    const elem = env.win.document.createElement('div');
    const attachStub = env.sandbox.stub(platform.runtime_, 'attachSmartButton');
    elem.textContent = 'some html';
    elem.setAttribute('subscriptions-lang', 'en');
    platform.decorateUI(elem, 'subscribe-smartbutton-light');
    expect(elem.textContent).to.be.equal('');
    expect(attachStub).to.be.calledWith(elem, {theme: 'light', lang: 'en'});
  });

  it('should use dark smartbutton theme', () => {
    const elem = env.win.document.createElement('div');
    const attachStub = env.sandbox.stub(platform.runtime_, 'attachSmartButton');
    elem.textContent = 'some html';
    elem.setAttribute('subscriptions-lang', 'en');
    platform.decorateUI(elem, 'subscribe-smartbutton-dark');
    expect(elem.textContent).to.be.equal('');
    expect(attachStub).to.be.calledWith(elem, {theme: 'dark', lang: 'en'});
  });

  it('should use message text color', () => {
    const elem = env.win.document.createElement('div');
    const attachStub = env.sandbox.stub(platform.runtime_, 'attachSmartButton');
    elem.textContent = 'some html';
    elem.setAttribute('subscriptions-lang', 'en');
    elem.setAttribute('subscriptions-message-text-color', '#09f');
    platform.decorateUI(elem, 'subscribe-smartbutton');
    expect(elem.textContent).to.be.equal('');
    expect(attachStub).to.be.calledWith(elem, {
      lang: 'en',
      messageTextColor: '#09f',
      theme: 'light',
    });
  });

  it('should use message number', () => {
    const elem = env.win.document.createElement('div');
    const attachStub = env.sandbox.stub(platform.runtime_, 'attachSmartButton');
    elem.textContent = 'some html';
    elem.setAttribute('subscriptions-lang', 'en');
    elem.setAttribute('subscriptions-message-number', 1);
    platform.decorateUI(elem, 'subscribe-smartbutton');
    expect(attachStub).to.be.calledWith(elem, {
      lang: 'en',
      theme: 'light',
      messageNumber: '1', // Message is 'Subscribe with just a few taps' on smartbox button.
    });
  });

  it('should throw if smartButton language is missing', () => {
    //expectAsyncConsoleError(/must have a language attrbiute​​​/);
    const elem = env.win.document.createElement('div');
    elem.textContent = 'some html';
    expect(() => {
      allowConsoleError(() => {
        platform.decorateUI(elem, 'subscribe-smartbutton');
      });
    }).to.throw(/language/);
  });

  it('should show offers if subscribe action is delegated', () => {
    const executeStub = platform.runtime_.showOffers;
    platform.executeAction(Action.SUBSCRIBE);
    expect(executeStub).to.be.calledWith({list: 'amp', isClosable: true});
  });

  it('should do nothing if rtc mapped button is not read ', () => {
    // rtc button
    rtcButtonElement = env.win.document.createElement('button');
    rtcButtonElement.setAttribute('subscriptions-google-rtc', '');
    rtcButtonElement.id = 'rtcTestButton';
    env.win.document.body.appendChild(rtcButtonElement);
    platform.skuMap_ = {
      rtcTestButton: {
        sku: 'testSku',
      },
    };
    const executeStub = platform.runtime_.subscribe;
    platform.executeAction(Action.SUBSCRIBE, 'rtcTestButton');
    expect(executeStub).to.not.be.called;
  });

  it('should show subscribe flow if single sku is mapped ', () => {
    // rtc button
    rtcButtonElement = env.win.document.createElement('button');
    rtcButtonElement.setAttribute('subscriptions-google-rtc-set', '');
    rtcButtonElement.id = 'rtcTestButton';
    env.win.document.body.appendChild(rtcButtonElement);
    platform.skuMap_ = {
      rtcTestButton: {
        sku: 'testSku',
      },
    };
    const executeStub = platform.runtime_.subscribe;
    platform.executeAction(Action.SUBSCRIBE, 'rtcTestButton');
    expect(executeStub).to.be.calledWith('testSku');
  });

  it("should show offers if multiple sku's are mapped", () => {
    // rtc button
    rtcButtonElement = env.win.document.createElement('button');
    rtcButtonElement.setAttribute('subscriptions-google-rtc-set', '');
    rtcButtonElement.id = 'rtcTestButton';
    env.win.document.body.appendChild(rtcButtonElement);
    platform.skuMap_ = {
      rtcTestButton: {
        carouselOptions: {skus: ['testSku1', 'testsku2']},
      },
    };
    const executeStub = platform.runtime_.showOffers;
    platform.executeAction(Action.SUBSCRIBE, 'rtcTestButton');
    expect(executeStub).to.be.calledWith({
      isClosable: true,
      skus: ['testSku1', 'testsku2'],
    });
  });

  it('should show contributions if contribute action is delegated', () => {
    const executeStub = platform.runtime_.showContributionOptions;
    platform.executeAction(Action.CONTRIBUTE);
    expect(executeStub).to.be.calledWith({list: 'amp', isClosable: true});
  });

  it('should link accounts if login action is delegated', async () => {
    const executeStub = platform.runtime_.linkAccount;
    platform.executeAction(Action.LOGIN);
    await 'Event loop tick';
    expect(executeStub).to.be.calledWith();
  });

  describe('getEntitlements', () => {
    it('should convert granted entitlements to internal shape', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () => Promise.resolve({entitlements: entitlementResponse}),
        })
      );

      const entitlement = await platform.getEntitlements();
      expect(entitlement.source).to.be.equal('google');
      expect(entitlement.granted).to.be.equal(true);
      expect(entitlement.grantReason).to.be.equal(GrantReason.SUBSCRIBER);
      expect(entitlement.data).to.deep.equal(entitlementResponse);
    });

    it('should convert non granted internal shape with granted == false', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              entitlements: {
                source: 'google',
                products: ['example.org:premium'],
                subscriptionToken: '',
              },
            }),
        })
      );

      const entitlement = await platform.getEntitlements();
      expect(entitlement.source).to.be.equal('google');
      expect(entitlement.granted).to.be.equal(false);
      expect(entitlement.grantReason).to.be.null;
    });
  });

  describe('isReadyToPay', () => {
    // #TODO(jpettitt) remove fake entitlements when swj.js
    // isReadyToPay is available
    /**
     * return a fake entitlements object
     * @param {boolean} isReadyToPay
     * @return {Object}
     */
    function fakeEntitlements(isReadyToPay) {
      return {
        isReadyToPay,
        entitlements: {},
        getEntitlementForThis: () => {},
      };
    }

    it('should treat missing isReadyToPay as false', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () => Promise.resolve({entitlements: entitlementResponse}),
        })
      );

      await platform.getEntitlements();
      expect(
        platform.getSupportedScoreFactor(
          SubscriptionsScoreFactor.IS_READY_TO_PAY
        )
      ).to.equal(0);
    });

    it('should handle isReadyToPay true', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              isReadyToPay: true,
              entitlements: entitlementResponse,
            }),
        })
      );
      //#TODO(jpettitt) remove stub when swj.js isRadyToPay is available
      env.sandbox
        .stub(platform.runtime_, 'getEntitlements')
        .resolves(fakeEntitlements(true));

      await platform.getEntitlements();
      expect(
        platform.getSupportedScoreFactor(
          SubscriptionsScoreFactor.IS_READY_TO_PAY
        )
      ).to.equal(1);
    });

    it('should handle isReadyToPay false', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              isReadyToPay: false,
              entitlements: entitlementResponse,
            }),
        })
      );
      //#TODO(jpettitt) remove stub when swj.js isRadyToPay is available
      env.sandbox
        .stub(platform.runtime_, 'getEntitlements')
        .resolves(fakeEntitlements(false));

      await platform.getEntitlements();
      expect(
        platform.getSupportedScoreFactor(
          SubscriptionsScoreFactor.IS_READY_TO_PAY
        )
      ).to.equal(0);
    });

    it('should call getEncryptedDocumentKey with google.com', async () => {
      env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () => Promise.resolve({entitlements: {}}),
        })
      );

      await platform.getEntitlements();
      expect(getEncryptedDocumentKeyStub).to.be.calledWith('google.com');
    });

    it('should not add encryptedDocumentKey parameter to url', async () => {
      const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () => Promise.resolve({entitlements: {}}),
        })
      );

      await platform.getEntitlements();
      expect(fetchStub).to.be.calledWith(
        'https://news.google.com/swg/_/api/v1/publication/example.org/entitlements'
      );
    });

    it('should add encryptedDocumentKey parameter to url', async () => {
      const fetchStub = env.sandbox.stub(xhr, 'fetchJson').callsFake(() =>
        Promise.resolve({
          json: () => Promise.resolve({entitlements: {}}),
        })
      );

      getEncryptedDocumentKeyStub.callsFake(() => 'encryptedDocumentKey');

      await platform.getEntitlements();
      expect(fetchStub).to.be.calledWith(
        'https://news.google.com/swg/_/api/v1/publication/example.org/entitlements?crypt=encryptedDocumentKey'
      );
    });
  });
});
