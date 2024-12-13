import {BentoDailymotion} from '#bento/components/bento-dailymotion/1.0/component';

import * as Preact from '#preact';

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

export const _default = (args) => <Template {...args} />;

export const _customSettings = (args) => <Template {...args} />;

_customSettings.args = {
  endscreenEnable: false,
  sharingEnable: false,
  uiHighlight: '444444',
  uiLogo: false,
  info: false,
};

export const _autoplay = (args) => <Template {...args} />;

_autoplay.args = {
  autoplay: true,
};
