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

import {Services} from '../../src/services';
import {registerServiceBuilderForDoc} from '../../src/service';
import {moveLayoutRect} from '../../src/layout-rect';
import {
  serializeMessage,
  MessageType,
} from '../../src/3p-frame-messaging';
import {tryParseJson} from '../../src/json.js';
import {Observable} from '../../src/observable';
import {
  PosObViewportInfoDef,
} from '../service/position-observer/position-observer-viewport-info';
import {
  PositionObserver,
} from '../service/position-observer/position-observer-impl';

/**
 * @implements {PosObViewportInfoDef}
 */
class PosObViewportInfoInabox {
  /**
   * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    this.win_ = ampdoc.win;
    this.onMessageReceivedObservers_ = new Observable();
    this.onViewportResizeObservers_ = new Observable();
    this.boundOnMessageEventListener_ =
        event => this.onMessageReceivedObservers_.fire(event);
    this.boundOnViewportResizeListener_ =
        () => this.onViewportResizeObservers_.fire();
    this.viewportBox_ = null;
    this.iframePosition_ = null;
    this.sentinel = null;
  }

  connect() {
    this.win_.addEventListener('message', this.boundOnMessageEventListener_);
    this.win_.addEventListener('resize', this.boundOnViewportResizeListener_);
    const object = {};
    const dataObject = tryParseJson(this.win_.name);
    if (dataObject) {
      this.sentinel = dataObject['_context']['sentinel'];
    }
    object.type = MessageType.SEND_POSITIONS_HIGH_FIDELITY;
    this.win_.parent./*OK*/postMessage(serializeMessage(
        MessageType.SEND_POSITIONS_HIGH_FIDELITY, this.sentinel),
        '*'
    );
  }

  disconnect() {
    this.win_.removeEventListener('message', this.boundOnMessageEventListener_);
    this.win_.removeEventListener('resize',
        this.boundOnViewportResizeListener_);
  }

  /**
   * @param {function()} unusedCallback
   * @return {function()}
   */
  onScroll(unusedCallback) {
    return () => {};
  }

  /**
   * @param {function(?)} callback
   * @return {function()}
   */
  onResize(callback) {
    return this.onMessageReceivedObservers_.add(callback);
  }

  /**
   * @param {function(?)} callback
   * @return {function()}
   */
  onHostMessage(callback) {
    return this.onMessageReceivedObservers_.add(callback);
  }

  getSize() {
    return this.viewportBox_;
  }

  /**
   * @param {!Element} element
   */
  getLayoutRect(element) {
    if (!this.iframePosition_) {
      // If not receive iframe position from host, or if iframe is outside vp
      return null;
    }
    if (!element['inIframePositionRect']) {
      // Not receive element position in iframe from ampDocPositionObserver
      element['inIframePositionRect'] = element./*OK*/getBoundingClientRect();
    }

    const iframeBox = this.iframePosition_;
    const elementBox = element['inIframePositionRect'];
    return moveLayoutRect(elementBox, iframeBox.left, iframeBox.top);
  }

  /**
   * @return {string}
   */
  getSentinel() {
    return this.sentinel;
  }

  /**
   * @param {!JsonObject} iframePosition
   */
  storeIframePosition(iframePosition) {
    this.iframePosition_ = iframePosition && iframePosition['positionRect'];
    this.viewportBox_ = iframePosition && iframePosition['viewportRect'];
  }
}


/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installInaboxPositionObserver(ampdoc) {
  const vsync = Services.vsyncFor(ampdoc.win);
  const viewportInfo = new PosObViewportInfoInabox(ampdoc);
  registerServiceBuilderForDoc(ampdoc,
      'position-observer',
      function() {
        return new PositionObserver(ampdoc.win, vsync, viewportInfo);
      },
      /* opt_instantiate */ true);
}
