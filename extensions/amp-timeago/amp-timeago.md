---
$category@: presentation
formats:
  - websites
teaser:
  text: Provides fuzzy timestamps by formatting dates as time ago (for example, 3 hours ago).
experimental: true
bento: true
---

# amp-timeago

## Usage

Use the `amp-timeago` component to count up to, or away from, a specified date and time.

The component replaces the text node with a fuzzy timestamp, such as `in 30 years` or `3 hours ago`.

Example:

[example preview="inline" playground="true" imports="amp-timeago:1.0"]

```html
<amp-timeago
  layout="fixed"
  width="160"
  height="20"
  datetime="2017-04-11T00:37:33.809Z"
  locale="en"
>
  Saturday 11 April 2017 00.37
</amp-timeago>
```

[/example]

The `amp-timeago` component requires a placeholder in the text node. The calculated timestamp replaces the placeholder once ready. Use the placeholder as a fallback to display to users if `amp-timeago` is unable to process the fuzzy timestamp.

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-timeago`, see [**`bento-timeago`**](./1.0/README.md).

## Attributes

### `datetime`

The required `datetime` attribute sets the date and time. The value must be an [ISO datetime](https://www.w3.org/QA/Tips/iso-date).

-   Express time in UTC (Coordinated Universal Time): `2017-03-10T01:00:00Z`
-   Express in local time with a time zone offset: `2017-03-09T20:00:00-05:00`

### `locale` (optional)

The local default is `en`. Add the `locale` attribute and specify one of the following values to chance the local.

-   `ar` (Arabic)
-   `be` (Belarusian)
-   `bg` (Bulgarian)
-   `bn-IN` (Bangla)
-   `ca` (Catalan)
-   `cs` (Czech)
-   `da` (Danish)
-   `de` (German)
-   `el` (Greek)
-   `en` (English)
-   `en-short` (English - short)
-   `es` (Spanish)
-   `eu` (Basque)
-   `fa` (Persian - Farsi)
-   `fi` (Finnish)
-   `fr` (French)
-   `gl` (Galician)
-   `he` (Hebrew)
-   `hi-IN` (Hindi)
-   `hu` (Hungarian)
-   `id-ID` (Malay)
-   `it` (Italian)
-   `ja` (Japanese)
-   `ka` (Georgian)
-   `ko` (Korean)
-   `ml` (Malayalam)
-   `my` (Burmese - Myanmar)
-   `nb-NO` (Norwegian Bokmål)
-   `nl` (Dutch)
-   `nn-NO` (Norwegian Nynorsk)
-   `pl` (Polish)
-   `pt-BR` (Portuguese)
-   `ro` (Romanian)
-   `ru` (Russian)
-   `sq` (Albanian)
-   `sr` (Serbian)
-   `sv` (Swedish)
-   `ta` (Tamil)
-   `th` (Thai)
-   `tr` (Turkish)
-   `uk` (Ukrainian)
-   `vi` (Vietnamese)
-   `zh-CN` (Chinese)
-   `zh-TW` (Taiwanese)

### `cutoff`

Add the `cutoff` attribute to display the date specified in the `datatime` attribute after passing the specified date in seconds.

### Common attributes

The AMP provided set of [common attributes](https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes) is available to `<amp-timeago>`.
