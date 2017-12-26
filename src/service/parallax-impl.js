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

import {isExperimentOn} from '../experiments';
import {getServiceForDoc} from '../service';
import {Services} from '../services';
import {registerServiceBuilderForDoc} from '../service';
import {setStyles} from '../style';
import {toArray} from '../types';
import {user} from '../log';
import {
  installPositionObserverServiceForDoc,
} from '../service/position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../service/position-observer/position-observer-worker';

const ATTR = 'amp-fx-parallax';
const EXPERIMENT = ATTR;

/**
 * Installs parallax handlers, tracks the previous scroll position and
 * implements post-parallax-update scroll hooks.
 */
export class ParallaxService {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    this.ampdoc_ = ampdoc;
    this.root_ = ampdoc.getRootNode();

    installPositionObserverServiceForDoc(ampdoc);

    this.scan_(ampdoc.win);
  }

  /**
   * @private
   */
  scan_() {
    const elements = toArray(this.root_.querySelectorAll(`[${ATTR}]`));
    elements.forEach(element => new ParallaxElement(element, this.ampdoc_));
  }
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
export class ParallaxElement {
  /**
   * @param {!Element} element The element to give a parallax effect.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(element, ampdoc) {
    const factor = element.getAttribute(ATTR);

    /** @private{!../service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    this.vsync_ = Services.vsyncFor(ampdoc.win);

    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private @const {number} */
    this.factor_ = (factor ? parseFloat(factor) : 0.5) - 1;

    /** @private {number} */
    this.offset_ = 0;

    this.previousPosition_ = null;

    this.observe_();
  }

  /**
   * Apply the parallax effect to the offset given how much the page
   * has moved since the last frame.
   */
  update_(entry) {
    // outside viewport or user has not scrolled yet
    if (!entry.positionRect) {
      return;
    }

    if (!this.previousPosition_) {
      this.previousPosition_ = entry.positionRect.top;
    }

    const delta = this.previousPosition_ - entry.positionRect.top;
    this.previousPosition_ = entry.positionRect.top;
    this.offset_ += delta * this.factor_;
    this.vsync_.mutate(() => {
      setStyles(this.element_,
        {transform: `translateY(${-this.offset_.toFixed(0)}px)`}
      );
    });
  }

  observe_() {
    this.viewport_.onResize(() => {
      this.initialPosition_ = null;
      this.update_();
    });

    this.positionObserver_.observe(this.element_, PositionObserverFidelity.HIGH,
        this.update_.bind(this)
    );
  }
}

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installParallaxForDoc(nodeOrDoc) {
  // const enabled = isExperimentOn(AMP.win, EXPERIMENT);
  // user().assert(enabled, `Experiment "${EXPERIMENT}" is disabled.`);
  registerServiceBuilderForDoc(
      nodeOrDoc,
      'amp-fx-parallax',
      ParallaxService,
      /* opt instantiate */ true);
};
