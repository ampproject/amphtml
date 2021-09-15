import * as Preact from '#preact';
import {BentoDailymotion} from '../component';

export default {
  title: 'Dailymotion',
  component: BentoDailymotion,
  args: {
    width: 300,
    height: 200,
    videoId: 'x3rdtfy',
  },
};

const Template = ({height, width, ...args}) => (
  <BentoDailymotion style={{width, height}} {...args} />
);

export const _default = Template.bind({});

export const _customSettings = Template.bind({});

_customSettings.args = {
  endscreenEnable: false,
  sharingEnable: false,
  uiHighlight: '444444',
  uiLogo: false,
  info: false,
};

export const _autoplay = Template.bind({});

_autoplay.args = {
  autoplay: true,
};
