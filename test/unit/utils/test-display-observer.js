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

import {Deferred} from '../../../src/utils/promise';
import {
  measureDisplay,
  observeDisplay,
  unobserveDisplay,
} from '../../../src/utils/display-observer';
import {removeItem} from '../../../src/utils/array';

describes.realWin('display-observer', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let element;
  let docObserver, viewportObserver;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    element = doc.createElement('div');
    element.id = 'element1';
    doc.body.appendChild(element);

    class FakeIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.elements = [];
      }

      disconnect() {}

      observe(element) {
        if (this.elements.includes(element)) {
          throw new Error('already observed');
        }
        this.elements.push(element);
      }

      unobserve(element) {
        if (!this.elements.includes(element)) {
          throw new Error('not observed');
        }
        removeItem(this.elements, element);
      }

      notify(entries) {
        const {callback} = this;
        return Promise.resolve().then(() => {
          callback(entries, this);
        });
      }
    }

    docObserver = null;
    viewportObserver = null;
    env.sandbox
      .stub(win, 'IntersectionObserver')
      .value(function (callback, options) {
        if (!options.root) {
          return (viewportObserver =
            viewportObserver ||
            new FakeIntersectionObserver(callback, options));
        }
        if (options.root == doc.body) {
          return (docObserver =
            docObserver || new FakeIntersectionObserver(callback, options));
        }
        return new FakeIntersectionObserver(callback, options);
      });
  });

  function createCallbackCaller() {
    const results = [];
    let deferred = null;
    const caller = (value) => {
      results.push(value);
      if (deferred) {
        const next = results.shift();
        deferred.resolve(next);
        deferred = null;
      }
    };
    caller.next = () => {
      if (results.length > 0) {
        const next = results.shift();
        return Promise.resolve(next);
      }
      deferred = new Deferred();
      return deferred.promise;
    };
    caller.isEmpty = () => results.length == 0;
    return caller;
  }

  describe('measureDisplay', () => {
    it('should measure display via doc observer', async () => {
      const promise = measureDisplay(element);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(docObserver.elements).to.not.include(element);
    });

    it('should measure display via viewport observer', async () => {
      const promise = measureDisplay(element);
      viewportObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should measure display via one of observers', async () => {
      const promise = measureDisplay(element);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should measure display via as false', async () => {
      const promise = measureDisplay(element);
      docObserver.notify([{target: element, isIntersecting: false}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.false;
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });
  });

  describe('observe', () => {
    it('should observe changes: true -> false', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Change intersection.
      docObserver.notify([{target: element, isIntersecting: false}]);
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // No change.
      await viewportObserver.notify([{target: element, isIntersecting: false}]);
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should observe changes: false -> true', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      await docObserver.notify([{target: element, isIntersecting: false}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.false;

      // Change intersection.
      docObserver.notify([{target: element, isIntersecting: true}]);
      const display2 = await callbackCaller.next();
      expect(display2).to.be.true;

      // No change.
      viewportObserver.notify([{target: element, isIntersecting: true}]);
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should ignore unknown intersection', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      await docObserver.notify([{target: element, isIntersecting: false}]);
      expect(callbackCaller.isEmpty()).to.be.true;

      // Change intersection.
      await docObserver.notify([{target: element, isIntersecting: true}]);
      expect(callbackCaller.isEmpty()).to.be.false;
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;
    });

    it('should only observe last change', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([
        {target: element, isIntersecting: false},
        {target: element, isIntersecting: true},
      ]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should observe multiple callbacks', async () => {
      // First callback.
      const callbackCaller1 = createCallbackCaller();
      observeDisplay(element, callbackCaller1);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const display1 = await callbackCaller1.next();
      expect(display1).to.be.true;

      // Second callback.
      const callbackCaller2 = createCallbackCaller();
      observeDisplay(element, callbackCaller2);
      const display2 = await callbackCaller2.next();
      expect(display2).to.be.true;
    });

    it('should unobserve multiple callbacks', async () => {
      const callbackCaller1 = createCallbackCaller();
      const callbackCaller2 = createCallbackCaller();
      observeDisplay(element, callbackCaller1);
      observeDisplay(element, callbackCaller2);
      expect(docObserver.elements).to.include(element);
      expect(viewportObserver.elements).to.include(element);

      // Unobserve first callback.
      unobserveDisplay(element, callbackCaller2);
      expect(docObserver.elements).to.include(element);
      expect(viewportObserver.elements).to.include(element);

      // Unobserve second callback.
      unobserveDisplay(element, callbackCaller1);
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should observe document visibility', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Paused visibility.
      ampdoc.overrideVisibilityState('paused');
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // Visibile visibility.
      ampdoc.overrideVisibilityState('visible');
      const display3 = await callbackCaller.next();
      expect(display3).to.be.true;
    });

    it('should treat hidden document visibility as displayed', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Paused visibility.
      ampdoc.overrideVisibilityState('paused');
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // Hidden visibility.
      ampdoc.overrideVisibilityState('hidden');
      const display3 = await callbackCaller.next();
      expect(display3).to.be.true;
    });
  });
});
