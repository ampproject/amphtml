registerServiceBuilder(win, 'story-analytics', function () {
  return new StoryAnalyticsService();
});
geoDeferred = new Deferred();
AMP.registerServiceForDoc('foo', function () {
  return geoDeferred.promise;
});
