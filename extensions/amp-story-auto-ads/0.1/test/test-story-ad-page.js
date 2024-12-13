import {CommonSignals_Enum} from '#core/constants/common-signals';

import {macroTask} from '#testing/helpers';

import {Gestures} from '../../../../src/gesture';
import * as openWindowDialog from '../../../../src/open-window-dialog';
import * as service from '../../../../src/service-helpers';
import {
  Action,
  UIType_Enum,
  getStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {StoryAdAnalytics} from '../story-ad-analytics';
import {ButtonTextFitter} from '../story-ad-button-text-fitter';
import {StoryAdLocalization} from '../story-ad-localization';
import {StoryAdPage} from '../story-ad-page';

const NOOP = () => {};

const baseConfig = {
  'amp-story': '',
  'data-slot': '/30497360/a4a/fake_ad_unit',
  'class': 'i-amphtml-story-ad',
  'layout': 'fill',
  'type': 'doubleclick',
};

const pageImplMock = {
  delegateVideoAutoplay: NOOP,
};

describes.realWin('story-ad-page', {amp: true}, (env) => {
  let win;
  let doc;
  let storyAutoAdsEl;
  let storyAdPage;
  let storeService;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    storyAutoAdsEl = doc.createElement('amp-story-auto-ads');
    doc.body.appendChild(storyAutoAdsEl);
    storyAutoAdsEl.getAmpDoc = () => env.ampdoc;
    storeService = getStoreService(win);
    storyAdPage = new StoryAdPage(
      storyAutoAdsEl.getAmpDoc(),
      baseConfig,
      1, // index
      new StoryAdLocalization(storyAutoAdsEl),
      new ButtonTextFitter(env.ampdoc),
      storeService
    );
  });

  describe('#build', () => {
    it('creates the correct DOM structure', () => {
      const pageElement = storyAdPage.build();

      expect(pageElement.tagName).to.equal('AMP-STORY-PAGE');
      expect(pageElement).to.have.attribute('ad');
      expect(pageElement).to.have.attribute('distance', 2);
      expect(pageElement).to.have.attribute('id', 'i-amphtml-ad-page-1');
      // TODO(#33969) remove when launched.
      expect(pageElement).not.to.have.attribute('auto-advance-after');

      const contentGridLayer = pageElement.firstChild;
      expect(contentGridLayer.tagName).to.equal('AMP-STORY-GRID-LAYER');

      const ad = contentGridLayer.firstChild;
      expect(ad.tagName).to.equal('AMP-AD');
      expect(ad).to.have.attribute('type', 'doubleclick');
      expect(ad).to.have.attribute('data-slot', '/30497360/a4a/fake_ad_unit');
      expect(ad).to.have.attribute('layout', 'fill');
      expect(ad).to.have.attribute('amp-story');
      expect(ad).to.have.class('i-amphtml-story-ad');

      const glassPaneGridLayer = pageElement.lastChild;
      expect(glassPaneGridLayer.tagName).to.equal('AMP-STORY-GRID-LAYER');

      const glassPane = glassPaneGridLayer.firstChild;
      expect(glassPane).to.have.class('i-amphtml-glass-pane');
    });
  });

  describe('#getAdDoc', () => {
    it('returns the ad document', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);

      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      const ampAdElement = doc.querySelector('amp-ad');
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);

      const adDoc = storyAdPage.getAdDoc();
      expect(adDoc).to.exist;
      expect(adDoc).not.to.equal(doc);
      expect(adDoc).to.equal(iframe.contentDocument);
    });
  });

  describe('#hasTimedOut', () => {
    it('should timeout after > 10 seconds', () => {
      const clock = env.sandbox.useFakeTimers(1555555555555);
      storyAdPage.build();
      expect(storyAdPage.hasTimedOut()).to.be.false;
      clock.tick(10009); // 10 second timeout.
      expect(storyAdPage.hasTimedOut()).to.be.true;
    });
  });

  describe('#isLoaded', () => {
    it('should return whethere ad has loaded', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);
      expect(storyAdPage.isLoaded()).to.be.false;
      const adElement = doc.querySelector('amp-ad');

      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      await adElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      expect(storyAdPage.isLoaded()).to.be.true;
    });
  });

  describe('#getPageElement', () => {
    it('returns the created amp-story-page', () => {
      const pageElement = storyAdPage.build();
      expect(storyAdPage.getPageElement()).to.equal(pageElement);
    });
  });

  describe('#registerLoadCallback', () => {
    it('registers given functions and executes when loaded', async () => {
      const someFunc = env.sandbox.spy();
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      storyAdPage.registerLoadCallback(someFunc);
      expect(someFunc).to.have.not.been.called;

      const adElement = doc.querySelector('amp-ad');
      await adElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      expect(someFunc.calledOnce).to.be.true;
    });
  });

  describe('#toggleVisibility', () => {
    it('should add/remove the amp-story-visible attr', async () => {
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      const ampAdElement = doc.querySelector('amp-ad');
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);

      const iframeBody = iframe.contentDocument.body;
      expect(iframeBody).not.to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(iframeBody).to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(iframeBody).not.to.have.attribute('amp-story-visible');
    });

    it('should propagate the visible attribute to alternate body', async () => {
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      const ampAdElement = doc.querySelector('amp-ad');
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <head>
        <meta name="amp4ads-vars-cta-type" content="SHOP">
        <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
        </head>
        <body>
        <div id=google_uploaded_a4a>
            <div id=x-a4a-former-body on="tap:exit-api.exit(target=redirectUrl)" role=link tabindex=0>
              <div class=a4a-wrap></div>
            </div>
        </div>
        </body>`);
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);

      const altBody =
        iframe.contentDocument.querySelector('#x-a4a-former-body');
      expect(altBody).not.to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(altBody).to.have.attribute('amp-story-visible');
      storyAdPage.toggleVisibility();
      expect(altBody).not.to.have.attribute('amp-story-visible');
    });

    it('should add/remove the cta-active signal', async () => {
      const pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      const ampAdElement = doc.querySelector('amp-ad');
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://cats.example');
      ampAdElement.setAttribute('data-vars-ctatype', 'INSTALL');
      await storyAdPage.maybeCreateCta();

      const anchor = doc.querySelector('.i-amphtml-story-ad-link');
      expect(anchor).to.exist;
      expect(anchor).not.to.have.attribute('cta-active');
      storyAdPage.toggleVisibility();
      expect(anchor).to.have.attribute('cta-active');
    });
  });

  describe('#maybeCreateCta', () => {
    let pageElement;
    let ampAdElement;

    beforeEach(() => {
      pageElement = storyAdPage.build();
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);
      doc.body.appendChild(pageElement);

      ampAdElement = doc.querySelector('amp-ad');
    });

    it('reads cta values as data-attributes added by a4a impl', async () => {
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://amp.dev');
      ampAdElement.setAttribute('data-vars-ctatype', 'INSTALL');

      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;

      const ctaLayer = doc.querySelector('amp-story-cta-layer');
      expect(ctaLayer).to.exist;
      const anchor = ctaLayer.querySelector('a');
      expect(anchor.target).to.equal('_blank');
      expect(anchor.href).to.equal('https://amp.dev/');
      expect(anchor).to.have.attribute(
        'style',
        'font-size: 0px; transform: scale(0);'
      );
      expect(anchor).to.have.class('i-amphtml-story-ad-link');
      expect(anchor.textContent).to.equal('Install Now');
    });

    it('allows custom CTA text', async () => {
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://amp.dev');
      ampAdElement.setAttribute('data-vars-ctatype', 'I am a custom button!');

      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;

      const ctaLayer = doc.querySelector('amp-story-cta-layer');
      expect(ctaLayer).to.exist;
      const anchor = ctaLayer.querySelector('a');
      expect(anchor.target).to.equal('_blank');
      expect(anchor.href).to.equal('https://amp.dev/');
      expect(anchor).to.have.attribute(
        'style',
        'font-size: 0px; transform: scale(0);'
      );
      expect(anchor).to.have.class('i-amphtml-story-ad-link');
      expect(anchor.textContent).to.equal('I am a custom button!');
    });

    it('rejects custom CTA text if it is too long', async () => {
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://amp.dev');
      ampAdElement.setAttribute(
        'data-vars-ctatype',
        'I am a very long CTA that will not fit within the button limit!'
      );

      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.false;
    });

    it('reads CTA values from amp4ads-vars meta tags', async () => {
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <head>
        <meta name="amp4ads-vars-cta-type" content="SHOP">
        <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
        </head>
        <body></body>`);

      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);

      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;
      const anchor = doc.querySelector('a');
      expect(anchor.href).to.equal('https://www.example.com/');
      expect(anchor.textContent).to.equal('Shop Now');
    });

    it('prefers CTA url from amp-ad-exit if it exists', async () => {
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://dontuse.com');
      ampAdElement.setAttribute('data-vars-ctatype', 'LEARN_MORE');

      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <body>
          <meta name="amp-cta-type" content="SHOP">
          <amp-ad-exit id="exit-api">
            <script type="application/json">
            {
              "targets": {
                "url_0": { "finalUrl": "https://amp.dev/" }
              }
            }
            </script>
          </amp-ad-exit>
        </body>`);

      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;
      const anchor = doc.querySelector('a');
      expect(anchor.href).to.equal('https://amp.dev/');
      expect(anchor.textContent).to.equal('Shop Now');
    });

    it('throws on missing cta url', async () => {
      expectAsyncConsoleError(
        '[amp-story-auto-ads:ui] Both CTA Type & CTA Url are required in ad response.'
      );
      ampAdElement.setAttribute('data-vars-ctatype', 'INSTALL');
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.false;
    });

    it('throws on missing cta type', async () => {
      expectAsyncConsoleError(
        '[amp-story-auto-ads:ui] Both CTA Type & CTA Url are required in ad response.'
      );
      ampAdElement.setAttribute('data-vars-ctaurl', 'INSTALL');
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.false;
    });

    it('creates attribution badge with outlink', async () => {
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <head>
          <meta name="amp4ads-vars-cta-type" content="SHOP">
          <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
          <meta name="amp4ads-vars-attribution-icon" content="https://googleads.g.doubleclick.net/pagead/images/mtad/ad_choices_blue.png">
          <meta name="amp4ads-vars-attribution-url" content="https://www.google.com">
        </head>
        <body></body>`);

      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;
      const attribution = doc.querySelector('.i-amphtml-story-ad-attribution');
      expect(attribution).to.exist;
      expect(attribution.tagName).to.equal('IMG');
      expect(attribution).to.have.attribute(
        'src',
        'https://googleads.g.doubleclick.net/pagead/images/mtad/ad_choices_blue.png'
      );

      const openWindowDialogStub = env.sandbox.stub(
        openWindowDialog,
        'openWindowDialog'
      );
      attribution.click();
      expect(openWindowDialogStub).to.be.calledOnce;
      expect(openWindowDialogStub).to.be.calledWithExactly(
        win,
        'https://www.google.com',
        '_blank'
      );
    });

    it('propagates fullbleed state to attribution icon', async () => {
      storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.DESKTOP_FULLBLEED);

      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
          <head>
            <meta name="amp4ads-vars-cta-type" content="SHOP">
            <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
            <meta name="amp4ads-vars-attribution-icon" content="https://googleads.g.doubleclick.net/pagead/images/mtad/ad_choices_blue.png">
            <meta name="amp4ads-vars-attribution-url" content="https://www.google.com">
          </head>
          <body></body>`);
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      await storyAdPage.maybeCreateCta();

      const attribution = doc.querySelector('.i-amphtml-story-ad-attribution');
      expect(attribution).to.have.class('i-amphtml-story-ad-fullbleed');

      storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.MOBILE);
      expect(attribution).not.to.have.class('i-amphtml-story-ad-fullbleed');

      storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.DESKTOP_FULLBLEED);
      expect(attribution).to.have.class('i-amphtml-story-ad-fullbleed');
    });

    it('does not create attribution when missing icon', async () => {
      expectAsyncConsoleError(
        /amp-story-auto-ads attribution icon must be available/
      );
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <head>
          <meta name="amp4ads-vars-cta-type" content="SHOP">
          <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
          <meta name="amp4ads-vars-attribution-url" content="https://www.google.com">
        </head>
        <body></body>`);

      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;
      const attribution = doc.querySelector('.i-amphtml-story-ad-attribution');
      expect(attribution).not.to.exist;
    });

    it('does not create attribution when missing url', async () => {
      expectAsyncConsoleError(
        /amp-story-auto-ads attribution url must be available/
      );
      const iframe = doc.createElement('iframe');
      ampAdElement.appendChild(iframe);
      iframe.contentDocument.write(`
        <head>
          <meta name="amp4ads-vars-cta-type" content="SHOP">
          <meta name="amp4ads-vars-cta-url" content="https://www.example.com">
          <meta name="amp4ads-vars-attribution-icon" content="https://googleads.g.doubleclick.net/pagead/images/mtad/ad_choices_blue.png">
        </head>
        <body></body>`);

      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      const created = await storyAdPage.maybeCreateCta();
      expect(created).to.be.true;
      const attribution = doc.querySelector('.i-amphtml-story-ad-attribution');
      expect(attribution).not.to.exist;
    });
  });

  describe('page level analytics', () => {
    let fireEventStub;

    beforeEach(() => {
      const storyAnalytics = new StoryAdAnalytics(env.ampdoc);
      fireEventStub = env.sandbox.stub(storyAnalytics, 'fireEvent');
      env.sandbox
        .stub(service, 'getServicePromiseForDoc')
        .resolves(storyAnalytics);
      storyAdPage = new StoryAdPage(
        storyAutoAdsEl.getAmpDoc(),
        baseConfig,
        1, // index
        new StoryAdLocalization(storyAutoAdsEl),
        new ButtonTextFitter(env.ampdoc)
      );
    });

    it('should fire "story-ad-request" upon ad request', async () => {
      const pageElement = storyAdPage.build();
      await macroTask();
      expect(fireEventStub).to.be.calledWithExactly(
        pageElement,
        1, // adIndex
        'story-ad-request',
        {requestTime: env.sandbox.match.number}
      );
    });

    it('should fire "story-ad-load" upon ad load', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      const ampAdElement = doc.querySelector('amp-ad');
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);
      await macroTask();
      expect(fireEventStub).to.be.calledWithExactly(
        pageElement,
        1, // adIndex
        'story-ad-load',
        {loadTime: env.sandbox.match.number}
      );
    });

    it('should fire "story-ad-swipe" upon ad swipe', async () => {
      const onGestureStub = env.sandbox.stub(Gestures.prototype, 'onGesture');
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      expect(fireEventStub).not.to.be.called;
      const gestureHandler = onGestureStub.lastCall.args[1];
      // Fake X swipe.
      gestureHandler();
      await macroTask();
      expect(fireEventStub).to.be.calledWithExactly(
        pageElement,
        1, // adIndex
        'story-ad-swipe',
        {swipeTime: env.sandbox.match.number}
      );
    });

    it('should fire "story-ad-click" upon ad click', async () => {
      const pageElement = storyAdPage.build();
      doc.body.appendChild(pageElement);
      // Stub delegateVideoAutoplay.
      pageElement.getImpl = () => Promise.resolve(pageImplMock);

      const ampAdElement = doc.querySelector('amp-ad');
      ampAdElement.setAttribute('data-vars-ctaurl', 'https://amp.dev');
      ampAdElement.setAttribute('data-vars-ctatype', 'INSTALL');
      await ampAdElement.signals().signal(CommonSignals_Enum.INI_LOAD);

      await storyAdPage.maybeCreateCta();
      const cta = doc.querySelector('.i-amphtml-story-ad-link');
      // Don't open new tab for test.
      cta.target = '_self';
      cta.click();

      // In real world the shadow host element will be the click target.
      expect(cta.parentElement.getAttribute('role')).to.equal('button');
      await macroTask();
      expect(fireEventStub).to.be.calledWithExactly(
        pageElement,
        1, // adIndex
        'story-ad-click',
        {clickTime: env.sandbox.match.number}
      );
    });
  });
});
