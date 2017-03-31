/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


import * as sinon from 'sinon';
import {Poller} from '../poller';
import {timerFor} from '../../../../src/services';


describe('Poller', () => {
  let sandbox;
  let clock;
  let poller;
  let workStub;
  const timer = timerFor(window);

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const obj = {
      work: function() {},
    };
    workStub = sandbox.stub(obj, 'work');
    sandbox.stub(Math, 'random', () => 1);
    const wait = 5000;
    poller = new Poller(window, wait, workStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be initialized in stopped state', () => {
    expect(poller.isRunning()).to.equal(false);
  });

  it('should be able to transition states correctly', () => {
    expect(poller.isRunning()).to.equal(false);
    poller.start();
    expect(poller.isRunning()).to.equal(true);
    poller.start();
    expect(poller.isRunning()).to.equal(true);
    poller.stop();
    expect(poller.isRunning()).to.equal(false);
    poller.start();
    expect(poller.isRunning()).to.equal(true);
    poller.stop();
    expect(poller.isRunning()).to.equal(false);
    poller.stop();
    expect(poller.isRunning()).to.equal(false);
  });

  it('should execute work', () => {
    workStub.returns(Promise.resolve());
    expect(workStub).to.have.not.been.called;
    poller.start();
    clock.tick(4000);
    expect(workStub).to.be.calledOnce;
    return poller.lastWorkPromise_.then(() => {
      clock.tick(2000);
      expect(workStub).to.be.calledOnce;
      clock.tick(2000);
      expect(workStub).to.have.callCount(2);
      poller.stop();
    }).then(() => {
      clock.tick(8000);
      expect(workStub).to.have.callCount(2);
    });
  });

  it('should execute work w/o initial delay', () => {
    workStub.returns(Promise.resolve());
    expect(workStub).to.have.not.been.called;
    poller.start(true);
    expect(workStub).to.be.calledOnce;
    return poller.lastWorkPromise_.then(() => {
      expect(workStub).to.be.calledOnce;
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_.then(() => {
        expect(workStub).to.have.callCount(2);
        clock.tick(4000);
        expect(workStub).to.have.callCount(3);
        poller.stop();
      });
    }).then(() => {
      clock.tick(8000);
      expect(workStub).to.have.callCount(3);
    });
  });

  it('should not double any work if already started', () => {
    workStub.returns(Promise.resolve());
    expect(workStub).to.have.not.been.called;
    poller.start();
    clock.tick(4000);
    expect(workStub).to.be.calledOnce;
    poller.start();
    return poller.lastWorkPromise_.then(() => {
      expect(workStub).to.be.calledOnce;
      poller.start();
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(2);
    });
  });

  it('should run backoff and recover on retriable error', () => {
    const retriableErr = new Error('HTTP Error');
    retriableErr.retriable = true;
    workStub.onCall(0).returns(Promise.resolve());
    workStub.onCall(1).returns(Promise.resolve());
    workStub.onCall(2).returns(Promise.reject(retriableErr));
    workStub.onCall(3).returns(Promise.reject(retriableErr));
    workStub.onCall(4).returns(Promise.reject(retriableErr));
    workStub.returns(Promise.resolve());
    expect(workStub).to.have.not.been.called;

    poller.start();
    clock.tick(4000);
    expect(workStub).to.be.calledOnce;

    return poller.lastWorkPromise_.then(() => {
      expect(workStub).to.be.calledOnce;
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(2);
      clock.tick(4000);
      expect(workStub).to.have.callCount(3);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(3);
      clock.tick(700);
      expect(workStub).to.have.callCount(4);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(4);
      clock.tick(700);
      expect(workStub).to.have.callCount(4);
      clock.tick(700);
      expect(workStub).to.have.callCount(5);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(5);
      clock.tick(2800);
      expect(workStub).to.have.callCount(6);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(6);
      clock.tick(4000);
      expect(workStub).to.have.callCount(7);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(7);
      clock.tick(4000);
      expect(workStub).to.have.callCount(8);
    });
  });

  it('should stop work if stopped', () => {
    workStub.returns(Promise.resolve());
    expect(workStub).to.have.not.been.called;
    poller.start();
    clock.tick(4000);
    expect(workStub).to.be.calledOnce;
    return poller.lastWorkPromise_.then(() => {
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      poller.stop();
      return poller.lastWorkPromise_;
    }).then(() => {
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_;
    }).then(() => {
      clock.tick(4000);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_;
    });
  });

  it('should shutoff backoff if stopped', () => {
    const retriableErr = new Error('HTTP Error');
    retriableErr.retriable = true;
    workStub.returns(Promise.reject(retriableErr));
    expect(workStub).to.have.not.been.called;
    poller.start();
    clock.tick(4000);
    expect(workStub).to.be.calledOnce;
    return poller.lastWorkPromise_.then(() => {
      expect(workStub).to.be.calledOnce;
      clock.tick(700);
      expect(workStub).to.have.callCount(2);
      return poller.lastWorkPromise_;
    }).then(() => {
      expect(workStub).to.have.callCount(2);
      clock.tick(1400);
      expect(workStub).to.have.callCount(3);
      return poller.lastWorkPromise_;
    }).then(() => {
      poller.stop();
      clock.tick(2800);
      expect(workStub).to.have.callCount(3);
      return poller.lastWorkPromise_;
    }).then(() => {
      clock.tick(5600);
      expect(workStub).to.have.callCount(3);
      return poller.lastWorkPromise_;
    }).then(() => {
      clock.tick(11200);
      expect(workStub).to.have.callCount(3);
      return poller.lastWorkPromise_;
    });
  });

  it('should clear timeout ids if stopped', () => {
    const delaySpy = sandbox.spy(timer, 'delay');
    const retriableErr = new Error('HTTP Error');
    retriableErr.retriable = true;
    workStub.onCall(0).returns(Promise.reject(retriableErr));
    workStub.onCall(1).returns(Promise.reject(retriableErr));
    workStub.returns(Promise.resolve());
    const clearSpy = sandbox.spy(timer, 'cancel');

    expect(poller.lastTimeoutId_).to.be.null;

    poller.start();
    expect(delaySpy.lastCall.args[1]).to.equal(4000);
    clock.tick(4000);

    expect(poller.lastTimeoutId_).to.be.number;
    let lastTimeoutId_ = poller.lastTimeoutId_;

    // Reject 1
    return poller.lastWorkPromise_.then(() => {
      expect(delaySpy.lastCall.args[1]).to.equal(700);
      expect(poller.lastTimeoutId_).to.not.equal(lastTimeoutId_);
      expect(poller.lastTimeoutId_).to.be.number;
      lastTimeoutId_ = poller.lastTimeoutId_;
      clock.tick(700);
      // Reject 2
      return poller.lastWorkPromise_.then(() => {
        expect(delaySpy.lastCall.args[1]).to.equal(1400);
        // Should have cancelled next queued exponential tick
        expect(poller.lastTimeoutId_).to.not.equal(lastTimeoutId_);
        expect(poller.lastTimeoutId_).to.be.number;
        lastTimeoutId_ = poller.lastTimeoutId_;
        clock.tick(1400);
        return poller.lastWorkPromise_.then(() => {
          expect(delaySpy.lastCall.args[1]).to.equal(4000);
          expect(clearSpy.getCall(2)).to.be.null;
          expect(poller.lastTimeoutId_).to.not.equal(lastTimeoutId_);
          expect(poller.lastTimeoutId_).to.be.number;
          lastTimeoutId_ = poller.lastTimeoutId_;
          expect(clearSpy).to.have.not.been.called;
          poller.stop();
          expect(clearSpy).to.be.calledOnce;
          expect(clearSpy.getCall(0).args[0]).to.equal(lastTimeoutId_);
        });
      });
    });
  });
});
