import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {text, withKnobs} from '@storybook/addon-knobs';

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

export const WithPlaceholderAndFallback = () => {
  const videoid = text('videoid', 'ref:amp-docs-sample');
  const playerid = text('playerid', 'SyIOV8yWM');
  const account = text('account', '1290862519001');
  const height = text('height', '270');
  const width = text('width', '480');

  return (
    <amp-brightcove
      id="myPlayer"
      data-referrer="EXTERNAL_REFERRER"
      data-account={account}
      data-video-id={videoid}
      data-player-id={playerid}
      layout="responsive"
      width={width}
      height={height}
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-brightcove>
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
