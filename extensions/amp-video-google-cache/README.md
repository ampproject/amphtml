# Google video cache for amp-video

This extension installs a service to update amp-videos to use the Google video cache when they have the attribute `enable-google-video-cache`.

Eg:

```html
<head>
 <script async custom-element="amp-video-google-cache" src="https://cdn.ampproject.org/v0/amp-video-google-cache-0.1.js"></script>
</head>
<body>
<amp-story>
  <...>
    <amp-video enable-google-video-cache layout="fill">
      <source src="video.mp4" type="video/mp4">
    </amp-video>
  </...>
</amp-story>
</body>
```
