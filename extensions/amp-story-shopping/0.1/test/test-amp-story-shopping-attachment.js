import '../../../amp-story/1.0/amp-story';
import '../amp-story-shopping';
import {registerServiceBuilder} from '../../../../src/service-helpers';

describes.realWin(
  'amp-story-shopping-attachment-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0', 'amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let win;
    let element;
    let shoppingAttachment;

    beforeEach(async () => {
      win = env.win;
      registerServiceBuilder(win, 'performance', () => ({
        isPerformanceTrackingOn: () => false,
      }));
      env.sandbox.stub(win.history, 'replaceState');
      await createAmpStoryShoppingAttachment();
    });

    async function createAmpStoryShoppingAttachment() {
      let story = win.document.createElement('amp-story');
      win.document.body.appendChild(story);
      let pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = win.document.createElement('amp-story-shopping-attachment');
      pageEl.appendChild(element);
      story.appendChild(pageEl);
      shoppingAttachment = await element.getImpl();
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingAttachment.layoutCallback()).to.not.throw();
    });

    it('should open attachment', async () => {
      const attachmentChildEl = element.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      const openStub = env.sandbox.stub(attachmentChildImpl, 'open');
      await shoppingAttachment.open(true);
      expect(openStub).to.be.calledOnce;
    });
  }
);
