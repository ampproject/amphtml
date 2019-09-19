/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  Action,
  ActionStatus,
  SubscriptionAnalytics,
  SubscriptionAnalyticsEvents,
} from '../analytics';
import {Actions} from '../actions';
import {UrlBuilder} from '../url-builder';
import {WebLoginDialog} from '../../../amp-access/0.1/login-dialog';

const LOCAL = 'local';
const LOCAL_OPTS = {serviceId: LOCAL};

describes.realWin('Actions', {amp: true}, env => {
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
    clock = sandbox.useFakeTimers();
    readerIdPromise = Promise.resolve('RD');
    urlBuilder = new UrlBuilder(ampdoc, readerIdPromise);
    urlBuilder.setAuthResponse({
      'a': 'A',
    });
    analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    analyticsMock = sandbox.mock(analytics);
    buildSpy = sandbox.spy(Actions.prototype, 'build');
    actions = new Actions(ampdoc, urlBuilder, analytics, {
      [Action.LOGIN]: 'https://example.org/login?rid=READER_ID',
      [Action.SUBSCRIBE]:
        'https://example.org/subscribe?rid=READER_ID&a=AUTHDATA(a)',
    });
    openResolver = null;
    openStub = sandbox.stub(WebLoginDialog.prototype, 'open').callsFake(() => {
      return new Promise(resolve => {
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

  it('should prepare all URLs', () => {
    return actions.build().then(() => {
      const builtActions = actions.builtActionUrlMap_;
      expect(Object.keys(builtActions)).to.have.length(2);
      expect(builtActions[Action.LOGIN]).to.equal(
        'https://example.org/login?rid=RD'
      );
      expect(builtActions[Action.SUBSCRIBE]).to.equal(
        'https://example.org/subscribe?rid=RD&a=A'
      );
    });
  });

  it('should open the action popup window synchronously', () => {
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
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver('#success=yes');
        return promise;
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('should accept success=true', () => {
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver('#success=true');
        return promise;
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('should accept success=1', () => {
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver('#success=1');
        return promise;
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('should accept success=no', () => {
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
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver('#success=no');
        return promise;
      })
      .then(result => {
        expect(result).to.be.false;
      });
  });

  it('should accept no response', () => {
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver('');
        return promise;
      })
      .then(result => {
        expect(result).to.be.true;
      });
  });

  it('should block re-execution of actions for some time', () => {
    return actions.build().then(() => {
      const promise = actions.execute(Action.LOGIN);
      expect(openStub).to.be.calledOnce;
      // Repeated call is blocked.
      expect(actions.execute(Action.LOGIN)).to.equal(promise);
      // After timeout, the call is allowed.
      clock.tick(1001);
      expect(actions.execute(Action.LOGIN)).to.not.equal(promise);
    });
  });

  it('should handle failures', () => {
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
    return actions
      .build()
      .then(() => {
        const promise = actions.execute(Action.LOGIN);
        expect(openStub).to.be.calledOnce;
        openResolver(Promise.reject(new Error('broken')));
        return promise;
      })
      .then(
        () => {
          throw new Error('must have failed');
        },
        reason => {
          expect(() => {
            throw reason;
          }).to.throw(/broken/);
          expect(actions.actionPromise_).to.be.null;
        }
      );
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
