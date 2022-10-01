import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';

import {MEDIA_LOAD_FAILURE_SRC_PROPERTY} from '#utils/event-helper';

import {MediaPerformanceMetricsService} from '../media-performance-metrics-service';

describes.fakeWin('media-performance-metrics-service', {amp: true}, (env) => {
  let clock;
  let service;
  let tickStub;
  let win;

  before(() => {
    clock = fakeTimers.withGlobal(window).install({toFake: ['Date'], now: 0});
  });

  after(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    win = env.win;
    env.sandbox
      .stub(Services, 'performanceFor')
      .returns({tickDelta: () => {}, flush: () => {}});
    service = new MediaPerformanceMetricsService(win);
    tickStub = env.sandbox.stub(service.performanceService_, 'tickDelta');
  });

  afterEach(() => {
    clock.reset();
  });

  it('should record and flush metrics', () => {
    const flushStub = env.sandbox.stub(service.performanceService_, 'flush');

    const video = win.document.createElement('video');
    service.startMeasuring(video);
    clock.tick(20);
    video.dispatchEvent(new Event('playing'));
    clock.tick(100);
    video.dispatchEvent(new Event('waiting'));
    clock.tick(300);
    service.stopMeasuring(video);

    expect(tickStub).to.have.callCount(7);
    expect(flushStub).to.have.been.calledOnce;
  });

  it('should record and flush metrics on error', () => {
    const flushStub = env.sandbox.stub(service.performanceService_, 'flush');

    const video = win.document.createElement('video');
    service.startMeasuring(video);
    clock.tick(2000);
    video.dispatchEvent(new Event('error'));
    clock.tick(10000);
    service.stopMeasuring(video);

    expect(tickStub).to.have.callCount(3);
    expect(flushStub).to.have.been.calledOnce;
  });

  it('should record and flush metrics for multiple media', () => {
    const flushStub = env.sandbox.stub(service.performanceService_, 'flush');

    const video1 = win.document.createElement('video');
    const video2 = win.document.createElement('video');
    service.startMeasuring(video1);
    service.startMeasuring(video2);
    clock.tick(100);
    video1.dispatchEvent(new Event('playing'));
    clock.tick(200);
    service.stopMeasuring(video1);
    video2.dispatchEvent(new Event('waiting'));
    clock.tick(300);
    video2.dispatchEvent(new Event('playing'));
    service.stopMeasuring(video2);

    expect(tickStub).to.have.callCount(13);
    expect(flushStub).to.have.been.calledTwice;
  });

  it('should not flush metrics if sendMetrics is false', () => {
    const flushStub = env.sandbox.stub(service.performanceService_, 'flush');

    const video = win.document.createElement('video');
    service.startMeasuring(video);
    clock.tick(20);
    video.dispatchEvent(new Event('playing'));
    clock.tick(100);
    video.dispatchEvent(new Event('waiting'));
    clock.tick(300);
    service.stopMeasuring(video, false /** sendMetrics */);

    expect(flushStub).to.not.have.been.called;
  });

  describe('Joint latency', () => {
    it('should record joint latency if playback starts with no wait', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vjl', 100);
    });

    it('should record joint latency when waiting first', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(200);
      video.dispatchEvent(new Event('playing'));
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vjl', 300);
    });

    it('should not record joint latency if playback does not start', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(200);
      service.stopMeasuring(video);

      expect(tickStub).to.not.have.been.calledWith('vjl');
    });

    it('should record joint latency for multiple media', () => {
      const video1 = win.document.createElement('video');
      const video2 = win.document.createElement('video');
      service.startMeasuring(video1);
      service.startMeasuring(video2);
      clock.tick(100);
      video1.dispatchEvent(new Event('playing'));
      clock.tick(200);
      service.stopMeasuring(video1);
      video2.dispatchEvent(new Event('waiting'));
      clock.tick(300);
      video2.dispatchEvent(new Event('playing'));
      service.stopMeasuring(video2);

      expect(tickStub).to.have.been.calledWithExactly('vjl', 100);
      expect(tickStub).to.have.been.calledWithExactly('vjl', 600);
    });
  });

  describe('Watch time', () => {
    it('should record watch time', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vwt', 200);
    });

    it('should record watch time and handle pause events', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('pause'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vwt', 600);
    });

    it('should record watch time and handle ended events', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('ended'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vwt', 600);
    });

    it('should record watch time and handle rebuffers', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vwt', 600);
    });
  });

  describe('Rebuffers', () => {
    it('should count rebuffers', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(500);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vrb', 2);
    });

    it('should record rebuffer rate', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(500);
      service.stopMeasuring(video);

      // playing: 600; waiting: 800
      // (800 / (600 + 800)) * 100 ~= 57
      expect(tickStub).to.have.been.calledWithExactly('vrbr', 57);
    });

    it('should record mean time between rebuffers', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(300);
      video.dispatchEvent(new Event('playing'));
      clock.tick(400);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(500);
      service.stopMeasuring(video);

      // 600ms playing divided by 2 rebuffer events.
      expect(tickStub).to.have.been.calledWithExactly('vmtbrb', 300);
    });

    it('should count the initial buffering as a rebuffer', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(300);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(400);
      video.dispatchEvent(new Event('playing'));
      clock.tick(500);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(600);
      video.dispatchEvent(new Event('playing'));
      clock.tick(700);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vrb', 2);
    });

    it('should exclude very brief rebuffers', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('waiting'));
      clock.tick(10);
      video.dispatchEvent(new Event('playing'));
      clock.tick(300);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vrb', 0);
    });

    it('should record rebuffer rate even with no rebuffer events', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vrbr', 0);
    });

    it('should not send mean time between rebuffers when no rebuffer', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      service.stopMeasuring(video);

      expect(tickStub).to.not.have.been.calledWith('vmtbrb');
    });
  });

  describe('Errors', () => {
    it('should detect the video as already errored', (done) => {
      const video = win.document.createElement('video');

      video.onerror = () => {
        service.startMeasuring(video);
        service.stopMeasuring(video);

        expect(tickStub).to.have.been.calledWithExactly('verr', 4);
        done();
      };

      // MediaError.code = 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
      video.src = '404.mp4';
    });

    it('should detect the video as already errored from <source>', () => {
      const video = win.document.createElement('video');
      video[MEDIA_LOAD_FAILURE_SRC_PROPERTY] = '';

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('verr', 0);
    });

    it('should detect that the video errors', () => {
      const video = win.document.createElement('video');
      service.startMeasuring(video);
      clock.tick(100);
      video.dispatchEvent(new Event('playing'));
      clock.tick(200);
      video.dispatchEvent(new Event('error'));
      clock.tick(300);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('verr', 0);
    });
  });

  describe('Cache state', () => {
    it('should register the video as playing from origin', () => {
      const video = win.document.createElement('video');
      const source = win.document.createElement('source');
      source.setAttribute('src', 'foo.mp4');
      video.appendChild(source);
      env.sandbox.stub(video, 'currentSrc').value('foo.mp4');

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vcs', 0);
    });

    it('should register the video as playing from origin w/ cache miss', () => {
      const video = win.document.createElement('video');
      const cacheSource = win.document.createElement('source');
      const originSource = win.document.createElement('source');
      cacheSource.setAttribute(
        'src',
        'htps://foo-com.cdn.ampproject.org/bv/s/foo.com/foo.mp4'
      );
      cacheSource.setAttribute('i-amphtml-video-cached-source', '');
      originSource.setAttribute('src', 'foo.mp4');
      video.appendChild(cacheSource);
      video.appendChild(originSource);
      env.sandbox.stub(video, 'currentSrc').value('foo.mp4');

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vcs', 1);
    });

    it('should register the video as playing from cache', () => {
      const url = 'https://foo-com.cdn.ampproject.org/bv/s/foo.com/foo.mp4';
      const video = win.document.createElement('video');
      const source = win.document.createElement('source');
      source.setAttribute('src', url);
      source.setAttribute('i-amphtml-video-cached-source', '');
      video.appendChild(source);
      env.sandbox.stub(video, 'currentSrc').value(url);

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vcs', 2);
    });
  });

  describe('Video on first page', () => {
    it('should report the video is on the first page', () => {
      const video = win.document.createElement('video');
      const source = win.document.createElement('source');
      const firstPage = win.document.createElement('amp-story-page');
      source.setAttribute('src', 'foo.mp4');
      video.appendChild(source);
      firstPage.appendChild(video);
      win.document.body.appendChild(firstPage);

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vofp', 1);
    });

    it('should report the video is not on the first page', () => {
      // Create first page with unregistered video
      const firstPage = win.document.createElement('amp-story-page');
      firstPage.appendChild(win.document.createElement('video'));
      win.document.body.appendChild(firstPage);

      // Create second page with registered video
      const video = win.document.createElement('video');
      const source = win.document.createElement('source');
      const secondPage = win.document.createElement('amp-story-page');
      source.setAttribute('src', 'foo.mp4');
      video.appendChild(source);
      secondPage.appendChild(video);
      win.document.body.appendChild(secondPage);

      service.startMeasuring(video);
      service.stopMeasuring(video);

      expect(tickStub).to.have.been.calledWithExactly('vofp', 0);
    });
  });
});
