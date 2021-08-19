import * as Preact from '#preact';
import {__component_name_pascalcase__} from '../component'
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: '__component_name_pascalcase__',
  component: __component_name_pascalcase__,
  decorators: [withKnobs],
};

export const _default = () => {
  // __do_not_submit__: This is example code only.
  return (
    <__component_name_pascalcase__
      style={{width: 300, height: 200}}
      example-property="example string property value"
    >
      This text is inside.
    </__component_name_pascalcase__>
  );
};
