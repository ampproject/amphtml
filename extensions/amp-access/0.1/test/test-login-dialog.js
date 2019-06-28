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

import {Services} from '../../../../src/services';
import {WebLoginDialog, openLoginDialog} from '../login-dialog';
import {installDocService} from '../../../../src/service/ampdoc-impl';

const RETURN_URL_ESC = encodeURIComponent(
  'http://localhost:8000/extensions' +
    '/amp-access/0.1/amp-login-done.html?url=' +
    encodeURIComponent('http://localhost:8000/test-login-dialog')
);

describes.sandboxed('ViewerLoginDialog', {}, () => {
  let ampdoc;
  let viewer;
  let windowApi;

  beforeEach(() => {
    sandbox = sinon.sandbox;

    viewer = {
      getParam: param => {
        if (param == 'dialog') {
          return '1';
        }
        return null;
      },
      sendMessageAwaitResponse: () => {},
    };

    windowApi = {
      services: {
        'viewer': {obj: viewer},
      },
      screen: {width: 1000, height: 1000},
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
      },
      open: () => {
        throw new Error('Not allowed');
      },
      addEventListener: () => {
        throw new Error('Not allowed');
      },
      setTimeout: () => {
        throw new Error('Not allowed');
      },
      setInterval: () => {
        throw new Error('Not allowed');
      },
    };
    windowApi.document.defaultView = windowApi;
    installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = Services.ampdocServiceFor(windowApi).getAmpDoc();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should delegate to viewer with url', () => {
    const stub = sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve('#success=yes'));
    return openLoginDialog(ampdoc, 'http://acme.com/login').then(res => {
      expect(res).to.equal('#success=yes');
      expect(stub).to.be.calledOnce;
      expect(stub.firstCall.args[0]).to.equal('openDialog');
      expect(stub.firstCall.args[1]).to.deep.equal({
        'url': 'http://acme.com/login?return=RETURN_URL',
      });
    });
  });

  it('should delegate to viewer with url promise', () => {
    const stub = sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve('#success=yes'));
    const urlPromise = Promise.resolve('http://acme.com/login');
    return openLoginDialog(ampdoc, urlPromise).then(res => {
      expect(res).to.equal('#success=yes');
      expect(stub).to.be.calledOnce;
      expect(stub.firstCall.args[0]).to.equal('openDialog');
      expect(stub.firstCall.args[1]).to.deep.equal({
        'url': 'http://acme.com/login?return=RETURN_URL',
      });
    });
  });

  it('should fail when url promise fails', () => {
    sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve('#success=yes'));
    const urlPromise = Promise.reject('expected');
    return openLoginDialog(ampdoc, urlPromise).then(
      () => {
        throw new Error('must not be here');
      },
      reason => {
        expect(reason).to.equal('expected');
      }
    );
  });

  it('should fail when viewer fails', () => {
    sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.reject('expected'));
    return openLoginDialog(ampdoc, 'http://acme.com/login').then(
      () => {
        throw new Error('must not be here');
      },
      reason => {
        expect(reason).to.equal('expected');
      }
    );
  });

  it('should have correct URL with other parameters', () => {
    const stub = sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve('#success=yes'));
    const url = 'http://acme.com/login?a=b';
    return openLoginDialog(ampdoc, url).then(() => {
      expect(stub.firstCall.args[1]).to.deep.equal({
        'url': 'http://acme.com/login?a=b&return=RETURN_URL',
      });
    });
  });

  it('should allow alternative form of return URL', () => {
    const stub = sandbox
      .stub(viewer, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve('#success=yes'));
    const url = 'http://acme.com/login?a=b&ret1=RETURN_URL';
    return openLoginDialog(ampdoc, url).then(() => {
      expect(stub.firstCall.args[1]).to.deep.equal({
        'url': 'http://acme.com/login?a=b&ret1=RETURN_URL',
      });
    });
  });
});

