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
import {DomBasedWeakRef} from '../../../src/utils/dom-based-weakref';

describes.realWin('dom-based-weakref', {}, (env) => {
  let element;
  beforeEach(() => {
    element = document.createElement('div');
    env.win.document.body.appendChild(element);
  });

  it('should use a real WeakRef if available', () => {
    if (!window.WeakRef) {
      return;
    }
    const weakref = DomBasedWeakRef.make(env.win, element);
    expect(weakref).to.be.instanceof(env.win.WeakRef);
    expect(weakref.deref()).to.equal(element);
  });

  describe('fallback', () => {
    beforeEach(() => {
      delete env.win.WeakRef;
    });

    it('should use the fallback when WeakRef is NOT available', () => {
      const weakref = DomBasedWeakRef.make(env.win, element);
      expect(weakref.deref()).to.equal(element);
    });

    it('it should use the id of the element if available', () => {
      element.id = 'some-id';
      const weakref = DomBasedWeakRef.make(env.win, element);
      expect(weakref.deref()).to.equal(element);
      expect(element.id).to.equal('some-id');
    });

    it('should fail to deref if the element has been removed from the DOM', () => {
      const weakref = DomBasedWeakRef.make(env.win, element);
      env.win.document.body.removeChild(element);
      expect(weakref.deref()).to.equal(undefined);
    });
  });
});
