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

import {WebPushService} from '../web-push-service';
import {TAG, CONFIG_TAG} from '../vars';
import {toggleExperiment} from '../../../../src/experiments';
import {WebPushConfigAttributes, WebPushConfig} from '../amp-web-push-config';
import {
  getElementClassForTesting,
  registerElement,
} from '../../../../src/custom-element';

describes.realWin('web-push-config', {
  amp: true,
}, env => {
  let win;
  let webPushConfig = {};

  function setDefaultWebPushConfig() {
    const webPushConfig = {};
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      'https://a.com/webpush/amp/helper?https=1';
    webPushConfig[WebPushConfigAttributes.PERMISSION_DIALOG_URL] =
      'https://a.com/webpush/amp/subscribe?https=1';
    webPushConfig[WebPushConfigAttributes.SERVICE_WORKER_URL] =
      'https://a.com/service-worker.js?param=value';
    return webPushConfig;
  }

  beforeEach(() => {
    win = env.win;
    webPushConfig = setDefaultWebPushConfig();
    toggleExperiment(env.win, TAG, true);
  });

  function createConfigElementWithAttributes(attributes) {
    if (!getElementClassForTesting(win, CONFIG_TAG)) {
      // Our tests may call this function multiple times, but an element class
      // can only be registered once
      registerElement(env.win, CONFIG_TAG, WebPushConfig);
    }
    const element = env.win.document.createElement(CONFIG_TAG);
    element.setAttribute(WebPushConfigAttributes.HELPER_FRAME_URL,
        attributes[WebPushConfigAttributes.HELPER_FRAME_URL]);
    element.setAttribute(WebPushConfigAttributes.PERMISSION_DIALOG_URL,
        attributes[WebPushConfigAttributes.PERMISSION_DIALOG_URL]);
    element.setAttribute(WebPushConfigAttributes.SERVICE_WORKER_URL,
        attributes[WebPushConfigAttributes.SERVICE_WORKER_URL]);
    element.setAttribute('id', TAG);
    win.document.body.appendChild(element);
    return element;
  }

  function removeAllWebPushConfigElements() {
    const elements = win.document.querySelectorAll(CONFIG_TAG);
    elements.forEach(element => element.remove());
  }

  afterEach(() => {
    toggleExperiment(env.win, TAG, false);
  });

  it('should fail if experiment is not enabled', () => {
    toggleExperiment(env.win, TAG, false);
    // Experiment check is bypassed on test mode -- make sure it isn't.
    window.AMP_MODE = {test: false};
    expect(() => {
      new WebPushService(env.ampdoc).ensureAmpExperimentEnabled_();
    }).to.throw(`Experiment "${TAG}" is disabled. Enable it on ` +
      'https://cdn.ampproject.org/experiments.html.');
  });

  it('should fail if element does not have correct ID', () => {
    return env.ampdoc.whenReady().then(() => {
      const element = createConfigElementWithAttributes(webPushConfig);
      element.removeAttribute('id');
      expect(() => {
        element.implementation_.validate();
      }).to.throw(/must have an id attribute with value/);
    });
  });

  it('should fail if page contains duplicate element id', () => {
    return env.ampdoc.whenReady().then(() => {
      createConfigElementWithAttributes(webPushConfig);
      const element = createConfigElementWithAttributes(webPushConfig);
      expect(() => {
        element.implementation_.validate();
      }).to.throw(/only one .* element may exist on a page/i);
    });
  });

  it('should fail if any attribute is missing', () => {
    const promises = [];
    for (const attribute in WebPushConfigAttributes) {
      const configName = WebPushConfigAttributes[attribute];
      const promise = env.ampdoc.whenReady().then(() => {
        removeAllWebPushConfigElements();
        webPushConfig = setDefaultWebPushConfig();
        delete webPushConfig[configName];
        const element = createConfigElementWithAttributes(webPushConfig);
        expect(() => {
          element.implementation_.validate();
        }).to.throw(
            new RegExp('must have a valid ' + configName + ' attribute'));
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  });

  it('should fail if any attribute is HTTP', () => {
    const promises = [];
    for (const attribute in WebPushConfigAttributes) {
      const configName = WebPushConfigAttributes[attribute];
      const promise = env.ampdoc.whenReady().then(() => {
        removeAllWebPushConfigElements();
        webPushConfig[configName] = 'http://example.com/test';
        const element = createConfigElementWithAttributes(webPushConfig);
        expect(() => {
          element.implementation_.validate();
        }).to.throw(/should begin with the https:\/\/ protocol/);
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  });

  it('should fail if any attribute is site root page', () => {
    const promises = [];
    for (const attribute in WebPushConfigAttributes) {
      const configName = WebPushConfigAttributes[attribute];
      const promise = env.ampdoc.whenReady().then(() => {
        removeAllWebPushConfigElements();
        webPushConfig[configName] = 'http://example.com/';
        const element = createConfigElementWithAttributes(webPushConfig);
        expect(() => {
          element.implementation_.validate();
        }).to.throw(/and point to the/);
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  });

  it('should fail if any attribute value\'s protocol is missing', () => {
    const promises = [];
    for (const attribute in WebPushConfigAttributes) {
      const configName = WebPushConfigAttributes[attribute];
      const promise = env.ampdoc.whenReady().then(() => {
        removeAllWebPushConfigElements();
        webPushConfig[configName] = 'www.example.com/test';
        const element = createConfigElementWithAttributes(webPushConfig);
        expect(() => {
          element.implementation_.validate();
        }).to.throw(/should begin with the https:\/\/ protocol/);
      });
      promises.push(promise);
    }
    return Promise.all(promises);
  });

  it('should fail if attribute origins differ', () => {
    webPushConfig[WebPushConfigAttributes.HELPER_FRAME_URL] =
      'https://another-origin.com/test';
    return env.ampdoc.whenReady().then(() => {
      const element = createConfigElementWithAttributes(webPushConfig);
      expect(() => {
        element.implementation_.validate();
      }).to.throw(/must all share the same origin/);
    });
  });

  it('should succeed for valid config', () => {
    return env.ampdoc.whenReady().then(() => {
      const element = createConfigElementWithAttributes(webPushConfig);
      element.implementation_.validate();
    });
  });
});
