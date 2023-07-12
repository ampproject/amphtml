---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Twitter Tweet or Moment.
experimental: true
bento: true
---

# amp-twitter

## Behavior

The `amp-twitter` component allows you to embed a Tweet or Moment.

Here's an example of a basic embedded Tweet:

[example preview="inline" playground="true" imports="amp-twitter" imports="amp-twitter"]

```html
<amp-twitter
  width="375"
  height="472"
  layout="responsive"
  data-tweetid="885634330868850689"
>
</amp-twitter>
```

[/example]

### Standalone use outside valid AMP documents

Bento allows you to use AMP components in non-AMP pages without needing
to commit to fully valid AMP. You can take these components and place them
in implementations with frameworks and CMSs that don't support AMP. Read
more in our guide [Use AMP components in non-AMP pages](https://amp.dev/documentation/guides-and-tutorials/start/bento_guide/).

To find the standalone version of `amp-twitter`, see [**`bento-twitter`**](./1.0/README.md).

## Appearance

Twitter does not currently provide an API that yields fixed aspect ratio for embedded Tweets or Moments. Currently, AMP automatically proportionally scales the Tweet or Moment to fit the provided size, but this may yield less than ideal appearance. You might need to manually tweak the provided width and height. Also, you can use the `media` attribute to select the aspect ratio based on the screen width.

## Placeholders & fallbacks

An element marked with a `placeholder` attribute displays while the content for the Tweet or Moment is loading or initializing. Placeholders are hidden once the AMP component's content displays. An element marked with a `fallback` attribute displays if `amp-twitter` isn't supported by the browser or if the Tweet or Moment doesn't exist or has been deleted.

Visit the [Placeholders & fallbacks](https://amp.dev/documentation/guides-and-tutorials/develop/style_and_layout/placeholders) guide to learn more about how placeholders and fallbacks interact for the `amp-twitter` component.

_Example: Specifying a placeholder_

[example preview="inline" playground="true" imports="amp-twitter" imports="amp-twitter"]

```html
<amp-twitter
  width="375"
  height="472"
  layout="responsive"
  data-tweetid="638793490521001985"
>
  <blockquote placeholder>
    <p>
      I only needed to change some CSS.
      <a href="http://t.co/LvjLbjgY9F">pic.twitter.com/LvjLbjgY9F</a>
    </p>
    &mdash; Malte Ubl (@cramforce)
    <a href="https://twitter.com/cramforce/status/638793490521001985"
      >September 1, 2015</a
    >
  </blockquote>
</amp-twitter>
```

[/example]

_Example: Specifying a placeholder and a fallback_

[example preview="inline" playground="true" imports="amp-twitter" imports="amp-twitter"]

```html
<amp-twitter
  width="390"
  height="330"
  layout="responsive"
  data-tweetid="855178606556856320"
>
  <blockquote placeholder>
    <p>
      What are 5 common misconceptions people often have about AMP? Find out on
      today&#39;s installment of Amplify:
      <a href="https://t.co/kaSvV8SQtI">https://t.co/kaSvV8SQtI</a>
      <a href="https://t.co/Cu9VYOmiKV">pic.twitter.com/Cu9VYOmiKV</a>
    </p>
    &mdash; AMP Project (@AMPhtml)
    <a href="https://twitter.com/AMPhtml/status/855178606556856320"
      >April 20, 2017</a
    >
  </blockquote>
  <div fallback>
    An error occurred while retrieving the Tweet. It might have been deleted.
  </div>
</amp-twitter>
```

[/example]

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-tweetid / data-momentid / data-timeline-source-type (required)</strong></td>
    <td>The ID of the Tweet or Moment, or the source type if a Timeline should be displayed.
In a URL like https://twitter.com/joemccann/status/640300967154597888, <code>640300967154597888</code> is the tweet id.
In a URL like https://twitter.com/i/moments/1009149991452135424, <code>1009149991452135424</code> is the moment id.
Valid timeline source types include <code>profile</code>, <code>likes</code>, <code>list</code>, <code>collection</code>, <code>url</code>, and <code>widget</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-timeline-* (optional)</strong></td>
    <td>When displaying a timeline, further arguments need to be provided in addition to <code>timeline-source-type</code>. For example, <code>data-timeline-screen-name="amphtml"</code> in combination with <code>data-timeline-source-type="profile"</code> will display a timeline of the AMP Twitter account.
For details on the available arguments, see the "Timelines" section in <a href="https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions">Twitter's JavaScript Factory Functions Guide</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-* (optional)</strong></td>
    <td>You can specify options for the Tweet, Moment, or Timeline appearance by setting <code>data-</code> attributes. For example, <code>data-cards="hidden"</code> deactivates Twitter cards.
For details on the available options, see Twitter's docs <a href="https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference">for tweets</a>, <a href="https://developer.twitter.com/en/docs/twitter-for-websites/moments/guides/parameter-reference0">for moments</a> and <a href="https://developer.twitter.com/en/docs/twitter-for-websites/timelines/guides/parameter-reference">for timelines</a>.</td>
  </tr>
   <tr>
    <td width="40%"><strong>title (optional)</strong></td>
    <td>Define a <code>title</code> attribute for the component. The default is <code>Twitter</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-twitter rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-twitter/validator-amp-twitter.protoascii) in the AMP validator specification.
