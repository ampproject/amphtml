import {BaseElement} from './base-element';
__css_import__;
import {isExperimentOn} from '#experiments';
import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-__component_name_hyphenated__';

class Amp__component_name_pascalcase__ extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    // __do_not_submit__: This is example code only.
    this.registerApiAction('exampleToggle', (api) => api./*OK*/exampleToggle());

    return {
      // Extra props passed by wrapper AMP component
      exampleTagNameProp: this.element.tagName,
    };
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
