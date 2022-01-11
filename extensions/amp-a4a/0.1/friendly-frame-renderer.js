import {devAssert} from '#utils/log';

import {Renderer} from './amp-ad-type-defs';
import {renderCreativeIntoFriendlyFrame} from './friendly-frame-util';

/**
 * @typedef {{
 *   creativeMetadata: ./amp-ad-type-defs.CreativeMetaDataDef,
 * }}
 */
export let CreativeData;

/**
 * Render a validated AMP creative directly in the parent page.
 */
export class FriendlyFrameRenderer extends Renderer {
  /**
   * Constructs a FriendlyFrameRenderer instance. The instance values here are
   * used by TemplateRenderer, which inherits from FriendlyFrameRenderer.
   */
  constructor() {
    super();
  }

  /** @override */
  render(context, element, creativeData) {
    creativeData = /** @type {CreativeData} */ (creativeData);

    const {adUrl, size} = context;
    const {creativeMetadata} = creativeData;

    devAssert(size, 'missing creative size');
    devAssert(adUrl, 'missing ad request url');

    return renderCreativeIntoFriendlyFrame(
      adUrl,
      size,
      element,
      creativeMetadata
    );
  }
}