describes.sandboxed('WebLoginDialog', {}, () => {
  let clock;
  let viewer;
  let windowApi;
  let windowMock;
  let ampdoc;
  let dialog;
  let dialogUrl;
  let dialogMock;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();

    viewer = {
      getParam: () => null,
      getResolvedViewerUrl: () => 'http://localhost:8000/test-login-dialog',
    };
    const windowObj = {
      services: {
        'viewer': {obj: viewer},
      },
      open: () => {},
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
      },
      location: {
        protocol: 'http:',
        host: 'localhost:8000',
      },
      screen: {width: 1000, height: 1000},
      addEventListener: (type, callback) => {
        if (type == 'message') {
          windowObj.messageListener = callback;
        }
      },
      removeEventListener: (type, callback) => {
        if (type == 'message' && windowObj.messageListener == callback) {
          windowObj.messageListener = undefined;
        }
      },
      setTimeout: (callback, t) => window.setTimeout(callback, t),
      setInterval: (callback, t) => window.setInterval(callback, t),
      clearInterval: intervalId => window.clearInterval(intervalId),
    };
    windowApi = windowObj;
    windowApi.document.defaultView = windowApi;
    windowMock = sandbox.mock(windowApi);
    installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = Services.ampdocServiceFor(windowApi).getAmpDoc();

    dialogUrl = null;
    dialog = {
      closed: false,
      location: {
        replace: url => {
          dialogUrl = url;
        },
      },
      postMessage: () => {},
    };
    dialogMock = sandbox.mock(dialog);
  });

  afterEach(() => {
    windowMock.verify();
  });

  function succeed() {
    windowApi.messageListener({
      origin: 'http://localhost:8000',
      data: {
        sentinel: 'amp',
        type: 'result',
        result: '#success=true',
      },
    });
  }

  it('should call window.open in the same microtask with url', () => {
    sandbox.stub(windowApi, 'open').callsFake(() => dialog);
    openLoginDialog(ampdoc, 'http://acme.com/login');
    expect(windowApi.open).to.be.calledOnce;
    expect(windowApi.open.firstCall.args[0]).to.match(
      /^http\:\/\/acme.com\/login\?return\=/
    );
  });

  it('should call window.open in the same microtask with promise', () => {
    sandbox.stub(windowApi, 'open').callsFake(() => dialog);
    openLoginDialog(ampdoc, Promise.resolve('http://acme.com/login'));
    expect(windowApi.open).to.be.calledOnce;
    expect(windowApi.open.firstCall.args[0]).to.equal('');
  });

  it('should yield error if window.open fails', () => {
    // Open is called twice due to retry on _top.
    windowMock
      .expects('open')
      .twice()
      .throws('OPEN ERROR');
    return openLoginDialog(ampdoc, 'http://acme.com/login')
      .then(() => 'SUCCESS', error => 'ERROR ' + error)
      .then(result => {
        expect(result).to.match(/OPEN ERROR/);
        expect(windowApi.messageListener).to.not.exist;
      });
  });

  it('should yield error if window.open returns null', () => {
    // Open is called twice due to retry on _top.
    windowMock
      .expects('open')
      .twice()
      .returns(null);
    return openLoginDialog(ampdoc, 'http://acme.com/login')
      .then(() => 'SUCCESS', error => 'ERROR ' + error)
      .then(result => {
        expect(result).to.match(/failed to open dialog/);
        expect(windowApi.messageListener).to.not.exist;
      });
  });

  it('should yield error if window.open returns null with promise', () => {
    // Open is called twice due to retry on _top.
    windowMock
      .expects('open')
      .twice()
      .returns(null);
    return openLoginDialog(ampdoc, Promise.resolve('http://acme.com/login'))
      .then(() => 'SUCCESS', error => 'ERROR ' + error)
      .then(result => {
        expect(result).to.match(/failed to open dialog/);
        expect(windowApi.messageListener).to.not.exist;
      });
  });

  it('should respond when window.open succeeds', () => {
    windowMock
      .expects('open')
      .once()
      .returns(dialog);
    const promise = openLoginDialog(ampdoc, 'http://acme.com/login');
    return Promise.resolve()
      .then(() => {
        succeed();
        return promise;
      })
      .then(result => {
        expect(result).to.equal('#success=true');
        expect(windowApi.messageListener).to.not.exist;
      });
  });

  it('should have correct window.open params', () => {
    windowMock
      .expects('open')
      .withExactArgs(
        'http://acme.com/login?return=' + RETURN_URL_ESC,
        '_blank',
        'height=450,width=700,left=150,top=275' +
          ',resizable=yes,scrollbars=yes'
      )
      .returns(dialog)
      .once();
    dialogMock
      .expects('postMessage')
      .withExactArgs(
        sinon.match(arg => {
          return arg.sentinel == 'amp' && arg.type == 'result-ack';
        }),
        'http://localhost:8000'
      )
      .once();
    const promise = openLoginDialog(ampdoc, 'http://acme.com/login');
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
    windowMock
      .expects('open')
      .withExactArgs(
        'http://acme.com/login?a=1&return=' + RETURN_URL_ESC,
        '_blank',
        'height=450,width=700,left=150,top=275' +
          ',resizable=yes,scrollbars=yes'
      )
      .returns(dialog)
      .once();
    const promise = openLoginDialog(ampdoc, 'http://acme.com/login?a=1');
    return Promise.resolve()
      .then(() => {
        succeed();
        return promise;
      })
      .then(result => {
        expect(result).to.equal('#success=true');
      });
  });

  it('should substitute return URL', () => {
    windowMock
      .expects('open')
      .withExactArgs(
        'http://acme.com/login?a=1&ret1=' + RETURN_URL_ESC,
        '_blank',
        'height=450,width=700,left=150,top=275' +
          ',resizable=yes,scrollbars=yes'
      )
      .returns(dialog)
      .once();
    const promise = openLoginDialog(
      ampdoc,
      'http://acme.com/login?a=1&ret1=RETURN_URL'
    );
    return Promise.resolve()
      .then(() => {
        succeed();
        return promise;
      })
      .then(result => {
        expect(result).to.equal('#success=true');
      });
  });

  it('should override return URL', () => {
    viewer.getResolvedViewerUrl = () => 'http://acme.com/viewer1';
    windowMock
      .expects('open')
      .withArgs(
        'http://acme.com/login?a=1&ret1=' +
          encodeURIComponent(
            'http://localhost:8000/extensions' +
              '/amp-access/0.1/amp-login-done.html?url=' +
              encodeURIComponent('http://acme.com/viewer1')
          )
      )
      .returns(dialog)
      .once();
    const promise = openLoginDialog(
      ampdoc,
      'http://acme.com/login?a=1&ret1=RETURN_URL'
    );
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
    windowMock
      .expects('open')
      .returns(dialog)
      .once();
    dialog.closed = true;
    const promise = openLoginDialog(ampdoc, 'http://acme.com/login?a=1');
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
    windowMock
      .expects('open')
      .withArgs('')
      .returns(dialog)
      .once();
    let urlResolver;
    const urlPromise = new Promise(resolve => {
      urlResolver = resolve;
    });
    const dialogObj = new WebLoginDialog(windowApi, viewer, urlPromise);
    const promise = dialogObj.open();
    expect(dialogObj.dialogReadyPromise_).to.be.ok;
    urlResolver('http://acme.com/login?a=1');
    return urlPromise
      .then(() => {
        return dialogObj.dialogReadyPromise_;
      })
      .then(() => {
        expect(dialogUrl).to.be.equal(
          'http://acme.com/login?a=1&return=' + RETURN_URL_ESC
        );
        succeed();
        return promise;
      })
      .then(result => {
        expect(result).to.equal('#success=true');
        expect(windowApi.messageListener).to.not.exist;
      });
  });

  it('should fail when URL promise is rejected', () => {
    windowMock
      .expects('open')
      .withArgs('')
      .returns(dialog)
      .once();
    const promise = openLoginDialog(ampdoc, Promise.reject());
    return Promise.resolve()
      .then(() => {
        return promise;
      })
      .then(() => 'SUCCESS', error => 'ERROR ' + error)
      .then(result => {
        expect(result).to.match(/failed to resolve url/);
        expect(windowApi.messageListener).to.not.exist;
      });
  });
});
