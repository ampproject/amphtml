import * as Preact from '#preact';

import {BentoEmbedlyCard} from '../component';
import {BentoEmbedlyContext} from '../embedly-context';

export default {
  title: 'EmbedlyCard',
  component: BentoEmbedlyCard,
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

export const WithApiKey = ({apiKey}) => {
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

WithApiKey.args = {
  apiKey: 'valid-api-key',
};
