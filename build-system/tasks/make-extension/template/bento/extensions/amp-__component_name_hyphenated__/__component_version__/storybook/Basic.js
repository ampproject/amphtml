import * as Preact from '#preact';
import {Bento__component_name_pascalcase__} from '../component'

__jss_import_storybook__

export default {
  title: '__component_name_pascalcase__',
  component: Bento__component_name_pascalcase__,
  args: {
    'exampleProperty': 'example string property argument'
  }
};

// __do_not_submit__: This is example code only.
export const _default = (args) => {
  return (
    <Bento__component_name_pascalcase__
      style={{width: 300, height: 200}}
      {...args}
    >
      This text is inside.
    </Bento__component_name_pascalcase__>
  );
};
