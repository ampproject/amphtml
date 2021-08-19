AMP.extension('amp-mustache', '0.2', function (AMP) {
  AMP.registerTemplate(TAG, AmpMustache);
});

AMP.extension('amp-gist', '0.1', (AMP) => {
  AMP.registerElement('amp-gist', AmpGist);
});
