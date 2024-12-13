import {BentoJwplayer} from '#bento/components/bento-jwplayer/1.0/component';

import * as Preact from '#preact';
import {useRef} from '#preact';

export default {
  title: 'Jwplayer',
  component: BentoJwplayer,
  args: {},
};

export const Default = (args) => {
  return (
    <>
      <h3>Player & Media IDs</h3>
      <BentoJwplayer
        playerId={'uoIbMPm3'}
        mediaId={'BZ6tc0gy'}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>

      <h3>Player & Playlist IDs</h3>
      <BentoJwplayer
        playerId={'uoIbMPm3'}
        playlistId={'482jsTAr'}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>
    </>
  );
};
export const WithApi = (args) => {
  const ref = useRef();

  return (
    <>
      <h3>Programmatic control</h3>
      <BentoJwplayer
        ref={ref}
        mediaId={'CtaIzmFs'}
        playerId={'BjcwyK37'}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>
      <button onClick={() => ref.current?.pause()}>pause</button>
      <button onClick={() => ref.current?.play()}>play</button>
      <button onClick={() => ref.current?.mute()}>mute</button>
      <button onClick={() => ref.current?.unmute()}>unmute</button>
      <button onClick={() => ref.current?.requestFullscreen()}>FS</button>
    </>
  );
};

export const WithContextual = (args) => {
  return (
    <>
      <h3>Contextual</h3>
      <BentoJwplayer
        playerId={'BjcwyK37'}
        mediaId={'CtaIzmFs'}
        contentSearch={'contentSearchVal'}
        contentBackfill={'true'}
        contentRecency={'9D'}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>
    </>
  );
};

export const WithAds = (args) => {
  return (
    <>
      <h3>IMA Ad</h3>
      <BentoJwplayer
        mediaId={'3h8NHAIV'}
        playerId={'n6vw37Z7'}
        {...args}
        style={{width: 480, height: 270}}
      ></BentoJwplayer>

      <h3>VAST Ad</h3>
      <BentoJwplayer
        mediaId={'NsdRZqng'}
        playerId={'WmASC9FK'}
        {...args}
        style={{width: 480, height: 270}}
      ></BentoJwplayer>
    </>
  );
};

export const WithConfig = (args) => {
  return (
    <>
      <h3>Custom Skin</h3>
      <BentoJwplayer
        mediaId={'CtaIzmFs'}
        playerId={'BjcwyK37'}
        config={{
          skinUrl: 'https://playertest.longtailvideo.com/skins/ethan.css',
        }}
        style={{width: 640, height: 360}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom Plugin</h3>
      <BentoJwplayer
        mediaId={'CtaIzmFs'}
        playerId={'BjcwyK37'}
        config={{
          pluginUrl:
            'https://playertest.longtailvideo.com/plugins/newsticker.js',
        }}
        style={{width: 640, height: 360}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom JSON Ad Config</h3>
      <BentoJwplayer
        mediaId={'NsdRZqng'}
        playerId={'WmASC9FK'}
        config={{
          json: JSON.stringify({
            advertising: {
              client: 'vast',
              schedule: [
                {
                  tag: 'http://playertest.longtailvideo.com/pre.xml',
                  offset: 'pre',
                },
                {
                  tag: 'http://playertest.longtailvideo.com/mid.xml',
                  offset: '5',
                },
                {
                  tag: 'http://playertest.longtailvideo.com/post.xml',
                  offset: 'post',
                },
              ],
            },
          }),
        }}
        style={{width: 640, height: 360}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom JSON Config</h3>
      <BentoJwplayer
        mediaId={'CtaIzmFs'}
        playerId={'BjcwyK37'}
        config={{
          json: JSON.stringify({
            playbackRateControls: true,
            displaytitle: false,
            horizontalVolumeSlider: true,
          }),
        }}
        style={{width: 640, height: 360}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom IMA Ad Params</h3>
      <BentoJwplayer
        mediaId={'BZ6tc0gy'}
        playerId={'4MCKXmfU'}
        adCustParams={JSON.stringify({
          key1: 'value1',
          keyTest: 'value2',
        })}
        style={{width: 640, height: 360}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom VAST Ad Params</h3>
      <BentoJwplayer
        mediaId={'NsdRZqng'}
        playerId={'WmASC9FK'}
        adCustParams={JSON.stringify({key1: 'value1', keyTest: 'value2'})}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>

      <h3>Custom VAST Ad Macros</h3>
      <BentoJwplayer
        mediaId={'CtaIzmFs'}
        playerId={'BjcwyK37'}
        adMacros={{
          itemTest: 'val',
          itemParamList: 'one,two,three',
        }}
        config={{
          json: JSON.stringify({
            advertising: {
              client: 'vast',
              schedule: [
                {
                  tag: 'http://playertest.longtailvideo.com/pre.xml?domain=__domain__&test=__item-test__&param=__item-param-list__',
                  offset: 'pre',
                },
              ],
            },
          }),
        }}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>
    </>
  );
};

export const WithQueryParams = (args) => {
  return (
    <>
      <h3>Query String and Data Params</h3>
      <BentoJwplayer
        mediaId={'BZ6tc0gy'}
        playerId={'uoIbMPm3'}
        queryParams={{
          language: 'de',
          customAdData: 'key:value;key2:value2',
          name1: 'abc',
          name2: 'xyz',
          name3: '123',
        }}
        style={{width: 480, height: 270}}
        {...args}
      ></BentoJwplayer>
    </>
  );
};
