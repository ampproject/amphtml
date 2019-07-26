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

import {dict} from '../../../src/utils/object';
import {parseJson} from '../../../src/json';

/**
 * Creates a JSON metadata in which custom stylesheets, extensions
 * and runtime offsets are recorded. This is used by AMP4ADS at runtime
 * for embedding an ad into an enclosing document.
 * Please note: once runtime offsets are computed the document must not
 * change.
 *
 * https://cs.corp.google.com/piper///depot/google3/search/amphtml/transformers/amp_ad_metadata_transformer.cc
 * @param {Document} doc
 * @return {string}
 */
export function generateMetadata(doc) {
  const {head} = doc;
  const metadata = dict({});
  const jsonMetadata = [];
  const styles = [];
  const extensions = [];
  let firstRuntimeElement, lastRuntimeElement;
  let ctaType, ctaUrl;
  if (head != null) {
    for (let i = 0; i < head.children.length; i++) {
      const child = head.children.item(i);
      if (child.tagName == 'SCRIPT') {
        if (child.hasAttribute('src')) {
          if (firstRuntimeElement == null) {
            firstRuntimeElement = child;
          }
          lastRuntimeElement = child;
          if (child.hasAttribute('custom-element')) {
            extensions.push({
              'custom-element': child.getAttribute('custom-element'),
              'src': child.getAttribute('src'),
            });
          }
          if (child.hasAttribute('custom-template')) {
            extensions.push({
              'custom-template': child.getAttribute('custom-template'),
              'src': child.getAttribute('src'),
            });
          }
        }
      }
      if (
        child.tagName == 'LINK' &&
        child.getAttribute('rel') == 'stylesheet' &&
        child.hasAttribute('href')
      ) {
        const styleJson = {href: child.getAttribute('href')};
        if (child.hasAttribute('media')) {
          styleJson.media = child.getAttribute('media');
        }
        styles.push(styleJson);
      }
      if (
        child.tagName == 'META' &&
        child.hasAttribute('name') &&
        child.hasAttribute('content')
      ) {
        if (child.getAttribute('name') == 'amp-cta-type') {
          ctaType = child.getAttribute('content');
        }
        if (child.getAttribute('name') == 'amp-cta-url') {
          ctaUrl = child.getAttribute('content');
        }
      }
    }
  }
  const imgMetadata = [];
  const imgs = doc.querySelectorAll('amp-img[src]');
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    let width,
      height,
      area = -1;
    if (img.hasAttribute('width')) {
      width = img.getAttribute('width');
    }
    if (img.hasAttribute('height')) {
      height = img.getAttribute('height');
    }
    if (height && width) {
      area = height * width;
    }
    imgMetadata.push({
      src: img.getAttribute('src'),
      area,
    });
  }

  const json = doc.querySelectorAll('script[type]');
  for (let i = 0; i < json.length; i++) {
    const script = json[i];
    const type = script.getAttribute('type');
    if (
      type == 'application/json' &&
      script.hasAttribute('id') &&
      !jsonMetadata.includes(script.getAttribute('id'))
    ) {
      jsonMetadata.push(script.getAttribute('id'));
    }
    if (type == 'application/json' && script.hasAttribute('amp-ad-metadata')) {
      const parsed = parseJson(script.textContent);
      for (const attribute in parsed) {
        metadata[attribute] = parsed[attribute];
      }
    }
  }
  const ampAnalytics = doc.querySelector('amp-analytics');
  if (ampAnalytics && !jsonMetadata.includes('amp-analytics')) {
    jsonMetadata.push('amp-analytics');
  }

  const creative = doc.documentElement./*REVIEW*/ outerHTML;
  let start = 0;
  let end = 0;
  if (firstRuntimeElement != null) {
    firstRuntimeElement = firstRuntimeElement./*REVIEW*/ outerHTML;
    lastRuntimeElement = lastRuntimeElement./*REVIEW*/ outerHTML;
    start = creative.indexOf(firstRuntimeElement);
    end = creative.indexOf(lastRuntimeElement) + lastRuntimeElement.length;
  }
  metadata['ampRuntimeUtf16CharOffsets'] = [start, end];

  if (jsonMetadata.length > 0) {
    metadata['jsonUtf16CharOffsets'] = {};
    for (let i = 0; i < jsonMetadata.length; i++) {
      const name = jsonMetadata[i];
      let nameElementString;
      if (name != 'amp-analytics') {
        nameElementString = doc.getElementById(name)./*REVIEW*/ outerHTML;
      } else {
        nameElementString = ampAnalytics./*REVIEW*/ innerHTML;
      }
      const jsonStart = creative.indexOf(nameElementString);
      const jsonEnd = jsonStart + nameElementString.length;
      metadata['jsonUtf16CharOffsets'][name] = [jsonStart, jsonEnd];
    }
  }
  if (extensions.length > 0) {
    metadata['customElementExtensions'] = [];
    metadata['extensions'] = [];
    for (let i = 0; i < extensions.length; i++) {
      const extension = extensions[i];
      let custom;
      if (extension['custom-element'] != null) {
        custom = extension['custom-element'];
      } else {
        custom = extension['custom-template'];
      }
      if (metadata['customElementExtensions'].indexOf(custom) == -1) {
        metadata['customElementExtensions'].push(custom);
        metadata['extensions'].push({
          'custom-element': custom,
          'src': extension['src'],
        });
      }
    }
  }

  if (styles.length > 0) {
    metadata['customStyleSheets'] = styles;
  }
  if (imgMetadata.length > 0) {
    metadata['images'] = [];
    for (let i = 0; i < imgMetadata.length; i++) {
      const img = imgMetadata[i];
      metadata['images'].push(img.src);
    }
  }
  if (ctaType) {
    metadata['ctaType'] = ctaType;
  }
  if (ctaUrl) {
    metadata['ctaUrl'] = ctaUrl;
  }
  return JSON.stringify(metadata);
}
