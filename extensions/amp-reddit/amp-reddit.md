---
$category@: social
formats:
  - websites
teaser:
  text: Displays a Reddit comment or post embed.
---

# amp-reddit

## Examples

Use the `amp-reddit` component to embed a Reddit post or comment.

**Example: Embedding a Reddit post**

```html
<amp-reddit
  layout="responsive"
  width="300"
  height="400"
  data-embedtype="post"
  data-src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
>
</amp-reddit>
```

**Example: Embedding a Reddit comment**

```html
<amp-reddit
  layout="responsive"
  width="400"
  height="400"
  data-embedtype="comment"
  data-src="https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw"
  data-uuid="b1246282-bd7b-4778-8c5b-5b08ac0e175e"
  data-embedcreated="2016-09-26T21:26:17.823Z"
  data-embedparent="true"
  data-embedlive="true"
>
</amp-reddit>
```

## Attributes

<table>
  <tr>
    <td width="40%"><strong>data-embedtype (required)</strong></td>
    <td>The type of embed, either <code>post</code> or <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-src (required)</strong></td>
    <td>The permamlink uri for the post or comment.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-uuid</strong></td>
    <td>The provided UUID for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedcreated</strong></td>
    <td>The datetime string for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedparent</strong></td>
    <td>The datetime string for the comment embed. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>data-embedlive</strong></td>
    <td>Indicates whether the embedded comment should update if the original comment is updated. Supported when <code>data-embedtype</code> is <code>comment</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>title</strong></td>
    <td>Define a <code>title</code> attribute for the component. The default is <code>Reddit</code>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>common attributes</strong></td>
    <td>This element includes <a href="https://amp.dev/documentation/guides-and-tutorials/learn/common_attributes">common attributes</a> extended to AMP components.</td>
  </tr>
</table>

## Validation

See [amp-reddit rules](https://github.com/ampproject/amphtml/blob/main/extensions/amp-reddit/validator-amp-reddit.protoascii) in the AMP validator specification.
