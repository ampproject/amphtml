import {IntegrationAmpContext, masterSelection} from '#3p/ampcontext-integration';

describes.fakeWin('#masterSelect', {}, (env) => {
  it('should allow sharing between configured networks', () =>
    expect(masterSelection(env.win, 'fake_network').name).to.equal(
      'frame_fake_network_master'
    ));
});

describes.sandboxed('IntegrationAmpContext aliases', {}, (env) => {
  let context;

  beforeEach(() => {
    context = Object.create(IntegrationAmpContext.prototype);
    context.master_ = env.sandbox.stub().returns('test-master-window');
    context.isMaster_ = env.sandbox.stub().returns(true);
    context.computeInMasterFrame = env.sandbox.stub();
  });

  it('should delegate coordinator to master', () => {
    const result = context.coordinator;
    
    expect(context.master_).to.have.been.calledOnce;
    expect(result).to.equal('test-master-window');
  });

  it('should delegate isCoordinator to isMaster', () => {
    const result = context.isCoordinator;
    
    expect(context.isMaster_).to.have.been.calledOnce;
    expect(result).to.equal(true);
  });

  it('should execute computeInCoordinatingFrame method', () => {
    const masterWindow = {__ampMasterTasks: {}};
    const global = {
      context: {
        master: masterWindow,
        isMaster: true,
      },
    };
    const taskId = 'test-task';
    let workCalled = false;
    const work = (done) => {
      workCalled = true;
      done('result');
    };
    let callbackResult;
    const cb = (result) => {
      callbackResult = result;
    };

    context.computeInCoordinatingFrame(global, taskId, work, cb);

    expect(workCalled).to.be.true;
    expect(callbackResult).to.equal('result');
  });
});
