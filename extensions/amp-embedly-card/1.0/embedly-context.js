import {createContext} from '#preact';

const EmbedlyContext = createContext(
  /** @type {EmbedlyCardDef.EmbedlyContext} */ ({apiKey: ''})
);
export {EmbedlyContext};
