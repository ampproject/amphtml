import {Messenger} from '../iframe-api/messenger';

describes.fakeWin('Messenger', {}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  describe('ampdoc side', () => {
    let messenger;
    let source;
    let onCommand;
    let addEventListenerSpy, removeEventListenerSpy;

    beforeEach(() => {
      // A port knows the origin, but doesn't always know the source window.
      source = null;
      messenger = new Messenger(win, () => source, 'https://example-sp.com');
      onCommand = env.sandbox.spy();
      addEventListenerSpy = env.sandbox.spy(win, 'addEventListener');
      removeEventListenerSpy = env.sandbox.spy(win, 'removeEventListener');
      messenger.connect(onCommand);
    });

    it('should now allow connecting twice', () => {
      expect(() => {
        messenger.connect(onCommand);
      }).to.throw(/already connected/);
    });

    it('should add and remove message listener', () => {
      expect(addEventListenerSpy).to.be.calledOnce;
      expect(addEventListenerSpy.args[0][0]).to.equal('message');
      const handler = addEventListenerSpy.args[0][1];
      expect(typeof handler).to.equal('function');

      // Disconnect.
      messenger.disconnect();
      expect(removeEventListenerSpy).to.be.calledOnce;
      expect(removeEventListenerSpy.args[0][0]).to.equal('message');
      expect(removeEventListenerSpy.args[0][1]).to.equal(handler);
    });

    it('should fail target until connected', () => {
      expect(() => {
        messenger.getTarget();
      }).to.throw(/not connected/);
    });

    it('should succeed target once connected', () => {
      source = {};
      expect(messenger.getTarget()).to.equal(source);
    });

    it('should return origin immediately', () => {
      expect(messenger.isConnected()).to.be.true;
      expect(messenger.getTargetOrigin()).to.equal('https://example-sp.com');
    });

    it('should fail sending a command until connected', () => {
      expect(() => {
        messenger.sendCommand('start', {});
      }).to.throw(/not connected/);
    });

    it('should send a command once connected', () => {
      source = {
        postMessage: env.sandbox.spy(),
      };
      messenger.sendCommand('start', {a: 1});
      expect(source.postMessage).to.be.calledOnce;
      expect(source.postMessage.args[0][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: undefined,
        cmd: 'start',
        payload: {a: 1},
      });
      expect(source.postMessage.args[0][1]).to.equal('https://example-sp.com');
    });

    it('should call an inbound command', () => {
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {sentinel: '__AMP__', cmd: 'connect', payload: {a: 1}},
      });
      expect(onCommand).to.be.calledOnce;
      expect(onCommand.args[0][0]).to.equal('connect');
      expect(onCommand.args[0][1]).to.deep.equal({a: 1});
    });

    it('should ignore an inbound non-conforming message', () => {
      const handler = addEventListenerSpy.args[0][1];
      handler({data: null});
      handler({data: 0});
      handler({data: 10});
      handler({data: ''});
      handler({data: 'abc'});
      handler({data: {}});
      handler({data: {cmd: 'connect'}});
      handler({data: {sentinel: '__OTHER__', cmd: 'connect'}});
      expect(onCommand).to.not.be.called;
    });

    it('should ignore an inbound command for a wrong origin', () => {
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://other-sp.com',
        data: {sentinel: '__AMP__', cmd: 'connect'},
      });
      expect(onCommand).to.not.be.called;
    });

    it('should send and receive a rsvp command', () => {
      source = {
        postMessage: env.sandbox.spy(),
      };
      const promise = messenger.sendCommandRsvp('authorize', {a: 1});
      expect(source.postMessage).to.be.calledOnce;
      expect(source.postMessage.args[0][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: '1',
        cmd: 'authorize',
        payload: {a: 1},
      });
      expect(source.postMessage.args[0][1]).to.equal('https://example-sp.com');
      expect(messenger.waiting_[1]).to.exist;
      expect(messenger.waiting_[1].promise).to.equal(promise);

      // RSVP.
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {
          sentinel: '__AMP__',
          cmd: 'rsvp',
          _rsvp: '1',
          payload: {result: {a: 2}},
        },
      });
      return promise.then((result) => {
        expect(result).to.deep.equal({a: 2});
      });
    });

    it('should increment rvsp', () => {
      source = {
        postMessage: env.sandbox.spy(),
      };
      messenger.sendCommandRsvp('authorize', {});
      expect(source.postMessage.args[0][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: '1',
        cmd: 'authorize',
        payload: {},
      });

      messenger.sendCommandRsvp('pingback', {});
      expect(source.postMessage.args[1][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: '2',
        cmd: 'pingback',
        payload: {},
      });
    });

    it('should send and receive a rsvp command with error', () => {
      source = {
        postMessage: env.sandbox.spy(),
      };
      const promise = messenger.sendCommandRsvp('authorize', {a: 1});
      expect(source.postMessage).to.be.calledOnce;
      expect(source.postMessage.args[0][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: '1',
        cmd: 'authorize',
        payload: {a: 1},
      });
      expect(source.postMessage.args[0][1]).to.equal('https://example-sp.com');
      expect(messenger.waiting_[1]).to.exist;
      expect(messenger.waiting_[1].promise).to.equal(promise);

      // RSVP.
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {
          sentinel: '__AMP__',
          cmd: 'rsvp',
          _rsvp: '1',
          payload: {error: 'intentional'},
        },
      });
      return promise.then(
        () => {
          throw new Error('must have failed');
        },
        (reason) => {
          expect(() => {
            throw reason;
          }).to.throw(/intentional/);
        }
      );
    });

    describe('execute rsvp', () => {
      let sendStub;
      let sendPromise;
      let handler;
      let handlerResponse;

      beforeEach(() => {
        env.sandbox
          .stub(messenger, 'handleCommand_')
          .callsFake(() => handlerResponse);
        let sendResolver;
        sendPromise = new Promise((resolve) => {
          sendResolver = resolve;
        });
        sendStub = env.sandbox.stub(messenger, 'sendCommand_').callsFake(() => {
          sendResolver();
        });
        handler = addEventListenerSpy.args[0][1];
      });

      it('should execute rsvp as a promise', () => {
        handlerResponse = Promise.resolve({b: 1});
        handler({
          origin: 'https://example-sp.com',
          data: {
            sentinel: '__AMP__',
            cmd: 'authorize',
            payload: {a: 1},
            _rsvp: '11',
          },
        });
        return sendPromise.then(() => {
          expect(sendStub).to.be.calledWithExactly('11', 'rsvp', {
            'result': {b: 1},
          });
        });
      });

      it('should execute rsvp as an object', () => {
        handlerResponse = {b: 1};
        handler({
          origin: 'https://example-sp.com',
          data: {
            sentinel: '__AMP__',
            cmd: 'authorize',
            payload: {a: 1},
            _rsvp: '11',
          },
        });
        return sendPromise.then(() => {
          expect(sendStub).to.be.calledWithExactly('11', 'rsvp', {
            'result': {b: 1},
          });
        });
      });

      it('should execute rsvp as an error', () => {
        handlerResponse = Promise.reject(new Error('intentional'));
        handler({
          origin: 'https://example-sp.com',
          data: {
            sentinel: '__AMP__',
            cmd: 'authorize',
            payload: {a: 1},
            _rsvp: '11',
          },
        });
        return sendPromise.then(() => {
          expect(sendStub).to.be.calledWith('11', 'rsvp');
          expect(sendStub.args[0][2].error).to.be.match(/intentional/);
        });
      });
    });
  });

  describe('iframe side', () => {
    let messenger;
    let target;
    let onCommand;
    let addEventListenerSpy;

    beforeEach(() => {
      // A host knows the target window, but not the origin.
      target = {
        postMessage: env.sandbox.spy(),
      };
      messenger = new Messenger(win, target, /* targetOrigin */ null);
      onCommand = env.sandbox.spy();
      addEventListenerSpy = env.sandbox.spy(win, 'addEventListener');
      messenger.connect(onCommand);
    });

    it('should immediately resolve the target', () => {
      expect(messenger.getTarget()).to.equal(target);
    });

    it('should fail to return origin until connected', () => {
      expect(messenger.isConnected()).to.be.false;
      expect(() => {
        messenger.getTargetOrigin();
      }).to.throw(/not connected/);
    });

    it('should disallow other commands before connect', () => {
      expect(() => {
        messenger.sendCommand('other', {});
      }).to.throw(/not connected/);
      expect(target.postMessage).to.not.be.called;
    });

    it('should allow connect without origin', () => {
      messenger.sendCommand('connect');
      expect(target.postMessage).to.be.calledOnce;
      expect(target.postMessage.args[0][0]).to.deep.equal({
        sentinel: '__AMP__',
        _rsvp: undefined,
        cmd: 'connect',
        payload: null,
      });
      expect(target.postMessage.args[0][1]).to.equal('*');
    });

    it('should connect and initialize origin', () => {
      expect(messenger.isConnected()).to.be.false;
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {sentinel: '__AMP__', cmd: 'start', payload: {a: 1}},
      });
      expect(messenger.isConnected()).to.be.true;
      expect(messenger.getTargetOrigin()).to.equal('https://example-sp.com');
      expect(onCommand).to.be.calledOnce;
      expect(onCommand.args[0][0]).to.equal('start');
      expect(onCommand.args[0][1]).to.deep.equal({a: 1});
    });

    it('should initialize origin when source matches', () => {
      expect(messenger.isConnected()).to.be.false;
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {sentinel: '__AMP__', cmd: 'other', payload: {a: 1}},
        source: target, // This is the important part where target matches.
      });
      expect(messenger.isConnected()).to.be.true;
      expect(messenger.getTargetOrigin()).to.equal('https://example-sp.com');
    });

    it('should disallow origin initialization w/o connect', () => {
      const handler = addEventListenerSpy.args[0][1];
      handler({
        origin: 'https://example-sp.com',
        data: {sentinel: '__AMP__', cmd: 'other', payload: {a: 1}},
      });
      expect(messenger.isConnected()).to.be.false;
      expect(() => {
        messenger.getTargetOrigin();
      }).to.throw(/not connected/);
      expect(onCommand).to.not.be.called;
    });
  });
});
