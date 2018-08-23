/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
/** Version: 0.1.22.24 */
function getReadyState(doc) {
  return                       (doc['readyState']);
}
function isDocumentReady(doc) {
  const readyState = getReadyState(doc);
  return readyState != 'loading' && readyState != 'uninitialized';
}
function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}
function onDocumentState(doc, stateFn, callback) {
  let ready = stateFn(doc);
  if (ready) {
    callback(doc);
  } else {
    const readyListener = () => {
      if (stateFn(doc)) {
        if (!ready) {
          ready = true;
          callback(doc);
        }
        doc.removeEventListener('readystatechange', readyListener);
      }
    };
    doc.addEventListener('readystatechange', readyListener);
  }
}
function whenDocumentReady(doc) {
  return new Promise(resolve => {
    onDocumentReady(doc, resolve);
  });
}

class Doc {
  getWin() {}
  getRootNode() {}
  getRootElement() {}
  getHead() {}
  getBody() {}
  isReady() {}
  whenReady() {}
}
class GlobalDoc {
  constructor(winOrDoc) {
    const isWin = !!winOrDoc.document;
    this.win_ = isWin ?
                               (winOrDoc) :
                               (
            (                         (winOrDoc)).defaultView);
    this.doc_ = isWin ?
                               (winOrDoc).document :
                                 (winOrDoc);
  }
  getWin() {
    return this.win_;
  }
  getRootNode() {
    return this.doc_;
  }
  getRootElement() {
    return this.doc_.documentElement;
  }
  getHead() {
    return                         (this.doc_.head);
  }
  getBody() {
    return this.doc_.body;
  }
  isReady() {
    return isDocumentReady(this.doc_);
  }
  whenReady() {
    return whenDocumentReady(this.doc_);
  }
}
function resolveDoc(input) {
  if ((                         (input)).nodeType ===                9) {
    return new GlobalDoc(                         (input));
  }
  if ((                       (input)).document) {
    return new GlobalDoc(                       (input));
  }
  return                     (input);
}

class PageConfig {
  constructor(productOrPublicationId, locked) {
    let publicationId, productId, label;
    const div = productOrPublicationId.indexOf(':');
    if (div != -1) {
      productId = productOrPublicationId;
      publicationId = productId.substring(0, div);
      label = productId.substring(div + 1);
    } else {
      publicationId = productOrPublicationId;
      productId = null;
      label = null;
    }
    this.publicationId_ = publicationId;
    this.productId_ = productId;
    this.label_ = label;
    this.locked_ = locked;
  }
  getPublicationId() {
    return this.publicationId_;
  }
  getProductId() {
    return this.productId_;
  }
  getLabel() {
    return this.label_;
  }
  isLocked() {
    return this.locked_;
  }
}

function hasNextNodeInDocumentOrder(element, opt_stopNode) {
  let currentElement = element;
  do {
    if (currentElement.nextSibling) {
      return true;
    }
  } while ((currentElement = currentElement.parentNode) &&
            currentElement != opt_stopNode);
  return false;
}

function isArray(value) {
  return Array.isArray(value);
}

function parseJson(json) {
  return                           (JSON.parse(                      (json)));
}
function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }
    return undefined;
  }
}

