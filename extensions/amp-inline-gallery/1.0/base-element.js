import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';
import {dict} from '#core/types/object';
import {Component, ContextExporter, detached, props} from './element';

export const TAG = 'bento-inline-gallery';

export class BaseElement extends PreactBaseElement {
  /** @override */
  init() {
    return dict({
      'children': <ContextExporter shimDomElement={this.element} />,
    });
  }
}

/** @override */
BaseElement['Component'] = Component;

/** @override */
BaseElement['detached'] = detached;

/** @override */
BaseElement['props'] = props;
