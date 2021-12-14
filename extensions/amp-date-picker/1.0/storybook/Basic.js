import * as Preact from '#preact';

import {BentoDatePicker} from '../component';

export default {
  title: 'DatePicker',
  component: BentoDatePicker,
  args: {
    layout: 'fixed-height',
    type: 'single',
    mode: 'static',
    height: 360,
  },
};

export const _default = (args) => {
  return <BentoDatePicker {...args}></BentoDatePicker>;
};

export const withSingleInput = (args) => {
  return (
    <BentoDatePicker {...args}>
      <input id="date" value="2021-01-01" />
    </BentoDatePicker>
  );
};
