import {htmlFor} from '#core/dom/static-template';

import {macroTask} from '#testing/helpers';

import {
  ACTIVATION_TIMEOUT,
  UserActivationTracker,
} from '../../user-activation-tracker';

describes.realWin('UserActivationTracker', {}, (env) => {
  let win;
  let root;
  let tracker;
  let clock;

  beforeEach(() => {
    win = env.win;
    const doc = win.document;
    const html = htmlFor(doc);

    root = html` <root></root> `;
    doc.body.appendChild(root);

    tracker = new UserActivationTracker(root);
    clock = env.sandbox.useFakeTimers();
    clock.tick(1);
  });

  it('should start as inactive', () => {
    expect(tracker.hasBeenActive()).to.be.false;
    expect(tracker.isActive()).to.be.false;
    expect(tracker.getLastActivationTime()).to.equal(0);
  });

  it('should become active on a trusted event', () => {
    tracker.activated_({isTrusted: true});
    expect(tracker.hasBeenActive()).to.be.true;
    expect(tracker.isActive()).to.be.true;
    expect(tracker.getLastActivationTime()).to.equal(1);
  });

  it('should not become active on a non-trusted event', () => {
    tracker.activated_({isTrusted: false});
    expect(tracker.hasBeenActive()).to.be.false;
    expect(tracker.isActive()).to.be.false;
  });

  it('should reset active after timeout', () => {
    tracker.activated_({isTrusted: true});
    expect(tracker.hasBeenActive()).to.be.true;
    expect(tracker.isActive()).to.be.true;
    expect(tracker.getLastActivationTime()).to.equal(1);

    clock.tick(ACTIVATION_TIMEOUT + 1);
    expect(tracker.hasBeenActive()).to.be.true;
    expect(tracker.isActive()).to.be.false;
    expect(tracker.getLastActivationTime()).to.equal(1);

    tracker.activated_({isTrusted: true});
    expect(tracker.hasBeenActive()).to.be.true;
    expect(tracker.isActive()).to.be.true;
    expect(tracker.getLastActivationTime()).to.equal(ACTIVATION_TIMEOUT + 2);
  });

  describe('expandLongTask', () => {
    it('should expand when active', () => {
      const promise = Promise.resolve();

      tracker.activated_({isTrusted: true});
      tracker.expandLongTask(promise);
      expect(tracker.isActive()).to.be.true;
      expect(tracker.isInLongTask()).to.be.true;

      clock.tick(ACTIVATION_TIMEOUT + 1);
      expect(tracker.isActive()).to.be.true;

      clock.tick(ACTIVATION_TIMEOUT + 1);
      expect(tracker.isActive()).to.be.true;

      return promise
        .then(() => {
          // Skip microtask.
          return macroTask(win.setTimeout);
        })
        .then(() => {
          // The gesture window is expanded for an extra window.
          expect(tracker.isActive()).to.be.true;
          expect(tracker.isInLongTask()).to.be.false;

          clock.tick(ACTIVATION_TIMEOUT - 1);
          expect(tracker.isActive()).to.be.true;

          clock.tick(2);
          expect(tracker.isActive()).to.be.false;
        });
    });

    it('should NOT expand when not active', () => {
      tracker.expandLongTask(Promise.resolve());
      expect(tracker.isActive()).to.be.false;
    });

    it('should tolerate promise failures', () => {
      const promise = Promise.reject();

      tracker.activated_({isTrusted: true});
      tracker.expandLongTask(promise);
      expect(tracker.isActive()).to.be.true;

      clock.tick(ACTIVATION_TIMEOUT + 1);
      expect(tracker.isActive()).to.be.true;

      return promise
        .catch(() => {})
        .then(() => {
          // Skip microtask.
          return macroTask(win.setTimeout);
        })
        .then(() => {
          // The gesture window is expanded for an extra window.
          expect(tracker.isActive()).to.be.true;

          clock.tick(ACTIVATION_TIMEOUT - 1);
          expect(tracker.isActive()).to.be.true;

          clock.tick(2);
          expect(tracker.isActive()).to.be.false;
        });
    });
  });
});
