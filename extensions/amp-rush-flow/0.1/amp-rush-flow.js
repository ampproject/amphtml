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

/** @const */
const TAG = 'amp-rush-flow';
const GLOBAL_CALLBACKS_PROPERTY = 'rushFlowAsyncCallbacks';

/**
 * @enum {string}
 * @private
 */
const LoadingState = {
  inProgress : 'inProgress',
  succeed : 'succeed',
  failed : 'failed'
}

/**
 * @enum {string}
 * @private
 */
const MessageType = {
  loadingSucceed : 'loading-succeed',
  loadingFailed : 'loading-failed',
  hideComponent : 'hide-component',
  changeComponentStyle : 'change-component-style',
  getLocation : 'get-location',
  saveLocation : 'save-location',
}

import {isLayoutSizeDefined} from '../../../src/layout';
import {CSS} from '../../../build/amp-rush-flow-0.1.css';
import {userAssert} from '../../../src/log';
import {setStyles, resetStyles} from '../../../src/style';
import {Services} from '../../../src/services';

export class AmpRushFlow extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.cid_ = 0;

    /** @private {?string} */
    this.width_ = '300px';

    /** @private {?string} */
    this.height_ = '100px';

    /** @private {?boolean} */
    this.preloader_ = false;

    /** @private {?string} */
    this.defaultStyles_ = '';

    /** @private {?string} */
    this.componentPostUid_ = `${this.cid_}_${new Date().getTime().toString()}_`;

    /** @private {?string} */
    this.iframe_ = null
  }

    /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://rushflow.ru',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    console.log('Build')
    this.cid_ = userAssert(
      this.element.getAttribute('data-cid'),
      'The data-cid attribute is required for <amp-rush-flow> Post %s',
      this.element
    );
    
    // Reset default AMP element sizes
    this.defaultStyles_ = this.element.classList.value.slice().split('i-amphtml-notbuilt amp-notbuilt ').join('');
    this.element.removeAttribute('width');
    this.element.removeAttribute('height');
    resetStyles(this.element, ['width', 'height']);
    this.element.classList.add('__hidden');
  }

   /** @override */
   createPlaceholderCallback() {
   }
  
  /** @override */
  layoutCallback() {
    console.log('Layout');

    this.iframe_ = this.getWin().document.createElement('iframe');
    this.iframe_.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms allow-same-origin');
    this.iframe_.setAttribute('frameborder', '0');
    this.iframe_.setAttribute('scrolling', 'no');
    
    // Load additional scripts
    const rnd = Math.random() * 10;
    const script = document.createElement('script');
    script.src = `//rushflow.ru/component-loader?rnd=${rnd}`;
    script.async = true;
    
    const container = this.element.ownerDocument.createElement('div');
    container.className = "component-container";
    
    this.element.appendChild(this.iframe_);

    const iframeWindow = this.iframe_.contentWindow;
    iframeWindow.document.head.appendChild(script);
    iframeWindow.document.body.appendChild(container);
    setStyles(iframeWindow.document.body, { margin: 0, padding: 0, });
    this.win.addEventListener('message', event => this.postMessageHandler(event));
    
    const makeUniqueMessage = (message) => `${this.componentPostUid_}${message}`;
    iframeWindow[GLOBAL_CALLBACKS_PROPERTY] = iframeWindow[GLOBAL_CALLBACKS_PROPERTY] || [];
    iframeWindow[GLOBAL_CALLBACKS_PROPERTY].push(() => {
        var params = {};
        params.cid = this.cid_.toString();
        params.container = '.component-container';
        params.successCallback = (fixedWidth, fixedHeight, styleData) => {
            if (typeof window !== 'undefined') {
                const {
                    body,
                    documentElement: html
                } = document;

                const width = fixedWidth || Math.max(
                    body.scrollWidth, body.offsetWidth,
                    html.clientWidth, html.scrollWidth, html.offsetWidth
                );

                const height = fixedHeight || Math.max(
                    body.scrollHeight, body.offsetHeight,
                    html.clientHeight, html.scrollHeight, html.offsetHeight
                );

                const style = styleData || '';
                window.parent.postMessage({ message: makeUniqueMessage('loading-succeed'), width, height, style }, '*');
            }
        };
        params.failCallback = () => {
            if (typeof window !== 'undefined') {
              window.parent.postMessage({ message: makeUniqueMessage('loading-failed') }, '*');
            }
        };
        params.hideComponentCallback = () => {
            if (typeof window !== 'undefined') {
              window.parent.postMessage({ message: makeUniqueMessage('hide-component') }, '*');
            }
        };
        params.changeComponentStyleCallback = (styleData) => {
            if (typeof window !== 'undefined') {
              const style = styleData || '';
              window.parent.postMessage({ message: makeUniqueMessage('change-component-style'), style }, '*');
            }
        };
        iframeWindow.RushFlow.renderComponent(params);
    });
  }
  
  /** @override */
  upgradeCallback() {
    console.log('Upgrade')
  }
  
  postMessageHandler(event) {
    const needToProcessMessage = event.data && event.data.message;
    if (needToProcessMessage) {
        this.messagesHandlersMap(event.data.message, event.data)
    }
  }

  messagesHandlersMap(dataMessage, eventData) {
    switch(dataMessage) {
      case `${this.componentPostUid_}${MessageType.loadingSucceed}` :
        this.loadingSucceedHandler(eventData);
        break;
      case `${this.componentPostUid_}${MessageType.loadingFailed}` :
        this.loadingFailedHandler();
        break;
      case `${this.componentPostUid_}${MessageType.hideComponent}` :
        this.hideComponentHandler();
        break;
      case `${this.componentPostUid_}${MessageType.changeComponentStyle}` :
        this.changeComponentStyleHandler(eventData);
        break;
      default:
        console.log('New handler: ', dataMessage, eventData)
    }
  }

  loadingSucceedHandler(messageData) {
    this.element.className = `${this.defaultStyles_} ${messageData.style || ''}`;
    setStyles(this.element, { 
      width: messageData.width || this.width_, 
      height: messageData.height || this.height_, 
    });
    this.iframe_.setAttribute('width', messageData.width || this.width_);
    this.iframe_.setAttribute('height', messageData.height || this.height_);
  }

  loadingFailedHandler() {
    console.log('LoadingState:', LoadingState.failed);
  }

  hideComponentHandler() {
    this.element.className = `${this.defaultStyles_} __hidden`;
  }

  changeComponentStyleHandler(messageData) {
    this.element.className = `${this.defaultStyles_} ${messageData.style || ''}`;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpRushFlow, CSS);
});
