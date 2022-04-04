import {VisibilityState_Enum} from '#core/constants/visibility-state';
import * as docready from '#core/document/ready';
import {layoutRectLtwh} from '#core/dom/layout/rect';

import {Services} from '#service';

import {HighlightHandler, getHighlightParam} from '../highlight-handler';
import {Messaging, WindowPortEmulator} from '../messaging/messaging';

describes.fakeWin(
  'getHighlightParam',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    it('get a param', () => {
      // URL encoded '{"s":["amp","highlight"]}'.
      env.win.location =
        'page.html#highlight=' +
        '%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%7D';
      expect(getHighlightParam(env.ampdoc)).to.deep.equal({
        sentences: ['amp', 'highlight'],
        skipScrollAnimation: false,
        skipRendering: false,
      });
    });

    it('do nothing flag', () => {
      // URL encoded '{"s":["amp","highlight"], "n": 1}'
      env.win.location =
        'page.html#highlight=' +
        '%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%2C%20%22n%22%3A%201%7D';
      expect(getHighlightParam(env.ampdoc)).to.deep.equal({
        sentences: ['amp', 'highlight'],
        skipScrollAnimation: false,
        skipRendering: true,
      });
    });

    it('skip animation flag', () => {
      // URL encoded '{"s":["amp","highlight"], "na": 1}'
      env.win.location =
        'page.html#highlight=' +
        '%7B%22s%22%3A%5B%22amp%22%2C%22highlight%22%5D%2C%20%22na%22%3A%201%7D';
      expect(getHighlightParam(env.ampdoc)).to.deep.equal({
        sentences: ['amp', 'highlight'],
        skipScrollAnimation: true,
        skipRendering: false,
      });
    });

    it('no param', () => {
      env.win.location = 'page.html';
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('too large json', () => {
      const rep = 100 << 10;
      env.win.location = 'page.html#highlight=['.repeat(rep) + ']'.repeat(rep);
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('too many sentences', () => {
      const sens = [];
      for (let i = 0; i < 20; i++) {
        sens.push('a');
      }
      env.win.location = 'page.html#highlight=' + JSON.stringify({'s': sens});
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('too many chars', () => {
      const sens = [];
      for (let i = 0; i < 5; i++) {
        sens.push('a'.repeat(400));
      }
      env.win.location = 'page.html#highlight=' + JSON.stringify({'s': sens});
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('if s is not array', () => {
      env.win.location =
        'page.html#highlight=' + JSON.stringify({'s': 'invalid'});
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('empty in an array', () => {
      env.win.location =
        'page.html#highlight=' + JSON.stringify({'s': ['a', '', 'b']});
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });

    it('number array', () => {
      env.win.location = 'page.html#highlight=' + JSON.stringify({'s': [1, 2]});
      expect(getHighlightParam(env.ampdoc)).to.be.a('null');
    });
  }
);

describes.realWin(
  'HighlightHandler',
  {
    // We can not overwrite win.location with realWin.
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let root = null;
    let initCb = null;

    beforeEach(() => {
      const {document} = env.win;
      root = document.createElement('div');
      document.body.appendChild(root);
      const div0 = document.createElement('div');
      div0.textContent = 'text in amp doc';
      root.appendChild(div0);
      const div1 = document.createElement('div');
      div1.textContent = 'highlighted text';
      root.appendChild(div1);

      env.sandbox
        .stub(docready, 'whenDocumentReady')
        .returns({then: (cb) => (initCb = cb)});

      const platform = Services.platformFor(env.ampdoc.win);
      if (platform.isChrome()) {
        env.sandbox.stub(platform, 'getMajorVersion').returns(92);
      }
    });

    it('initialize with visibility=visible', () => {
      const {ampdoc} = env;
      const scrollStub = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'animateScrollIntoView'
      );
      scrollStub.returns(Promise.reject());
      const sendMsgStub = env.sandbox.stub(
        Services.viewerForDoc(ampdoc),
        'sendMessage'
      );
      const setScrollTop = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'setScrollTop'
      );

      const handler = new HighlightHandler(ampdoc, {
        sentences: ['amp', 'highlight'],
      });

      // initHighlight_ is not called before document become ready.
      expect(handler.highlightedNodes_).to.be.null;
      initCb();
      // initHighlight_ was called in docreadyCb() and highlightedNodes_ is set.
      expect(handler.highlightedNodes_).not.to.be.null;

      expect(setScrollTop).to.be.calledOnce;
      expect(setScrollTop.firstCall.args.length).to.equal(1);

      expect(scrollStub).to.be.calledOnce;
      expect(scrollStub.firstCall.args.length).to.equal(1);
      expect(scrollStub.firstCall.args[0].style.pointerEvents).to.equal('none');
      expect(scrollStub.firstCall.args[0].style.display).to.equal('block');

      // For some reason, expect(args).to.deep.equal does not work.
      expect(sendMsgStub.callCount).to.equal(2);
      expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
      expect(sendMsgStub.firstCall.args[1]).to.deep.equal({
        state: 'found',
        scroll: 0,
      });
      expect(sendMsgStub.secondCall.args[1]).to.deep.equal({
        state: 'auto_scroll',
      });

      expect(root.innerHTML).to.equal(
        '<div>text in <span style="background-color: rgb(252, 255, 0); ' +
          'color: rgb(0, 0, 0);">amp</span> doc</div><div>' +
          '<span style="background-color: rgb(252, 255, 0); color: ' +
          'rgb(0, 0, 0);">highlight</span>ed text</div>'
      );

      const viewerOrigin = 'http://localhost:9876';
      const port = new WindowPortEmulator(window, viewerOrigin);
      port.addEventListener = function () {};
      port.postMessage = function () {};
      const messaging = new Messaging(env.win, port);

      handler.setupMessaging(messaging);
      messaging.handleRequest_({
        name: 'highlightDismiss',
      });
      expect(root.innerHTML).to.equal(
        '<div>text in <span style="">amp</span> doc</div><div>' +
          '<span style="">highlight</span>ed text</div>'
      );
    });

    it('initialize with skipRendering', () => {
      const {ampdoc} = env;
      const scrollStub = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'animateScrollIntoView'
      );
      scrollStub.returns(Promise.reject());
      const sendMsgStub = env.sandbox.stub(
        Services.viewerForDoc(ampdoc),
        'sendMessage'
      );

      new HighlightHandler(ampdoc, {
        sentences: ['amp', 'highlight'],
        skipRendering: true,
      });
      initCb();

      expect(scrollStub).not.to.be.called;

      // For some reason, expect(args).to.deep.equal does not work.
      expect(sendMsgStub.callCount).to.equal(1);
      expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
      expect(sendMsgStub.firstCall.args[1]).to.deep.equal({
        state: 'found',
        scroll: 0,
      });

      expect(root.innerHTML).to.equal(
        '<div>text in <span>amp</span> doc</div><div><span>highlight</span>' +
          'ed text</div>'
      );
    });

    it('initialize with skipScrollAnimation', () => {
      const {ampdoc} = env;
      const scrollStub = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'animateScrollIntoView'
      );
      scrollStub.returns(Promise.reject());
      const sendMsgStub = env.sandbox.stub(
        Services.viewerForDoc(ampdoc),
        'sendMessage'
      );
      const setScrollTop = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'setScrollTop'
      );

      const handler = new HighlightHandler(ampdoc, {
        sentences: ['amp', 'highlight'],
        skipScrollAnimation: true,
      });

      // initHighlight_ is not called before document become ready.
      expect(handler.highlightedNodes_).to.be.null;
      initCb();
      // initHighlight_ was called in initCb() and highlightedNodes_ is set.
      expect(handler.highlightedNodes_).not.to.be.null;

      expect(setScrollTop).to.be.calledOnce;
      expect(setScrollTop.firstCall.args.length).to.equal(1);

      expect(scrollStub).not.to.be.calledOnce;

      // For some reason, expect(args).to.deep.equal does not work.
      expect(sendMsgStub.callCount).to.equal(3);
      expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
      expect(sendMsgStub.firstCall.args[1]).to.deep.equal({
        state: 'found',
        scroll: 0,
      });
      expect(sendMsgStub.secondCall.args[1]).to.deep.equal({
        state: 'auto_scroll',
      });
      expect(sendMsgStub.thirdCall.args[1]).to.deep.equal({
        state: 'shown',
      });
    });

    it('initialize with amp-access', () => {
      // Inject <script id="amp-access"> to emulate pages with <amp-access>.
      const {document} = env.win;
      const script = document.createElement('script');
      script.id = 'amp-access';
      document.body.appendChild(script);

      const {ampdoc} = env;
      const scrollStub = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'animateScrollIntoView'
      );
      scrollStub.returns(Promise.reject());
      const sendMsgStub = env.sandbox.stub(
        Services.viewerForDoc(ampdoc),
        'sendMessage'
      );

      new HighlightHandler(ampdoc, {sentences: ['amp', 'highlight']});
      initCb();

      expect(scrollStub).not.to.be.called;

      // For some reason, expect(args).to.deep.equal does not work.
      expect(sendMsgStub.callCount).to.equal(1);
      expect(sendMsgStub.firstCall.args[0]).to.equal('highlightState');
      expect(sendMsgStub.firstCall.args[1]).to.deep.equal({
        state: 'has_amp_access',
      });

      expect(root.innerHTML).to.equal(
        '<div>text in amp doc</div><div>highlighted text</div>'
      );
    });

    it('initialize with visibility=prerender', () => {
      // If visibility != visible, highlight texts and scroll to the start
      // position of the animation. But do not trigger the animation.
      const {ampdoc} = env;
      const scrollStub = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'animateScrollIntoView'
      );
      scrollStub.returns(Promise.reject());
      const sendMsgStub = env.sandbox.stub(
        Services.viewerForDoc(ampdoc),
        'sendMessage'
      );
      const setScrollTop = env.sandbox.stub(
        Services.viewportForDoc(ampdoc),
        'setScrollTop'
      );
      env.sandbox
        .stub(ampdoc, 'getVisibilityState')
        .returns(VisibilityState_Enum.PRERENDER);

      new HighlightHandler(ampdoc, {sentences: ['amp', 'highlight']});
      initCb();

      expect(setScrollTop).to.be.calledOnce;
      expect(setScrollTop.firstCall.args.length).to.equal(1);
      expect(scrollStub).not.to.be.called;
      // For some reason, expect(args).to.deep.equal does not work.
      expect(sendMsgStub.callCount).to.equal(1);
      expect(sendMsgStub.firstCall.args[1]).to.deep.equal({
        state: 'found',
        scroll: 0,
      });

      expect(root.innerHTML).to.have.string('highlight</span>ed');
    });

    it('calcTopToCenterHighlightedNodes_ center elements', () => {
      const handler = new HighlightHandler(env.ampdoc, {sentences: ['amp']});
      initCb();
      expect(handler.highlightedNodes_).not.to.be.null;

      const viewport = Services.viewportForDoc(env.ampdoc);
      env.sandbox
        .stub(viewport, 'getLayoutRect')
        .returns(layoutRectLtwh(0, 500, 100, 50));
      env.sandbox.stub(viewport, 'getHeight').returns(300);
      env.sandbox.stub(viewport, 'getPaddingTop').returns(50);

      // 525px (The center of the element) - 0.5 * 250px (window height)
      // - 50px (padding top) = 350px.
      expect(handler.calcTopToCenterHighlightedNodes_()).to.equal(350);
    });

    it('calcTopToCenterHighlightedNodes_ too tall element', () => {
      const handler = new HighlightHandler(env.ampdoc, {sentences: ['amp']});
      initCb();
      expect(handler.highlightedNodes_).not.to.be.null;

      const viewport = Services.viewportForDoc(env.ampdoc);
      env.sandbox
        .stub(viewport, 'getLayoutRect')
        .returns(layoutRectLtwh(0, 500, 100, 500));
      env.sandbox.stub(viewport, 'getHeight').returns(300);
      env.sandbox.stub(viewport, 'getPaddingTop').returns(50);

      // Scroll to the top of the element with PAGE_TOP_MARGIN margin
      // because it's too tall.
      // 500px (The top of the element) - 50px (padding top)
      // - 80px (PAGE_TOP_MARGIN) = 370px.
      expect(handler.calcTopToCenterHighlightedNodes_()).to.equal(370);
    });

    it('mayAdjustTop_', () => {
      const handler = new HighlightHandler(env.ampdoc, {sentences: ['amp']});
      initCb();
      expect(handler.highlightedNodes_).not.to.be.null;

      // Set up an environment where calcTopToCenterHighlightedNodes_
      // returns 350.
      const viewport = Services.viewportForDoc(env.ampdoc);
      env.sandbox
        .stub(viewport, 'getLayoutRect')
        .returns(layoutRectLtwh(0, 500, 100, 50));
      env.sandbox.stub(viewport, 'getHeight').returns(300);
      env.sandbox.stub(viewport, 'getPaddingTop').returns(50);
      // The current top is 500.
      env.sandbox.stub(viewport, 'getScrollTop').returns(500);

      const setScrollTopStub = env.sandbox.stub(viewport, 'setScrollTop');

      const param = handler.mayAdjustTop_(400);
      expect(param).to.deep.equal({'nd': 150, 'od': 100});
      expect(setScrollTopStub).to.be.calledOnce;
      expect(setScrollTopStub.firstCall.args[0]).to.equal(350);
    });
  }
);

describes.realWin(
  'HighlightHandler',
  {
    // We can not overwrite win.location with realWin.
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    // TODO(dmanek): remove `ifChrome` once we remove Chrome version detection
    describe
      .configure()
      .ifChrome()
      .run('Text Fragments', () => {
        let root = null;

        beforeEach(() => {
          const {document} = env.win;
          root = document.createElement('div');
          document.body.appendChild(root);
          const div0 = document.createElement('div');
          div0.textContent = 'text in amp doc';
          root.appendChild(div0);
          const div1 = document.createElement('div');
          div1.textContent = 'highlighted text';
          root.appendChild(div1);

          //  Used in Chrome 93+
          env.sandbox.stub(env.ampdoc, 'whenFirstVisible');

          const platform = Services.platformFor(env.ampdoc.win);
          if (platform.isChrome()) {
            env.sandbox.stub(platform, 'getMajorVersion').returns(93);
          }
        });

        it('should highlight using text fragments', async () => {
          const {ampdoc} = env;
          let whenFirstVisiblePromiseResolve;
          const whenFirstVisiblePromise = new Promise((resolve) => {
            whenFirstVisiblePromiseResolve = resolve;
          });
          ampdoc.whenFirstVisible.returns(whenFirstVisiblePromise);

          const highlightHandler = new HighlightHandler(ampdoc, {
            sentences: ['amp', 'highlight'],
          });

          const updateUrlWithTextFragmentSpy = env.sandbox.spy();
          highlightHandler.updateUrlWithTextFragment_ =
            updateUrlWithTextFragmentSpy;

          whenFirstVisiblePromiseResolve();
          await whenFirstVisiblePromise;

          expect(updateUrlWithTextFragmentSpy).to.be.calledOnce;
          expect(updateUrlWithTextFragmentSpy.getCall(0).args[0]).to.equal(
            'text=amp&text=highlight'
          );
        });

        it('should not highlight using text fragments for Chrome 92', async () => {
          const {ampdoc} = env;
          const platform = Services.platformFor(ampdoc.win);
          platform.getMajorVersion.returns(92);
          let whenFirstVisiblePromiseResolve;
          const whenFirstVisiblePromise = new Promise((resolve) => {
            whenFirstVisiblePromiseResolve = resolve;
          });
          ampdoc.whenFirstVisible.returns(whenFirstVisiblePromise);

          const highlightHandler = new HighlightHandler(ampdoc, {
            sentences: ['amp', 'highlight'],
          });

          const updateUrlWithTextFragmentSpy = env.sandbox.spy();
          highlightHandler.updateUrlWithTextFragment_ =
            updateUrlWithTextFragmentSpy;

          whenFirstVisiblePromiseResolve();
          await whenFirstVisiblePromise;

          expect(updateUrlWithTextFragmentSpy).not.to.be.called;
        });

        it('should not highlight if highlightInfo.sentences is empty', async () => {
          const {ampdoc} = env;
          let whenFirstVisiblePromiseResolve;
          const whenFirstVisiblePromise = new Promise((resolve) => {
            whenFirstVisiblePromiseResolve = resolve;
          });
          ampdoc.whenFirstVisible.returns(whenFirstVisiblePromise);

          const highlightHandler = new HighlightHandler(ampdoc, {
            sentences: [],
          });

          const updateUrlWithTextFragmentSpy = env.sandbox.spy();
          highlightHandler.updateUrlWithTextFragment_ =
            updateUrlWithTextFragmentSpy;

          whenFirstVisiblePromiseResolve();
          await whenFirstVisiblePromise;

          expect(updateUrlWithTextFragmentSpy).not.to.be.called;
        });
      });
  }
);
