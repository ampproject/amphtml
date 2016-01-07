/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {openLoginDialog} from '../login-dialog';
import * as sinon from 'sinon';

const RETURN_URL_ESC = 'http%3A%2F%2Flocalhost%3A8000%2Fextensions' +
    '%2Famp-access%2F0.1%2Famp-login-done.html';


describe('LoginDialog', () => {

  let sandbox;
  let clock;
  let windowApi;
  let windowMock;
  let dialog;
  let dialogUrl;
  let dialogMock;
  let messageListener;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    messageListener = undefined;
    windowApi = {
      open: () => {},
      location: {
        protocol: 'http:',
        host: 'localhost:8000',
        href: 'http://localhost:8000/test-login-dialog'
      },
      screen: {width: 1000, height: 1000},
      addEventListener: (type, callback) => {
        if (type == 'message') {
          messageListener = callback;
        }
      },
      removeEventListener: (type, callback) => {
        if (type == 'message' && messageListener == callback) {
          messageListener = undefined;
        }
      },
      setTimeout: (callback, t) => window.setTimeout(callback, t),
      setInterval: (callback, t) => window.setInterval(callback, t),
      clearInterval: intervalId => window.clearInterval(intervalId)
    };
    windowMock = sandbox.mock(windowApi);

    dialogUrl = null;
    dialog = {
      closed: false,
      location: {
        replace: url => {
          dialogUrl = url;
        }
      },
      postMessage: () => {}
    };
    dialogMock = sandbox.mock(dialog);
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  function succeed() {
    messageListener({
      origin: 'http://localhost:8000',
      data: {
        sentinel: 'amp',
        type: 'result',
        result: '#success=true'
      }
    });
  }

  it('should call window.open in the same microtask with url', () => {
    windowApi.open = sandbox.spy();
    openLoginDialog(windowApi, 'http://acme.com/login');
    expect(windowApi.open.callCount).to.equal(1);
    expect(windowApi.open.firstCall.args[0]).to.match(
        /^http\:\/\/acme.com\/login\?return\=/);
  });

  it('should call window.open in the same microtask with promise', () => {
    windowApi.open = sandbox.spy();
    openLoginDialog(windowApi, Promise.resolve('http://acme.com/login'));
    expect(windowApi.open.callCount).to.equal(1);
    expect(windowApi.open.firstCall.args[0]).to.equal('');
  });

  it('should yield error if window.open fails', () => {
    windowMock.expects('open').once().throws('OPEN ERROR');
    return openLoginDialog(windowApi, 'http://acme.com/login')
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(result => {
          expect(result).to.match(/OPEN ERROR/);
          expect(messageListener).to.not.exist;
        });
  });

  it('should yield error if window.open returns null', () => {
    windowMock.expects('open').once().returns(null);
    return openLoginDialog(windowApi, 'http://acme.com/login')
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(result => {
          expect(result).to.match(/failed to open dialog/);
          expect(messageListener).to.not.exist;
        });
  });

  it('should yield error if window.open returns null with promise', () => {
    windowMock.expects('open').once().returns(null);
    return openLoginDialog(windowApi, Promise.resolve('http://acme.com/login'))
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(result => {
          expect(result).to.match(/failed to open dialog/);
          expect(messageListener).to.not.exist;
        });
  });

  it('should respond when window.open succeeds', () => {
    windowMock.expects('open').once().returns(dialog);
    const promise = openLoginDialog(windowApi, 'http://acme.com/login');
    return Promise.resolve()
        .then(() => {
          succeed();
          return promise;
        })
        .then(result => {
          expect(result).to.equal('#success=true');
          expect(messageListener).to.not.exist;
        });
  });

  it('should have correct window.open params', () => {
    windowMock.expects('open')
        .withExactArgs(
            'http://acme.com/login?return=' + RETURN_URL_ESC,
            '_blank',
            'height=450,width=700,left=150,top=275')
        .returns(dialog)
        .once();
    dialogMock.expects('postMessage')
        .withExactArgs(
            sinon.match(arg => {
              return (arg.sentinel == 'amp' && arg.type == 'result-ack');
            }),
            'http://localhost:8000')
        .once();
    const promise = openLoginDialog(windowApi, 'http://acme.com/login');
    return Promise.resolve()
        .then(() => {
          succeed();
          return promise;
        })
        .then(result => {
          expect(result).to.equal('#success=true');
        });
  });

  it('should have correct URL with other parameters', () => {
    windowMock.expects('open')
        .withExactArgs(
            'http://acme.com/login?a=1&return=' + RETURN_URL_ESC,
            '_blank',
            'height=450,width=700,left=150,top=275')
        .returns(dialog)
        .once();
    const promise = openLoginDialog(windowApi, 'http://acme.com/login?a=1');
    return Promise.resolve()
        .then(() => {
          succeed();
          return promise;
        })
        .then(result => {
          expect(result).to.equal('#success=true');
        });
  });

  it('should respond with empty string when dialog is closed', () => {
    windowMock.expects('open')
        .returns(dialog)
        .once();
    dialog.closed = true;
    const promise = openLoginDialog(windowApi, 'http://acme.com/login?a=1');
    return Promise.resolve()
        .then(() => {
          clock.tick(10000);
          clock.tick(10000);
          return promise;
        })
        .then(res => res, error => 'ERROR ' + error)
        .then(result => {
          expect(result).to.equal('');
        });
  });

  it('should succeed with URL promise', () => {
    windowMock.expects('open')
        .withArgs('')
        .returns(dialog)
        .once();
    let urlResolver;
    const urlPromise = new Promise(resolve => {
      urlResolver = resolve;
    });
    const promise = openLoginDialog(windowApi, urlPromise);
    return Promise.resolve()
        .then(() => {
          urlResolver('http://acme.com/login?a=1');
          return urlPromise;
        })
        .then(() => {
          expect(dialogUrl).to.be.equal(
            'http://acme.com/login?a=1&return=' + RETURN_URL_ESC);
          succeed();
          return promise;
        })
        .then(result => {
          expect(result).to.equal('#success=true');
          expect(messageListener).to.not.exist;
        });
  });

  it('should fail when URL promise is rejected', () => {
    windowMock.expects('open')
        .withArgs('')
        .returns(dialog)
        .once();
    const promise = openLoginDialog(windowApi, Promise.reject());
    return Promise.resolve()
        .then(() => {
          return promise;
        })
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(result => {
          expect(result).to.match(/failed to resolve url/);
          expect(messageListener).to.not.exist;
        });
  });
});
