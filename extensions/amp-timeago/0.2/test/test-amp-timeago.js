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
import '../amp-timeago';
import {act} from 'react-dom/test-utils';
import {toggleExperiment} from '../../../../src/experiments';
import {whenCalled} from '../../../../testing/test-helper.js';
import {whenUpgradedToCustomElement} from '../../../../src/dom';

describes.realWin(
  'amp-timeago',
  {
    amp: {
      extensions: ['amp-timeago:0.2'],
    },
  },
  env => {
    let win;
    let element;
    let observerCallback = () => {};

    const timeout = ms => new Promise(res => setTimeout(res, ms));
    const getShadow = async () => {
      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();
      await whenCalled(env.sandbox.spy(element, 'attachShadow'));
      return element.shadowRoot;
    };

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-timeago-v2', true);

      win.IntersectionObserver = (callback, unusedOptions) => {
        observerCallback = callback;
        return {observe: () => {}};
      };

      element = win.document.createElement('amp-timeago');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '160px');
      element.setAttribute('height', '20px');
    });

    afterEach(() => {
      toggleExperiment(win, 'amp-timeago-v2', false);
    });

    it('should renders display 2 days ago when built', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);

      const shadow = await getShadow();
      const timeElement = shadow.querySelector('time');
      expect(timeElement.textContent).to.equal('2 days ago');
    });

    it('should display original date when older than cutoff', async () => {
      const date = new Date('2017-01-01');
      element.setAttribute('datetime', date.toISOString());
      element.textContent = 'Sunday 1 January 2017';
      element.setAttribute('cutoff', '8640000');
      win.document.body.appendChild(element);

      const shadowRoot = await getShadow();
      const timeElement = shadowRoot.querySelector('time');
      expect(timeElement.textContent).to.equal('Sunday 1 January 2017');
    });

    it('should update fuzzy timestamp on enter viewport', async () => {
      const date = new Date();
      date.setSeconds(date.getSeconds() - 10);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);

      const shadow = await getShadow();
      const timeElement = shadow.querySelector('time');
      await timeout(1000);
      expect(timeElement.textContent).to.equal('10 seconds ago');

      await act(async () => {
        observerCallback([{target: timeElement, isIntersecting: true}]);
      });
      expect(timeElement.textContent).to.equal('11 seconds ago');
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);

      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      element.mutatedAttributesCallback({
        'datetime': date.toString(),
      });

      const shadow = await getShadow();
      const timeElement = shadow.querySelector('time');
      expect(timeElement.textContent).to.equal('1 day ago');
    });
  }
);
