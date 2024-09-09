import {expect} from 'chai';

import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {
  Action,
  AmpStoryStoreService,
  UIType_Enum,
} from 'extensions/amp-story/1.0/amp-story-store-service';
import {registerServiceBuilder} from 'src/service-helpers';

import LocalizedStringsEn from '../../../amp-story/1.0/_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {StoryAnalyticsService} from '../../../amp-story/1.0/story-analytics';
import {AmpStoryPageAttachment} from '../amp-story-page-attachment';

describes.realWin('amp-story-page-attachment', {amp: true}, (env) => {
  let attachmentEl;
  let attachment;
  let outlinkEl;
  let outlink;
  let storeService;

  beforeEach(() => {
    const {win} = env;

    // Set up the story.
    const storyEl = <amp-story></amp-story>;
    const pageEl = <amp-story-page></amp-story-page>;
    win.document.body.appendChild(storyEl);
    storyEl.appendChild(pageEl);

    const localizationService = new LocalizationService(win.document.body);
    registerServiceBuilder(win, 'localization', function () {
      return localizationService;
    });
    localizationService.registerLocalizedStringBundles({
      'en': LocalizedStringsEn,
    });

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    const analytics = new StoryAnalyticsService(win, win.document.body);
    registerServiceBuilder(win, 'story-analytics', function () {
      return analytics;
    });

    const ownersMock = {
      scheduleLayout: () => {},
      scheduleResume: () => {},
    };
    env.sandbox.stub(Services, 'ownersForDoc').returns(ownersMock);

    // Set up the attachment element for inline attachment testing.
    attachmentEl = <amp-story-page-attachment></amp-story-page-attachment>;
    attachmentEl.getAmpDoc = () => new AmpDocSingle(win);
    pageEl.appendChild(attachmentEl);
    attachment = new AmpStoryPageAttachment(attachmentEl);

    env.sandbox
      .stub(attachment, 'mutateElement')
      .callsFake((fn) => Promise.resolve(fn()));

    // Set up the outlink element for outlink testing.
    outlinkEl = (
      <amp-story-page-outlink>
        <a></a>
      </amp-story-page-outlink>
    );
    outlinkEl.getAmpDoc = () => new AmpDocSingle(win);
    pageEl.appendChild(outlinkEl);
    outlink = new AmpStoryPageAttachment(outlinkEl);

    env.sandbox
      .stub(outlink, 'mutateElement')
      .callsFake((fn) => Promise.resolve(fn()));
  });

  afterEach(() => {
    attachmentEl.remove();
    outlinkEl.remove();
  });

  it('should build an attachment', async () => {
    await attachment.buildCallback();
    return attachment.layoutCallback();
  });

  it('should build an outlink', async () => {
    await outlink.buildCallback();
    return outlink.layoutCallback();
  });

  it('should build amp-story-page-outlink with target="_top" even when the publisher has specified a different value', async () => {
    const anchorEl = outlinkEl.querySelector('amp-story-page-outlink a');
    anchorEl.setAttribute('target', '_blank');

    await outlink.buildCallback();
    await outlink.layoutCallback();

    expect(anchorEl.getAttribute('target')).to.eql('_top');
  });

  it('header close button should have a negative tabindex attribute by default', async () => {
    await attachment.buildCallback();
    await attachment.layoutCallback();

    const closeButtonEl = attachmentEl.querySelector(
      '.i-amphtml-story-page-attachment-close-button'
    );

    expect(closeButtonEl.getAttribute('tabindex')).to.eql('-1');
  });

  it('header close button should not have tabindex attribute when open', async () => {
    await attachment.buildCallback();
    await attachment.layoutCallback();

    env.sandbox.stub(attachment.analyticsService_, 'triggerEvent');
    env.sandbox.stub(attachment.historyService_, 'push');

    attachment.open(false);

    const closeButtonEl = attachmentEl.querySelector(
      '.i-amphtml-story-page-attachment-close-button'
    );

    expect(closeButtonEl.hasAttribute('tabindex')).to.be.false;
  });

  it('should click on anchor when outlink open method is called', async () => {
    storeService.dispatch(Action.TOGGLE_UI, UIType_Enum.DESKTOP_ONE_PANEL);
    const anchorEl = outlinkEl.querySelector('amp-story-page-outlink a');

    const clickSpy = env.sandbox.spy(anchorEl, 'click');

    await outlink.buildCallback();
    await outlink.layoutCallback();

    outlink.open();

    expect(clickSpy).to.be.calledOnce;
  });
});
