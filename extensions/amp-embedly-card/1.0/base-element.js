import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoEmbedlyCard} from './component';
import {BentoEmbedlyContext} from './embedly-context';

export const BENTO_TAG = 'bento-embedly-card';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoEmbedlyCardWithContext;

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

/** @override */
BaseElement['props'] = {
  'title': {attr: 'title'},
  'url': {attr: 'data-url'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
