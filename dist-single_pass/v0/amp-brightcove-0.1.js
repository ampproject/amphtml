(self.AMP=self.AMP||[]).push({n:"amp-brightcove",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove$$ = function($$jscomp$super$this$jscomp$26_element$jscomp$368$$) {
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$26_element$jscomp$368$$) || this;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$playing_$ = !1;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$currentTime_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$duration_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$playedRanges_$ = [];
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$hasAmpSupport_$ = !1;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$readyTimeout_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$playerId_$ = null;
  $$jscomp$super$this$jscomp$26_element$jscomp$368$$.$urlReplacements_$ = null;
  return $$jscomp$super$this$jscomp$26_element$jscomp$368$$;
}, $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$self$$, $command$jscomp$1$$, $arg$jscomp$12$$) {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({command:$command$jscomp$1$$, 
    args:$arg$jscomp$12$$})), "https://players.brightcove.net");
  });
}, $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$$ = function($JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$self$$) {
  var $el$jscomp$47$$ = $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$self$$.element, $account_src$jscomp$27$$ = $el$jscomp$47$$.getAttribute("data-account"), $customReferrer_embed$jscomp$6$$ = $el$jscomp$47$$.getAttribute("data-embed") || "default";
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$self$$.$playerId_$ = $el$jscomp$47$$.getAttribute("data-player") || $el$jscomp$47$$.getAttribute("data-player-id") || "default";
  $account_src$jscomp$27$$ = "https://players.brightcove.net/" + (0,window.encodeURIComponent)($account_src$jscomp$27$$) + ("/" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$self$$.$playerId_$)) + ("_" + (0,window.encodeURIComponent)($customReferrer_embed$jscomp$6$$) + "/index.html") + ($el$jscomp$47$$.getAttribute("data-playlist-id") ? "?playlistId=" + $JSCompiler_StaticMethods_encodeId_$$($el$jscomp$47$$.getAttribute("data-playlist-id")) : 
  $el$jscomp$47$$.getAttribute("data-video-id") ? "?videoId=" + $JSCompiler_StaticMethods_encodeId_$$($el$jscomp$47$$.getAttribute("data-video-id")) : "");
  ($customReferrer_embed$jscomp$6$$ = $el$jscomp$47$$.getAttribute("data-referrer")) && $el$jscomp$47$$.setAttribute("data-param-referrer", _.$JSCompiler_StaticMethods_expandUrlSync$$($JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$self$$.$urlReplacements_$, $customReferrer_embed$jscomp$6$$));
  $el$jscomp$47$$.setAttribute("data-param-playsinline", "true");
  return _.$addParamsToUrl$$module$src$url$$($account_src$jscomp$27$$, _.$getDataParamsFromAttributes$$module$src$dom$$($el$jscomp$47$$));
}, $JSCompiler_StaticMethods_encodeId_$$ = function($id$jscomp$65$$) {
  return "ref:" === $id$jscomp$65$$.substring(0, 4) ? "ref:" + (0,window.encodeURIComponent)($id$jscomp$65$$.substring(4)) : (0,window.encodeURIComponent)($id$jscomp$65$$);
};
_.$$jscomp$inherits$$($AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$preconnect$.url("https://players.brightcove.net");
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$41$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$41$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$7$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$7$$});
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$494$$ = this;
  this.$urlReplacements_$ = _.$Services$$module$src$services$urlReplacementsForDoc$$(this.element);
  var $deferred$jscomp$38$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$38$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$38$$.resolve;
  this.$readyTimeout_$ = _.$Services$$module$src$services$timerFor$$(window).delay(function() {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-brightcove", "Did not receive ready callback from player %s. Ensure it has the videojs-amp-support plugin.", $$jscomp$this$jscomp$494$$.$playerId_$);
  }, 3000);
  this.$playerReadyResolver_$(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$495$$ = this, $iframe$jscomp$42$$ = _.$createFrameFor$$module$src$iframe_video$$(this, $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$$(this));
  this.$iframe_$ = $iframe$jscomp$42$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", function($iframe$jscomp$42$$) {
    var $data$jscomp$inline_2946_e$jscomp$200_eventData$jscomp$inline_2945_muted$jscomp$inline_2948$$ = $$jscomp$this$jscomp$495$$.element;
    if ($iframe$jscomp$42$$.source == $$jscomp$this$jscomp$495$$.$iframe_$.contentWindow && ($iframe$jscomp$42$$ = $iframe$jscomp$42$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($iframe$jscomp$42$$) && ($iframe$jscomp$42$$ = _.$objOrParseJson$$module$src$iframe_video$$($iframe$jscomp$42$$), void 0 !== $iframe$jscomp$42$$))) {
      var $eventType$jscomp$inline_2947$$ = $iframe$jscomp$42$$.event;
      $eventType$jscomp$inline_2947$$ && ("ready" === $eventType$jscomp$inline_2947$$ && $$jscomp$this$jscomp$495$$.$onReady_$($iframe$jscomp$42$$), "playing" === $eventType$jscomp$inline_2947$$ && ($$jscomp$this$jscomp$495$$.$playing_$ = !0), "pause" === $eventType$jscomp$inline_2947$$ && ($$jscomp$this$jscomp$495$$.$playing_$ = !1), $iframe$jscomp$42$$.ct && ($$jscomp$this$jscomp$495$$.$currentTime_$ = $iframe$jscomp$42$$.ct), $iframe$jscomp$42$$.pr && ($$jscomp$this$jscomp$495$$.$playedRanges_$ = 
      $iframe$jscomp$42$$.pr), $iframe$jscomp$42$$.dur && ($$jscomp$this$jscomp$495$$.$duration_$ = $iframe$jscomp$42$$.dur), _.$redispatch$$module$src$iframe_video$$($data$jscomp$inline_2946_e$jscomp$200_eventData$jscomp$inline_2945_muted$jscomp$inline_2948$$, $eventType$jscomp$inline_2947$$, {ready:_.$VideoEvents$$module$src$video_interface$$.$LOAD$, playing:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, pause:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, ended:_.$VideoEvents$$module$src$video_interface$$.$ENDED$, 
      "ads-ad-started":_.$VideoEvents$$module$src$video_interface$$.$AD_START$, "ads-ad-ended":_.$VideoEvents$$module$src$video_interface$$.$AD_END$}) || "volumechange" !== $eventType$jscomp$inline_2947$$ || ($iframe$jscomp$42$$ = $iframe$jscomp$42$$.muted, null != $iframe$jscomp$42$$ && $$jscomp$this$jscomp$495$$.$muted_$ != $iframe$jscomp$42$$ && ($$jscomp$this$jscomp$495$$.$muted_$ = $iframe$jscomp$42$$, $data$jscomp$inline_2946_e$jscomp$200_eventData$jscomp$inline_2945_muted$jscomp$inline_2948$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($$jscomp$this$jscomp$495$$.$muted_$)))));
    }
  });
  return this.$loadPromise$($iframe$jscomp$42$$).then(function() {
    return $$jscomp$this$jscomp$495$$.$playerReadyPromise_$;
  });
};
_.$JSCompiler_prototypeAlias$$.$onReady_$ = function($data$jscomp$114$$) {
  this.$hasAmpSupport_$ = !0;
  _.$Services$$module$src$services$timerFor$$(this.$win$).cancel(this.$readyTimeout_$);
  var $element$jscomp$370$$ = this.element;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$370$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$370$$).register(this);
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-brightcove", "Player %s ready. Brightcove Player version: %s AMP Support version: %s", this.$playerId_$, $data$jscomp$114$$.bcVersion, $data$jscomp$114$$.ampSupportVersion);
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$5$$) {
  var $playerId$$ = $mutations$jscomp$5$$["data-player"] || $mutations$jscomp$5$$["data-player-id"], $embed$jscomp$7$$ = $mutations$jscomp$5$$["data-embed"], $playlistId$$ = $mutations$jscomp$5$$["data-playlist-id"], $videoId$$ = $mutations$jscomp$5$$["data-video-id"];
  void 0 === $mutations$jscomp$5$$["data-account"] && void 0 === $playerId$$ && void 0 === $playlistId$$ && void 0 === $embed$jscomp$7$$ && void 0 === $videoId$$ || !this.$iframe_$ || (this.$iframe_$.src = $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$getIframeSrc_$$(this));
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$hasAmpSupport_$ && this.$playing_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return this.$hasAmpSupport_$ ? !1 : !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$39$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$39$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$39$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "muted", !0);
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "muted", !1);
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "controls", !0);
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove_prototype$sendCommand_$$(this, "controls", !1);
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
  return this.$currentTime_$;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$duration_$;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return this.$playedRanges_$;
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-brightcove", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-brightcove", $AmpBrightcove$$module$extensions$amp_brightcove$0_1$amp_brightcove$$);

})});
