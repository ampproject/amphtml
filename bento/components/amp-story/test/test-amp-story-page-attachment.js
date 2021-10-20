import {AmpDocSingle} from '#service/ampdoc-impl';
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
    storyEl.getAmpDoc = () => new AmpDocSingle(win);
    win.document.body.appendChild(storyEl);

    // Set up the attachment element for inline attachment testing.
    attachmentEl = win.document.createElement('amp-story-page-attachment');
    attachmentEl.getAmpDoc = () => new AmpDocSingle(win);
    storyEl.appendChild(attachmentEl);
    attachment = new AmpStoryPageAttachment(attachmentEl);

    // Set up the outlink element for outlink testing.
    outlinkEl = win.document.createElement('amp-story-page-outlink');
    outlinkEl.getAmpDoc = () => new AmpDocSingle(win);
    storyEl.appendChild(outlinkEl);
    outlinkEl.appendChild(win.document.createElement('a'));
    outlink = new AmpStoryPageAttachment(outlinkEl);
  });

  afterEach(() => {
    attachmentEl.remove();
    outlinkEl.remove();
  });

  it('should build an attachment', async () => {
    attachment.buildCallback();
    return attachment.layoutCallback();
  });

  it('should build an outlink', async () => {
    outlink.buildCallback();
    return outlink.layoutCallback();
  });

  it('should build amp-story-page-outlink with target="_top" even when the publisher has specified a different value', async () => {
    const anchorEl = outlinkEl.querySelector('amp-story-page-outlink a');
    anchorEl.setAttribute('target', '_blank');

    outlink.buildCallback();
    await outlink.layoutCallback();

    expect(anchorEl.getAttribute('target')).to.eql('_top');
  });
});
