(self.AMP=self.AMP||[]).push({n:"amp-ooyala-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player$$ = function($$jscomp$super$this$jscomp$79_element$jscomp$510$$) {
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$79_element$jscomp$510$$) || this;
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$embedCode_$ = "";
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$pCode_$ = "";
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$playerId_$ = "";
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$79_element$jscomp$510$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$79_element$jscomp$510$$;
}, $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$self$$, $command$jscomp$7$$) {
  $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($command$jscomp$7$$, "*");
  });
};
_.$$jscomp$inherits$$($AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$24$$) {
  this.$preconnect$.url("https://player.ooyala.com", $opt_onLayout$jscomp$24$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $el$jscomp$75$$ = this.element;
  this.$embedCode_$ = $el$jscomp$75$$.getAttribute("data-embedcode");
  this.$pCode_$ = $el$jscomp$75$$.getAttribute("data-pcode");
  this.$playerId_$ = $el$jscomp$75$$.getAttribute("data-playerid");
  var $deferred$jscomp$53$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$53$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$53$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($el$jscomp$75$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($el$jscomp$75$$).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$782$$ = this, $el$jscomp$76$$ = this.element, $loaded$jscomp$3_src$jscomp$59$$ = "https://player.ooyala.com/iframe.html?platform=html5-priority";
  if ("v4" == ($el$jscomp$76$$.getAttribute("data-playerversion") || "").toLowerCase()) {
    $loaded$jscomp$3_src$jscomp$59$$ = "https://player.ooyala.com/static/v4/sandbox/amp_iframe/skin-plugin/amp_iframe.html?pcode=" + (0,window.encodeURIComponent)(this.$pCode_$);
    var $configUrl$jscomp$1$$ = $el$jscomp$76$$.getAttribute("data-config");
    $configUrl$jscomp$1$$ && ($loaded$jscomp$3_src$jscomp$59$$ += "&options[skin.config]=" + (0,window.encodeURIComponent)($configUrl$jscomp$1$$));
  }
  $loaded$jscomp$3_src$jscomp$59$$ += "&ec=" + (0,window.encodeURIComponent)(this.$embedCode_$) + "&pbid=" + (0,window.encodeURIComponent)(this.$playerId_$);
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, $loaded$jscomp$3_src$jscomp$59$$);
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", function($el$jscomp$76$$) {
    $el$jscomp$76$$.source == $$jscomp$this$jscomp$782$$.$iframe_$.contentWindow && ($el$jscomp$76$$ = _.$objOrParseJson$$module$src$iframe_video$$($el$jscomp$76$$.data), void 0 !== $el$jscomp$76$$ && _.$redispatch$$module$src$iframe_video$$($$jscomp$this$jscomp$782$$.element, $el$jscomp$76$$.data, {playing:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, paused:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, muted:_.$VideoEvents$$module$src$video_interface$$.$MUTED$, unmuted:_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$}));
  });
  $loaded$jscomp$3_src$jscomp$59$$ = this.$loadPromise$(this.$iframe_$).then(function() {
    $el$jscomp$76$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
  this.$playerReadyResolver_$($loaded$jscomp$3_src$jscomp$59$$);
  return $loaded$jscomp$3_src$jscomp$59$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$54$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$54$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$54$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$82$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$82$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$13$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$13$$});
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player_prototype$sendCommand_$$(this, "unmute");
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
  this.$user$().error("amp-ooyala-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-ooyala-player", $AmpOoyalaPlayer$$module$extensions$amp_ooyala_player$0_1$amp_ooyala_player$$);

})});
