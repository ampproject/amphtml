import {layoutRectLtwh} from '#core/dom/layout/rect';

import {Services} from '#service';
import {installPlatformService} from '#service/platform-impl';

import {createCustomEvent} from '#utils/event-helper';

import {createFixtureIframe, poll} from '#testing/iframe';

const IFRAME_HEIGHT = 3000;
function createFixture() {
  return createFixtureIframe(
    'test/fixtures/3p-ad.html',
    IFRAME_HEIGHT,
    () => {}
  );
}

describes.sandboxed('amp-ad 3P', {}, () => {
  let fixture;

  beforeEach(() => {
    return createFixture().then((f) => {
      fixture = f;
      installPlatformService(fixture.win);
    });
  });

  it('create an iframe with APIs', async function () {
    this.timeout(20000);
    let iframe;
    let lastIO = null;
    const platform = Services.platformFor(fixture.win);
    return poll(
      'frame to be in DOM and context is available',
      () => {
        iframe = fixture.doc.querySelector('amp-ad > iframe');
        if (iframe) {
          return iframe.contentWindow.context;
        }
      },
      undefined,
      5000
    )
      .then((context) => {
        expect(context.canary).to.be.a('boolean');
        expect(context.canonicalUrl).to.equal(
          'https://www.example.com/doubleclick.html'
        );
        expect(context.clientId).to.match(/amp-[a-zA-Z0-9\-_.]{22,24}/);
        expect(context.container).to.equal('AMP-LIGHTBOX');
        expect(context.data).to.deep.equal({
          width: 300,
          height: 250,
          type: '_ping_',
          ampSlotIndex: '0',
          id: '0',
          url: 'https://example.com/a?b=c&d=e',
          valid: 'true',
          customValue: '123',
          'other_value': 'foo',
          htmlAccessAllowed: '',
        });

        // make sure the context.data is the same instance as the data param
        // passed into the vendor function. see #10628
        expect(context.data).to.equal(
          iframe.contentWindow.networkIntegrationDataParamForTesting
        );

        expect(context.domFingerprint).to.be.ok;
        expect(context.hidden).to.be.false;
        expect(context.initialLayoutRect).to.deep.equal({
          height: 250,
          left: 0,
          top: platform.isIos() ? 1001 : 1000, // the iOS 1px trick
          width: 300,
        });
        const {initialIntersection} = context;
        expect(initialIntersection.rootBounds).to.deep.equal(
          layoutRectLtwh(0, 0, 500, IFRAME_HEIGHT)
        );

        expect(initialIntersection.boundingClientRect).to.deep.equal(
          layoutRectLtwh(0, platform.isIos() ? 1001 : 1000, 300, 250)
        );
        expect(context.isMaster).to.exist;
        expect(context.computeInMasterFrame).to.exist;
        expect(context.location).to.deep.include({
          hash: '',
          host: 'localhost:9876',
          hostname: 'localhost',
          href: 'http://localhost:9876/context.html',
          origin: 'http://localhost:9876',
          pathname: '/context.html',
          port: '9876',
          protocol: 'http:',
          search: '',
        });
        expect(parseInt(context.pageViewId, 10)).to.be.greaterThan(0);
        // In some browsers the referrer is empty.
        if (context.referrer !== '') {
          expect(context.referrer).to.contain(
            'http://localhost:' + location.port
          );
        }
        expect(context.startTime).to.be.a('number');
        // Edge/IE has different opinion about window.location in srcdoc iframe.
        // Nevertheless this only happens in test. In real world AMP will not
        // in srcdoc iframe.
        expect(context.sourceUrl).to.equal(
          platform.isEdge()
            ? 'http://localhost:9876/context.html'
            : 'about:srcdoc'
        );

        expect(context.tagName).to.equal('AMP-AD');

        expect(context.addContextToIframe).to.be.a('function');
        expect(context.getHtml).to.be.a('function');
        expect(context.noContentAvailable).to.be.a('function');
        expect(context.renderStart).to.be.a('function');
        expect(context.reportRenderedEntityIdentifier).to.be.a('function');
        expect(context.requestResize).to.be.a('function');
        expect(context.report3pError).to.be.a('function');
        expect(context.computeInMasterFrame).to.be.a('function');
      })
      .then(() => {
        // test iframe will send out render-start to amp-ad
        return poll('render-start message received', () => {
          return !!fixture.messages.getFirstMessageEventOfType('render-start');
        });
      })
      .then(() => {
        // test amp-ad will respond to render-start
        return poll('wait for visibility style to change', () => {
          return iframe.style.visibility == '';
        });
      })
      .then(() => {
        expect(iframe.offsetHeight).to.equal(250);
        expect(iframe.offsetWidth).to.equal(300);
        return iframe.contentWindow.context
          .requestResize(200, 50)
          .catch(() => {});
      })
      .then(() => {
        // The userActivation feature is known to be available on Chrome 74+
        if (platform.isChrome() && platform.getMajorVersion() >= 74) {
          const event =
            fixture.messages.getFirstMessageEventOfType('embed-size');
          expect(event.userActivation).to.be.ok;
          expect(event.userActivation.isActive).to.be.a('boolean');
        }
      })
      .then(async function () {
        lastIO = null;
        // Ad is fully visible
        iframe.contentWindow.context.observeIntersection((changes) => {
          lastIO = changes[changes.length - 1];
        });
        await poll('wait for initial IO entry', () => {
          return lastIO != null && lastIO.boundingClientRect.top == 1000;
        });
        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
        lastIO = null;

        // Ad is still fully visible. observeIntersection fire when
        // ads is fully visible with position change
        fixture.win.scrollTo(0, 1000);
        fixture.win.dispatchEvent(
          createCustomEvent(fixture.win, 'scroll', null)
        );
        await poll('wait for new IO entry when ad is fully visible', () => {
          return (
            lastIO != null &&
            lastIO.boundingClientRect.top == (platform.isIos() ? 1 : 0) &&
            lastIO.intersectionRatio == 1
          );
        });
        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
        lastIO = null;

        // Ad is partially visible (around 50%)
        fixture.win.scrollTo(0, 1125);
        fixture.win.dispatchEvent(
          createCustomEvent(fixture.win, 'scroll', null)
        );
        await poll(
          'wait for new IO entry when intersectionRatio changes',
          () => {
            return (
              lastIO != null &&
              lastIO.intersectionRatio > 0 &&
              lastIO.intersectionRatio < 1
            );
          }
        );

        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
        lastIO = null;

        // Ad first becomes invisible
        fixture.win.scrollTo(0, 1251);
        fixture.win.dispatchEvent(
          createCustomEvent(fixture.win, 'scroll', null)
        );
        await poll('wait for new IO entry when ad exit viewport', () => {
          return lastIO != null && lastIO.intersectionRatio == 0;
        });

        await new Promise((resolve) => {
          setTimeout(resolve, 110);
        });
        lastIO = null;

        // Scroll when ad is invisible
        fixture.win.scrollTo(0, 1451);
        fixture.win.dispatchEvent(
          createCustomEvent(fixture.win, 'scroll', null)
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        expect(lastIO).to.be.null;
      })
      .then(
        () =>
          new Promise((resolve, reject) => {
            iframe.contentWindow.context.getHtml('a', ['href'], (content) => {
              if (content == '<a href="http://test.com/test">Test link</a>') {
                resolve();
              } else {
                reject(new Error('Invalid getHtml result: ' + content));
              }
            });
          })
      );
  });
});
