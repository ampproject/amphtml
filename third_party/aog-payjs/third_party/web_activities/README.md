# Web Activities JavaScript library

This is an import of the OSS [Web Activities](https://github.com/google/web-activities) library.

It's a common task for a web page to open a different page (an iframe, a popup or a redirect) that will return its result back to the calling page. The typical use cases include location picker, contact picker, payment form, social sign-in, and so on.

While many platforms provide an easy and reliable APIs to accomplish this, Web platform does not. The Web Activities library provides a common API to do this.

## Key concepts

The API provides two parts: a client (or port) and a host. A host page implements the actual activity and a client page opens the host and waits for the result to be returned.
