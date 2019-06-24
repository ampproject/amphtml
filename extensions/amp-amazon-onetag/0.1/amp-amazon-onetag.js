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

import {Layout} from '../../../src/layout';
import {loadScript} from '../../../3p/3p';

export class AmpAmazonOnetag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.document = element.ownerDocument;
  }

  /** @override */
  buildCallback() {
    const onetagEndpoints = new Map();
    onetagEndpoints.set("US", "z-na.associates-amazon.com");
    onetagEndpoints.set("CA", "z-na.associates-amazon.com");
    onetagEndpoints.set("MX", "z-na.associates-amazon.com");
    onetagEndpoints.set("BR", "z-na.associates-amazon.com");
    onetagEndpoints.set("GB", "z-eu.associates-amazon.com");
    onetagEndpoints.set("DE", "z-eu.associates-amazon.com");
    onetagEndpoints.set("FR", "z-eu.associates-amazon.com");
    onetagEndpoints.set("IT", "z-eu.associates-amazon.com");
    onetagEndpoints.set("ES", "z-eu.associates-amazon.com");
    onetagEndpoints.set("IN", "z-eu.associates-amazon.com");
    onetagEndpoints.set("NL", "z-eu.associates-amazon.com");
    onetagEndpoints.set("SA", "z-eu.associates-amazon.com");
    onetagEndpoints.set("TR", "z-eu.associates-amazon.com");
    onetagEndpoints.set("AE", "z-eu.associates-amazon.com");

    var marketplace = this.element.getAttribute('marketplace');
    var instanceID = this.element.getAttribute('instanceID');
    if (onetagEndpoints.has(marketplace))  {
      var scriptURL = "https://" + onetagEndpoints.get(marketplace) + "/widgets/onejs?MarketPlace=" + marketplace + "&adInstanceId=" + instanceID;
      loadScript(this, scriptURL);  
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }
}

AMP.extension('amp-amazon-onetag', '0.1', AMP => {
  AMP.registerElement('amp-amazon-onetag', AmpAmazonOnetag);
});
