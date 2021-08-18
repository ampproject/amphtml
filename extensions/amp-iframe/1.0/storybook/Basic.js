import * as Preact from '#preact';
import {Iframe} from '../component';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Iframe',
  component: Iframe,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Iframe
      style={{width: 800, height: 600}}
      src="https://www.wikipedia.org/"
      title="Wikipedia"
    ></Iframe>
  );
};
