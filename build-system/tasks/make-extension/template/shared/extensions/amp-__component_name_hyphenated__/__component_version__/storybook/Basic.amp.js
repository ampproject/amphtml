import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-__component_name_hyphenated__-__component_version_snakecase__',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-__component_name_hyphenated__', version: '__component_version__'},
    ],
    __storybook_experiments_do_not_add_trailing_comma__
  },
  args: {
    'data-example-property': 'example string property argument'
  }
};

// __do_not_submit__: This is example code only.
export const _default = (args) => {
  return (
    <amp-__component_name_hyphenated__
      width="300"
      height="200"
      {...args}
    >
      This text is inside.
    </amp-__component_name_hyphenated__>
  );
};
