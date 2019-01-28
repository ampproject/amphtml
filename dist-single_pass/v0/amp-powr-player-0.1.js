(self.AMP=self.AMP||[]).push({n:"amp-powr-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player$$ = function($$jscomp$super$this$jscomp$84_element$jscomp$520$$) {
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$84_element$jscomp$520$$) || this;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$playing_$ = !1;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$frameHasAmpSupport_$ = !1;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$playerId_$ = null;
  $$jscomp$super$this$jscomp$84_element$jscomp$520$$.$urlReplacements_$ = null;
  return $$jscomp$super$this$jscomp$84_element$jscomp$520$$;
}, $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$self$$, $command$jscomp$8$$, $arg$jscomp$13$$) {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({command:$command$jscomp$8$$, 
    args:$arg$jscomp$13$$})), "https://player.powr.com");
  });
}, $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$$ = function($JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$self$$) {
  var $el$jscomp$80$$ = $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$self$$.element, $account$jscomp$2_srcParams$$ = $el$jscomp$80$$.getAttribute("data-account");
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$self$$.$playerId_$ = $el$jscomp$80$$.getAttribute("data-player");
  var $src$jscomp$62_video$jscomp$34$$ = $el$jscomp$80$$.getAttribute("data-video"), $customReferrer$jscomp$1_terms$jscomp$1$$ = $el$jscomp$80$$.getAttribute("data-terms");
  $account$jscomp$2_srcParams$$ = _.$dict$$module$src$utils$object$$({account:$account$jscomp$2_srcParams$$, player:$JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$self$$.$playerId_$});
  $src$jscomp$62_video$jscomp$34$$ && ($account$jscomp$2_srcParams$$.video = $src$jscomp$62_video$jscomp$34$$);
  $customReferrer$jscomp$1_terms$jscomp$1$$ && ($account$jscomp$2_srcParams$$.terms = $customReferrer$jscomp$1_terms$jscomp$1$$);
  $src$jscomp$62_video$jscomp$34$$ = _.$addParamsToUrl$$module$src$url$$("https://player.powr.com/iframe.html", $account$jscomp$2_srcParams$$);
  ($customReferrer$jscomp$1_terms$jscomp$1$$ = $el$jscomp$80$$.getAttribute("data-referrer")) && $el$jscomp$80$$.setAttribute("data-param-referrer", _.$JSCompiler_StaticMethods_expandUrlSync$$($JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$self$$.$urlReplacements_$, $customReferrer$jscomp$1_terms$jscomp$1$$));
  $el$jscomp$80$$.setAttribute("data-param-playsinline", "true");
  return _.$addParamsToUrl$$module$src$url$$($src$jscomp$62_video$jscomp$34$$, _.$getDataParamsFromAttributes$$module$src$dom$$($el$jscomp$80$$));
}, $PLAYER_EVENT_MAP$$module$extensions$amp_powr_player$0_1$amp_powr_player$$ = {ready:_.$VideoEvents$$module$src$video_interface$$.$LOAD$, playing:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, pause:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, ended:_.$VideoEvents$$module$src$video_interface$$.$ENDED$, "ads-ad-started":_.$VideoEvents$$module$src$video_interface$$.$AD_START$, "ads-ad-ended":_.$VideoEvents$$module$src$video_interface$$.$AD_END$};
_.$$jscomp$inherits$$($AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$preconnect$.url("https://player.powr.com");
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$86$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$86$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$14$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$14$$});
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$urlReplacements_$ = _.$Services$$module$src$services$urlReplacementsForDoc$$(this.element);
  var $deferred$jscomp$55$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$55$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$55$$.resolve;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$804$$ = this, $iframe$jscomp$75$$ = _.$createFrameFor$$module$src$iframe_video$$(this, $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$$(this));
  this.$iframe_$ = $iframe$jscomp$75$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", function($iframe$jscomp$75$$) {
    var $data$jscomp$inline_3883_e$jscomp$284_eventData$jscomp$inline_3882_muted$jscomp$inline_3885$$ = $$jscomp$this$jscomp$804$$.element;
    if ($iframe$jscomp$75$$.source == $$jscomp$this$jscomp$804$$.$iframe_$.contentWindow && ($iframe$jscomp$75$$ = $iframe$jscomp$75$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($iframe$jscomp$75$$) && ($iframe$jscomp$75$$ = _.$objOrParseJson$$module$src$iframe_video$$($iframe$jscomp$75$$), void 0 !== $iframe$jscomp$75$$))) {
      var $eventType$jscomp$inline_3884$$ = $iframe$jscomp$75$$.event;
      $eventType$jscomp$inline_3884$$ && ("ready" === $eventType$jscomp$inline_3884$$ && $$jscomp$this$jscomp$804$$.$onReady_$($iframe$jscomp$75$$), "playing" === $eventType$jscomp$inline_3884$$ && ($$jscomp$this$jscomp$804$$.$playing_$ = !0), "pause" === $eventType$jscomp$inline_3884$$ && ($$jscomp$this$jscomp$804$$.$playing_$ = !1), _.$redispatch$$module$src$iframe_video$$($data$jscomp$inline_3883_e$jscomp$284_eventData$jscomp$inline_3882_muted$jscomp$inline_3885$$, $eventType$jscomp$inline_3884$$, 
      $PLAYER_EVENT_MAP$$module$extensions$amp_powr_player$0_1$amp_powr_player$$) || "volumechange" !== $eventType$jscomp$inline_3884$$ || ($iframe$jscomp$75$$ = $iframe$jscomp$75$$.muted, null != $iframe$jscomp$75$$ && $$jscomp$this$jscomp$804$$.$muted_$ != $iframe$jscomp$75$$ && ($$jscomp$this$jscomp$804$$.$muted_$ = $iframe$jscomp$75$$, $data$jscomp$inline_3883_e$jscomp$284_eventData$jscomp$inline_3882_muted$jscomp$inline_3885$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($$jscomp$this$jscomp$804$$.$muted_$)))));
    }
  });
  return this.$loadPromise$($iframe$jscomp$75$$).then(function() {
    return $$jscomp$this$jscomp$804$$.$playerReadyPromise_$;
  });
};
_.$JSCompiler_prototypeAlias$$.$onReady_$ = function($data$jscomp$160$$) {
  this.$frameHasAmpSupport_$ = !0;
  var $element$jscomp$522$$ = this.element;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$522$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$522$$).register(this);
  this.$playerReadyResolver_$(this.$iframe_$);
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-powr-player", "Player %s ready. Powr Player version: %s IFrame Support version: %s", this.$playerId_$, $data$jscomp$160$$.powrVersion, $data$jscomp$160$$.iframeVersion);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$14$$) {
  var $playerId$jscomp$1$$ = $mutations$jscomp$14$$["data-player"] || $mutations$jscomp$14$$["data-player-id"], $video$jscomp$35$$ = $mutations$jscomp$14$$["data-video"];
  void 0 === $mutations$jscomp$14$$["data-account"] && void 0 === $playerId$jscomp$1$$ && void 0 === $video$jscomp$35$$ || !this.$iframe_$ || (this.$iframe_$.src = $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$getIframeSrc_$$(this));
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$frameHasAmpSupport_$ && this.$playing_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return this.$frameHasAmpSupport_$ ? !1 : !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$56$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$56$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$56$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "muted", !0);
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "muted", !1);
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "controls", !0);
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player_prototype$sendCommand_$$(this, "controls", !1);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  this.$iframe_$ && _.$fullscreenEnter$$module$src$dom$$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  this.$iframe_$ && _.$fullscreenExit$$module$src$dom$$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
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
  this.$user$().error("amp-powr-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-powr-player", $AmpPowrPlayer$$module$extensions$amp_powr_player$0_1$amp_powr_player$$);

})});
