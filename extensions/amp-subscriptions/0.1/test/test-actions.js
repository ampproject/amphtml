import {WebLoginDialog} from '../../../amp-access/0.1/login-dialog';
import {Actions} from '../actions';
import {
  Action,
  ActionStatus,
  SubscriptionAnalytics,
  SubscriptionAnalyticsEvents,
} from '../analytics';
import {UrlBuilder} from '../url-builder';

const LOCAL = 'local';
const LOCAL_OPTS = {serviceId: LOCAL};

describes.realWin('Actions', {amp: true}, (env) => {
  let ampdoc;
  let clock;
  let actions;
  let readerIdPromise;
  let urlBuilder, analytics;
  let analyticsMock;
  let buildSpy;
  let openStub;
  let openResolver;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    clock = env.sandbox.useFakeTimers();
    readerIdPromise = Promise.resolve('RD');
    urlBuilder = new UrlBuilder(ampdoc, readerIdPromise);
    urlBuilder.setAuthResponse({
      'a': 'A',
    });
    analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    analyticsMock = env.sandbox.mock(analytics);
    buildSpy = env.sandbox.spy(Actions.prototype, 'build');
    actions = new Actions(ampdoc, urlBuilder, analytics, {
      [Action.LOGIN]: 'https://example.org/login?rid=READER_ID',
      [Action.SUBSCRIBE]:
        'https://example.org/subscribe?rid=READER_ID&a=AUTHDATA(a)',
    });
    openResolver = null;
    openStub = env.sandbox
      .stub(WebLoginDialog.prototype, 'open')
      .callsFake(() => {
        return new Promise((resolve) => {
          openResolver = resolve;
        });
      });
  });

  afterEach(() => {
    analyticsMock.verify();
  });

  it('should immediately call build', () => {
    expect(buildSpy).to.be.calledOnce;
  });

  it('should prepare all URLs', async () => {
    await actions.build();
    const builtActions = actions.builtActionUrlMap_;
    expect(Object.keys(builtActions)).to.have.length(2);
    expect(builtActions[Action.LOGIN]).to.equal(
      'https://example.org/login?rid=RD'
    );
    expect(builtActions[Action.SUBSCRIBE]).to.equal(
      'https://example.org/subscribe?rid=RD&a=A'
    );
  });

  it('should open the action popup window synchronously', async () => {
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.STARTED,
        }
      )
      .once();
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.SUCCESS,
        }
      )
      .once();

    await actions.build();
    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver('#success=yes');

    const result = await promise;
    expect(result).to.be.true;
  });

  it('should accept success=true', async () => {
    await actions.build();

    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver('#success=true');

    const result = await promise;
    expect(result).to.be.true;
  });

  it('should accept success=1', async () => {
    await actions.build();

    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver('#success=1');

    const result = await promise;
    expect(result).to.be.true;
  });

  it('should accept success=no', async () => {
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.STARTED,
        }
      )
      .once();
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.REJECTED,
        }
      )
      .once();

    await actions.build();

    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver('#success=no');

    const result = await promise;
    expect(result).to.be.false;
  });

  it('should accept no response', async () => {
    await actions.build();

    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver('');

    const result = await promise;
    expect(result).to.be.true;
  });

  it('should block re-execution of actions for some time', async () => {
    await actions.build();
    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    // Repeated call is blocked.
    expect(actions.execute(Action.LOGIN)).to.equal(promise);
    // After timeout, the call is allowed.
    clock.tick(1001);
    expect(actions.execute(Action.LOGIN)).to.not.equal(promise);
  });

  it('should handle failures', async () => {
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.STARTED,
        }
      )
      .once();
    analyticsMock
      .expects('event')
      .withExactArgs(
        SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
        LOCAL_OPTS,
        {
          action: Action.LOGIN,
          status: ActionStatus.FAILED,
        }
      )
      .once();

    await actions.build();
    const promise = actions.execute(Action.LOGIN);
    expect(openStub).to.be.calledOnce;
    openResolver(Promise.reject(new Error('broken')));
    try {
      await promise;
      throw new Error('must have failed');
    } catch (reason) {
      expect(reason).to.contain(/broken/);
      expect(actions.actionPromise_).to.be.null;
    }
  });

  it('should disallow unknown action', () => {
    allowConsoleError(() => {
      expect(() => {
        actions.execute('unknown');
      }).to.throw(/Action URL is not configured/);
    });
  });

  it('should fail before build is complete', () => {
    allowConsoleError(() => {
      expect(() => {
        actions.execute(Action.LOGIN);
      }).to.throw(/Action URL is not ready/);
    });
  });
});
