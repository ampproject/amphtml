/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from '../../src/observable';

describe('Observable', () => {
  let sandbox;
  let observable;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    observable = new Observable();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('add-remove-fire', () => {
    let observer1Called = 0;
    const observer1 = () => {
      observer1Called++;
    };
    observable.add(observer1);

    let observer2Called = 0;
    const observer2 = () => {
      observer2Called++;
    };
    const observer2Key = observable.add(observer2);

    expect(observer1Called).to.equal(0);
    expect(observer2Called).to.equal(0);

    observable.fire('A');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(1);

    observable.remove(observer1);
    observable.fire('B');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);

    observer2Key();
    observable.fire('C');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);

    observable.add(observer1);
    observable.add(observer2);
    observable.removeAll();
    observable.fire('D');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);
  });
});
