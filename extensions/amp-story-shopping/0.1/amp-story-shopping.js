import {AmpStoryShoppingAttachment} from './amp-story-shopping-attachment';
import {AmpStoryShoppingConfig} from './amp-story-shopping-config';
import {AmpStoryShoppingTag} from './amp-story-shopping-tag';

import {CSS as shoppingAttachmentCSS} from '../../../build/amp-story-shopping-attachment-0.1.css';
import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';

AMP.extension('amp-story-shopping', '0.1', (AMP) => {
  AMP.registerElement(
    'amp-story-shopping-attachment',
    AmpStoryShoppingAttachment,
    shoppingAttachmentCSS
  );
  AMP.registerElement('amp-story-shopping-config', AmpStoryShoppingConfig);
  AMP.registerElement(
    'amp-story-shopping-tag',
    AmpStoryShoppingTag,
    shoppingTagCSS
  );
});
