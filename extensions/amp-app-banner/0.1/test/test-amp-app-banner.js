import {Services} from '#service';

import {
  AbstractAppBanner,
  AmpAndroidAppBanner,
  AmpAppBanner,
  AmpIosAppBanner,
} from '../amp-app-banner';

describes.realWin(
  'amp-app-banner',
  {
    amp: {
      extensions: ['amp-app-banner'],
      canonicalUrl: 'https://example.com/amps.html',
    },
  },
  (env) => {
    let win, doc, ampdoc;
    let vsync;
    let platform;
    let isAndroid = false;
    let isIos = false;
    let isChrome = false;
    let isSafari = false;
    let isFirefox = false;
    let isEdge = false;
    let isEmbedded = false;
    let hasNavigateToCapability = true;

    const iosMeta = {
      content: 'app-id=828256236, app-argument=medium://p/cb7f223fad86',
    };
    const androidManifest = {
      href: 'https://example.com/manifest.json',
      content: {
        'prefer_related_applications': true,
        'related_applications': [
          {
            'platform': 'play',
            'id': 'com.medium.reader',
            'url': 'https://play.google.com/com.medium.reader',
          },
        ],
      },
    };

    function runTask(task, state) {
      if (task.measure) {
        task.measure(state);
      }
      if (task.mutate) {
        task.mutate(state);
      }
    }

    async function getAppBanner(config = {}) {
      if (config.iosMeta) {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'apple-itunes-app');
        meta.setAttribute('content', config.iosMeta.content);
        doc.head.appendChild(meta);
      }

      const manifestObj = config.originManifest || config.androidManifest;
      if (manifestObj) {
        const rel = config.originManifest ? 'origin-manifest' : 'manifest';
        const manifest = doc.createElement('link');
        manifest.setAttribute('rel', rel);
        manifest.setAttribute('href', manifestObj.href);
        doc.head.appendChild(manifest);
        env.sandbox
          .mock(Services.xhrFor(win))
          .expects('fetchJson')
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve(manifestObj.content);
              },
            })
          );
      }

      const banner = doc.createElement('amp-app-banner');
      banner.setAttribute('layout', 'nodisplay');
      if (!config.noOpenButton) {
        const openButton = doc.createElement('button');
        openButton.setAttribute('open-button', '');
        banner.appendChild(openButton);
      }

      banner.id = 'banner0';
      doc.body.appendChild(banner);
      await banner.buildInternal();
      await banner.layoutCallback();
      return banner;
    }

    async function testSetupAndShowBanner() {
      const banner = await getAppBanner({iosMeta, androidManifest});
      const impl = await banner.getImpl();
      await impl.isDismissed();

      expect(banner.parentElement).to.not.be.null;
      expect(banner).to.not.have.display('none');
      const bannerTop = banner.querySelector(
        'i-amphtml-app-banner-top-padding'
      );
      expect(bannerTop).to.exist;
      const dismissBtn = banner.querySelector('.amp-app-banner-dismiss-button');
      expect(dismissBtn).to.exist;
    }

    function testRemoveBanner(config = {iosMeta, androidManifest}) {
      return getAppBanner(config).then((banner) => {
        expect(banner.parentElement).to.be.null;
      });
    }

    function testButtonMissing() {
      return allowConsoleError(() => {
        return getAppBanner({
          iosMeta,
          androidManifest,
          noOpenButton: true,
        }).should.eventually.be.rejectedWith(
          /<button open-button> is required/
        );
      });
    }

    function testRemoveBannerIfDismissed() {
      env.sandbox
        .stub(AbstractAppBanner.prototype, 'isDismissed')
        .callsFake(() => {
          return Promise.resolve(true);
        });
      return testRemoveBanner();
    }

    function testSuiteIos() {
      it('should preconnect to app store', async () => {
        const banner = await getAppBanner({iosMeta});
        const preconnect = Services.preconnectFor(win);
        env.sandbox.stub(preconnect, 'url');

        const impl = await banner.getImpl();
        impl.preconnectCallback(true);
        expect(preconnect.url).to.be.calledOnce;
        expect(preconnect.url).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          'https://itunes.apple.com'
        );
      });

      it('should show banner and set up correctly', testSetupAndShowBanner);

      it('should throw if open button is missing', testButtonMissing);

      it(
        'should remove banner if already dismissed',
        testRemoveBannerIfDismissed
      );

      it('should remove banner if meta is not provided', () => {
        testRemoveBanner({iosMeta: null});
      });

      it('should parse meta content and setup hrefs', () => {
        env.sandbox.spy(AbstractAppBanner.prototype, 'setupOpenButton_');
        return getAppBanner({iosMeta}).then((el) => {
          expect(
            AbstractAppBanner.prototype.setupOpenButton_
          ).to.have.been.calledWith(
            el.querySelector('button[open-button]'),
            'medium://p/cb7f223fad86',
            'https://itunes.apple.com/us/app/id828256236'
          );
        });
      });

      it(
        'should parse meta content and setup hrefs if app-argument is ' +
          'not provided',
        () => {
          expectAsyncConsoleError(
            '[amp-app-banner] <meta name="apple-itunes-app">\'s content ' +
              'should contain app-argument to allow opening an already ' +
              'installed application on iOS.'
          );
          env.sandbox.spy(AbstractAppBanner.prototype, 'setupOpenButton_');
          return getAppBanner({
            iosMeta: {content: 'app-id=828256236'},
          }).then((el) => {
            expect(
              AbstractAppBanner.prototype.setupOpenButton_
            ).to.have.been.calledWith(
              el.querySelector('button[open-button]'),
              'https://itunes.apple.com/us/app/id828256236',
              'https://itunes.apple.com/us/app/id828256236'
            );
          });
        }
      );

      it('should parse meta content and validate app-argument url', () => {
        return allowConsoleError(() => {
          return getAppBanner({
            iosMeta: {
              content:
                'app-id=828256236, app-argument=javascript:alert("foo");',
            },
          }).should.eventually.be.rejectedWith(
            /The url in app-argument has invalid protocol/
          );
        });
      });
    }

    function testSuiteAndroid() {
      it('should preconnect to play store and preload manifest', async () => {
        const banner = await getAppBanner({androidManifest});
        const preconnect = Services.preconnectFor(win);
        env.sandbox.stub(preconnect, 'url');
        env.sandbox.stub(preconnect, 'preload');

        const impl = await banner.getImpl();
        impl.preconnectCallback(true);
        expect(preconnect.url).to.have.been.calledOnce;
        expect(preconnect.url).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          'https://play.google.com'
        );

        expect(preconnect.preload).to.be.calledOnce;
        expect(preconnect.preload).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          'https://example.com/manifest.json'
        );
      });

      it('should preconnect to play store and preload origin-manifest', async () => {
        const banner = await getAppBanner({originManifest: androidManifest});
        const preconnect = Services.preconnectFor(win);
        env.sandbox.stub(preconnect, 'url');
        env.sandbox.stub(preconnect, 'preload');

        const impl = await banner.getImpl();
        impl.preconnectCallback(true);
        expect(preconnect.url).to.have.been.calledOnce;
        expect(preconnect.url).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          'https://play.google.com'
        );
        expect(preconnect.preload).to.be.calledOnce;
        expect(preconnect.preload).to.have.been.calledWith(
          env.sandbox.match.object, // AmpDoc
          'https://example.com/manifest.json'
        );
      });

      it('should show banner and set up correctly', testSetupAndShowBanner);

      it('should throw if open button is missing', testButtonMissing);

      it(
        'should remove banner if already dismissed',
        testRemoveBannerIfDismissed
      );

      it('should remove banner if manifest is not provided', () => {
        testRemoveBanner({androidManifest: null, originManifest: null});
      });

      it('should parse manifest and set hrefs', () => {
        env.sandbox.spy(AbstractAppBanner.prototype, 'setupOpenButton_');
        return getAppBanner({androidManifest}).then((el) => {
          expect(
            AbstractAppBanner.prototype.setupOpenButton_
          ).to.have.been.calledWith(
            el.querySelector('button[open-button]'),
            'android-app://com.medium.reader/https/example.com/amps.html',
            'https://play.google.com/store/apps/details?id=com.medium.reader'
          );
        });
      });

      it('should parse origin manifest and set hrefs', () => {
        env.sandbox.spy(AbstractAppBanner.prototype, 'setupOpenButton_');
        return getAppBanner({originManifest: androidManifest}).then((el) => {
          expect(
            AbstractAppBanner.prototype.setupOpenButton_
          ).to.have.been.calledWith(
            el.querySelector('button[open-button]'),
            'android-app://com.medium.reader/https/example.com/amps.html',
            'https://play.google.com/store/apps/details?id=com.medium.reader'
          );
        });
      });
    }

    beforeEach(() => {
      isAndroid = false;
      isIos = false;
      isChrome = false;
      isSafari = false;
      isFirefox = false;
      isEdge = false;
      isEmbedded = false;
      hasNavigateToCapability = true;

      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      const viewer = Services.viewerForDoc(ampdoc);
      env.sandbox.stub(viewer, 'isEmbedded').callsFake(() => isEmbedded);
      env.sandbox
        .stub(viewer, 'hasCapability')
        .callsFake(() => hasNavigateToCapability);
      platform = Services.platformFor(win);
      env.sandbox.stub(platform, 'isIos').callsFake(() => isIos);
      env.sandbox.stub(platform, 'isAndroid').callsFake(() => isAndroid);
      env.sandbox.stub(platform, 'isChrome').callsFake(() => isChrome);
      env.sandbox.stub(platform, 'isSafari').callsFake(() => isSafari);
      env.sandbox.stub(platform, 'isFirefox').callsFake(() => isFirefox);
      env.sandbox.stub(platform, 'isEdge').callsFake(() => isEdge);

      vsync = Services.vsyncFor(win);
      env.sandbox.stub(vsync, 'runPromise').callsFake((task, state) => {
        runTask(task, state);
        return Promise.resolve();
      });
      env.sandbox.stub(vsync, 'run').callsFake(runTask);
    });

    describe('Choosing platform', () => {
      it('should upgrade to AmpIosAppBanner on iOS', async () => {
        isIos = true;
        const banner = await getAppBanner({iosMeta, androidManifest});
        const impl = await banner.getImpl();
        expect(impl).to.be.instanceof(AmpIosAppBanner);
      });

      it('should upgrade to AmpAndroidAppBanner on Android', async () => {
        isAndroid = true;
        const banner = await getAppBanner({iosMeta, androidManifest});
        const impl = await banner.getImpl();
        expect(impl).to.be.instanceof(AmpAndroidAppBanner);
      });

      it('should not upgrade if platform not supported', async () => {
        isEdge = true;
        const banner = await getAppBanner({iosMeta, androidManifest});
        const impl = await banner.getImpl();
        expect(impl).to.be.instanceof(AmpAppBanner);
        expect(impl.upgradeCallback()).to.be.null;
      });
    });

    describe('non-supported platform', () => {
      it('should remove the banner', () => {
        return getAppBanner().then((banner) => {
          expect(banner.parentElement).to.be.null;
        });
      });
    });

    describe('iOS', () => {
      beforeEach(() => {
        isIos = true;
      });

      describe('Embedded', () => {
        beforeEach(() => {
          isEmbedded = true;
        });

        describe('Safari', () => {
          beforeEach(() => {
            isSafari = true;
          });

          testSuiteIos();

          it(
            'should hide banner if embedded but viewer does not support ' +
              'navigateTo',
            () => {
              hasNavigateToCapability = false;
              testRemoveBanner();
            }
          );
        });

        describe('Chrome', () => {
          beforeEach(() => {
            isChrome = true;
          });

          testSuiteIos();

          it(
            'should hide banner if embedded but viewer does not support ' +
              'navigateTo',
            () => {
              hasNavigateToCapability = false;
              testRemoveBanner();
            }
          );
        });

        describe('Firefox', () => {
          beforeEach(() => {
            isFirefox = true;
          });

          testSuiteIos();

          it(
            'should hide banner if embedded but viewer does not support ' +
              'navigateTo',
            () => {
              hasNavigateToCapability = false;
              testRemoveBanner();
            }
          );
        });
      });

      describe('Non-embedded', () => {
        beforeEach(() => {
          isEmbedded = false;
        });

        describe('Safari', () => {
          beforeEach(() => {
            isSafari = true;
          });

          // TODO(#18655): Fails with "Cannot read property 'getItem' of null'"
          it.skip('should NOT show banner', testRemoveBanner);
        });

        describe('Chrome', () => {
          beforeEach(() => {
            isChrome = true;
          });

          testSuiteIos();
        });

        describe('Firefox', () => {
          beforeEach(() => {
            isFirefox = true;
          });

          testSuiteIos();
        });
      });
    });

    describe('Android', () => {
      beforeEach(() => {
        isAndroid = true;
      });

      describe('Embedded', () => {
        beforeEach(() => {
          isEmbedded = true;
        });

        describe('Chrome', () => {
          beforeEach(() => {
            isChrome = true;
          });

          testSuiteAndroid();

          it(
            'should hide banner if embedded but viewer does not support ' +
              'navigateTo',
            () => {
              hasNavigateToCapability = false;
              testRemoveBanner();
            }
          );
        });

        describe('Firefox', () => {
          beforeEach(() => {
            isFirefox = true;
          });

          testSuiteAndroid();

          it(
            'should hide banner if embedded but viewer does not support ' +
              'navigateTo',
            () => {
              hasNavigateToCapability = false;
              testRemoveBanner();
            }
          );
        });
      });

      describe('Non-embedded', () => {
        beforeEach(() => {
          isEmbedded = false;
        });

        describe('Chrome', () => {
          beforeEach(() => {
            isChrome = true;
          });

          // TODO(#18655): Fails with "Cannot read property 'getItem' of null'"
          it.skip('should NOT show banner', testRemoveBanner);
        });

        describe('Firefox', () => {
          beforeEach(() => {
            isFirefox = true;
          });

          testSuiteAndroid();
        });
      });
    });

    describe('Windows Edge', () => {
      beforeEach(() => {
        isEdge = true;
      });

      it('Embedded should NOT show banner', () => {
        isEmbedded = true;
        testRemoveBanner();
      });

      it('Non-embedded should NOT show banner', () => {
        isEmbedded = false;
        testRemoveBanner();
      });
    });

    describe('Abstract App Banner', () => {
      it('should setup click listener', () => {
        const element = doc.createElement('div');
        doc.body.appendChild(element);
        const openButton = doc.createElement('button');
        element.appendChild(openButton);
        openButton.setAttribute('open-button', '');
        openButton.addEventListener = env.sandbox.spy();
        const banner = new AbstractAppBanner(element);
        banner.setupOpenButton_(openButton, 'open-button', 'install-link');
        expect(openButton.addEventListener).to.have.been.calledWith('click');
      });

      it('should create dismiss button and setup click listener', () => {
        const element = doc.createElement('div');
        element.id = 'banner1';
        element.getAmpDoc = () => ampdoc;
        doc.body.appendChild(element);
        const banner = new AbstractAppBanner(element);
        banner.addDismissButton_();

        const bannerTop = element.querySelector(
          'i-amphtml-app-banner-top-padding'
        );
        expect(bannerTop).to.exist;
        const dismissBtn = element.querySelector(
          '.amp-app-banner-dismiss-button'
        );
        expect(dismissBtn).to.not.be.null;
        expect(dismissBtn.parentElement).to.be.equal(element);
        dismissBtn.dispatchEvent(new Event('click'));
        return banner.isDismissed().then((value) => {
          expect(element.parentElement).to.be.null;
          expect(value).to.be.true;
        });
      });
    });
  }
);
