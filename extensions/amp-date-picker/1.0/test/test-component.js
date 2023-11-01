import {expect} from 'chai';
import {format} from 'date-fns';
import {mount} from 'enzyme';
import {RRule} from 'rrule';

import * as Preact from '#preact';

import {
  DATE_FORMAT,
  getDateButton,
  isCalendarVisible,
  isSelectedDate,
  isSelectedEndDate,
  isSelectedStartDate,
  selectDate,
} from './test-helpers';

import {BentoDatePicker} from '../component/component';

const TODAY = new Date(2022, 0);

const DEFAULT_PROPS = {
  mode: 'static',
  layout: 'fixed-height',
  height: 360,
  today: TODAY,
};

function DatePicker(props) {
  const combinedProps = {...DEFAULT_PROPS, ...props};
  return <BentoDatePicker {...combinedProps}></BentoDatePicker>;
}

// TODO(wg-components): either fix or remove these tests.
describes.sandboxed.skip('BentoDatePicker preact component v1.0', {}, (env) => {
  it('should render', () => {
    const wrapper = mount(<DatePicker />);

    const component = wrapper.find(BentoDatePicker);
    expect(component).to.have.lengthOf(1);
  });

  describe('initial dates', () => {
    it('should use the value of a single input at load-time', () => {
      const wrapper = mount(
        <DatePicker inputSelector="#date">
          <input type="text" id="date" value="2022-01-01" />
        </DatePicker>
      );

      expect(isSelectedDate(wrapper, new Date(2022, 0, 1))).to.be.true;
    });

    it('should use the value of a range input at load-time', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          startInputSelector="#startdate"
          endInputSelector="#enddate"
        >
          <input type="text" id="startdate" value="2022-01-01" />
          <input type="text" id="enddate" value="2022-01-02" />
        </DatePicker>
      );

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 2))).to.be.true;
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

      wrapper.update();

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
      const wrapper = mount(<DatePicker type="single" />);

      expect(isCalendarVisible(wrapper)).to.be.true;
    });

    it('can select a date', () => {
      const wrapper = mount(<DatePicker type="single" />);

      selectDate(wrapper, new Date(2022, 0, 1));

      expect(isSelectedDate(wrapper, new Date(2022, 0, 1))).to.be.true;
    });

    it('sets the selected date as the input value', () => {
      const date = new Date(2022, 0, 1);
      const wrapper = mount(
        <form>
          <DatePicker type="single" mode="static" initialVisibleMonth={date} />
        </form>
      );

      selectDate(wrapper, date);

      const input = wrapper.find('input[type="hidden"]');

      expect(input.getDOMNode().value).to.equal('2022-01-01');
    });

    it('sets the selected date in the calendar state', () => {
      const date = new Date(2022, 0, 1);
      const wrapper = mount(
        <DatePicker type="single" mode="static" initialVisibleMonth={date} />
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
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      expect(wrapper.text()).to.contain('January 2022');
    });

    it('can advance to the next month', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      wrapper.find('button[aria-label="Go to next month"]').simulate('click');

      expect(wrapper.text()).to.contain('February 2022');
    });

    it('can go back to the previous month', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      wrapper
        .find('button[aria-label="Go to previous month"]')
        .simulate('click');

      expect(wrapper.text()).to.contain('December 2021');
    });

    it('allows the user to configure the number of months', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          numberOfMonths={2}
        />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'January 2022'
      );
      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'February 2022'
      );
    });
  });

  describe('showing the date picker in static mode for a date range', () => {
    it('shows the calendar view by default', () => {
      const wrapper = mount(<DatePicker type="range" mode="static" />);

      expect(isCalendarVisible(wrapper)).to.be.true;
    });

    it('can select a date range', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 2));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 2))).to.be.true;
    });

    it('sets the selected date as the input value', () => {
      const wrapper = mount(
        <form>
          <DatePicker
            type="range"
            mode="static"
            initialVisibleMonth={new Date(2022, 0)}
          />
        </form>
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 2));

      const startDateInput = wrapper.find('input[name="start-date"]');
      const endDateInput = wrapper.find('input[name="end-date"]');

      expect(startDateInput.getDOMNode().value).to.equal('2022-01-01');
      expect(endDateInput.getDOMNode().value).to.equal('2022-01-02');
    });

    it('sets the selected date in the calendar state', () => {
      const startDate = new Date(2022, 0, 1);
      const endDate = new Date(2022, 0, 2);
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
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
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      expect(wrapper.text()).to.contain('January 2022');
    });

    it('allows the user to configure the number of months', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          numberOfMonths={2}
        />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'January 2022'
      );
      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'February 2022'
      );
    });

    it('remains visible after the user has selected dates', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
        />
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 2));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 2))).to.be.true;

      expect(isCalendarVisible(wrapper)).to.be.true;
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

      expect(isCalendarVisible(wrapper)).to.be.false;
    });

    it('shows the calendar on input focus', () => {
      const wrapper = mount(
        <DatePicker type="single" mode="overlay" inputSelector="[name=date]">
          <input type="text" name="date" />
        </DatePicker>
      );

      wrapper.find('input[name="date"]').simulate('focus');

      expect(isCalendarVisible(wrapper)).to.be.true;
    });

    it('closes the calendar after a date has been selected by default', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="overlay"
          inputSelector="[name=date]"
          initialVisibleMonth={new Date(2022, 0)}
        >
          <input type="text" name="date" />
        </DatePicker>
      );

      wrapper.find('input[name="date"]').simulate('focus');
      selectDate(wrapper, new Date(2022, 0, 27));

      expect(isCalendarVisible(wrapper)).to.be.false;
    });

    it('leaves the calendar open after a date has been selected if openAfterSelect is true', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          mode="overlay"
          inputSelector="[name=date]"
          initialVisibleMonth={new Date(2022, 0)}
          openAfterSelect
        >
          <input type="text" name="date" />
        </DatePicker>
      );

      wrapper.find('input[name="date"]').simulate('focus');
      selectDate(wrapper, new Date(2022, 0, 27));

      expect(isCalendarVisible(wrapper)).to.be.true;
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

      expect(isCalendarVisible(wrapper)).to.be.false;
    });

    it('shows the calendar on input focus', () => {
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

      wrapper.find('input[name="start-date"]').simulate('focus');

      expect(isCalendarVisible(wrapper)).to.be.true;
    });

    it('closes the calendar after a date has been selected by default', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="overlay"
          startInputSelector="[name=start-date]"
          endInputSelector="[name=end-date]"
          initialVisibleMonth={new Date(2022, 0)}
        >
          <input type="text" name="start-date" />
          <input type="text" name="end-date" />
        </DatePicker>
      );

      wrapper.find('input[name="start-date"]').simulate('focus');
      selectDate(wrapper, new Date(2022, 0, 27));

      expect(isCalendarVisible(wrapper)).to.be.true;

      selectDate(wrapper, new Date(2022, 0, 28));

      expect(isCalendarVisible(wrapper)).to.be.false;
    });

    it('leaves the calendar open after a date has been selected if openAfterSelect is true', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="overlay"
          startInputSelector="[name=start-date]"
          endInputSelector="[name=end-date]"
          initialVisibleMonth={new Date(2022, 0)}
          openAfterSelect
        >
          <input type="text" name="start-date" />
          <input type="text" name="end-date" />
        </DatePicker>
      );

      wrapper.find('input[name="start-date"]').simulate('focus');
      selectDate(wrapper, new Date(2022, 0, 27));
      selectDate(wrapper, new Date(2022, 0, 28));

      expect(isCalendarVisible(wrapper)).to.be.true;
    });
  });

  describe('blocked dates for a single date picker', () => {
    it('disables blocked dates in the calendar view', () => {
      const blockedDate = new Date(2022, 0, 5);
      const formattedDate = format(blockedDate, DATE_FORMAT);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
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
      const blockedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(
        wrapper,
        blockedDate,
        (date) => `Not available. ${format(date, DATE_FORMAT)}`
      );

      expect(wrapper.exists('[data-date="2022-01-05"]')).to.be.false;
    });

    it('disables dates using RFC 5545 RRULEs', () => {
      const rrule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.SA,
        dtstart: new Date(2022, 0),
      });
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
          blocked={[rrule.toString()]}
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
      const rrule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.SA,
        dtstart: new Date(2022, 0),
      });
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
          blocked={[rrule.toString(), new Date(2022, 0, 2)]}
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
      const blockedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
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
      const blockedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={[blockedDate]}
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(
        wrapper,
        blockedDate,
        (date) => `Not available. ${format(date, DATE_FORMAT)}`
      );

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, blockedDate)).to.be.false;
    });

    it('allows the user to select a range containing the blocked date if allowBlockedRanges is true', () => {
      const blockedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={[blockedDate]}
          allowBlockedRanges
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 6));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 6))).to.be.true;
    });

    it('does not allow the user to select a range containing a blocked date by default', () => {
      const blockedDates = [new Date(2022, 0, 5), new Date(2022, 0, 4)];
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={blockedDates}
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 6));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 6))).to.be.false;
    });

    it('allows the user to select a range containing the first blocked date if allowBlockedEndDate is true', () => {
      const blockedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          blocked={[blockedDate]}
          allowBlockedEndDate
        ></DatePicker>
      );

      selectDate(wrapper, new Date(2022, 0, 1));
      selectDate(wrapper, new Date(2022, 0, 5));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 5))).to.be.true;
    });
  });

  describe('highlighted dates for a single date picker', () => {
    it('shows a highlighted attribute', () => {
      const highlightedDate = new Date(2022, 0, 5);
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          highlighted={[highlightedDate]}
        ></DatePicker>
      );

      expect(getDateButton(wrapper, highlightedDate).prop('data-highlighted'))
        .to.be.true;
    });

    it('highlights dates using RFC 5545 RRULEs', () => {
      const rrule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: RRule.SA,
        dtstart: new Date(2022, 0),
      });
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
          highlighted={[rrule.toString()]}
        ></DatePicker>
      );

      expectedHighlightedDates.forEach((date) => {
        expect(getDateButton(wrapper, date).prop('data-highlighted')).to.be
          .true;
      });
    });
  });

  describe('limiting the available days for a single date picker', () => {
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

    it("defaults the min to today's date if no min is specified", () => {
      const expectedDisbledDates = [new Date(2022, 0, 1), new Date(2022, 0, 2)];
      const wrapper = mount(
        <DatePicker type="single" today={new Date(2022, 0, 3)} />
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

    it('disables all days after the max if the max is specified', () => {
      const expectedDisbledDates = [
        new Date(2022, 0, 28),
        new Date(2022, 0, 29),
        new Date(2022, 0, 30),
        new Date(2022, 0, 31),
      ];
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          max={new Date(2022, 0, 27)}
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

  describe('limiting the available days for a date range picker', () => {
    it('disables all days before the min if a min is specified', () => {
      const expectedDisbledDates = [
        new Date(2022, 0, 1),
        new Date(2022, 0, 2),
        new Date(2022, 0, 3),
        new Date(2022, 0, 4),
      ];
      const wrapper = mount(
        <DatePicker
          type="range"
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

    it("defaults the min today's date if no min is specified", () => {
      const expectedDisbledDates = [new Date(2022, 0, 1), new Date(2022, 0, 2)];
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          today={new Date(2022, 0, 3)}
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

    it('disables all days after the max if the max is specified', () => {
      const expectedDisbledDates = [
        new Date(2022, 0, 28),
        new Date(2022, 0, 29),
        new Date(2022, 0, 30),
        new Date(2022, 0, 31),
      ];
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          max={new Date(2022, 0, 27)}
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

    it('blocks all subsequent dates if maximum nights is specified', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
          maximumNights={1}
          startInputSelector="[name=startdate]"
        >
          <input type="text" name="startdate" value="2022-01-01"></input>
          <input type="text" name="enddate"></input>
        </DatePicker>
      );

      // TODO: This label should start with Not Available
      selectDate(wrapper, new Date(2022, 0, 3));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 3))).to.be.false;
    });

    it('does not allow the user to select an end date that is before the minimumNights threshhold', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          mode="static"
          initialVisibleMonth={new Date(2022, 0)}
          minimumNights={2}
          startInputSelector="[name=startdate]"
        >
          <input type="text" name="startdate" value="2022-01-01"></input>
          <input type="text" name="enddate"></input>
        </DatePicker>
      );

      // TODO: This label should start with Not Available
      selectDate(wrapper, new Date(2022, 0, 2));

      expect(isSelectedStartDate(wrapper, new Date(2022, 0, 1))).to.be.true;
      expect(isSelectedEndDate(wrapper, new Date(2022, 0, 2))).to.be.false;
    });
  });

  describe('date formatting for a single day picker', () => {
    it('defaults to MMMM YYYY month format', () => {
      const wrapper = mount(
        <DatePicker type="single" initialVisibleMonth={new Date(2022, 0)} />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'January 2022'
      );
    });

    it('allows the user to specify the month format', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          monthFormat="MMM yy"
        />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'Jan 22'
      );
    });

    it('defaults to showing the first character of the weekday', () => {
      const wrapper = mount(
        <DatePicker type="single" initialVisibleMonth={new Date(2022, 0)} />
      );

      // TODO: is there a better way to target this?
      expect(
        wrapper
          .find('thead')
          .find('th')
          .first()
          .find('[aria-hidden=true]')
          .text()
      ).to.equal('S');
    });

    it('allows the user to specify a weekday format', () => {
      const wrapper = mount(
        <DatePicker
          type="single"
          initialVisibleMonth={new Date(2022, 0)}
          weekDayFormat="EEEEEE"
        />
      );

      // TODO: is there a better way to target this?
      expect(
        wrapper
          .find('thead')
          .find('th')
          .first()
          .find('[aria-hidden=true]')
          .text()
      ).to.equal('Su');
    });
  });

  describe('date formatting for a date range picker', () => {
    it('defaults to MMMM YYYY month format', () => {
      const wrapper = mount(
        <DatePicker type="range" initialVisibleMonth={new Date(2022, 0)} />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'January 2022'
      );
    });

    it('allows the user to specify the month format', () => {
      const wrapper = mount(
        <DatePicker
          type="range"
          initialVisibleMonth={new Date(2022, 0)}
          monthFormat="MMM yy"
        />
      );

      expect(wrapper.find('[aria-label="Calendar"]').last().text()).to.contain(
        'Jan 22'
      );
    });
  });

  describe('imperative api', () => {
    let ref;
    let wrapper;

    describe('single date picker', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <BentoDatePicker
            ref={ref}
            initialVisibleMonth={new Date(2022, 0)}
            inputSelector="[name=date]"
            today={new Date(2022, 0, 21)}
          >
            <input name="date" value="2022-01-01" />
          </BentoDatePicker>
        );
      });

      it('can clear the date for a single date picker', () => {
        ref.current.clear();
        wrapper.update();

        expect(wrapper.exists('[data-date="2022-01-01"]')).to.be.false;
        expect(wrapper.find('input').getDOMNode().value).to.equal('');
      });

      it('reopens the picker if openAfterClear is true', () => {
        wrapper = mount(
          <BentoDatePicker
            ref={ref}
            initialVisibleMonth={new Date(2022, 0)}
            inputSelector="[name=date]"
            mode="overlay"
            openAfterClear
          >
            <input name="date" value="2022-01-01" />
          </BentoDatePicker>
        );

        expect(isCalendarVisible(wrapper)).to.be.false;

        ref.current.clear();
        wrapper.update();

        expect(isCalendarVisible(wrapper)).to.be.true;
      });

      it('can set the date', () => {
        ref.current.setDate(new Date(2022, 0, 21));
        wrapper.update();

        expect(wrapper.exists('[data-date="2022-01-21"]')).to.be.true;
        expect(wrapper.find('input').getDOMNode().value).to.equal('2022-01-21');
      });

      it('can set the date to today', () => {
        ref.current.today();
        wrapper.update();

        expect(wrapper.exists('[data-date="2022-01-21"]')).to.be.true;
        expect(wrapper.find('input').getDOMNode().value).to.equal('2022-01-21');
      });

      it('can use the offset argment to add or subtract days today', () => {
        ref.current.today(-1);
        wrapper.update();

        expect(wrapper.exists('[data-date="2022-01-20"]')).to.be.true;
        expect(wrapper.find('input').getDOMNode().value).to.equal('2022-01-20');
      });
    });

    describe('date range picker', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <BentoDatePicker
            ref={ref}
            type="range"
            initialVisibleMonth={new Date(2022, 0)}
            startInputSelector="[name=startdate]"
            endInputSelector="[name=enddate]"
            today={new Date(2022, 0, 21)}
          >
            <input name="startdate" value="2022-01-01" />
            <input name="enddate" value="2022-01-02" />
          </BentoDatePicker>
        );
      });

      it('can clear the start and end dates', () => {
        ref.current.clear();
        wrapper.update();

        expect(wrapper.exists('[data-startdate="2022-01-01"]')).to.be.false;
        expect(wrapper.exists('[data-enddate="2022-01-01"]')).to.be.false;
        expect(
          wrapper.find('input[name="startdate"]').getDOMNode().value
        ).to.equal('');
        expect(
          wrapper.find('input[name="enddate"]').getDOMNode().value
        ).to.equal('');
      });

      it('reopens the picker if openAfterClear is true', () => {
        wrapper = mount(
          <BentoDatePicker
            ref={ref}
            type="range"
            initialVisibleMonth={new Date(2022, 0)}
            startInputSelector="[name=startdate]"
            endInputSelector="[name=enddate]"
            mode="overlay"
            openAfterClear
          >
            <input name="startdate" value="2022-01-01" />
            <input name="enddate" value="2022-01-02" />
          </BentoDatePicker>
        );

        expect(isCalendarVisible(wrapper)).to.be.false;

        ref.current.clear();
        wrapper.update();

        expect(isCalendarVisible(wrapper)).to.be.true;
      });

      it('can set the start and end dates', () => {
        ref.current.setDates(new Date(2022, 0, 21), new Date(2022, 0, 22));
        wrapper.update();

        expect(wrapper.exists('[data-startdate="2022-01-21"]')).to.be.true;
        expect(wrapper.exists('[data-enddate="2022-01-22"]')).to.be.true;
        expect(
          wrapper.find('input[name="startdate"]').getDOMNode().value
        ).to.equal('2022-01-21');
        expect(
          wrapper.find('input[name="enddate"]').getDOMNode().value
        ).to.equal('2022-01-22');
      });

      it('can set the start date to today', () => {
        ref.current.startToday();
        wrapper.update();

        expect(wrapper.exists('[data-startdate="2022-01-21"]')).to.be.true;
        expect(
          wrapper.find('input[name="startdate"]').getDOMNode().value
        ).to.equal('2022-01-21');
      });

      it('can use the offset argment to add or subtract days from start today', () => {
        ref.current.startToday(-1);
        wrapper.update();

        expect(wrapper.exists('[data-startdate="2022-01-20"]')).to.be.true;
        expect(
          wrapper.find('input[name="startdate"]').getDOMNode().value
        ).to.equal('2022-01-20');
      });

      it('can set the end date to today', () => {
        ref.current.endToday();
        wrapper.update();

        expect(wrapper.exists('[data-enddate="2022-01-21"]')).to.be.true;
        expect(
          wrapper.find('input[name="enddate"]').getDOMNode().value
        ).to.equal('2022-01-21');
      });

      it('can use the offset argment to add or subtract days from end today', () => {
        ref.current.endToday(-1);
        wrapper.update();

        expect(wrapper.exists('[data-enddate="2022-01-20"]')).to.be.true;
        expect(
          wrapper.find('input[name="enddate"]').getDOMNode().value
        ).to.equal('2022-01-20');
      });
    });
  });
});
