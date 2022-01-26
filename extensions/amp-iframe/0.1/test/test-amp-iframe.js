import {ActionTrust_Enum} from '#core/constants/action-constants';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {LayoutPriority_Enum} from '#core/dom/layout';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';

import {user} from '#utils/log';

import {macroTask} from '#testing/helpers';
import {whenCalled} from '#testing/helpers/service';
import {poll} from '#testing/iframe';
import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {isAdLike} from '../../../../src/iframe-helper';
import {AmpIframe, setTrackingIframeTimeoutForTesting} from '../amp-iframe';

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
    let iframeSrc;
    let clickableIframeSrc;
    let timer;
    let ranJs;
    let content;
    let win;
    let doc;
    let resizeObserverStub;

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
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
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
        return element.signals().whenSignal(CommonSignals_Enum.LOAD_END);
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
      const impl = await ampIframe.getImpl(false);
      const iframe = ampIframe.querySelector('iframe');
      expect(iframe.src).to.equal(iframeSrc + '#amp=1');
      expect(iframe.getAttribute('sandbox')).to.equal('');
      const scrollWrapper = ampIframe.querySelector(
        'i-amphtml-scroll-container'
      );
      expect(iframe.parentNode).to.equal(scrollWrapper);
      expect(impl.looksLikeTrackingIframe_()).to.be.false;
      expect(impl.getLayoutPriority()).to.equal(LayoutPriority_Enum.CONTENT);
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

    it('should allow JS and propagate scrolling and have lower priority', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 320,
        height: 250,
        scrolling: 'no',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      expect(impl.getLayoutPriority()).to.equal(LayoutPriority_Enum.ADS);
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
      await ampIframe.signals().whenSignal(CommonSignals_Enum.LOAD_START);
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
      yield ampIframe.signals().whenSignal(CommonSignals_Enum.LOAD_START);
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

    describe('allow-same-origin', () => {
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

      it('should deny same origin', async () => {
        const ampIframe = createAmpIframe(env);
        const impl = await ampIframe.getImpl(false);
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
    });

    it('should transform source', async () => {
      const ampIframe = createAmpIframe(env);
      const impl = await ampIframe.getImpl(false);

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

    it('should listen for resize events', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts allow-same-origin',
        width: 100,
        height: 100,
        resizable: '',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
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

    it('should allow resize events w/o allow-same-origin', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
        resizable: '',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
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

    it('should allow resize events w/ srcdoc', async () => {
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
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      return new Promise((resolve, unusedReject) => {
        impl.updateSize_ = (height, width) => {
          resolve({height, width});
        };
      }).then((res) => {
        expect(res.height).to.equal(200);
        expect(res.width).to.equal(300);
      });
    });

    it('should only error once for embed-size requests when non-resizable', async () => {
      expectAsyncConsoleError(/Ignoring embed-size request/);
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      console.error.restore();
      const userError = env.sandbox.spy(console, 'error');

      const impl = await ampIframe.getImpl(false);
      impl.updateSize_(217, 114);
      expect(impl.hasErroredEmbedSize_).to.be.true;
      impl.updateSize_(328, 225);
      impl.updateSize_(439, 336);
      expect(userError).to.have.callCount(1);
    });

    it('should resize amp-iframe', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
        resizable: '',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
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

    it('should resize amp-iframe when only height is provided', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
        resizable: '',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(217);
      expect(attemptChangeSize).to.be.calledOnce;
      expect(attemptChangeSize.firstCall.args[0]).to.equal(217);
      expect(attemptChangeSize.firstCall.args[1]).to.be.undefined;
    });

    it('should not resize amp-iframe if request height is small', async () => {
      expectAsyncConsoleError(/resize height is less than 100px/);
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
        resizable: '',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(50, 114);
      expect(attemptChangeSize).to.have.not.been.called;
    });

    it('should not resize amp-iframe if it is non-resizable', async () => {
      expectAsyncConsoleError(/iframe is not resizable/);
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        sandbox: 'allow-scripts',
        width: 100,
        height: 100,
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      const attemptChangeSize = env.sandbox.spy(impl, 'attemptChangeSize');
      impl.updateSize_(217, 114);
      expect(attemptChangeSize).to.have.not.been.called;
    });

    it('should listen for embed-ready event', function* () {
      const activateIframeSpy_ = env.sandbox./*OK*/ spy(
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

    it('should detect non-tracking iframe', async () => {
      const ampIframe = createAmpIframe(env, {
        src: clickableIframeSrc,
        sandbox: 'allow-scripts allow-same-origin',
        width: 11,
        height: 11,
        poster: 'https://i.ytimg.com/vi/cMcCTVAFBWM/hqdefault.jpg',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      expect(impl.looksLikeTrackingIframe_()).to.be.false;
    });

    it('should detect tracking iframes', async () => {
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
      await waitForAmpIframeLayoutPromise(doc, ampIframe1);
      await waitForAmpIframeLayoutPromise(doc, ampIframe2);
      await waitForAmpIframeLayoutPromise(doc, ampIframe3);
      // 5*5
      const impl1 = await ampIframe1.getImpl(false);
      // 10*10
      const impl2 = await ampIframe2.getImpl(false);
      // 100*100
      const impl3 = await ampIframe3.getImpl(false);
      // appended amp-iframe 5x5
      expect(impl1.looksLikeTrackingIframe_()).to.be.true;
      // appended amp-iframe 10x10
      expect(impl2.looksLikeTrackingIframe_()).to.be.true;
      expect(impl2.getLayoutPriority()).to.equal(LayoutPriority_Enum.METADATA);
      // appended amp-iframe 100x100
      expect(impl3.looksLikeTrackingIframe_()).to.be.false;
      expect(impl3.getLayoutPriority()).to.equal(LayoutPriority_Enum.CONTENT);
      await Services.timerFor(env.win).promise(21);
      expect(doc.querySelectorAll('[amp-removed]')).to.have.length(1);
      expect(doc.querySelectorAll('iframe')).to.have.length(1);
      expect(ampIframe3.querySelector('iframe')).to.not.be.null;
    });

    it('should not detect traking iframe in amp container', async () => {
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
      await waitForAmpIframeLayoutPromise(doc, ampIframeRealTracking);
      await waitForAmpIframeLayoutPromise(doc, ampIframeInLightbox);
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const implIframe = await ampIframe.getImpl(false);
      const implIframeRealTracking = await ampIframeRealTracking.getImpl(false);
      const implIframeInLightbox = await ampIframeInLightbox.getImpl(false);

      expect(implIframe.looksLikeTrackingIframe_()).to.be.false;
      expect(implIframeRealTracking.looksLikeTrackingIframe_()).to.be.true;
      expect(implIframeInLightbox.looksLikeTrackingIframe_()).to.be.false;
    });

    it('should correctly classify ads', () => {
      function e(width, height) {
        return {
          getLayoutSize() {
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
      yield ampIframe.signals().whenSignal(CommonSignals_Enum.LOAD_START);
    });

    it('should propagate `src` when container attribute is mutated', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        width: 100,
        height: 100,
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      const iframe = ampIframe.querySelector('iframe');
      const newSrc = 'https://foo.bar';
      ampIframe.setAttribute('src', newSrc);
      impl.mutatedAttributesCallback({src: newSrc});
      expect(impl.iframeSrc).to.contain(newSrc);
      expect(iframe.getAttribute('src')).to.contain(newSrc);
    });

    describe('consent-data message', () => {
      let impl;
      let iframe;

      beforeEach(async () => {
        const element = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 100,
          height: 100,
        });

        impl = await element.getImpl();
        env.sandbox.spy(impl, 'sendConsentDataToIframe_');

        await waitForAmpIframeLayoutPromise(doc, element);

        iframe = impl.element.querySelector('iframe');
      });

      it('is sent', async () => {
        const consentString = 'foo-consentString';
        const consentMetadata = 'bar-consentMetadata';
        const consentPolicyState = 'baz-consentPolicyState';
        const consentPolicySharedData = 'foo-consentPolicySharedData';

        env.sandbox.stub(Services, 'consentPolicyServiceForDocOrNull').returns(
          Promise.resolve({
            getConsentMetadataInfo: () => Promise.resolve(consentMetadata),
            getConsentStringInfo: () => Promise.resolve(consentString),
            whenPolicyResolved: () => Promise.resolve(consentPolicyState),
            getMergedSharedData: () => Promise.resolve(consentPolicySharedData),
          })
        );

        iframe.contentWindow.postMessage(
          {
            sentinel: 'amp',
            type: 'requestSendConsentState',
          },
          '*'
        );

        await whenCalled(impl.sendConsentDataToIframe_);

        // Ensure listener only triggers once by waiting for event queue to flush
        await macroTask();

        expect(
          impl.sendConsentDataToIframe_.withArgs(
            env.sandbox.match.any, // source
            env.sandbox.match.any, // origin
            env.sandbox.match({
              sentinel: 'amp',
              type: 'consent-data',
              consentString,
              consentMetadata,
              consentPolicyState,
              consentPolicySharedData,
            })
          )
        ).to.have.been.calledOnce;
      });

      it('is sent with empty fields when consent service not available', async () => {
        env.sandbox
          .stub(Services, 'consentPolicyServiceForDocOrNull')
          .returns(Promise.resolve(null));

        iframe.contentWindow.postMessage(
          {
            sentinel: 'amp',
            type: 'requestSendConsentState',
          },
          '*'
        );

        await whenCalled(impl.sendConsentDataToIframe_);

        // Ensure listener only triggers once by waiting for event queue to flush
        await macroTask();

        expect(
          impl.sendConsentDataToIframe_.withArgs(
            env.sandbox.match.any, // source
            env.sandbox.match.any, // origin
            env.sandbox.match({
              sentinel: 'amp',
              type: 'consent-data',
              consentString: null,
              consentMetadata: null,
              consentPolicyState: null,
              consentPolicySharedData: null,
            })
          )
        ).to.have.been.calledOnce;
      });
    });

    it('should propagate `title` when container attribute is mutated', async () => {
      const ampIframe = createAmpIframe(env, {
        src: iframeSrc,
        width: 100,
        height: 100,
        title: 'foo',
      });
      await waitForAmpIframeLayoutPromise(doc, ampIframe);
      const impl = await ampIframe.getImpl(false);
      const iframe = ampIframe.querySelector('iframe');
      const newTitle = 'bar';
      ampIframe.setAttribute('title', newTitle);
      impl.mutatedAttributesCallback({title: newTitle});
      expect(impl.iframe_.title).to.equal(newTitle);
      expect(iframe.getAttribute('title')).to.equal(newTitle);
    });

    describe('pause', () => {
      it('should have unlayoutOnPause', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
        });
        const impl = await ampIframe.getImpl(false);
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(ampIframe.querySelector('iframe')).to.exist;
        expect(impl.unlayoutOnPause()).to.be.true;

        ampIframe.pause();
        expect(ampIframe.querySelector('iframe')).to.not.exist;
      });

      it('should unlayout on pause when loses size', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          width: 100,
          height: 100,
        });
        await ampIframe.getImpl(false);
        env.sandbox./*OK*/ stub(ampIframe, 'pause');
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        expect(ampIframe.pause).to.not.be.called;

        // First send "size" event and then "no size".
        resizeObserverStub.notifySync({
          target: ampIframe,
          borderBoxSize: [{inlineSize: 10, blockSize: 100}],
        });
        resizeObserverStub.notifySync({
          target: ampIframe,
          borderBoxSize: [{inlineSize: 0, blockSize: 0}],
        });
        expect(ampIframe.pause).to.be.calledOnce;
      });
    });

    describe('throwIfCannotNavigate()', () => {
      it('should do nothing if top navigation is allowed', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin allow-top-navigation',
          width: 300,
          height: 250,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);
        // Should be allowed if `allow-top-navigation` is set.
        expect(() => impl.throwIfCannotNavigate()).to.not.throw();
      });

      it('should throw error if top navigation is not allowed', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 300,
          height: 250,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);
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

      it('should support "postMessage" action', async () => {
        const ampIframe = createAmpIframe(env, {
          src: messagingSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 100,
          height: 100,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);

        const impl = await ampIframe.getImpl(false);
        impl.executeAction({
          method: 'postMessage',
          args: 'foo-123',
          satisfiesTrust: () => true,
        });

        await waitForJsInIframe(1);
        expect(content).to.equal('foo-123');
      });

      it('should not allow "postMessage" on srcdoc amp-iframe', async () => {
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
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);

        const userError = env.sandbox.stub(user(), 'error');
        const addEventListener = env.sandbox.stub(win, 'addEventListener');
        impl.executeAction({
          method: 'postMessage',
          args: 'foo-123',
          satisfiesTrust: () => true,
        });
        expect(userError).to.be.calledOnce;
        expect(userError).to.be.calledWithMatch(
          'amp-iframe',
          /"postMessage" action is only allowed with "src"/
        );

        await timer.promise(IFRAME_MESSAGE_TIMEOUT);
        // The iframe's <script> will only post 'loaded-frame' on receipt of
        // a message from the parent, which should be disallowed above.
        expect(ranJs).to.equal(0);
        // Normally, amp-iframe sets up a listener for "message" events
        // for iframe -> host messaging, but not if targetOrigin_ is invalid.
        expect(addEventListener).to.not.be.called;
      });

      it('should receive "message" events from <iframe>', async () => {
        const ampIframe = createAmpIframe(env, {
          src: messagingSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 100,
          height: 100,
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);

        const userError = env.sandbox.stub(user(), 'error');
        const actions = {trigger: env.sandbox.spy()};
        env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

        impl.executeAction({
          method: 'postMessage',
          args: 'foo-123',
          satisfiesTrust: () => true,
        });

        await waitForJsInIframe(1);
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

        await waitForJsInIframe(2);
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
          ActionTrust_Enum.HIGH
        );
      });

      it('should listen for Pym.js height event', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 200,
          height: 200,
          resizable: '',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);
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

      it('should listen for Pym.js width event', async () => {
        const ampIframe = createAmpIframe(env, {
          src: iframeSrc,
          sandbox: 'allow-scripts allow-same-origin',
          width: 200,
          height: 200,
          resizable: '',
        });
        await waitForAmpIframeLayoutPromise(doc, ampIframe);
        const impl = await ampIframe.getImpl(false);
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
  }
);
