(self.AMP=self.AMP||[]).push({n:"amp-ima-video",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $ImaPlayerData$$module$ads$google$ima_player_data$$ = function() {
  this.currentTime = 0;
  this.duration = 1;
  this.$playedRanges$ = [];
}, $AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video$$ = function($$jscomp$super$this$jscomp$59_element$jscomp$440$$) {
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$59_element$jscomp$440$$) || this;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$viewport_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$preconnectSource_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$preconnectTrack_$ = null;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$isFullscreen_$ = !1;
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$unlisteners_$ = {};
  $$jscomp$super$this$jscomp$59_element$jscomp$440$$.$playerData_$ = new $ImaPlayerData$$module$ads$google$ima_player_data$$;
  return $$jscomp$super$this$jscomp$59_element$jscomp$440$$;
}, $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$, $command$jscomp$4$$, $opt_args$jscomp$13$$) {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({event:"command", func:$command$jscomp$4$$, args:$opt_args$jscomp$13$$ || ""})), "*");
  });
  if ($JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$unlisteners_$[$command$jscomp$4$$]) {
    $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$self$$.$unlisteners_$[$command$jscomp$4$$]();
  }
};
$ImaPlayerData$$module$ads$google$ima_player_data$$.prototype.update = function($played_videoPlayer$$) {
  this.currentTime = $played_videoPlayer$$.currentTime;
  this.duration = $played_videoPlayer$$.duration;
  $played_videoPlayer$$ = $played_videoPlayer$$.played;
  var $length$jscomp$39$$ = $played_videoPlayer$$.length;
  this.$playedRanges$ = [];
  for (var $i$jscomp$325$$ = 0; $i$jscomp$325$$ < $length$jscomp$39$$; $i$jscomp$325$$++) {
    this.$playedRanges$.push([$played_videoPlayer$$.start($i$jscomp$325$$), $played_videoPlayer$$.end($i$jscomp$325$$)]);
  }
};
_.$$jscomp$inherits$$($AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$646$$ = this;
  this.$viewport_$ = this.$getViewport$();
  "true" === this.element.getAttribute("data-delay-ad-request") && (this.$unlisteners_$.onFirstScroll = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$(this.$viewport_$, function() {
    $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$($$jscomp$this$jscomp$646$$, "onFirstScroll");
  }), _.$Services$$module$src$services$timerFor$$(this.$win$).delay(function() {
    $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$($$jscomp$this$jscomp$646$$, "onAdRequestDelayTimeout");
  }, 3000));
  this.element.getAttribute("data-tag");
  var $childElements_scriptElement$jscomp$3_sourceElements$$ = _.$childElementsByTag$$module$src$dom$$(this.element, "SOURCE"), $trackElements$$ = _.$childElementsByTag$$module$src$dom$$(this.element, "TRACK");
  $childElements_scriptElement$jscomp$3_sourceElements$$ = _.$toArray$$module$src$types$$($childElements_scriptElement$jscomp$3_sourceElements$$).concat(_.$toArray$$module$src$types$$($trackElements$$));
  if (0 < $childElements_scriptElement$jscomp$3_sourceElements$$.length) {
    var $children$jscomp$137$$ = [];
    $childElements_scriptElement$jscomp$3_sourceElements$$.forEach(function($childElements_scriptElement$jscomp$3_sourceElements$$) {
      "SOURCE" != $childElements_scriptElement$jscomp$3_sourceElements$$.tagName || $$jscomp$this$jscomp$646$$.$preconnectSource_$ ? "TRACK" != $childElements_scriptElement$jscomp$3_sourceElements$$.tagName || $$jscomp$this$jscomp$646$$.$preconnectTrack_$ || ($$jscomp$this$jscomp$646$$.$preconnectTrack_$ = $childElements_scriptElement$jscomp$3_sourceElements$$.src) : $$jscomp$this$jscomp$646$$.$preconnectSource_$ = $childElements_scriptElement$jscomp$3_sourceElements$$.src;
      $children$jscomp$137$$.push($childElements_scriptElement$jscomp$3_sourceElements$$.outerHTML);
    });
    this.element.setAttribute("data-child-elements", JSON.stringify($children$jscomp$137$$));
  }
  ($childElements_scriptElement$jscomp$3_sourceElements$$ = _.$childElementsByTag$$module$src$dom$$(this.element, "SCRIPT")[0]) && _.$isJsonScriptTag$$module$src$dom$$($childElements_scriptElement$jscomp$3_sourceElements$$) && this.element.setAttribute("data-ima-settings", $childElements_scriptElement$jscomp$3_sourceElements$$.innerHTML);
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  var $element$jscomp$441$$ = this.element, $preconnect$jscomp$4$$ = this.$preconnect$;
  $preconnect$jscomp$4$$.$preload$("https://imasdk.googleapis.com/js/sdkloader/ima3.js", "script");
  var $source$jscomp$41$$ = $element$jscomp$441$$.getAttribute("data-src");
  $source$jscomp$41$$ && $preconnect$jscomp$4$$.url($source$jscomp$41$$);
  this.$preconnectSource_$ && $preconnect$jscomp$4$$.url(this.$preconnectSource_$);
  this.$preconnectTrack_$ && $preconnect$jscomp$4$$.url(this.$preconnectTrack_$);
  $preconnect$jscomp$4$$.url($element$jscomp$441$$.getAttribute("data-tag"));
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, $preconnect$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$67$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$67$$);
};
_.$JSCompiler_prototypeAlias$$.$getConsentPolicy$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$647$$ = this, $element$jscomp$442$$ = this.element, $win$jscomp$350$$ = this.$win$, $consentPolicyId$jscomp$4$$ = window.AMP.BaseElement.prototype.$getConsentPolicy$.call(this);
  return ($consentPolicyId$jscomp$4$$ ? _.$getConsentPolicyState$$module$src$consent$$($element$jscomp$442$$, $consentPolicyId$jscomp$4$$) : window.Promise.resolve(null)).then(function($consentPolicyId$jscomp$4$$) {
    $consentPolicyId$jscomp$4$$ = _.$getIframe$$module$src$3p_frame$$($win$jscomp$350$$, $element$jscomp$442$$, "ima-video", {initialConsentState:$consentPolicyId$jscomp$4$$}, {$allowFullscreen$:!0});
    _.$JSCompiler_StaticMethods_applyFillContent$$($consentPolicyId$jscomp$4$$);
    $$jscomp$this$jscomp$647$$.$iframe_$ = $consentPolicyId$jscomp$4$$;
    var $iframe$jscomp$61_initialConsentState$$ = new _.$Deferred$$module$src$utils$promise$$;
    $$jscomp$this$jscomp$647$$.$playerReadyPromise_$ = $iframe$jscomp$61_initialConsentState$$.$promise$;
    $$jscomp$this$jscomp$647$$.$playerReadyResolver_$ = $iframe$jscomp$61_initialConsentState$$.resolve;
    $$jscomp$this$jscomp$647$$.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$($$jscomp$this$jscomp$647$$.$win$, "message", function($element$jscomp$442$$) {
      if ($element$jscomp$442$$.source == $$jscomp$this$jscomp$647$$.$iframe_$.contentWindow && ($element$jscomp$442$$ = $element$jscomp$442$$.data, _.$isObject$$module$src$types$$($element$jscomp$442$$))) {
        var $win$jscomp$350$$ = $element$jscomp$442$$.event;
        _.$isEnumValue$$module$src$types$$(_.$VideoEvents$$module$src$video_interface$$, $win$jscomp$350$$) ? ($win$jscomp$350$$ == _.$VideoEvents$$module$src$video_interface$$.$LOAD$ && $$jscomp$this$jscomp$647$$.$playerReadyResolver_$($$jscomp$this$jscomp$647$$.$iframe_$), $$jscomp$this$jscomp$647$$.element.$D$($win$jscomp$350$$)) : "imaPlayerData" == $win$jscomp$350$$ ? $$jscomp$this$jscomp$647$$.$playerData_$ = $element$jscomp$442$$.data : "fullscreenchange" == $win$jscomp$350$$ && ($$jscomp$this$jscomp$647$$.$isFullscreen_$ = 
        !!$element$jscomp$442$$.isFullscreen);
      }
    });
    $element$jscomp$442$$.appendChild($consentPolicyId$jscomp$4$$);
    _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$442$$);
    _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$442$$).register($$jscomp$this$jscomp$647$$);
    return $$jscomp$this$jscomp$647$$.$loadPromise$($consentPolicyId$jscomp$4$$).then(function() {
      return $$jscomp$this$jscomp$647$$.$playerReadyPromise_$;
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$9$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$9$$});
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$47$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$47$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$47$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  if (this.$iframe_$) {
    var $$jscomp$destructuring$var417$$ = this.$getLayoutBox$();
    $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "resize", {width:$$jscomp$destructuring$var417$$.width, height:$$jscomp$destructuring$var417$$.height});
  }
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "playVideo");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "pauseVideo");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "unMute");
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "showControls");
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "hideControls");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "enterFullscreen");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  $JSCompiler_StaticMethods_AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video_prototype$sendCommand_$$(this, "exitFullscreen");
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return this.$playerData_$.currentTime;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$playerData_$.duration;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return this.$playerData_$.$playedRanges$;
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-ima-video", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-ima-video", $AmpImaVideo$$module$extensions$amp_ima_video$0_1$amp_ima_video$$);

})});
