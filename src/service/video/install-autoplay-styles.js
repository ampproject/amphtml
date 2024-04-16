import {cssText} from '../../../build/video-autoplay.css';
import {installStylesForDoc} from '../../style-installer';
// Source for this constant is css/video-autoplay.css

/**
 * @param  {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoplayStylesForDoc(ampdoc) {
  installStylesForDoc(
    ampdoc,
    cssText,
    /* callback */ null,
    /* opt_isRuntimeCss */ false,
    /* opt_ext */ 'amp-video-autoplay'
  );
}
