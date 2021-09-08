import * as Preact from '#preact';
import {Brightcove} from '../component';

export default {
  title: 'Brightcove',
  component: Brightcove,
  args: {
    autoplay: false,
    videoId: 'ref:amp-docs-sample',
    player: 'SyIOV8yWM',
    account: '1290862519001',
  },
};

export const _default = (args) => {
  return <Brightcove style={{width: 480, height: 270}} {...args} />;
};
