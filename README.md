# The AMP HTML ⚡ runtime.

The AMP HTML runtime implements the [AMP HTML format](spec/amp-html-format.md) and
in particular its [components in form of custom elements](spec/amp-html-components.md).

## Development

### Installation

`npm i`

Map `ads.localhost` to `127.0.0.1` in your `/etc/hosts` file.

### Continuous build

`gulp`

for tests:

`gulp unit-watch`

### Start dev server

Execute in the base dir:

`python -m SimpleHTTPServer`

or:

`npm install http-server -g`

and then:

`http-server -p 8000 -c-1`

Then go to http://localhost:8000/examples/released.html
