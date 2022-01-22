import {date, number, select, text, withKnobs} from '@storybook/addon-knobs';
import * as Preact from '#preact';

import {BentoDatePicker} from '../component';
import {localeMap} from '../date-helpers';

export default {
  title: 'DatePicker',
  component: BentoDatePicker,
  args: {
    type: 'single',
    layout: 'fixed-height',
    height: 360,
    initialVisibleMonth: new Date(),
    locale: select('Locale', Object.keys(localeMap)),
    mode: select('Mode', ['static', 'overlay']),
  },
  decorators: [withKnobs],
};

export const _default = (args) => {
  return <BentoDatePicker {...args}></BentoDatePicker>;
};

export const WithSingleInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="date" value="2022-01-01" />
    </BentoDatePicker>
  );
};

WithSingleInput.args = {
  type: 'single',
};

export const WithRangeInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="startdate" value="2022-01-01" />
      <input id="enddate" value="2022-01-02" />
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
  initialVisibleMonth: new Date(2022, 0),
  blocked: [new Date(2022, 0, 5)],
};

// eslint-disable-next-line local/no-export-side-effect
export const RangeWithBlockedDates = _default.bind({});

RangeWithBlockedDates.args = {
  type: 'range',
  initialVisibleMonth: new Date(2022, 0),
  blocked: [new Date(2022, 0, 5)],
};
