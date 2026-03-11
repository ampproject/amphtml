# Playwire

## Example

```html
<amp-ad width="320" height="250" id="playwire_ad2" type="playwire" data-publisher="343" data-website="926" data-slot="standard_iab_cntr3" data-path="/testme" layout="fixed" data-slot-number="2">
  </amp-ad>
```

## Configuration
Each site must be approved and onboarded with Playwire prior to launch. Please visit [Playwire](https://www.playwire.com) for more information. The values provided to the <amp-ad> tag must match the identifiers assigned within your Playwire implementation. For testing you can use the tag example above.

### Required parameters

-   `data-publisher` - The Playwire publisher ID assigned to the property.
-   `data-website` - The website ID associated with the property.
-   `data-slot` - The Playwire slot identifier corresponding to the ad unit.

### Optional parameters

-   `data-json` - JSON object to configure additional settings. Refer to Playwire documentation for supported options.
