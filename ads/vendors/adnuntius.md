# Adnuntius

Adnuntius provides a wide array of features alongside their AMP integration.

For configuration details and to generate your tags, please refer to
[the Adnuntius documentation](https://docs.adnuntius.com) or [your account](https://admin.adnuntius.com).

## Simplest Call

```html
<amp-ad width="300" height="250"
        type="adnuntius"
        data-au-id="00000000000dbf78">
</amp-ad>
```

## Call with All Options Enabled

```html
<amp-ad width="300" height="250"
        type="adnuntius"
        data-au-id="00000000000dbf78"
        data-user-id="12341234"
        data-site-id="56785678"
        data-floor-price='{"amount":1.213,"currency": "AUD"}'
        data-kv='[{"colors": ["red", "blue"]}]'
        data-c='["sport/golf", "news"]'
        data-latitude="123.4567"
        data-longitude="234.5678"
        data-segments='["1234", "5678"]'>
</amp-ad>
```

## Configuration

### Required parameters

-   `width`: Width of the ad unit that will be filled
-   `height`: Height of the ad unit that will be filled
-   `type`: Ensures the ad request goes via Adnuntius
-   `data-au-id`: Specify your ad unit ID

### Optional parameters

For the remaining optional parameters listed above, refer to the
[Adnuntius documentation](https://docs.adnuntius.com/adnuntius-advertising/requesting-ads/intro/adn-request) for the
relevant information.
