import {Observable} from '#core/data-structures/observable';

import {ViewerTracker} from '../viewer-tracker';

describes.realWin('ViewerTracker', {amp: true}, (env) => {
  let ampdoc;
  let viewTracker;
  let clock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    viewTracker = new ViewerTracker(ampdoc);
    clock = env.sandbox.useFakeTimers();
  });

  describe('scheduleView', () => {
    it('should call `reportWhenViewed_`, if viewer is visible', async () => {
      const whenViewedStub = env.sandbox.stub(viewTracker, 'reportWhenViewed_');
      env.sandbox.stub(ampdoc, 'isVisible').returns(true);

      await viewTracker.scheduleView(2000);
      expect(whenViewedStub).to.be.calledOnce;
    });

    it('should call `reportWhenViewed_`, when viewer gets visible', async () => {
      let visibleState = false;
      const whenViewedStub = env.sandbox.stub(viewTracker, 'reportWhenViewed_');
      const visibilityChangedStub = env.sandbox.stub(
        ampdoc,
        'onVisibilityChanged'
      );
      const visibilitySandbox = env.sandbox
        .stub(ampdoc, 'isVisible')
        .callsFake(() => visibleState);

      const viewPromise = viewTracker.scheduleView(2000);

      await ampdoc.whenReady();
      expect(visibilitySandbox).to.be.calledOnce;
      expect(visibilityChangedStub).to.be.calledOnce;
      expect(whenViewedStub).to.not.be.called;
      const callback = visibilityChangedStub.getCall(0).args[0];
      expect(callback).to.be.instanceOf(Function);
      visibleState = true;
      callback();

      await viewPromise;
      expect(whenViewedStub).to.be.called;
    });
  });

  describe('reportWhenViewed_', () => {
    it('should call whenViewed_', () => {
      const whenViewedStub = env.sandbox
        .stub(viewTracker, 'whenViewed_')
        .callsFake(() => Promise.resolve());
      viewTracker.reportWhenViewed_(2000);
      expect(whenViewedStub).to.be.calledOnce;
    });
  });

  describe('whenViewed_', () => {
    it('should register "viewed" signal after timeout', async () => {
      const viewPromise = viewTracker.whenViewed_(1000);
      clock.tick(1001);
      await viewPromise;
    });

    it('should register "viewed" signal after scroll', async () => {
      const scrolled = new Observable();
      viewTracker.viewport_ = {
        onScroll: (callback) => scrolled.add(callback),
      };
      const viewPromise = viewTracker.whenViewed_(2000);
      scrolled.fire();
      await viewPromise;
    });

    it('should register "viewed" signal after click', async () => {
      const viewPromise = viewTracker.whenViewed_(2000);
      let clickEvent;
      if (document.createEvent) {
        clickEvent = document.createEvent('MouseEvent');
        clickEvent.initMouseEvent('click', true, true, window, 1);
      } else {
        clickEvent = document.createEventObject();
        clickEvent.type = 'click';
      }
      const node = ampdoc.getRootNode();
      node.body.dispatchEvent(clickEvent);
      await viewPromise;
    });
  });
});
