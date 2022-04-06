import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {waitFor} from '#testing/helpers/service';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import LocalizedStringsEs from '../_locales/es.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {getLocalizationService} from '../amp-story-localization-service';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {SystemLayer} from '../amp-story-system-layer';
import {ProgressBar} from '../progress-bar';

const NOOP = () => {};

describes.fakeWin('amp-story system layer', {amp: true}, (env) => {
  let win;
  let storeService;
  let systemLayer;
  let progressBarStub;
  let progressBarRoot;

  beforeEach(() => {
    win = env.win;

    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    progressBarRoot = win.document.createElement('div');

    progressBarStub = {
      build: env.sandbox.stub().returns(progressBarRoot),
      getRoot: env.sandbox.stub().returns(progressBarRoot),
      updateProgress: env.sandbox.spy(),
    };

    env.sandbox.stub(ProgressBar, 'create').returns(progressBarStub);

    env.sandbox.stub(Services, 'vsyncFor').returns({
      mutate: (fn) => fn(),
      mutatePromise: (fn) => fn(),
    });

    systemLayer = new SystemLayer(win, win.document.body);
  });

  it('should build UI', () => {
    const initializeListeners = env.sandbox
      .stub(systemLayer, 'initializeListeners_')
      .callsFake(NOOP);

    const root = systemLayer.build();

    expect(root).to.not.be.null;

    expect(initializeListeners).to.have.been.called;
  });

  // TODO(alanorozco, #12476): Make this test work with sinon 4.0.
  it.skip('should attach event handlers', () => {
    const rootMock = {addEventListener: env.sandbox.spy()};

    env.sandbox.stub(systemLayer, 'root_').callsFake(rootMock);
    env.sandbox.stub(systemLayer, 'win_').callsFake(rootMock);

    systemLayer.initializeListeners_();

    expect(rootMock.addEventListener).to.have.been.calledWith('click');
  });

  it('should set an attribute to toggle the UI when an ad is shown', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_AD, true);

    expect(systemLayer.getShadowRoot()).to.have.attribute('ad-showing');
  });

  it('should show that sound off on a page when muted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
    storeService.dispatch(Action.TOGGLE_MUTED, true);
    expect(systemLayer.getShadowRoot()).to.have.attribute('muted');
  });

  it('should show that this page has no sound when unmuted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, false);
    storeService.dispatch(Action.TOGGLE_MUTED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('muted');
    expect(systemLayer.getShadowRoot()).to.not.have.attribute(
      'i-amphtml-current-page-has-audio'
    );
  });

  it('should show that the sound is on when unmuted', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
    storeService.dispatch(Action.TOGGLE_MUTED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('muted');
    expect(systemLayer.getShadowRoot()).to.have.attribute(
      'i-amphtml-current-page-has-audio'
    );
  });

  it('should hide system layer on SYSTEM_UI_IS_VISIBLE_STATE change', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    expect(systemLayer.getShadowRoot()).to.have.class('i-amphtml-story-hidden');
  });

  it('should link the share button to the canonical URL', () => {
    systemLayer.build();
    const shareButton = systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-share-control');
    expect(shareButton).to.not.be.null;
    expect(shareButton.tagName).to.equal('BUTTON');
    // Default "canonical"
    expect(shareButton.href).to.equal('http://localhost:9876/context.html');
  });

  it('should show paused button if story has element with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    expect(systemLayer.getShadowRoot()).to.have.class(
      'i-amphtml-story-has-playback-ui'
    );
  });

  it('should enable paused button if page has element with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-pause-control')
    ).to.not.have.attribute('disabled');
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-play-control')
    ).to.not.have.attribute('disabled');
  });

  it('should disable paused button if page does not has elements with playback', () => {
    systemLayer.build();
    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, false);
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-pause-control')
    ).to.have.attribute('disabled');
    expect(
      systemLayer
        .getShadowRoot()
        .querySelector('button.i-amphtml-story-play-control')
    ).to.have.attribute('disabled');
  });

  it('setting paused state to true should add the paused flag', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, true);
    expect(systemLayer.getShadowRoot()).to.have.attribute('paused');
  });

  it('setting paused state to false should not add the paused flag', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, false);
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('paused');
  });

  it('click on the play button should change state to false', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, true);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-play-control')
      .click();
    expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('paused');
  });

  it('click on the captions button should change state to false', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_CAPTIONS, true);
    storeService.dispatch(Action.TOGGLE_CAPTIONS, true);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-captions-control')
      .click();
    expect(storeService.get(StateProperty.CAPTIONS_STATE)).to.be.false;
    expect(systemLayer.getShadowRoot()).to.not.have.attribute('captions-on');
  });

  it('click on the no captions button should change state to true', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_CAPTIONS, true);
    storeService.dispatch(Action.TOGGLE_CAPTIONS, true);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-nocaptions-control')
      .click();
    expect(storeService.get(StateProperty.CAPTIONS_STATE)).to.be.true;
    expect(systemLayer.getShadowRoot()).to.have.attribute('captions-on');
  });

  it('click on the pause button should change state to true', () => {
    systemLayer.build();

    storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
    storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
    storeService.dispatch(Action.TOGGLE_PAUSED, false);
    systemLayer
      .getShadowRoot()
      .querySelector('.i-amphtml-story-pause-control')
      .click();
    expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    expect(systemLayer.getShadowRoot()).to.have.attribute('paused');
  });

  describe('localization', () => {
    it('should load the localized aria-labels for buttons if strings are available', async () => {
      getLocalizationService(win.document.body).registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });
      systemLayer.build();
      await waitFor(
        () =>
          systemLayer.getShadowRoot().querySelectorAll('[aria-label]').length
      );
      expect(
        systemLayer
          .getShadowRoot()
          .querySelector('.i-amphtml-story-info-control')
          .getAttribute('aria-label')
      ).to.equal('Story information');
    });

    it('should load the localized aria-labels for buttons if strings are available after building', async () => {
      systemLayer.build();
      getLocalizationService(win.document.body).registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });
      await waitFor(
        () =>
          systemLayer.getShadowRoot().querySelectorAll('[aria-label]').length
      );
      expect(
        systemLayer
          .getShadowRoot()
          .querySelector('.i-amphtml-story-info-control')
          .getAttribute('aria-label')
      ).to.equal('Story information');
    });

    it('should load the localized aria-labels for the correct language', async () => {
      win.document.body.setAttribute('lang', 'es');
      getLocalizationService(win.document.body).registerLocalizedStringBundles({
        'default': LocalizedStringsEn,
        'es': LocalizedStringsEs,
      });

      systemLayer.build();

      await waitFor(
        () =>
          systemLayer.getShadowRoot().querySelectorAll('[aria-label]').length
      );
      expect(
        systemLayer
          .getShadowRoot()
          .querySelector('.i-amphtml-story-info-control')
          .getAttribute('aria-label')
      ).to.equal('Información de la historia');
    });

    it('should load the localized text content', async () => {
      getLocalizationService(win.document.body).registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });
      systemLayer.build();

      await waitFor(() =>
        systemLayer
          .getShadowRoot()
          .querySelectorAll('.i-amphtml-story-has-new-page-text')
      );
      expect(
        systemLayer
          .getShadowRoot()
          .querySelector('.i-amphtml-story-has-new-page-text').textContent
      ).to.equal('Updated');
    });
  });
});
