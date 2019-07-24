/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {ExternalReorderHeadTransformer} from './external-reorder-head-transformer';
import {dict} from '../../../src/utils/object';
import {parseJson} from '../../../src/json';
import {startsWith} from '../../../src/string';
import {user, userAssert} from '../../../src/log';

const TAG = 'AMP-AD-NETWORK-FAKE-IMPL';

export class AmpAdNetworkFakeImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
    this.reorderHeadTransformer = new ExternalReorderHeadTransformer();
  }

  /** @override */
  buildCallback() {
    userAssert(
      this.element.hasAttribute('src'),
      'Attribute src required for <amp-ad type="fake">: %s',
      this.element
    );
    super.buildCallback();
  }

  /** @override */
  isValidElement() {
    // To send out ad request, ad type='fake' requires the id set to an invalid
    // value start with `i-amphtml-demo-`. So that fake ad can only be used in
    // invalid AMP pages.
    const id = this.element.getAttribute('id');
    if (!id || !startsWith(id, 'i-amphtml-demo-')) {
      user().warn(TAG, 'Only works with id starts with i-amphtml-demo-');
      return false;
    }
    return true;
  }

  /** @override */
  getAdUrl() {
    return this.element.getAttribute('src');
  }

  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then(response => {
      if (!response) {
        return null;
      }
      const {
        status,
        headers,
      } = /** @type {{status: number, headers: !Headers}} */ (response);

      // In the convert creative mode the content is the plain AMP HTML.
      // This mode is primarily used for A4A Envelop for testing.
      // See DEVELOPING.md for more info.
      if (this.element.getAttribute('a4a-conversion') == 'true') {
        return response.text().then(
          responseText =>
            new Response(this.transformCreative_(responseText), {
              status,
              headers,
            })
        );
      }

      // Normal mode: Expect the creative is written in AMP4ADS doc.
      return response;
    });
  }

  /**
   * Converts a general AMP doc to a AMP4ADS doc.
   * @param {string} source
   * @return {string}
   */
  transformCreative_(source) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    this.reorderHeadTransformer.reorderHead(doc.head);
    const metadata = this.generateMetadata_(doc);
    const root = doc.documentElement;

    // <html ⚡> -> <html ⚡4ads>
    if (root.hasAttribute('⚡')) {
      root.removeAttribute('⚡');
    } else if (root.hasAttribute('amp')) {
      root.removeAttribute('amp');
    } else if (root.hasAttribute('AMP')) {
      root.removeAttribute('AMP');
    }
    if (!root.hasAttribute('⚡4ads') && !root.hasAttribute('⚡4ADS')) {
      root.setAttribute('amp4ads', '');
    }

    const creative = root./*OK*/ outerHTML;
    const creativeSplit = creative.split('</body>');
    const docWithMetadata =
      creativeSplit[0] +
      `<script type="application/json" amp-ad-metadata>` +
      metadata +
      '</script></body>' +
      creativeSplit[1];
    return docWithMetadata;
  }

  /**
   * Generates metadata for AMP4ADS doc
   * @param {Document} doc
   * @return {string}
   */
  generateMetadata_(doc) {
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
        if (this.element.hasAttribute('amp-story')) {
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
      if (
        type == 'application/json' &&
        script.hasAttribute('amp-ad-metadata')
      ) {
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
    if (this.element.hasAttribute('amp-story')) {
      metadata['ctaType'] = ctaType;
      metadata['ctaUrl'] = ctaUrl;
    }
    return JSON.stringify(metadata);
  }
}

AMP.extension('amp-ad-network-fake-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-fake-impl', AmpAdNetworkFakeImpl);
});
