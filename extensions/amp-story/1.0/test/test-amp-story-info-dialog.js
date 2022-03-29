import {Services} from '#service';
import {LocalizationService} from '#service/localization';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {
  DIALOG_VISIBLE_CLASS,
  InfoDialog,
  MOREINFO_VISIBLE_CLASS,
} from '../amp-story-info-dialog';
import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';

describes.realWin('amp-story-info-dialog', {amp: true}, (env) => {
  let moreInfoLinkUrl;
  let embedded;
  let parentEl;
  let infoDialog;
  let storeService;
  let win;

  const MOREINFO_CLASS = '.i-amphtml-story-info-moreinfo';

  beforeEach(() => {
    win = env.win;
    const localizationService = new LocalizationService(win.document.body);
    env.sandbox
      .stub(Services, 'localizationForDoc')
      .returns(localizationService);
    localizationService.registerLocalizedStringBundles({
      'en': LocalizedStringsEn,
    });

    storeService = new AmpStoryStoreService(win);
    embedded = true;
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    // Making sure mutator tasks run synchronously.
    env.sandbox.stub(Services, 'mutatorForDoc').returns({
      mutateElement: (element, callback) => {
        callback();
        return Promise.resolve();
      },
    });

    env.sandbox.stub(Services, 'viewerForDoc').returns({
      isEmbedded: () => embedded,
      sendMessageAwaitResponse: (eventType) => {
        if (eventType === 'moreInfoLinkUrl') {
          return Promise.resolve(moreInfoLinkUrl);
        }

        return Promise.resolve();
      },
    });

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);
    infoDialog = new InfoDialog(win, parentEl);
  });

  it('should build the info dialog', async () => {
    await infoDialog.build();
    expect(infoDialog.element_).to.exist;
  });

  it('should hide more info link when there is no viewer messaging', async () => {
    embedded = false;

    await infoDialog.build();
    expect(infoDialog.element_.querySelector(MOREINFO_CLASS)).not.to.have.class(
      MOREINFO_VISIBLE_CLASS
    );
  });

  it('should hide more info link when the viewer does not supply it', async () => {
    moreInfoLinkUrl = null;

    await infoDialog.build();
    expect(infoDialog.element_.querySelector(MOREINFO_CLASS)).not.to.have.class(
      MOREINFO_VISIBLE_CLASS
    );
  });

  it('should show more info link when the viewer supplies it', async () => {
    moreInfoLinkUrl = 'https://example.com/more-info.html';

    await infoDialog.build();
    expect(infoDialog.element_.querySelector(MOREINFO_CLASS)).to.have.class(
      MOREINFO_VISIBLE_CLASS
    );
  });

  it('should append the info dialog in the parentEl on build', async () => {
    await infoDialog.build();
    expect(parentEl.childElementCount).to.equal(1);
  });

  it('should show the info dialog on store property update', async () => {
    await infoDialog.build();
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
    expect(infoDialog.element_).to.have.class(DIALOG_VISIBLE_CLASS);
  });

  it('should hide the info dialog on click on the overlay', async () => {
    await infoDialog.build();
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
    infoDialog.element_.dispatchEvent(new Event('click'));

    expect(infoDialog.element_).not.to.have.class(DIALOG_VISIBLE_CLASS);
    expect(storeService.get(StateProperty.INFO_DIALOG_STATE)).to.be.false;
  });

  it('should not hide the info dialog on click on the inner container', async () => {
    await infoDialog.build();
    storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
    parentEl
      .querySelector('.i-amphtml-story-info-dialog-container')
      .dispatchEvent(new Event('click'));

    expect(infoDialog.element_).to.have.class(DIALOG_VISIBLE_CLASS);
    expect(storeService.get(StateProperty.INFO_DIALOG_STATE)).to.be.true;
  });
});
