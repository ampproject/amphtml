import {userAssert} from '#utils/log';

import {AmpVideoBaseElement} from './video-base-element';

import {CSS} from '../../../build/amp-video-1.0.css';

/** @const {string} */
const TAG = 'amp-video';

class AmpVideo extends AmpVideoBaseElement {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideo, CSS);
});
