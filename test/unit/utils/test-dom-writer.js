import {DomWriterBulk, DomWriterStreamer} from '#utils/dom-writer';

describes.fakeWin('DomWriterStreamer', {amp: true}, (env) => {
  describe('DomWriterStreamer', () => {
    let win;
    let writer;
    let onBodySpy, onBodyChunkSpy;
    let onBodyPromise, onBodyChunkPromiseResolver, onEndPromise;

    beforeEach(() => {
      win = env.win;
      writer = new DomWriterStreamer(win);
      onBodySpy = env.sandbox.spy();
      onBodyChunkSpy = env.sandbox.spy();
      onBodyPromise = new Promise((resolve) => {
        writer.onBody((parsedDoc) => {
          resolve(parsedDoc.body);
          onBodySpy();
          return win.document.body;
        });
      });
      writer.onBodyChunk(() => {
        if (onBodyChunkPromiseResolver) {
          onBodyChunkPromiseResolver();
          onBodyChunkPromiseResolver = null;
        }
        onBodyChunkSpy();
      });
      onEndPromise = new Promise((resolve) => {
        writer.onEnd(resolve);
      });
    });

    function waitForNextBodyChunk() {
      return new Promise((resolve) => {
        onBodyChunkPromiseResolver = resolve;
      });
    }

    it('should complete when writer has been closed', () => {
      writer.close();
      return onEndPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        env.flushVsync();
        expect(onBodyChunkSpy).to.not.be.called;
      });
    });

    it('should resolve body as soon as available', () => {
      writer.write('<body class="b">');
      expect(onBodySpy).to.not.be.called;
      return onBodyPromise.then((body) => {
        expect(body.getAttribute('class')).to.equal('b');
        expect(onBodySpy).to.be.calledOnce;
      });
    });

    it('should schedule body chunk', () => {
      writer.write('<body>');
      return onBodyPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        writer.write('<child>');
        expect(onBodyChunkSpy).to.not.be.called;
        return waitForNextBodyChunk().then(() => {
          env.flushVsync();
          expect(onBodySpy).to.be.calledOnce;
          expect(onBodyChunkSpy).to.be.calledOnce;
          expect(win.document.body.querySelector('child')).to.exist;

          writer.write('</child><child2>');
          return waitForNextBodyChunk().then(() => {
            env.flushVsync();
            expect(win.document.body.querySelector('child2')).to.exist;
          });
        });
      });
    });

    it('should schedule several body chunks together', () => {
      writer.write('<body>');
      return onBodyPromise.then(() => {
        expect(onBodySpy).to.be.calledOnce;
        writer.write('<child></child>');
        expect(onBodyChunkSpy).to.not.be.called;
        const promise = waitForNextBodyChunk();
        writer.write('<child2></child2>');
        return promise.then(() => {
          expect(onBodyChunkSpy).to.be.calledOnce;
          expect(win.document.body.querySelector('child')).to.exist;
          expect(win.document.body.querySelector('child2')).to.exist;
        });
      });
    });

    it('should not parse noscript as markup', () => {
      writer.write(
        '<body><child1></child1><noscript><child2></child2></noscript>'
      );
      return waitForNextBodyChunk().then(() => {
        expect(win.document.body.querySelector('child1')).to.exist;
        expect(win.document.body.querySelector('child2')).not.to.exist;
        writer.write('<noscript><child3></child3></noscript>');
        writer.write('<child4></child4>');
        writer.close();
        env.flushVsync();

        return onEndPromise.then(() => {
          expect(win.document.body.querySelector('child3')).not.to.exist;
          expect(win.document.body.querySelector('child4')).to.exist;
        });
      });
    });

    it('should not parse noscript as markup across writes', () => {
      writer.write('<body><child1></child1><noscript><child2>');
      return waitForNextBodyChunk().then(() => {
        expect(win.document.body.querySelector('child1')).to.exist;
        writer.write('</child2></noscript>');
        writer.write('<child3></child3>');
        writer.close();
        env.flushVsync();

        return onEndPromise.then(() => {
          expect(win.document.body.querySelector('child1')).to.exist;
          expect(win.document.body.querySelector('child2')).not.to.exist;
          expect(win.document.body.querySelector('child3')).to.exist;
        });
      });
    });
  });
});

describes.fakeWin('DomWriterBulk', {amp: true}, (env) => {
  let win;
  let writer;
  let onBodySpy, onBodyChunkSpy;
  let onBodyPromise, onBodyChunkPromiseResolver, onEndPromise;

  beforeEach(() => {
    win = env.win;
    writer = new DomWriterBulk(win);
    onBodySpy = env.sandbox.spy();
    onBodyChunkSpy = env.sandbox.spy();
    onBodyPromise = new Promise((resolve) => {
      writer.onBody((parsedDoc) => {
        resolve(parsedDoc.body);
        onBodySpy(parsedDoc);
        return win.document.body;
      });
    });
    writer.onBodyChunk(() => {
      if (onBodyChunkPromiseResolver) {
        onBodyChunkPromiseResolver();
        onBodyChunkPromiseResolver = null;
      }
      onBodyChunkSpy();
    });
    onEndPromise = new Promise((resolve) => {
      writer.onEnd(resolve);
    });
  });

  it('should complete when writer has been closed', () => {
    writer.close();
    return onEndPromise.then(() => {
      expect(onBodySpy).to.be.calledOnce;
      env.flushVsync();
      expect(onBodyChunkSpy).to.not.be.called;
    });
  });

  it('should wait for body until stream is closed', () => {
    writer.write('<body class="b">');
    env.flushVsync();
    expect(onBodySpy).to.not.be.called;
    expect(writer.eof_).to.be.false;

    writer.write('abc');
    env.flushVsync();
    expect(onBodySpy).to.not.be.called;
    expect(writer.eof_).to.be.false;

    writer.close();
    env.flushVsync();
    expect(onBodySpy).to.be.calledOnce;
    expect(win.document.body.textContent).to.equal('abc');
    expect(writer.eof_).to.be.true;
    return Promise.all([onBodyPromise, onEndPromise]);
  });

  it('should process for body chunks together', () => {
    writer.write('<body class="b">');
    env.flushVsync();
    expect(onBodySpy).to.not.be.called;

    writer.write('<child></child>');
    env.flushVsync();
    expect(onBodySpy).to.not.be.called;

    writer.write('<child2></child2>');
    env.flushVsync();
    expect(onBodySpy).to.not.be.called;

    writer.close();
    env.flushVsync();
    expect(onBodySpy).to.be.calledOnce;
    expect(win.document.body.querySelector('child')).to.exist;
    expect(win.document.body.querySelector('child2')).to.exist;
    expect(writer.eof_).to.be.true;
    return Promise.all([onBodyPromise, onEndPromise]);
  });

  it('should not parse noscript as markup', () => {
    writer.write('<body>');
    writer.write('<child1></child1><noscript><child2></child2></noscript>');
    writer.write('<child3></child3>');
    writer.close();
    env.flushVsync();
    expect(win.document.body.querySelector('child1')).to.exist;
    expect(win.document.body.querySelector('child2')).not.to.exist;
    expect(win.document.body.querySelector('child3')).to.exist;
    return Promise.all([onBodyPromise, onEndPromise]);
  });
});
