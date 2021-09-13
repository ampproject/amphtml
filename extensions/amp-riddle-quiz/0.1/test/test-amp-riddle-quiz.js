import {createElementWithAttributes} from '#core/dom';
import '../amp-riddle-quiz';

describes.realWin(
  'amp-riddle-quiz',
  {
    amp: {
      extensions: ['amp-riddle-quiz'],
    },
  },
  (env) => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
      element = createElementWithAttributes(win.document, 'amp-riddle-quiz', {
        layout: 'responsive',
        width: '100',
        height: '100',
      });
      win.document.body.appendChild(element);
    });

    it('should have iframe when built', () => {
      element.buildInternal().then(() => {
        const iframe = element.querySelector('iframe');
        expect(iframe).to.not.be.null;
      });
    });
  }
);
