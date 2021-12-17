import {expect} from 'chai';
import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoDatePicker} from '../component';

const DEFAULT_PROPS = {
  layout: 'fixed-height',
  height: 360,
};

function DatePicker(props = {}) {
  const combinedProps = {...DEFAULT_PROPS, ...props};
  return <BentoDatePicker {...combinedProps}></BentoDatePicker>;
}

describes.sandboxed('BentoDatePicker preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<DatePicker />);

    const component = wrapper.find(BentoDatePicker.name);
    expect(component).to.have.lengthOf(1);
  });

  describe('initial dates', () => {
    it('should use the value of a single input at load-time', () => {
      const wrapper = mount(
        <DatePicker inputSelector="#date">
          <input type="text" id="date" value="2021-01-01" />
        </DatePicker>
      );

      expect(wrapper.exists('[data-date="2021-01-01"]')).to.be.true;
    });

    it('should use the value of a range input at load-time', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          startInputSelector="#startdate"
          endInputSelector="#enddate"
        >
          <input type="text" id="startdate" value="2021-01-01" />
          <input type="text" id="enddate" value="2021-01-02" />
        </DatePicker>
      );

      expect(wrapper.exists('[data-startdate="2021-01-01"]')).to.be.true;
      expect(wrapper.exists('[data-enddate="2021-01-02"]')).to.be.true;
    });
  });

  describe('hidden inputs in single date picker', () => {
    it('should not create hidden inputs outside of forms', () => {
      const wrapper = mount(<DatePicker></DatePicker>);

      expect(wrapper.exists('input[type="hidden"]')).to.be.false;
    });

    it('should create a hidden input when inside a form', () => {
      const wrapper = mount(
        <form>
          <DatePicker></DatePicker>
        </form>
      );

      expect(wrapper.exists('input[type="hidden"]')).to.be.true;
      expect(wrapper.find('input[type="hidden"]').prop('name')).to.equal(
        'date'
      );
    });

    it('should name the input `${id}-date` when another #date input exists', () => {
      const wrapper = mount(
        <form>
          <DatePicker id="delivery">
            <input type="hidden" name="date"></input>
          </DatePicker>
        </form>
      );

      expect(wrapper.exists('input[name="delivery-date"]')).to.be.true;
    });

    it('should error if another #date input exists and the picker has no ID', () => {
      const onErrorSpy = env.sandbox.spy();
      mount(
        <form>
          <DatePicker onError={onErrorSpy}>
            <input type="hidden" name="date"></input>
          </DatePicker>
        </form>
      );

      expect(onErrorSpy).to.have.been.calledWith(
        'Multiple date-pickers with implicit BentoDatePicker fields need to have IDs'
      );
    });
  });

  describe('hidden inputs in range date picker in forms', () => {
    it('should not create hidden inputs outside of forms', () => {
      const wrapper = mount(<DatePicker type="range"></DatePicker>);

      expect(wrapper.exists('input[type="hidden"]')).to.be.false;
    });

    it('should create a hidden input when inside a form', () => {
      const wrapper = mount(
        <form>
          <DatePicker type="range"></DatePicker>
        </form>
      );

      const inputs = wrapper.find('input[type="hidden"]');

      expect(inputs.length).to.equal(2);
      expect(inputs.first().prop('name')).to.equal('start-date');
      expect(inputs.last().prop('name')).to.equal('end-date');
    });

    it(
      'should name an input `${id}-(start|end)-date` when another ' +
        '#(start|end)-date input exists',
      () => {
        const wrapper = mount(
          <form>
            <DatePicker type="range" id="delivery">
              <input type="hidden" name="start-date"></input>
            </DatePicker>
          </form>
        );

        expect(wrapper.find('input[type="hidden"]')).to.have.lengthOf(2);
        expect(wrapper.exists('input[name="delivery-start-date"]')).to.be.true;
        expect(wrapper.exists('input[name="end-date"]')).to.be.true;
      }
    );

    it(
      'should name both inputs `${id}-(start|end)-date` when other ' +
        '#start-date and #end-date inputs exists',
      () => {
        const wrapper = mount(
          <form>
            <DatePicker type="range" id="delivery">
              <input type="hidden" name="start-date"></input>
              <input type="hidden" name="end-date"></input>
            </DatePicker>
          </form>
        );

        expect(wrapper.find('input[type="hidden"]')).to.have.lengthOf(2);
        expect(wrapper.exists('input[name="delivery-start-date"]')).to.be.true;
        expect(wrapper.exists('input[name="delivery-end-date"]')).to.be.true;
      }
    );
  });

  describe('showing the date picker in static mode for a single date', () => {
    it('shows the calendar view by default', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          layout="fixed-height"
          height={360}
        />
      );

      expect(wrapper.exists('[aria-label="Calendar"]')).to.be.true;
    });
  });
});
