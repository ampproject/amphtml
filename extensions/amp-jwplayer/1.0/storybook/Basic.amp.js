import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-jwplayer-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-jwplayer', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

export const _default = (args) => {
  return (
    <>
      <h3>Player & Media IDs</h3>
      <amp-jwplayer
        data-player-id={'uoIbMPm3'}
        data-media-id={'BZ6tc0gy'}
        width="480"
        height="270"
        {...args}
      ></amp-jwplayer>

      <h3>Player & Playlist IDs</h3>
      <amp-jwplayer
        data-player-id={'uoIbMPm3'}
        data-playlist-id={'482jsTAr'}
        width="480"
        height="270"
        {...args}
      ></amp-jwplayer>
    </>
  );
};
export const WithActions = (args) => {
  return (
    <>
      <h3>Actions</h3>
      <div style={{display: 'flex', justifyContent: 'stretch'}}>
        {['pause', 'play', 'mute', 'unmute', 'requestFullscreen'].map((btn) => (
          <button
            style={{margin: '0 5px 0 5px', flex: 1}}
            on={`tap:jwplayer.${btn}`}
          >
            {btn}
          </button>
        ))}
      </div>
      <amp-jwplayer
        id="jwplayer"
        data-player-id={'BjcwyK37'}
        data-media-id={'CtaIzmFs'}
        width="480"
        height="270"
        {...args}
      ></amp-jwplayer>
    </>
  );
};

export const WithQueryParams = (args) => {
  return (
    <>
      <h3>Query String and Data Params</h3>
      <amp-jwplayer
        data-media-id={'BZ6tc0gy'}
        data-player-id={'uoIbMPm3'}
        data-player-querystring={'name1=abc&name2=xyz&name3=123'}
        data-player-param-language={'de'}
        data-player-param-custom-ad-data={'key:value;key2:value2'}
        width="480"
        height="270"
        {...args}
      ></amp-jwplayer>
    </>
  );
};
