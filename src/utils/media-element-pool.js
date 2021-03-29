/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/** @private {!Array<string>} */
const ATTRS_TO_CLEANUP = [
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'controls',
  'crossorigin',
  'disableremoteplayback',
  'controlsList',
  'title',
  'src',
  'poster',
  'playsinline',
  'webkit-playsinline',
  'preload',
];

const MAX_POOL_SIZE = 4;

/**
 * @typedef {{
 *   element: !HTMLMediaElement,
 *   isPlaying: boolean,
 *   isIntersecting: boolean,
 *   parent: ?AmpElement,
 *   allocTime: ?time,
 * }}
 */
let PoolItemDef;

/** @implements {Disposable} */
export class MediaElementPool {
  /**
   * @param {!Window} win
   * @param {string} type
   */
  constructor(win, type) {
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.type_ = type;

    /** @private @const {!Array<!PoolItemDef>} */
    this.pool_ = [];

    /** @private @const {!IntersectionObserver} */
    this.io_ = new win.IntersectionObserver(
      (entries) => {
        entries.forEach(({target, isIntersecting}) => {
          const existing = this.pool_.find((item) => item.element === target);
          if (existing) {
            existing.isIntersecting = isIntersecting;
          }
        });
      },
      {
        root: win.document,
        // TODO: Same as the scheduler. But should it be different?
        rootMargin: '250% 31.25%',
      }
    );
  }

  /** @overriden */
  dispose() {
    this.pool_.length = 0;
    this.io_.disconnect();
  }

  /**
   * @param {!AmpElement} parent
   */
  alloc(parent) {
    console.log('POOL: alloc for ', parent.id);

    // Already exists?
    const existing = this.pool_.find((item) => item.parent === parent);
    if (existing) {
      console.log('POOL: existing:', this.pool_.indexOf(existing));
      return existing.element;
    }

    // Still space?
    if (this.pool_.length < MAX_POOL_SIZE) {
      console.log('POOL: simple alloc:', this.pool_.length);
      return this.allocNew_(parent);
    }

    // Steal from someone.
    let reuse = null;
    let maxScore = 0;
    const now = Date.now();
    for (let i = 0; i < this.pool_.length; i++) {
      const record = this.pool_[i];
      if (!record.parent) {
        reuse = record;
        break;
      }
      if (record.allocTime < 1000) {
        // Prevent a loop of stealing from each other.
        continue;
      }
      if (record.isIntersecting) {
        // Can't unmount a visible element.
        continue;
      }
      if (record.isPlaying) {
        // Can't unmount a currently playing element.
        continue;
      }
      // TODO: other factors:
      // - is it currently playing?
      const score = now - record.allocTime;
      if (score > maxScore) {
        reuse = record;
        maxScore = score;
      }
    }

    if (reuse) {
      console.log('POOL: reuse:', this.pool_.indexOf(reuse), reuse.parent?.id);
      const oldParent = reuse.parent;
      reuse.parent = parent;
      reuse.allocTime = now;
      if (oldParent) {
        oldParent.unmount();
      }
      resetMediaElement(reuse.element);
      return reuse.element;
    }

    // Failed to reuse. Alloc a new one.
    console.log('POOL: force alloc');
    return this.allocNew_(parent);
  }

  dealloc(parent) {
    const existing = this.pool_.find((item) => item.parent === parent);
    if (existing) {
      existing.parent = null;
      resetMediaElement(existing.element);
    }
  }

  blessAll() {
    // TOOD:
    // 1. Alloc up to MAX_POOL_SIZE
    // 2. Flip mute/unmute
  }

  allocNew_(parent) {
    const element = this.win_.document.createElement(this.type_);
    const record = {
      element,
      isPlaying: false,
      isIntersecting: false,
      parent,
      allocTime: parent ? Date.now() : null,
    };
    this.pool_.push(record);
    // TODO: we don't have to track intersections for all videos. Only currently
    // allocated ones.
    this.io_.observe(element);
    ['play', 'playing', 'pause', 'ended'].forEach((eventType) => {
      element.addEventListener(eventType, ({type}) => {
        record.isPlaying = type == 'play' || type == 'playing';
      });
    });
    return element;
  }
}

/**
 * @param {!HTMLMediaElement} element
 */
function resetMediaElement(element) {
  ATTRS_TO_CLEANUP.forEach((attr) => element.removeAttribute(attr));
}
