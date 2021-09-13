import {install} from '#polyfills/abort-controller';

describes.realWin('AbortController', {}, (env) => {
  let win;
  let controller, signal;

  beforeEach(() => {
    win = env.win;

    delete win.AbortController;
    delete win.AbortSignal;
    install(win);

    controller = new win.AbortController();
    signal = controller.signal;
  });

  it('should create AbortController and signal', () => {
    expect(signal).to.exist;
    expect(signal.aborted).to.be.false;
    expect(signal.onabort).to.be.null;
  });

  it('should abort signal without listener', () => {
    controller.abort();
    expect(signal.aborted).to.be.true;
  });

  it('should abort signal with listener', () => {
    const spy = env.sandbox.spy();
    signal.onabort = spy;
    expect(signal.onabort).to.equal(spy);

    controller.abort();
    expect(signal.aborted).to.be.true;
    expect(spy).to.be.calledOnce;
    const event = spy.firstCall.firstArg;
    expect(event).to.contain({
      type: 'abort',
      bubbles: false,
      cancelable: false,
      target: signal,
      currentTarget: signal,
    });
  });

  it('should only call listener once', () => {
    const spy = env.sandbox.spy();
    signal.onabort = spy;
    expect(signal.onabort).to.equal(spy);

    controller.abort();
    expect(spy).to.be.calledOnce;

    controller.abort();
    expect(spy).to.be.calledOnce;
  });
});
