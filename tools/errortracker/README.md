# Error reporting

Receives error reports emitted by errors.js and send them to the
[Google Cloud Error Logging service](https://cloud.google.com/error-reporting/).

## Setup and deploy

1. Enable Google Cloud Logging API.
2. Switch app id in app.yaml to your own.
3. Deploy.

```
$ goapp get .
$ goapp deploy
```

[Sample URL](https://goo.gl/dKvgfk)
