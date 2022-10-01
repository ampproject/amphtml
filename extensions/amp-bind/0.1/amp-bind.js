import {AmpBindMacro} from './amp-bind-macro';
import {AmpState} from './amp-state';
import {Bind} from './bind-impl';

/** @const {string} */
const TAG = 'amp-bind';

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc('bind', Bind);
  AMP.registerElement('amp-state', AmpState);
  AMP.registerElement('amp-bind-macro', AmpBindMacro);
});
