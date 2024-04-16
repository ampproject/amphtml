import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
  poll,
} from '#testing/iframe';

/** @const {number} */
const TIMEOUT = window.ampTestRuntimeConfig.mochaTimeout;

const t = describe
  .configure()
  // TODO(@cramforce): Find out why it does not work with obfuscated props.
  .skipIfPropertiesObfuscated();

t.run('error page', function () {
  this.timeout(TIMEOUT);

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/errors.html', 1000, (win) => {
      // Trigger dev mode.
      try {
        win.history.pushState({}, '', 'test2.html#development=1');
      } catch (e) {
        // Some browsers do not allow this.
        win.AMP_DEV_MODE = true;
      }
    }).then((f) => {
      fixture = f;
      return poll(
        'errors to happen',
        () => {
          return fixture.doc.querySelectorAll('[error-message]').length >= 2;
        },
        () => {
          return new Error(
            'Failed to find errors. HTML\n' +
              fixture.doc.documentElement./*TEST*/ innerHTML
          );
        },
        TIMEOUT - 1000
      );
    });
  });

  it('should show the body in error test', () => {
    return expectBodyToBecomeVisible(fixture.win, TIMEOUT);
  });

  function shouldFail(id) {
    // Skip for issue #110
    it.configure()
      .ifChrome()
      .run('should fail to load #' + id, () => {
        const e = fixture.doc.getElementById(id);
        expect(fixture.errors.join('\n')).to.contain(
          e.getAttribute('data-expectederror')
        );
        expect(e.getAttribute('error-message')).to.contain(
          e.getAttribute('data-expectederror')
        );
        expect(e.className).to.contain('i-amphtml-element-error');
      });
  }

  // Add cases to fixtures/errors.html and add them here.
  shouldFail('yt0');
  shouldFail('iframe0');
});
