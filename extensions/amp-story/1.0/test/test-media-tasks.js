import {expect} from 'chai';

import * as Preact from '#core/dom/jsx';
import {toArray} from '#core/types/array';

import {
  mute,
  play,
  resetAmpMediaOnDomChange,
  swapMediaElements,
  unmute,
  updateSources,
} from '../media-tasks';
import {Sources} from '../sources';

describes.realWin('media-tasks', {}, (env) => {
  let win;
  let el;

  beforeEach(() => {
    win = env.win;
    el = document.createElement('video');
  });

  describe('play', () => {
    it('should call play() if element was not yet playing', () => {
      expect(el.paused).to.be.true;
      const spy = env.sandbox.spy(el, 'play');
      play(el);
      expect(spy).to.have.been.called;
    });
    it('should not call play() if element was already playing', () => {
      el.play();
      expect(el.paused).to.be.false;
      const spy = env.sandbox.spy(el, 'play');
      play(el);
      expect(spy).not.to.have.been.called;
    });
  });

  describe('mute', () => {
    it('should set muted to true', () => {
      el.muted = false;
      expect(el.muted).to.be.false;
      mute(el);
      expect(el.muted).to.be.true;
    });
  });

  describe('unmute', () => {
    it('should set muted to false', () => {
      el.muted = true;
      expect(el.muted).to.be.true;
      unmute(el);
      expect(el.muted).to.be.false;
    });
  });

  describe('updateSources', () => {
    /**
     * @param {number} index
     * @return {string}
     */
    function getFakeVideoUrl(index) {
      return `http://example.com/video${index}.mp4`;
    }

    /**
     * @param {number} index
     * @return {!Element}
     */
    function getFakeSource(index) {
      const source = document.createElement('source');
      source.src = getFakeVideoUrl(index);
      return source;
    }

    /**
     * @param {!Array<number>} indices
     * @return {!Array<!Element>}
     */
    function getFakeSources(indices) {
      return indices.map((index) => getFakeSource(index));
    }

    it('should clear existing src attribute', () => {
      const OLD_SRC_URL = getFakeVideoUrl(1);
      el.src = OLD_SRC_URL;

      expect(el.src).to.not.be.empty;
      const newSources = new Sources(null, []);
      updateSources(win, el, newSources);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.be.empty;
    });

    it('should clear existing source elements', () => {
      const OLD_SRC_ELS = getFakeSources([1, 2, 3]);
      OLD_SRC_ELS.forEach((source) => {
        el.appendChild(source);
      });

      expect(toArray(el.children)).to.deep.equal(OLD_SRC_ELS);
      const newSources = new Sources(null, []);
      updateSources(win, el, newSources);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.be.empty;
    });

    it('should set new src attribute', () => {
      const OLD_SRC_URL = getFakeVideoUrl(1);
      const NEW_SRC_URL = getFakeVideoUrl(2);
      el.src = OLD_SRC_URL;

      expect(el.src).to.not.be.empty;
      const newSources = new Sources(NEW_SRC_URL, []);
      updateSources(win, el, newSources);
      expect(el.src).to.equal(NEW_SRC_URL);
      expect(toArray(el.children)).to.be.empty;
    });

    it('should set new source elements', () => {
      const OLD_SRC_ELS = getFakeSources([1, 2, 3]);
      const NEW_SRC_ELS = getFakeSources([4, 5, 6]);

      OLD_SRC_ELS.forEach((source) => {
        el.appendChild(source);
      });

      expect(toArray(el.children)).to.deep.equal(OLD_SRC_ELS);
      const newSources = new Sources(null, NEW_SRC_ELS);
      updateSources(win, el, newSources);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.deep.equal(NEW_SRC_ELS);
    });

    it('should propagate the src attribute as a source', () => {
      el.setAttribute('src', './foo.mp4');
      const newSources = Sources.removeFrom(win, el);
      updateSources(win, el, newSources);
      expect(el).to.not.have.attribute('src');
      expect(toArray(el.children)).to.have.length(1);
      expect(el.firstElementChild).to.have.attribute('src');
      expect(el.firstElementChild.getAttribute('src')).to.equal('./foo.mp4');
    });

    it('should propagate the amp-orig-src attribute as a source', () => {
      el.setAttribute('src', './foo.mp4');
      el.setAttribute('amp-orig-src', './bar.mp4');
      const newSources = Sources.removeFrom(win, el);
      updateSources(win, el, newSources);
      expect(el.firstElementChild).to.have.attribute('amp-orig-src');
      expect(el.firstElementChild.getAttribute('amp-orig-src')).to.equal(
        './bar.mp4'
      );
    });

    it('should drop sources if a src attribute is specified', () => {
      el.setAttribute('src', './foo.mp4');
      getFakeSources([1, 2, 3]).forEach((source) => {
        el.appendChild(source);
      });
      const newSources = Sources.removeFrom(win, el);
      updateSources(win, el, newSources);
      expect(el).to.not.have.attribute('src');
      expect(toArray(el.children)).to.have.length(1);
      expect(el.firstElementChild).to.have.attribute('src');
      expect(el.firstElementChild.getAttribute('src')).to.equal('./foo.mp4');
    });
  });

  describe('bless', () => {
    // TODO(newmuis): Blessing depends on the media element's play() promise
    // being resolved, which does not happen until the video starts playing.
    // However, the video will not play unless it is visible in the DOM.  We
    // will need integration tests for this to rely on the actual underlying
    // browser behavior.
  });

  describe('swapMediaElements', () => {
    it('should swap in tree', () => {
      const parent = (
        <div>
          <video />
        </div>
      );
      const inserted = <video />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(parent.firstElementChild).to.equal(inserted);
      expect(parent.children).to.have.length(1);
    });

    it('should copy classname', () => {
      const className = 'foo bar';
      const parent = (
        <div>
          <video class={String(className)} />
        </div>
      );
      const inserted = <video />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(inserted.className).to.equal(className);
    });

    it('should copy classname except protected', () => {
      const className = 'foo bar';
      const protectedClassName =
        'i-amphtml-pool-media i-amphtml-pool-audio i-amphtml-pool-video';
      const parent = (
        <div>
          <video class={`${protectedClassName} ${className}`} />
        </div>
      );
      const inserted = <video />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(inserted.className).to.equal(className);
    });

    it('should preserve protected classname', () => {
      const className = 'foo bar';
      const protectedClassName =
        'i-amphtml-pool-media i-amphtml-pool-audio i-amphtml-pool-video';
      const parent = (
        <div>
          <video class={String(className)} />
        </div>
      );
      const inserted = <video class={String(protectedClassName)} />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(inserted.className).to.equal(`${protectedClassName} ${className}`);
    });

    it('should replace attributes except protected', () => {
      const parent = (
        <div>
          <video id="foo" src="bar" autoplay a="copied value of a" b />
        </div>
      );
      const inserted = <video data-should-be-removed />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(inserted).to.not.have.attribute('id');
      expect(inserted).to.not.have.attribute('src');
      expect(inserted).to.not.have.attribute('autoplay');
      expect(inserted).to.not.have.attribute('data-should-be-removed');
      expect(inserted.getAttribute('a')).to.equal('copied value of a');
      expect(inserted.getAttribute('b')).to.equal('');
    });

    it('should preserve protected attributes', () => {
      const parent = (
        <div>
          <video id="wrong id" src="wrong src" autoplay a="copied value of a" />
        </div>
      );
      const inserted = <video id="preserved id" src="preserved src" />;
      swapMediaElements(parent.firstElementChild, inserted);
      expect(inserted).to.not.have.attribute('autoplay');
      expect(inserted.getAttribute('id')).to.equal('preserved id');
      expect(inserted.getAttribute('src')).to.equal('preserved src');
      expect(inserted.getAttribute('a')).to.equal('copied value of a');
    });
  });

  describe('resetAmpMediaOnDomChange', () => {
    it('resolves when no AMP element parent', async () => {
      const parent = (
        <div>
          <video />
        </div>
      );
      const {firstElementChild} = parent;
      const result = await resetAmpMediaOnDomChange(firstElementChild);
      expect(result).to.be.undefined;
    });

    it('amp-video: resolves when `resetOnDomChange()` is not provided', async () => {
      const parent = (
        <amp-video>
          <video />
        </amp-video>
      );
      parent.getImpl = () => Promise.resolve({});
      const {firstElementChild} = parent;
      const result = await resetAmpMediaOnDomChange(firstElementChild);
      expect(result).to.be.undefined;
    });

    it('amp-audio: resolves when `resetOnDomChange()` is not provided', async () => {
      const parent = (
        <amp-audio>
          <audio />
        </amp-audio>
      );
      parent.getImpl = () => Promise.resolve({});
      const {firstElementChild} = parent;
      const result = await resetAmpMediaOnDomChange(firstElementChild);
      expect(result).to.be.undefined;
    });

    it('amp-video: calls `resetOnDomChange()`', async () => {
      const parent = (
        <amp-video>
          <video />
        </amp-video>
      );
      const resetOnDomChange = env.sandbox.spy();
      parent.getImpl = () => Promise.resolve({resetOnDomChange});
      const {firstElementChild} = parent;
      const result = await resetAmpMediaOnDomChange(firstElementChild);
      expect(result).to.be.undefined;
      expect(resetOnDomChange).to.have.been.calledOnce;
    });

    it('amp-audio: calls `resetOnDomChange()`', async () => {
      const parent = (
        <amp-audio>
          <audio />
        </amp-audio>
      );
      const resetOnDomChange = env.sandbox.spy();
      parent.getImpl = () => Promise.resolve({resetOnDomChange});
      const {firstElementChild} = parent;
      const result = await resetAmpMediaOnDomChange(firstElementChild);
      expect(result).to.be.undefined;
      expect(resetOnDomChange).to.have.been.calledOnce;
    });
  });
});
