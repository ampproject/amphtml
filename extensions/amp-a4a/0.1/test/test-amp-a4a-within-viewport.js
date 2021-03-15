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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../../extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import '../../../amp-ad/0.1/amp-ad';
import {AmpA4A} from '../amp-a4a';
import {htmlFor} from '../../../../src/static-template';
import {pushIfNotExist, removeItem} from '../../../../src/utils/array';
import {upgradeOrRegisterElement} from '../../../../src/service/custom-element-registry';

describes.realWin(
  'amp-a4a: whenWithinViewport',
  {
    amp: true,
  },
  (env) => {
    let win, doc, html;
    let element;
    let impl;
    let observers;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);

      observers = [];
      env.sandbox
        .stub(win, 'IntersectionObserver')
        .callsFake((callback, options) => {
          const elements = [];
          observers.push({elements, callback, options: options || {}});
          return {
            observe(element) {
              pushIfNotExist(elements, element);
            },
            unobserve(element) {
              removeItem(elements, element);
            },
            disconnect() {
              elements.length = 0;
            },
          };
        });

      upgradeOrRegisterElement(win, 'amp-a4a', AmpA4A);

      element = html`
        <amp-a4a layout="fixed" width="100" height="100"></amp-a4a>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      impl = await element.getImpl();
    });

    function notifyIntersection(rootMargin, isIntersecting) {
      for (let i = 0; i < observers.length; i++) {
        const {elements, callback, options} = observers[i];
        if (
          elements.includes(element) &&
          options.root === doc &&
          options.rootMargin === rootMargin
        ) {
          callback([
            {
              target: element,
              isIntersecting,
              intersectionRatio: isIntersecting ? 1 : 0,
              boundingClientRect: element.getBoundingClientRect(),
              intersectionRect: element.getBoundingClientRect(),
              rootBounds: doc.documentElement.getBoundingClientRect(),
            },
          ]);
        }
      }
    }

    function isObserved(rootMargin) {
      for (let i = 0; i < observers.length; i++) {
        const {elements, options} = observers[i];
        if (
          elements.includes(element) &&
          options.root === doc &&
          options.rootMargin === rootMargin
        ) {
          return true;
        }
      }
      return false;
    }

    it('should resolve immediately when viewport=true is provided', async () => {
      await impl.whenWithinViewport(true);
    });

    it('should resolve immediately when the element is already loaded', async () => {
      env.sandbox.stub(impl.getResource(), 'isLayoutPending').returns(false);
      await impl.whenWithinViewport(1);
    });

    it('should wait for within-viewport for viewport=1', async () => {
      const promise = impl.whenWithinViewport(1);
      expect(isObserved('0%')).to.be.true;
      notifyIntersection('0%', true);

      expect(isObserved('0%')).to.be.false;
      await promise;
    });

    it('should wait for within-viewport for viewport=3', async () => {
      const promise = impl.whenWithinViewport(3);
      // 200% = (3 - 1) * 100%
      expect(isObserved('200%')).to.be.true;
      notifyIntersection('200%', true);

      expect(isObserved('200%')).to.be.false;
      await promise;
    });

    it('should ignore non-intersecting notifications', () => {
      impl.whenWithinViewport(1);
      expect(isObserved('0%')).to.be.true;
      notifyIntersection('0%', false);

      expect(isObserved('0%')).to.be.true;
    });

    it('should ignore notifications for other root margins', () => {
      impl.whenWithinViewport(1);
      impl.whenWithinViewport(3);
      expect(isObserved('0%')).to.be.true;
      expect(isObserved('200%')).to.be.true;

      notifyIntersection('0%', true);

      expect(isObserved('0%')).to.be.false;
      expect(isObserved('200%')).to.be.true;
    });
  }
);
