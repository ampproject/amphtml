import {InaboxHost} from '#ads/inabox/inabox-host';
import {InaboxMessagingHost} from '#ads/inabox/inabox-messaging-host';

describes.fakeWin('inabox-host', {}, (env) => {
  let processMessageSpy;
  beforeEach(() => {
    processMessageSpy = env.sandbox.spy(
      InaboxMessagingHost.prototype,
      'processMessage'
    );
  });

  it('should process queue', () => {
    const messages = [
      {source: {postMessage: () => {}}},
      {source: {postMessage: () => {}}},
      {source: {postMessage: () => {}}},
    ];
    const invalidMessages = [{}, {source: {}}];
    env.win['ampInaboxPendingMessages'] = invalidMessages.concat(messages);
    new InaboxHost(env.win);
    expect(processMessageSpy.callCount).to.equal(3);
    messages.forEach((e) => expect(processMessageSpy.withArgs(e)).to.be.called);
    invalidMessages.forEach(
      (e) => expect(processMessageSpy.withArgs(e)).to.not.be.called
    );
    // Calling push should have no effect
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
    env.win['ampInaboxPendingMessages'].push({});
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
  });

  it('should handle no queue', () => {
    new InaboxHost(env.win);
    expect(processMessageSpy).to.not.be.called;
  });

  it('should handle non-array queue', () => {
    env.win['ampInaboxPendingMessages'] = 1234;
    new InaboxHost(env.win);
    expect(processMessageSpy).to.not.be.called;
  });

  it('should handle duplicate executions', () => {
    // Does not throw.
    new InaboxHost(env.win);
    new InaboxHost(env.win);
    // Calling push should have no effect
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
    env.win['ampInaboxPendingMessages'].push({});
    expect(env.win['ampInaboxPendingMessages'].length).to.equal(0);
  });
});
