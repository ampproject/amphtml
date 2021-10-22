import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-story-shopping-0_1',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-story-shopping', version: '0.1'}],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};
