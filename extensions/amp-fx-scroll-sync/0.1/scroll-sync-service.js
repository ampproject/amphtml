/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {ScrollSyncEffect} from './scroll-sync-effect';
import {getService} from '../../../src/service';
import {viewportFor} from '../../../src/viewport';
import {vsyncFor} from '../../../src/vsync';

let lastScrollTop_ = 0;

class ScrollSyncService {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    this.win_ = win;

    /** @private @const {!Array<!ScrollSyncEffect>} */
    this.effects_ = [];

    this.viewport_ = viewportFor(win);
    this.vsync_ = vsyncFor(win);

    this.viewport_.onScroll(() => {
      this.vsync_.run({
        measure: measureScrollTop,
        mutate: onScroll,
      }, {
        effects: this.effects_,
        win: this.win_,
        viewport: this.viewport_,
      });
    });
  }

  /**
   * @param {!ScrollSyncEffect} effect
   */
  addEffect(effect) {
    if (this.effects_.indexOf(effect) == -1) {
      this.effects_.push(effect);
    }
  }

  /**
   * @param {!ScrollSyncEffect} effect
   */
  removeEffect(effect) {
    const index = this.effects_.indexOf(effect);
    if (index != -1) {
      this.effects_.splice(index, 1);
    }
  }

  /**
   * @param {!HTMLElement} element
   */
  removeAllEffect(element) {
    this.effects_ = this.effects_.filter(effect => {
      return effect.element != element;
    });
  }
}

function measureScrollTop(state) {
  state.scrollTop = state.viewport.getScrollTop();
  // TODO: Loop over effects call measure on them in a performant way. We have to
  // figure out when do we need measurement and only then do measurement.
  for (const effect of state.effects) {
    effect.measure();
  }
}


function onScroll(state) {
  const scrollTop = state.scrollTop;
  const scrollBuffer = 100;
  for (const effect of state.effects) {
    // TODO: This probably need a bit more thinking on when the directional animation
    // should be transitioned and what data does it need. Otherwise this will
    // call transition for directional animations ALL the time.
    if (effect.isDirectional()) {
      effect.transition(scrollTop);
    } else if (scrollTop >= effect.getScrollMin() - scrollBuffer &&
        scrollTop <= effect.getScrollMax() + scrollBuffer ) {
      const range = effect.getScrollMax() - effect.getScrollMin();
      const normPosition = (scrollTop - effect.getScrollMin()) / range;
      effect.transition(normPosition);
    }

    // TODO: Figure out fast scroll problems and unsync transitions.
    // If last scroll is a LOT different than current scroll.
    // Do unsync transition.
  }
  lastScrollTop_ = scrollTop;
}


/**
 * @param {!Window} win
 * @return {!ScrolLSyncService}
 */
export function installScrollSyncService(win) {
  return getService(win, 'scroll-sync-service', () => {
    return new ScrollSyncService(win);
  });
}

installScrollSyncService(AMP.win);
