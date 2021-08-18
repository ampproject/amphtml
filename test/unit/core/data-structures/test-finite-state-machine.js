import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';

describes.sandboxed('data structures - Finite State Machine', {}, (env) => {
  let fsm;
  let spy;
  let other;

  beforeEach(() => {
    fsm = new FiniteStateMachine('init');
    spy = env.sandbox.spy();
    other = env.sandbox.spy();

    fsm.addTransition('init', 'start', spy);
    fsm.addTransition('init', 'other', other);
  });

  it('invokes callbacks on transition', () => {
    fsm.setState('start');

    expect(spy).to.have.been.called;
  });

  it('ignores other transition callbacks', () => {
    fsm.setState('other');

    expect(spy).not.to.have.been.called;
    expect(other).to.have.been.called;
  });

  it('handles unregistered transitions', () => {
    fsm.setState('unknown');

    expect(spy).not.to.have.been.called;
    expect(other).not.to.have.been.called;
  });
});
