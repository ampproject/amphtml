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

import * as lolex from 'lolex';
import {AccessIframeAdapter} from '../amp-access-iframe';
import {Messenger} from '../iframe-api/messenger';
import {dev} from '../../../../src/log';


describes.fakeWin('AccessIframeAdapter', {
  amp: true,
}, env => {
  let ampdoc;
  let clock;
  let validConfig;
  let context;
  let contextMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    clock = lolex.install({target: ampdoc.win});

    validConfig = {
      'iframeSrc': 'https://acme.com/iframe',
      'defaultResponse': {
        'response': 'default',
      },
    };

    context = {
      buildUrl: () => {},
      collectUrlVars: () => {},
    };
    contextMock = sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
    clock.uninstall();
  });


  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      expect(adapter.getConfig()).to.deep.equal({
        'iframeSrc': 'https://acme.com/iframe',
        'iframeVars': null,
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should load valid config with vars', () => {
      validConfig['iframeVars'] = ['VAR1'];
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      expect(adapter.getConfig()).to.deep.equal({
        'iframeSrc': 'https://acme.com/iframe',
        'iframeVars': ['VAR1'],
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should require "iframeSrc"', () => {
      delete validConfig['iframeSrc'];
      allowConsoleError(() => { expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/iframeSrc/); });
    });

    it('should require "iframeSrc" to be secure', () => {
      validConfig['iframeSrc'] = 'http://acme.com/iframe';
      allowConsoleError(() => { expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/https/); });
    });

    it('should require "defaultResponse"', () => {
      delete validConfig['defaultResponse'];
      allowConsoleError(() => { expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/defaultResponse/); });
    });

    it('should disallow non-array vars', () => {
      validConfig['iframeVars'] = {};
      allowConsoleError(() => { expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/array/); });
    });
  });


  describe('runtime connect', () => {
    it('should NOT connect until necessary', () => {
      const connectStub = sandbox.stub(Messenger.prototype, 'connect');
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      expect(adapter.connectedPromise_).to.be.null;
      expect(adapter.iframe_.parentNode).to.be.null;
      expect(connectStub).to.not.be.called;
    });

    it('should connect on first and only first authorize', () => {
      const connectStub = sandbox.stub(Messenger.prototype, 'connect');
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      adapter.authorize();
      expect(adapter.connectedPromise_).to.not.be.null;
      expect(adapter.iframe_.parentNode).to.not.be.null;
      expect(connectStub).to.be.calledOnce;
    });

    it('should resolve vars', () => {
      contextMock.expects('collectUrlVars')
          .withExactArgs('VAR1&VAR2', false)
          .returns(Promise.resolve({
            'VAR1': 'A',
            'VAR2': 'B',
          }))
          .once();
      validConfig['iframeVars'] = ['VAR1', 'VAR2'];
      const sendStub = sandbox.stub(Messenger.prototype, 'sendCommandRsvp')
          .returns(Promise.resolve({}));
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      const promise = adapter.connect();
      adapter.handleCommand_('connect');
      return promise.then(() => {
        expect(sendStub).to.be.calledOnce;
        expect(sendStub).to.be.calledWithExactly('start', {
          'protocol': 'amp-access',
          'config': Object.assign({}, validConfig, {
            'iframeVars': {
              'VAR1': 'A',
              'VAR2': 'B',
            },
          }),
        });
      });
    });
  });


  describe('runtime', () => {
    let adapter;
    let messengerMock;
    let storage, storageMock;

    beforeEach(() => {
      storage = {
        getItem: () => {},
        setItem: () => {},
        removeItem: () => {},
      };
      storageMock = sandbox.mock(storage);
      Object.defineProperty(ampdoc.win, 'sessionStorage', {get: () => storage});
      adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      messengerMock = sandbox.mock(adapter.messenger_);
    });

    afterEach(() => {
      messengerMock.verify();
      storageMock.verify();
    });

    it('should connect', () => {
      return adapter.connectedPromise_;
    });

    describe('authorize', () => {
      beforeEach(() => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('start', {
              'protocol': 'amp-access',
              'config': validConfig,
            })
            .returns(Promise.resolve())
            .once();
        adapter.connect();
        adapter.handleCommand_('connect');
      });

      it('should issue authorization', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(Promise.resolve({a: 1}))
            .once();
        return adapter.authorize().then(result => {
          expect(result).to.deep.equal({a: 1});
        });
      });

      it('should default to the default response', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(new Promise(() => {}))
            .once();
        const p = adapter.authorize();
        clock.tick(3001);
        return p.then(result => {
          expect(result).to.deep.equal({response: 'default'});
        });
      });

      it('should store successful authorization', () => {
        const data = {a: 1};
        storageMock.expects('setItem')
            .withExactArgs('amp-access-iframe', JSON.stringify({
              't': ampdoc.win.Date.now(),
              'd': data,
            }))
            .once();
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(Promise.resolve(data))
            .once();
        return adapter.authorize().then(() => {
          // Skip a microtask.
          return Promise.resolve().then(() => Promise.resolve());
        });
      });

      it('should recover the response from storage', () => {
        const data = {a: 1};
        storageMock.expects('getItem')
            .withExactArgs('amp-access-iframe')
            .returns(JSON.stringify({
              't': ampdoc.win.Date.now() - 1000 * 60 * 60 * 24 * 7 + 3000 + 2,
              'd': data,
            }))
            .once();
        storageMock.expects('removeItem')
            .withExactArgs('amp-access-iframe')
            .never();
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(new Promise(() => {}))
            .once();
        const p = adapter.authorize();
        clock.tick(3001);
        return p.then(result => {
          expect(result).to.deep.equal(data);
        });
      });

      it('should reject the expired response from storage', () => {
        const data = {a: 1};
        storageMock.expects('getItem')
            .withExactArgs('amp-access-iframe')
            .returns(JSON.stringify({
              't': ampdoc.win.Date.now() - 1000 * 60 * 60 * 24 * 7 + 3000 - 1,
              'd': data,
            }))
            .once();
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(new Promise(() => {}))
            .once();
        const p = adapter.authorize();
        clock.tick(3001);
        return p.then(result => {
          expect(result).to.deep.equal({response: 'default'});
        });
      });

      it('should tolerate storage failures', () => {
        const devErrorStub = sandbox.stub(dev(), 'error');
        storageMock.expects('getItem')
            .withExactArgs('amp-access-iframe')
            .throws(new Error('intentional'))
            .once();
        storageMock.expects('removeItem')
            .withExactArgs('amp-access-iframe')
            // Ensure that removal errors are also tolerated.
            .throws(new Error('intentional'))
            .once();
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(new Promise(() => {}))
            .once();
        const p = adapter.authorize();
        clock.tick(3001);
        return p.then(result => {
          expect(result).to.deep.equal({response: 'default'});
          expect(devErrorStub).to.be.calledOnce;
          expect(devErrorStub.args[0][1]).to.match(/failed to restore/);
        });
      });

      it('should ignore absent storage', () => {
        storage = null;
        storageMock.expects('getItem')
            .withExactArgs('amp-access-iframe')
            .never();
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            // Never resolved.
            .returns(new Promise(() => {}))
            .once();
        const p = adapter.authorize();
        clock.tick(3001);
        return p.then(result => {
          expect(result).to.deep.equal({response: 'default'});
        });
      });
    });

    describe('pingback', () => {
      beforeEach(() => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('start', {
              'protocol': 'amp-access',
              'config': validConfig,
            })
            .returns(Promise.resolve())
            .once();
        adapter.connect();
        adapter.handleCommand_('connect');
      });

      it('should send pingback', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('pingback', {})
            .returns(Promise.resolve())
            .once();
        return adapter.pingback();
      });
    });

    describe('actions', () => {
      it('should reset stored state after action', () => {
        storageMock.expects('removeItem')
            .withExactArgs('amp-access-iframe')
            .once();
        adapter.postAction();
      });
    });
  });
});
