import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-brightcove-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-brightcove', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Default = () => {
  return (
    <amp-brightcove
      id="myPlayer"
      data-referrer="EXTERNAL_REFERRER"
      data-account="1290862519001"
      data-video-id="ref:amp-docs-sample"
      data-player-id="SyIOV8yWM"
      layout="responsive"
      width="480"
      height="270"
    ></amp-brightcove>
  );
};

export const Actions = () => {
  return (
    <>
      <button on="tap:myPlayer.play">Play</button>
      <button on="tap:myPlayer.pause">Pause</button>
      <button on="tap:myPlayer.mute">Mute</button>
      <button on="tap:myPlayer.unmute">Unmute</button>
      <button on="tap:myPlayer.fullscreen">Fullscreen</button>

      <p>Autoplay</p>
      <amp-brightcove
        id="myPlayer"
        autoplay
        data-account="1290862519001"
        data-video-id="ref:amp-docs-sample"
        data-player-id="SyIOV8yWM"
        layout="responsive"
        width="480"
        height="270"
      ></amp-brightcove>
    </>
  );
};
