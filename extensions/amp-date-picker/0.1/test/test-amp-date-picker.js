import '#third_party/react-dates/bundle';
import * as fakeTimers from '@sinonjs/fake-timers';

import {createElementWithAttributes} from '#core/dom';

import {requireExternal} from '../../../../src/module';
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
    const moment = requireExternal('moment');
    let clock;
    let win;
    let document;

    const templateJson = `{
    "templates": [{
      "id": "srcTemplate",
      "dates": [
        "2018-01-01",
        "FREQ=WEEKLY;DTSTART=20180101T080000Z;WKST=SU;BYDAY=WE"
      ]
    }, {
      "id": "defaultTemplate"
    }]
  }`;

    const DEFAULT_ATTRS = {
      layout: 'fixed-height',
      height: '360',
    };

    function createDatePicker(opt_attrs, opt_parent = document.body) {
      const attrs = {...DEFAULT_ATTRS, ...opt_attrs};
      const element = createElementWithAttributes(
        document,
        'amp-date-picker',
        attrs
      );

      opt_parent.appendChild(element);
      const picker = new AmpDatePicker(element);

      return {
        element,
        picker,
        buildCallback() {
          return Promise.resolve(picker.buildCallback());
        },
        layoutCallback() {
          return Promise.resolve(picker.buildCallback()).then(() =>
            picker.layoutCallback()
          );
        },
      };
    }

    /**
     * Create a template element
     * @param {string} body
     */
    function createTemplate(body) {
      const template = document.createElement('template');
      template.setAttribute('type', 'amp-mustache');
      template.content.appendChild(document.createTextNode(body));
      return template;
    }

    const DEFAULT_TEMPLATE_ATTRS = {
      'date-template': '',
    };

    /**
     * Create a template from a body and attributes
     * @param {string} body
     * @param {!{[key: string]: string}=} opt_attrs
     */
    function createDateTemplate(body, opt_attrs) {
      const template = createTemplate(body);
      const attrs = {...DEFAULT_TEMPLATE_ATTRS, ...opt_attrs};
      for (const key in attrs) {
        template.setAttribute(key, attrs[key]);
      }
      return template;
    }

    beforeEach(() => {
      win = env.win;
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

    it('should render in the simplest case', () => {
      const {layoutCallback, picker} = createDatePicker({
        layout: 'fixed-height',
        height: 360,
      });

      return layoutCallback().then(() => {
        const container = picker.container_;
        expect(container.children.length).to.be.greaterThan(0);
      });
    });

    describe('initial dates', () => {
      it('should use the value of a single input at load-time', () => {
        const input = document.createElement('input');
        input.id = 'date';
        input.value = '2018-01-01';
        document.body.appendChild(input);

        const {buildCallback, picker} = createDatePicker({
          'layout': 'fixed-height',
          'height': '360',
          'input-selector': '#date',
        });

        return buildCallback().then(() => {
          expect(picker.state_.date.isSame('2018-01-01')).to.be.true;
        });
      });

      it('should use the value of a range input at load-time', () => {
        const startInput = document.createElement('input');
        startInput.id = 'startdate';
        startInput.value = '2018-01-01';
        document.body.appendChild(startInput);

        const endInput = document.createElement('input');
        endInput.id = 'enddate';
        endInput.value = '2018-01-02';
        document.body.appendChild(endInput);

        const {buildCallback, picker} = createDatePicker({
          'layout': 'fixed-height',
          'height': '360',
          'type': 'range',
          'start-input-selector': '#startdate',
          'end-input-selector': '#enddate',
        });

        return buildCallback().then(() => {
          expect(picker.state_.startDate.isSame('2018-01-01')).to.be.true;
          expect(picker.state_.endDate.isSame('2018-01-02')).to.be.true;
        });
      });

      it('should use the "date" value from src data', () => {
        const {layoutCallback, picker} = createDatePicker({
          'layout': 'fixed-height',
          'height': '360',
        });
        env.sandbox.stub(picker, 'fetchSrc_').resolves({'date': '2018-01-01'});

        return layoutCallback().then(() => {
          expect(picker.state_.date.isSame('2018-01-01')).to.be.true;
        });
      });

      it('should use the "startDate" and "endDate" values from src data', () => {
        const {layoutCallback, picker} = createDatePicker({
          'layout': 'fixed-height',
          'height': '360',
          'type': 'range',
        });
        env.sandbox.stub(picker, 'fetchSrc_').resolves({
          'startDate': '2018-01-01',
          'endDate': '2018-01-02',
        });

        return layoutCallback().then(() => {
          expect(picker.state_.startDate.isSame('2018-01-01')).to.be.true;
          expect(picker.state_.endDate.isSame('2018-01-02')).to.be.true;
        });
      });
    });

    describe('getFormattedDate_', () => {
      it('should render dates in the default format', () => {
        const {picker} = createDatePicker({locale: 'en'});
        const date = moment();
        const formattedDate = picker.getFormattedDate_(date);
        expect(formattedDate).to.equal('2018-01-01');
      });

      it('should always render Unix epoch seconds in english digits', () => {
        const {picker} = createDatePicker({locale: 'en', format: 'X'});
        const date = moment();
        return picker.buildCallback().then(() => {
          const formattedDate = picker.getFormattedDate_(date);
          expect(formattedDate).to.equal('1514793600');
        });
      });

      it('should always render Unix epoch millis in english digits', () => {
        const {picker} = createDatePicker({locale: 'en', format: 'x'});
        const date = moment();
        return picker.buildCallback().then(() => {
          const formattedDate = picker.getFormattedDate_(date);
          expect(formattedDate).to.equal('1514793600000');
        });
      });
    });

    describe('templates', () => {
      describe('element templates', () => {
        it('should parse RRule and date templates', () => {
          const template = createDateTemplate('{{template}}', {
            dates: '2018-01-01',
          });
          const {picker} = createDatePicker();
          const results = picker.parseElementTemplates_([template]);
          expect(results[0].dates.contains('2018-01-01')).to.be.true;
          expect(results[0].dates.contains('2018-01-02')).to.be.false;
          expect(results[0].template).to.equal(template);
        });
      });

      describe('src templates', () => {
        it('should parse RRULE and date templates', function () {
          this.timeout(4000);
          const template = createDateTemplate('{{val}}', {
            dates: '2018-01-01',
            id: 'srcTemplate',
          });
          const defaultTemplate = createDateTemplate('{{val}}', {
            id: 'defaultTemplate',
          });
          const {element, picker} = createDatePicker();
          element.appendChild(template);
          element.appendChild(defaultTemplate);

          const {srcDefaultTemplate, srcTemplates} = picker.parseSrcTemplates_(
            win.JSON.parse(templateJson)
          );
          expect(srcTemplates[0].dates.contains('2018-01-01')).to.be.true;
          expect(srcTemplates[0].dates.contains('2018-01-02')).to.be.false;
          expect(srcTemplates[0].dates.contains('2018-01-03')).to.be.true;
          expect(srcTemplates[0].template).to.equal(template);
          expect(srcDefaultTemplate).to.equal(defaultTemplate);
        });
      });

      describe('hidden inputs in single date picker in forms', () => {
        it('should not create hidden inputs outside of forms', () => {
          const {element} = createDatePicker();

          expect(element.querySelector('input[type="hidden"]')).to.be.null;
        });

        it('should create a hidden input when inside a form', () => {
          const form = document.createElement('form');
          document.body.appendChild(form);
          const {element, layoutCallback} = createDatePicker({}, form);

          return layoutCallback().then(() => {
            const input = element.querySelector('input[type="hidden"]');
            expect(input).to.not.be.null;
            expect(input.name).to.equal('date');
          });
        });

        it(
          'should name the input `${id}-date` when another ' +
            '#date input exists',
          () => {
            const form = document.createElement('form');
            const dateInput = document.createElement('input');
            dateInput.type = 'hidden';
            dateInput.name = 'date';
            form.appendChild(dateInput);
            document.body.appendChild(form);
            const {element, layoutCallback} = createDatePicker(
              {id: 'delivery'},
              form
            );

            return layoutCallback().then(() => {
              const input = element.querySelector('input[type="hidden"]');
              expect(input).to.not.be.null;
              expect(input.name).to.equal('delivery-date');
            });
          }
        );

        it(
          'should error if the input when another ' +
            '#date input exists and the picker has no ID',
          () => {
            const form = document.createElement('form');
            const dateInput = document.createElement('input');
            dateInput.type = 'hidden';
            dateInput.name = 'date';
            form.appendChild(dateInput);
            document.body.appendChild(form);

            const {layoutCallback} = createDatePicker({}, form);

            allowConsoleError(() => {
              expect(layoutCallback()).to.be.rejectedWith(
                'another #date input exists'
              );
            });
          }
        );
      });

      describe('hidden inputs in range date picker in forms', () => {
        it('should not create hidden inputs outside of forms', () => {
          const {element} = createDatePicker({type: 'range'});

          expect(element.querySelector('input[type="hidden"]')).to.be.null;
        });

        it('should create a hidden input when inside a form', () => {
          const form = document.createElement('form');
          document.body.appendChild(form);
          const {element, layoutCallback} = createDatePicker(
            {type: 'range'},
            form
          );

          return layoutCallback().then(() => {
            const inputs = element.querySelectorAll('input[type="hidden"]');
            expect(inputs.length).to.equal(2);
            expect(inputs[0].name).to.equal('start-date');
            expect(inputs[1].name).to.equal('end-date');
          });
        });

        it(
          'should name an input `${id}-(start|end)-date` when another ' +
            '#(start|end)-date input exists',
          () => {
            const form = document.createElement('form');
            const startDateInput = document.createElement('input');
            startDateInput.type = 'hidden';
            startDateInput.name = 'start-date';
            form.appendChild(startDateInput);
            document.body.appendChild(form);
            const {element, layoutCallback} = createDatePicker(
              {type: 'range', id: 'delivery'},
              form
            );

            return layoutCallback().then(() => {
              const inputs = element.querySelectorAll('input[type="hidden"]');
              expect(inputs.length).to.equal(2);
              expect(inputs[0].name).to.equal('delivery-start-date');
              expect(inputs[1].name).to.equal('end-date');
            });
          }
        );

        it(
          'should name both inputs `${id}-(start|end)-date` when other ' +
            '#start-date and #end-date inputs exists',
          () => {
            const form = document.createElement('form');
            const startDateInput = document.createElement('input');
            startDateInput.type = 'hidden';
            startDateInput.name = 'start-date';
            form.appendChild(startDateInput);
            const endDateInput = document.createElement('input');
            endDateInput.type = 'hidden';
            endDateInput.name = 'end-date';
            form.appendChild(endDateInput);
            document.body.appendChild(form);
            const {element, layoutCallback} = createDatePicker(
              {type: 'range', id: 'delivery'},
              form
            );

            return layoutCallback().then(() => {
              const inputs = element.querySelectorAll('input[type="hidden"]');
              expect(inputs.length).to.equal(2);
              expect(inputs[0].name).to.equal('delivery-start-date');
              expect(inputs[1].name).to.equal('delivery-end-date');
            });
          }
        );

        it(
          'should error if the input when another ' +
            '#date input exists and the picker has no ID',
          () => {
            const form = document.createElement('form');
            const dateInput = document.createElement('input');
            dateInput.type = 'hidden';
            dateInput.name = 'start-date';
            form.appendChild(dateInput);
            document.body.appendChild(form);

            const {layoutCallback} = createDatePicker({type: 'range'}, form);

            allowConsoleError(() => {
              expect(layoutCallback()).to.be.rejectedWith(
                'another #start-date input exists'
              );
            });
          }
        );
      });

      describe('src attribute', () => {
        it('should set highlighted and blocked dates', () => {
          const {picker} = createDatePicker({
            src: 'http://localhost:9876/date-picker/src-data/get',
          });

          env.sandbox.stub(picker, 'fetchSrc_').resolves({
            blocked: ['2018-01-03'],
            highlighted: ['2018-01-04'],
          });

          return picker.setupSrcAttributes_().then(() => {
            expect(picker.blocked_.contains('2018-01-03')).to.be.true;
            expect(picker.highlighted_.contains('2018-01-04')).to.be.true;
          });
        });
      });

      describe('changing dates', () => {
        it('should set the date in a single date picker', async () => {
          const {element, layoutCallback, picker} = createDatePicker();
          await layoutCallback();

          picker.onDateChange(moment('2018-01-03'));

          expect(element.getAttribute('date')).to.equal('2018-01-03');
        });

        it('should set date range in a date range picker', async () => {
          const {element, layoutCallback, picker} = createDatePicker({
            'blocked': '2018-01-06',
          });
          await layoutCallback();

          picker.onDatesChange({
            'startDate': moment('2018-01-03'),
            'endDate': moment('2018-01-05'),
          });

          expect(element.getAttribute('start-date')).to.equal('2018-01-03');
          expect(element.getAttribute('end-date')).to.equal('2018-01-05');
        });
      });

      describe('iterateDataRange', () => {
        it('should not iterate for an end date before start date ', () => {
          const {picker} = createDatePicker();
          const spy = env.sandbox.spy();

          picker.iterateDateRange_(
            moment('2018-01-03'),
            moment('2018-01-01'),
            spy
          );

          expect(spy).to.not.have.been.called;
        });

        it('should handle both dates being the same', () => {
          const {picker} = createDatePicker();
          const spy = env.sandbox.spy();

          picker.iterateDateRange_(
            moment('2018-01-01'),
            moment('2018-01-01'),
            spy
          );

          expect(spy).to.have.been.calledOnce;
          const date = spy.getCall(0).args[0];
          expect(date.isSame('2018-01-01')).to.be.true;
        });

        it('should handle a null end date as both dates being the same', () => {
          const {picker} = createDatePicker();
          const spy = env.sandbox.spy();

          picker.iterateDateRange_(moment('2018-01-01'), null, spy);

          expect(spy).to.have.been.calledOnce;
          const date = spy.getCall(0).args[0];
          expect(date.isSame('2018-01-01')).to.be.true;
        });

        it('should handle both dates being different', () => {
          const {picker} = createDatePicker();
          const spy = env.sandbox.spy();

          picker.iterateDateRange_(
            moment('2018-01-01'),
            moment('2018-01-07'),
            spy
          );

          expect(spy.callCount).to.equal(7);
          let date = spy.getCall(0).args[0];
          expect(date.isSame('2018-01-01')).to.be.true;
          date = spy.getCall(1).args[0];
          expect(date.isSame('2018-01-02')).to.be.true;
          date = spy.getCall(2).args[0];
          expect(date.isSame('2018-01-03')).to.be.true;
          date = spy.getCall(3).args[0];
          expect(date.isSame('2018-01-04')).to.be.true;
          date = spy.getCall(4).args[0];
          expect(date.isSame('2018-01-05')).to.be.true;
          date = spy.getCall(5).args[0];
          expect(date.isSame('2018-01-06')).to.be.true;
          date = spy.getCall(6).args[0];
          expect(date.isSame('2018-01-07')).to.be.true;
        });
      });

      describe('touch keyboard suppression', () => {
        it(
          'should add and remove the readonly property on focus' +
            ' for touch devices',
          () => {
            const {element, picker} = createDatePicker({
              'mode': 'overlay',
              'input-selector': '#date',
            });
            const input = document.createElement('input');
            input.id = 'date';
            element.appendChild(input);
            env.sandbox.stub(picker.input_, 'isTouchDetected').returns(true);

            return picker
              .buildCallback()
              .then(() => {
                expect(input).to.have.attribute('data-i-amphtml-readonly');
                return picker.layoutCallback();
              })
              .then(() => {
                const fakeEvent = {target: input};
                picker.addTouchReadonly_(fakeEvent);
                expect(input.readOnly).to.be.true;
                picker.removeTouchReadonly_(fakeEvent);
                expect(input.readOnly).to.be.false;
              });
          }
        );

        it('should not add and remove the readonly property on desktop', () => {
          const {element, picker} = createDatePicker({
            'mode': 'overlay',
            'input-selector': '#date',
          });
          const input = document.createElement('input');
          input.id = 'date';
          element.appendChild(input);
          env.sandbox.stub(picker.input_, 'isTouchDetected').returns(false);

          return picker
            .buildCallback()
            .then(() => {
              expect(input).to.not.have.attribute('data-i-amphtml-readonly');
              return picker.layoutCallback();
            })
            .then(() => {
              const fakeEvent = {target: input};
              picker.addTouchReadonly_(fakeEvent);
              expect(input.readOnly).to.be.false;
              picker.removeTouchReadonly_(fakeEvent);
              expect(input.readOnly).to.be.false;
            });
        });
      });
    });
  }
);
