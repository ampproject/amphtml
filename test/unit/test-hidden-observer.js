import {Services} from '#service';

import {FakeMutationObserver} from '#testing/fake-dom';

describes.fakeWin(
  'HiddenObserver',
  {
    amp: true,
  },
  (env) => {
    let hiddenObserver;
    let MutationObserver;

    function setupSingletonMutationObserver(opt_cb = () => {}) {
      const mo = new FakeMutationObserver(opt_cb);
      MutationObserver = env.sandbox.stub().callsFake(function () {
        return mo;
      });
      env.win.MutationObserver = MutationObserver;
      return mo;
    }

    beforeEach(() => {
      hiddenObserver = Services.hiddenObserverForDoc(
        env.win.document.documentElement
      );
    });

    it('initializes mutation observer on first listen', () => {
      const mo = setupSingletonMutationObserver();
      const observe = env.sandbox.spy(mo, 'observe');

      hiddenObserver.add(() => {});

      expect(MutationObserver).to.have.been.calledOnce;
      expect(observe).to.have.been.calledOnceWith(env.win.document);
    });

    it('keeps mutation observer on second listen', () => {
      const mo = setupSingletonMutationObserver();
      const observe = env.sandbox.spy(mo, 'observe');

      hiddenObserver.add(() => {});
      hiddenObserver.add(() => {});

      expect(MutationObserver).to.have.been.calledOnce;
      expect(observe).to.have.been.calledOnce;
    });

    it('frees mutation observer after last unlisten', () => {
      const mo = setupSingletonMutationObserver();
      const disconnect = env.sandbox.spy(mo, 'disconnect');

      const unlisten = hiddenObserver.add(() => {});
      unlisten();

      expect(disconnect).to.have.been.calledOnce;
    });

    it('keeps mutation observer after second-to-last unlisten', () => {
      const mo = setupSingletonMutationObserver();
      const disconnect = env.sandbox.spy(mo, 'disconnect');

      const unlisten = hiddenObserver.add(() => {});
      const unlisten2 = hiddenObserver.add(() => {});

      unlisten();
      expect(disconnect).not.to.have.been.called;

      unlisten2();
      expect(disconnect).to.have.been.calledOnce;
    });

    it('passes MutationRecords to handler', function* () {
      const stub = env.sandbox.stub();
      const mo = setupSingletonMutationObserver(stub);

      const mutation = {};
      const mutation2 = {};
      mo.__mutate(mutation);
      yield mo.__mutate(mutation2);

      expect(stub).to.have.been.calledOnceWith([mutation, mutation2]);
    });
  }
);
