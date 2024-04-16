import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  pollForLayout,
} from '#testing/iframe';

describes.sandboxed('released components: ', {}, function () {
  runTest.call(this, false);
});

function runTest() {
  describe('Rendering of released components', function () {
    this.timeout(5000);
    let fixture;
    beforeEach(async () => {
      this.timeout(3100);
      fixture = await createFixtureIframe('test/fixtures/released.html', 3000);
    });

    it('all components should get loaded', function () {
      this.timeout(15000);
      return pollForLayout(fixture.win, 12, 10000)
        .then(() => {
          expect(
            fixture.doc.querySelectorAll('.i-amphtml-element')
          ).to.have.length(16);
          expect(
            fixture.doc.querySelectorAll('.i-amphtml-layout')
          ).to.have.length(12);
          expect(
            fixture.doc.querySelectorAll('.i-amphtml-error')
          ).to.have.length(0);
          checkGlobalScope(fixture.win);
        })
        .then(() => {
          return expectBodyToBecomeVisible(fixture.win);
        });
    });

    it('sanity for Firefox while we skip above', function () {
      this.timeout(15000);
      // Test this only in firefox.
      if (!navigator.userAgent.match(/Firefox/)) {
        return;
      }
      return pollForLayout(fixture.win, 11, 10000).then(() => {
        return expectBodyToBecomeVisible(fixture.win);
      });
    });
  });
}

function checkGlobalScope(win) {
  // Checks that we don't leak certain symbols to the global scope.
  // This could happen if we do not wrap all our code in a closure.
  const commonSymbols = [
    '$',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'x',
    'z',
    '_',
    'log',
  ];
  expect(win).to.not.include.keys(commonSymbols);
  expect(win).to.not.include.keys(
    commonSymbols.map((symbol) => {
      return symbol.toUpperCase();
    })
  );
}
