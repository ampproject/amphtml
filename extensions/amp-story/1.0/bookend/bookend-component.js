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

import {ArticleComponent, ArticleTitleComponent, BookendArticleComponentDef, BookendArticleTitleComponentDef} from './components/article';

/**
 * @typedef {{
 *   bookend-version: string,
 *   components: !Array<!BookendComponentDef>,
 *   share-providers: !Array<(!JsonObject|string|undefined)>,
 * }}
 */
export let BookendDataDef;

/**
 * @typedef {(!BookendArticleComponentDef|!BookendArticleTitleComponentDef)}
 */
export let BookendComponentDef;

const articleComponent = new ArticleComponent();
const articleTitleComponent = new ArticleTitleComponent();

/**
 * @typedef {(!ArticleComponent|!ArticleTitleComponent)}
 */
export let BookendComponentClass;

/**
 * Dispatches the components to their specific builder classes.
 * @param {string} componentType
 * @return {?BookendComponentClass}
 */
function componentClassFor(componentType) {
  switch (componentType) {
    case 'small':
      return articleComponent;
    case 'article-set-title':
      return articleTitleComponent;
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
      const klass = componentClassFor(component.type);
      if (!klass ||
          !klass.isValid(component)) {
        return;
      }
      builtComponents.push(klass.build(component));
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
      if (component.type && componentClassFor(component.type)) {
        fragment.appendChild(componentClassFor(component.type)
            .buildTemplate(component, doc));
      }
    });
    return fragment;
  }
}
