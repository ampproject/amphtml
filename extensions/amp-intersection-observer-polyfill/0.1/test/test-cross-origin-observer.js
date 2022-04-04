import {MessageType_Enum} from '#core/3p-frame-messaging';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {WindowInterface} from '#core/window/interface';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  calculateIntersectionRect,
  maybeSetupCrossOriginObserver,
} from '../cross-origin-observer';

describes.sandboxed('calculateIntersectionRect', {}, () => {
  it('when on screen', () => {
    const viewportRect = layoutRectLtwh(0, 0, 472, 777);
    const targetRect = layoutRectLtwh(0, 116, 300, 250);
    expect(calculateIntersectionRect(viewportRect, targetRect)).to.deep.equal(
      targetRect
    );
  });

  it('when scrolled partially off top edge', () => {
    const viewportRect = layoutRectLtwh(0, 200, 472, 777);
    const targetRect = layoutRectLtwh(0, -84, 300, 250);
    expect(calculateIntersectionRect(viewportRect, targetRect)).to.deep.equal(
      layoutRectLtwh(0, 0, 300, 166)
    );
  });

  it('when scrolled completely off top edge', () => {
    const viewportRect = layoutRectLtwh(0, 370, 472, 777);
    const targetRect = layoutRectLtwh(0, -254, 300, 250);
    expect(calculateIntersectionRect(viewportRect, targetRect)).to.deep.equal(
      layoutRectLtwh(0, 0, 0, 0)
    );
  });

  it('when on screen, clipped at the bottom', () => {
    const viewportRect = layoutRectLtwh(0, 0, 472, 777);
    const targetRect = layoutRectLtwh(0, 737, 300, 250);
    expect(calculateIntersectionRect(viewportRect, targetRect)).to.deep.equal(
      layoutRectLtwh(0, 737, 300, 40)
    );
  });

  it('when clipped completely off bottom edge', () => {
    const viewportRect = layoutRectLtwh(0, 0, 472, 777);
    const targetRect = layoutRectLtwh(0, 778, 300, 250);
    expect(calculateIntersectionRect(viewportRect, targetRect)).to.deep.equal(
      layoutRectLtwh(0, 0, 0, 0)
    );
  });
});

describes.realWin('maybeSetupCrossOriginObserver', {amp: false}, (env) => {
  let win;
  let updaterSpy;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {runtime: 'inabox'};
    updaterSpy = null;
    win.IntersectionObserver = {
      _setupCrossOriginUpdater: () => {
        updaterSpy = env.sandbox.spy();
        return updaterSpy;
      },
    };
  });

  it('should not instantiate when not in the iframe', () => {
    maybeSetupCrossOriginObserver(win);
    expect(updaterSpy).to.be.null;
  });

  describe('with iframe client', () => {
    let iframeClient;
    let sendMessageCallback;

    beforeEach(() => {
      sendMessageCallback = null;
      iframeClient = {
        makeRequest(message, type, callback) {
          if (
            message == MessageType_Enum.SEND_POSITIONS &&
            type == MessageType_Enum.POSITION
          ) {
            sendMessageCallback = callback;
          }
        },
      };
      registerServiceBuilder(
        win,
        'iframeMessagingClient',
        function () {
          return iframeClient;
        },
        /* opt_instantiate */ true
      );
    });

    it('should not instantiate when on top-level context', () => {
      env.sandbox.stub(WindowInterface, 'getTop').callsFake(() => win);
      maybeSetupCrossOriginObserver(win);
      expect(updaterSpy).to.be.null;
      expect(sendMessageCallback).to.be.null;
    });

    it('should not instantiate in non-inabox context', () => {
      win.__AMP_MODE.runtime = 'other';
      maybeSetupCrossOriginObserver(win);
      expect(updaterSpy).to.be.null;
      expect(sendMessageCallback).to.be.null;
    });

    it('should not instantiate when no polyfill', () => {
      delete win.IntersectionObserver._setupCrossOriginUpdater;
      maybeSetupCrossOriginObserver(win);
      expect(updaterSpy).to.be.null;
      expect(sendMessageCallback).to.be.null;
    });

    it('should instantiate with polyfill', () => {
      maybeSetupCrossOriginObserver(win);
      expect(updaterSpy).to.not.be.null;
      expect(sendMessageCallback).to.not.be.null;
    });

    it('should call updater on new events', () => {
      maybeSetupCrossOriginObserver(win);
      const viewportRect = layoutRectLtwh(0, 200, 472, 777);
      const targetRect = layoutRectLtwh(0, -84, 300, 250);
      sendMessageCallback({viewportRect, targetRect});
      expect(updaterSpy).to.be.calledOnce.calledWith(
        targetRect,
        layoutRectLtwh(0, 0, 300, 166)
      );
    });
  });
});
