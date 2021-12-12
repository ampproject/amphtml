# AMP Boilerplate Code

## `head > style[amp-boilerplate]` and `noscript > style[amp-boilerplate]`

AMP HTML documents must contain the following boilerplate in their `head` tag.
Validation is currently done with regular expressions, so it's important to keep
mutations as minimal as possible. Currently, the allowed mutations are:

1. Inserting arbitrary whitespace immediately after the `style` tag opens, and immediately before it closes
2. Replacing any space in the snippet below with arbitrary whitespace.

<!-- prettier-ignore-start -->
```html
<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
```
<!-- prettier-ignore-end -->

[tip]
You can use the [boilerplate generator](https://amp.dev/boilerplate) to quickly setup a basic skeleton for your AMP page. It also provides snippets for structured data, to create a PWA and more!
[/tip]
