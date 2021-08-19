# Validator Web UI

If you'd like to use the web UI, simply visit [validator.amp.dev](https://validator.amp.dev/).

## Running your own Web UI

In this directory, run

```sh
$ npm install
$ go build serve-standalone.go
$ ./serve-standalone
```

Then visit your own instance at `http://127.0.0.1:8765/`.

If you'd like to run exactly the code that is running at
[validator.amp.dev](https://validator.amp.dev/), that's an
Appengine app - please refer to the instructions in serve.go.

## Passing in documents from URL

This tool will also accept a document passed in via the URL as part of the URL hash. It expects the format `#doc=<ENCODED_DOCUMENT>`. This allows users to construct an link that will auto-populate the tool with the incoming document.

To use this feature you must first base64 encode the HTML string. Due to unicode problems with the native `btoa()` function, this tool expects the string to be encoded using the following [solution from mdn](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings):

```js
// ucs-2 string to base64 encoded ascii
function utoa(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}
```

By default this tool will assume you want to validate an `AMPHTML` document. If you would like to validate another format you can chose one of the following:

```http
#htmlFormat=AMP4ADS
#htmlFormat=AMP4EMAIL
```

If you wish to use both the `doc=` and `htmlFormat=` together make sure to include an `&` between the key-value pairs.

Putting it all together allows you to create links like [this example.](https://validator.amp.dev/#htmlFormat=AMP4ADS&doc=PCFkb2N0eXBlIGh0bWw%2BCjxodG1sIOKaoTRhZHM%2BCjxoZWFkPgogIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLG1pbmltdW0tc2NhbGU9MSI%2BCiAgPHN0eWxlIGFtcDRhZHMtYm9pbGVycGxhdGU%2BYm9keXt2aXNpYmlsaXR5OmhpZGRlbn08L3N0eWxlPgogIDxzY3JpcHQgYXN5bmMgc3JjPSJodHRwczovL2Nkbi5hbXBwcm9qZWN0Lm9yZy9hbXA0YWRzLXYwLmpzIj48L3NjcmlwdD4KPC9oZWFkPgo8Ym9keT4KCTxhbXAtaW1nIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBzcmM9Imh0dHA6Ly9wbGFjZWtpdHRlbi5jb20vNTAwLzUwMCI%2BPC9hbXAtaW1nPgogIAk8aDE%2BQ2F0cyBhcmUgY29vbC48L2gxPgo8L2JvZHk%2BCjwvaHRtbD4)
