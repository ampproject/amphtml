import * as Preact from '#preact';
import {Dailymotion} from '../component';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Dailymotion',
  component: Dailymotion,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Dailymotion
      style={{width: 300, height: 200}}
      videoId="x3rdtfy"
    ></Dailymotion>
  );
};

export const _customSettings = () => {
  return (
    <Dailymotion
      style={{width: 300, height: 200}}
      videoId="x3rdtfy"
      endscreenEnable="false"
      sharingEnable="false"
      uiHighlight="444444"
      uiLogo="false"
      info="false"
    ></Dailymotion>
  );
};

export const _autoplay = () => {
  return (
    <Dailymotion
      style={{width: 300, height: 200}}
      videoId="x3rdtfy"
      autoplay
    ></Dailymotion>
  );
};
