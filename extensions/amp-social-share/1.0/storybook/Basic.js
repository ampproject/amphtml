import {BentoSocialShare} from '#bento/components/bento-social-share/1.0/component';

import * as Preact from '#preact';

import '#bento/components/bento-social-share/1.0/component.jss';

const types = [
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

export default {
  title: 'SocialShare',
  component: BentoSocialShare,
  argTypes: {
    type: {control: {type: 'select'}, options: types},
    color: {control: {type: 'color'}},
    background: {control: {type: 'color'}},
  },
  args: {
    type: types[0],
    endpoint: '',
    params: {'subject': 'test'},
    target: '',
    width: '',
    height: '',
    children: '',
    color: '',
    background: '',
  },
};

export const _default = (args) => {
  return <BentoSocialShare {...args} />;
};
