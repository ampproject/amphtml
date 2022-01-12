import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {AmpStoryStoreService} from 'extensions/amp-story/1.0/amp-story-store-service';
import {registerServiceBuilder} from 'src/service-helpers';

import {AmpStoryPageAttachment} from '../amp-story-page-attachment';

describes.realWin('amp-story-page-attachment', {amp: true}, (env) => {
  let attachmentEl;
  let attachment;
  let outlinkEl;
  let outlink;

  beforeEach(() => {
    const {win} = env;

    // Set up the story.
    const storyEl = win.document.createElement('amp-story');
    const pageEl = win.document.createElement('amp-story-page');
    storyEl.getAmpDoc = () => new AmpDocSingle(win);
    win.document.body.appendChild(storyEl);
    storyEl.appendChild(pageEl);

    const localizationService = new LocalizationService(win.document.body);
    registerServiceBuilder(win, 'localization', function () {
      return localizationService;
    });

    const storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    // Set up the attachment element for inline attachment testing.
    attachmentEl = win.document.createElement('amp-story-page-attachment');
    attachmentEl.getAmpDoc = () => new AmpDocSingle(win);
    pageEl.appendChild(attachmentEl);
    attachment = new AmpStoryPageAttachment(attachmentEl);

    // Set up the outlink element for outlink testing.
    outlinkEl = win.document.createElement('amp-story-page-outlink');
    outlinkEl.getAmpDoc = () => new AmpDocSingle(win);
    pageEl.appendChild(outlinkEl);
    outlinkEl.appendChild(win.document.createElement('a'));
    outlink = new AmpStoryPageAttachment(outlinkEl);
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
});
