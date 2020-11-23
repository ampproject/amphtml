/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryEntryPoint} from './amp-story-entry-point/amp-story-entry-point-impl';
import {AmpStoryPlayer} from './amp-story-player-impl';
import {initLogConstructor} from '../log';
import {throttle} from '../utils/rate-limit';

/** @const {string} */
const SCROLL_THROTTLE_MS = 500;

export class AmpStoryComponentManager {
  /**
   * @param {!Window} win
   * @constructor
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
  }

  /**
   * Calls layoutCallback on the element when it is close to the viewport.
   * @param {!AmpStoryPlayer|!AmpStoryEntryPoint} elImpl
   * @private
   */
  layoutEl_(elImpl) {
    if (!this.win_.IntersectionObserver || this.win_ !== this.win_.parent) {
      this.layoutFallback_(elImpl);
      return;
    }

    const ioPrerenderCb = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        elImpl.prerenderCallback();

        observer.unobserve(elImpl.getElement());
      });
    };

    const observer = new IntersectionObserver(ioPrerenderCb, {
      rootMargin: '200%',
    });
    observer.observe(elImpl.getElement());

    const ioLayoutCb = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        elImpl.layoutCallback();

        visible.unobserve(elImpl.getElement());
      });
    };

    const visible = new IntersectionObserver(ioLayoutCb, {
      threshold: [0.2],
    });
    visible.observe(elImpl.getElement());
  }

  /**
   * Fallback for when IntersectionObserver is not supported. Calls
   * layoutCallback on the element when it is close to the viewport.
   * @param {!AmpStoryPlayer|!AmpStoryEntryPoint} elImpl
   * @private
   */
  layoutFallback_(elImpl) {
    // TODO(Enriqe): pause elements when scrolling away from viewport.
    this.win_.addEventListener(
      'scroll',
      throttle(
        this.win_,
        this.layoutIfVisible_.bind(this, elImpl),
        SCROLL_THROTTLE_MS
      )
    );

    // Calls it once it in case scroll event never fires.
    this.layoutIfVisible_(elImpl);
  }

  /**
   * Checks if element is close to the viewport and calls layoutCallback when it
   * is.
   * @param {!AmpStoryPlayer|!AmpStoryEntryPoint} elImpl
   * @private
   */
  layoutIfVisible_(elImpl) {
    const elTop = elImpl.getElement()./*OK*/ getBoundingClientRect().top;
    const winInnerHeight = this.win_./*OK*/ innerHeight;

    if (winInnerHeight * 2 > elTop) {
      elImpl.prerenderCallback();
    }
    if (winInnerHeight > elTop) {
      elImpl.layoutCallback();
    }
  }

  /**
   * Builds and layouts the players when appropiate.
   * @public
   */
  loadPlayers() {
    const doc = this.win_.document;
    const players = doc.getElementsByTagName('amp-story-player');
    initLogConstructor();
    for (let i = 0; i < players.length; i++) {
      const playerEl = players[i];
      const player = new AmpStoryPlayer(this.win_, playerEl);
      player.buildCallback();
      this.layoutEl_(player);
    }
  }

  /**
   * Builds and layouts entry points.
   * @public
   */
  loadEntryPoints() {
    const doc = this.win_.document;
    const entryPoints = doc.getElementsByTagName('amp-story-entry-point');
    initLogConstructor();

    for (let i = 0; i < entryPoints.length; i++) {
      const entryPointEl = entryPoints[i];
      const entryPoint = new AmpStoryEntryPoint(this.win_, entryPointEl);
      entryPoint.buildCallback();
      this.layoutEl_(entryPoint);
    }
  }
}
