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

import '../amp-viralize-player';
import {createElementWithAttributes} from '../../../../src/dom';
import sinon from /*OK*/ 'sinon';

describes.realWin(
  'amp-viralize-player',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-viralize-player'],
    },
  },
  (env) => {
    let win;
    let server;

    before(() => {
      server = sinon.fakeServer.create({
        autoRespond: true,
        autoRespondAfter: 0,
      });
      // Intercept Javascript file requests
      server.respondWith([200, 'text/javascript', '']);
    });

    beforeEach(() => {
      win = env.win;
    });

    after(() => {
      server.restore();
    });

    /**
     * Create a new Viralize element and append it to the body
     *
     * @param {*} attributes attributes to be used for the element
     *
     * @returns created element
     */
    function appendNewViralizeElement(attributes) {
      const element = createElementWithAttributes(
        win.document,
        'amp-viralize-player',
        attributes
      );
      win.document.body.appendChild(element);
      return element;
    }

    /**
     * Mock VPT, the Viralize player API
     *
     * @returns a function that can be invoked to simulate an
     *          event emitted by Viralize script
     */
    function viralizeVPTMock() {
      const callbacks = {};

      win.vpt = win.vpt || {};
      win.vpt.EVENTS = {
        PLAYER_READY: 'VPT-EVENT::PLAYER_READY',
      };
      win.vpt.queue = win.vpt.queue || [];
      win.vpt.on = (callbackCfg, callback) => {
        if (callbacks[callbackCfg.event] == null) {
          callbacks[callbackCfg.event] = [];
        }
        callbacks[callbackCfg.event].push(callback);
      };
      win.vpt.queue.forEach(function (fn) {
        fn();
      });
      win.vpt.queue = {
        push: function (fn) {
          fn();
        },
      };

      return (event) => {
        if (callbacks[event] == null) {
          return;
        }
        callbacks[event].forEach(function (callback) {
          callback();
        });
        callbacks[event] = null;
      };
    }

    /**
     * AMP video manager expect an iframe or a video element to be created as child of the tag.
     * Invoking this function create a mock element so as to cheat AMP
     */
    function mockViralizeIframe(element) {
      const iframe = document.createElement('iframe');
      element.appendChild(iframe);
    }

    it('should contain Viralize script after first layout complete', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.match(
        /content.viralize.tv/
      );
    });

    it('should use data-zid as script zid', async () => {
      const randomZidValue = Math.random().toString(36).substring(7);
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': randomZidValue,
        height: 180,
        width: 320,
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(
        `zid=${randomZidValue}`
      );
    });

    it('should clean the DOM on unlayout', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      await element.unlayoutCallback();
      expect(element.querySelector('script')).to.be.null;
    });

    it('should add additional query params specified by data-extra attribute', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
        'data-extra': '{"u": "viralize.com"}',
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(`u=viralize.com`);
    });

    it('should set vip_mode param to `no`, when not specified in data-extra', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(`vip_mode=no`);
    });

    it('should force vip_mode param to `no`, if a distinct value is specified', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
        'data-extra': '{"vip_mode": "always"}',
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(`vip_mode=no`);
    });

    it('should set location param to `inline`, when not specified in data-extra', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(`location=inline`);
    });

    it('should force location param to `inline`, if a distinct value is specified', async () => {
      const element = appendNewViralizeElement({
        layout: 'responsive',
        'data-zid': 'a-zid-value',
        height: 180,
        width: 320,
        'data-extra': '{"location": "auto"}',
      });
      await element.build();
      mockViralizeIframe(element);
      const simulateEvent = viralizeVPTMock(win);
      const layoutPromise = element.layoutCallback();
      await Promise.resolve();
      simulateEvent(win.vpt.EVENTS.PLAYER_READY);
      await layoutPromise;
      expect(element.querySelector('script').src).to.contain(`location=inline`);
    });
  }
);
