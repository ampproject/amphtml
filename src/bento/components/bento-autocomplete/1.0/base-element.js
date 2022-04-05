import {getValueForExpr} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import {PreactBaseElement} from '#preact/base-element';

import {user} from '#utils/log';

import {BentoAutocomplete} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';
import {TAG} from './constants';

export class BaseElement extends PreactBaseElement {
  /**
   * Reads the 'items' data from the child <script> element.
   * For use with static local data.
   * @param {!Element} script
   * @return {!Array<!JsonObject|string>}
   * @private
   */
  getInlineData_(script) {
    const json = tryParseJson(script.textContent, (error) => {
      throw error;
    });
    const itemsExpr = this.element.getAttribute('items') || 'items';
    const items = getValueForExpr(/**@type {!JsonObject}*/ (json), itemsExpr);
    if (!items) {
      user().warn(
        TAG,
        'Expected key "%s" in data but found nothing. Rendering empty results.',
        itemsExpr
      );
      return [];
    }
    return user().assertArray(items);
  }

  /**
   * Gets JSON props from optional script tag.
   * Example:
   * <script type="application/json">{"items": ["one", "two", "three"]}</script>
   * @override
   * */
  getDefaultProps() {
    const jsonScript = this.element.querySelector(
      'script[type="application/json"]'
    );
    if (jsonScript) {
      const items = this.getInlineData_(jsonScript);
      return {items};
    } else if (!this.element.hasAttribute('src')) {
      user().warn(
        TAG,
        'Expected a <script type="application/json"> child or ' +
          'a URL specified in "src".'
      );
    }
    return super.getDefaultProps();
  }
}

/** @override */
BaseElement['Component'] = BentoAutocomplete;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'filter': {attr: 'filter'},
  'highlightUserEntry': {attr: 'highlight-user-entry', type: 'boolean'},
  'id': {attr: 'id'},
  'inline': {attr: 'inline'},
  'maxItems': {attr: 'max-items', type: 'number'},
  'minChars': {attr: 'min-chars', type: 'number'},
  'src': {attr: 'src'},
  'suggestFirst': {attr: 'suggest-first', type: 'boolean'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
