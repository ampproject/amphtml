import {
  exponentialBackoff,
  exponentialBackoffClock,
} from '#core/types/function/exponential-backoff';

describes.integration(
  'type helpers - functions - exponentialBackoff',
  {},
  (env) => {
    let clock;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      env.sandbox.stub(Math, 'random').callsFake(() => 1);
    });

    it('should backoff exponentially', () => {
      let count = 0;
      const backoff = exponentialBackoff();
      const backoff2 = exponentialBackoff();
      const increment = () => {
        count++;
      };

      backoff(increment);
      expect(count).to.equal(0);
      clock.tick(600);
      expect(count).to.equal(0);
      // Account for jitter
      clock.tick(701);
      expect(count).to.equal(1);

      // Round 2
      backoff(increment);
      expect(count).to.equal(1);
      clock.tick(1200);
      expect(count).to.equal(1);
      clock.tick(1800);
      expect(count).to.equal(2);

      // Round 3
      backoff(increment);
      expect(count).to.equal(2);
      clock.tick(2200);
      expect(count).to.equal(2);
      clock.tick(3200);
      expect(count).to.equal(3);

      // 2nd independent backoff
      backoff2(increment);
      expect(count).to.equal(3);
      clock.tick(600);
      expect(count).to.equal(3);
      clock.tick(701);
      expect(count).to.equal(4);
    });

    it('should exponentiate correctly', () => {
      const backoff = exponentialBackoffClock();
      const backoff2 = exponentialBackoffClock();

      // base of 2 = 1000 - 300 (30% jitter) = 700
      expect(backoff()).to.equal(700);
      expect(backoff()).to.equal(1400);
      // tick backoff2
      expect(backoff2()).to.equal(700);
      // back to backoff
      expect(backoff()).to.equal(2800);
      expect(backoff()).to.equal(5600);
      expect(backoff()).to.equal(11200);
      expect(backoff()).to.equal(22400);

      expect(backoff2()).to.equal(1400);
      expect(backoff2()).to.equal(2800);
    });
  }
);
