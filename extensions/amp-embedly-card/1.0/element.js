import * as Preact from '#preact';

import {BentoEmbedlyCard} from './component';
import {BentoEmbedlyContext} from './embedly-context';

export const Component = BentoEmbedlyCardWithContext;

/**
 * @param {!BentoEmbedlyCardDef.Props} props
 * @return {PreactDef.Renderable}
 */
function BentoEmbedlyCardWithContext(props) {
  // Extract Embedly Key
  const ampEmbedlyKeyElement = document.querySelector('amp-embedly-key');
  const apiKey = ampEmbedlyKeyElement?.getAttribute('value') || '';

  return (
    <BentoEmbedlyContext.Provider value={apiKey}>
      <BentoEmbedlyCard {...props}></BentoEmbedlyCard>
    </BentoEmbedlyContext.Provider>
  );
}

export const props = {
  'title': {attr: 'title'},
  'url': {attr: 'data-url'},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;
