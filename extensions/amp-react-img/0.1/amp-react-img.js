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

import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
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

/**
 * @return {boolean}
 */
function testSrcsetSupport() {
  const support = 'srcset' in new Image();
  testSrcsetSupport = () => support;
  return support;
}

/**
 * @param {string|undefined} src
 * @param {string|undefined} srcset
 * @return {string|undefined}
 */
function guaranteeSrcForSrcsetUnsupportedBrowsers(src, srcset) {
  if (src !== undefined || testSrcsetSupport()) {
    return src;
  }
  const match = /\S+/.exec(srcset);
  return match ? match[0] : undefined;
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

      this.state = {
        prerender: true,
        element: props['i-amphtml-element'],
        layoutWidth: 0,
      };
      delete props['i-amphtml-element'];

      /** @private {boolean} */
      this.prerenderAllowed_ = !!props['noprerender'];

      /** @private {number} */
      this.currentSizesWidth_ = 0;

      /** @private {string|undefined} */
      this.currentSizes_ = undefined;
    }

    /**
     * @return {*}
     */
    render() {
      const props = pick(this.props, ATTRIBUTES_TO_PROPAGATE);

      const {id} = this.props;
      if (id) {
        props['amp-img-id'] = id;
      }
      props['src'] = guaranteeSrcForSrcsetUnsupportedBrowsers(
        props['src'],
        props['srcset']
      );
      props['sizes'] = this.maybeGenerateSizes_(props['sizes']);
      props['decoding'] = 'async';

      const {prerender} = this.state;
      if (prerender && !this.prerenderAllowed_) {
        delete props['src'];
        delete props['srcset'];
      }

      return react.createElement('img', props);
    }

    /**
     * @param {boolean} onLayout
     * @param {!../../../src/preconnect.Preconnect} preconnect
     */
    ampPreconnectCallback(onLayout, preconnect) {
      const {src, srcset} = this.props;
      if (src) {
        preconnect.url(src, onLayout);
      } else if (srcset) {
        // We try to find the first url in the srcset
        const srcseturl = /\S+/.exec(srcset);
        // Connect to the first url if it exists
        if (srcseturl) {
          preconnect.url(srcseturl[0], onLayout);
        }
      }
    }

    /**
     * @param {!../../../src/layout.Layout} layout
     * @return {boolean}
     */
    ampIsLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /**
     * @param {string|undefined} sizes
     * @return {string|undefined}
     * @private
     */
    maybeGenerateSizes_(sizes) {
      if (sizes) {
        return sizes;
      }
      const {'i-amphtml-layout': layout, srcset} = this.props;
      if (layout === Layout.INTRINSIC) {
        return;
      }

      if (!srcset || /[0-9]+x(?:,|$)/.test(srcset)) {
        return;
      }

      const {layoutWidth} = this.state;
      if (layoutWidth <= this.currentSizesWidth_) {
        return this.currentSizes_;
      }
      this.currentSizesWidth_ = layoutWidth;

      const viewportWidth = this.ampGetViewport().getWidth();

      const entry = `(max-width: ${viewportWidth}px) ${layoutWidth}px, `;
      let defaultSize = layoutWidth + 'px';

      if (layout !== Layout.FIXED) {
        const ratio = Math.round((layoutWidth * 100) / viewportWidth);
        defaultSize = Math.max(ratio, 100) + 'vw';
      }

      return (this.currentSizes_ = entry + defaultSize);
    }

    /**
     * @return {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    ampGetViewport() {
      return Services.viewportForDoc(this.ampGetAmpDoc());
    }

    /**
     * @return {!../../../src/service/ampdoc-impl.AmpDoc}
     */
    ampGetAmpDoc() {
      return this.state.element.getAmpDoc();
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
        const el = render(react.createElement(Component, this.attributes_()), this.element);
        this.el_ = el;
        el.setState({layoutWidth: this.getLayoutWidth()});
        this.rerender_();
      }

      /** @override */
      layoutCallback() {
        const el = devAssert(this.el_);
        el.setState({prerender: false});
        this.rerender_();
      }

      /** @override */
      mutatedAttributesCallback(mutations) {
        if (!this.el_) {
          return;
        }

        // Mutating src should override existing srcset, so remove the latter.
        if (
          mutations['src'] &&
          !mutations['srcset'] &&
          this.element.hasAttribute('srcset')
        ) {
          this.element.removeAttribute('srcset');
        }
        this.rerender_();
      }

      /** @override */
      preconnectCallback(onLayout) {
        const el = devAssert(this.el_);
        el.ampPreconnectCallback(onLayout, this.preconnect);
      }

      /** @override */
      onMeasureChanged() {
        const el = devAssert(this.el_);
        el.setState({layoutWidth: this.getLayoutWidth()});
        this.rerender_();
      }

      /**
       * @private
       */
      rerender_() {
        // While this "creates" a new element, React's diffing will not create
        // a second instance of Component. Instead, the existing one already
        // rendered into this element will be reusued.
        const el = react.createElement(Component, this.attributes_());
        render(el, this.element);
      }

      /**
       * @private
       * @return {!Object<string, string>}
       */
      attributes_() {
        const out = {};
        const {attributes} = this.element;
        for (let i = 0, l = attributes.length; i < l; i++) {
          const attr = attributes[i];
          out[attr.name] = attr.value;
        }
        out['i-amphtml-element'] = this.element;
        return out;
      }
    };
  }

  // In AMP pages, we do the regular registration of our wrapped component.
  const AmpReactImg = ReactCompatibleBaseElement(AmpImg);
  AMP.registerElement('amp-react-img', AmpReactImg);
});
