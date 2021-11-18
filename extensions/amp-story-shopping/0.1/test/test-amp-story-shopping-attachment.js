import {createElementWithAttributes} from '#core/dom';
import {AmpStoryPageAttachment} from '../../../amp-story/1.0/amp-story-page-attachment';

import '../amp-story-shopping';

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
      element = createElementWithAttributes(
        win.document,
        'amp-story-shopping-attachment',
        {'layout': 'fill'}
      );
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      shoppingAttachment = await element.getImpl();
    }

    it('should build shopping attachment component', () => {
      expect(() => shoppingAttachment.buildCallback()).to.not.throw();
    });
  }
);
