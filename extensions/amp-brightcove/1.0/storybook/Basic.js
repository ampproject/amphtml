import {BentoBrightcove} from '#bento/components/bento-brightcove/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Brightcove',
  component: BentoBrightcove,
  args: {
    autoplay: false,
    videoId: 'ref:amp-docs-sample',
    player: 'SyIOV8yWM',
    account: '1290862519001',
  },
};

export const _default = (args) => {
  return <BentoBrightcove style={{width: 480, height: 270}} {...args} />;
};
