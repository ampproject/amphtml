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
import {InaboxResources} from '../../../src/inabox/inabox-resources';

describes.realWin('inabox-resources', {amp: true}, (env) => {
  let win;
  let resources;

  beforeEach(() => {
    win = env.win;
    win.IntersectionObserver = null;
    resources = new InaboxResources(env.ampdoc);
  });

  it('add & remove', async () => {
    const element1 = env.createAmpElement('amp-foo');
    const element2 = env.createAmpElement('amp-bar');
    const element3 = win.document.createElement('div');

    expect(resources.get()).to.have.length(0);
    resources.add(element1);
    expect(resources.get()).to.have.length(1);
    resources.add(element2);
    expect(resources.get()).to.have.length(2);

    const resource1 = resources.getResourceForElement(element1);
    const resource2 = resources.getResourceForElement(element2);
    expect(resource1.getId()).to.not.equal(resource2.getId());

    allowConsoleError(() => {
      expect(() => {
        resources.getResourceForElement(element3);
      }).to.throw(/Missing resource prop on/);
    });

    resources.remove(element1);
    expect(resources.get()).to.have.length(1);
    resources.remove(element1);
    expect(resources.get()).to.have.length(1);
    resources.remove(element3);
    expect(resources.get()).to.have.length(1);
    resources.remove(element2);
    expect(resources.get()).to.have.length(0);
  });

  it('upgraded', async () => {
    const schedulePassSpy = env.sandbox.stub(resources, 'schedulePass');
    const element1 = env.createAmpElement('amp-foo');
    resources.add(element1);
    const resource1 = resources.getResourceForElement(element1);
    const buildStub = env.sandbox.stub(resource1, 'build');
    let resolveBuild;
    buildStub.returns(
      new Promise((resolve) => {
        resolveBuild = resolve;
      })
    );
    resources.upgraded(element1);

    await env.ampdoc.whenReady();
    expect(buildStub).to.be.calledOnce;
    await new Promise(setTimeout);
    expect(schedulePassSpy).to.not.be.called;
    resolveBuild();
    await new Promise(setTimeout);
    expect(schedulePassSpy).to.be.calledOnce;
  });

  it('observes element intersections for those opted in', () => {
    const observe = env.sandbox.spy();
    win.IntersectionObserver = () => ({observe});

    const element = env.createAmpElement('amp-carousel');
    resources.add(element);

    expect(observe.withArgs(element)).to.have.been.calledOnce;
  });

  it('unobserves element intersections when removed', () => {
    const unobserve = env.sandbox.spy();
    win.IntersectionObserver = () => ({observe: () => {}, unobserve});

    const element = env.createAmpElement('amp-carousel');
    resources.add(element);
    resources.remove(element);

    expect(unobserve.withArgs(element)).to.have.been.calledOnce;
  });

  it('does not observe element intersections for those not opted in', () => {
    const observe = env.sandbox.spy();
    win.IntersectionObserver = () => ({observe});

    const element = env.createAmpElement('amp-foo');
    resources.add(element);

    expect(observe.withArgs(element)).to.not.have.been.called;
  });

  it('triggers viewportCallback on intersection for those opted in', () => {
    let definedCallback;
    win.IntersectionObserver = (callback, unusedOptions) => {
      definedCallback = callback;
      return {observe: () => {}};
    };

    const element1 = env.createAmpElement('amp-carousel');
    element1.viewportCallback = env.sandbox.spy();

    const element2 = env.createAmpElement('amp-carousel');
    element2.viewportCallback = env.sandbox.spy();

    const element3 = env.createAmpElement('amp-carousel');
    element3.viewportCallback = env.sandbox.spy();

    resources.add(element1);
    resources.add(element2);
    resources.add(element3);

    definedCallback([
      {target: element1, isIntersecting: true},
      {target: element2, isIntersecting: false},
      {target: element3, isIntersecting: false},
    ]);

    expect(element1.viewportCallback.withArgs(true)).to.have.been.calledOnce;
    expect(element2.viewportCallback.withArgs(false)).to.have.been.calledOnce;
    expect(element3.viewportCallback.withArgs(false)).to.have.been.calledOnce;
  });
});
