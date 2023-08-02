import {fontStylesheetTimeout} from '../../src/font-stylesheet-timeout';

describes.realWin(
  'font-stylesheet-timeout',
  {
    amp: true,
  },
  (env) => {
    describe('font-stylesheet-timeout', () => {
      let clock;
      let win;
      let readyState;
      let navigationStart;

      const defaultTimeout =
        /* target */ 2500 -
        /* max paint time */ 400 -
        /* default nav start*/ 1500;

      beforeEach(() => {
        clock = env.sandbox.useFakeTimers();
        win = env.win;
        win.setTimeout = self.setTimeout;
        readyState = 'interactive';
        navigationStart = undefined;
        env.sandbox.defineProperty(win.document, 'readyState', {
          get() {
            return readyState;
          },
        });
        env.sandbox.defineProperty(win.performance.timing, 'navigationStart', {
          get() {
            return navigationStart;
          },
        });
      });

      function addLink(opt_content, opt_href) {
        const link = document.createElement('link');
        link.href = opt_href || immediatelyLoadingHref(opt_content);
        link.setAttribute('rel', 'stylesHEet');
        win.document.head.appendChild(link);
        return link;
      }

      function immediatelyLoadingHref(opt_content) {
        return 'data:text/css;charset=utf-8,' + (opt_content || '');
      }

      it.configure()
        .skipFirefox()
        .run('should not time out for immediately loading style sheets', () => {
          const link = addLink();
          fontStylesheetTimeout(win);
          clock.tick(10000);
          expect(
            win.document.querySelectorAll('link[rel="stylesheet"]')
          ).to.have.length(1);
          expect(win.document.querySelector('link[rel="stylesheet"]')).to.equal(
            link
          );
          expect(
            win.document.querySelectorAll(
              'link[rel="stylesheet"][i-amphtml-timeout]'
            )
          ).to.have.length(0);
        });

      it('should time out if style sheets do not load', () => {
        const link = addLink(undefined, '/does-not-exist.css');
        fontStylesheetTimeout(win);
        clock.tick(defaultTimeout - 1);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(0);
        clock.tick(1);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(1);
        const after = win.document.querySelector('link[rel="stylesheet"]');
        expect(after).to.equal(link);
        expect(after.href).to.equal(link.href);
        expect(after.media).to.equal('print');
        after.href = immediatelyLoadingHref('/* make-it-load */');
        return new Promise((resolve) => {
          after.addEventListener('load', () => {
            resolve();
          });
        }).then(() => {
          expect(after.media).to.equal('all');
        });
      });

      it('should time out from response start', () => {
        const startTime = 100000;
        clock.tick(startTime);
        navigationStart = startTime;
        clock.tick(250);
        const link = addLink(undefined, '/does-not-exist.css');
        fontStylesheetTimeout(win);
        clock.tick(2500 - 400 - 250 - 1);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(0);
        clock.tick(1);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(1);
        expect(win.document.querySelector('link[rel="stylesheet"]')).to.equal(
          link
        );
        expect(
          win.document.querySelector('link[rel="stylesheet"]').href
        ).to.equal(link.href);
      });

      it('should time out multiple style sheets and ignore CDN URLs', () => {
        navigationStart = 500;
        clock.tick(10000);
        const link0 = addLink(undefined, '/does-not-exist.css');
        const link1 = addLink(undefined, '/does-not-exist.css');
        const cdnLink = addLink(
          undefined,
          'https://cdn.ampproject.org/does-not-exist.css'
        );
        fontStylesheetTimeout(win);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(0);
        clock.tick(1);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )
        ).to.have.length(2);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )[0]
        ).to.equal(link0);
        expect(
          win.document.querySelectorAll(
            'link[rel="stylesheet"][i-amphtml-timeout]'
          )[1]
        ).to.equal(link1);
        expect(
          win.document.querySelectorAll('link[rel="stylesheet"]')[2]
        ).to.equal(cdnLink);
      });

      describe('font-display: swap', () => {
        let fonts;
        beforeEach(() => {
          fonts = [
            {
              status: 'loaded',
              display: 'auto',
            },
            {
              status: 'loading',
              display: 'auto',
            },
            {
              status: 'loading',
              display: 'auto',
            },
            {
              status: 'loading',
              display: 'optional',
            },
            null,
          ];
          let index = 0;
          env.sandbox.defineProperty(win.document, 'fonts', {
            get: () => {
              return {
                values: () => {
                  return {
                    next: () => {
                      return {value: fonts[index++]};
                    },
                  };
                },
              };
            },
          });
        });

        it('should not change loaded fonts', () => {
          fontStylesheetTimeout(win);
          clock.tick(250);
          expect(fonts[0].display).to.equal('auto');
        });

        it('should change loading fonts to swap', () => {
          fontStylesheetTimeout(win);
          expect(fonts[1].display).to.equal('auto');
          expect(fonts[2].display).to.equal('auto');
          clock.tick(defaultTimeout);
          expect(fonts[1].display).to.equal('swap');
          expect(fonts[2].display).to.equal('swap');
        });

        it('should not override non-default values', () => {
          fontStylesheetTimeout(win);
          clock.tick(defaultTimeout);
          expect(fonts[3].display).to.equal('optional');
        });
      });
    });
  }
);
