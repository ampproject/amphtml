# Google video cache for amp-video

This extension installs a service to update amp-videos to use the Google video cache when they have the attribute `enable-google-video-cache`.

Eg:

```html
<head>
  <!-- Import the amp-cache-url extension -->
 <script async custom-element="amp-cache-url" src="https://cdn.ampproject.org/v0/amp-cache-url-0.1.js"></script>
</head>
<body>
<amp-story>
  <...>
    <!-- Add the enable-google-video-cache attribute to the video -->
    <amp-video enable-google-video-cache layout="fill">
      <source src="video.mp4" type="video/mp4">
    </amp-video>
  </...>
</amp-story>
</body>
```
