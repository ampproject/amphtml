import '../amp-date-picker';
import {expect} from 'chai';

import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

const DEFAULT_ATTRS = {
  layout: 'fixed-height',
  height: '360',
};

describes.realWin(
  'amp-date-picker-v1.0',
  {
    amp: {
      extensions: ['amp-date-picker:1.0'],
    },
  },
  (env) => {
    let document;
    let win;
    let html;

    const DEFAULT_ATTRS = {
      layout: 'fixed-height',
      height: '360',
    };

    function createDatePicker(attributes, parent = document.body) {
      const attrs = {...DEFAULT_ATTRS, ...attributes};
      const element = createElementWithAttributes(
        document,
        'amp-date-picker',
        attrs
      );

      parent.appendChild(element);

      return {element};
    }

    beforeEach(async () => {
      win = env.win;
      document = win.document;
      html = htmlFor(document);

      toggleExperiment(win, 'bento-date-picker', true, true);
    });

    it('renders in the simplest case', async () => {
      const {element} = createDatePicker({layout: 'fixed-height', height: 360});
      document.body.appendChild(element);
      await waitFor(() => element.isConnected, 'element connected');

      expect(element.parentNode).to.equal(document.body);
      expect(element.children).to.have.lengthOf(0);
    });

    describe('initial dates', () => {
      it('should use the value of a single input at runtime', async () => {
        const input = document.createElement('input');
        input.id = 'date';
        input.value = '2022-01-01';
        document.body.appendChild(input);

        const {element} = createDatePicker({
          layout: 'fixed-height',
          height: 360,
          'input-selector': '#date',
        });

        await waitFor(() => element.isConnected, 'element connected');

        // expect(element.attributes.getNamedItem('data-date')).equals(
        //   '2022-01-01'
        // );
      });
    });
  }
);
