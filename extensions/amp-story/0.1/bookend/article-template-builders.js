buildDefault(data) {
  return new ArticleTemplate.Builder()
    .withData(data)
    .withClass('i-amphtml-story-bookend-article')
    .addImage(100, 100)
    .addHeading()
    .addDomainName()
    .build();
}

buildLandscape(data) {
  return new ArticleTemplate.Builder()
    .withData(data)
    .withClass("i-amphtml-story-bookend-article-landscape")
    .addImage(315, 450)
    .addHeading()
    .addDomainName()
    .build();
}

buildPortrait(data) {
  return new ArticleTemplate.Builder()
    .withData(data)
    .withClass("i-amphtml-story-bookend-article-portrait")
    .addEyeBrow()
    .addImage(315, 900)
    .addHeading()
    .addDomainName()
    .build();
}