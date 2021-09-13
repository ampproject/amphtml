import {VideoSessionManager} from '#service/video-session-manager';

describes.sandboxed('VideoSessionManager', {}, (env) => {
  let manager;

  beforeEach(() => {
    manager = new VideoSessionManager();
  });

  it('should trigger a listener when a session ends', () => {
    const sessionSpy = env.sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });

  it('should only begin a session once even after repeated calls', () => {
    const sessionSpy = env.sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.beginSession();
    manager.beginSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });

  it('should only end a session once even after repeated calls', () => {
    const sessionSpy = env.sandbox.spy();
    manager.onSessionEnd(sessionSpy);

    manager.beginSession();
    manager.beginSession();
    manager.endSession();
    manager.endSession();
    manager.endSession();
    expect(sessionSpy).to.be.calledOnce;
  });
});
