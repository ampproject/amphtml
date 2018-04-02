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

import * as sinon from 'sinon';
import {LazyObservable, Observable} from '../../src/observable';

describe('Observable', () => {

  let sandbox;
  let observable;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
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


describe('LazyObservable', () => {

  let sandbox;
  let observable;
  let installSpy;
  let uninstallSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    uninstallSpy = sandbox.spy();
    installSpy = sandbox.stub().returns(uninstallSpy);
    observable = new LazyObservable(installSpy);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not install with no observers', () => {
    observable.fire();
    expect(installSpy).to.not.have.been.called;
  });

  it('should install on first observer', () => {
    const triggerSpy = sandbox.spy();

    observable.add(triggerSpy);
    observable.add(triggerSpy);
    observable.add(triggerSpy);

    expect(installSpy).to.have.been.called(1);

    observable.fire(1);

    // once for every handler
    expect(triggerSpy.withArgs(1)).to.have.been.called(3).times;
  });

  it('should uninstall when removing last element', () => {
    const noop1 = () => {};
    const noop2 = () => {};
    const noop3 = () => {};

    observable.add(noop1);
    observable.add(noop2);
    observable.add(noop3);

    expect(installSpy).to.have.been.called(1).times;

    observable.remove(noop1);

    expect(uninstallSpy).to.not.have.been.called;

    observable.remove(noop2);

    expect(uninstallSpy).to.not.have.been.called;

    observable.remove(noop3);

    expect(uninstallSpy).to.have.been.called(1).times;
  });

  it('should uninstall when removing last element', () => {
    const noop1 = () => {};
    const noop2 = () => {};
    const noop3 = () => {};

    observable.add(noop1);
    observable.add(noop2);
    observable.add(noop3);

    expect(installSpy).to.have.been.called(1).times;

    observable.removeAll();

    expect(uninstallSpy).to.have.been.called(1).times;
  });
});
