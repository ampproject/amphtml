import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {EmbedlyCard} from './component';
import {EmbedlyContext} from './embedly-context';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = EmbedlyCardWithContext;

/**
 * @param {!EmbedlyCardDef.Props} props
 * @return {PreactDef.Renderable}
 */
function EmbedlyCardWithContext(props) {
  // Extract Embedly Key
  const ampEmbedlyKeyElement = document.querySelector('amp-embedly-key');
  const apiKey = ampEmbedlyKeyElement?.getAttribute('value') || '';

  return (
    <EmbedlyContext.Provider value={apiKey}>
      <EmbedlyCard {...props}></EmbedlyCard>
    </EmbedlyContext.Provider>
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
