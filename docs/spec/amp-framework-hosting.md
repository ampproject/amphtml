# Hosting the AMP framework

You can host the AMP framework and components from your own server or CDN. This feature has a number of applications. For example, you can...

-   set a release cadence that matches your development cycle.
-   deliver the AMP framework in regions where `cdn.ampproject.org` may not be available.
-   serve AMP pages and the framework from the same host, potentially improving content delivery times.
-   test and demonstrate changes to the framework or components.

The AMP Project is looking into options for [validation](https://amp.dev/documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/) of AMP pages that use an AMP framework hosted outside of `cdn.ampproject.org` ([#27546](https://github.com/ampproject/amphtml/issues/27546)). As of April 2020, these AMP pages do not pass validation.

## Versioning

This document makes frequent use of the terms "version" and "runtime version (rtv)". These two versions are slightly different. When the AMP framework is built, it is assigned a 13-digit _version_. When the AMP framework is served, a config number prefixes the version, resulting in a 15-digit _runtime version_. The build system and runtime enforce these version formats.

Note: The _version_ (sometimes referred to as the "AMP version number") and _runtime version_ are often confused with each other. When it matters, be explicit about the version to which you're referring by indicating 13- or 15-digits.

When the AMP framework is built (either by you or by the AMP Project), a 13-digit date-based version is automatically assigned. You can find this version in `version.txt` at the root of the AMP framework distribution. Then, the easiest route to hosting the AMP framework is to prefix this version with `01` to create a 15-digit runtime version, where `01` indicates a stable release.

A more complete picture of the conventions adopted by the AMP Project for the version and runtime version is below. This is more than you need to get started with hosting the AMP framework, but serves as a good reference in case you want to expand your hosting capabilities.

-   Version ([#16631](https://github.com/ampproject/amphtml/pull/16631) and [#27848](https://github.com/ampproject/amphtml/pull/27848)): the commit time of the last commit in the active branch

    ```
    TZ=UTC git log -1 --pretty="%cd" --date=format-local:%y%m%d%H%M
    ```

    with three trailing digits indicating the number of cherry-picks included in the release. This version corresponds to the release versions found on [github.com/ampproject/amphtml/releases](https://github.com/ampproject/amphtml/releases).

    Note: Prior to 2020-04-25, the version was based on date/time format `%y%m%d%H%M%S` with a single trailing digit – typically `0`, but could be change arbitrarily.

-   Runtime version (rtv): the version prefixed by a 2-digit config code:

    -   Experimental: `00`
    -   Stable: `01`
    -   Control: `02`
    -   Beta: `03`
    -   Nightly: `04`
    -   Nightly-Control: `05`
    -   AMP Experiments: `10`, `11`, `12`
    -   INABOX Control and Experiments: `20`, `21`, `22`, `23`, `24`, `25`

The runtime version is found in URLs and is reported in the console of browser inspectors when an AMP page loads. For example, runtime version `012004041903580` is stable version `2004041903580`.

## Acquire the AMP framework

The AMP framework can be built from source or downloaded pre-built. Building the framework yourself gives you the flexibility of modifying the framework for your needs and deploying changes on your own release cycle. Downloading a pre-built framework means you'll be using an unmodified release, vetted by the AMP Project for distribution.

### Option 1: Build the framework yourself

Refer to the [Developing in AMP](../developing.md) guide to familiarize yourself with building and testing the AMP framework. Once you are comfortable with the build system, a few small changes will customize the framework to run from your host.

#### Update URLs config

When AMP is built, several scripts are prepended with an `AMP_CONFIG` environment variable (object) containing basic information like: runtime version, config type, experiment enable/disable status, etc. This object can be customized at build time to inform the runtime where the framework is hosted. See [build-system/global-configs/README.md](../../build-system/global-configs/README.md#custom-configjson) for information about the `custom-config.json` overlay.

Create JSON file `build-system/global-configs/custom-config.json` with the following contents:

```json
{
  "cdnUrl": "https://example.com/amp-framework",
  "geoApiUrl": "https://example.com/geo-api"
}
```

where

-   `cdnUrl` is the base URL to your AMP framework. Defaults to `https://cdn.ampproject.org`.
-   `geoApiUrl` (optional) is your amp-geo fallback API URL. This API is described in section [amp-geo hotpatching](#amp-geo-hotpatching). Defaults to `null`.

Important: `build-system/global-configs/custom-config.json` is not part of checked-in source. If it exists, it _always_ applies at build time, overlaying the active config. Don't forget about it! The build system emits warnings like `Notice: prod config overlaid with custom-config.json` to remind you that your build will differ from the default.

#### Define a custom release flavor

Release flavors define the runtime version prefix(es) that should be built and the command line that should be used to build each runtime version. When the build system prepares a release, it supplements the built runtime with static files and pre-compiled resources. See [build-system/global-configs/README.md](../../build-system/global-configs/README.md#custom-flavors-configjson) for information about adding a custom release flavor.

Create JSON file `build-system/global-configs/custom-flavors-config.json` with the following contents:

```json
[
  {
    "flavorType": "self-host-prod",
    "name": "Self-hosted production release",
    "environment": "AMP",
    "rtvPrefixes": [ "01" ],
    "command": "amp dist --noconfig"
  }
]

```

If your AMP runtime will be built with code customizations, consider using flag `--sourcemap_url` with `amp dist`:

-   `--sourcemap_url`: Provide the base URL for JavaScript source map links. This URL should contain placeholder `{version}` that will be replaced with the actual version when the AMP framework is built, for example `https://raw.githubusercontent.com/<github-username>/amphtml/{version}/`. Defaults to `https://raw.githubusercontent.com/ampproject/amphtml/{version}/`.

**Tips:**

-   Be sure to pass flag `--noconfig` to `amp dist` in the flavor command, otherwise you will end up with multiple `AMP_CONFIG` definitions in entrypoint files (`v0.js`, `shadow-v0.js`, etc.).
-   Flag `--version_override` is not supported.
-   `build-system/global-configs/custom-flavors-config.json` is not part of checked-in source. If it exists, the custom flavors are automatically made available to `amp release`.

#### Build the framework

Build an AMP release with

```sh
amp release --flavor="self-host-prod"
```

The built framework can be found in directory `release/org-cdn/rtv/<rtv>/`. The version assigned to the build is in `version.txt` and a listing of all files included in build is in `files.txt`. The framework is ready to be moved to and served from your host.

### Option 2: Download the framework with an AMP Toolbox tool

[AMP Toolbox](https://github.com/ampproject/amp-toolbox) has both a Node.js module and a command line tool that will fetch a complete AMP framework from `cdn.ampproject.org`. Pick the tool best suited to your release workflow.

-   [@ampproject/toolbox-runtime-fetch](https://github.com/ampproject/amp-toolbox/tree/main/packages/runtime-fetch) - Node.js module
-   [@ampproject/toolbox-cli](https://github.com/ampproject/amp-toolbox/tree/main/packages/cli) - command line interface

### Option 3: Manually copy the framework from cdn.ampproject.org

The AMP framework can be copied from `cdn.ampproject.org`. The latest weekly release is always served from the root of `cdn.ampproject.org`. All [non-deprecated releases](./amp-versioning-policy.md#version-deprecations) can be found in versioned URLs: `cdn.ampproject.org/rtv/<rtv>`, where `<rtv>` is the runtime version.

Note: The AMP Project is looking into options for packaging releases ([#27726](https://github.com/ampproject/amphtml/issues/27726)).

#### Copy files

A listing of files in each release can be found in `files.txt` at the root of the framework distribution. For example, the files included in the current weekly release are listed in [cdn.ampproject.org/files.txt](https://cdn.ampproject.org/files.txt). Use your favorite HTTP client to download all of the files in `files.txt`, retaining path structures.

#### Undo amp-geo dynamic modification

When you request `amp-geo-0.1.js` from `cdn.ampproject.org` using an HTTP client, the CDN detects the country where the request originated and patches `amp-geo-0.1.js` on-the-fly. This patch needs to be reversed to ensure users are not all assigned the same country when amp-geo loads.

When `cdn.ampproject.org` serves `amp-geo-0.1.js`, it replaces string `{{AMP_ISO_COUNTRY_HOTPATCH}}` with an ISO 3166-1 country code or an ISO 3166-2 country-subdivision code, followed by enough spaces to maintain the length of the string being replaced. Reversal of this patch can be accomplished by a RegEx replacement: search for `/ {28}|[a-z]{2} {26}|[a-z]{2} [a-z]{2}-[a-z0-9]{1,3} {19,21}/i` and replace with `{{AMP_ISO_COUNTRY_HOTPATCH}}`.

In addition to `amp-geo-0.1.js`, you may find module JS (`.mjs`) and unversioned (`amp-geo-latest.js`) variants of the same file. The same RegEx replacement should be performed in these files as well.

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

Versioned URLs are also possible and discussed in section [Serve the AMP framework](#serve-the-amp-framework).

Important: All scripts must come from the same origin. Fetching scripts from multiple origins is not supported and can lead to unpredictable end user experiences.

### Meta tags

If you opted to download the AMP framework, then it was built under the assumption that it would be hosted from its default location, `cdn.ampproject.org`. While `<script>` tags included in the `<head>` of your AMP pages will download from the URLs specified in their `src` attributes, dynamically loaded components like `amp-loader-0.1.js` will download from `cdn.ampproject.org`. Mixing a self-hosted AMP runtime with AMP components from `cdn.ampproject.org` is not supported and can lead to unpredictable end user experiences.

The default host used by the AMP runtime can be updated by including the following `<meta>` tag in the `<head>` of your AMP pages:

```
<meta name="runtime-host" content="...">
```

where the `content` attribute should contain a URL to your hosted AMP framework. Similarly, an amp-geo fallback API URL (described in section [amp-geo hotpatching](#amp-geo-hotpatching)) can be defined with the following `<meta>` tag:

```
<meta name="amp-geo-api" content="...">
```

In each case, the value of the `content` attribute should be an absolute, HTTPS URL. Importantly, **these meta tags must appear before the first `<script>` tag**. For example, if your AMP framework is hosted at `https://example.com/amp`, then your `<head>` should look similar to the following:

```
<head>
  ...
  <!-- This instructs the AMP runtime to update its default host -->
  <meta name="runtime-host" content="https://example.com/amp">

  <!-- (Optional) This provides a fallback API for amp-geo -->
  <meta name="amp-geo-api" content="https://example.com/geo/get-country">

  <!-- All scripts appear after the above meta tags -->
  <script async src="https://example.com/amp/v0.js"></script>
  <script async custom-element="amp-geo" src="https://example.com/amp/v0/amp-geo-0.1.js"></script>
</head>
```

## Serve the AMP framework

Depending on your hosting capabilities and goals, there are several options to consider when serving the AMP framework.

### URLs

When the AMP runtime is initialized, all components are verified to belong to the same AMP framework version as the runtime itself. This affects components that have already downloaded as well as components that are downloaded dynamically, like amp-loader. Dynamic components and components with incorrect versions are (re-)downloaded from an rtv-specific path. This has consequences on how you choose to host the runtime.

#### Versioned URLs

The simplest option for hosting the AMP framework is to host it from an rtv-specific path. For example, consider AMP framework host `https://example.com/amp`. Stable version `2002290616360` corresponds to runtime version `012002290616360` and should be hosted from `https://example.com/amp/rtv/012002290616360`. In this case, AMP meta and script URLs would look like the following:

```
<meta name="runtime-host" content="https://example.com/amp"> <!-- not rtv-specific -->
<script async src="https://example.com/amp/rtv/012002290616360/v0.js"></script>
<script async custom-element="amp-geo" src="https://example.com/amp/rtv/012002290616360/v0/amp-geo-0.1.js"></script>
```

If hosting a single AMP framework version is your end goal, then you can update your AMP pages to download the runtime and components from your host and skip to section [amp-geo hotpatching](#amp-geo-hotpatching). If you expect to update the AMP framework regularly, then updating rtv-specific URLs in AMP pages could be cumbersome. See the next section, [Versionless URLs](#versionless-urls), for a solution.

#### Versionless URLs

The AMP Project has a [weekly release channel](https://amp.dev/documentation/guides-and-tutorials/learn/spec/release-schedule/#weekly), sometimes referred to as the "evergreen" release channel. AMP pages utilize this channel by including versionless URLs to AMP scripts and styles. This is relatively easy to accomplish when hosting the AMP framework yourself. The key is to ensure that the AMP framework hosted from versionless URLs is _also_ available from rtv-specific URLs. This suggests an update strategy: first make a new AMP framework version available from rtv-specific URLs and _then_ update the AMP framework available from versionless URLs. For example, if stable AMP framework version `2002290616360` is available from `https://example.com/amp`, then it must also be available from `https://example.com/amp/rtv/012002290616360`. In this case, AMP meta and script URLs would look like the following:

```
<meta name="runtime-host" content="https://example.com/amp">
<script async src="https://example.com/amp/v0.js"></script>
<script async custom-element="amp-geo" src="https://example.com/amp/v0/amp-geo-0.1.js"></script>
```

If you inspect the DOM after an AMP page loads, you'll notice additional components are dynamically loaded by the runtime and use versioned URLs, for example

```
<script async custom-element="amp-auto-lightbox" data-script="amp-auto-lightbox" i-amphtml-inserted crossorigin="anonymous" src="https://example.com/amp/rtv/012002290616360/v0/amp-auto-lightbox-0.1.js"></script>
```

### Metadata

The AMP Project hosts a metadata endpoint at [cdn.ampproject.org/rtv/metadata](https://cdn.ampproject.org/rtv/metadata) that returns information on current releases. Hosting this endpoint yourself is optional, but may be useful if you use [AMP Toolbox](https://github.com/ampproject/amp-toolbox):

-   [@ampproject/toolbox-runtime-version](https://github.com/ampproject/amp-toolbox/tree/main/packages/runtime-version) uses the data to determine the latest AMP framework version available.
-   [@ampproject/toolbox-optimizer](https://github.com/ampproject/amp-toolbox/tree/main/packages/optimizer) uses the data to identify the boilerplate CSS that should be included in optimized AMP pages.
-   [@ampproject/toolbox-runtime-fetch](https://github.com/ampproject/amp-toolbox/tree/main/packages/runtime-fetch) uses the data to identify an rtv-specific path from which the framework should be downloaded.

Consider the following sample from [cdn.ampproject.org/rtv/metadata](https://cdn.ampproject.org/rtv/metadata), most JSON properties are optional:

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

-   `ampRuntimeVersion` (required) is the current stable runtime version of the AMP framework.
-   `ampCssUrl` (optional) is a URL to the boilerplate CSS for the current stable runtime version.
-   `canaryPercentage` (optional) indicates the fraction of users who receive the experimental runtime version of the AMP framework instead of the current stable runtime version.
-   `diversions` (optional) lists active non-stable runtime versions.
-   `ltsRuntimeVersion` (optional) is the current [long-term stable](../lts-release.md) runtime version.
-   `ltsCssUrl` (optional) is a URL to the boilerplate CSS for the current long-term stable runtime version.

### amp-geo hotpatching

[amp-geo](https://amp.dev/documentation/components/amp-geo/) requires special attention when hosting the AMP framework. When `cdn.ampproject.org` serves any of `amp-geo-0.1.js`, `amp-geo-0.1.mjs`, `amp-geo-latest.js`, or `amp-geo-latest.mjs`, it detects the country and subdivision where the request originated and replaces string `{{AMP_ISO_COUNTRY_HOTPATCH}}` with region data and enough trailing spaces to maintain the original string length. Ideally, when hosting the AMP framework, your content distribution platform would perform the same manipulation. The logic is as follows:

-   If country could not be determined, substitute 28 spaces:
    ```
    Before: "{{AMP_ISO_COUNTRY_HOTPATCH}}"
    After:  "                            "
    ```
-   If country could be determined, substitute the ISO 3166-1 alpha-2 country code followed by 26 spaces:
    ```
    Before: "{{AMP_ISO_COUNTRY_HOTPATCH}}"
    After:  "xx                          "
    ```
    where `xx` is the country code (e.g. `de` for Germany).
-   If country and subdivision could be determined and are exactly `us` (United States) and `ca` (California), respectively (this is the only subdivision supported by amp-geo as of this writing), substitute the ISO 3166-1 alpha-2 country code _and_ the ISO 3166-2 country-subdivision code followed by 20 spaces:
    ```
    Before: "{{AMP_ISO_COUNTRY_HOTPATCH}}"
    After:  "us us-ca                    "
    ```

#### amp-geo fallback API

If location detection and file modification at time of delivery are not possible, amp-geo supports use of an API to fetch the user's country at run time. Be aware that usage of an API for this feature increases the chances of visible content or style shifts due to the delay of an additional network request. The AMP Project does not provide this API service; you need to supply your own API. Two example providers (not a comprehensive list) that offer IP-to-country databases from which an API could be created include [MaxMind](https://www.maxmind.com) and [IP2Location](https://www.ip2location.com/).

The API must meet the following requirements:

-   Satisfy [CORS security in AMP](./amp-cors-requests.md)
-   Be secure (HTTPS)
-   Return `application/json` content conforming to the following schema:
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
        },
        "subdivision": {
          "type": "string",
          "title": "Subdivision part of ISO 3166-2 (case insensitive) country-subdivision code of client request",
          "default": "",
          "pattern": "^[a-zA-Z0-9]{1,3}$"
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

A sample response for a user in California, US looks like:

```
{
  "country": "us",
  "subdivision": "ca"
}
```

Note: As of April 2020, `us-ca` is the only subdivision supported by amp-geo.

There are trade-offs in accuracy and performance when you set the client cache time for this API. Longer cache times are better for performance on subsequent page loads but can lead to incorrect country detection. For reference, `https://cdn.ampproject.org/v0/amp-geo-0.1.js` has a client cache time of 30 minutes.

### HTTP response headers

In addition to following [TLS best practices](https://infosec.mozilla.org/guidelines/web_security), consider the following headers when hosting the AMP framework:

-   `content-security-policy`: If your pages implement [AMP's CSP](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/secure-pages/), apply a matching content security policy to your hosted framework responses. Inspect the headers on `https://cdn.ampproject.org/v0.js` for a base policy that should be expanded to include resources served from your host.
-   `access-control-allow-origin`: Some runtime components are fetched via XHR. If your AMP pages will be served from a different host than your framework, be sure to include CORS headers (see also [CORS Requests in AMP](./amp-cors-requests.md)).
-   `content-type`: There are a few resources served without file extensions, or with extensions that may not be recognized by all web servers. In addition to [common types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types), you may want to include special handling for the following:

    -   `/rtv/metadata` - `application/json`
    -   `/amp_preconnect_polyfill_404_or_other_error_expected._Do_not_worry_about_it` - `text/html`

    A complete list of files in each AMP release can be found in `files.txt`, for example `https://cdn.ampproject.org/files.txt`.

-   `cache-control`: The AMP framework hosted from versioned URLs should be "immutable"; users should expect to find the same content from these URLs for as long as the URLs are active (amp-geo is an exception, see below). Long cache times are appropriate. On the other hand, the AMP framework hosted from versionless URLs should be served with relatively short cache times so that minimal time is required for your latest update to reach all users.
    -   Versioned URL example: `cdn.ampproject.org` sets a 1 year client cache time on resources served under `cdn.ampproject.org/rtv/<rtv>`: `cache-control: public, max-age=31536000`.
    -   Versionless URL example: `cdn.ampproject.org` sets a 50 minute client cache time for resources served from versionless URLs, but also allows a long 2 week stale-while-revalidate time in the event that versionless URLs experience an outage: `cache-control: private, max-age=3000, stale-while-revalidate=1206600`.
    -   `amp-geo-*.(m)js`: If amp-geo hotpatching is utilized, there is a trade-off in accuracy and performance when you set this cache time. Longer cache times are better for performance on subsequent page loads but can lead to incorrect country detection. Both `cdn.ampproject.org/v0/amp-geo-0.1.js` and `cdn.ampproject.org/rtv/<rtv>/v0/amp-geo-0.1.js` set the client cache time to 30 minutes.
