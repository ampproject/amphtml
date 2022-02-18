import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';

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
  decorators: [withKnobs],
};

const VideoTagPlayer = ({i}) => {
  const group = `Player ${i + 1}`;

  const width = text('width', '640px', group);
  const height = text('height', '360px', group);

  const ariaLabel = text('aria-label', 'Video Player', group);
  const autoplay = boolean('autoplay', true, group);
  const controls = boolean('controls', true, group);
  const mediasession = boolean('mediasession', true, group);
  const noaudio = boolean('noaudio', false, group);
  const loop = boolean('loop', false, group);
  const poster = text(
    'poster',
    'https://amp.dev/static/inline-examples/images/kitten-playing.png',
    group
  );

  const artist = text('artist', '', group);
  const album = text('album', '', group);
  const artwork = text('artwork', '', group);
  const title = text('title', '', group);

  const sources = object(
    'sources',
    [
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.webm',
        type: 'video/webm',
      },
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.mp4',
        type: 'video/mp4',
      },
    ],
    group
  );

  return (
    <BentoVideo
      component="video"
      aria-label={ariaLabel}
      autoplay={autoplay}
      controls={controls}
      mediasession={mediasession}
      noaudio={noaudio}
      loop={loop}
      poster={poster}
      artist={artist}
      album={album}
      artwork={artwork}
      title={title}
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

export const Default = () => {
  const amount = number('Amount', 1, {}, 'Page');
  const spacerHeight = text('Space', '80vh', 'Page');
  const spaceAbove = boolean('Space above', false, 'Page');
  const spaceBelow = boolean('Space below', false, 'Page');

  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<VideoTagPlayer key={i} i={i} />);
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

export const InsideAccordion = () => {
  const width = text('width', '320px');
  const height = text('height', '180px');
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
