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
import {AmpStoryPlayerViewportObserver} from './amp-story-player-viewport-observer';
import {initLogConstructor} from '../log';

/**
 * Minimum amount of viewports away from the player to start prerendering.
 * @const {number}
 */
const MIN_VIEWPORT_PRERENDER_DISTANCE = 2;

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
    new AmpStoryPlayerViewportObserver(
      this.win_,
      elImpl.getElement(),
      elImpl.layoutCallback.bind(elImpl),
      MIN_VIEWPORT_PRERENDER_DISTANCE
    );
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
