# Bento Services

Most of the AMP Classic components depend on the various services in the `src/service` folder.

Bento components, however, cannot rely on those services.

So this folder contains standalone versions of these services, designed to make it easier to convert Classic components
to Bento components.

For example:

Using AMP Classic services:

```js
import {Services} from '#service';
///...

const platform = Services.platformFor(this.win);
if (platform.isIos()) {
  // do iOS stuff
} else if (platform.isAndroid()) {
  // do Android stuff
}
```

Using Bento services:

```js
import {platformUtils} from '#preact/utils/platform';
///...

if (platformUtils.isIos()) {
  // do iOS stuff
} else if (platformUtils.isAndroid()) {
  // do Android stuff
}
```
