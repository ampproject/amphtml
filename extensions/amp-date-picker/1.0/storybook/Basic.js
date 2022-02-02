import {addDays} from 'date-fns';

import * as Preact from '#preact';
import {useRef} from '#preact';

import {BentoDatePicker} from '../component';
import {getFormattedDate, localeMap} from '../date-helpers';
import {useDatePicker} from '../use-date-picker';

const today = new Date();

export default {
  title: 'DatePicker',
  component: BentoDatePicker,
  argTypes: {
    mode: {
      options: ['static', 'overlay'],
      control: {type: 'radio'},
    },
    locale: {
      options: Object.keys(localeMap),
      control: {type: 'select'},
    },
  },
  args: {
    type: 'single',
    layout: 'fixed-height',
    height: 360,
    initialVisibleMonth: today,
    locale: 'en',
    mode: 'static',
    maximumNights: 0,
  },
};

const DateDisplay = () => {
  const {selectedDate} = useDatePicker();
  return (
    <p>
      The selected date is {getFormattedDate(selectedDate, 'MMMM dd, yyyy')}
    </p>
  );
};

export const _default = (args) => {
  const datePickerRef = useRef();
  return (
    <BentoDatePicker ref={datePickerRef} {...args}>
      <input id="date" placeholder="Pick a date" />
      <button onClick={() => datePickerRef.current?.clear()}>Clear</button>
      <button onClick={() => datePickerRef.current?.today()}>Today</button>
      <button onClick={() => datePickerRef.current?.today({offset: 1})}>
        Tomorrow
      </button>
      <DateDisplay />
    </BentoDatePicker>
  );
};

export const WithRangeInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="startdate" />
      <input id="enddate" />
    </BentoDatePicker>
  );
};

WithRangeInput.args = {
  type: 'range',
  mode: 'overlay',
};
