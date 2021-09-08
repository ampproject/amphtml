import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoEmbedlyCard} from '../component';
import {BentoEmbedlyContext} from '../embedly-context';

export default {
  title: 'EmbedlyCard',
  component: BentoEmbedlyCard,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <BentoEmbedlyCard
      url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
      title="BentoEmbedly Card"
      style={{width: '400px', height: '400px'}}
    />
  );
};

export const WithAPIKey = () => {
  const apiKey = text('BentoEmbedly API Key', 'valid-api-key');

  return (
    <BentoEmbedlyContext.Provider value={apiKey}>
      <BentoEmbedlyCard
        url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        title="BentoEmbedly Card"
        style={{width: '400px', height: '400px'}}
      />
    </BentoEmbedlyContext.Provider>
  );
};
