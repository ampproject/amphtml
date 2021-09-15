__jss_import_component_css__;
import {Bento__component_name_pascalcase__} from './component';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Bento__component_name_pascalcase__;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  // 'children': {passthroughNonEmpty: true},
  // 'children': {selector: '...'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

// __do_not_submit__: If BaseElement['shadowCss']  is set to `null`, remove the
// following declaration.
// Otherwise, keep it when defined to an actual value like `COMPONENT_CSS`.
// Once addressed, remove this set of comments.
/** @override */
BaseElement['shadowCss'] = __jss_component_css__;
