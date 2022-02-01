# Weborama

## Example

**Display tag:**

See below for an example of usage or our display tag, adapted for use with AMP websites:

```html
<amp-ad
  width="300"
  height="250"
  type="weborama-display"
  data-wbo_account_id="51"
  data-wbo_tracking_element_id="137"
  data-wbo_fullhost="certification.solution.weborama.fr"
  data-wbo_random="[RANDOM]"
  data-wbo_publisherclick="[PUBLISHER_TRACKING_URL]"
>
  <div placeholder>Loading ad.</div>
  <div fallback>Ad could not be loaded.</div>
</amp-ad>
```

**Conversion tag:**

In order to add conversion trackers to your page, please use the AMP pixel component that will be supplied to you by your Weborama contact.
The values mentioned between brackets `[]` should be replaced by the proper values.

`DOCUMENT_REFERRER`, `SOURCE_URL` and `RANDOM` should remain in the URL, as AMP takes care of the automatic substitution of these values.

```html
<amp-pixel
  src="http://[YOUR_HOST].solution.weborama.fr/fcgi-bin/dispatch.fcgi?a.A=co&a.si=[SITE_ID]&a.cp=[CONVERSION_PAGE]&a.ct=b&g.ru=DOCUMENT_REFERRER&g.pu=SOURCE_URL&g.cb=RANDOM"
></amp-pixel>
```

## Configuration

**Placeholder and fallback:**

The placeholder and fallback `div` elements are completely optional and can be left out.

-   The placeholder is shown while the ad is loading.
-   The fallback is served when there is no ad to show for some reason.

**Dimensions:**

By default the ad size is based on the `width` and `height` attributes of the `amp-ad` tag. These are listed as mandatory parameters.

The AMP ad component requires the following HTML attributes to be added before the ad will be parsed as a Weborama ad:

-   width
-   height
-   type="weborama-display"

**Mandatory data parameters:**

Without valid values for these parameters we won't be able to display an ad:

-   `data-wbo_account_id`
-   `data-wbo_tracking_element_id`
-   `data-wbo_fullhost`

**Examples of optional parameters:**

Here are some extra parameters that might be set on the AMP ad:

-   `data-wbo_random` - Used as session identifier by some 3rd party ad systems
-   `data-wbo_publisherclick` - Adds a publisher redirect for the exit click.
-   `data-wbo_vars` - Sends variables to the creative. e.g.: `color=green&weather=rainy`
-   `data-wbo_debug` - Launch the ad in debug mode.
-   ... ask your contact at Weborama for more details.

## Current restrictions

-   AMP ads are launched in a cross-origin iframe, so there currently is no support for some rich media, amongst which:
    -   Expandables
    -   Floorads, Interstitials and other types of layers
    -   Flash ads
    -   Creatives served over HTTP.
-   Click and impression trackers can't be added to the tag. They need to be added through Weborama's ad platform: WCM.
-   At the moment we don't support dynamic resizing of the iframe. Support for this will be added on request.

## Support

If you have any questions, please refer to your contact at Weborama. Otherwise you can contact our TIER 2 support:

-   E: tier2support@weborama.nl
-   T: +31 (0) 20 52 46 690
