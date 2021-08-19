import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {EmbedlyCard} from '../component';
import {EmbedlyContext} from '../embedly-context';

export default {
  title: 'EmbedlyCard',
  component: EmbedlyCard,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <EmbedlyCard
      url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
      title="Embedly Card"
      style={{width: '400px', height: '400px'}}
    />
  );
};

export const WithAPIKey = () => {
  const apiKey = text('Embedly API Key', 'valid-api-key');

  return (
    <EmbedlyContext.Provider value={apiKey}>
      <EmbedlyCard
        url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        title="Embedly Card"
        style={{width: '400px', height: '400px'}}
      />
    </EmbedlyContext.Provider>
  );
};
