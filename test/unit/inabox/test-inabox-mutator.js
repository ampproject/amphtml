/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {InaboxMutator} from '../../../src/inabox/inabox-mutator';
import {Services} from '../../../src/services';

describes.realWin('inabox-mutator', {amp: true}, (env) => {
  let mutator;
  let resource;
  let element;
  let schedulePassStub;

  beforeEach(() => {
    element = env.win.document.createElement('div');

    const resources = Services.resourcesForDoc(env.ampdoc);
    env.sandbox.stub(resources, 'getResourceForElement').callsFake((el) => {
      expect(el).to.equal(element);
      return resource;
    });
    schedulePassStub = env.sandbox.stub(resources, 'schedulePass');

    mutator = new InaboxMutator(env.ampdoc, resources);

    resource = {
      changeSize: env.sandbox.spy(),
      completeExpand: env.sandbox.spy(),
      completeCollapse: env.sandbox.spy(),
      getOwner: () => null,
    };
  });

  it('forceChangeSize', async () => {
    const callback = env.sandbox.spy();
    mutator.forceChangeSize(element, 12, 34, callback, {
      top: 4,
      right: 5,
      bottom: 6,
      left: 7,
    });
    env.flushVsync();
    await Promise.resolve();
    expect(resource.changeSize).to.be.calledWith(12, 34, {
      top: 4,
      right: 5,
      bottom: 6,
      left: 7,
    });
    expect(callback).to.be.calledOnce;
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('requestChangeSize', async () => {
    const resultPromise = mutator.requestChangeSize(element, 12, 34, {
      top: 4,
      right: 5,
      bottom: 6,
      left: 7,
    });
    env.flushVsync();

    await resultPromise;
    expect(resource.changeSize).to.be.calledWith(12, 34, {
      top: 4,
      right: 5,
      bottom: 6,
      left: 7,
    });
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('expandElement', async () => {
    mutator.expandElement(element);
    expect(resource.completeExpand).to.be.calledOnce;
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('attemptCollapse', async () => {
    const resultPromise = mutator.attemptCollapse(element);
    env.flushVsync();

    await resultPromise;
    expect(resource.completeCollapse).to.be.calledOnce;
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('collapseElement', async () => {
    mutator.collapseElement(element);
    expect(resource.completeCollapse).to.be.calledOnce;
    expect(schedulePassStub).to.be.calledOnce;
  });

  it('measureElement', async () => {
    const measurerSpy = env.sandbox.spy();
    const resultPromise = mutator.measureElement(measurerSpy);
    env.flushVsync();

    await resultPromise;
    expect(measurerSpy).to.be.calledOnce;
  });

  it('mutateElement', async () => {
    const mutatorSpy = env.sandbox.spy();
    const resultPromise = mutator.mutateElement(element, mutatorSpy);
    env.flushVsync();

    await resultPromise;
    expect(mutatorSpy).to.be.calledOnce;
  });

  it('measureMutateElement', async () => {
    const measurerSpy = env.sandbox.spy();
    const mutatorSpy = env.sandbox.spy();
    const resultPromise = mutator.measureMutateElement(
      element,
      measurerSpy,
      mutatorSpy
    );
    env.flushVsync();

    await resultPromise;
    expect(measurerSpy).to.be.calledOnce;
    expect(mutatorSpy).to.be.calledOnce;
  });
});
