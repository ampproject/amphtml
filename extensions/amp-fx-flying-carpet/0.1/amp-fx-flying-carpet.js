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

import {CSS} from '../../../build/amp-fx-flying-carpet-0.1.css';
import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';
import {dev, user} from '../../../src/log';
import {setStyle} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-fx-flying-carpet';

class AmpFlyingCarpet extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  isReadyToBuild() {
    // Wait for all our children to be parsed.
    return false;
  }

  /** @override */
  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      dev.warn(EXPERIMENT, `Experiment ${EXPERIMENT} disabled`);
      return;
    }

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    const children = this.getRealChildNodes();
    const doc = this.element.ownerDocument;

    /**
     * A cached reference to the container, used to set its width to match
     * the flying carpet's.
     * @private @const
     */
    this.container_ = doc.createElement('div');

    const clip = doc.createElement('div');
    clip.setAttribute('class', '-amp-fx-flying-carpet-clip');
    this.container_.setAttribute('class', '-amp-fx-flying-carpet-container');

    for (let i = 0; i < children.length; i++) {
      this.container_.appendChild(children[i]);
    }
    clip.appendChild(this.container_);

    this.element.appendChild(clip);
  }

  onLayoutMeasure() {
    const width = this.getLayoutWidth();
    this.vsync_.mutate(() => {
      setStyle(this.container_, 'width', width, 'px');
    });
  }

  assertPosition() {
    const layoutBox = this.element.getLayoutBox();
    const viewport = this.getViewport();
    const viewportHeight = viewport.getHeight();
    const docHeight = viewport.getScrollHeight();
    // Hmm, can the page height change and affect us?
    user.assert(
      layoutBox.top >= viewportHeight,
      '<amp-fx-flying-carpet> elements must be positioned after the first ' +
      'viewport: %s Current position: %s. Min: %s',
      this.element,
      layoutBox.top,
      viewportHeight
    );
    user.assert(
      layoutBox.bottom <= docHeight - viewportHeight,
      '<amp-fx-flying-carpet> elements must be positioned before the last ' +
      'viewport: %s Current position: %s. Max: %s',
      this.element,
      layoutBox.bottom,
      docHeight - viewportHeight
    );
  }

  layoutCallback() {
    this.assertPosition();
    return Promise.resolve();
  }
}

AMP.registerElement('amp-fx-flying-carpet', AmpFlyingCarpet, CSS);
