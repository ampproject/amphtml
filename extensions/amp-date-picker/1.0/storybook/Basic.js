import {enUS} from 'date-fns/locale';

import * as Preact from '#preact';
import {useRef} from '#preact';

import {BentoDatePicker} from '../component/component';
import {localeMap} from '../parsers';
import '../amp-date-picker.css';

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
    initialVisibleMonth: {
      control: {type: 'date'},
    },
  },
  args: {
    type: 'single',
    layout: 'fixed-height',
    height: 360,
    initialVisibleMonth: today,
    locale: enUS,
    mode: 'static',
    maximumNights: 0,
    numberOfMonths: 1,
    openAfterClear: false,
    openAfterSelect: false,
  },
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
};
