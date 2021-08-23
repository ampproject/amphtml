import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-__component_name_hyphenated__-__component_version_snakecase__',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-__component_name_hyphenated__', version: '__component_version__'},
    ],
    __storybook_experiments_do_not_add_trailing_comma__
  },
};

// __do_not_submit__: This is example code only.
export const ExampleUseCase = () => {
  return (
    <amp-__component_name_hyphenated__
      width="300"
      height="200"
      example-property="example string property value"
    >
      This text is inside.
    </amp-__component_name_hyphenated__>
  );
};

ExampleUseCase.story = {
  name: 'Example use case story'
};
