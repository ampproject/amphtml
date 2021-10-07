import {
  isDocumentReady,
  onDocumentReady,
  whenDocumentComplete,
  whenDocumentReady,
} from '#core/document/ready';

import {Services} from '#service';

describes.sandboxed('documentReady', {}, (env) => {
  let testDoc;
  let eventListeners;
  const timer = Services.timerFor(window);

  beforeEach(() => {
    eventListeners = {};
    testDoc = {
      readyState: 'loading',
      addEventListener: (eventType, handler) => {
        eventListeners[eventType] = handler;
      },
      removeEventListener: (eventType, handler) => {
        if (eventListeners[eventType] == handler) {
          delete eventListeners[eventType];
        }
      },
    };
  });

  it('should interpret readyState correctly', () => {
    expect(isDocumentReady(testDoc)).to.equal(false);

    testDoc.readyState = 'uninitialized';
    expect(isDocumentReady(testDoc)).to.equal(false);

    testDoc.readyState = 'interactive';
    expect(isDocumentReady(testDoc)).to.equal(true);

    testDoc.readyState = 'complete';
    expect(isDocumentReady(testDoc)).to.equal(true);
  });

  it('should call callback immediately when ready', () => {
    testDoc.readyState = 'complete';
    const callback = env.sandbox.spy();
    onDocumentReady(testDoc, callback);
    expect(callback).to.be.calledOnce;
    expect(callback.getCall(0).args).to.deep.equal([testDoc]);
  });

  it('should wait to call callback until ready', () => {
    testDoc.readyState = 'loading';
    const callback = env.sandbox.spy();
    onDocumentReady(testDoc, callback);
    expect(callback).to.have.not.been.called;
    expect(eventListeners['readystatechange']).to.not.equal(undefined);

    // Complete
    testDoc.readyState = 'complete';
    eventListeners['readystatechange']();
    expect(callback).to.be.calledOnce;
    expect(callback.getCall(0).args).to.deep.equal([testDoc]);
    expect(eventListeners['readystatechange']).to.equal(undefined);
  });

  it('should wait to call callback for several loading events', () => {
    testDoc.readyState = 'loading';
    const callback = env.sandbox.spy();
    onDocumentReady(testDoc, callback);
    expect(callback).to.have.not.been.called;
    expect(eventListeners['readystatechange']).to.not.equal(undefined);

    // Still loading
    eventListeners['readystatechange']();
    expect(callback).to.have.not.been.called;
    expect(eventListeners['readystatechange']).to.not.equal(undefined);

    // Complete
    testDoc.readyState = 'complete';
    eventListeners['readystatechange']();
    expect(callback).to.be.calledOnce;
    expect(callback.getCall(0).args).to.deep.equal([testDoc]);
    expect(eventListeners['readystatechange']).to.equal(undefined);
  });

  describe('whenDocumentReady', () => {
    it('should call callback immediately when ready', () => {
      testDoc.readyState = 'complete';
      const spy = env.sandbox.spy();
      const spy2 = env.sandbox.spy();
      const spy3 = env.sandbox.spy();

      whenDocumentReady(testDoc).then(spy).then(spy2);

      whenDocumentReady(testDoc).then(spy3);

      expect(spy).to.have.not.been.called;
      expect(spy2).to.have.not.been.called;
      expect(spy3).to.have.not.been.called;

      return timer.promise().then(() => {
        expect(spy).to.be.calledOnce;
        expect(spy.getCall(0).args).to.deep.equal([testDoc]);
        expect(spy2).to.be.calledOnce;
        expect(spy3).to.be.calledOnce;
      });
    });

    it('should not call callback', () => {
      const spy = env.sandbox.spy();
      whenDocumentReady(testDoc).then(spy);
      expect(spy).to.have.not.been.called;
      return timer.promise().then(() => {
        expect(spy).to.have.not.been.called;
      });
    });

    it('should wait to call callback until ready', () => {
      testDoc.readyState = 'loading';
      const callback = env.sandbox.spy();
      whenDocumentReady(testDoc).then(callback);

      return timer.promise().then(() => {
        expect(callback).to.have.not.been.called;
        expect(eventListeners['readystatechange']).to.not.equal(undefined);

        // Complete
        testDoc.readyState = 'complete';
        eventListeners['readystatechange']();

        return timer.promise().then(() => {
          expect(callback).to.be.calledOnce;
          expect(callback.getCall(0).args).to.deep.equal([testDoc]);
          expect(eventListeners['readystatechange']).to.equal(undefined);
        });
      });
    });
  });

  describe('whenDocumentComplete', () => {
    it('should call callback immediately when complete', () => {
      testDoc.readyState = 'complete';
      const spy = env.sandbox.spy();
      const spy2 = env.sandbox.spy();
      const spy3 = env.sandbox.spy();

      whenDocumentComplete(testDoc).then(spy).then(spy2);

      whenDocumentComplete(testDoc).then(spy3);

      expect(spy).to.have.not.been.called;
      expect(spy2).to.have.not.been.called;
      expect(spy3).to.have.not.been.called;

      return timer.promise().then(() => {
        expect(spy).to.be.calledOnce;
        expect(spy.getCall(0).args).to.deep.equal([testDoc]);
        expect(spy2).to.be.calledOnce;
        expect(spy3).to.be.calledOnce;
      });
    });

    it('should not call callback', () => {
      const spy = env.sandbox.spy();
      whenDocumentComplete(testDoc).then(spy);
      expect(spy).to.have.not.been.called;
      return timer.promise().then(() => {
        expect(spy).to.have.not.been.called;
      });
    });

    it('should wait to call callback until ready', () => {
      testDoc.readyState = 'loading';
      const callback = env.sandbox.spy();
      whenDocumentComplete(testDoc).then(callback);

      return timer.promise().then(() => {
        expect(callback).to.have.not.been.called;
        expect(eventListeners['readystatechange']).to.not.equal(undefined);

        // interactive
        testDoc.readyState = 'interactive';
        eventListeners['readystatechange']();

        return timer.promise().then(() => {
          expect(callback).to.have.not.been.called;
          expect(eventListeners['readystatechange']).to.not.equal(undefined);

          // Complete
          testDoc.readyState = 'complete';
          eventListeners['readystatechange']();

          return timer.promise().then(() => {
            expect(callback).to.be.calledOnce;
            expect(callback.getCall(0).args).to.deep.equal([testDoc]);
            expect(eventListeners['readystatechange']).to.equal(undefined);
          });
        });
      });
    });
  });
});
