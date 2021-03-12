/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview The shared service used by all custom elements to talk to Assistant services. It loads an iframe that exports
 * endpoints to handle requests from custom elements.
 */

import * as closure from '../../../third_party/closure-responding-channel/closure-bundle';
import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {addAttributesToElement} from '../../../src/dom';
import {toggle} from '../../../src/style';
import frameServicePb from '../../../third_party/assistjs-proto/exports';

export class AssistjsFrameService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampdoc;

    /** @private {?AssistjsConfigService} */
    this.configService_ = null;

    /** @private {?AssistjsRuntimeService} */
    this.runtimeService_ = null;

    /** @private {Deferred} */
    this.initializedDeferred_ = new Deferred();

    /** @private */
    this.respondingChannelDeferred_ = new Deferred();

    /** Create Assistant iframe and append it to the main AMP document. */
    this.createAssistantIframe_();
  }

  /** @private */
  createAssistantIframe_() {
    this.ampDoc_.whenFirstVisible().then(() => {
      this.configService_ = Services.assistjsConfigServiceForDoc(this.ampDoc_);
      this.runtimeService_ = Services.assistjsRuntimeServiceForDoc(
        this.ampDoc_
      );

      // Add a DeferredChannel to FrameService to unblock any widget initialization. It would resolve after the iframe gets
      // loaded and the channel gets constructed successfully with the iframe.
      const deferredChannel = closure.createDeferredChannel();
      this.runtimeService_.addPort('FrameService', deferredChannel);
      this.initializedDeferred_.resolve();

      const iframe = this.ampDoc_.win.document.createElement('iframe');
      this.configService_.getWidgetIframeUrl('frame').then((iframeUrl) => {
        addAttributesToElement(iframe, {
          src: iframeUrl,
          allow: 'microphone',
          sandbox: 'allow-scripts',
        });
        toggle(iframe, false);
        document.body.appendChild(iframe);
      });

      iframe.addEventListener('load', () => {
        const portChannel = closure.createPortChannel(
          iframe.contentWindow,
          this.configService_.getAssistjsServer()
        );
        closure.resolveDeferredChannel(portChannel);

        // TODO: expose a new endpoint in runtime service for custom elements to register
        // services for the channel with its iframe.
        const respondingChannel = closure.createRespondingChannel(
          portChannel,
          new Map()
        );
        this.respondingChannelDeferred_.resolve(respondingChannel);
      });
    });
  }

  /**
   * @return {Deferred}
   */
  getInitializedDeferred() {
    return this.initializedDeferred_;
  }

  /**
   * @param {string} widgetName
   */
  reportWidget(widgetName) {
    const responsePromise = new Promise((resolve) => {
      this.respondingChannelDeferred_.promise.then((channel) => {
        closure.send(
          /* channel= */ channel,
          /* serviceName= */ 'FrameService.ReportWidget',
          /* payload= */ {
            'payload': new frameServicePb.ReportWidgetRequest()
              .setWidgetName(widgetName)
              .serializeBinary(),
          },
          resolve
        );
      });
    });

    responsePromise.then((response) => {
      if (response['error']) {
        const error = new Error();
        error.message = response['error'];
        throw error;
      }
    });
  }

  /**
   * Activates Assistant microphone on 3P page.
   */
  openMic() {
    // TODO: add implementation once the channels for iframes are implemented.
  }

  /**
   * Sends text query to Assistant server.
   */
  sendTextQuery() {
    // TODO: add implementation once the channels for iframes are implemented.
  }
}
