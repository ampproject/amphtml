# FeedAd

## Example

```html

<amp-ad width="320" height="180"
        type="feedad"
        data-client-token="EiRjNjM3MGZlNy00NmQ2LTRmZGYtYjRmNy1jZGZlNWQ4OTgxYTU="
        data-placement-id="amp-example"
        data-backound="#000">
</amp-ad>
```

## Configuration

### Required parameters:

-   `data-client-token`: The web client token for your FeedAd publisher account. It can be found in your publisher dashboard and was sent to you in your onboarding e-mail.
-   `data-placement-id`: This identifies the placement within the FeedAd dashboard. We recommend giving it a meaningful name related to its position within the page, like "article-detail-sidebar". The name may consist of lowercase letters [a-z], numbers [0-9], and dashes [-]'. You can access your publisher dashboard at [https://admin.feedad.com](https://admin.feedad.com). If you do not yet have a FeedAd publisher account, please contact us via the contact form at [https://feedad.com/#contact](https://feedad.com/#contact).

### Optional parameters:

-   `background`: A CSS color value for the background of the ad, in case the amp-ad element is larger than the ad itself. The ad will always try to request an optimal size, but AMP may reject this request.

### Recommended parameter values:

-   `width` and `height`: Use values with a 16:9 aspect ratio, as most of our ads are videos of that same ratio.

## Consent

-   FeedAd is GDPR compliant and reads TCF 2.0 consent strings. Add the IAB vendor 'FeedAd' (#781) in your CMP to ask for your users' consent to our targeted ads.
