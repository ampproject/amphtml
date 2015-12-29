/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

//import {fabric} from '../../../third_party/fabric/fabric';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {assertHttpsUrl} from '../../../src/url';
import {isLayoutSizeDefined} from '../../../src/layout';
import {parseUrl} from '../../../src/url';
import {removeChildren} from '../../../src/dom';
import {templatesFor} from '../../../src/template';
import {xhrFor} from '../../../src/xhr';


/** @const {string} */
const NODE_ID = 'i-amp-id';

/** @const {string} */
const EVENT_PREFIX = 'i-amp-event-';

/** @const {!Function} */
const assert = AMP.assert;


/**
 */
class AmpFabricComponent extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @private @const {string} */
    this.src_ = parseUrl(assert(this.element.getAttribute('src'))).href;
    this.preconnect.url(this.src_);

    /** @private @const {!Element} */
    this.container_ = this.getWin().document.createElement('div');
    this.applyFillContent(this.container_);
    this.element.appendChild(this.container_);

    this.canvasElement_ = this.getWin().document.createElement('canvas');
    this.applyFillContent(this.canvasElement_);
    this.container_.appendChild(this.canvasElement_);

    /** @private @const {!Worker|undefined} */
    this.worker_;
  }

  /** @override */
  layoutCallback() {
    this.canvas_ = new fabric.Canvas(this.canvasElement_);
    const subcontainer = this.container_.querySelector('.canvas-container');
    this.applyFillContent(subcontainer);
    subcontainer.style.width = '';
    subcontainer.style.height = '';

    // TODO: Remove. Just a test.
    var rect = new fabric.Rect({
      left: 20,
      top: 20,
      fill: 'red',
      width: 20,
      height: 20,
      angle: 45
    });
    this.canvas_.add(rect);

    // TODO(dvoytenko): do this via a non-allow-same-origin IFRAME to enable
    // CORS workers via proxy?
    return new Promise((resolve, reject) => {
      this.worker_ = new Worker(this.src_);
      console.log('WORKER: ', this.worker_);
      this.worker_.addEventListener('message', e => {
        console.log('WORKER SAID: ', e.data);
        if (!e.data) {
          return;
        }
        if (e.data.type == 'mount') {
          this.mount_(e.data.data);
          resolve();
        } else {
          console.error('Unknown message: ', e.data.type);
        }
      }, false);
      this.send_('start');
    });
  }

  /**
   * @param {!JSONObject} json
   * @private
   */
  mount_(json) {
    console.log('JSON: ', JSON.stringify(json));
    this.canvas_.loadFromJSON(json, () => {
      this.getVsync().mutate(() => {
        this.canvas_.renderAll();
      });
    });
  }

  /**
   * @param {string} type
   * @param {*=} opt_data
   * @private
   */
  send_(type, opt_data) {
    this.worker_.postMessage({
      type: type,
      data: opt_data
    });
  }
}

AMP.registerElement('amp-fabric-component', AmpFabricComponent);
