/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Services} from '../../src/services';
import {createFixtureIframe, poll} from '../../testing/iframe';
import {installPlatformService} from '../../src/service/platform-impl';
import {layoutRectLtwh} from '../../src/layout-rect';

function createFixture() {
  return createFixtureIframe('test/fixtures/3p-ad.html', 3000, () => {});
}

describe.configure().run('amp-ad 3P', () => {
  let fixture;

  beforeEach(() => {
    return createFixture().then(f => {
      fixture = f;
      installPlatformService(fixture.win);
    });
  });

  it('create an iframe with APIs', function() {
    this.timeout(20000);
    let iframe;
    let lastIO = null;
    const platform = Services.platformFor(fixture.win);
    return poll(
      'frame to be in DOM',
      () => {
        return fixture.doc.querySelector('amp-ad > iframe');
      },
      undefined,
      5000
    )
      .then(iframeElement => {
        iframe = iframeElement;
        return new Promise(resolve => {
          if (iframe.contentWindow.context) {
            resolve(iframe.contentWindow.context);
          }
          iframe.onload = () => {
            expect(iframe.contentWindow.document.getElementById('c')).to.exist;
            resolve(iframe.contentWindow.context);
          };
        });
      })
      .then(context => {
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
          layoutRectLtwh(0, 0, 500, 3000)
        );
        expect(initialIntersection.boundingClientRect).to.deep.equal(
          layoutRectLtwh(0, platform.isIos() ? 1001 : 1000, 300, 250)
        );
        expect(initialIntersection.intersectionRect).to.deep.equal(
          layoutRectLtwh(0, platform.isIos() ? 1001 : 1000, 300, 250)
        );
        expect(initialIntersection.intersectionRatio).to.equal(1);
        expect(initialIntersection.time).to.be.a('number');
        expect(context.isMaster).to.exist;
        expect(context.computeInMasterFrame).to.exist;
        expect(context.location).to.deep.equal({
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
        // In some browsers the referrer is empty. But in Chrome it works, so
        // we always check there.
        if (context.referrer !== '' || platform.isChrome()) {
          expect(context.referrer).to.contain(
            'http://localhost:' + location.port
          );
        }
        expect(context.startTime).to.be.a('number');
        // Edge has different opinion about window.location in srcdoc iframe.
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
        expect(context.onResizeDenied).to.be.a('function');
        expect(context.onResizeSuccess).to.be.a('function');
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
        expect(iframe.contentWindow.ping.resizeSuccess).to.be.undefined;
        iframe.contentWindow.context.requestResize(200, 50);
        return poll('wait for embed-size to be received', () => {
          return !!fixture.messages.getFirstMessageEventOfType('embed-size');
        });
      })
      .then(() => {
        // The userActivation feature is known to be available on Chrome 74+
        if (platform.isChrome() && platform.getMajorVersion() >= 74) {
          const event = fixture.messages.getFirstMessageEventOfType(
            'embed-size'
          );
          expect(event.userActivation).to.be.ok;
          expect(event.userActivation.isActive).to.be.a('boolean');
        }

        return poll(
          'wait for attemptChangeSize',
          () => {
            return iframe.contentWindow.ping.resizeSuccess != undefined;
          },
          null,
          5000
        );
      })
      .then(() => {
        lastIO = null;
        iframe.contentWindow.context.observeIntersection(changes => {
          lastIO = changes[changes.length - 1];
        });
        fixture.win.scrollTo(0, 1000);
        fixture.win.document.body.dispatchEvent(new Event('scroll'));
        return poll('wait for new IO entry', () => {
          return lastIO != null;
        });
      })
      .then(
        () =>
          new Promise((resolve, reject) => {
            iframe.contentWindow.context.getHtml('a', ['href'], content => {
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
