import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {AmpStoryConsent} from '../amp-story-consent';
import {AmpStoryStoreService, StateProperty} from '../amp-story-store-service';

describes.realWin('amp-story-consent', {amp: true}, (env) => {
  const CONSENT_ID = 'CONSENT_ID';
  let win;
  let consentConfigEl;
  let defaultConfig;
  let getComputedStyleStub;
  let storyConsent;
  let storyConsentConfigEl;
  let storyConsentEl;
  let storyEl;

  const setConfig = (config) => {
    storyConsentConfigEl.textContent = JSON.stringify(config);
  };

  beforeEach(() => {
    win = env.win;
    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);
    const storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });
    localizationService.registerLocalizedStringBundles({
      'en': LocalizedStringsEn,
    });

    const consentConfig = {
      consents: {ABC: {checkConsentHref: 'https://example.com'}},
    };

    defaultConfig = {
      title: 'Foo title.',
      message: 'Foo message about the consent.',
      vendors: ['Item 1', 'Item 2'],
      onlyAccept: false,
      externalLink: {},
    };

    const styles = {'background-color': 'rgb(0, 0, 0)'};
    getComputedStyleStub = env.sandbox
      .stub(win, 'getComputedStyle')
      .returns(styles);

    // Test DOM structure:
    // <amp-story>
    //   <amp-consent>
    //     <script type="application/json">{JSON Config}</script>
    //     <amp-story-consent>
    //       <script type="application/json">{JSON Config}</script>
    //     </amp-story-consent>
    //   </amp-consent>
    // </amp-story>
    storyEl = win.document.createElement('amp-story');

    const consentEl = win.document.createElement('amp-consent');
    consentEl.setAttribute('id', CONSENT_ID);

    consentConfigEl = win.document.createElement('script');
    consentConfigEl.setAttribute('type', 'application/json');
    consentConfigEl.textContent = JSON.stringify(consentConfig);

    storyConsentConfigEl = win.document.createElement('script');
    storyConsentConfigEl.setAttribute('type', 'application/json');
    setConfig(defaultConfig);

    storyConsentEl = win.document.createElement('amp-story-consent');
    storyConsentEl.getAmpDoc = () => storyConsentEl;
    storyConsentEl.appendChild(storyConsentConfigEl);

    storyEl.appendChild(consentEl);
    consentEl.appendChild(consentConfigEl);
    consentEl.appendChild(storyConsentEl);
    win.document.body.appendChild(storyEl);

    storyConsent = new AmpStoryConsent(storyConsentEl);
  });

  it('should parse the config', async () => {
    await storyConsent.buildCallback();
    expect(storyConsent.storyConsentConfig_).to.deep.equal(defaultConfig);
  });

  it('should parse and merge legacy consent config', async () => {
    const newConsentConfig = {
      'consentInstanceId': 'ABC',
      'checkConsentHref': 'https://example.com',
      'promptIfUnknownForGeoGroup': undefined,
    };
    await storyConsent.buildCallback();
    expect(storyConsent.consentConfig_).to.deep.equal(newConsentConfig);
  });

  it('should require a story-consent title', () => {
    delete defaultConfig.title;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires a title');
    });
  });

  it('should require a story-consent message', () => {
    delete defaultConfig.message;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires a message');
    });
  });

  it('should require a story-consent vendors', () => {
    delete defaultConfig.vendors;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires an array of vendors');
    });
  });

  it('should require a story-consent vendors of type array', () => {
    defaultConfig.vendors = 'foo';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires an array of vendors');
    });
  });

  it('should require onlyAccept to be a boolean', () => {
    defaultConfig.onlyAccept = 'foo';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires "onlyAccept" to be a boolean');
    });
  });

  it('should show the decline button by default', async () => {
    delete defaultConfig.onlyAccept;
    setConfig(defaultConfig);

    await storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-action-reject'
    );

    // For some reason the win object provided by the test environment does not
    // return all the styles.
    expect(buttonEl).to.have.display('block');
  });

  it('should hide the decline button if onlyAccept is true', async () => {
    defaultConfig.onlyAccept = true;
    setConfig(defaultConfig);

    await storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-action-reject'
    );

    // For some reason the win object provided by the test environment does not
    // return all the styles.
    expect(buttonEl).to.have.display('none');
  });

  it('should hide the external link by default', async () => {
    await storyConsent.buildCallback();

    const linkEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-external-link'
    );

    expect(linkEl).to.have.display('none');
  });

  it('should require an external link title if a URL is provided', () => {
    defaultConfig.externalLink.href = 'https://example.com';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires "externalLink.title" to be a string');
    });
  });

  it('should require an external URL if a title is provided', () => {
    defaultConfig.externalLink.title = 'Privacy settings';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires "externalLink.href" to be an absolute URL');
    });
  });

  it('should validate an external absolute URL', () => {
    defaultConfig.externalLink.title = 'Privacy settings';
    defaultConfig.externalLink.href = '/foo.html';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('URL must start with "http://" or "https://"');
    });
  });

  it('should show the external link', async () => {
    defaultConfig.externalLink.title = 'Privacy settings';
    defaultConfig.externalLink.href = 'https://example.com';
    setConfig(defaultConfig);

    await storyConsent.buildCallback();

    const linkEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-external-link'
    );

    expect(linkEl).not.to.have.display('none');
  });

  it('should allowlist the <amp-consent> actions', async () => {
    await storyConsent.buildCallback();

    const actions = storyConsent.storeService_.get(
      StateProperty.ACTIONS_ALLOWLIST
    );
    expect(actions).to.deep.contain({
      tagOrTarget: 'AMP-CONSENT',
      method: 'accept',
    });
    expect(actions).to.deep.contain({
      tagOrTarget: 'AMP-CONSENT',
      method: 'prompt',
    });
    expect(actions).to.deep.contain({
      tagOrTarget: 'AMP-CONSENT',
      method: 'reject',
    });
  });

  it('should broadcast the amp actions', async () => {
    await storyConsent.buildCallback();

    env.sandbox.stub(storyConsent.actions_, 'trigger');

    // Builds and appends a fake button directly in the storyConsent Shadow DOM.
    const buttonEl = win.document.createElement('button');
    buttonEl.setAttribute('on', 'tap:ABC.accept');
    storyConsent.storyConsentEl_.appendChild(buttonEl);

    const clickEvent = new Event('click');
    buttonEl.dispatchEvent(clickEvent);

    expect(storyConsent.actions_.trigger).to.have.been.calledOnce;
    expect(storyConsent.actions_.trigger).to.have.been.calledWith(buttonEl);
  });

  it('should render an accept button with the proper amp action', async () => {
    await storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_.querySelector(
      `button[on="tap:${CONSENT_ID}.accept"]`
    );
    expect(buttonEl).to.exist;
  });

  it('should set the consent ID in the store', async () => {
    await storyConsent.buildCallback();

    expect(storyConsent.storeService_.get(StateProperty.CONSENT_ID)).to.equal(
      CONSENT_ID
    );
  });

  it('should set the consent ID in the store if right amp-geo group', async () => {
    const config = {consents: {ABC: {promptIfUnknownForGeoGroup: 'eea'}}};
    consentConfigEl.textContent = JSON.stringify(config);

    env.sandbox
      .stub(Services, 'geoForDocOrNull')
      .resolves({matchedISOCountryGroups: ['eea']});

    await storyConsent.buildCallback();

    await Promise.resolve();
    expect(storyConsent.storeService_.get(StateProperty.CONSENT_ID)).to.equal(
      CONSENT_ID
    );
  });

  it('should not set consent ID in the store if wrong amp-geo group', async () => {
    const config = {consents: {ABC: {promptIfUnknownForGeoGroup: 'eea'}}};
    consentConfigEl.textContent = JSON.stringify(config);

    env.sandbox
      .stub(Services, 'geoForDocOrNull')
      .resolves({matchedISOCountryGroups: ['othergroup']});

    await storyConsent.buildCallback();

    await Promise.resolve();
    expect(storyConsent.storeService_.get(StateProperty.CONSENT_ID)).to.be.null;
  });

  it('should set the font color to black if background is white', async () => {
    const styles = {'background-color': 'rgb(255, 255, 255)'};
    getComputedStyleStub.returns(styles);
    await storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-action-accept'
    );
    expect(buttonEl.getAttribute('style')).to.equal(
      'color: rgb(0, 0, 0) !important;'
    );
  });

  it('should set the font color to white if background is black', async () => {
    const styles = {'background-color': 'rgba(0, 0, 0, 1)'};
    getComputedStyleStub.returns(styles);
    await storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_.querySelector(
      '.i-amphtml-story-consent-action-accept'
    );
    expect(buttonEl.getAttribute('style')).to.equal(
      'color: rgb(255, 255, 255) !important;'
    );
  });

  it('should require publisher-logo-src to be a URL', () => {
    storyEl.setAttribute('publisher-logo-src', 'foo:bar');
    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw(
        'amp-story publisher-logo-src must start with "https://" or "//"'
      );
    });
  });
});
