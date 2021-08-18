import {DetachedDomStream} from '#core/dom/stream';

describes.fakeWin('DOM - stream - DetachedDomStream', {amp: true}, (env) => {
  let win;
  let chunkSpy;
  let endSpy;
  let stream;

  beforeEach(() => {
    win = env.win;
    chunkSpy = env.sandbox.spy();
    endSpy = env.sandbox.spy();
    stream = new DetachedDomStream(win, chunkSpy, endSpy);
  });

  describe('#write', () => {
    it('calls the chunk cb on every write', () => {
      stream.write(`
        <head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
        </head>
      `);

      expect(chunkSpy).calledOnce;
      const firstChunkDoc = chunkSpy.firstCall.firstArg;
      const script = firstChunkDoc.querySelector('script');
      expect(script).to.exist;
      expect(script.src).to.equal('https://cdn.ampproject.org/v0.js');

      stream.write(`
        <body class="foo">
          <child-one></child-one>
        </body>
      `);

      expect(chunkSpy).calledTwice;
      const secondChunkDoc = chunkSpy.firstCall.firstArg;
      expect(secondChunkDoc.body).to.have.class('foo');
      expect(firstChunkDoc.querySelector('child-one')).to.exist;

      expect(endSpy).not.called;
    });
  });

  describe('#close', () => {
    it('calls the onEnd cb with full doc when complete', () => {
      stream.write(`
        <head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
        </head>
      `);

      expect(endSpy).not.called;

      stream.write(`
        <body class="foo">
          <child-one></child-one>
        </body>
      `);

      expect(endSpy).not.called;

      stream.close();

      expect(endSpy).calledOnce;
      const finalDoc = endSpy.firstCall.firstArg;
      const script = finalDoc.querySelector('script');
      expect(script).to.exist;
      expect(script.src).to.equal('https://cdn.ampproject.org/v0.js');
      expect(finalDoc.body).to.have.class('foo');
      expect(finalDoc.querySelector('child-one')).to.exist;
    });

    it('throws if write() called after close()', () => {
      stream.close();
      allowConsoleError(() => {
        expect(() => stream.write('<child-one></child-one>')).to.throw(
          'Detached doc already closed.'
        );
      });
    });
  });
});
