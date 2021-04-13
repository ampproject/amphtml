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

import {Services} from '../../../src/services';
import {
  ampWorkerForTesting,
  invokeWebWorker,
} from '../../../src/web-worker/amp-worker';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {installXhrService} from '../../../src/service/xhr-impl';

describe('invokeWebWorker', () => {
  let fakeWin;

  let ampWorker;
  let postMessageStub;
  let blobStub;
  let fakeWorker;
  let fetchTextCallStub;
  let workerReadyPromise;

  beforeEach(() => {
    window.sandbox.stub(Services, 'ampdocServiceFor').returns({
      isSingleDoc: () => false,
    });

    postMessageStub = window.sandbox.stub();
    blobStub = window.sandbox.stub();

    fakeWorker = {};
    fakeWorker.postMessage = postMessageStub;

    // Fake Worker constructor just returns our `fakeWorker` instance.
    fakeWin = {
      Worker: () => fakeWorker,
      Blob: blobStub,
      URL: {createObjectURL: window.sandbox.stub()},
      location: window.location,
    };

    // Stub xhr.fetchText() to return a resolved promise.
    installXhrService(fakeWin);
    fetchTextCallStub = window.sandbox
      .stub(Services.xhrFor(fakeWin), 'fetchText')
      .callsFake(() =>
        Promise.resolve({
          text() {
            return Promise.resolve('//# sourceMappingURL=foo.js');
          },
        })
      );

    ampWorker = ampWorkerForTesting(fakeWin);
    workerReadyPromise = ampWorker.fetchPromiseForTesting();
  });

  it('should check if Worker is supported', () => {
    fakeWin.Worker = undefined;
    return expect(
      invokeWebWorker(fakeWin, 'foo')
    ).to.eventually.be.rejectedWith('not supported');
  });

  it('should send and receive a message', () => {
    // Sending.
    const invokePromise = invokeWebWorker(fakeWin, 'foo', ['bar', 123]);
    getMode(fakeWin).bypassInterceptorForDev = true;

    return workerReadyPromise.then(() => {
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'foo',
        args: window.sandbox.match(['bar', 123]),
        id: 0,
      });

      expect(fetchTextCallStub).to.have.been.calledWithMatch(
        'http://localhost:9876/dist/ww.js',
        {
          ampCors: false,
          bypassInterceptorForDev: true,
        }
      );

      // Receiving.
      const data = {
        method: 'foo',
        returnValue: {'qux': 456},
        id: 0,
      };
      fakeWorker.onmessage({data});

      return invokePromise.then((returnValue) => {
        expect(returnValue).to.deep.equals({'qux': 456});
      });
    });
  });

  it('should differentiate messages of different methods', () => {
    const foo = invokeWebWorker(fakeWin, 'foo', ['foo-arg']);
    const bar = invokeWebWorker(fakeWin, 'bar', ['bar-arg']);
    const qux = invokeWebWorker(fakeWin, 'qux', ['qux-arg']);

    return workerReadyPromise.then(() => {
      fakeWorker.onmessage({
        data: {
          method: 'bar',
          returnValue: 'bar-retVal',
          id: 1,
        },
      });
      fakeWorker.onmessage({
        data: {
          method: 'qux',
          returnValue: 'qux-retVal',
          id: 2,
        },
      });
      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: 'foo-retVal',
          id: 0,
        },
      });

      return Promise.all([foo, bar, qux]).then((values) => {
        expect(values[0]).to.equal('foo-retVal');
        expect(values[1]).to.equal('bar-retVal');
        expect(values[2]).to.equal('qux-retVal');
      });
    });
  });

  it('should differentiate messages of same method with different ids', () => {
    const one = invokeWebWorker(fakeWin, 'foo', ['one']);
    const two = invokeWebWorker(fakeWin, 'foo', ['two']);
    const three = invokeWebWorker(fakeWin, 'foo', ['three']);

    return workerReadyPromise.then(() => {
      expect(postMessageStub.firstCall).to.have.been.calledWithMatch({
        method: 'foo',
        id: 0,
      });
      expect(postMessageStub.secondCall).to.have.been.calledWithMatch({
        method: 'foo',
        id: 1,
      });
      expect(postMessageStub.thirdCall).to.have.been.calledWithMatch({
        method: 'foo',
        id: 2,
      });

      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: 'three',
          id: 2,
        },
      });
      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: 'one',
          id: 0,
        },
      });
      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: 'two',
          id: 1,
        },
      });

      return Promise.all([one, two, three]).then((values) => {
        expect(values[0]).to.equal('one');
        expect(values[1]).to.equal('two');
        expect(values[2]).to.equal('three');
      });
    });
  });

  it('should log error when unexpected message is received', () => {
    const errorStub = window.sandbox.stub(dev(), 'error');

    invokeWebWorker(fakeWin, 'foo');

    return workerReadyPromise.then(() => {
      expect(errorStub.callCount).to.equal(0);

      // Unexpected `id` value.
      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: undefined,
          id: 3,
        },
      });
      expect(errorStub.callCount).to.equal(1);
      expect(errorStub).to.have.been.calledWith('web-worker');

      // Unexpected method at valid `id`.
      allowConsoleError(() => {
        expect(() => {
          fakeWorker.onmessage({
            data: {
              method: 'bar',
              returnValue: undefined,
              id: 0,
            },
          });
        }).to.throw('mismatched method');
      });
    });
  });

  it('should clean up storage after message completion', () => {
    invokeWebWorker(fakeWin, 'foo');

    return workerReadyPromise.then(() => {
      expect(ampWorker.hasPendingMessages()).to.be.true;

      fakeWorker.onmessage({
        data: {
          method: 'foo',
          returnValue: 'abc',
          id: 0,
        },
      });

      expect(ampWorker.hasPendingMessages()).to.be.false;
    });
  });

  it('should send unique scope IDs per `opt_localWin` value', () => {
    const scopeOne = {};
    const scopeTwo = {};

    // Sending.
    invokeWebWorker(fakeWin, 'a'); // Default scope == 0.
    invokeWebWorker(fakeWin, 'b', undefined, /* opt_localWin */ scopeOne);
    invokeWebWorker(fakeWin, 'c', undefined, /* opt_localWin */ scopeTwo);
    invokeWebWorker(fakeWin, 'd', undefined, /* opt_localWin */ scopeOne);
    invokeWebWorker(fakeWin, 'e', undefined, /* opt_localWin */ fakeWin);

    return workerReadyPromise.then(() => {
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'a',
        scope: 0,
      });
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'b',
        scope: 1,
      });
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'c',
        scope: 2,
      });
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'd',
        scope: 1,
      });
      expect(postMessageStub).to.have.been.calledWithMatch({
        method: 'e',
        scope: 0,
      });
    });
  });

  it('should replace the relative sourceMappingURL with the absolute one', () => {
    invokeWebWorker(fakeWin, 'foo', ['bar', 123]);
    getMode(fakeWin).bypassInterceptorForDev = true;

    return workerReadyPromise.then(() => {
      expect(blobStub).to.have.been.calledWithMatch(
        [
          '//# sourceMappingURL=http://localhost:9876/dist/ww.js.map\n//# sourceurl=http://localhost:9876/dist/ww.js',
        ],
        {
          type: 'text/javascript',
        }
      );
    });
  });
});
