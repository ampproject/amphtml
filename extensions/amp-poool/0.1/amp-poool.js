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
import {ActionTrust} from '../../../src/action-constants';
import {CSS} from '../../../build/amp-poool-0.1.css';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {createCustomEvent, getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isObject} from '../../../src/types';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';

/** @const {string} */
const TAG = 'amp-poool';

const EVENTS = [
  'lock',
  'release',
  'hidden',
  'disabled',
  'register',
  'error',
  'adblock',
  'outdatedBrowser',
  'userOutsideCohort',
  'identityAvailable',
  'subscribeClick',
  'loginClick',
  'dataPolicyClick',
];

class AmpPoool extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://api.poool.fr', opt_onLayout);
    this.preconnect.url('https://assets.poool.fr', opt_onLayout);
    this.preconnect.preload(
        'https://assets.poool.fr/poool.min.js',
        'script'
    );

    preloadBootstrap(this.win, this.preconnect);
  }

  /** @override */
  buildCallback() {
    // Register actions
    this.action_ = Services.actionServiceForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'poool');
    this.applyFillContent(iframe);

    // Triggered by context.updateDimensions() inside the iframe.
    listenFor(iframe, 'embed-size', data => {
      this.changeHeight(data['height']);
    }, /* opt_is3P */true);

    // Listen for everything else
    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handlePooolMessages_.bind(this)
    );

    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /**
  * @private
  * @param {Event=} event
  */
  handlePooolMessages_(event) {
    if (this.iframe_ && event.source != this.iframe_.contentWindow) {
      return;
    }

    const eventData = getData(event);
    if (!eventData) {
      return;
    }

    const parsedEventData = isObject(eventData) ?
      eventData : tryParseJson(eventData);
    if (!parsedEventData) {
      return;
    }

    if (EVENTS.indexOf(eventData['action']) > -1) {
      this.fireEvent_(eventData['action'], eventData['data']);
    }
  }

  /**
  * @private
  * @param {string=} name
  * @param {Object=} data
  */
  fireEvent_(name, data) {
    const event = createCustomEvent(this.win, `${TAG}.${name}`, data);
    this.action_.trigger(this.element, name, event, ActionTrust.HIGH);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    return true;
  }
}


AMP.extension('amp-poool', '0.1', AMP => {
  AMP.registerElement('amp-poool', AmpPoool, CSS);
});
