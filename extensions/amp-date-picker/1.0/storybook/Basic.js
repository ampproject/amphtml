import {addDays} from 'date-fns';

import * as Preact from '#preact';

import {BentoDatePicker} from '../component';
import {getFormattedDate, localeMap} from '../date-helpers';

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
  },
};

export const _default = (args) => {
  return <BentoDatePicker {...args}></BentoDatePicker>;
};

export const WithSingleInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="date" value={getFormattedDate(today)} />
    </BentoDatePicker>
  );
};

WithSingleInput.args = {
  type: 'single',
};

export const WithRangeInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="startdate" value={getFormattedDate(today)} />
      <input id="enddate" value={getFormattedDate(addDays(today, 2))} />
    </BentoDatePicker>
  );
};

WithRangeInput.args = {
  type: 'range',
  mode: 'overlay',
};

// eslint-disable-next-line local/no-export-side-effect
export const SingleWithBlockedDates = _default.bind({});

SingleWithBlockedDates.args = {
  blocked: [addDays(today, 5)],
};

// eslint-disable-next-line local/no-export-side-effect
export const RangeWithBlockedDates = _default.bind({});

RangeWithBlockedDates.args = {
  type: 'range',
  blocked: [addDays(today, 5)],
};
