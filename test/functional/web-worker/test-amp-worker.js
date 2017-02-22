/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../../../src/log';
import {
  invokeWebWorker,
  ampWorkerForTesting,
} from '../../../src/web-worker/amp-worker';
import {toggleExperiment} from '../../../src/experiments';
import * as sinon from 'sinon';

describe('invokeWebWorker', () => {
  let sandbox;
  let fakeWin;
  let postMessageStub;
  let fakeWorker;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    postMessageStub = sandbox.stub();

    fakeWorker = {};
    fakeWorker.postMessage = postMessageStub;

    const fakeWorkerClass = () => fakeWorker;
    fakeWin = {Worker: fakeWorkerClass};

    toggleExperiment(
        fakeWin,
        'web-worker',
        /* opt_on */ true,
        /* opt_transientExperiment */ true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should check if experiment is enabled', () => {
    toggleExperiment(
        fakeWin,
        'web-worker',
        /* opt_on */ false,
        /* opt_transientExperiment */ true);
    return expect(invokeWebWorker(fakeWin, 'foo'))
        .to.eventually.be.rejectedWith('disabled');
  });

  it('should check if Worker is supported', () => {
    fakeWin.Worker = undefined;
    return expect(invokeWebWorker(fakeWin, 'foo'))
        .to.eventually.be.rejectedWith('not supported');
  });

  it('should send and receive a message', () => {
    // Sending.
    const promise = invokeWebWorker(fakeWin, 'foo', ['bar', 123]);
    expect(postMessageStub).to.have.been.calledWithMatch({
      method: 'foo',
      args: sinon.match(['bar', 123]),
      id: 0,
    });
    // Receiving.
    const data = {
      method: 'foo',
      returnValue: {'qux': 456},
      id: 0,
    };
    fakeWorker.onmessage({data});
    return promise.then(returnValue => {
      expect(returnValue).to.deep.equals({'qux': 456});
    });
  });

  it('should differentiate messages of different methods', () => {
    const foo = invokeWebWorker(fakeWin, 'foo', ['foo-arg']);
    const bar = invokeWebWorker(fakeWin, 'bar', ['bar-arg']);
    const qux = invokeWebWorker(fakeWin, 'qux', ['qux-arg']);

    fakeWorker.onmessage({data: {
      method: 'bar',
      returnValue: 'bar-retVal',
      id: 1,
    }});
    fakeWorker.onmessage({data: {
      method: 'qux',
      returnValue: 'qux-retVal',
      id: 2,
    }});
    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: 'foo-retVal',
      id: 0,
    }});

    return Promise.all([foo, bar, qux]).then(values => {
      expect(values[0]).to.equal('foo-retVal');
      expect(values[1]).to.equal('bar-retVal');
      expect(values[2]).to.equal('qux-retVal');
    });
  });

  it('should differentiate messages of same method with different ids', () => {
    const one = invokeWebWorker(fakeWin, 'foo', ['one']);
    expect(postMessageStub).to.have.been.calledWithMatch({
      method: 'foo',
      id: 0,
    });
    const two = invokeWebWorker(fakeWin, 'foo', ['two']);
    expect(postMessageStub).to.have.been.calledWithMatch({
      method: 'foo',
      id: 1,
    });
    const three = invokeWebWorker(fakeWin, 'foo', ['three']);
    expect(postMessageStub).to.have.been.calledWithMatch({
      method: 'foo',
      id: 2,
    });

    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: 'three',
      id: 2,
    }});
    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: 'one',
      id: 0,
    }});
    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: 'two',
      id: 1,
    }});

    return Promise.all([one, two, three]).then(values => {
      expect(values[0]).to.equal('one');
      expect(values[1]).to.equal('two');
      expect(values[2]).to.equal('three');
    });
  });

  it('should log error when unexpected message is received', () => {
    const errorStub = sandbox.stub(dev(), 'error');
    invokeWebWorker(fakeWin, 'foo');
    expect(errorStub.callCount).to.equal(0);

    // Unexpected `id` value.
    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: undefined,
      id: 3,
    }});
    expect(errorStub.callCount).to.equal(1);
    expect(errorStub).to.have.been.calledWith('web-worker');

    // Unexpected method at valid `id`.
    expect(() => {
      fakeWorker.onmessage({data: {
        method: 'bar',
        returnValue: undefined,
        id: 0,
      }});
    }).to.throw('mismatched method');
  });

  it('should clean up storage after message completion', () => {
    const ampWorker = ampWorkerForTesting(fakeWin);

    invokeWebWorker(fakeWin, 'foo');

    expect(ampWorker.hasPendingMessages()).to.be.true;

    fakeWorker.onmessage({data: {
      method: 'foo',
      returnValue: 'abc',
      id: 0,
    }});

    expect(ampWorker.hasPendingMessages()).to.be.false;
  });
});
