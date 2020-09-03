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

import {ActionTrust} from '../../../../src/action-constants';
import {AmpIframe, setTrackingIframeTimeoutForTesting} from '../amp-iframe';
import {CommonSignals} from '../../../../src/common-signals';
import {LayoutPriority} from '../../../../src/layout';
import {Services} from '../../../../src/services';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';
import {isAdLike} from '../../../../src/iframe-helper';
import {poll} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';

/** @const {number} */
const IFRAME_MESSAGE_TIMEOUT = 50;

describes.realWin(
  'amp-iframe',
  {
    allowExternalResources: true,
    amp: {
      runtimeOn: true,
      extensions: ['amp-iframe'],
      ampdoc: 'single',
    },
  },
  (env) => {
    describe('amp-iframe', () => {
      let iframeSrc;
      let clickableIframeSrc;
      let timer;
      let ranJs;
      let content;
      let win;
      let doc;

      beforeEach(() => {
        iframeSrc =
          'http://iframe.localhost:' +
          location.port +
          '/test/fixtures/served/iframe.html';
        clickableIframeSrc =
          'http://iframe.localhost:' +
          location.port +
          '/test/fixtures/served/iframe-clicktoplay.html';
        win = env.win;
        doc = win.document;
        timer = Services.timerFor(win);
        ranJs = 0;
        content = '';
        timer = Services.timerFor(env.win);
        win.addEventListener('message', (message) => {
          if (typeof message.data != 'string') {
            return;
          }
          if (message.data == 'loaded-iframe') {
            ranJs++;
          }
          if (message.data.indexOf('content-iframe:') == 0) {
            content = message.data.replace('content-iframe:', '');
          }
        });
        setTrackingIframeTimeoutForTesting(20);
      });

      function stubUserAsserts() {
        const errors = [];
        env.sandbox
          .stub(user(), 'assert')
          .callsFake((shouldBeTrueish, message) => {
            if (!shouldBeTrueish) {
              errors.push(message);
            }
            return shouldBeTrueish;
          });
        const replay = function () {
          if (errors.length > 0) {
            throw errors[0];
          }
        };
        replay.errors = errors;
        return replay;
      }

      function waitForJsInIframe(opt_ranJs = 1, opt_timeout = 300) {
        return poll(
          'waiting for JS to run',
          () => {
            return ranJs >= opt_ranJs;
          },
          undefined,
          opt_timeout
        );
      }

      function waitForAmpIframeLayoutPromise(doc, ampIframe) {
        const viewport = Services.viewportForDoc(doc);
        viewport.setScrollTop(600);
        return whenUpgradedToCustomElement(ampIframe).then((element) => {
          return element.signals().whenSignal(CommonSignals.LOAD_END);
        });
      }

      function createAmpIframe(
        env,
        opt_attributes,
        opt_top,
        opt_height,
        opt_translateY,
        opt_container
      ) {
        const doc = env.win.document;
        env.win.innerHeight = opt_height;
        const attributes = opt_attributes || {
          src: iframeSrc,
          width: 100,
          height: 100,
        };
        const ampIframe = createElementWithAttributes(
          doc,
          'amp-iframe',
          attributes
        );
        if (attributes.resizable) {
          const overflowEl = doc.createElement('div');
          overflowEl.setAttribute('overflow', '');
          ampIframe.appendChild(overflowEl);
        }
        if (attributes.poster) {
          const img = createElementWithAttributes(doc, 'amp-img', {
            'layout': 'fill',
            'src': attributes.poster,
            'placeholder': '',
          });
          ampIframe.appendChild(img);
        }
        if (opt_container) {
          const container = doc.createElement('div');
          container.classList.add('i-amphtml-overlay');
          container.appendChild(ampIframe);
          doc.body.appendChild(container);
        } else {
          doc.body.appendChild(ampIframe);
        }
        const viewport = Services.viewportForDoc(doc);
        viewport.resize_();
        ampIframe.style.top = '600px';
        if (opt_top != undefined) {
          ampIframe.style.top = opt_top.toString() + 'px';
        }
        const {top} = ampIframe.style;
        ampIframe.style.position = 'absolute'; //opt_position
        if (opt_translateY) {
          ampIframe.style.transform = `translateY(${opt_translateY}px)`; //'translateY(' + opt_translateY + ')';
        }
        if (attributes.resizable !== undefined) {
          const overflowEl = doc.createElement('div');
          overflowEl.setAttribute('overflow', '');
          ampIframe.appendChild(overflowEl);
        }
        if (attributes.poster) {
          const img = doc.createElement('amp-img');
          img.setAttribute('layout', 'fill');
          img.setAttribute('src', attributes.poster);
          img.setAttribute('placeholder', '');
          ampIframe.appendChild(img);
        }
        if (attributes.position) {
          ampIframe.style.position = attributes.position;
        }
        viewport.setScrollTop(parseInt(top, 10));

        return ampIframe;
      }

      it('should render iframe', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.src).to.equal(iframeSrc + '#amp=1');
        expect(iframe.getAttribute('sandbox')).to.equal('');
        const scrollWrapper = ampIframe.querySelector(
          'i-amphtml-scroll-container'
        );
        expect(iframe.parentNode).to.equal(scrollWrapper);
        expect(impl.looksLikeTrackingIframe_()).to.be.false;
        expect(impl.getLayoutPriority()).to.equal(LayoutPriority.CONTENT);
        await timer.promise(IFRAME_MESSAGE_TIMEOUT);
        expect(ranJs).to.equal(0);
      });

      it('should only propagate supported attributes', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
          title: 'example title',
          allowfullscreen: '',
          allowpaymentrequest: '',
          allowtransparency: '',
          allow: 'microphone; camera',
          referrerpolicy: 'no-referrer',
          frameborder: 3,
          tabindex: -1,
          longdesc: 'foo',
          marginwidth: 5,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.getAttribute('allowfullscreen')).to.equal('');
        expect(iframe.getAttribute('allowpaymentrequest')).to.equal('');
        expect(iframe.getAttribute('allowtransparency')).to.equal('');
        expect(iframe.getAttribute('allow')).to.equal('microphone; camera');
        expect(iframe.getAttribute('referrerpolicy')).to.equal('no-referrer');
        expect(iframe.getAttribute('frameborder')).to.equal('3');
        expect(iframe.getAttribute('tabindex')).to.equal('-1');
        expect(iframe.getAttribute('title')).to.equal('example title');
        // unsupported attributes
        expect(iframe.getAttribute('longdesc')).to.be.null;
        expect(iframe.getAttribute('marginwidth')).to.be.null;
      });

      // This is temporary.
      // TODO(aghassemi, #21247)
      it('should disable allow=autoplay', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
          allow: 'microphone; autoplay; camera',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.getAttribute('allow')).to.equal(
          'microphone; autoplay-disabled; camera'
        );
      });

      it('should default frameborder to 0 if not set', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.getAttribute('frameborder')).to.equal('0');
      });

      it('should allow JS and propagate scrolling and have lower priority', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 320,
          height: 250,
          scrolling: 'no',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(ampIframe.implementation_.getLayoutPriority()).to.equal(
          LayoutPriority.ADS
        );
        expect(ampIframe.getAttribute('sandbox')).to.equal('allow-scripts');
        return waitForJsInIframe().then(() => {
          expect(ranJs).to.equal(1);
          expect(ampIframe.querySelector('i-amphtml-scroll-container')).to.be
            .null;
        });
      });

      it('should not render at the top', async () => {
        expectAsyncConsoleError(/position/);
        const ampIframe = createAmpIframe(
          env,
          {
            src: iframeSrc,
            sandbox: 'allow-scripts',
            width: 100,
            height: 100,
          },
          599,
          1000
        );
        await whenUpgradedToCustomElement(ampIframe);
        await ampIframe.signals().whenSignal(CommonSignals.LOAD_START);
      });

      it('should respect translations', function* () {
        expectAsyncConsoleError(/position/);
        const ampIframe = createAmpIframe(
          env,
          {
            src: iframeSrc,
            sandbox: 'allow-scripts',
            width: 100,
            height: 100,
          },
          650,
          1000,
          -600
        );
        yield whenUpgradedToCustomElement(ampIframe);
        yield ampIframe.signals().whenSignal(CommonSignals.LOAD_START);
      });

      it('should render if further than 75% vh away from top', function* () {
        const ampIframe = createAmpIframe(
          env,
          {
            src: iframeSrc,
            sandbox: 'allow-scripts',
            width: 100,
            height: 100,
          },
          75,
          100
        );
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(ampIframe.querySelector('iframe')).to.not.be.null;
      });

      it('should deny http', async () => {
        const asserts = stubUserAsserts();
        const ampIframe = createAmpIframe(env, {
          src: 'http://google.com/fpp',
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(asserts).to.throw(/Must start with https/);
      });

      it('should allow data-uri', function* () {
        const dataUri =
          'data:text/html;charset=utf-8;base64,' +
          'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
          'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=';
        const ampIframe = createAmpIframe(env, {
          src: dataUri,
          width: 100,
          height: 100,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.src).to.equal(dataUri);
        expect(iframe.getAttribute('sandbox')).to.equal('');
        const scrollWrapper = ampIframe.querySelector(
          'i-amphtml-scroll-container'
        );
        expect(iframe.parentNode).to.equal(scrollWrapper);
        yield timer.promise(IFRAME_MESSAGE_TIMEOUT);
        expect(ranJs).to.equal(0);
      });

      it('should support srcdoc', function* () {
        const ampIframe = createAmpIframe(env, {
          width: 100,
          height: 100,
          sandbox: 'allow-scripts',
          srcdoc:
            '<div id="content"><p>௵Z加䅌ਇ☎Èʘغޝ</p></div>' +
            '<script>try{parent.location.href}catch(e){' +
            "parent./*OK*/postMessage('loaded-iframe', '*');" +
            "var c = document.querySelector('#content').innerHTML;" +
            "parent./*OK*/postMessage('content-iframe:' + c, '*');" +
            '}</script>',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        expect(iframe.src).to.match(/^data\:text\/html;charset=utf-8;base64,/);
        expect(iframe.getAttribute('srcdoc')).to.be.null;
        expect(iframe.getAttribute('sandbox')).to.equal('allow-scripts');
        const scrollWrapper = ampIframe.querySelector(
          'i-amphtml-scroll-container'
        );
        expect(iframe.parentNode).to.equal(scrollWrapper);
        return waitForJsInIframe().then(() => {
          expect(ranJs).to.equal(1);
          expect(content).to.equal('<p>௵Z加䅌ਇ☎Èʘغޝ</p>');
        });
      });

      it('should deny srcdoc with allow-same-origin', async () => {
        const asserts = stubUserAsserts();
        const ampIframe = createAmpIframe(env, {
          width: 100,
          height: 100,
          sandbox: 'allow-same-origin',
          srcdoc: 'test',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(asserts).to.throw(/allow-same-origin.*srcdoc/);
      });

      it('should deny data uri with allow-same-origin', async () => {
        const asserts = stubUserAsserts();
        const ampIframe = createAmpIframe(env, {
          width: 100,
          height: 100,
          sandbox: 'allow-same-origin',
          src:
            'data:text/html;charset=utf-8;base64,' +
            'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
            'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(asserts).to.throw(/amp-iframe-origin-policy.md/);
      });

      it('should deny DATA uri with allow-same-origin', async () => {
        const asserts = stubUserAsserts();
        const ampIframe = createAmpIframe(env, {
          width: 100,
          height: 100,
          sandbox: 'allow-same-origin',
          src:
            'DATA:text/html;charset=utf-8;base64,' +
            'PHNjcmlwdD5kb2N1bWVudC53cml0ZSgnUiAnICsgZG9jdW1lbnQucmVmZXJyZXIgK' +
            'yAnLCAnICsgbG9jYXRpb24uaHJlZik8L3NjcmlwdD4=',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(asserts).to.throw(/amp-iframe-origin-policy.md/);
      });

      it('should deny same origin', () => {
        const ampIframe = createAmpIframe(env);
        const impl = ampIframe.implementation_;
        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_(
              'https://google.com/fpp',
              'https://google.com/abc',
              'allow-same-origin'
            );
          }).to.throw(/must not be equal to container/);
        });

        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_(
              'https://google.com/fpp',
              'https://google.com/abc',
              'Allow-same-origin'
            );
          }).to.throw(/must not be equal to container/);
        });

        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_(
              'https://google.com/fpp',
              'https://google.com/abc',
              'allow-same-origin allow-scripts'
            );
          }).to.throw(/must not be equal to container/);
        });
        // Same origin, but sandboxed.
        impl.assertSource_(
          'https://google.com/fpp',
          'https://google.com/abc',
          ''
        );

        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_('http://google.com/', 'https://foo.com', '');
          }).to.throw(/Must start with https/);
        });

        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_('./foo', location.href, 'allow-same-origin');
          }).to.throw(/must not be equal to container/);
        });

        impl.assertSource_(
          'http://iframe.localhost:123/foo',
          'https://foo.com',
          ''
        );
        impl.assertSource_('https://container.com', 'https://foo.com', '');
        ampIframe.setAttribute('srcdoc', 'abc');
        ampIframe.setAttribute('sandbox', 'allow-same-origin');

        allowConsoleError(() => {
          expect(() => {
            impl.transformSrcDoc_(
              '<script>try{parent.location.href}catch(e){' +
                "parent.parent./*OK*/postMessage('loaded-iframe', '*');}" +
                '</script>',
              'Allow-Same-Origin'
            );
          }).to.throw(
            /allow-same-origin is not allowed with the srcdoc attribute/
          );
        });

        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_(
              'https://3p.ampproject.net:999/t',
              'https://google.com/abc'
            );
          }).to.throw(/not allow embedding of frames from ampproject\.\*/);
        });
        allowConsoleError(() => {
          expect(() => {
            impl.assertSource_(
              'https://3p.ampproject.net:999/t',
              'https://google.com/abc'
            );
          }).to.throw(/not allow embedding of frames from ampproject\.\*/);
        });
      });

      it('should transform source', () => {
        const ampIframe = createAmpIframe(env);
        const impl = ampIframe.implementation_;

        // null -> undefined
        expect(impl.transformSrc_(null)).to.be.undefined;

        // data: is unchanged
        expect(impl.transformSrc_('data:abc')).to.equal('data:abc');

        // URL with fragment is unchanged.
        expect(impl.transformSrc_('https://example.com/#1')).to.equal(
          'https://example.com/#1'
        );

        // URL w/o fragment is modified.
        expect(impl.transformSrc_('https://example.com/')).to.equal(
          'https://example.com/#amp=1'
        );

        // URL with empty fragment is modified.
        expect(impl.transformSrc_('https://example.com/#')).to.equal(
          'https://example.com/#amp=1'
        );
      });

      it('should listen for resize events', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        return new Promise((resolve, unusedReject) => {
          impl.updateSize_ = (height, width) => {
            resolve({height, width});
          };
          const iframe = ampIframe.querySelector('iframe');
          iframe.contentWindow.postMessage(
            {
              sentinel: 'amp-test',
              type: 'requestHeight',
              height: 217,
              width: 113,
            },
            '*'
          );
        }).then((res) => {
          expect(res.height).to.equal(217);
          expect(res.width).to.equal(113);
        });
      });

      it('should allow resize events w/o allow-same-origin', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        return new Promise((resolve, unusedReject) => {
          impl.updateSize_ = (height, width) => {
            resolve({height, width});
          };
          const iframe = ampIframe.querySelector('iframe');
          iframe.contentWindow.postMessage(
            {
              sentinel: 'amp-test',
              type: 'requestHeight',
              height: 217,
              width: 113,
            },
            '*'
          );
        }).then((res) => {
          expect(res.height).to.equal(217);
          expect(res.width).to.equal(113);
        });
      });

      it('should allow resize events w/ srcdoc', function* () {
        const srcdoc = `
        <!doctype html>
        <html>
         <body>
          <script>
            setTimeout(() => {
              window.parent.postMessage({
                sentinel: 'amp',
                type: 'embed-size',
                height: 200,
                width: 300,
              }, '*');
            }, 100);
          </script>
         </body>
        </html>
      `;
        const ampIframe = createAmpIframe(env, {
          srcdoc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        return new Promise((resolve, unusedReject) => {
          impl.updateSize_ = (height, width) => {
            resolve({height, width});
          };
        }).then((res) => {
          expect(res.height).to.equal(200);
          expect(res.width).to.equal(300);
        });
      });

      it('should only error once for embed-size requests when non-resizable', function* () {
        expectAsyncConsoleError(/Ignoring embed-size request/);
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        console.error.restore();
        const userError = env.sandbox.spy(console, 'error');

        const impl = ampIframe.implementation_;
        impl.updateSize_(217, 114);
        expect(impl.hasErroredEmbedSize_).to.be.true;
        impl.updateSize_(328, 225);
        impl.updateSize_(439, 336);
        expect(userError).to.have.callCount(1);
      });

      it('should resize amp-iframe', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
        impl.updateSize_(217, '114' /* be tolerant to string number */);
        expect(attemptChangeSize).to.be.calledWith(217, 114);
      });

      it('should hide overflow element after resize', async function () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl();
        const overflowElement = impl.getOverflowElement();
        overflowElement.classList.toggle('amp-visible', true);
        impl.updateSize_(217, '114' /* be tolerant to string number */);
        await timer.promise(IFRAME_MESSAGE_TIMEOUT);
        expect(overflowElement.classList.contains('amp-visible')).to.be.false;
      });

      it('should resize amp-iframe when only height is provided', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
        impl.updateSize_(217);
        expect(attemptChangeSize).to.be.calledOnce;
        expect(attemptChangeSize.firstCall.args[0]).to.equal(217);
        expect(attemptChangeSize.firstCall.args[1]).to.be.undefined;
      });

      it('should not resize amp-iframe if request height is small', function* () {
        expectAsyncConsoleError(/resize height is less than 100px/);
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
          resizable: '',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
        impl.updateSize_(50, 114);
        expect(attemptChangeSize).to.have.not.been.called;
      });

      it('should not resize amp-iframe if it is non-resizable', function* () {
        expectAsyncConsoleError(/iframe is not resizable/);
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts',
          width: 100,
          height: 100,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
        impl.updateSize_(217, 114);
        expect(attemptChangeSize).to.have.not.been.called;
      });

      it('should listen for embed-ready event', function* () {
        const activateIframeSpy_ = window.sandbox./*OK*/ spy(
          AmpIframe.prototype,
          'activateIframe_'
        );
        const ampIframe = createAmpIframe(env, {
          src: clickableIframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 480,
          height: 360,
          poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const iframe = ampIframe.querySelector('iframe');
        yield timer.promise(100);
        expect(iframe.style.zIndex).to.equal('0');
        expect(activateIframeSpy_).to.have.callCount(2);
      });

      it('should detect non-tracking iframe', function* () {
        const ampIframe = createAmpIframe(env, {
          src: clickableIframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 11,
          height: 11,
          poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        expect(impl.looksLikeTrackingIframe_()).to.be.false;
      });

      it('should detect tracking iframes', function* () {
        expectAsyncConsoleError(/Only 1 analytics\/tracking iframe allowed/);
        const ampIframe1 = createAmpIframe(env, {
          src: clickableIframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 5,
          height: 5,
          poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
        });
        const ampIframe2 = createAmpIframe(env, {
          src: clickableIframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 10,
          height: 10,
          poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
        });
        const ampIframe3 = createAmpIframe(env, {
          src: clickableIframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 100,
          height: 100,
          poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe1);
        yield waitForAmpIframeLayoutPromise(doc, ampIframe2);
        yield waitForAmpIframeLayoutPromise(doc, ampIframe3);
        // 5*5
        const impl1 = ampIframe1.implementation_;
        // 10*10
        const impl2 = ampIframe2.implementation_;
        // 100*100
        const impl3 = ampIframe3.implementation_;
        // appended amp-iframe 5x5
        expect(impl1.looksLikeTrackingIframe_()).to.be.true;
        // appended amp-iframe 10x10
        expect(impl2.looksLikeTrackingIframe_()).to.be.true;
        expect(impl2.getLayoutPriority()).to.equal(LayoutPriority.METADATA);
        // appended amp-iframe 100x100
        expect(impl3.looksLikeTrackingIframe_()).to.be.false;
        expect(impl3.getLayoutPriority()).to.equal(LayoutPriority.CONTENT);
        yield Services.timerFor(env.win).promise(21);
        expect(doc.querySelectorAll('[amp-removed]')).to.have.length(1);
        expect(doc.querySelectorAll('iframe')).to.have.length(1);
        expect(ampIframe3.querySelector('iframe')).to.not.be.null;
      });

      it('should not detect traking iframe in amp container', function* () {
        expectAsyncConsoleError(/Only 1 analytics\/tracking iframe allowed/);
        const ampIframeRealTracking = createAmpIframe(env, {
          src: iframeSrc,
          width: 5,
          height: 5,
        });
        const ampIframeInLightbox = createAmpIframe(
          env,
          {
            src: iframeSrc,
            width: 5,
            height: 5,
          },
          undefined,
          undefined,
          undefined,
          true
        );
        const ampIframe = createAmpIframe(env);
        yield waitForAmpIframeLayoutPromise(doc, ampIframeRealTracking);
        yield waitForAmpIframeLayoutPromise(doc, ampIframeInLightbox);
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);

        expect(ampIframeRealTracking.implementation_.looksLikeTrackingIframe_())
          .to.be.true;
        expect(ampIframe.implementation_.looksLikeTrackingIframe_()).to.be
          .false;
        expect(ampIframeInLightbox.implementation_.looksLikeTrackingIframe_())
          .to.be.false;
      });

      it('should correctly classify ads', () => {
        function e(width, height) {
          return {
            getLayoutBox() {
              return {width, height};
            },
          };
        }
        expect(isAdLike(e(300, 250))).to.be.true;
        expect(isAdLike(e(320, 270))).to.be.true;
        expect(isAdLike(e(299, 249))).to.be.false;
        expect(isAdLike(e(320, 100))).to.be.true;
        expect(isAdLike(e(335, 100))).to.be.true;
        expect(isAdLike(e(341, 100))).to.be.false;
      });

      it('should not render fixed ad', function* () {
        expectAsyncConsoleError(/not used for displaying fixed ad/);
        const ampIframe = createAmpIframe(
          env,
          {
            src: iframeSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 300,
            height: 250,
            position: 'fixed',
          },
          0
        );
        yield whenUpgradedToCustomElement(ampIframe);
        yield ampIframe.signals().whenSignal(CommonSignals.LOAD_START);
      });

      it('should not cache intersection box', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 300,
          height: 250,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const stub = env.sandbox.stub(impl, 'getLayoutBox');
        const box = {
          top: 100,
          bottom: 200,
          left: 0,
          right: 100,
          width: 100,
          height: 100,
        };
        stub.returns(box);

        impl.onLayoutMeasure();
        const intersection = impl.getIntersectionElementLayoutBox();
        // Simulate a fixed position element "moving" 100px by scrolling down
        // the page.
        box.top += 100;
        box.bottom += 100;
        const newIntersection = impl.getIntersectionElementLayoutBox();
        expect(newIntersection).not.to.deep.equal(intersection);
        expect(newIntersection.top).to.equal(intersection.top + 100);
        expect(newIntersection.width).to.equal(300);
        expect(newIntersection.height).to.equal(250);
      });

      it('should propagate `src` when container attribute is mutated', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const iframe = ampIframe.querySelector('iframe');
        const newSrc = 'https://foo.bar';
        ampIframe.setAttribute('src', newSrc);
        impl.mutatedAttributesCallback({src: newSrc});
        expect(impl.iframeSrc).to.contain(newSrc);
        expect(iframe.getAttribute('src')).to.contain(newSrc);
      });

      it('should propagate `title` when container attribute is mutated', function* () {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
          title: 'foo',
        });
        yield waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = ampIframe.implementation_;
        const iframe = ampIframe.querySelector('iframe');
        const newTitle = 'bar';
        ampIframe.setAttribute('title', newTitle);
        impl.mutatedAttributesCallback({title: newTitle});
        expect(impl.iframe_.title).to.equal(newTitle);
        expect(iframe.getAttribute('title')).to.equal(newTitle);
      });

      describe('throwIfCannotNavigate()', () => {
        it('should do nothing if top navigation is allowed', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            sandbox: 'allow-scripts allow-same-origin allow-top-navigation',
            width: 300,
            height: 250,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const impl = ampIframe.implementation_;
          // Should be allowed if `allow-top-navigation` is set.
          expect(() => impl.throwIfCannotNavigate()).to.not.throw();
        });

        it('should throw error if top navigation is not allowed', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 300,
            height: 250,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const impl = ampIframe.implementation_;
          // Should be allowed if `allow-top-navigation` is set.
          expect(() => impl.throwIfCannotNavigate()).to.throw(
            /allow-top-navigation/
          );
        });
      });

      describe('two-way messaging', function () {
        let messagingSrc;

        beforeEach(() => {
          messagingSrc =
            'http://iframe.localhost:' +
            location.port +
            '/test/fixtures/served/iframe-messaging.html';
          toggleExperiment(win, 'iframe-messaging', true, true);
        });

        afterEach(() => {
          toggleExperiment(win, 'iframe-messaging', false, true);
        });

        it('should support "postMessage" action', function* () {
          const ampIframe = createAmpIframe(env, {
            src: messagingSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);

          const impl = ampIframe.implementation_;
          impl.executeAction({
            method: 'postMessage',
            args: 'foo-123',
            satisfiesTrust: () => true,
          });

          yield waitForJsInIframe(1);
          expect(content).to.equal('foo-123');
        });

        it('should not allow "postMessage" on srcdoc amp-iframe', function* () {
          const ampIframe = createAmpIframe(env, {
            srcdoc:
              '<script>addEventListener("message", e => {' +
              '  parent./*OK*/postMessage("content-iframe:" + e.data, "*");' +
              '  parent./*OK*/postMessage("loaded-iframe", "*");' +
              '});</script>',
            sandbox: 'allow-scripts',
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);

          const userError = env.sandbox.stub(user(), 'error');
          const addEventListener = env.sandbox.stub(win, 'addEventListener');
          ampIframe.implementation_.executeAction({
            method: 'postMessage',
            args: 'foo-123',
            satisfiesTrust: () => true,
          });
          expect(userError).to.be.calledOnce;
          expect(userError).to.be.calledWithMatch(
            'amp-iframe',
            /"postMessage" action is only allowed with "src"/
          );

          yield timer.promise(IFRAME_MESSAGE_TIMEOUT);
          // The iframe's <script> will only post 'loaded-frame' on receipt of
          // a message from the parent, which should be disallowed above.
          expect(ranJs).to.equal(0);
          // Normally, amp-iframe sets up a listener for "message" events
          // for iframe -> host messaging, but not if targetOrigin_ is invalid.
          expect(addEventListener).to.not.be.called;
        });

        it('should receive "message" events from <iframe>', function* () {
          const ampIframe = createAmpIframe(env, {
            src: messagingSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);

          const userError = env.sandbox.stub(user(), 'error');
          const actions = {trigger: env.sandbox.spy()};
          env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

          const impl = ampIframe.implementation_;
          impl.executeAction({
            method: 'postMessage',
            args: 'foo-123',
            satisfiesTrust: () => true,
          });

          yield waitForJsInIframe(1);
          expect(actions.trigger).to.not.be.called;
          expect(userError).calledWithMatch(
            'amp-iframe',
            /may only be triggered from a user gesture/
          );

          env.sandbox.stub(impl, 'isUserGesture_').returns(true);
          impl.executeAction({
            method: 'postMessage',
            args: 'bar-456',
            satisfiesTrust: () => true,
          });

          yield waitForJsInIframe(2);
          // Once for 'loaded-iframe' and once for 'content-iframe'.
          expect(actions.trigger).to.be.calledTwice;
          const eventMatcher = env.sandbox.match({
            type: 'amp-iframe:message',
            detail: env.sandbox.match({data: 'content-iframe:bar-456'}),
          });
          expect(actions.trigger).to.be.calledWith(
            ampIframe,
            'message',
            eventMatcher,
            ActionTrust.HIGH
          );
        });

        it('should listen for Pym.js height event', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 200,
            height: 200,
            resizable: '',
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const impl = ampIframe.implementation_;
          return new Promise((resolve, unusedReject) => {
            impl.updateSize_ = (height, width) => {
              resolve({height, width});
            };
            const iframe = ampIframe.querySelector('iframe');
            iframe.contentWindow.postMessage(
              {
                sentinel: 'amp-test',
                type: 'requestPymjsHeight',
                height: 234,
              },
              '*'
            );
          }).then((res) => {
            expect(res.height).to.equal(234);
            expect(res.width).to.be.an('undefined');
          });
        });

        it('should listen for Pym.js width event', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            sandbox: 'allow-scripts allow-same-origin',
            width: 200,
            height: 200,
            resizable: '',
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const impl = ampIframe.implementation_;
          return new Promise((resolve, unusedReject) => {
            impl.updateSize_ = (height, width) => {
              resolve({height, width});
            };
            const iframe = ampIframe.querySelector('iframe');
            iframe.contentWindow.postMessage(
              {
                sentinel: 'amp-test',
                type: 'requestPymjsWidth',
                width: 345,
              },
              '*'
            );
          }).then((res) => {
            expect(res.width).to.equal(345);
            expect(res.height).to.be.an('undefined');
          });
        });
      });

      describe('pause/resume', () => {
        beforeEach(() => {
          toggleExperiment(win, 'pausable-iframe', true, true);
        });

        function setPolicyAllowed(iframe, allowed) {
          env.sandbox.defineProperty(iframe, 'featurePolicy', {
            value: {
              features() {
                return ['execution-while-not-rendered'];
              },
              allowsFeature() {
                return allowed;
              },
            },
          });
        }

        it('should not be pausable without an experiment', function* () {
          toggleExperiment(win, 'pausable-iframe', false, false);
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const iframe = ampIframe.querySelector('iframe');
          expect(iframe.getAttribute('allow') || '').to.not.have.string(
            "execution-while-not-rendered 'none'"
          );
          expect(ampIframe.unlayoutOnPause()).to.be.true;
        });

        it('should be configureed pausable with an experiment', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const iframe = ampIframe.querySelector('iframe');
          expect(iframe.getAttribute('allow') || '').to.have.string(
            "execution-while-not-rendered 'none'"
          );
        });

        it('should allow pausing when configured and supported', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const iframe = ampIframe.querySelector('iframe');
          setPolicyAllowed(iframe, false);
          expect(ampIframe.unlayoutOnPause()).to.be.false;
          ampIframe.pauseCallback();
          expect(iframe).to.have.attribute('hidden');
          ampIframe.resumeCallback();
          expect(iframe).to.not.have.attribute('hidden');
        });

        it('should not allow pausing before loaded', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          expect(ampIframe.querySelector('iframe')).to.not.exist;
          expect(ampIframe.unlayoutOnPause()).to.be.true;
        });

        it('should not pause/resume when not allowed', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const iframe = ampIframe.querySelector('iframe');
          setPolicyAllowed(iframe, true);
          expect(ampIframe.unlayoutOnPause()).to.be.true;
          ampIframe.pauseCallback();
          expect(iframe).to.not.have.attribute('hidden');
        });

        it('should not pause/resume w/o experiment', function* () {
          const ampIframe = createAmpIframe(env, {
            src: iframeSrc,
            width: 100,
            height: 100,
          });
          yield waitForAmpIframeLayoutPromise(doc, ampIframe);
          const iframe = ampIframe.querySelector('iframe');
          setPolicyAllowed(iframe, false);
          toggleExperiment(win, 'pausable-iframe', false, false);
          expect(ampIframe.unlayoutOnPause()).to.be.true;
          ampIframe.pauseCallback();
          expect(iframe).to.not.have.attribute('hidden');
        });
      });
    });
  }
);
