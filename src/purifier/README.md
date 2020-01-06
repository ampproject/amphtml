# AMP Purifier

[![npm version](https://badge.fury.io/js/%40ampproject%2Fpurifier.svg)](https://badge.fury.io/js/%40ampproject%2Fpurifier)

The AMP Purifier library contains an AMP-specific configuration for [DOMPurify](https://github.com/cure53/DOMPurify).

This library is internally used by [amp-mustache](https://amp.dev/documentation/components/amp-mustache/)
to sanitize rendered Mustache.js templates before displaying them.

## Installation

Install via:

```sh
npm i @ampproject/purifier
```

## Usage

```js
import {Purifier} from '@ampproject/purifier';

const purifier = new Purifier(document);
purifier.purifyHtml('a<script>b</script>c'); // "ac"
```
