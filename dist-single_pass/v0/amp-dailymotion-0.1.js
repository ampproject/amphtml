(self.AMP=self.AMP||[]).push({n:"amp-dailymotion",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion$$ = function($$jscomp$super$this$jscomp$35_element$jscomp$382$$) {
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$35_element$jscomp$382$$) || this;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$playerState_$ = "unstarted";
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$videoid_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$startedBufferingPromise_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$startedBufferingResolver_$ = null;
  $$jscomp$super$this$jscomp$35_element$jscomp$382$$.$isFullscreen_$ = !1;
  return $$jscomp$super$this$jscomp$35_element$jscomp$382$$;
}, $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$self$$, $command$jscomp$2$$, $opt_args$jscomp$12$$) {
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    if ($JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$self$$.$iframe_$.contentWindow) {
      var $message$jscomp$61$$ = JSON.stringify(_.$dict$$module$src$utils$object$$({command:$command$jscomp$2$$, parameters:$opt_args$jscomp$12$$ || []}));
      $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$61$$, "https://www.dailymotion.com");
    }
  });
}, $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$$ = function($JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$self$$) {
  var $iframeSrc$$ = "https://www.dailymotion.com/embed/video/" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$self$$.$videoid_$ || "") + "?api=1&html=1&app=amp";
  "mute endscreen-enable sharing-enable start ui-highlight ui-logo info".split(" ").forEach(function($implicitParams$$) {
    var $explicitParam$$ = $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$self$$.element.getAttribute("data-" + $implicitParams$$);
    $explicitParam$$ && ($iframeSrc$$ = _.$addParamToUrl$$module$src$url$$($iframeSrc$$, $implicitParams$$, $explicitParam$$));
  });
  var $implicitParams$$ = _.$getDataParamsFromAttributes$$module$src$dom$$($JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$self$$.element);
  return $iframeSrc$$ = _.$addParamsToUrl$$module$src$url$$($iframeSrc$$, $implicitParams$$);
};
_.$$jscomp$inherits$$($AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$10$$) {
  this.$preconnect$.url("https://www.dailymotion.com", $opt_onLayout$jscomp$10$$);
  this.$preconnect$.url("https://static1.dmcdn.net", $opt_onLayout$jscomp$10$$);
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$47$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$47$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$8$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$8$$});
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$videoid_$ = this.element.getAttribute("data-videoid");
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
  var $bufferingDeferred_readyDeferred$jscomp$2$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $bufferingDeferred_readyDeferred$jscomp$2$$.$promise$;
  this.$playerReadyResolver_$ = $bufferingDeferred_readyDeferred$jscomp$2$$.resolve;
  $bufferingDeferred_readyDeferred$jscomp$2$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$startedBufferingPromise_$ = $bufferingDeferred_readyDeferred$jscomp$2$$.$promise$;
  this.$startedBufferingResolver_$ = $bufferingDeferred_readyDeferred$jscomp$2$$.resolve;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$getIframeSrc_$$(this));
  _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleEvents_$.bind(this));
  return this.$loadPromise$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$handleEvents_$ = function($data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$) {
  if (_.$originMatches$$module$src$iframe_video$$($data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$, this.$iframe_$, "https://www.dailymotion.com")) {
    var $$jscomp$compprop29_eventData$jscomp$5$$ = $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.data;
    if ($$jscomp$compprop29_eventData$jscomp$5$$ && $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.type && "message" == $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.type && ($data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($$jscomp$compprop29_eventData$jscomp$5$$), void 0 !== $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$)) {
      switch($$jscomp$compprop29_eventData$jscomp$5$$ = {}, _.$redispatch$$module$src$iframe_video$$(this.element, $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.event, ($$jscomp$compprop29_eventData$jscomp$5$$.apiready = _.$VideoEvents$$module$src$video_interface$$.$LOAD$, $$jscomp$compprop29_eventData$jscomp$5$$.end = [_.$VideoEvents$$module$src$video_interface$$.$ENDED$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$], $$jscomp$compprop29_eventData$jscomp$5$$.pause = _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, 
      $$jscomp$compprop29_eventData$jscomp$5$$.play = _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, $$jscomp$compprop29_eventData$jscomp$5$$)), $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.event) {
        case "apiready":
          this.$playerReadyResolver_$(!0);
          break;
        case "end":
          this.$playerState_$ = "pause";
          break;
        case "pause":
        case "play":
          this.$playerState_$ = $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.event;
          break;
        case "volumechange":
          $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$ = 0 == $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.volume || "true" == $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.muted;
          if ("unstarted" == this.$playerState_$ || this.$muted_$ != $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$) {
            this.$muted_$ = $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$, this.element.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$));
          }
          break;
        case "progress":
          this.$startedBufferingResolver_$(!0);
          break;
        case "fullscreenchange":
          this.$isFullscreen_$ = "true" == $data$jscomp$120_event$jscomp$102_isMuted$jscomp$1$$.fullscreen;
      }
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.pause();
};
_.$JSCompiler_prototypeAlias$$.play = function($isAutoplay$$) {
  var $$jscomp$this$jscomp$560$$ = this;
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "play");
  $isAutoplay$$ && "pause" != this.$playerState_$ && this.$startedBufferingPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$($$jscomp$this$jscomp$560$$, "play");
  });
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  var $$jscomp$this$jscomp$561$$ = this;
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "muted", [!0]);
  this.$playerReadyPromise_$.then(function() {
    $$jscomp$this$jscomp$561$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$MUTED$);
    $$jscomp$this$jscomp$561$$.$muted_$ = !0;
  });
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  var $$jscomp$this$jscomp$562$$ = this;
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "muted", [!1]);
  this.$playerReadyPromise_$.then(function() {
    $$jscomp$this$jscomp$562$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$);
    $$jscomp$this$jscomp$562$$.$muted_$ = !1;
  });
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "controls", [!0]);
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "controls", [!1]);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  var $platform$jscomp$10$$ = _.$Services$$module$src$services$platformFor$$(this.$win$);
  _.$JSCompiler_StaticMethods_isSafari$$($platform$jscomp$10$$) || _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$10$$) ? $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "fullscreen", [!0]) : this.$iframe_$ && _.$fullscreenEnter$$module$src$dom$$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  var $platform$jscomp$11$$ = _.$Services$$module$src$services$platformFor$$(this.$win$);
  _.$JSCompiler_StaticMethods_isSafari$$($platform$jscomp$11$$) || _.$JSCompiler_StaticMethods_isIos$$($platform$jscomp$11$$) ? $JSCompiler_StaticMethods_AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion_prototype$sendCommand_$$(this, "fullscreen", [!1]) : this.$iframe_$ && _.$fullscreenExit$$module$src$dom$$(this.$iframe_$);
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
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-dailymotion", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-dailymotion", $AmpDailymotion$$module$extensions$amp_dailymotion$0_1$amp_dailymotion$$);

})});
