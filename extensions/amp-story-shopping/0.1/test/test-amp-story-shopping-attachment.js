import {expect} from 'chai';

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
    let shoppingEl;
    let shoppingImpl;

    beforeEach(async () => {
      win = env.win;
      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });
      env.sandbox.stub(win.history, 'replaceState');

      const story = win.document.createElement('amp-story');
      win.document.body.appendChild(story);
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      shoppingEl = win.document.createElement('amp-story-shopping-attachment');
      pageEl.appendChild(shoppingEl);
      story.appendChild(pageEl);
      shoppingImpl = await shoppingEl.getImpl();
    });

    it('should build shopping attachment component', () => {
      expect(() => shoppingImpl.layoutCallback()).to.not.throw();
    });

    it('should open attachment', async () => {
      const attachmentChildEl = shoppingEl.querySelector(
        'amp-story-page-attachment'
      );
      const attachmentChildImpl = await attachmentChildEl.getImpl();
      env.sandbox.stub(attachmentChildImpl, 'open');
      await shoppingImpl.open(true);
      expect(attachmentChildImpl.open).to.be.calledOnce;
    });
  }
);
