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
  measureContentSize,
  observeContentSize,
  unobserveContentSize,
} from '../../../src/utils/size-observer';
import {removeItem} from '../../../src/utils/array';

describes.realWin('size-observer', {}, (env) => {
  let win, doc;
  let observer;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    element = doc.createElement('div');
    element.id = 'element1';
    doc.body.appendChild(element);

    class FakeResizeObserver {
      constructor(callback) {
        this.callback = callback;
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
        Promise.resolve().then(() => {
          callback(entries);
        });
      }
    }

    env.sandbox.stub(win, 'ResizeObserver').value(function (callback) {
      if (!observer) {
        observer = new FakeResizeObserver(callback);
      }
      return observer;
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

  it('should measure content size', async () => {
    const promise = measureContentSize(element);
    observer.notify([
      {target: element, contentRect: {width: 101, height: 102}},
    ]);
    const {width, height} = await promise;
    expect(width).to.equal(101);
    expect(height).to.equal(102);
    expect(observer.elements).to.not.include(element);
  });

  it('should observe changes', async () => {
    const callbackCaller = createCallbackCaller();
    observeContentSize(element, callbackCaller);

    // First response.
    observer.notify([
      {target: element, contentRect: {width: 101, height: 102}},
    ]);
    const size1 = await callbackCaller.next();
    expect(size1.width).to.equal(101);
    expect(size1.height).to.equal(102);

    // Resize.
    observer.notify([
      {target: element, contentRect: {width: 201, height: 102}},
    ]);
    const size2 = await callbackCaller.next();
    expect(size2.width).to.equal(201);
    expect(size2.height).to.equal(102);
  });

  it('should only observe last change', async () => {
    const callbackCaller = createCallbackCaller();
    observeContentSize(element, callbackCaller);

    observer.notify([
      {target: element, contentRect: {width: 101, height: 102}},
      {target: element, contentRect: {width: 103, height: 102}},
    ]);
    const size1 = await callbackCaller.next();
    expect(size1.width).to.equal(103);
    expect(size1.height).to.equal(102);
    expect(callbackCaller.isEmpty()).to.be.true;
  });

  it('should observe multiple callbacks', async () => {
    // First callback.
    const callbackCaller1 = createCallbackCaller();
    observeContentSize(element, callbackCaller1);
    observer.notify([
      {target: element, contentRect: {width: 101, height: 102}},
    ]);
    const size1 = await callbackCaller1.next();
    expect(size1.width).to.equal(101);
    expect(size1.height).to.equal(102);

    // Second callback.
    const callbackCaller2 = createCallbackCaller();
    observeContentSize(element, callbackCaller2);
    const size2 = await callbackCaller2.next();
    expect(size2.width).to.equal(101);
    expect(size2.height).to.equal(102);
  });

  it('should unobserve multiple callbacks', async () => {
    const callbackCaller1 = createCallbackCaller();
    const callbackCaller2 = createCallbackCaller();
    observeContentSize(element, callbackCaller1);
    observeContentSize(element, callbackCaller2);
    expect(observer.elements).to.include(element);

    // Unobserve first callback.
    unobserveContentSize(element, callbackCaller2);
    expect(observer.elements).to.include(element);

    // Unobserve second callback.
    unobserveContentSize(element, callbackCaller1);
    expect(observer.elements).to.not.include(element);
  });
});
