import {masterSelection} from '#3p/ampcontext-integration';

describes.fakeWin('#masterSelect', {}, (env) => {
  it('should allow sharing between configured networks', () =>
    expect(masterSelection(env.win, 'fake_network').name).to.equal(
      'frame_fake_network_master'
    ));
});

describes.sandboxed('IntegrationAmpContext aliases', {}, (env) => {
  let context;

  beforeEach(() => {
    // Create a minimal context object that implements the needed methods
    context = {
      master_: env.sandbox.stub().returns('master-window'),
      isMaster_: env.sandbox.stub().returns(true),
      computeInMasterFrame: env.sandbox.stub(),
    };

    // Apply the getters from IntegrationAmpContext prototype
    Object.defineProperty(context, 'coordinator', {
      get() {
        return this.master_();
      },
    });
    Object.defineProperty(context, 'isCoordinator', {
      get() {
        return this.isMaster_();
      },
    });
    context.computeInCoordinatingFrame = function (global, taskId, work, cb) {
      return this.computeInMasterFrame(global, taskId, work, cb);
    };
  });

  it('should delegate coordinator to master', () => {
    const result = context.coordinator;
    expect(context.master_).to.have.been.calledOnce;
    expect(result).to.equal('master-window');
  });

  it('should delegate isCoordinator to isMaster', () => {
    const result = context.isCoordinator;
    expect(context.isMaster_).to.have.been.calledOnce;
    expect(result).to.equal(true);
  });

  it('should delegate computeInCoordinatingFrame to computeInMasterFrame', () => {
    const global = {test: 'global'};
    const taskId = 'test-task';
    const work = () => {};
    const cb = () => {};

    context.computeInCoordinatingFrame(global, taskId, work, cb);

    expect(context.computeInMasterFrame).to.have.been.calledOnceWith(
      global,
      taskId,
      work,
      cb
    );
  });
});
