import * as fakeTimers from '@sinonjs/fake-timers';

import {createElementWithAttributes} from '#core/dom';

import {installTimerService} from '#service/timer-impl';

import {macroTask} from '#testing/helpers';

import {
  getAmpAdRenderOutsideViewport,
  incrementLoadingAds,
  is3pThrottled,
  waitFor3pThrottle,
} from '../concurrent-load';

describes.realWin('concurrent-load', {}, (env) => {
  describe('getAmpAdRenderOutsideViewport', () => {
    it(
      'should return null if ' +
        'data-loading-strategy attribute does not exist',
      () => {
        const element = env.win.document.createElement('amp-ad');
        expect(getAmpAdRenderOutsideViewport(element)).to.be.null;
      }
    );

    it('should respect data-loading-strategy attribute', () => {
      // data-loading-strategy=prefer-viewability-over-views is 1.25
      verifyGetAmpAdRenderOutsideViewport(
        'prefer-viewability-over-views',
        1.25
      );
      // data-loading-strategy attribute with no value is 1.25
      verifyGetAmpAdRenderOutsideViewport('', 1.25);

      verifyGetAmpAdRenderOutsideViewport('0', 0);
      verifyGetAmpAdRenderOutsideViewport('0.256', 0.256);
      verifyGetAmpAdRenderOutsideViewport('1.25', 1.25);
      verifyGetAmpAdRenderOutsideViewport('3.0', 3);

      expectGetAmpAdRenderOutsideViewportThrow('3.1');
      expectGetAmpAdRenderOutsideViewportThrow('-0.1');
      expectGetAmpAdRenderOutsideViewportThrow('invalid-value');
    });

    function verifyGetAmpAdRenderOutsideViewport(loadingStrategy, viewportNum) {
      const element = createElementWithAttributes(env.win.document, 'amp-ad', {
        'data-loading-strategy': loadingStrategy,
      });
      expect(getAmpAdRenderOutsideViewport(element)).to.equal(viewportNum);
    }

    function expectGetAmpAdRenderOutsideViewportThrow(loadingStrategy) {
      const element = createElementWithAttributes(env.win.document, 'amp-ad', {
        'data-loading-strategy': loadingStrategy,
      });
      allowConsoleError(() => {
        expect(() => getAmpAdRenderOutsideViewport(element)).to.throw();
      });
    }
  });

  describe('incrementLoadingAds', () => {
    let win;
    let clock;

    beforeEach(() => {
      win = env.win;
      clock = fakeTimers.withGlobal(win).install({
        toFake: ['Date', 'setTimeout', 'clearTimeout'],
      });
      installTimerService(win);
    });

    afterEach(() => {
      clock.uninstall();
    });

    it('should throttle ad loading one per second', function* () {
      expect(is3pThrottled(win)).to.be.false;
      incrementLoadingAds(win);
      expect(is3pThrottled(win)).to.be.true;
      clock.tick(999);
      yield macroTask();
      expect(is3pThrottled(win)).to.be.true;
      clock.tick(1);
      yield macroTask();
      expect(is3pThrottled(win)).to.be.false;
    });

    it('should throttle ad one a time', function* () {
      expect(is3pThrottled(win)).to.be.false;
      let resolver;
      incrementLoadingAds(
        win,
        new Promise((res) => {
          resolver = res;
        })
      );
      expect(is3pThrottled(win)).to.be.true;
      resolver();
      yield macroTask();
      expect(is3pThrottled(win)).to.be.false;
    });
  });

  describe('waitFor3pThrottle', () => {
    beforeEach(() => {
      installTimerService(env.win);
    });

    it('should block if incremented', () => {
      incrementLoadingAds(env.win);
      const start = Date.now();
      return waitFor3pThrottle(env.win).then(() =>
        expect(Date.now() - start).to.be.at.least(1000)
      );
    });

    it('should not block if never incremented', () => {
      const start = Date.now();
      return waitFor3pThrottle(env.win).then(() =>
        expect(Date.now() - start).to.be.at.most(50)
      );
    });
  });
});
