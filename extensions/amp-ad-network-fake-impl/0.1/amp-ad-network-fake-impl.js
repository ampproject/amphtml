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

import { AmpA4A } from '../../amp-a4a/0.1/amp-a4a';
import { startsWith, endsWith } from '../../../src/string';
import { user, userAssert } from '../../../src/log';

const TAG = 'AMP-AD-NETWORK-FAKE-IMPL';

const headComponents = {
  metaOther: [],
  scriptNonRenderDelayingExtensions: [],
  scriptRenderDelayingExtensions: [],
  linkIcons: [],
  linkResourceHints: [],
  linkStylesheetBeforeAmpCustom: [],
  other: [],
  styleAmpRuntime: null,
  metaCharset: null,
  scriptAmpEngine: null,
  scriptAmpViewer: null,
  scriptGmailAmpViewer: null,
  styleAmpCustom: null,
  linkStylesheetRuntimeCss: null,
  styleAmpBoilerplate: null,
  noscript: null,
};

export class AmpAdNetworkFakeImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

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
    this.reorderHead_(doc.head);
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

    const creative = root.outerHTML;
    const creativeSplit = creative.split('</body>');
    const docWithMetadata = creativeSplit[0] + `<script type='application/json' amp-ad-metadata>` + metadata + '</script></body>' + creativeSplit[1];
    return docWithMetadata;
  }

  generateMetadata_(doc) {
    const head = doc.head;
    let metadata = {};
    const jsonMetadata = [];
    const styles = [];
    const extensions = [];
    let firstRuntimeElement, lastRuntimeElement;
    let ctaType, ctaUrl;
    if (head != null) {
      for (let child of head.children) {
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
          let styleJson = {href: child.getAttribute('href')};
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
      let img = imgs[i];
      let width, height, area = -1;
      if (img.hasAttribute('width')) {
        width = img.getAttribute(width);
      }
      if (img.hasAttribute('height')) {
        height = img.getAttribute('height');
      }
      if (height && width) {
        area = height * width;
      }
      imgMetadata.push({
        src: img.getAttribute('src'),
        area: area,
      });
    }

    const json = doc.querySelectorAll('script[type]');
    for (let i = 0; i < json.length; i++) {
      const script = json[i];
      const type = script.getAttribute('type');
      if (type == 'application/json' && script.hasAttribute('id') && !jsonMetadata.includes(script.getAttribute('id'))) {
        jsonMetadata.push(script.getAttribute('id'));
      }
    }
    const ampAnalytics = doc.querySelector('amp-analytics');
    if (ampAnalytics && !jsonMetadata.includes('amp-analytics')) {
      jsonMetadata.push('amp-analytics');
    }

    const creative = doc.documentElement.outerHTML;
    let start = 0;
    let end = 0;
    if (firstRuntimeElement != null) {
      firstRuntimeElement = firstRuntimeElement.outerHTML;
      lastRuntimeElement = lastRuntimeElement.outerHTML;
      start = creative.indexOf(firstRuntimeElement);
      end =
        creative.indexOf(lastRuntimeElement) + lastRuntimeElement.length;
    }
    metadata['ampRuntimeUtf16CharOffsets'] = [start, end];

    if (jsonMetadata.size > 0) {
      metadata['jsonUtf16CharOffsets'] = {};
      for (let name of jsonMetadata) {
        let nameElementString;
        if (name != 'amp-analytics') {
          nameElementString = doc
          .getElementById(name)
          .outerHTML;
        } else {
          nameElementString = doc.querySelector('amp-analytics').child.outerHTML;
        }
        const jsonStart = creative.indexOf(nameElementString);
        const jsonEnd = jsonStart + nameElementString.length;
        metadata['jsonUtf16CharOffsets'][name] = [jsonStart, jsonEnd];
      }
    }
    metadata['customElementExtensions'] = [];
    metadata['extensions'] = [];
    for (let extension of extensions) {
      let custom;
      if (extension['custom-element'] != null) {
        custom = extension['custom-element'];
      } else {
        custom = extension['custom-template'];
      }
      if (!metadata['customElementExtensions'].includes(custom)) {
        metadata['customElementExtensions'].push(custom);
        metadata['extensions'].push({
          'custom-element': custom,
          'src': extension['src']
        });
      }
    }

    metadata['customStyleSheets'] = styles;
    metadata['ampImages'] = [];
    for (let img of imgMetadata) {
      metadata['ampImages'].push(img.src);
    }
    if (this.element.hasAttribute('amp-story')) {
      metadata['ctaType'] = ctaType;
      metadata['ctaUrl'] = ctaUrl;
    }
    return JSON.stringify(metadata);
  }

  appendIfNotNull_(parent, element) {
    if (element != null) {
      parent.appendChild(element);
    }
  }

  appendAll_(parent, element) {
    for (let child of element) {
      parent.appendChild(child);
    }
  }

  reorderHead_(head) {
    if (head != null) {
      for (let child of head.children) {
        switch (child.tagName) {
          case 'META':
            this.registerMeta(child);
            break;
          case 'SCRIPT':
            this.registerScript(child);
            break;
          case 'STYLE':
            this.registerStyle(child);
            break;
          case 'LINK':
            this.registerLink(child);
            break;
          case 'NOSCRIPT':
            headComponents.noscript = child;
          default:
            if (!headComponents.other.includes(child)) {
              headComponents.other.push(child);
            }
            break;
        }
      }
    }
    head.innerHTML = '';
    this.repopulate(head);
    return head;
  }

  repopulate(head) {
    this.appendIfNotNull_(head, headComponents.metaCharset);
    this.appendIfNotNull_(head, headComponents.linkStylesheetRuntimeCss);
    this.appendIfNotNull_(head, headComponents.styleAmpRuntime);
    this.appendAll_(head, headComponents.metaOther);
    this.appendIfNotNull_(head, headComponents.scriptAmpEngine);
    this.appendIfNotNull_(head, headComponents.scriptAmpViewer);
    this.appendIfNotNull_(head, headComponents.scriptGmailAmpViewer);
    this.appendAll_(head, headComponents.scriptRenderDelayingExtensions);
    this.appendAll_(head, headComponents.scriptNonRenderDelayingExtensions);
    this.appendAll_(head, headComponents.linkIcons);
    this.appendAll_(head, headComponents.linkResourceHints);
    this.appendAll_(head, headComponents.linkStylesheetBeforeAmpCustom);
    this.appendIfNotNull_(head, headComponents.styleAmpCustom);
    this.appendAll_(head, headComponents.other);
    this.appendIfNotNull_(head, headComponents.styleAmpBoilerplate);
    this.appendIfNotNull_(head, headComponents.noscript);
    return head;
  }

  registerMeta(element) {
    if (element.hasAttribute('charset')) {
      headComponents.metaCharset = element;
      return;
    }
    if (!headComponents.metaOther.includes(element)) {
      headComponents.metaOther.push(element);
      return;
    }
  }

  registerScript(element) {
    const src = element.getAttribute('src');
    const isAsync = element.hasAttribute('async');
    const isExtension = element.hasAttribute('custom-element') || element.hasAttribute('custom-template') || element.hasAttribute('host-service');
    if (isExtension) {
      const custom = element.getAttribute('custom-element');
      if (custom == 'amp-story' || custom == 'amp-experiment' || custom == 'amp-dynamic-css-classes') {
        headComponents.scriptRenderDelayingExtensions.push(element);
        return;
      }
      headComponents.scriptNonRenderDelayingExtensions.push(element);
      return;
    }
    if (isAsync && startsWith(src, 'https://cdn.ampproject.org/') && (endsWith(src, "/v0.js") || endsWith(src, "/v0.js.br") || endsWith(src, "/amp4ads-v0.js") || endsWith(src, "/amp4ads-v0.js.br"))) {
      headComponents.scriptAmpEngine = element;
      return;
    }
    if (isAsync && startsWith(src, "https://cdn.ampproject.org/v0/amp-viewer-integration-gmail-") && endsWith(src, '.js')) {
      headComponents.scriptGmailAmpViewer = element;
      return;
    }
    if (isAsync && (startsWith(src, 'https://cdn.ampproject.org/v0/amp-viewer-integration-') || startsWith(src, 'https://cdn.ampproject.org/viewer/google/v') && endsWith(src, '.js'))) {
      headComponents.scriptAmpViewer = element;
      return;
    }
    headComponents.other.push(element);
  }

  registerStyle(element) {
    if (element.hasAttribute('amp-runtime')) {
      headComponents.styleAmpRuntime = element;
      return;
    }
    if (element.hasAttribute('amp-custom')) {
      headComponents.styleAmpCustom = element;
      return;
    }
    if (
      element.hasAttribute('amp-boilerplate') ||
      element.hasAttribute('amp4ads-boilerplate')
    ) {
      headComponents.styleAmpBoilerplate = element;
      return;
    }
    headComponents.other.push(element);
  }

  registerLink(element) {
    const rel = element.getAttribute('rel');
    if (rel == 'stylesheet') {
      if (startsWith(element.getAttribute('href'), 'https://cdn.ampproject.org/') && endsWith(element.getAttribute('href'), '/v0.css')) {
        headComponents.linkStylesheetRuntimeCss = element;
        return;
      }
      if (headComponents.styleAmpCustom == null) {
        headComponents.linkStylesheetBeforeAmpCustom.push(element);
        return;
      }
      return;
    }
    if (rel == 'icon' || rel == 'icon shortcut' || rel == 'shortcut icon') {
      headComponents.linkIcons.push(element);
      return;
    }
    if (rel == 'dns-prefetch preconnect') {
      headComponents.linkResourceHints.push(element);
      return;
    }
    headComponents.other.push(element);
  }
}

AMP.extension('amp-ad-network-fake-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-fake-impl', AmpAdNetworkFakeImpl);
});
