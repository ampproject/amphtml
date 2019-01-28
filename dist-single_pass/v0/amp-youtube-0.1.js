(self.AMP=self.AMP||[]).push({n:"amp-youtube",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$ = function($$jscomp$super$this$jscomp$121_element$jscomp$708$$) {
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$121_element$jscomp$708$$) || this;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$videoid_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$liveChannelid_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$info_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$videoIframeSrc_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$121_element$jscomp$708$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$121_element$jscomp$708$$;
}, $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$self$$, $command$jscomp$11$$, $opt_args$jscomp$19$$) {
  $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    if ($JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$self$$.$iframe_$.contentWindow) {
      var $message$jscomp$92$$ = JSON.stringify(_.$dict$$module$src$utils$object$$({event:"command", func:$command$jscomp$11$$, args:$opt_args$jscomp$19$$ || ""}));
      $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$92$$, "*");
    }
  });
}, $JSCompiler_StaticMethods_buildImagePlaceholder_$$ = function($JSCompiler_StaticMethods_buildImagePlaceholder_$self$$) {
  var $el$jscomp$181$$ = $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.element, $imgPlaceholder$$ = _.$htmlFor$$module$src$static_template$$($el$jscomp$181$$)($_template$$module$extensions$amp_youtube$0_1$amp_youtube$$), $videoid$jscomp$2$$ = $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.$videoid_$;
  _.$setStyles$$module$src$style$$($imgPlaceholder$$, {"object-fit":"cover", visibility:"hidden"});
  _.$JSCompiler_StaticMethods_propagateAttributes$$($JSCompiler_StaticMethods_buildImagePlaceholder_$self$$, ["aria-label"], $imgPlaceholder$$);
  $imgPlaceholder$$.src = "https://i.ytimg.com/vi/" + (0,window.encodeURIComponent)($videoid$jscomp$2$$) + "/sddefault.jpg#404_is_fine";
  $imgPlaceholder$$.hasAttribute("aria-label") ? $imgPlaceholder$$.setAttribute("alt", "Loading video - " + $imgPlaceholder$$.getAttribute("aria-label")) : $imgPlaceholder$$.setAttribute("alt", "Loading video");
  _.$JSCompiler_StaticMethods_applyFillContent$$($imgPlaceholder$$);
  $el$jscomp$181$$.appendChild($imgPlaceholder$$);
  $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.$loadPromise$($imgPlaceholder$$).then(function() {
    if (120 == $imgPlaceholder$$.naturalWidth && 90 == $imgPlaceholder$$.naturalHeight) {
      throw Error("sddefault.jpg is not found");
    }
  }).catch(function() {
    $imgPlaceholder$$.src = "https://i.ytimg.com/vi/" + (0,window.encodeURIComponent)($videoid$jscomp$2$$) + "/hqdefault.jpg";
    return $JSCompiler_StaticMethods_buildImagePlaceholder_$self$$.$loadPromise$($imgPlaceholder$$);
  }).then(function() {
    _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_buildImagePlaceholder_$self$$).$mutate$(function() {
      _.$setStyles$$module$src$style$$($imgPlaceholder$$, {visibility:""});
    });
  });
}, $_template$$module$extensions$amp_youtube$0_1$amp_youtube$$ = ["<img placeholder referrerpolicy=origin>"];
_.$$jscomp$inherits$$($AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$33$$) {
  var $preconnect$jscomp$8$$ = this.$preconnect$;
  $preconnect$jscomp$8$$.url(this.$getVideoIframeSrc_$());
  $preconnect$jscomp$8$$.url("https://s.ytimg.com", $opt_onLayout$jscomp$33$$);
  $preconnect$jscomp$8$$.url("https://i.ytimg.com", $opt_onLayout$jscomp$33$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$117$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$117$$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return 0.75;
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$17$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$17$$});
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$videoid_$ = this.element.getAttribute("data-videoid");
  this.$liveChannelid_$ = this.element.getAttribute("data-live-channelid");
  var $deferred$jscomp$71$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$71$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$71$$.resolve;
  !this.$getPlaceholder$() && this.$videoid_$ && $JSCompiler_StaticMethods_buildImagePlaceholder_$$(this);
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  if (this.$videoIframeSrc_$) {
    return this.$videoIframeSrc_$;
  }
  var $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ = "";
  "omit" === (this.element.getAttribute("credentials") || "include") && ($baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ = "-nocookie");
  $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ = "https://www.youtube" + $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ + ".com/embed/";
  var $descriptor$jscomp$inline_5523_element$jscomp$709$$ = this.$videoid_$ ? (0,window.encodeURIComponent)(this.$videoid_$ || "") + "?" : "live_stream?channel=" + ((0,window.encodeURIComponent)(this.$liveChannelid_$ || "") + "&");
  $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ = $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ + $descriptor$jscomp$inline_5523_element$jscomp$709$$ + "enablejsapi=1";
  $descriptor$jscomp$inline_5523_element$jscomp$709$$ = this.element;
  var $params$jscomp$46$$ = _.$getDataParamsFromAttributes$$module$src$dom$$($descriptor$jscomp$inline_5523_element$jscomp$709$$);
  "autoplay" in $params$jscomp$46$$ && (delete $params$jscomp$46$$.autoplay, this.$user$().error("AMP-YOUTUBE", "Use autoplay attribute instead of data-param-autoplay"));
  "playsinline" in $params$jscomp$46$$ || ($params$jscomp$46$$.playsinline = "1");
  $descriptor$jscomp$inline_5523_element$jscomp$709$$.hasAttribute("autoplay") && ("iv_load_policy" in $params$jscomp$46$$ || ($params$jscomp$46$$.iv_load_policy = "3"), $params$jscomp$46$$.playsinline = "1");
  return this.$videoIframeSrc_$ = $baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$ = _.$addParamsToUrl$$module$src$url$$($baseUrl$jscomp$inline_5522_src$jscomp$75_urlSuffix$jscomp$inline_5521$$, $params$jscomp$46$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1359$$ = this;
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, this.$getVideoIframeSrc_$());
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleYoutubeMessage_$.bind(this));
  var $loaded$jscomp$6$$ = this.$loadPromise$(this.$iframe_$).then(function() {
    return _.$Services$$module$src$services$timerFor$$($$jscomp$this$jscomp$1359$$.$win$).$promise$(300);
  }).then(function() {
    $$jscomp$this$jscomp$1359$$.$iframe_$ && $$jscomp$this$jscomp$1359$$.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({event:"listening"})), "*");
    $$jscomp$this$jscomp$1359$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
  this.$playerReadyResolver_$($loaded$jscomp$6$$);
  return $loaded$jscomp$6$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$72$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$72$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$72$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$21$$) {
  null != $mutations$jscomp$21$$["data-videoid"] && (this.$videoid_$ = this.element.getAttribute("data-videoid"), this.$iframe_$ && $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$(this, "loadVideoById", [this.$videoid_$]));
};
_.$JSCompiler_prototypeAlias$$.$handleYoutubeMessage_$ = function($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$) {
  if (_.$originMatches$$module$src$iframe_video$$($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$, this.$iframe_$, "https://www.youtube.com") && ($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ = $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$))) {
    var $data$jscomp$224_element$jscomp$710$$ = _.$objOrParseJson$$module$src$iframe_video$$($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$);
    if (null != $data$jscomp$224_element$jscomp$710$$) {
      $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ = $data$jscomp$224_element$jscomp$710$$.event;
      var $info$jscomp$19$$ = $data$jscomp$224_element$jscomp$710$$.info || {};
      $data$jscomp$224_element$jscomp$710$$ = this.element;
      var $muted$jscomp$5_playerState$jscomp$1$$ = $info$jscomp$19$$.playerState;
      "infoDelivery" == $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ && null != $muted$jscomp$5_playerState$jscomp$1$$ ? ($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ = {}, _.$redispatch$$module$src$iframe_video$$($data$jscomp$224_element$jscomp$710$$, $muted$jscomp$5_playerState$jscomp$1$$.toString(), ($$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$[1] = _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, 
      $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$[2] = _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$[0] = [_.$VideoEvents$$module$src$video_interface$$.$ENDED$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$], $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$))) : ($muted$jscomp$5_playerState$jscomp$1$$ = $info$jscomp$19$$.muted, "infoDelivery" == 
      $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ && $info$jscomp$19$$ && null != $muted$jscomp$5_playerState$jscomp$1$$ ? this.$muted_$ != $muted$jscomp$5_playerState$jscomp$1$$ && (this.$muted_$ = $muted$jscomp$5_playerState$jscomp$1$$, $data$jscomp$224_element$jscomp$710$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$(this.$muted_$))) : "initialDelivery" == $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ ? (this.$info_$ = 
      $info$jscomp$19$$, $data$jscomp$224_element$jscomp$710$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOADEDMETADATA$)) : "infoDelivery" == $$jscomp$compprop108_event$jscomp$257_eventData$jscomp$25_eventType$jscomp$69$$ && void 0 !== $info$jscomp$19$$.currentTime && (this.$info_$.currentTime = $info$jscomp$19$$.currentTime));
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$(this, "playVideo");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$(this, "pauseVideo");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube_prototype$sendCommand_$$(this, "unMute");
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  this.$iframe_$ && _.$fullscreenEnter$$module$src$dom$$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  this.$iframe_$ && _.$fullscreenExit$$module$src$dom$$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return this.$info_$ ? this.$info_$.currentTime : window.NaN;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$info_$ ? this.$info_$.duration : window.NaN;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-youtube", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-youtube", $AmpYoutube$$module$extensions$amp_youtube$0_1$amp_youtube$$);

})});
