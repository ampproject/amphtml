import * as Preact from '#preact';
import {Render} from '../component';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Render',
  component: Render,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Render
      src={'http://example.com'}
      getJson={() => Promise.resolve({name: 'George'})}
      render={(data) => `Hi ${data.name}!`}
    ></Render>
  );
};

export const defaultRenderAndGetJson = () => {
  return <Render src={'/examples/amp-render-data.json'}></Render>;
};
