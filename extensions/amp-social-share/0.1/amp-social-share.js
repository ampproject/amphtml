import {AmpSocialShare} from './amp-social-share-impl';

import {CSS} from '../../../build/amp-social-share-0.1.css';

AMP.extension('amp-social-share', '0.1', (AMP) => {
  AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
});
