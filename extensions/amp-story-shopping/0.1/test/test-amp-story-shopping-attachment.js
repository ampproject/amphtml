import '../amp-story-shopping';
import '../../../amp-story/1.0/amp-story-page-attachment';

describes.realWin(
  'amp-story-shopping-attachment-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-shopping:0.1'],
    },
  },
  (env) => {
    let win;
    let element;
    let shoppingAttachment;

    beforeEach(async () => {
      win = env.win;
      await createAmpStoryShoppingAttachment();
    });

    async function createAmpStoryShoppingAttachment() {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = win.document.createElement('amp-story-shopping-attachment');
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);
      shoppingAttachment = await element.getImpl();
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingAttachment.buildCallback()).to.not.throw();
    });

    it('should open drawer', async () => {
      const attachmentChildEl = element.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      await attachmentChildImpl.buildCallback();
      shoppingAttachment.open();
      expect(attachmentChildEl).to.have.class(
        'i-amphtml-story-draggable-drawer-open'
      );
    });
  }
);
