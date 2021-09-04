import {AccessOtherAdapter} from '../amp-access-other';

describes.realWin('AccessOtherAdapter', {amp: true}, (env) => {
  let ampdoc;
  let validConfig;
  let context;
  let contextMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;

    validConfig = {};

    context = {
      buildUrl: () => {},
    };
    contextMock = env.sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
  });

  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessOtherAdapter(ampdoc, validConfig, context);
      expect(adapter.authorizationResponse_).to.be.null;
      expect(adapter.getConfig()).to.deep.equal({
        authorizationResponse: null,
      });
      expect(adapter.isProxyOrigin_).to.be.false;
      expect(adapter.isPingbackEnabled()).to.be.false;
    });

    it('should load valid config with fallback object', () => {
      const obj = {'access': 'A'};
      validConfig['authorizationFallbackResponse'] = obj;
      const adapter = new AccessOtherAdapter(ampdoc, validConfig, context);
      expect(adapter.authorizationResponse_).to.be.equal(obj);
      expect(adapter.getConfig()).to.deep.equal({
        authorizationResponse: obj,
      });
      expect(adapter.isProxyOrigin_).to.be.false;
    });
  });

  describe('runtime', () => {
    let adapter;

    beforeEach(() => {
      adapter = new AccessOtherAdapter(ampdoc, {}, context);
    });

    it('should disable authorization without fallback object', () => {
      adapter.authorizationResponse_ = null;

      adapter.isProxyOrigin_ = false;
      expect(adapter.isAuthorizationEnabled()).to.be.false;

      adapter.isProxyOrigin_ = true;
      expect(adapter.isAuthorizationEnabled()).to.be.false;
    });

    it('should disable authorization on proxy', () => {
      adapter.isProxyOrigin_ = true;

      adapter.authorizationResponse_ = null;
      expect(adapter.isAuthorizationEnabled()).to.be.false;

      adapter.authorizationResponse_ = {};
      expect(adapter.isAuthorizationEnabled()).to.be.false;
    });

    it('should enable authorization when not on proxy and with auth', () => {
      adapter.isProxyOrigin_ = false;
      adapter.authorizationResponse_ = {};
      expect(adapter.isAuthorizationEnabled()).to.be.true;
    });

    it('should fail authorization on proxy', () => {
      adapter.isProxyOrigin_ = true;
      adapter.authorizationResponse_ = {};
      contextMock.expects('buildUrl').never();
      allowConsoleError(() => {
        expect(() => {
          adapter.authorize();
        }).to.throw();
      });
    });

    it('should respond to authorization when not on proxy proxy', () => {
      adapter.isProxyOrigin_ = false;
      const obj = {'access': 'A'};
      adapter.authorizationResponse_ = obj;
      contextMock.expects('buildUrl').never();
      return adapter.authorize().then((response) => {
        expect(response).to.equal(obj);
      });
    });

    it('should short-circuit pingback flow', () => {
      contextMock.expects('buildUrl').never();
      return adapter.pingback();
    });
  });
});
