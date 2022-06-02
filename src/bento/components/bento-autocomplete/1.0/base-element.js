import mustache from '#bento/components/bento-mustache/1.0/bento-mustache';
import {getTemplate} from '#bento/util/template';

import {isArray} from '#core/types';
import {getValueForExpr} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';

import {BentoAutocomplete} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

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
      this.win.console /* OK */
        .warn(
          `Expected key "${itemsExpr}" in data but found nothing. Rendering empty results.`
        );
      return [];
    }
    if (!isArray(items)) {
      throw new Error('Items must be array type');
    }
    return items;
  }

  /**
   * Gets JSON props from optional script tag.
   * Example:
   * <script type="application/json">{"items": ["one", "two", "three"]}</script>
   * @override
   * */
  getDefaultProps() {
    const defaultProps = super.getDefaultProps();
    const jsonScript = this.element.querySelector(
      'script[type="application/json"]'
    );
    if (jsonScript) {
      const items = this.getInlineData_(jsonScript);
      return {
        ...defaultProps,
        items,
      };
    } else if (!this.element.hasAttribute('src')) {
      this.win.console /*OK*/
        .warn(
          `Expected a <script type="application/json"> child or a URL specified in "src"`
        );
    }
    return defaultProps;
  }

  /** @override */
  checkPropsPostMutations() {
    const template = getTemplate(this.element);
    if (!template) {
      return;
    }

    this.mutateProps({
      'itemTemplate': (data) => {
        const html = mustache.render(template./*OK*/ innerHTML, data);
        return <div dangerouslySetInnerHTML={{__html: html}} />;
      },
    });
  }
}

/** @override */
BaseElement['Component'] = BentoAutocomplete;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'filter': {attr: 'filter'},
  'filterValue': {attr: 'filter-value'},
  'highlightUserEntry': {attr: 'highlight-user-entry', type: 'boolean'},
  'id': {attr: 'id'},
  'inline': {attr: 'inline'},
  'maxItems': {attr: 'max-items', type: 'number'},
  'minChars': {attr: 'min-chars', type: 'number'},
  'prefetch': {attr: 'prefetch', type: 'boolean'},
  'src': {attr: 'src'},
  'submitOnEnter': {attr: 'submit-on-enter', type: 'boolean'},
  'suggestFirst': {attr: 'suggest-first', type: 'boolean'},
  'query': {attr: 'query', type: 'string'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
