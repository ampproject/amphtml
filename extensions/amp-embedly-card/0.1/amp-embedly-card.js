import {AmpEmbedlyCard, TAG} from './amp-embedly-card-impl';
import {AmpEmbedlyKey, TAG as KEY_TAG} from './amp-embedly-key';

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerElement(TAG, AmpEmbedlyCard);
  AMP.registerElement(KEY_TAG, AmpEmbedlyKey);
});
