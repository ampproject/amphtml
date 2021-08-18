

import {color, object, select, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {SocialShare} from '../component';

export default {
  title: 'SocialShare',
  component: SocialShare,
  decorators: [withKnobs],
};

export const _default = () => {
  const knobConfigurations = [
    'email',
    'facebook',
    'linkedin',
    'pinterest',
    'tumblr',
    'twitter',
    'whatsapp',
    'line',
    'sms',
    'system',
    'custom',
    undefined,
  ];
  const type = select('type', knobConfigurations, knobConfigurations[0]);
  const endpoint = text('customEndpoint', null);
  const additionalParams = object('additionalParams', {'subject': 'test'});
  const target = text('target', null);
  const width = text('width', null);
  const height = text('height', null);
  const foregroundColor = color('color');
  const background = color('background');
  const children = text('children', null);

  return (
    <SocialShare
      type={type}
      endpoint={endpoint}
      params={additionalParams}
      target={target}
      width={width}
      height={height}
      color={foregroundColor}
      background={background}
      children={children}
    />
  );
};
