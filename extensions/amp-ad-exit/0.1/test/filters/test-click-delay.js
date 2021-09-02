import {ClickDelayFilter} from '../../filters/click-delay';
import {FilterType} from '../../filters/filter';

describes.sandboxed('click-delay', {}, (env) => {
  const DEFAULT_CONFIG = {
    type: FilterType.CLICK_DELAY,
    delay: 123,
    startTimingEvent: 'navigationStart',
  };

  it('should use performance timing', () => {
    const win = {performance: {timing: {'navigationStart': 456}}};
    env.sandbox.stub(Date, 'now').returns(123);
    expect(
      new ClickDelayFilter('foo', DEFAULT_CONFIG, win).intervalStart
    ).to.equal(456);
  });

  describe('spec validation', () => {
    const invalid = 'Invalid ClickDelay spec';
    const win = {performance: {timing: {'navigationStart': 456}}};
    const tests = [
      {config: {type: 'bar', delay: 123}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 0}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: -1}, win, err: invalid},
      {config: {type: FilterType.CLICK_DELAY, delay: 'ac'}, win, err: invalid},
      {config: DEFAULT_CONFIG, win: {}},
      {config: DEFAULT_CONFIG, win: {performance: {}}},
      {config: DEFAULT_CONFIG, win: {performance: {timing: {}}}},
    ];
    tests.forEach((test) => {
      it(
        `should properly handle ${JSON.stringify(test.config)} and win ` +
          `${JSON.stringify(test.win)}`,
        () => {
          if (test.err) {
            allowConsoleError(() =>
              expect(
                () => new ClickDelayFilter('foo', test.config, test.win)
              ).to.throw(win.err)
            );
          } else {
            env.sandbox.stub(Date, 'now').returns(123);
            expect(
              new ClickDelayFilter('foo', test.config, test.win).intervalStart
            ).to.equal(123);
          }
        }
      );
    });
  });

  describe('#filter', () => {
    it('should filter based on timing event', () => {
      const filter = new ClickDelayFilter('foo', DEFAULT_CONFIG, {
        performance: {timing: {navigationStart: 1}},
      });
      const nowStub = env.sandbox.stub(Date, 'now');
      nowStub.onFirstCall().returns(1001);
      expect(filter.filter()).to.be.true;
    });

    it('should filter based on timing event, second call', () => {
      const filter = new ClickDelayFilter('foo', DEFAULT_CONFIG, {
        performance: {timing: {navigationStart: 1}},
      });
      const nowStub = env.sandbox.stub(Date, 'now');
      nowStub.onFirstCall().returns(1);
      nowStub.onSecondCall().returns(125);
      expect(filter.filter()).to.be.false;
      expect(filter.filter()).to.be.true;
    });
  });
});
