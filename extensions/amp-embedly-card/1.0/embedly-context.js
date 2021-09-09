import {createContext} from '#preact';

const BentoEmbedlyContext = createContext(
  /** @type {BentoEmbedlyCardDef.EmbedlyContext} */ ({apiKey: ''})
);
export {BentoEmbedlyContext};
