<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<table>
  <tr>
    <td class="col-fourty"><strong>Description</strong></td>
    <td>Allows publishers to easily integrate with the <a href="https://www.laterpay.net">LaterPay</a> micropayments platform. <code>amp-access-laterpay</code> is based on, and requires <a href="https://www.ampproject.org/docs/reference/components/amp-access">AMP Access</a>.</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Availability</strong></td>
    <td>Stable</td>
  </tr>
  <tr>
    <td class="col-fourty"><strong>Required Scripts</strong></td>
    <td>
        <small>Notice that you need scripts for "amp-access-laterpay", "amp-access" and "amp-analytics".</small>
      <div>
        <code>&lt;script async custom-element="amp-access" src="https://cdn.ampproject.org/v0/amp-access-0.1.js">&lt;/script></code>
      </div>
      <div>
        <code>&lt;script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js">&lt;/script></code>
      </div>
      <div>
        <code>&lt;script async custom-element="amp-access-laterpay" src="https://cdn.ampproject.org/v0/amp-access-laterpay-0.1.js">&lt;/script></code>
      </div>

    </td>
  </tr>
</table>



## Behavior

The `amp-access-laterpay` component uses AMP Access internally to provide a behavior similar to AMP Access, but tailored for usage with the LaterPay service. <a href="https://laterpay.net">LaterPay</a> is a micropayment platform that allows users to buy any online content with just two clicks, and get immediate access – without upfront registration, personal data, or payment. Users only pay, once their purchases have reached a total of $5 or 5€ across websites. Content providers can sell individual items or time passes, which allow flatrate access or time limited access to content.

The `amp-access-laterpay` component does not require an authorization or pingback configuration, because it is pre-configured to work with the LaterPay service. It also does not require manual setup of login links.

The different purchase options can be configured on the publisher's LaterPay account, and the component will retrieve the configuration and create a list of available purchase options.

