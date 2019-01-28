(self.AMP=self.AMP||[]).push({n:"amp-nexxtv-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player$$ = function($element$jscomp$508$$) {
  var $$jscomp$super$this$jscomp$77$$ = window.AMP.BaseElement.call(this, $element$jscomp$508$$) || this;
  $$jscomp$super$this$jscomp$77$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$77$$.$getVideoIframeSrc_$ = _.$once$$module$src$utils$function$$(function() {
    var $element$jscomp$508$$ = $$jscomp$super$this$jscomp$77$$.element, $mediaId$jscomp$inline_3758$$ = $element$jscomp$508$$.getAttribute("data-mediaid"), $client$jscomp$inline_3759_src$jscomp$inline_3766$$ = $element$jscomp$508$$.getAttribute("data-client"), $delay$jscomp$inline_3760$$ = $element$jscomp$508$$.getAttribute("data-seek-to") || "0", $mode$jscomp$inline_3761$$ = $element$jscomp$508$$.getAttribute("data-mode") || "static", $streamtype$jscomp$inline_3762$$ = $element$jscomp$508$$.getAttribute("data-streamtype") || 
    "video", $origin$jscomp$inline_3763$$ = $element$jscomp$508$$.getAttribute("data-origin") || "https://embed.nexx.cloud/", $disableAds$jscomp$inline_3764$$ = $element$jscomp$508$$.getAttribute("data-disable-ads");
    $element$jscomp$508$$ = $element$jscomp$508$$.getAttribute("data-streaming-filter");
    $client$jscomp$inline_3759_src$jscomp$inline_3766$$ = $origin$jscomp$inline_3763$$ + ((0,window.encodeURIComponent)($client$jscomp$inline_3759_src$jscomp$inline_3766$$) + "/");
    $client$jscomp$inline_3759_src$jscomp$inline_3766$$ += (0,window.encodeURIComponent)($streamtype$jscomp$inline_3762$$) + "/";
    $client$jscomp$inline_3759_src$jscomp$inline_3766$$ += (0,window.encodeURIComponent)($mediaId$jscomp$inline_3758$$);
    $client$jscomp$inline_3759_src$jscomp$inline_3766$$ += "?dataMode=" + (0,window.encodeURIComponent)($mode$jscomp$inline_3761$$) + "&platform=amp";
    0 < $delay$jscomp$inline_3760$$ && ($client$jscomp$inline_3759_src$jscomp$inline_3766$$ += "&delay=" + (0,window.encodeURIComponent)($delay$jscomp$inline_3760$$));
    "1" === $disableAds$jscomp$inline_3764$$ && ($client$jscomp$inline_3759_src$jscomp$inline_3766$$ += "&disableAds=1");
    null !== $element$jscomp$508$$ && 0 < $element$jscomp$508$$.length && ($client$jscomp$inline_3759_src$jscomp$inline_3766$$ += "&streamingFilter=" + (0,window.encodeURIComponent)($element$jscomp$508$$));
    return _.$parseUrlDeprecated$$module$src$url$$($client$jscomp$inline_3759_src$jscomp$inline_3766$$).href;
  });
  $$jscomp$super$this$jscomp$77$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$77$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$77$$.$playerReadyResolver_$ = null;
  return $$jscomp$super$this$jscomp$77$$;
}, $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$self$$, $command$jscomp$6$$) {
  $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage(_.$dict$$module$src$utils$object$$({cmd:$command$jscomp$6$$}), 
    "*");
  });
};
_.$$jscomp$inherits$$($AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$23$$) {
  this.$preconnect$.url(this.$getVideoIframeSrc_$(), $opt_onLayout$jscomp$23$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$80$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$80$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $deferred$jscomp$51$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$51$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$51$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$12$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$12$$});
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$780$$ = this;
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, this.$getVideoIframeSrc_$());
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", function($loaded$jscomp$2$$) {
    var $data$jscomp$inline_3771_event$jscomp$157$$ = $loaded$jscomp$2$$.data;
    $data$jscomp$inline_3771_event$jscomp$157$$ && $loaded$jscomp$2$$.source === $$jscomp$this$jscomp$780$$.$iframe_$.contentWindow && ($loaded$jscomp$2$$ = _.$objOrParseJson$$module$src$iframe_video$$($data$jscomp$inline_3771_event$jscomp$157$$)) && _.$redispatch$$module$src$iframe_video$$($$jscomp$this$jscomp$780$$.element, $loaded$jscomp$2$$.event, {play:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, pause:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, mute:_.$VideoEvents$$module$src$video_interface$$.$MUTED$, 
    unmute:_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$});
  });
  this.element.appendChild(this.$iframe_$);
  var $loaded$jscomp$2$$ = this.$loadPromise$(this.$iframe_$).then(function() {
    $$jscomp$this$jscomp$780$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
  this.$playerReadyResolver_$($loaded$jscomp$2$$);
  return $loaded$jscomp$2$$;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$52$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$52$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$52$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player_prototype$sendCommand_$$(this, "unmute");
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
  this.$user$().error("amp-nexxtv-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-nexxtv-player", $AmpNexxtvPlayer$$module$extensions$amp_nexxtv_player$0_1$amp_nexxtv_player$$);

})});