const ALREADY_SEEN = '__SWG-SEEN__';
class PageConfigResolver {
  constructor(winOrDoc) {
    this.doc_ = resolveDoc(winOrDoc);
    this.configResolver_ = null;
    this.configPromise_ = new Promise(resolve => {
      this.configResolver_ = resolve;
    });
    this.metaParser_ = new MetaParser(this.doc_);
    this.ldParser_ = new JsonLdParser(this.doc_);
    this.microdataParser_ = new MicrodataParser(this.doc_);
  }
  resolveConfig() {
    Promise.resolve().then(this.check.bind(this));
    this.doc_.whenReady().then(this.check.bind(this));
    return this.configPromise_;
  }
  check() {
    if (!this.configResolver_) {
      return null;
    }
    let config = this.metaParser_.check();
    if (!config) {
      config = this.ldParser_.check();
    }
    if (!config) {
      config = this.microdataParser_.check();
    }
    if (config) {
      this.configResolver_(config);
      this.configResolver_ = null;
    } else if (this.doc_.isReady()) {
      this.configResolver_(Promise.reject(
          new Error('No config could be discovered in the page')));
      this.configResolver_ = null;
    }
    return config;
  }
}
class MetaParser {
  constructor(doc) {
    this.doc_ = doc;
  }
  check() {
    if (!this.doc_.getBody()) {
      return null;
    }
    const productId = getMetaTag(this.doc_.getRootNode(),
        'subscriptions-product-id');
    if (!productId) {
      return null;
    }
    const accessibleForFree = getMetaTag(this.doc_.getRootNode(),
        'subscriptions-accessible-for-free');
    const locked = (accessibleForFree &&
        accessibleForFree.toLowerCase() == 'false') || false;
    return new PageConfig(productId, locked);
  }
}
class JsonLdParser {
  constructor(doc) {
    this.doc_ = doc;
  }
  check() {
    if (!this.doc_.getBody()) {
      return null;
    }
    const domReady = this.doc_.isReady();
    const elements = this.doc_.getRootNode().querySelectorAll(
        'script[type="application/ld+json"]');
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element[ALREADY_SEEN] ||
          !element.textContent ||
          !domReady && !hasNextNodeInDocumentOrder(element)) {
        continue;
      }
      element[ALREADY_SEEN] = true;
      if (element.textContent.indexOf('NewsArticle') == -1) {
        continue;
      }
      const possibleConfig = this.tryExtractConfig_(element);
      if (possibleConfig) {
        return possibleConfig;
      }
    }
    return null;
  }
  tryExtractConfig_(element) {
    const json = tryParseJson(element.textContent);
    if (!json) {
      return null;
    }
    if (!this.checkType_(json, 'NewsArticle')) {
      return null;
    }
    let productId = null;
    const partOfArray = this.valueArray_(json, 'isPartOf');
    if (partOfArray) {
      for (let i = 0; i < partOfArray.length; i++) {
        productId = this.discoverProductId_(partOfArray[i]);
        if (productId) {
          break;
        }
      }
    }
    if (!productId) {
      return null;
    }
    const isAccessibleForFree = this.bool_(
        this.singleValue_(json, 'isAccessibleForFree'),
                      true);
    return new PageConfig(productId, !isAccessibleForFree);
  }
  bool_(value, def) {
    if (value == null || value === '') {
      return def;
    }
    if (typeof value == 'boolean') {
      return value;
    }
    if (typeof value == 'string') {
      const lowercase = value.toLowerCase();
      if (lowercase == 'false') {
        return false;
      }
      if (lowercase == 'true') {
        return true;
      }
    }
    return def;
  }
  discoverProductId_(json) {
    if (!this.checkType_(json, 'Product')) {
      return null;
    }
    return                        (this.singleValue_(json, 'productID'));
  }
  valueArray_(json, name) {
    const value = json[name];
    if (value == null || value === '') {
      return null;
    }
    return isArray(value) ? value : [value];
  }
  singleValue_(json, name) {
    const valueArray = this.valueArray_(json, name);
    const value = valueArray && valueArray[0];
    return (value == null || value === '') ? null : value;
  }
  checkType_(json, expectedType) {
    const typeArray = this.valueArray_(json, '@type');
    if (!typeArray) {
      return false;
    }
    return (typeArray.includes(expectedType) ||
        typeArray.includes('http://schema.org/' + expectedType));
  }
}
class MicrodataParser {
  constructor(doc) {
    this.doc_ = doc;
    this.access_ = null;
    this.productId_ = null;
  }
  discoverAccess_(root) {
    const ALREADY_SEEN = 'alreadySeenForAccessInfo';
    const nodeList = root
        .querySelectorAll("[itemprop='isAccessibleForFree']");
    for (let i = 0; nodeList[i]; i++) {
      const element = nodeList[i];
      const content = element.getAttribute('content') || element.textContent;
      if (!content) {
        continue;
      }
      if (this.isValidElement_(element, root, ALREADY_SEEN)) {
        let accessForFree = null;
        if (content.toLowerCase() == 'true') {
          accessForFree = true;
        } else if (content.toLowerCase() == 'false') {
          accessForFree = false;
        }
        return accessForFree;
      }
    }
    return null;
  }
  isValidElement_(current, root, alreadySeen) {
    for (let node = current;
        node && !node[alreadySeen]; node = node.parentNode) {
      node[alreadySeen] = true;
      if (node.hasAttribute('itemscope')) {
        const type = node.getAttribute('itemtype');
        if (type.indexOf('http://schema.org/NewsArticle') >= 0) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }
  discoverProductId_(root) {
    const ALREADY_SEEN = 'alreadySeenForProductInfo';
    const nodeList = root
        .querySelectorAll('[itemprop="productID"]');
    for (let i = 0; nodeList[i]; i++) {
      const element = nodeList[i];
      const content = element.getAttribute('content') || element.textContent;
      const item = element.closest('[itemtype][itemscope]');
      const type = item.getAttribute('itemtype');
      if (type.indexOf('http://schema.org/Product') <= -1) {
        continue;
      }
      if (this.isValidElement_(item.parentElement, root, ALREADY_SEEN)) {
        return content;
      }
    }
    return null;
  }
  getPageConfig_() {
    let locked = null;
    if (this.access_ != null) {
      locked = !this.access_;
    } else if (this.doc_.isReady()) {
      locked = false;
    }
    if (this.productId_ != null && locked != null) {
      return new PageConfig(this.productId_, locked);
    }
    return null;
  }
  tryExtractConfig_() {
    let config = this.getPageConfig_();
    if (config) {
      return config;
    }
    const nodeList = this.doc_.getRootNode().querySelectorAll(
        '[itemscope][itemtype*="http://schema.org/NewsArticle"]');
    for (let i = 0; nodeList[i] && config == null; i++) {
      const element = nodeList[i];
      if (this.access_ == null) {
        this.access_ = this.discoverAccess_(element);
      }
      if (!this.productId_) {
        this.productId_ = this.discoverProductId_(element);
      }
      config = this.getPageConfig_();
    }
    return config;
  }
  check() {
    if (!this.doc_.getBody()) {
      return null;
    }
    return this.tryExtractConfig_();
  }
}
function getMetaTag(rootNode, name) {
  const el = rootNode.querySelector(`meta[name="${name}"]`);
  if (el) {
    return el.getAttribute('content');
  }
  return null;
}

export {
  Doc,
  PageConfig,
  PageConfigResolver,
};
