/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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


import {ArticleComponent, ArticleComponentDef} from './components/article';
import {CtaLinkComponent, CtaLinkDef} from './components/cta-link';
import {HeadingComponent, HeadingComponentDef} from './components/heading';
import {LandscapeComponent, LandscapeComponentDef} from './components/landscape';
import {PortraitComponent, PortraitComponentDef} from './components/portrait';
import {htmlFor} from '../../../../src/static-template';

/** @type {string} */
export const TAG = 'amp-story-bookend';

/**
 * @typedef {{
 *   bookend-version: string,
 *   components: !Array<!BookendComponentDef>,
 *   share-providers: !Array<(!JsonObject|string|undefined)>,
 * }}
 */
export let BookendDataDef;

/**
 * @typedef {
 *   (!ArticleComponentDef|
 *    !CtaLinkDef|
 *    !HeadingComponentDef|
 *    !LandscapeComponentDef|
 *    !PortraitComponentDef)
 * }
 */
export let BookendComponentDef;

const articleComponentBuilder = new ArticleComponent();
const ctaLinkComponentBuilder = new CtaLinkComponent();
const headingComponentBuilder = new HeadingComponent();
const landscapeComponentBuilder = new LandscapeComponent();
const portraitComponentBuilder = new PortraitComponent();

/**
 * @typedef {
 *   (!ArticleComponent|
 *    !CtaLinkComponent|
 *    !HeadingComponent|
 *    !LandscapeComponent|
 *    !PortraitComponent)
 * }
 */
export let BookendComponentClass;

/**
 * Dispatches the components to their specific builder classes.
 * @param {string} componentType
 * @return {?BookendComponentClass}
 */
function componentBuilderInstanceFor(componentType) {
  switch (componentType) {
    case 'small':
      return articleComponentBuilder;
    case 'cta-link':
      return ctaLinkComponentBuilder;
    case 'heading':
      return headingComponentBuilder;
    case 'landscape':
      return landscapeComponentBuilder;
    case 'portrait':
      return portraitComponentBuilder;
    default:
      return null;
  }
}

/**
 * Delegator class that dispatches the logic to build different components
 * on the bookend to their corresponding classes.
 */
export class BookendComponent {
  /**
   * Takes components from JSON and delegates them to their corresponding
   * builder class.
   * @param {!Array<BookendComponentDef>} components
   * @return {!Array<BookendComponentDef>}
   */
  static buildFromJson(components) {
    return components.reduce((builtComponents, component) => {
      const componentBuilder = componentBuilderInstanceFor(component.type);
      if (!componentBuilder) {
        return;
      }
      componentBuilder.assertValidity(component);
      builtComponents.push(componentBuilder.build(component));
      return builtComponents;
    }, []);
  }

  /**
   * Delegates components to their corresponding template builder.
   * class.
   * @param {!Array<BookendComponentDef>} components
   * @param {!Document} doc
   * @return {!DocumentFragment}
   */
  static buildTemplates(components, doc) {
    const fragment = doc.createDocumentFragment();
    components.forEach(component => {
      const {type} = component;
      if (type && componentBuilderInstanceFor(type)) {
        fragment.appendChild(componentBuilderInstanceFor(type)
            .buildTemplate(component, doc));
      }
    });
    return fragment;
  }

  /**
   * Builds container for components.
   * @param {!Element} element Bookend container
   * @param {!Document} doc
   * @return {?Element}
   */
  static buildContainer(element, doc) {
    const html = htmlFor(doc);
    const containerTemplate =
      html`<div class="i-amphtml-story-bookend-component-set"></div>`;
    element.appendChild(containerTemplate);
    return element.lastElementChild;
  }
}
