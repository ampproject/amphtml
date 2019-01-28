(self.AMP=self.AMP||[]).push({n:"amp-wistia-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player$$ = function($$jscomp$super$this$jscomp$119_element$jscomp$704$$) {
  $$jscomp$super$this$jscomp$119_element$jscomp$704$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$119_element$jscomp$704$$) || this;
  $$jscomp$super$this$jscomp$119_element$jscomp$704$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$119_element$jscomp$704$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$119_element$jscomp$704$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$119_element$jscomp$704$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$119_element$jscomp$704$$;
}, $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$self$$, $command$jscomp$10$$) {
  $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($command$jscomp$10$$, "*");
  });
};
_.$$jscomp$inherits$$($AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$12$$) {
  this.$preconnect$.url("https://fast.wistia.net", $onLayout$jscomp$12$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$115$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$115$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $deferred$jscomp$69$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$69$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$69$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1356$$ = this, $element$jscomp$705$$ = this.element, $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$ = $element$jscomp$705$$.getAttribute("data-media-hashed-id");
  $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$ = _.$createFrameFor$$module$src$iframe_video$$(this, "https://fast.wistia.net/embed/iframe/" + (0,window.encodeURIComponent)($iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$));
  $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$.setAttribute("title", $element$jscomp$705$$.getAttribute("title") || "Wistia Video Player");
  $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$.setAttribute("scrolling", "no");
  $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$.setAttribute("allowtransparency", "");
  this.$iframe_$ = $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleWistiaMessage_$.bind(this));
  $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$ = this.$loadPromise$(this.$iframe_$).then(function() {
    $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$($$jscomp$this$jscomp$1356$$, "amp-listening");
    $element$jscomp$705$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
  this.$playerReadyResolver_$($iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$);
  return $iframe$jscomp$100_loaded$jscomp$5_mediaId$jscomp$1$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$70$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$70$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$70$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$16$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$16$$});
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$handleWistiaMessage_$ = function($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$) {
  if (_.$originMatches$$module$src$iframe_video$$($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$, this.$iframe_$, "https://fast.wistia.net") && ($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$ = $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$) && ($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$ = _.$objOrParseJson$$module$src$iframe_video$$($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$), 
  void 0 !== $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$))) {
    var $element$jscomp$706$$ = this.element;
    if ("_trigger" == $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.method) {
      var $playerEvent$$ = $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args ? $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args[0] : void 0;
      "statechange" === $playerEvent$$ ? _.$redispatch$$module$src$iframe_video$$($element$jscomp$706$$, $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args ? $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args[1] : void 0, {playing:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, paused:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, ended:[_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, _.$VideoEvents$$module$src$video_interface$$.$ENDED$]}) : "mutechange" == 
      $playerEvent$$ && $element$jscomp$706$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args ? $data$jscomp$222_event$jscomp$256_eventData$jscomp$24$$.args[1] : void 0));
    }
  }
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$(this, "amp-play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$(this, "amp-pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$(this, "amp-mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player_prototype$sendCommand_$$(this, "amp-unmute");
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
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
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !0;
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
  this.$user$().error("amp-wistia-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-wistia-player", $AmpWistiaPlayer$$module$extensions$amp_wistia_player$0_1$amp_wistia_player$$);

})});
