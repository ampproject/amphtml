(self.AMP=self.AMP||[]).push({n:"amp-video",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_forwardEvents$$ = function($JSCompiler_StaticMethods_forwardEvents$self$$, $element$jscomp$79$$) {
  var $events$$ = [_.$VideoEvents$$module$src$video_interface$$.$ENDED$, _.$VideoEvents$$module$src$video_interface$$.$LOADEDMETADATA$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$], $unlisteners$$ = (_.$isArray$$module$src$types$$($events$$) ? $events$$ : [$events$$]).map(function($events$$) {
    return _.$listen$$module$src$event_helper$$($element$jscomp$79$$, $events$$, function($element$jscomp$79$$) {
      $JSCompiler_StaticMethods_forwardEvents$self$$.element.$D$($events$$, $element$jscomp$79$$.data || {});
    });
  });
  return function() {
    return $unlisteners$$.forEach(function($JSCompiler_StaticMethods_forwardEvents$self$$) {
      return $JSCompiler_StaticMethods_forwardEvents$self$$();
    });
  };
}, $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$ = function($$jscomp$super$this$jscomp$113_element$jscomp$685$$) {
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$113_element$jscomp$685$$) || this;
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$video_$ = null;
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$prerenderAllowed_$ = !1;
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$metadata_$ = _.$EMPTY_METADATA$$module$src$mediasession_helper$$;
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$unlisteners_$ = [];
  $$jscomp$super$this$jscomp$113_element$jscomp$685$$.$posterDummyImageForTesting_$ = null;
  return $$jscomp$super$this$jscomp$113_element$jscomp$685$$;
}, $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$$ = function($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$self$$) {
  var $element$jscomp$687$$ = $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$self$$.element;
  _.$closestByTag$$module$src$dom$$($element$jscomp$687$$, "amp-story") && ["i-amphtml-disable-mediasession", "i-amphtml-poolbound"].forEach(function($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$self$$) {
    $element$jscomp$687$$.classList.add($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$self$$);
  });
}, $JSCompiler_StaticMethods_propagateCachedSources_$$ = function($JSCompiler_StaticMethods_propagateCachedSources_$self$$) {
  var $sources$jscomp$13$$ = _.$toArray$$module$src$types$$(_.$childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$.element, "source"));
  if ($JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.hasAttribute("src") && $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element)) {
    var $src$jscomp$69_srcSource$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("src"), $ampOrigSrc_type$jscomp$205$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("type");
    $src$jscomp$69_srcSource$$ = $JSCompiler_StaticMethods_createSourceElement_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $src$jscomp$69_srcSource$$, $ampOrigSrc_type$jscomp$205$$);
    $ampOrigSrc_type$jscomp$205$$ = $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.getAttribute("amp-orig-src");
    $src$jscomp$69_srcSource$$.setAttribute("amp-orig-src", $ampOrigSrc_type$jscomp$205$$);
    $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.removeAttribute("src");
    $JSCompiler_StaticMethods_propagateCachedSources_$self$$.element.removeAttribute("type");
    $sources$jscomp$13$$.unshift($src$jscomp$69_srcSource$$);
  }
  $sources$jscomp$13$$.forEach(function($sources$jscomp$13$$) {
    $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateCachedSources_$self$$, $sources$jscomp$13$$) && $JSCompiler_StaticMethods_propagateCachedSources_$self$$.$video_$.appendChild($sources$jscomp$13$$);
  });
}, $JSCompiler_StaticMethods_propagateLayoutChildren_$$ = function($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$) {
  var $sources$jscomp$14$$ = _.$toArray$$module$src$types$$(_.$childElementsByTag$$module$src$dom$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element, "source")), $element$jscomp$689$$ = $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element;
  _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.element);
  $element$jscomp$689$$.hasAttribute("src") && !$JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $element$jscomp$689$$) && ($element$jscomp$689$$.getAttribute("src"), _.$JSCompiler_StaticMethods_propagateAttributes$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, ["src"], $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$));
  $sources$jscomp$14$$.forEach(function($sources$jscomp$14$$) {
    $JSCompiler_StaticMethods_isCachedByCDN_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $sources$jscomp$14$$);
    $sources$jscomp$14$$.getAttribute("src");
    $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.appendChild($sources$jscomp$14$$);
  });
  _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.querySelectorAll("[amp-orig-src]")).forEach(function($sources$jscomp$14$$) {
    var $element$jscomp$689$$ = $sources$jscomp$14$$.getAttribute("amp-orig-src"), $cachedSource$$ = $sources$jscomp$14$$.getAttribute("type");
    $element$jscomp$689$$ = $JSCompiler_StaticMethods_createSourceElement_$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$, $element$jscomp$689$$, $cachedSource$$);
    _.$insertAfterOrAtStart$$module$src$dom$$($JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$, $element$jscomp$689$$, $sources$jscomp$14$$);
  });
  _.$toArray$$module$src$types$$(_.$childElementsByTag$$module$src$dom$$($element$jscomp$689$$, "track")).forEach(function($sources$jscomp$14$$) {
    $JSCompiler_StaticMethods_propagateLayoutChildren_$self$$.$video_$.appendChild($sources$jscomp$14$$);
  });
}, $JSCompiler_StaticMethods_isCachedByCDN_$$ = function($JSCompiler_StaticMethods_isCachedByCDN_$self$$, $element$jscomp$690$$) {
  var $src$jscomp$70$$ = $element$jscomp$690$$.getAttribute("src");
  return $element$jscomp$690$$.hasAttribute("amp-orig-src") && _.$JSCompiler_StaticMethods_Url$$module$src$service$url_impl_prototype$isProxyOrigin$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_isCachedByCDN_$self$$.element), $src$jscomp$70$$);
}, $JSCompiler_StaticMethods_createSourceElement_$$ = function($JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$, $src$jscomp$71$$, $type$jscomp$206$$) {
  var $element$jscomp$691$$ = $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$.element;
  _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$.element);
  $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$ = $element$jscomp$691$$.ownerDocument.createElement("source");
  $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$.setAttribute("src", $src$jscomp$71$$);
  $type$jscomp$206$$ && $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$.setAttribute("type", $type$jscomp$206$$);
  return $JSCompiler_StaticMethods_createSourceElement_$self_source$jscomp$56$$;
}, $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$$ = function($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$) {
  var $mutedOrUnmutedEventUnlisten_video$jscomp$79$$ = $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$video_$, $forwardEventsUnlisten$$ = $JSCompiler_StaticMethods_forwardEvents$$($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$, $mutedOrUnmutedEventUnlisten_video$jscomp$79$$);
  $mutedOrUnmutedEventUnlisten_video$jscomp$79$$ = _.$listen$$module$src$event_helper$$($mutedOrUnmutedEventUnlisten_video$jscomp$79$$, "volumechange", function() {
    var $mutedOrUnmutedEventUnlisten_video$jscomp$79$$ = $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$video_$.muted;
    $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$muted_$ != $mutedOrUnmutedEventUnlisten_video$jscomp$79$$ && ($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$muted_$ = $mutedOrUnmutedEventUnlisten_video$jscomp$79$$, $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.element.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$muted_$)));
  });
  $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$self$$.$unlisteners_$.push($forwardEventsUnlisten$$, $mutedOrUnmutedEventUnlisten_video$jscomp$79$$);
}, $JSCompiler_StaticMethods_createPosterForAndroidBug_$$ = function($JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$) {
  if (_.$JSCompiler_StaticMethods_isAndroid$$(_.$Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$.$win$)) && ($JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$ = $JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$.element, !$JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$.querySelector("i-amphtml-poster"))) {
    var $poster$jscomp$10$$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$)($_template$$module$extensions$amp_video$0_1$amp_video$$), $src$jscomp$72$$ = $JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$.getAttribute("poster");
    _.$setInitialDisplay$$module$src$style$$($poster$jscomp$10$$);
    _.$setStyles$$module$src$style$$($poster$jscomp$10$$, {"background-image":"url(" + $src$jscomp$72$$ + ")", "background-size":"cover"});
    $poster$jscomp$10$$.classList.add("i-amphtml-android-poster-bug");
    _.$JSCompiler_StaticMethods_applyFillContent$$($poster$jscomp$10$$);
    $JSCompiler_StaticMethods_createPosterForAndroidBug_$self_element$jscomp$693$$.appendChild($poster$jscomp$10$$);
  }
}, $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$ = function($JSCompiler_StaticMethods_hideBlurryPlaceholder_$self$$) {
  var $placeholder$jscomp$21$$ = $JSCompiler_StaticMethods_hideBlurryPlaceholder_$self$$.$getPlaceholder$();
  return $placeholder$jscomp$21$$ && $placeholder$jscomp$21$$.classList.contains("i-amphtml-blurry-placeholder") && _.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_hideBlurryPlaceholder_$self$$.$win$, "blurry-placeholder") ? (_.$setImportantStyles$$module$src$style$$($placeholder$jscomp$21$$, {opacity:0.0}), !0) : !1;
}, $JSCompiler_StaticMethods_onPosterLoaded_$$ = function($JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$12$$, $callback$jscomp$167$$) {
  if ($JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$12$$ = $JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$12$$.$video_$.getAttribute("poster")) {
    var $posterImg$$ = new window.Image;
    $posterImg$$.onload = $callback$jscomp$167$$;
    $posterImg$$.src = $JSCompiler_StaticMethods_onPosterLoaded_$self_poster$jscomp$12$$;
  }
}, $_template$$module$extensions$amp_video$0_1$amp_video$$ = ["<i-amphtml-poster></i-amphtml-poster>"], $ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$ = "aria-describedby aria-label aria-labelledby controls crossorigin disableremoteplayback poster controlsList".split(" "), $ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$ = ["loop", "preload"], $ATTRS_TO_PROPAGATE$$module$extensions$amp_video$0_1$amp_video$$ = $ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$.concat($ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$);
_.$$jscomp$inherits$$($AmpVideo$$module$extensions$amp_video$0_1$amp_video$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$29$$) {
  var $JSCompiler_inline_result$jscomp$1036_videoSrc$jscomp$inline_5299$$ = this.element.getAttribute("src");
  if (!$JSCompiler_inline_result$jscomp$1036_videoSrc$jscomp$inline_5299$$) {
    var $source$jscomp$inline_5300$$ = _.$elementByTag$$module$src$dom$$(this.element, "source");
    $source$jscomp$inline_5300$$ && ($JSCompiler_inline_result$jscomp$1036_videoSrc$jscomp$inline_5299$$ = $source$jscomp$inline_5300$$.getAttribute("src"));
  }
  $JSCompiler_inline_result$jscomp$1036_videoSrc$jscomp$inline_5299$$ && (_.$Services$$module$src$services$urlForDoc$$(this.element), this.$preconnect$.url($JSCompiler_inline_result$jscomp$1036_videoSrc$jscomp$inline_5299$$, $opt_onLayout$jscomp$29$$));
};
_.$JSCompiler_prototypeAlias$$.$firstAttachedCallback$ = function() {
  a: {
    var $element$jscomp$inline_5303_i$364$jscomp$inline_5305$$ = this.element;
    var $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$ = _.$toArray$$module$src$types$$(_.$childElementsByTag$$module$src$dom$$($element$jscomp$inline_5303_i$364$jscomp$inline_5305$$, "source"));
    $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$.push($element$jscomp$inline_5303_i$364$jscomp$inline_5305$$);
    for ($element$jscomp$inline_5303_i$364$jscomp$inline_5305$$ = 0; $element$jscomp$inline_5303_i$364$jscomp$inline_5305$$ < $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$.length; $element$jscomp$inline_5303_i$364$jscomp$inline_5305$$++) {
      if ($JSCompiler_StaticMethods_isCachedByCDN_$$(this, $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$[$element$jscomp$inline_5303_i$364$jscomp$inline_5305$$])) {
        $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$ = !0;
        break a;
      }
    }
    $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$ = !1;
  }
  this.$prerenderAllowed_$ = $JSCompiler_inline_result$jscomp$1037_sources$jscomp$inline_5304$$;
};
_.$JSCompiler_prototypeAlias$$.$prerenderAllowed$ = function() {
  return this.$prerenderAllowed_$;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$108$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$108$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$1312$$ = this, $element$jscomp$686$$ = this.element;
  $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$configure_$$(this);
  this.$video_$ = $element$jscomp$686$$.ownerDocument.createElement("video");
  var $poster$jscomp$8$$ = $element$jscomp$686$$.getAttribute("poster");
  !$poster$jscomp$8$$ && _.$getMode$$module$src$mode$$().$development$ && window.console.error('No "poster" attribute has been provided for amp-video.');
  this.$video_$.setAttribute("playsinline", "");
  this.$video_$.setAttribute("webkit-playsinline", "");
  this.$video_$.setAttribute("preload", "none");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $ATTRS_TO_PROPAGATE_ON_BUILD$$module$extensions$amp_video$0_1$amp_video$$, this.$video_$, !0);
  $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$$(this);
  _.$JSCompiler_StaticMethods_applyFillContent$$(this.$video_$, !0);
  $JSCompiler_StaticMethods_createPosterForAndroidBug_$$(this);
  $element$jscomp$686$$.appendChild(this.$video_$);
  $JSCompiler_StaticMethods_onPosterLoaded_$$(this, function() {
    return $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$($$jscomp$this$jscomp$1312$$);
  });
  var $artist$jscomp$1$$ = $element$jscomp$686$$.getAttribute("artist"), $title$jscomp$31$$ = $element$jscomp$686$$.getAttribute("title"), $album$jscomp$1$$ = $element$jscomp$686$$.getAttribute("album"), $artwork$jscomp$2$$ = $element$jscomp$686$$.getAttribute("artwork");
  this.$metadata_$ = {title:$title$jscomp$31$$ || "", artist:$artist$jscomp$1$$ || "", album:$album$jscomp$1$$ || "", artwork:[{src:$artwork$jscomp$2$$ || $poster$jscomp$8$$ || ""}]};
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$686$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$686$$).register(this);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$20$$) {
  if (this.$video_$) {
    var $artist$jscomp$2_element$jscomp$688$$ = this.element;
    $mutations$jscomp$20$$.src && (_.$Services$$module$src$services$urlForDoc$$(this.element), $artist$jscomp$2_element$jscomp$688$$.getAttribute("src"), _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["src"], this.$video_$));
    var $album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ = $ATTRS_TO_PROPAGATE$$module$extensions$amp_video$0_1$amp_video$$.filter(function($artist$jscomp$2_element$jscomp$688$$) {
      return void 0 !== $mutations$jscomp$20$$[$artist$jscomp$2_element$jscomp$688$$];
    });
    _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$, this.$video_$, !0);
    $mutations$jscomp$20$$.src && $artist$jscomp$2_element$jscomp$688$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$RELOAD$);
    if ($mutations$jscomp$20$$.artwork || $mutations$jscomp$20$$.poster) {
      $album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ = $artist$jscomp$2_element$jscomp$688$$.getAttribute("artwork");
      var $poster$jscomp$9$$ = $artist$jscomp$2_element$jscomp$688$$.getAttribute("poster");
      this.$metadata_$.artwork = [{src:$album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ || $poster$jscomp$9$$ || ""}];
    }
    $mutations$jscomp$20$$.album && ($album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ = $artist$jscomp$2_element$jscomp$688$$.getAttribute("album"), this.$metadata_$.album = $album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ || "");
    $mutations$jscomp$20$$.title && ($album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ = $artist$jscomp$2_element$jscomp$688$$.getAttribute("title"), this.$metadata_$.title = $album$jscomp$2_artwork$jscomp$3_attrs$jscomp$12_title$jscomp$32$$ || "");
    $mutations$jscomp$20$$.artist && ($artist$jscomp$2_element$jscomp$688$$ = $artist$jscomp$2_element$jscomp$688$$.getAttribute("artist"), this.$metadata_$.artist = $artist$jscomp$2_element$jscomp$688$$ || "");
  }
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$15$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$15$$});
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1313$$ = this;
  this.$video_$ = this.$video_$;
  if (!this.$video_$.play) {
    return this.$toggleFallback$(!0), window.Promise.resolve();
  }
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $ATTRS_TO_PROPAGATE_ON_LAYOUT$$module$extensions$amp_video$0_1$amp_video$$, this.$video_$, !0);
  $JSCompiler_StaticMethods_propagateCachedSources_$$(this);
  var $viewer$jscomp$51$$ = _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$());
  "prerender" == $viewer$jscomp$51$$.$G$ ? (this.element.hasAttribute("preload") || this.$video_$.setAttribute("preload", "auto"), $viewer$jscomp$51$$.$D$.then(function() {
    $JSCompiler_StaticMethods_propagateLayoutChildren_$$($$jscomp$this$jscomp$1313$$);
  })) : $JSCompiler_StaticMethods_propagateLayoutChildren_$$(this);
  return this.$loadPromise$(this.$video_$).then(function() {
    $$jscomp$this$jscomp$1313$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
};
_.$JSCompiler_prototypeAlias$$.$resetOnDomChange$ = function() {
  for (this.$video_$ = _.$childElementByTag$$module$src$dom$$(this.element, "video"); this.$unlisteners_$.length;) {
    this.$unlisteners_$.pop().call();
  }
  $JSCompiler_StaticMethods_AmpVideo$$module$extensions$amp_video$0_1$amp_video_prototype$installEventHandlers_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$video_$ && this.$video_$.pause();
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !!this.$video_$.play;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return this.element.hasAttribute("controls");
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  var $ret$jscomp$1$$ = this.$video_$.play();
  $ret$jscomp$1$$ && $ret$jscomp$1$$.catch && $ret$jscomp$1$$.catch(function() {
  });
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  this.$video_$.pause();
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  this.element.classList.contains("i-amphtml-poolbound") || (this.$video_$.muted = !0);
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  this.element.classList.contains("i-amphtml-poolbound") || (this.$video_$.muted = !1);
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  this.$video_$.controls = !0;
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  this.$video_$.controls = !1;
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  _.$fullscreenEnter$$module$src$dom$$(this.$video_$);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  _.$fullscreenExit$$module$src$dom$$(this.$video_$);
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
  return this.$metadata_$;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return this.$video_$.currentTime;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$video_$.duration;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  for (var $played$jscomp$1$$ = this.$video_$.played, $length$jscomp$43$$ = $played$jscomp$1$$.length, $ranges$jscomp$4$$ = [], $i$365$$ = 0; $i$365$$ < $length$jscomp$43$$; $i$365$$++) {
    $ranges$jscomp$4$$.push([$played$jscomp$1$$.start($i$365$$), $played$jscomp$1$$.end($i$365$$)]);
  }
  return $ranges$jscomp$4$$;
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  $JSCompiler_StaticMethods_hideBlurryPlaceholder_$$(this) || this.$togglePlaceholder$(!1);
  var $poster$jscomp$inline_5310$$ = this.element.querySelector("i-amphtml-poster");
  $poster$jscomp$inline_5310$$ && _.$removeElement$$module$src$dom$$($poster$jscomp$inline_5310$$);
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function($timeSeconds$$) {
  this.$video_$.currentTime = $timeSeconds$$;
};
window.self.AMP.registerElement("amp-video", $AmpVideo$$module$extensions$amp_video$0_1$amp_video$$);

})});
