import {PageConfig} from '#third_party/subscriptions-project/config';

import {Action, SubscriptionAnalytics} from '../analytics';
import {Dialog} from '../dialog';
import {Entitlement, GrantReason} from '../entitlement';
import {localSubscriptionPlatformFactory} from '../local-subscription-platform';
import {ServiceAdapter} from '../service-adapter';

describes.fakeWin('LocalSubscriptionsPlatform', {amp: true}, (env) => {
  let ampdoc;
  let localSubscriptionPlatform;
  let serviceAdapter;
  let getEncryptedDocumentKeyStub;

  const actionMap = {
    [Action.SUBSCRIBE]: 'https://lipsum.com/subscribe',
    [Action.LOGIN]: 'https://lipsum.com/login',
  };
  const service = 'sample-service';
  const source = 'sample-source';
  const json = {
    service,
    source,
    granted: true,
    grantReason: GrantReason.SUBSCRIBER,
  };
  const readerId = 'reader1';
  const entitlement = Entitlement.parseFromJson(json);
  const configAuthUrl = 'https://lipsum.com/login/authorize?rid=READER_ID';
  const configPingbackUrl = 'https://lipsum.com/login/pingback?rid=READER_ID';
  const serviceConfig = {
    'services': [
      {
        'serviceId': 'local',
        'authorizationUrl': configAuthUrl,
        'pingbackUrl': configPingbackUrl,
        'actions': actionMap,
        'baseScore': 99,
      },
    ],
  };
  const authUrl = configAuthUrl.replace('READER_ID', readerId);
  const pingbackUrl = configPingbackUrl.replace('READER_ID', readerId);
  const fakeScoreStates = {
    'subscribe.google.com': {
      'isReadyToPay': 1,
      'supportsViewer': 1,
    },
    'local': {
      'isReadyToPay': 0,
      'supportsViewer': 0,
    },
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    serviceAdapter = new ServiceAdapter({});
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    env.sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    env.sandbox
      .stub(serviceAdapter, 'getScoreFactorStates')
      .callsFake(() => Promise.resolve(fakeScoreStates));
    env.sandbox
      .stub(serviceAdapter, 'getPageConfig')
      .callsFake(() => new PageConfig('example.org:basic', true));
    env.sandbox
      .stub(serviceAdapter, 'getDialog')
      .callsFake(() => new Dialog(ampdoc));
    env.sandbox
      .stub(serviceAdapter, 'getReaderId')
      .callsFake(() => Promise.resolve('reader1'));
    getEncryptedDocumentKeyStub = env.sandbox
      .stub(serviceAdapter, 'getEncryptedDocumentKey')
      .callsFake(() => null);
    localSubscriptionPlatform = localSubscriptionPlatformFactory(
      ampdoc,
      serviceConfig.services[0],
      serviceAdapter
    );
  });

  it('initializeListeners_ should listen to clicks on rootNode', () => {
    const domStub = env.sandbox.stub(
      localSubscriptionPlatform.rootNode_,
      'addEventListener'
    );

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0]).to.be.equals('click');
  });

  it('initializeListeners_ should listen to clicks on rootNode body', () => {
    const domStub = env.sandbox.stub(
      localSubscriptionPlatform.rootNode_.body,
      'addEventListener'
    );

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0]).to.be.equals('click');
  });

  it('initializeListeners_ should handle clicks once per event', () => {
    const handleClickStub = env.sandbox.stub(
      localSubscriptionPlatform,
      'handleClick_'
    );

    localSubscriptionPlatform.initializeListeners_();
    localSubscriptionPlatform.rootNode_.body.click();
    expect(handleClickStub).calledOnce;
  });

  it('should return baseScore', () => {
    expect(localSubscriptionPlatform.getBaseScore()).to.be.equal(99);
  });

  it('should default to single entitlement pingback', () => {
    expect(localSubscriptionPlatform.pingbackReturnsAllEntitlements()).to.be
      .false;
  });

  it('pingbackReturnsAllEntitlements should "pingbackAllEntitlements" config value', () => {
    const testConfig = {
      ...serviceConfig.services[0],
      'pingbackAllEntitlements': true,
    };
    const testLocalPlatform = localSubscriptionPlatformFactory(
      ampdoc,
      testConfig,
      serviceAdapter
    );
    expect(testLocalPlatform.pingbackReturnsAllEntitlements()).to.be.true;
  });

  it('Should not allow prerender', () => {
    expect(localSubscriptionPlatform.isPrerenderSafe()).to.be.false;
  });

  it('should fetch the entitlements on getEntitlements', async () => {
    const fetchStub = env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));

    const ent = await localSubscriptionPlatform.getEntitlements();
    expect(fetchStub).to.be.calledOnce;
    expect(fetchStub.getCall(0).args[0]).to.be.equals(authUrl);
    expect(fetchStub.getCall(0).args[1].credentials).to.be.equals('include');
    expect(ent).to.be.instanceof(Entitlement);
  });

  it('should buildUrl before fetchingAuth', async () => {
    const builtUrl = 'builtUrl';
    const urlBuildingStub = env.sandbox
      .stub(localSubscriptionPlatform.urlBuilder_, 'buildUrl')
      .callsFake(() => Promise.resolve(builtUrl));
    const fetchStub = env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));

    await localSubscriptionPlatform.getEntitlements();
    expect(urlBuildingStub).to.be.calledWith(configAuthUrl, false);
    expect(fetchStub).to.be.calledWith(builtUrl, {credentials: 'include'});
  });

  it('should call getEncryptedDocumentKey with local', async () => {
    env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));

    await localSubscriptionPlatform.getEntitlements();
    expect(getEncryptedDocumentKeyStub).to.be.calledWith('local');
  });

  it('should add encryptedDocumentKey parameter to url', async () => {
    const fetchStub = env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));
    getEncryptedDocumentKeyStub.callsFake(() => 'encryptedDocumentKey');

    await localSubscriptionPlatform.getEntitlements();
    expect(fetchStub).to.be.calledWith(
      'https://lipsum.com/login/authorize?rid=reader1&crypt=encryptedDocumentKey'
    );
  });

  it('should not add encryptedDocumentKey parameter to url', async () => {
    const fetchStub = env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));

    await localSubscriptionPlatform.getEntitlements();
    expect(fetchStub).to.be.calledWith(
      'https://lipsum.com/login/authorize?rid=reader1'
    );
  });

  it('should add metering params to url, if metering state is available', async () => {
    env.sandbox
      .stub(localSubscriptionPlatform.serviceAdapter_, 'loadMeteringState')
      .returns({key: 'value'});
    const fetchStub = env.sandbox
      .stub(localSubscriptionPlatform.xhr_, 'fetchJson')
      .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));

    await localSubscriptionPlatform.getEntitlements();
    expect(fetchStub).to.be.calledWith(
      'https://lipsum.com/login/authorize?rid=reader1&meteringState=eyJrZXkiOiJ2YWx1ZSJ9'
    );
  });

  it('should save metering state from response', async () => {
    const meteringState = {key: 'value'};
    const responseWithMeteringState = {
      ...json,
      metering: {state: meteringState},
    };
    env.sandbox.stub(localSubscriptionPlatform.xhr_, 'fetchJson').returns(
      Promise.resolve({
        json: () => Promise.resolve(responseWithMeteringState),
      })
    );
    const saveMeteringStateStub = env.sandbox
      .stub(localSubscriptionPlatform.serviceAdapter_, 'saveMeteringState')
      .returns(Promise.resolve());

    await localSubscriptionPlatform.getEntitlements();
    expect(saveMeteringStateStub).to.be.calledWith(meteringState);
  });

  describe('validateActionMap', () => {
    let actionMap;
    beforeEach(() => {
      actionMap = {
        [Action.SUBSCRIBE]: 'https://lipsum.com/subscribe',
        [Action.LOGIN]: 'https://lipsum.com/login',
        'other': 'https://lipsum.com/other',
      };
    });

    it('should check that login action is present', () => {
      delete actionMap[Action.LOGIN];
      expect(() =>
        localSubscriptionPlatform.validateActionMap(actionMap)
      ).to.throw();
    });

    it('should check that subscribe action is present', () => {
      delete actionMap[Action.SUBSCRIBE];
      expect(() =>
        localSubscriptionPlatform.validateActionMap(actionMap)
      ).to.throw();
    });

    it(
      'should return actionMap as is if login and subscribe actions' +
        ' are present',
      () => {
        const returnedMap =
          localSubscriptionPlatform.validateActionMap(actionMap);
        expect(JSON.stringify(returnedMap)).to.be.equal(
          JSON.stringify(actionMap)
        );
      }
    );
  });

  describe('handleClick_', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      element.setAttribute('subscriptions-action', Action.SUBSCRIBE);
      element.setAttribute('subscriptions-service', 'local');
    });

    // This must be a sync call to avoid Safari popup blocker issues.
    it('should call executeAction synchronosly when service is "auto"', () => {
      const executeStub = env.sandbox.stub(
        localSubscriptionPlatform,
        'executeAction'
      );
      element.setAttribute('subscriptions-service', 'auto');
      localSubscriptionPlatform.handleClick_(element);
      expect(executeStub).to.be.calledWith(
        element.getAttribute('subscriptions-action')
      );
    });

    it('should call executeAction with subscriptions-action value', () => {
      const executeStub = env.sandbox.stub(
        localSubscriptionPlatform,
        'executeAction'
      );
      localSubscriptionPlatform.handleClick_(element);
      expect(executeStub).to.be.calledWith(
        element.getAttribute('subscriptions-action')
      );
    });

    it(
      'should delegate action to service specified in ' +
        'subscriptions-service',
      () => {
        const executeStub = env.sandbox.stub(
          localSubscriptionPlatform,
          'executeAction'
        );
        const delegateStub = env.sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
        );
        element.setAttribute('subscriptions-service', 'swg.google.com');
        localSubscriptionPlatform.handleClick_(element);
        expect(executeStub).to.not.be.called;
        expect(delegateStub).to.be.called;
      }
    );

    it(
      'should delegate service selection to scoreBasedLogin if no service ' +
        'name is specified for login',
      () => {
        element.setAttribute('subscriptions-action', Action.LOGIN);
        element.removeAttribute('subscriptions-service');
        const platform = {};
        const platformKey = 'platformKey';
        platform.getPlatformKey = env.sandbox
          .stub()
          .callsFake(() => platformKey);
        const loginStub = env.sandbox
          .stub(
            localSubscriptionPlatform.serviceAdapter_,
            'selectPlatformForLogin'
          )
          .callsFake(() => platform);
        const delegateStub = env.sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
        );
        localSubscriptionPlatform.handleClick_(element);
        expect(loginStub).to.be.called;
        expect(delegateStub).to.be.calledWith(Action.LOGIN, platformKey);
      }
    );

    it(
      'should delegate service selection to scoreBasedLogin ' +
        'service specified is auto for login',
      () => {
        element.setAttribute('subscriptions-action', Action.LOGIN);
        element.setAttribute('subscriptions-service', 'auto');
        const loginStub = env.sandbox
          .stub(
            localSubscriptionPlatform.serviceAdapter_,
            'selectPlatformForLogin'
          )
          .callsFake(() => platform);
        const delegateStub = env.sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
        );
        const platform = {};
        const platformKey = 'platformKey';
        platform.getPlatformKey = env.sandbox
          .stub()
          .callsFake(() => platformKey);
        localSubscriptionPlatform.handleClick_(element);
        expect(loginStub).to.be.called;
        expect(delegateStub).to.be.calledWith(Action.LOGIN, platformKey);
      }
    );

    it('should NOT delegate for scoreBasedLogin for non-login action', () => {
      element.setAttribute('subscriptions-action', Action.SUBSCRIBE);
      element.setAttribute('subscriptions-service', 'auto');
      const loginStub = env.sandbox.stub(
        localSubscriptionPlatform.serviceAdapter_,
        'selectPlatformForLogin'
      );
      const executeStub = env.sandbox.stub(
        localSubscriptionPlatform,
        'executeAction'
      );
      const delegateStub = env.sandbox.stub(
        localSubscriptionPlatform.serviceAdapter_,
        'delegateActionToService'
      );
      const platform = {};
      const platformKey = 'platformKey';
      platform.getPlatformKey = env.sandbox.stub().callsFake(() => platformKey);
      localSubscriptionPlatform.handleClick_(element);
      expect(loginStub).to.not.be.called;
      expect(delegateStub).to.not.be.called;
      expect(executeStub).to.be.calledOnce.calledWith(Action.SUBSCRIBE);
    });
  });

  describe('executeAction', () => {
    it('should call executeAction on actions_', async () => {
      const actionString = 'action';
      const executeStub = env.sandbox
        .stub(localSubscriptionPlatform.actions_, 'execute')
        .callsFake(() => Promise.resolve(true));
      const resetStub = env.sandbox.stub(serviceAdapter, 'resetPlatforms');
      localSubscriptionPlatform.executeAction(actionString);
      expect(executeStub).to.be.calledWith(actionString);

      await executeStub();
      expect(resetStub).to.be.calledOnce;
    });
  });

  describe('render', () => {
    it("should call renderer's render method", async () => {
      const renderStub = env.sandbox.stub(
        localSubscriptionPlatform.renderer_,
        'render'
      );
      const stateSub = env.sandbox
        .stub(localSubscriptionPlatform, 'createRenderState_')
        .callsFake(() => Promise.resolve({foo: 'bar'}));
      localSubscriptionPlatform.activate(entitlement);
      expect(stateSub).to.be.calledOnce;
      await 'Event loop tick';
      expect(renderStub).to.be.calledOnce;
    });

    it('should build renderState', async () => {
      await expect(
        localSubscriptionPlatform.createRenderState_(entitlement)
      ).to.eventually.deep.equal({
        'source': 'sample-source',
        'service': '',
        'granted': true,
        'grantReason': 'SUBSCRIBER',
        'data': null,
        'factors': {
          'subscribe.google.com': {
            'isReadyToPay': 1,
            'supportsViewer': 1,
          },
          'local': {
            'isReadyToPay': 0,
            'supportsViewer': 0,
          },
        },
      });
    });

    it("should reset renderer's on reset", () => {
      const resetStub = env.sandbox.stub(
        localSubscriptionPlatform.renderer_,
        'reset'
      );
      localSubscriptionPlatform.reset();
      expect(resetStub).to.be.calledOnce;
    });
  });

  describe('pingback', () => {
    it('should call `sendSignal` to the pingback signal', async () => {
      const sendSignalStub = env.sandbox.stub(
        localSubscriptionPlatform.xhr_,
        'sendSignal'
      );

      await localSubscriptionPlatform.pingback(entitlement);
      expect(sendSignalStub).to.be.calledOnce;
      expect(sendSignalStub.getCall(0).args[0]).to.be.equal(pingbackUrl);
      expect(sendSignalStub.getCall(0).args[1].body).to.equal(
        JSON.stringify(entitlement.jsonForPingback())
      );
    });
    it('pingback should handle multiple entitlements ', async () => {
      const sendSignalStub = env.sandbox.stub(
        localSubscriptionPlatform.xhr_,
        'sendSignal'
      );

      await localSubscriptionPlatform.pingback([entitlement]);
      expect(sendSignalStub).to.be.calledOnce;
      expect(sendSignalStub.getCall(0).args[0]).to.be.equal(pingbackUrl);
      expect(sendSignalStub.getCall(0).args[1].body).to.equal(
        JSON.stringify([entitlement.jsonForPingback()])
      );
    });
  });
});
