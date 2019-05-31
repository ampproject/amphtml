/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {getIframe} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listenFor} from '../../../src/iframe-helper';
import {Layout} from '../../../src/layout';
import {dev, userAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {
  createFrameFor,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {getData, listen} from '../../../src/event-helper';

export class AmpYmChatbot extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

   // /** @private {?Element} */
   /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.myText_ = 'Work man';

     /** @private {Array<Function>} */
     this.unlisteners_ = [];

    /** @private {?Element} */
    this.container_ = null;

    this.botId = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://rachana040.github.io/ym-SDK/', opt_onLayout);
  }

  // /**
  //  * @param {boolean=} opt_onLayout
  //  * @override
  //  */
  // preconnectCallback(opt_onLayout) {
  //   this.preconnect.url('https://app.yellowmessenger.com/widget/main.js', opt_onLayout);
  // }

  /** @override */
  buildCallback() {
    console.log("buildhey");
    const {element: el} = this;

    this.botId = userAssert(
      el.getAttribute('bot-id'),
      'The bot-id attribute is required for <amp-ym-chatbot> %s',
      el
    );
    //console.log(el.getAttribute('bot-id'));
    //console.log(el);
    //this.win.document.write("Hello");
    
    //console.log(this.applyFillContent(iframe));

    // this.container_ = this.element.ownerDocument.createElement('div');
    // this.container_.textContent = this.myText_;
    // this.element.appendChild(this.container_);
    // this.applyFillContent(this.container_, /* replacedContent */ true);
    
  }

  // /** @override */
  // layoutCallback() {
  //   const iframe = createFrameFor(
  //     this,
  //     'https://app.yellowmessenger.com/api/ml/prediction?bot=' +
  //       encodeURIComponent(dev().assertString(this.botId)) +
  //       '&text=hi&language=en'
  //   );
  //   this.iframe_ = iframe;
  //   //console.log(this.iframe_);

  //   this.unlistenMessage_ = listen(
  //     this.win,
  //     'message',
  //     this.sdnBridge_.bind(this)
  //   );
  //   //console.log(this.unlistenMessage_);

  //   return this.loadPromise(this.iframe_).then(() => this.playerReadyPromise_);
  // }

    // this.unlistenMessage_ = listen(
    //   this.win,
    //   'message',
    //   this.sdnBridge_.bind(this)
    // );
  //   this.element.appendChild(this.iframe_);
  //   return this.loadPromise(this.iframe_).then(() => console.log("resolved"));
  //   //return this.loadPromise(this.iframe_).then(() => this.playerReadyPromise_);
  // }

  /**
   *
   * @param {!Event} event
   * @private
   */
  sdnBridge_(event) {
    if (event.source) {
      if (event.source != this.iframe_.contentWindow) {
        return;
      }
    }
  }

  layoutCallback() {
    //console.log("hey");
    const iframe = getIframe(this.win, this.element, 'yellow_messenger');
    console.log(iframe);
    this.applyFillContent(iframe);
    //this.element.appendChild(iframe);
    this.iframe_= iframe;
    return this.loadPromise(iframe);
  }


  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /** @override */
  unlayoutCallback() {
    this.unlisteners_.forEach(unlisten => unlisten());
    this.unlisteners_.length = 0;

    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}

AMP.extension('amp-ym-chatbot', '0.1', AMP => {
  AMP.registerElement('amp-ym-chatbot', AmpYmChatbot);
});
