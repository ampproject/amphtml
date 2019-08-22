/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {devAssert} from '../../../src/log';
import {requireExternal} from '../../../src/module';

/**
 * @param {!Object<string, *>} props
 * @param {!Array<string>} keys
 * @return {!Object<string, *>}
 */
function pick(props, keys) {
  const out = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = props[key];
    if (value !== undefined) {
      out[key] = value;
    }
  }

  return out;
}

const ATTRIBUTES_TO_PROPAGATE = [
  'alt',
  'title',
  'referrerpolicy',
  'aria-label',
  'aria-describedby',
  'aria-labelledby',
  'srcset',
  'src',
  'sizes',
];

AMP.extension('amp-react-img', '0.1', AMP => {
  const react = requireExternal('react');
  const {render} = requireExternal('react-dom');

  /**
   * We'll implement all our new extensions as React/Preact Components (TBD).
   * They're true Components, not AmpElements/Amp.BaseElements.
   */
  class AmpImg extends react.Component {
    /**
     * @param {!Object} props
     */
    constructor(props) {
      super(props);

      this.state = {prerender: true};
    }

    /**
     * @return {*}
     */
    render() {
      const props = pick(this.props, ATTRIBUTES_TO_PROPAGATE);
      const {id, 'i-amphtml-ssr': ssr} = this.props;
      if (ssr) {
        // TODO: Figure out SSR children
      }

      if (id) {
        props['amp-img-id'] = id;
      }
      props['decoding'] = 'async';

      // amp-img is always allowed to render, but we want to make this interesting...
      const {prerender} = this.state;
      if (prerender) {
        delete props['src'];
        delete props['srcset'];
      }

      return react.createElement('img', props);
    }
  }

  /**
   * ReactCompatibleBaseElement is a compatibility wrapper around AMP's
   * BaseElement. It takes a Component to compose, and calls renders the
   * component with any state necessary.
   *
   * This code can be shared across multiple extensions, all they need to do is
   * supply the Component.
   *
   * This is only necessary in when in AMP pages. If we're in a Bento page,
   * this code is useless. We'll supply a CustomElement factory class that will
   * provide compatibilty between CE and React.
   *
   * @param {!React.Component} Component
   * @return {Amp.BaseElement}
   */
  function ReactCompatibleBaseElement(Component) {
    return class ReactBaseElement extends AMP.BaseElement {
      /** @param {!AmpElement} element */
      constructor(element) {
        super(element);

        /** @private {?Component} */
        this.el_ = null;
      }

      /**
       * For demo purposes.
       * @override
       */
      renderOutsideViewport() {
        return false;
      }

      /** @override */
      isLayoutSupported() {
        return true;
      }

      /** @override */
      buildCallback() {
        const el = react.createElement(Component, this.attributes_());
        this.el_ = render(el, this.element);
      }

      /** @override */
      layoutCallback() {
        const el = devAssert(this.el_);
        el.setState({prerender: false});

        const rerender = react.createElement(Component, this.attributes_());
        render(rerender, this.element);
      }

      /**
       * @return {!Object<string, string>}
       */
      attributes_() {
        const out = {};
        const {attributes} = this.element;
        for (let i = 0, l = attributes.length; i < l; i++) {
          const attr = attributes[i];
          out[attr.name] = attr.value;
        }
        return out;
      }
    };
  }

  // In AMP pages, we do the regular registration of our wrapped component.
  const AmpReactImg = ReactCompatibleBaseElement(AmpImg);
  AMP.registerElement('amp-react-img', AmpReactImg);
});
