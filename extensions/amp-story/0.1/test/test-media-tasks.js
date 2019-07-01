/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  LoadTask,
  MuteTask,
  PauseTask,
  PlayTask,
  RewindTask,
  SwapIntoDomTask,
  SwapOutOfDomTask,
  UnmuteTask,
  UpdateSourcesTask,
} from '../media-tasks';
import {Sources} from '../sources';
import {toArray} from '../../../../src/types';

describes.realWin('media-tasks', {}, () => {
  let sandbox;
  let el;
  let vsyncApi;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    el = document.createElement('video');

    // Mock vsync
    vsyncApi = {
      mutatePromise: () => {},
    };
    sandbox.stub(vsyncApi, 'mutatePromise').resolves(callback => {
      callback();
    });
  });

  describe('PauseTask', () => {
    it('should call pause()', () => {
      const pause = sandbox.spy(el, 'pause');
      const task = new PauseTask();
      task.execute(el);
      expect(pause).to.have.been.called;
    });
  });

  describe('PlayTask', () => {
    it('should call play() if element was not yet playing', () => {
      expect(el.paused).to.be.true;

      const play = sandbox.spy(el, 'play');
      const task = new PlayTask();
      task.execute(el);
      expect(play).to.have.been.called;
    });

    it('should not call play() if element was already playing', () => {
      el.play();
      expect(el.paused).to.be.false;

      const play = sandbox.spy(el, 'play');
      const task = new PlayTask();
      task.execute(el);
      expect(play).not.to.have.been.called;
    });
  });

  describe('MuteTask', () => {
    it('should set muted to true', () => {
      el.muted = false;
      expect(el.muted).to.be.false;

      const task = new MuteTask();
      task.execute(el);
      expect(el.muted).to.be.true;
    });
  });

  describe('UnmuteTask', () => {
    it('should set muted to false', () => {
      el.muted = true;
      expect(el.muted).to.be.true;

      const task = new UnmuteTask();
      task.execute(el);
      expect(el.muted).to.be.false;
    });
  });

  describe('LoadTask', () => {
    it('should call load()', () => {
      const load = sandbox.spy(el, 'load');
      const task = new LoadTask();
      task.execute(el);
      expect(load).to.have.been.called;
    });
  });

  describe('RewindTask', () => {
    it('should set currentTime to 0', () => {
      el.currentTime = 1;
      expect(el.currentTime).to.equal(1);

      const task = new RewindTask();
      task.execute(el);
      expect(el.currentTime).to.equal(0);
    });
  });

  describe('UpdateSourcesTask', () => {
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
      return indices.map(index => getFakeSource(index));
    }

    it('should clear existing src attribute', () => {
      const OLD_SRC_URL = getFakeVideoUrl(1);
      el.src = OLD_SRC_URL;

      expect(el.src).to.not.be.empty;
      const newSources = new Sources(null, []);
      const task = new UpdateSourcesTask(newSources);
      task.execute(el);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.be.empty;
    });

    it('should clear existing source elements', () => {
      const OLD_SRC_ELS = getFakeSources([1, 2, 3]);
      OLD_SRC_ELS.forEach(source => {
        el.appendChild(source);
      });

      expect(toArray(el.children)).to.deep.equal(OLD_SRC_ELS);
      const newSources = new Sources(null, []);
      const task = new UpdateSourcesTask(newSources);
      task.execute(el);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.be.empty;
    });

    it('should set new src attribute', () => {
      const OLD_SRC_URL = getFakeVideoUrl(1);
      const NEW_SRC_URL = getFakeVideoUrl(2);
      el.src = OLD_SRC_URL;

      expect(el.src).to.not.be.empty;
      const newSources = new Sources(NEW_SRC_URL, []);
      const task = new UpdateSourcesTask(newSources);
      task.execute(el);
      expect(el.src).to.equal(NEW_SRC_URL);
      expect(toArray(el.children)).to.be.empty;
    });

    it('should set new source elements', () => {
      const OLD_SRC_ELS = getFakeSources([1, 2, 3]);
      const NEW_SRC_ELS = getFakeSources([4, 5, 6]);

      OLD_SRC_ELS.forEach(source => {
        el.appendChild(source);
      });

      expect(toArray(el.children)).to.deep.equal(OLD_SRC_ELS);
      const newSources = new Sources(null, NEW_SRC_ELS);
      const task = new UpdateSourcesTask(newSources);
      task.execute(el);
      expect(el.src).to.be.empty;
      expect(toArray(el.children)).to.deep.equal(NEW_SRC_ELS);
    });
  });

  describe('BlessTask', () => {
    // TODO(newmuis): Blessing depends on the media element's play() promise
    // being resolved, which does not happen until the video starts playing.
    // However, the video will not play unless it is visible in the DOM.  We
    // will need integration tests for this to rely on the actual underlying
    // browser behavior.
  });

  describe('SwapIntoDomTask', () => {
    // TODO(newmuis): Get this test working.
    it.skip('should replace element in DOM', () => {
      const parent = document.createElement('div');
      const replacedMedia = document.createElement('video');
      parent.appendChild(replacedMedia);

      expect(replacedMedia.parentElement).to.equal(parent);
      expect(el.parentElement).to.equal(null);

      const task = new SwapIntoDomTask(replacedMedia);
      return task.execute(el).then(() => {
        expect(replacedMedia.parentElement).to.equal(null);
        expect(el.parentElement).to.equal(parent);
      });
    });
  });

  describe('SwapOutOfDomTask', () => {
    // TODO(newmuis): Get this test working.
    it.skip('should replace element in DOM', () => {
      const placeholderEl = document.createElement('video');

      const parent = document.createElement('div');
      parent.appendChild(el);

      expect(el.parentElement).to.equal(parent);
      expect(placeholderEl.parentElement).to.equal(null);

      const task = new SwapOutOfDomTask(placeholderEl);
      return task.execute(el).then(() => {
        expect(el.parentElement).to.equal(null);
        expect(placeholderEl.parentElement).to.equal(parent);
      });
    });
  });
});
