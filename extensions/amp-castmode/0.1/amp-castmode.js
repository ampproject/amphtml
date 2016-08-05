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

import {CSS} from '../../../build/amp-castmode-0.1.css';
import {CastSenderDebug, CastSenderProd} from './cast-sender';
import {Layout} from '../../../src/layout';
import {historyFor} from '../../../src/history';
import {viewerFor} from '../../../src/viewer';
import * as st from '../../../src/style';


class AmpCastmode extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    /** @private {!Element} */
    this.container_ = this.element.ownerDocument.createElement('div');
    this.applyFillContent(this.container_);
    this.element.appendChild(this.container_);

    this.registerAction('close', this.close.bind(this));

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    const startButton = this.win.document.createElement('button');
    startButton.classList.add('amp-castmode-button');
    startButton.textContent = 'CAST';
    this.win.document.body.appendChild(startButton);
    startButton.addEventListener('click', () => {
      this.activate();
    });
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  activate() {
    if (this.active_) {
      return;
    }

    const castDebugParam = viewerFor(this.win).getParam('castdebug');
    const castDebug = castDebugParam == '1';
    console.log('debug: ', castDebug);

    /** @private @const {!CastSender} */
    this.sender_ = castDebug ?
        new CastSenderDebug(this.win) :
        new CastSenderProd(this.win);

    const connectPromise = this.sender_.connect();
    connectPromise.then(() => {
      console.log('Connected!');
      this.start_();
    });
  }

  /**
   * Handles closing the castmode when the ESC key is pressed.
   * @param {!Event} event.
   * @private
   */
  closeOnEscape_(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  }

  close() {
    if (!this.active_) {
      return;
    }
    this.getViewport().leaveLightboxMode();
    this.element.style.display = 'none';
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.boundCloseOnEscape_ = null;
    this.active_ = false;
  }

  getHistory_() {
    return historyFor(this.element.ownerDocument.defaultView);
  }

  /** @private */
  start_() {
    /**  @private {function(this:AmpCastmode, Event)}*/
    this.boundCloseOnEscape_ = this.closeOnEscape_.bind(this);
    this.win.document.documentElement.addEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.getViewport().enterLightboxMode();

    this.mutateElement(() => {
      this.element.style.display = '';
    });

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });

    this.active_ = true;

    this.construct_();
  }

  /** @private */
  construct_() {

    // TODO(dvoytenko): create a preview pane, a cursor and a remote control.

    this.sender_.sendAction('show-image', {
      src: 'https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n',
    });
  }
}

AMP.registerElement('amp-castmode', AmpCastmode, CSS);
