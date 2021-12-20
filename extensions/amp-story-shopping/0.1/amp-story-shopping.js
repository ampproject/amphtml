import {AmpStoryShoppingAttachment} from './amp-story-shopping-attachment';
import {AmpStoryShoppingConfig} from './amp-story-shopping-config';
import {AmpStoryShoppingTag} from './amp-story-shopping-tag';

import {CSS as shoppingCSS} from '../../../build/amp-story-shopping-0.1.css';

AMP.extension('amp-story-shopping', '0.1', (AMP) => {
  AMP.registerElement('amp-story-shopping-config', AmpStoryShoppingConfig);
  AMP.registerElement(
    'amp-story-shopping-tag',
    AmpStoryShoppingTag,
    shoppingCSS
  );
  AMP.registerElement(
    'amp-story-shopping-attachment',
    AmpStoryShoppingAttachment
  );
});
