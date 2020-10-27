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

import {
  createViewportObserver,
  observeWithSharedInOb,
  unobserveWithSharedInOb,
} from '../../src/viewport-observer';

describes.sandboxed('Viewport Observer', {}, (env) => {
  describe('createViewportObserver', () => {
    let win;
    let ctorSpy;
    const noop = () => {};

    const setIframed = () => (win.parent = {});
    beforeEach(() => {
      ctorSpy = env.sandbox.stub();
      win = {
        parent: null,
        document: {},
        IntersectionObserver: ctorSpy,
      };
    });

    it('When not iframed, uses null root.', () => {
      createViewportObserver(noop, win);

      expect(ctorSpy).calledWith(noop, {
        root: null,
        rootMargin: '25%',
        threshold: undefined,
      });
    });

    it('When iframed, use document root.', () => {
      setIframed();
      createViewportObserver(noop, win);

      expect(ctorSpy).calledWith(noop, {
        root: win.document,
        rootMargin: '25%',
        threshold: undefined,
      });
    });

    it('If ctor throws, fallback to rootless', () => {
      setIframed();
      ctorSpy.callsFake((_cb, {root}) => {
        if (root === win.document) {
          throw new Error();
        }
      });
      createViewportObserver(noop, win);

      expect(ctorSpy).calledWith(noop, {
        root: win.document,
        rootMargin: '25%',
        threshold: undefined,
      });
      expect(ctorSpy).calledWith(noop, {
        rootMargin: '150px',
        threshold: undefined,
      });
    });

    it('Pass along threshold argument', () => {
      createViewportObserver(noop, win, 0.5);
      expect(ctorSpy).calledWith(noop, {
        root: null,
        rootMargin: '25%',
        threshold: 0.5,
      });
    });
  });

  describe('Shared viewport observer', () => {
    let inOb;
    let win;
    let doc;
    let el1;
    let el2;
    let tracked;

    beforeEach(() => {
      inOb = env.sandbox.stub();
      tracked = new Set();
      inOb.callsFake(() => ({
        observe: (el) => tracked.add(el),
        unobserve: (el) => tracked.delete(el),
      }));

      win = {IntersectionObserver: inOb};
      doc = {defaultView: win};
      el1 = {ownerDocument: doc};
      el2 = {ownerDocument: doc};
    });

    /**
     * Simulate an IntersectionObserver callback for an element.
     * @param {!Element} el
     * @param {boolean} inViewport
     */
    function toggleViewport(el, inViewport) {
      const win = el.ownerDocument.defaultView;
      // Grabs the IO Callback shared by all the viewport observers.
      const ioCallback = win.IntersectionObserver.getCall(0).args[0];
      if (tracked.has(el)) {
        ioCallback([{target: el, isIntersecting: inViewport}]);
      }
    }

    it('observed element should have its callback fired each time it enters/exist the viewport.', () => {
      const viewportEvents = [];
      observeWithSharedInOb(el1, (inViewport) =>
        viewportEvents.push(inViewport)
      );
      toggleViewport(el1, true);
      toggleViewport(el1, false);

      expect(viewportEvents).eql([true, false]);
    });

    it('can independently observe multiple elements', () => {
      const el1Events = [];
      const el2Events = [];

      observeWithSharedInOb(el1, (inViewport) => el1Events.push(inViewport));
      observeWithSharedInOb(el2, (inViewport) => el2Events.push(inViewport));
      toggleViewport(el1, false);
      toggleViewport(el2, true);
      toggleViewport(el1, true);

      expect(el1Events).eql([false, true]);
      expect(el2Events).eql([true]);
    });

    it('once unobserved, the callback is no longer fired', () => {
      const el1Events = [];

      observeWithSharedInOb(el1, (inViewport) => el1Events.push(inViewport));
      toggleViewport(el1, false);

      unobserveWithSharedInOb(el1);
      toggleViewport(el1, true);
      toggleViewport(el1, false);

      expect(el1Events).eql([false]);
    });

    it('Observing twice with the same callback is fine, but unique ones throw', () => {
      const noop = () => {};
      observeWithSharedInOb(el1, noop);
      observeWithSharedInOb(el1, noop);

      allowConsoleError(() => {
        expect(() => observeWithSharedInOb(el1, () => {})).throws(
          'Assertion failed'
        );
      });
    });
  });
});
