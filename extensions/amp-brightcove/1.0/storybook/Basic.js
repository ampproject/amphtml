import * as Preact from '#preact';
import {Brightcove} from '../component';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Brightcove',
  component: Brightcove,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Brightcove
      account="1290862519001"
      videoId="ref:amp-docs-sample"
      player="SyIOV8yWM"
      style={{width: 480, height: 270}}
    />
  );
};
