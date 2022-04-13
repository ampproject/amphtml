import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';
import {BentoVideo} from '#bento/components/bento-video/1.0/component';

import * as Preact from '#preact';

import '#bento/components/bento-video/1.0/component.jss';

export default {
  title: 'Video',
  component: BentoVideo,
  args: {
    width: '640px',
    height: '360px',
    ariaLabel: 'Video Player',
    autoplay: true,
    controls: true,
    mediasession: true,
    noaudio: false,
    loop: false,
    poster: 'https://amp.dev/static/inline-examples/images/kitten-playing.png',
    artist: '',
    album: '',
    artwork: '',
    title: '',
    sources: [
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.webm',
        type: 'video/webm',
      },
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.mp4',
        type: 'video/mp4',
      },
    ],

    amount: 1,
    spaceAbove: false,
    spaceBelow: false,
  },
};

const VideoTagPlayer = ({height, i, sources, width, ...args}) => {
  const group = `Player ${i + 1}`;

  return (
    <BentoVideo
      component="video"
      {...args}
      id={group}
      style={{width, height}}
      sources={sources.map((props) => (
        <source {...props}></source>
      ))}
    />
  );
};

const Spacer = ({height}) => {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(to bottom, #bbb, #bbb 10%, #fff 10%, #fff)`,
        backgroundSize: '100% 10px',
      }}
    ></div>
  );
};

export const Default = ({
  amount,
  spaceAbove,
  spaceBelow,
  spacerHeight,
  ...args
}) => {
  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<VideoTagPlayer key={i} i={i} {...args} />);
    if (i < amount - 1) {
      players.push(<Spacer height={spacerHeight} />);
    }
  }

  return (
    <>
      {spaceAbove && <Spacer height={spacerHeight} />}
      {players}
      {spaceBelow && <Spacer height={spacerHeight} />}
    </>
  );
};

Default.args = {
  amount: 1,
  spacerHeight: '80vh',
  spaceAbove: false,
  spaceBelow: false,
};

export const InsideAccordion = ({height, width}) => {
  return (
    <BentoAccordion expandSingleSection>
      <BentoAccordionSection key={1} expanded>
        <BentoAccordionHeader>
          <h2>Controls</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoVideo
            component="video"
            controls={true}
            loop={true}
            style={{width, height}}
            src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
            poster="https://amp.dev/static/inline-examples/images/kitten-playing.png"
          />
        </BentoAccordionContent>
      </BentoAccordionSection>
      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h2>Autoplay</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <BentoVideo
            component="video"
            autoplay={true}
            loop={true}
            style={{width, height}}
            src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
            poster="https://amp.dev/static/inline-examples/images/kitten-playing.png"
            sources={[
              <source
                type="video/mp4"
                src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
              />,
            ]}
          />
        </BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
};

InsideAccordion.args = {
  width: '320px',
  height: '180px',
};