You can refer to the documentation on configuring the [LaterPay Connector](http://docs.laterpay.net/connector/configuring/), LaterPay's existing front-end integration, to learn how to configure the purchase options.

The generated list can be styled and presented according to the publisher's preference.

This component also relies on [Access Content Markup](https://www.ampproject.org/docs/reference/components/amp-access#access-content-markup) to show and hide content.

## Configuration

Configuration is similar to AMP Access, but no authorization, pingback and login links are required.

```html
<script id="amp-access" type="application/json">
  {
    "vendor": "laterpay",
    "laterpay": {
      "property": value
    }
  }
</script>
```

The following values can be set in the `laterpay` config object:

<table>
  <tr>
    <th class="col-fourty">Property</th>
    <th class="col-twenty">Values</th>
    <th class="col-fourty">Description</th>
  </tr>
  <tr>
    <td><code>articleTitleSelector</code></td>
    <td>CSS selector <strong>required</strong></td>
    <td>A CSS selector which determines the element in the page which contains the title of the article. This will ensure the page presented for purchase of the article will contain this title so the user is aware of what they're purchasing.</td>
  </tr>
  <tr>
    <td><code>articleId</code></td>
    <td>Comma separated list of identifiers</td>
    <td>By default, the URL of an article is used to match it to a purchase option, but instead of specifying a URL path for a purchase option you can set an Article ID in the LaterPay Connector-UI and then use the <code>articleId</code> property to match the article with the purchase option.
    <br />
    This is necessary in cases where matching a purchase option by an article’s URL is not flexible enough. See the <a href="http://docs.laterpay.net/connector/inpage_configuration/article_id/">configuration page for the LaterPay Connector()</a> to see learn about some example scenarios in which this is useful.</td>
  </tr>
  <tr>
    <td><code>locale</code></td>
    <td>string</td>
    <td>Defines the style of price formatting appropriate for the locale.</td>
  </tr>
  <tr>
    <td><code>localeMessages</code></td>
    <td>object</td>
    <td>Allows the publisher to customize or localize the text present in the generated list of purchase options. See the <a href="#localization">Localization</a> section for more information.</td>
  </tr>
  <tr>
    <td><code>scrollToTopAfterAuth</code></td>
    <td>boolean</td>
    <td>If true, scrolls the page to the top after the authorization process is successful. This can be helpful if the place where you show the dialog is further below in the page and the user could be confused by their current scroll position after returning to the page.</td>
  </tr>
  <tr>
    <td><code>sandbox</code></td>
    <td>boolean</td>
    <td>Only needed if you are using the sandbox mode to test out your server configuration. You also need to use AMP's <a href="https://www.ampproject.org/docs/reference/spec#amp-runtime">development mode</a>.</td>
  </tr>
</table>

## Using Access Content Markup and showing the purchase list

Access Content Markup should be used in the same way as with AMP Access.

The element with id `amp-access-laterpay-dialog` will render a list of purchase options when the user does not have access to the article. This list has some very basic styling and can be customized to feel more integrated in the publisher's page.

Make sure you add the `amp-access-laterpay` class if you want to use the default styling.

```html
<section amp-access="NOT error AND NOT access" amp-access-hide>
  <div id="amp-access-laterpay-dialog" class="amp-access-laterpay"></div>
</section>

<section amp-access="error" amp-access-hide class="error-section">
  Oops... Something broke.
</section>

<div amp-access="access" amp-access-hide>
  <p>...article content...</p>
</div>
```

## Styling

Multiple classes are applied to some of the elements in the generated markup. Elements with no classes can be referred unambiguously through CSS element selectors.

Some basic layout CSS already exists, but it's recommended that publishers style it to match the look and feel of their pages.

The structure created for the dialog looks as follows:

```html
<div id="amp-access-laterpay-dialog" class="amp-access-laterpay">
  <p class="amp-access-laterpay-header">
    Optional, appears if header locale message is defined.
  </p>
  <ul>
    <li>
      <label>
        <input name="purchaseOption" type="radio" />
        <div class="amp-access-laterpay-metadata">
          <span class="amp-access-laterpay-title">Purchase option title</span>
          <p class="amp-access-laterpay-description">Purchase option description</p>
        </div>
      </label>
      <p class="amp-access-laterpay-price-container">
        <span class="amp-access-laterpay-price">0.15</span>
        <sup class="amp-access-laterpay-currency">USD</sup>
      </p>
    </li>
    <!-- ... more list items for other purchase options ... -->
  </ul>
  <button class="amp-access-laterpay-purchase-button">Buy Now</button>
  <p class="amp-access-laterpay-already-purchased-container">
    <a href="...">I already bought this</a>
  </p>
  <p class="amp-access-laterpay-footer">
    Optional, appears if footer locale message is defined.
  </p>
</div>
```

## Localization

The text shown in the dialog for the purchase options will be defined by the publisher in the LaterPay Connector UI.

The remaining text is part of the extended component and can be changed and localized via the configuration options as follows:

```html
<script id="amp-access" type="application/json">
  {
    "vendor": "laterpay",
    "laterpay": {
      "localeMessages": {
        "messageKey": "message value"
      }
    }
  }
</script>
```

The following message keys can be translated or customized, but be aware that they should retain their original meaning and intent.

<table>
  <tr>
    <th class="col-fourty">Key</th>
    <th class="col-fourty">Description</th>
    <th>Default value</th>
  </tr>
  <tr>
    <td><code>premiumContentTitle</code></td>
    <td>The Premium Content purchase option allows the user to buy just the currently shown article for the specified price. The title for this option cannot be specified in the Connector UI but it can be customized here.</td>
    <td>'Buy only this article'</td>
  </tr>
  <tr>
    <td><code>payLaterButton</code></td>
    <td>Text shown in the purchase button for options that can be paid later.</td>
    <td>'Buy Now, Pay Later'</td>
  </tr>
  <tr>
    <td><code>payNowButton</code></td>
    <td>Text shown in the purchase button for options which will have to paid in the moment of purchase.</td>
    <td>'Buy Now'</td>
  </tr>
  <tr>
    <td><code>defaultButton</code></td>
    <td>Default text shown in the purchase button before any option is selected.</td>
    <td>'Buy Now'</td>
  </tr>
  <tr>
    <td><code>alreadyPurchasedLink</code></td>
    <td>If the user has purchased the article in the past but they have lost their cookies (or are in a different device) they can use this link to login to LaterPay and retrieve their purchases.</td>
    <td>'I already bought this'</td>
  </tr>
  <tr>
    <td class="col-fourty"><code>header</code></td>
    <td>Optional header text.</td>
    <td></td>
  </tr>
  <tr>
    <td class="col-fourty"><code>footer</code></td>
    <td>Optional footer text.</td>
    <td></td>
  </tr>
</table>

## Related Documentation

* [AMP Access](https://www.ampproject.org/docs/reference/components/amp-access)
* [LaterPay](https://www.laterpay.net)
* [LaterPay: How we do MicroPayments](http://docs.laterpay.net/how_we_do_micropayments/)
* [LaterPay Connector](https://connectormwi.laterpay.net/docs/index.html) - Similar to AMP Access LaterPay but for non AMP pages.

## Validation

See [amp-access-laterpay rules](https://github.com/ampproject/amphtml/blob/master/extensions/amp-access-laterpay/0.1/validator-amp-access-laterpay.protoascii) in the AMP validator specification.
