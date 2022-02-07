import {toggleExperiment} from '#experiments';

import {upgradeOrRegisterElement} from '#service/custom-element-registry';

import {installFriendlyIframeEmbed} from '../src/friendly-iframe-embed';

/**
 * Tests a component inside a FIE (Friendly Iframe Embed).
 *
 * In a FIE, the global `document` should not be used;
 * instead, the element must be aware of its ownerDocument.
 * This utility helps to verify this behavior.
 *
 * @param config
 * @param config.tag - The tag name that needs to be registered
 * @param config.element - The component that needs to be registered
 * @param config.document - The "global" document where the iframe should be embedded
 * @param config.url - The canonical URL for the iframe
 * @param config.html - The full HTML for the iframe, including <head> and <body> tags
 */
export async function friendlyIframeEmbedTester({
  document,
  element,
  html,
  tag,
  url,
}: {
  element: AMP.BaseElement;
  document: Document;
  html: string;
  tag: string;
  url: string;
}) {
  const iframe = document.createElement('iframe');
  const fie = await installFriendlyIframeEmbed(
    iframe,
    document.body,
    {
      url,
      html,
    },
    undefined
  );

  // Enable bento:
  toggleExperiment(fie.win, 'bento', true, true);

  // We must register the web component after creating.
  upgradeOrRegisterElement(fie.win, tag, element);

  // The runtime isn't running, so we'll manually mount the element:
  const embeddedElement: AmpElementInternal =
    fie.win.document.querySelector(tag)!;
  await embeddedElement.mountInternal();

  // Ensure `useEffect` have run:
  await new Promise(requestAnimationFrame);

  return embeddedElement;
}
