const inner = jsonLiteral({
  inner: true,
});

jsonConfiguration({
  config: includeJsonLiteral(inner),
});
