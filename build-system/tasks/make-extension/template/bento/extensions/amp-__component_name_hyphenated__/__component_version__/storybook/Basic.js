import * as Preact from '#preact';
import {__bento_component_name_pascalcase__} from '../component'

export default {
  title: '__component_name_pascalcase__',
  component: __bento_component_name_pascalcase__,
  args: {
    'exampleProperty': 'example string property argument'
  }
};

// __do_not_submit__: This is example code only.
export const _default = (args) => {
  return (
    <__bento_component_name_pascalcase__
      style={{width: 300, height: 200}}
      {...args}
    >
      This text is inside.
    </__bento_component_name_pascalcase__>
  );
};
