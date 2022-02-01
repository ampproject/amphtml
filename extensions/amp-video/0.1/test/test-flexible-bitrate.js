import '../flexible-bitrate';
import {childElementsByTag} from '#core/dom/query';
import {toArray} from '#core/types/array';

import {toggleExperiment} from '#experiments';

import {BitrateManager} from '../flexible-bitrate';

describes.fakeWin('amp-video flexible-bitrate', {}, (env) => {
  let clock;
  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    toggleExperiment(env.win, 'flexible-bitrate', true);
  });

  describe('reduce bitrate', () => {
    const pickSmallerPhase1 = () => {
      const m = getManager('4g');
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.manage(v);
      v.changedSources();
      v.load();
      expect(currentBitrates(v)[0]).to.equal(2000);
      v.currentTime = 3;
      causeWait(v);
      expect(currentBitrates(v)[0]).to.equal(1000);
      return v;
    };

    it('should pick a smaller video', pickSmallerPhase1);

    it('should pick a smaller video and play', () => {
      const video = pickSmallerPhase1();
      callEvent(video, 'loadedmetadata');
      expect(video.play).to.have.been.calledOnce;
      expect(video.currentTime).to.equal(3);
    });

    it('should not change if no smaller video is available', () => {
      const m = getManager('3g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v0);
      v0.load();
      m.manage(v0);
      expect(currentBitrates(v0)[0]).to.equal(1000);
      causeWait(v0);
      expect(currentBitrates(v0)[0]).to.equal(1000);
    });

    it('should observe lower bandwidth on next sort', () => {
      const m = getManager('4g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      v0.id = 'v0';
      const v1 = getVideo([4000, 1000, 3000, 2000]);
      v1.id = 'v1';
      m.sortSources_(v0);
      v0.load();
      m.sortSources_(v1);
      m.manage(v0);
      m.manage(v1);
      expect(currentBitrates(v0)[0]).to.equal(2000);
      expect(currentBitrates(v1)[0]).to.equal(2000);
      causeWait(v0);
      expect(currentBitrates(v0)[0]).to.equal(1000);
      expect(v0.currentSrc).to.equal('http://localhost:9876/1000.mp4');
      expect(currentBitrates(v1)[0]).to.equal(1000);
      expect(v1.currentSrc).to.equal('http://localhost:9876/1000.mp4');
    });

    it('should not lower bitrate on loaded video', () => {
      const m = getManager('4g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      env.sandbox.stub(v0, 'duration').value(10);
      env.sandbox.stub(v0, 'buffered').value({
        start: () => 0,
        end: () => 9,
        length: 1,
      });
      m.manage(v0);
      m.updateOtherManagedAndPausedVideos_();

      expect(currentBitrates(v0)[0]).to.equal(4000);
    });

    it('should not lower bitrate on waiting before metadata loaded', () => {
      const m = getManager('4g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      v0.id = 'v0';
      m.sortSources_(v0);
      m.manage(v0);
      // Video should not downgrade on wait since it has not started loading (we never called `load`).
      expect(currentBitrates(v0)[0]).to.equal(2000);
      causeWait(v0);
      expect(currentBitrates(v0)[0]).to.equal(2000);
    });
  });

  describe('sorting', () => {
    it('should sort sources', () => {
      const m = getManager('4g');
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2000, 1000, 3000, 4000]);
    });

    it('should sort sources [3g]', () => {
      const m = getManager('3g');
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([1000, 2000, 3000, 4000]);
    });

    it('should sort sources [2g]', () => {
      const m = getManager('2g');
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([1000, 2000, 3000, 4000]);
    });

    it('should sort sources [undefined]', () => {
      const m = getManager(undefined);
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2000, 1000, 3000, 4000]);
    });

    it('should sort sources [unknown]', () => {
      const m = getManager('some string');
      const v = getVideo([4000, 1000, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2000, 1000, 3000, 4000]);
    });

    it('should sort sources [at threshold]', () => {
      const m = getManager('4g');
      const v = getVideo([4000, 2500, 1000, 3000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2500, 1000, 3000, 4000]);
    });

    it('should sort sources [threshold at 1]', () => {
      const m = getManager('4g');
      const v = getVideo([2500, 4000, 1000, 3000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2500, 1000, 3000, 4000]);
    });

    it('should sort sources [threshold at 4]', () => {
      const m = getManager('4g');
      const v = getVideo([4000, 1000, 3000, 2500]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2500, 1000, 3000, 4000]);
    });

    it('should sort sources [all lower]', () => {
      const m = getManager('4g');
      const v = getVideo([1, 2, 3, 4]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([4, 3, 2, 1]);
    });

    it('should sort sources [all too high]', () => {
      const m = getManager('4g');
      const v = getVideo([40000, 10000, 30000, 20000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([10000, 20000, 30000, 40000]);
    });

    it('should sort sources with empty bitrate considered positive infinity', () => {
      const m = getManager('4g');
      const v = getVideo([4000, null, 3000, 2000]);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([2000, 3000, 4000, null]);
    });

    it('should retain order within a given bitrate', () => {
      const m = getManager('4g');
      const v = getVideo([4000, 1000, 3000, 2000], ['mkv', 'mp4']);
      const cacheSource = v.firstElementChild.cloneNode();
      cacheSource.setAttribute('amp-orig-src', 'CACHE');
      v.insertBefore(cacheSource, v.firstElementChild);
      m.sortSources_(v);
      expect(currentBitrates(v)).to.jsonEqual([
        2000, 2000, 1000, 1000, 3000, 3000, 4000, 4000, 4000,
      ]);
      expect(
        toArray(childElementsByTag(v, 'source')).map((source) => {
          return source.getAttribute('type');
        })
      ).to.jsonEqual([
        'video/mkv',
        'video/mp4',
        'video/mkv',
        'video/mp4',
        'video/mkv',
        'video/mp4',
        'video/mkv',
        'video/mkv',
        'video/mp4',
      ]);
      expect(
        toArray(childElementsByTag(v, 'source')).map((source) => {
          return source.getAttribute('amp-orig-src');
        })
      ).to.jsonEqual([null, null, null, null, null, null, 'CACHE', null, null]);
    });

    it("should sort sources only when it's not already sorted", () => {
      const m = getManager('4g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      m.manage(v0);

      // Sorting once should work, but second time it should be a noop.
      expect(m.sortSources_(v0)).to.be.true;
      expect(m.sortSources_(v0)).to.be.false;
    });

    it('should not call load if there are no lower bitrates', () => {
      const m = getManager('4g');
      const v0 = getVideo([4000, 1000, 3000, 2000]);
      m.manage(v0);
      m.sortSources_(v0);
      v0.load = env.sandbox.spy();
      m.switchToLowerBitrate_(v0, m.acceptableBitrate_);
      expect(v0.load).to.not.have.been.called;
    });
  });

  function currentBitrates(video) {
    return toArray(childElementsByTag(video, 'source')).map((source) => {
      return source.bitrate_ || parseFloat(source.getAttribute('data-bitrate'));
    });
  }

  function getManager(effectiveType) {
    env.win.navigator.connection = {
      effectiveType,
    };
    return new BitrateManager(env.win);
  }

  function callEvent(video, type) {
    const event = video.eventListeners.listeners.find((l) => l.type == type);
    expect(event).to.be.not.undefined;
    event.handler();
  }

  function causeWait(video, opt_time) {
    callEvent(video, 'waiting');
    clock.tick(opt_time || 100);
  }

  function getVideo(rates, opt_types) {
    const video = env.win.document.createElement('video');
    rates.forEach((rate) => {
      (opt_types || ['mp4']).forEach((type) => {
        const s = env.win.document.createElement('source');
        s.src = `${rate}.${type}`;
        s.setAttribute('type', `video/${type}`);
        if (rate) {
          s.setAttribute('data-bitrate', rate);
        }
        video.appendChild(s);
      });
    });
    video.readyStateOverride = 0;

    Object.defineProperty(video, 'currentSrc', {
      get: () => {
        return video.currentSrcOverride;
      },
    });
    Object.defineProperty(video, 'currentTime', {
      get: () => {
        return video.currentTimeOverride;
      },
      set: (val) => {
        video.currentTimeOverride = val;
      },
    });
    Object.defineProperty(video, 'readyState', {
      get: () => {
        return video.readyStateOverride;
      },
    });
    video.load = function () {
      video.currentTime = 0;
      video.currentSrcOverride = video.firstElementChild.src;
      video.readyStateOverride = 1;
    };
    video.play = env.sandbox.spy();
    env.win.document.body.appendChild(video);
    return video;
  }
});
