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

  describe('paired button toggle focus restoration', () => {
    /**
     * Stubs the system layer's root so activeElement returns the given element.
     * @param {?Element} activeElement
     */
    function stubActiveElement(activeElement) {
      env.sandbox
        .stub(systemLayer.systemLayerEl_, 'getRootNode')
        .returns({activeElement});
    }

    beforeEach(() => {
      systemLayer.build();
    });

    it('should move focus to the nocaptions button when captions are turned off', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_CAPTIONS, true);
      storeService.dispatch(Action.TOGGLE_CAPTIONS, true);

      const captionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-captions-control');
      const nocaptionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-nocaptions-control');
      const focusSpy = env.sandbox.spy(nocaptionsButton, 'focus');
      stubActiveElement(captionsButton);

      storeService.dispatch(Action.TOGGLE_CAPTIONS, false);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should move focus to the captions button when captions are turned on', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_CAPTIONS, true);
      storeService.dispatch(Action.TOGGLE_CAPTIONS, false);

      const captionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-captions-control');
      const nocaptionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-nocaptions-control');
      const focusSpy = env.sandbox.spy(captionsButton, 'focus');
      stubActiveElement(nocaptionsButton);

      storeService.dispatch(Action.TOGGLE_CAPTIONS, true);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should not move focus on caption state change if no paired button is focused', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_CAPTIONS, true);
      storeService.dispatch(Action.TOGGLE_CAPTIONS, true);

      const captionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-captions-control');
      const nocaptionsButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-nocaptions-control');
      const captionsFocusSpy = env.sandbox.spy(captionsButton, 'focus');
      const nocaptionsFocusSpy = env.sandbox.spy(nocaptionsButton, 'focus');
      stubActiveElement(win.document.body);

      storeService.dispatch(Action.TOGGLE_CAPTIONS, false);

      expect(captionsFocusSpy).to.not.have.been.called;
      expect(nocaptionsFocusSpy).to.not.have.been.called;
    });

    it('should move focus to the unmute button when audio is muted', () => {
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
      storeService.dispatch(Action.TOGGLE_MUTED, false);

      const muteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-mute-audio-control');
      const unmuteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-unmute-audio-control');
      const focusSpy = env.sandbox.spy(unmuteButton, 'focus');
      stubActiveElement(muteButton);

      storeService.dispatch(Action.TOGGLE_MUTED, true);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should move focus to the mute button when audio is unmuted', () => {
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
      storeService.dispatch(Action.TOGGLE_MUTED, true);

      const muteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-mute-audio-control');
      const unmuteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-unmute-audio-control');
      const focusSpy = env.sandbox.spy(muteButton, 'focus');
      stubActiveElement(unmuteButton);

      storeService.dispatch(Action.TOGGLE_MUTED, false);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should not move focus on muted state change if no paired button is focused', () => {
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_AUDIO, true);
      storeService.dispatch(Action.TOGGLE_MUTED, false);

      const muteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-mute-audio-control');
      const unmuteButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-unmute-audio-control');
      const muteFocusSpy = env.sandbox.spy(muteButton, 'focus');
      const unmuteFocusSpy = env.sandbox.spy(unmuteButton, 'focus');
      stubActiveElement(win.document.body);

      storeService.dispatch(Action.TOGGLE_MUTED, true);

      expect(muteFocusSpy).to.not.have.been.called;
      expect(unmuteFocusSpy).to.not.have.been.called;
    });

    it('should move focus to the play button when the story is paused', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
      storeService.dispatch(Action.TOGGLE_PAUSED, false);

      const pauseButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-pause-control');
      const playButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-play-control');
      const focusSpy = env.sandbox.spy(playButton, 'focus');
      stubActiveElement(pauseButton);

      storeService.dispatch(Action.TOGGLE_PAUSED, true);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should move focus to the pause button when the story is resumed', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
      storeService.dispatch(Action.TOGGLE_PAUSED, true);

      const pauseButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-pause-control');
      const playButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-play-control');
      const focusSpy = env.sandbox.spy(pauseButton, 'focus');
      stubActiveElement(playButton);

      storeService.dispatch(Action.TOGGLE_PAUSED, false);

      expect(focusSpy).to.have.been.calledOnce;
    });

    it('should not move focus on paused state change if no paired button is focused', () => {
      storeService.dispatch(Action.TOGGLE_STORY_HAS_PLAYBACK_UI, true);
      storeService.dispatch(Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK, true);
      storeService.dispatch(Action.TOGGLE_PAUSED, false);

      const pauseButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-pause-control');
      const playButton = systemLayer
        .getShadowRoot()
        .querySelector('.i-amphtml-story-play-control');
      const pauseFocusSpy = env.sandbox.spy(pauseButton, 'focus');
      const playFocusSpy = env.sandbox.spy(playButton, 'focus');
      stubActiveElement(win.document.body);

      storeService.dispatch(Action.TOGGLE_PAUSED, true);

      expect(pauseFocusSpy).to.not.have.been.called;
      expect(playFocusSpy).to.not.have.been.called;
    });
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
