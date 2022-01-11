import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

/*
 * amp-social-share allows the user to set various parameters to configure
 * its behavior.  These parameters are controlled by storybook controls and
 * are summarized below:
 *
 * Key Configuration Parameters -
 * type - This is a required attribute.  It configures a set
 *   of parameters to share with a particular social-media.  Most
 *   notably, the share-endpoint is set by the type.  Configuration details
 *   can be found in amp-social-share-config.js.  The user may also select
 *   'custom' with this control to manually specify the required parameters.
 *   Setting any of the other attributes below overwrites the
 *   pre-configured parameters defined by the type.
 * data-share-endpoint - This is the api endpoint of the social-media with
 *   which to share content.
 * data-param-url - This is the url to be shared via social-media.  It
 *   is defaulted to the canonical url of the current amp page in most
 *   cases where it is used in the pre-configured types.
 *
 * Other Configuration Parameters -
 * data-param-text - This is a text value included in the shared media.
 * data-param-attribution - This allows the user to specify where the
 *   share is attributed to.
 * data-param-media - This is used to specify a path to media (image) to
 *   be shared when sharing via Pinterest.
 * data-param-app_id - This is used when sharing with Facebook and is
 *   defaulted to an amp test app.
 */

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
  title: 'amp-social-share-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-social-share', version: '1.0'}],
    experiments: ['bento'],
  },
  argTypes: {
    type: {control: {type: 'select'}, options: types},
  },
  args: {
    type: types[0],
    width: '',
    height: '',
    layout: '',
    'data-share-endpoint': '',
    'data-param-url': '',
    'data-param-text': '',
    'data-param-attribution': '',
    'data-param-media': '',
    'data-param-app_id': '254325784911610',
  },
};

export const Default = (args) => {
  return <amp-social-share {...args}></amp-social-share>;
};

Default.storyName = 'default';
