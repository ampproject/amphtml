import {Keys_Enum} from '#core/constants/key-codes';

import {Services} from '#service';

import {CloseWatcherImpl} from '#utils/close-watcher-impl';

describes.realWin('#CloseWatcherImpl', {amp: true}, (env) => {
  let doc, win, ampdoc;
  let historyMock;
  let handler;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    const history = Services.historyForDoc(ampdoc);
    historyMock = env.sandbox.mock(history);

    handler = env.sandbox.spy();
  });

  afterEach(() => {
    historyMock.verify();
  });

  it('should push and pop history state', async () => {
    historyMock.expects('push').resolves('H1').once();
    historyMock.expects('pop').withArgs('H1').once();
    const watcher = new CloseWatcherImpl(ampdoc, handler);
    await Promise.resolve('H1');
    watcher.signalClosed();
    expect(handler).to.be.calledOnce;
  });

  it('should trigger on history pop', async () => {
    let popHandler;
    historyMock
      .expects('push')
      .withArgs(
        env.sandbox.match((a) => {
          popHandler = a;
          return true;
        })
      )
      .resolves('H1')
      .once();
    new CloseWatcherImpl(ampdoc, handler);
    await Promise.resolve('H1');
    expect(popHandler).to.exist;
    popHandler();
    expect(handler).to.be.calledOnce;
  });

  it('should trigger on ESC key', async () => {
    historyMock.expects('push').resolves('H1').once();
    historyMock.expects('pop').withArgs('H1').once();
    new CloseWatcherImpl(ampdoc, handler);
    await Promise.resolve('H1');

    doc.documentElement.dispatchEvent(
      new KeyboardEvent('keydown', {key: Keys_Enum.ESCAPE})
    );
    expect(handler).to.be.calledOnce;
  });
});
