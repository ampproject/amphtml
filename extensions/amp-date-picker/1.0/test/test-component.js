import {expect} from 'chai';
import {format} from 'date-fns';
import {mount} from 'enzyme';

import * as Preact from '#preact';

import {
  DATE_FORMAT,
  getDateButton,
  isSelectedDate,
  isSelectedEndDate,
  isSelectedStartDate,
  selectDate,
} from './test-helpers';

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

      expect(isSelectedDate(wrapper, new Date(2021, 0, 1))).to.be.true;
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

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2021, 0, 2))).to.be.true;
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
            <input type="hidden" name="start-date"></input>
            <DatePicker type="range" id="delivery"></DatePicker>
          </form>
        );

        expect(
          wrapper.find(DatePicker).find('input[type="hidden"]')
        ).to.have.lengthOf(2);
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
            <input type="hidden" name="start-date"></input>
            <input type="hidden" name="end-date"></input>
            <DatePicker type="range" id="delivery"></DatePicker>
          </form>
        );

        expect(
          wrapper.find(DatePicker).find('input[type="hidden"]')
        ).to.have.lengthOf(2);
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

    it('can select a date', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={new Date(2021, 0)}
        />
      );

      selectDate(wrapper, new Date(2021, 0, 1));

      expect(isSelectedDate(wrapper, new Date(2021, 0, 1))).to.be.true;
    });

    it('sets the selected date as the input value', () => {
      const date = new Date(2021, 0, 1);
      const wrapper = mount(
        <form>
          <DatePicker
            type="single"
            mode="static"
            layout="fixed-height"
            height={360}
            initialVisibleMonth={date}
          />
        </form>
      );

      selectDate(wrapper, date);

      const input = wrapper.find('input[type="hidden"]');

      expect(input.prop('value')).to.equal('2021-01-01');
    });

    it('sets the selected date in the calendar state', () => {
      const date = new Date(2021, 0, 1);
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={date}
        />
      );

      selectDate(wrapper, date);

      const selected = wrapper.find('button[aria-pressed=true]');

      expect(selected.prop('aria-label')).to.contain(format(date, DATE_FORMAT));
    });

    it('can set the initial visible month', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={new Date(2021, 0)}
        />
      );

      expect(wrapper.text()).to.contain('January 2021');
    });
  });

  describe('showing the date picker in static mode for a date range', () => {
    it('shows the calendar view by default', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          layout="fixed-height"
          height={360}
        />
      );

      expect(wrapper.exists('[aria-label="Calendar"]')).to.be.true;
    });

    it('can select a date range', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={new Date(2021, 0)}
        />
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(wrapper, new Date(2021, 0, 2));

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2021, 0, 2))).to.be.true;
    });

    it('sets the selected date as the input value', () => {
      const wrapper = mount(
        <form>
          <DatePicker
            type="range"
            mode="static"
            layout="fixed-height"
            height={360}
            initialVisibleMonth={new Date(2021, 0)}
          />
        </form>
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(wrapper, new Date(2021, 0, 2));

      const startDateInput = wrapper.find('input[name="start-date"]');
      const endDateInput = wrapper.find('input[name="end-date"]');

      expect(startDateInput.prop('value')).to.equal('2021-01-01');
      expect(endDateInput.prop('value')).to.equal('2021-01-02');
    });

    it('sets the selected date in the calendar state', () => {
      const startDate = new Date(2021, 0, 1);
      const endDate = new Date(2021, 0, 2);
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={startDate}
        />
      );

      selectDate(wrapper, startDate);
      selectDate(wrapper, endDate);

      const selected = wrapper.find('button[aria-pressed=true]');

      expect(selected).to.have.lengthOf(2);

      expect(selected.first().prop('aria-label')).to.contain(
        format(startDate, DATE_FORMAT)
      );
      expect(selected.last().prop('aria-label')).to.contain(
        format(endDate, DATE_FORMAT)
      );
    });

    it('can set the initial visible month', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          layout="fixed-height"
          height={360}
          initialVisibleMonth={new Date(2021, 0)}
        />
      );

      expect(wrapper.text()).to.contain('January 2021');
    });
  });

  describe('showing the date picker in overlay mode for a single date', () => {
    it('throws an error if there is no inputSelector specified', () => {
      const onErrorSpy = env.sandbox.spy();
      mount(<DatePicker type="single" mode="overlay" onError={onErrorSpy} />);

      expect(onErrorSpy).to.have.been.calledWith(
        'Overlay single pickers must specify "inputSelector"'
      );
    });

    it('hides the calendar view by default', () => {
      const wrapper = mount(
        <DatePicker type="single" mode="overlay" inputSelector="[name=date]">
          <input type="text" name="date" />
        </DatePicker>
      );

      expect(wrapper.exists('[aria-label="Calendar"]')).to.be.false;
    });
  });

  describe('showing the date picker in overlay mode for a date range', () => {
    it('throws an error if there is no inputSelector specified', () => {
      const onErrorSpy = env.sandbox.spy();
      mount(<DatePicker type="range" mode="overlay" onError={onErrorSpy} />);

      expect(onErrorSpy).to.have.been.calledWith(
        `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
      );
    });

    it('hides the calendar view by default', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="overlay"
          startInputSelector="[name=start-date]"
          endInputSelector="[name=end-date]"
        >
          <input type="text" name="start-date" />
          <input type="text" name="end-date" />
        </DatePicker>
      );

      expect(wrapper.exists('[aria-label="Calendar"]')).to.be.false;
    });
  });

  describe('blocked dates for a single date picker', () => {
    it('disables blocked dates in the calendar view', () => {
      const blockedDate = new Date(2021, 0, 5);
      const formattedDate = format(blockedDate, DATE_FORMAT);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      expect(
        wrapper
          .find(`button[aria-label="Not available. ${formattedDate}"]`)
          .prop('aria-disabled')
      ).to.be.true;
    });

    it('does not allow the user to select a disabled date', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(
        wrapper,
        blockedDate,
        (date) => `Not available. ${format(date, DATE_FORMAT)}`
      );

      expect(wrapper.exists('[data-date="2021-01-05"]')).to.be.false;
    });

    it('disables dates using RFC 5545 RRULEs', () => {
      const expectedBlockedDates = [
        new Date(2022, 0, 1),
        new Date(2022, 0, 8),
        new Date(2022, 0, 15),
        new Date(2022, 0, 22),
        new Date(2022, 0, 29),
      ];
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          blocked="FREQ=WEEKLY;WKST=SU;BYDAY=SA"
        ></DatePicker>
      );

      expectedBlockedDates.forEach((date) => {
        const formattedDate = format(date, DATE_FORMAT);
        expect(
          wrapper
            .find(`button[aria-label="Not available. ${formattedDate}"]`)
            .prop('aria-disabled')
        ).to.be.true;
      });
    });

    it('disables dates using RFC 5545 RRULEs and Date objects', () => {
      const expectedBlockedDates = [
        new Date(2022, 0, 1),
        new Date(2022, 0, 2),
        new Date(2022, 0, 8),
        new Date(2022, 0, 15),
        new Date(2022, 0, 22),
        new Date(2022, 0, 29),
      ];
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={['FREQ=WEEKLY;WKST=SU;BYDAY=SA', new Date(2022, 0, 2)]}
        ></DatePicker>
      );

      expectedBlockedDates.forEach((date) => {
        const formattedDate = format(date, DATE_FORMAT);
        expect(
          wrapper
            .find(`button[aria-label="Not available. ${formattedDate}"]`)
            .prop('aria-disabled')
        ).to.be.true;
      });
    });
  });

  describe('blocked dates for a range', () => {
    it('does not allow the user to select a blocked start date', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(
        wrapper,
        blockedDate,
        (date) => `Not available. ${format(date, DATE_FORMAT)}`
      );

      expect(isSelectedStartDate(wrapper, blockedDate)).to.be.false;
    });

    it('does not allow the user to select a blocked end date', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(
        wrapper,
        blockedDate,
        (date) => `Not available. ${format(date, DATE_FORMAT)}`
      );

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, blockedDate)).to.be.false;
    });

    it('allows the user to select a range containing the blocked date if allowBlockedRanges is true', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
          allowBlockedRanges
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(wrapper, new Date(2021, 0, 6));

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2021, 0, 6))).to.be.true;
    });

    it('does not allow the user to select a range containing a blocked date by default', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(wrapper, new Date(2021, 0, 6));

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2021, 0, 6))).to.be.false;
    });

    it('allows the user to select a range containing the first blocked date if allowBlockedEndDate is true', () => {
      const blockedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2021, 0)}
          blocked={[blockedDate]}
          allowBlockedEndDate
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2021, 0, 1));
      selectDate(wrapper, new Date(2021, 0, 5));

      expect(isSelectedStartDate(wrapper, new Date(2021, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2021, 0, 5))).to.be.true;
    });
  });

  describe('highlighted dates for a single date picker', () => {
    it('shows a highlighted attribute', () => {
      const highlightedDate = new Date(2021, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2021, 0)}
          highlighted={[highlightedDate]}
        ></DatePicker>
      );

      expect(getDateButton(wrapper, highlightedDate).prop('data-highlighted'))
        .to.be.true;
    });

    it('highlights dates using RFC 5545 RRULEs', () => {
      const expectedHighlightedDates = [
        new Date(2022, 0, 1),
        new Date(2022, 0, 8),
        new Date(2022, 0, 15),
        new Date(2022, 0, 22),
        new Date(2022, 0, 29),
      ];
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          highlighted="FREQ=WEEKLY;WKST=SU;BYDAY=SA"
        ></DatePicker>
      );

      expectedHighlightedDates.forEach((date) => {
        expect(getDateButton(wrapper, date).prop('data-highlighted')).to.be
          .true;
      });
    });
  });

  xdescribe('limiting the available days', () => {
    it('disables all days before the min if a min is specified', () => {
      const expectedDisbledDates = [
        new Date(2022, 0, 1),
        new Date(2022, 0, 2),
        new Date(2022, 0, 3),
        new Date(2022, 0, 4),
      ];
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          min={new Date(2022, 0, 5)}
        />
      );
      expectedDisbledDates.forEach((date) => {
        const formattedDate = format(date, DATE_FORMAT);
        expect(
          wrapper
            .find(`button[aria-label="Not available. ${formattedDate}"]`)
            .prop('aria-disabled')
        ).to.be.true;
      });
    });
  });
});
