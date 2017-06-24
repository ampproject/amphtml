import {isLayoutSizeDefined} from '../../../src/layout';

class AmpLayout extends AMP.BaseElement {

    /** @override */
    isLayoutSupported(layout){
        return isLayoutSizeDefined(layout);
    }   
}

AMP.registerElement('amp-layout', AMPLayout);
