import {BaseElement} from './base-element';
__css_import__;
import {dict} from '#core/types/object';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-__component_name_hyphenated__';

class Amp__component_name_pascalcase__ extends BaseElement {
  /** @override */
  init() {
    // __do_not_submit__: This is example code only.
    this.registerApiAction('exampleToggle', (api) => api./*OK*/exampleToggle());

    return dict({
      // Extra props passed by wrapper AMP component
      'exampleTagNameProp': this.element.tagName,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-__component_name_hyphenated__'),
      'expected global "bento" or specific "bento-__component_name_hyphenated__" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '__component_version__', (AMP) => {
  AMP.registerElement(__register_element_args__);
});
