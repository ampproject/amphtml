import {Deferred} from '#core/data-structures/promise';

import {toggleExperiment} from '#experiments';

import {InaboxResources} from '#inabox/inabox-resources';

import {ResourceState_Enum} from '#service/resource';

import {macroTask, sleep} from '#testing/helpers';

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
    await macroTask();
    schedulePassSpy.resetHistory();
    resolveBuild();
    await macroTask();
    expect(schedulePassSpy).to.be.calledOnce;
  });

  it('upgraded: should handle when build() returns undefined', async () => {
    const schedulePassSpy = env.sandbox.stub(resources, 'schedulePass');
    const element1 = env.createAmpElement('amp-foo');
    resources.add(element1);
    const resource1 = resources.getResourceForElement(element1);
    const buildStub = env.sandbox.stub(resource1, 'build');
    buildStub.returns(undefined);
    resources.upgraded(element1);

    await env.ampdoc.whenReady();
    await macroTask();

    expect(buildStub).to.be.calledOnce;
    expect(schedulePassSpy).to.be.calledTwice;
  });

  it('eagerly builds amp elements', async () => {
    toggleExperiment(win, 'inabox-resources-eager', true);
    const readySignal = new Deferred();
    env.sandbox.stub(env.ampdoc, 'whenReady').returns(readySignal.promise);
    resources = new InaboxResources(env.ampdoc);

    const element1 = env.createAmpElement('amp-one');
    resources.add(element1);
    const resource1 = resources.getResourceForElement(element1);
    const build1 = env.sandbox.stub(resource1, 'build').resolves();
    win.document.body.appendChild(element1);

    resources.upgraded(element1);
    expect(build1).not.to.be.called;

    const element2 = env.createAmpElement('amp-two');
    resources.add(element2);
    const resource2 = resources.getResourceForElement(element2);
    const build2 = env.sandbox.stub(resource2, 'build').resolves();
    win.document.body.appendChild(element2);

    resources.upgraded(element2);
    expect(build1).to.be.called;
    expect(build2).not.to.be.called;

    readySignal.resolve();
    await macroTask();
    expect(build2).to.be.called;
  });

  it('should pause and resume resources on doc visibility', () => {
    const element1 = env.createAmpElement('amp-foo');
    const element2 = env.createAmpElement('amp-bar');
    resources.add(element1);
    resources.add(element2);

    env.sandbox.stub(element1, 'pause');
    env.sandbox.stub(element1, 'resume');
    env.sandbox.stub(element2, 'pause');
    env.sandbox.stub(element2, 'resume');

    env.ampdoc.overrideVisibilityState('paused');
    expect(element1.pause).to.be.calledOnce;
    expect(element2.pause).to.be.calledOnce;

    env.ampdoc.overrideVisibilityState('visible');
    expect(element1.resume).to.be.calledOnce;
    expect(element2.resume).to.be.calledOnce;
  });

  it('should unload all resources on dispose', async () => {
    const element1 = env.createAmpElement('amp-foo');
    const element2 = env.createAmpElement('amp-bar');
    resources.add(element1);
    resources.add(element2);

    const resource1 = resources.get()[0];
    const resource2 = resources.get()[1];
    env.sandbox.stub(resource1, 'unload');
    env.sandbox.stub(resource2, 'unload');

    resources.dispose();
    expect(resource1.unload).to.be.calledOnce;
    expect(resource2.unload).to.be.calledOnce;
  });

  it('should ignore R1 resources for layout pass', async () => {
    const element1 = env.createAmpElement('amp-foo');
    const element2 = env.createAmpElement('amp-bar');
    env.sandbox.stub(element2, 'R1').returns(true);

    win.document.body.appendChild(element1);
    win.document.body.appendChild(element2);
    resources.add(element1);
    resources.add(element2);

    const resource1 = resources.get()[0];
    const resource2 = resources.get()[1];
    env.sandbox.stub(resource1, 'measure');
    env.sandbox.stub(resource2, 'measure');
    env.sandbox.stub(resource1, 'startLayout');
    env.sandbox.stub(resource2, 'startLayout');

    env.sandbox.stub(resource1, 'build').resolves();
    env.sandbox.stub(resource2, 'build').resolves();
    env.sandbox
      .stub(resource1, 'getState')
      .returns(ResourceState_Enum.READY_FOR_LAYOUT);
    env.sandbox
      .stub(resource2, 'getState')
      .returns(ResourceState_Enum.READY_FOR_LAYOUT);
    env.sandbox.stub(resource1, 'isDisplayed').returns(true);
    env.sandbox.stub(resource2, 'isDisplayed').returns(true);
    resources.upgraded(element1);

    resources.schedulePass(0);
    await sleep(10);

    expect(resource1.measure).to.be.called;
    expect(resource2.measure).to.not.be.called;

    expect(resource1.startLayout).to.be.called;
    expect(resource2.startLayout).to.not.be.called;
  });
});
