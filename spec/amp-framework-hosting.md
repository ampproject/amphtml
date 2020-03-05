# Hosting the AMP framework

You can host the AMP framework and components from your own server or CDN. This feature has a number of applications. For example, you can...

- test and demonstrate changes to the framework or components.
- set a release cadence that matches your development cycle.
- deliver the AMP framework in regions where `cdn.ampproject.org` may not be available.
- serve AMP pages and the framework from the same host, potentially improving content delivery times.

If you follow the recommendations made here, your AMP pages will still pass [validation](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/). When your AMP page is served from your own servers, the host you specify will be used to download the framework. When your AMP page is served from an [AMP cache](https://github.com/ampproject/amphtml/blob/master/spec/amp-cache-guidelines.md#references), the URLs to the AMP framework will be re-written to download from the AMP cache. This is important to keep in mind if you modify the AMP framework; your AMP pages could behave differently when displayed in a viewer (e.g. the [Google AMP Viewer](https://search.google.com/test/amp)) than when directly accessed from your host.

## Acquire the AMP framework

The AMP framework can be built from source or downloaded pre-built. Building the framework yourself gives you the flexibility of modifying the framework for your needs, or creating your own versioning system. Downloading a pre-built framework means you'll be using an unmodified release, vetted by the AMP Project for distribution.

### Option 1: Build the framework yourself

Refer to the [Developing in AMP](https://github.com/ampproject/amphtml/blob/master/contributing/DEVELOPING.md) guide to familiarize yourself with building and testing the AMP framework. Once you are comfortable with the build system, a few small changes will customize the framework to run from your host.

#### Update URLs config

Modify [`src/config.js`](https://github.com/ampproject/amphtml/blob/master/src/config.js):

- Update the default host in `urls.cdn`. For example, replace  
  `cdn: env['cdnUrl'] || getMetaUrl('runtime-host') || 'https://cdn.ampproject.org'`
  with  
  `cdn: env['cdnUrl'] || getMetaUrl('runtime-host') || 'https://example.com/amp-runtime'`
- (Optional) Specify an amp-geo fallback API URL in `urls.geoApi`. This API is described in section [amp-geo hotpatching](#amp-geo-hotpatching). For example, replace  
  `geoApi: env['geoApiUrl'] || getMetaUrl('amp-geo-api')`
  with  
  `geoApi: env['geoApiUrl'] || getMetaUrl('amp-geo-api') || 'https://example.com/geo'`

It is not necessary to modify `cdnProxyRegex`, which helps AMP pages identify when they are served from an [AMP Cache](https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/how_amp_pages_are_cached/).

#### Build the framework

Build an AMP release with
```
gulp dist --config=<config> --version=<version>
```
where

- `<config>` is one of `canary` or `prod`, indicating whether the build is meant to be served as a canary release or a production release, respectively. When the `--config` flag is omitted, the build system defaults to `prod`.
- `<version>` is the version you are assigning to the build. When the `--version` flag is omitted, the build system defaults to the commit time of the last commit in the active branch: `TZ=UTC git log -1 --pretty="%cd" --date=format-local:%y%m%d%H%M%S`. Note that the version specified here is not the "runtime version" (RTV), which contains both the config and the version. The runtime version is discussed in more detail in section [Serve the framework](#serve-the-framework).

The built framework can be found in directory `dist`. The version assigned to the build is in `dist/version.txt` and a listing of all files included in build is in `dist/files.txt`. The framework is ready to be moved to and served from your host.

### Option 2: Copy the framework from cdn.ampproject.org

The AMP framework can be copied from `cdn.ampproject.org`. The latest weekly release is always served from the root of `cdn.ampproject.org`. All [non-deprecated releases](https://github.com/ampproject/amphtml/blob/master/spec/amp-versioning-policy.md#version-deprecations) can be found in versioned URLs: `cdn.ampproject.org/rtv/<rtv>` where `<rtv>` is the runtime version. Note that a "runtime version" (RTV) contains both the config and the version; this is discussed in more detail in section [Serve the framework](#serve-the-framework).

#### Copy files

A listing of files in each release can be found in `files.txt` at the root of the framework distribution. For example, the files included in the current weekly release are listed in [https://cdn.ampproject.org/files.txt](). Use your favorite HTTP client to download all of the files in `files.txt`, retaining path structures.

#### Undo amp-geo dynamic modification

When you request `amp-geo-0.1.js` from `cdn.ampproject.org` using an HTTP client, the CDN detects the country where the request originated and patches `amp-geo-0.1.js` on-the-fly. This patch needs to be reversed to ensure users are not all assigned the same country when `amp-geo` loads.

When `cdn.ampproject.org` serves `amp-geo-0.1.js`, it replaces string `{{AMP_ISO_COUNTRY_HOTPATCH}}` with an ISO 3166-1 alpha-2 country code (two ascii letter characters) followed by 26 space characters, to maintain the string length. Reversal of this patch can be accomplished by a RegEx replacement: search for RegEx `/[a-zA-Z]{2} {26}/` and replace with string `{{AMP_ISO_COUNTRY_HOTPATCH}}`.

## Modify AMP pages

AMP pages should be updated to fetch all scripts from your host. For example,
```
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
```
becomes
```
<script async src="https://example.com/amp/v0.js"></script>
<script async custom-element="amp-carousel" src="https://example.com/amp/v0/amp-carousel-0.1.js"></script>
```
Versioned URLs are also possible and discussed in section [Serve the framework](#serve-the-framework).

### Meta tags

If you opted for [Option 2: Copy the framework from cdn.ampproject.org](#option-2-copy-the-framework-from-cdn-ampproject-org), then the framework was built under the assumption that it would be hosted from its default location, `cdn.ampproject.org`. While `<script>` tags included in `<head>` will download from the URLs specified in their `src` attributes, dynamically loaded components like `amp-loader-0.1.js` will download from `cdn.ampproject.org`. Mixing a self-hosted AMP runtime with AMP components from `cdn.ampproject.org` is not supported and can lead to unpredictable end user experiences.

The default host used by the AMP runtime can be updated by including the following `<meta>` tag in the `<head>` of your AMP pages:
```
<meta name="runtime-host" content="...">
```
where the `content` attribute should contain a URL to your hosted AMP framework. Similarly, an amp-geo fallback API URL (described in section [amp-geo hotpatching](#amp-geo-hotpatching)) can be defined with the following `<meta>` tag:
```
<meta name="amp-geo-api" content="...">
```
In each case, the value of the `content` attribute can be an absolute or relative URL, but must be secure (HTTPS). Importantly, **these meta tags must appear before the first `<script>` tag**. For example, if your AMP framework is hosted at `https://example.com/amp`, then your AMPHTML should look similar to:

```
<html ⚡>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Hello World</title>
  <style amp-boilerplate>...</style>
  <noscript><style amp-boilerplate>...</style></noscript>
  <style amp-custom>...</style>
  <link rel="canonical" href="https://example.net/hello-world.html">

  <!-- This instructs the AMP runtime to update its default host -->
  <meta name="runtime-host" content="https://example.com/amp">

  <!-- (Optional) This provides a fallback API for amp-geo -->
  <meta name="amp-geo-api" content="https://example.com/geo/get-country">

  <script async src="https://example.com/amp/v0.js"></script>
  <script async custom-element="amp-geo" src="https://example.com/amp/v0/amp-geo-0.1.js"></script>
</head>
<body>
...
</body>
</html>
```

## Serve the AMP framework

Depending on your hosting capabilities, there are several routes you can take to serve the AMP framework.

### Evergreen and RTV-specific hosting

When the AMP runtime is initialized, all components are verified to belong to the same AMP framework version as the runtime itself. This affects components that have already downloaded as well as components that are downloaded dynamically, like amp-loader. Dynamic components and components with incorrect versions are (re-)downloaded from a runtime version (RTV) specific path. This has consequences on how you choose to host the runtime.

The simplest option for hosting the AMP framework is to host it from an RTV-specific path. The runtime version is derived from the config (production or canary) and the AMP framework version:

- Config: Numerical codes are used to identify the config: `00` is canary, `01` is production, and `02`, `03`, etc. are experiments.
- Version: Regardless of whether you built or downloaded the AMP framework, the version of the framework is available from  `version.txt` at the root of the framework distribution.

The runtime version is the concatenation of the numerical config and the version. For example, AMP Project release versions are listed at [https://github.com/ampproject/amphtml/releases/](). Those versions can be prepended by `00`, `01`, etc. to find the runtime version. For version `2002191527100`, the canary RTV is `002002191527100` and the production RTV is `012002191527100`. As long as this release version has not been [deprecated](https://github.com/ampproject/amphtml/blob/master/spec/amp-versioning-policy.md#version-deprecations), the AMP framework for each config can be found at `https://cdn.ampproject.org/rtv/002002191527100` and `https://cdn.ampproject.org/rtv/012002191527100`, respectively.

At a minimum, your AMP framework should be hosted in an RTV-specific path. For example, if you expect to host a production AMP framework with version `200229061636` from `https://example.com/amp`, then AMP framework files should be available from `https://example.com/amp/rtv/01200229061636`. As concrete examples, the [AMP runtime](https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml/#amp-runtime) should be available at `https://example.com/amp/rtv/01200229061636/v0.js` and component [amp-geo](https://amp.dev/documentation/components/amp-geo/) should be available at `https://example.com/amp/rtv/01200229061636/v0/amp-geo-0.1.js`.

If hosting a single AMP framework version from an RTV-specific path is your end goal, then you can update the scripts in your AMP pages to download the runtime and components from your host and skip to section [amp-geo hotpatching](#amp-geo-hotpatching). If you expect to update the AMP framework regularly, then updating RTV-specific URLs in AMP pages could be cumbersome and you might be interested in [Versionless URLs](#versionless-urls).

#### Versionless URLs

The AMP Project has a [weekly release channel](https://amp.dev/documentation/guides-and-tutorials/learn/spec/release-schedule/#weekly), sometime referred to as the "evergreen" release channel, where AMP pages can take advantage of rolling releases without updating the URLs to the AMP framework. In other words, the URLs are "versionless". This is relatively easy to accomplish when hosting the AMP framework yourself. The key is to ensure that the AMP framework hosted from versionless URLs is _also_ available from RTV-specific URLs. For example, if production AMP framework version 200229061636 is available from `https://example.com/amp`, then it must also be available from `https://example.com/amp/rtv/01200229061636`. This suggests an update strategy: first make a new AMP framework version available from RTV-specific URLs and _then_ update the AMP framework available from versionless URLs.

#### rtv/metadata

The `amp-runtime-version` and `amp-optimizer` tools in [amp-toolbox](https://github.com/ampproject/amp-toolbox) reference a special JSON endpoint `<host>/rtv/metadata` to...

- determine the latest AMP framework version available from `<host>`.
- fetch boilerplate CSS for optimized AMP pages from `<host>`.

If you have no intention of using any amp-toolbox tools, then this endpoint is optional and you can skip to the next section.

Consider the following sample from [https://cdn.ampproject.org/rtv/metadata]():
```
{
  "ampRuntimeVersion": "012002192257490",
  "ampCssUrl": "https://cdn.ampproject.org/rtv/012002192257490/v0.css",
  "canaryPercentage": "0.005",
  "diversions": ["002002251816300", "032002251816300", "022002192257490"],
  "ltsRuntimeVersion": "012002191527100",
  "ltsCssUrl": "https://cdn.ampproject.org/rtv/012002191527100/v0.css"
}
```

The properties are defined as follows:

- `ampRuntimeVersion` (required) is the current production runtime version (RTV) of the AMP framework available from versionless URLs.
- `ampCssUrl` (required) is the boilerplate CSS of the current production runtime version that should be used when optimizing AMP pages.
- `canaryPercentage` (optional) indicates the fraction of users who receive the current canary runtime version of the AMP framework instead of the current production runtime version.
- `diversions` (optional) lists active non-production runtime versions available (canary and experiments).
- `ltsRuntimeVersion` (optional) is the current [long-term stable](https://github.com/ampproject/amphtml/blob/master/contributing/lts-release.md) runtime version.
- `ltsCssUrl` (optional) is the boilerplate CSS of the current long-term stable runtime version.

### amp-geo hotpatching

AMP component [amp-geo](https://amp.dev/documentation/components/amp-geo/) requires special attention when hosting the AMP framework. When `cdn.ampproject.org` serves `amp-geo-0.1.js`, it detects the country where the request originated and replaces string `{{AMP_ISO_COUNTRY_HOTPATCH}}` with the ISO 3166-1 alpha-2 country code (two ascii letter characters) followed by 26 space characters, to maintain the string length. Ideally, when hosting the AMP framework, your content distribution platform would perform the same manipulation.

If country code detection and file modification at time of delivery are not possible, amp-geo supports use of an API to fetch the user's country at run time. Be aware that usage of an API for this feature increases the chances of visible content or style shifts due to the delay of an additional network request. The AMP Project does not provide this API service; you need to supply your own API. Two example providers (not a comprehensive list) that offer IP-to-country databases from which an API could be created include [MaxMind](https://www.maxmind.com) and [IP2Location](https://www.ip2location.com/).

The API must meet the following requirements:

- Satisfy [CORS security in AMP](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md)
- Be secure (HTTPS)
- Return `application/json` content conforming to the following schema:
  ```
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "country": {
        "type": "string",
        "title": "ISO 3166-1 alpha-2 (case insensitive) country code of client request",
        "default": "",
        "pattern": "^[a-zA-Z]{2}$"
      }
    },
    "required": [
      "country"
    ]
  }
  ```

A sample response for a user in Germany looks like:
```
{
  "country": "de"
}
```

There are trade-offs in accuracy and performance when you set the client cache time for this API. Longer cache times are better for performance on subsequent page loads but can lead to incorrect country detection. For reference, `https://cdn.ampproject.org/v0/amp-geo-0.1.js` has a client cache time of 30 minutes.

### amp-optimizer

[amp-toolbox](https://github.com/ampproject/amp-toolbox) has tools ready to help you get the most out of your hosted AMP framework. Notably, the [amp-optimizer](https://github.com/ampproject/amp-toolbox/tree/master/packages/optimizer) tool supports transformation options to use your own host with versioned or versionless URLs in AMP pages. If you're aiming to get the best performance possible out of your AMP pages, this is a great tool to accomplish the task.

### HTTP response Headers

In addition to following [TLS best practices](https://infosec.mozilla.org/guidelines/web_security), be sure to consider the following headers when hosting the AMP framework:

- `content-security-policy`: If your pages implement [AMP's CSP](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/secure-pages/), apply a matching content security policy to your hosted framework responses. Inspect the headers on `https://cdn.ampproject.org/v0.js` for a base policy that should be expanded to include resources served from your host.
- `access-control-allow-origin`: Some runtime components are fetched via XHR. If your AMP pages will be served from a different host than your framework, be sure to include CORS headers (see also [CORS Requests in AMP](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md)).
- `content-type`: There are a few resources served without file extensions, or with extensions that may not be recognized by all web servers. In addition to [common types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types), you may want to include special handling for the following:

  - `/rtv/metadata` - `application/json`
  - `/amp_preconnect_polyfill_404_or_other_error_expected._Do_not_worry_about_it` - `text/html`

  A complete list of files in each AMP release can be found in `files.txt`, for example `https://cdn.ampproject.org/files.txt`.
