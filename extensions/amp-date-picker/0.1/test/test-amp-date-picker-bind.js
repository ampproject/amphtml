import '#third_party/react-dates/bundle';
import * as fakeTimers from '@sinonjs/fake-timers';

import {createElementWithAttributes} from '#core/dom';

import {AmpDatePicker} from '../amp-date-picker';

describes.realWin(
  'amp-date-picker',
  {
    amp: {
      runtimeOn: false,
      extensions: ['amp-date-picker'],
    },
  },
  (env) => {
    let clock;
    let document;

    const DEFAULT_ATTRS = {
      layout: 'fixed-height',
      height: '360',
    };

    /**
     * @param {!JsonObject<string, string>=} opt_attrs
     * @param {!Element=} opt_parent
     * @return {{
     *   element: !Element,
     *   picker: !AmpDatePicker,
     *   buildCallback: function():!Promise,
     *   layoutCallback: function():!Promise
     * }}
     */
    function createDatePicker(opt_attrs = {}, opt_parent = document.body) {
      const attrs = {...DEFAULT_ATTRS, ...opt_attrs};
      let input = null;
      let endInput = null;
      if (attrs['mode'] === 'overlay') {
        input = document.createElement('input');
        input.id = 'date';

        if (attrs['type'] === 'range') {
          endInput = document.createElement('input');
          endInput.id = 'endDate';
          attrs['start-input-selector'] = '#date';
          attrs['end-input-selector'] = '#endDate';
        } else {
          attrs['input-selector'] = '#date';
        }
      }
      const element = createElementWithAttributes(
        document,
        'amp-date-picker',
        attrs
      );

      if (input) {
        element.appendChild(input);
      }
      if (endInput) {
        element.appendChild(endInput);
      }
      opt_parent.appendChild(element);
      const picker = new AmpDatePicker(element);

      return {
        element,
        input,
        endInput,
        picker,
        async buildCallback() {
          await picker.buildCallback();
        },
        async layoutCallback() {
          await picker.buildCallback();
          await picker.layoutCallback();
        },
      };
    }

    beforeEach(() => {
      document = env.win.document;
      // Use the global window and not env.win. There is no way to inject the
      // env.win into moment right now.
      clock = fakeTimers.withGlobal(window).install({
        now: new Date('2018-01-01T08:00:00Z'),
      });
    });

    afterEach(() => {
      clock.uninstall();
    });

    describe('bind', () => {
      it('should forward mutations to the date picker state', async () => {
        const {layoutCallback, picker} = createDatePicker({
          src: 'https://localhost:8000/examples/date-picker.json',
        });
        env.sandbox.stub(picker, 'fetchSrc_').resolves();
        const setStateSpy = env.sandbox.spy(picker, 'setState_');
        await layoutCallback();

        await picker.mutatedAttributesCallback({
          'min': '2019-01-01',
          'max': '2019-12-31',
          'src': 'https://localhost:8000/examples/date-picker-other.json',
        });

        expect(setStateSpy.getCall(0).args[0]).to.deep.equal({
          'max': '2019-12-31',
          'min': '2019-01-01',
        });
      });
    });
  }
);
