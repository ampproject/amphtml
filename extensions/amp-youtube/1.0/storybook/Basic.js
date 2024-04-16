import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';
import {BentoYoutube} from '#bento/components/bento-youtube/1.0/component';

import * as Preact from '#preact';
import {useRef, useState} from '#preact';

export default {
  title: 'YouTube',
  component: BentoYoutube,
  args: {
    width: 300,
    height: 300,
    autoplay: false,
    loop: false,
    params: {},
    credentials: 'include',
  },
};

const VIDEOID = 'IAvf-rkzNck';
const LIVE_CHANNEL_ID = 'sKCkM-f2Qk4';

export const _default = ({height, width, ...args}) => {
  return <BentoYoutube style={{width, height}} {...args} />;
};

_default.args = {
  videoid: VIDEOID,
};

/**
 * @param {*} props
 * @return {*}
 */
function WithStateTable({autoplay, credentials, loop, params, style, videoid}) {
  const ref = useRef(null);

  const [stateTable, setStateTable] = useState(null);
  const setCurrentStateTable = () => {
    setStateTable(
      <table>
        {['autoplay', 'controls', 'loop', 'currentTime', 'duration'].map(
          (key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{ref.current[key]}</td>
            </tr>
          )
        )}
      </table>
    );
  };

  return (
    <>
      <BentoYoutube
        ref={ref}
        autoplay={autoplay}
        loop={loop}
        videoid={videoid}
        params={params}
        style={style}
        credentials={credentials}
      />
      <p>
        <button onClick={setCurrentStateTable}>🔄 current state</button>
      </p>
      {stateTable}
    </>
  );
}

export function State({height, width, ...args}) {
  return <WithStateTable style={{width, height}} {...args} />;
}

State.args = {
  videoid: VIDEOID,
};

export const liveChannelId = ({height, width, ...args}) => {
  return <BentoYoutube style={{width, height}} {...args} />;
};

liveChannelId.args = {
  liveChannelid: LIVE_CHANNEL_ID,
};

export const InsideAccordion = ({height, width, ...args}) => {
  return (
    <BentoAccordion expandSingleSection>
      <BentoAccordionSection key={1} expanded>
        <BentoAccordionHeader>
          <h2>Controls</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoYoutube loop={true} {...args} style={{width, height}} />
        </BentoAccordionContent>
      </BentoAccordionSection>
      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h2>Autoplay</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoYoutube
            autoplay={true}
            loop={true}
            {...args}
            style={{width, height}}
          />
        </BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
};

InsideAccordion.args = {
  videoid: VIDEOID,
};
