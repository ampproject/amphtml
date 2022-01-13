import * as Preact from '#preact';

import {BentoDatePicker} from '../component';

export default {
  title: 'DatePicker',
  component: BentoDatePicker,
  args: {
    type: 'single',
    layout: 'fixed-height',
    mode: 'static',
    height: 360,
  },
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
  initialVisibleMonth: new Date(),
  mode: 'overlay',
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
