(self.AMP=self.AMP||[]).push({n:"amp-brid-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player$$ = function($$jscomp$super$this$jscomp$25_element$jscomp$364$$) {
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$25_element$jscomp$364$$) || this;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$partnerID_$ = "";
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$feedID_$ = "";
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$playerID_$ = "";
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$videoIframeSrc_$ = null;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$volume_$ = null;
  $$jscomp$super$this$jscomp$25_element$jscomp$364$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$25_element$jscomp$364$$;
}, $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$self$$, $command$$, $opt_arg$$) {
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage("Brid|" + $command$$ + (void 0 === $opt_arg$$ ? 
    "" : "|" + $opt_arg$$), "*");
  });
}, $_template$$module$extensions$amp_brid_player$0_1$amp_brid_player$$ = ["<amp-img referrerpolicy=origin layout=fill placeholder><amp-img referrerpolicy=origin layout=fill fallback src=https://cdn.brid.tv/live/default/defaultSnapshot.png></amp-img></amp-img>"];
_.$$jscomp$inherits$$($AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$9$$) {
  this.$preconnect$.url("https://services.brid.tv", $opt_onLayout$jscomp$9$$);
  this.$preconnect$.url("https://cdn.brid.tv", $opt_onLayout$jscomp$9$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$40$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$40$$);
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  if (this.$videoIframeSrc_$) {
    return this.$videoIframeSrc_$;
  }
  var $feedType_src$jscomp$26$$ = "", $itemsNum$$ = this.element.hasAttribute("data-dynamic") ? "10" : "1";
  this.element.hasAttribute("data-video") ? $feedType_src$jscomp$26$$ = "video" : this.element.hasAttribute("data-dynamic") ? $feedType_src$jscomp$26$$ = this.element.getAttribute("data-dynamic") : this.element.hasAttribute("data-playlist") ? $feedType_src$jscomp$26$$ = "playlist" : this.element.hasAttribute("data-outstream") && ($feedType_src$jscomp$26$$ = "outstream");
  $feedType_src$jscomp$26$$ = "https://services.brid.tv/services/iframe/" + (0,window.encodeURIComponent)($feedType_src$jscomp$26$$) + "/" + (0,window.encodeURIComponent)(this.$feedID_$) + "/" + (0,window.encodeURIComponent)(this.$partnerID_$) + "/" + (0,window.encodeURIComponent)(this.$playerID_$) + "/0/" + $itemsNum$$ + "/?amp=1";
  return this.$videoIframeSrc_$ = _.$parseUrlDeprecated$$module$src$url$$($feedType_src$jscomp$26$$).href;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $element$jscomp$365$$ = this.element;
  this.$partnerID_$ = $element$jscomp$365$$.getAttribute("data-partner");
  this.$playerID_$ = $element$jscomp$365$$.getAttribute("data-player");
  this.$feedID_$ = $element$jscomp$365$$.getAttribute("data-video") || $element$jscomp$365$$.getAttribute("data-playlist") || $element$jscomp$365$$.getAttribute("data-outstream");
  var $deferred$jscomp$36$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$36$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$36$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$365$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$365$$).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$492$$ = this, $iframe$jscomp$41$$ = _.$createFrameFor$$module$src$iframe_video$$(this, this.$getVideoIframeSrc_$());
  this.$iframe_$ = $iframe$jscomp$41$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleBridMessage_$.bind(this));
  return this.$loadPromise$($iframe$jscomp$41$$).then(function() {
    return $$jscomp$this$jscomp$492$$.$playerReadyPromise_$;
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$37$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$37$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$37$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.pause();
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $element$jscomp$366_placeholder$jscomp$8$$ = this.element;
  if ($element$jscomp$366_placeholder$jscomp$8$$.hasAttribute("data-video") || $element$jscomp$366_placeholder$jscomp$8$$.hasAttribute("data-playlist")) {
    var $altText_partnerID$$ = this.$partnerID_$, $feedID$$ = this.$feedID_$;
    $element$jscomp$366_placeholder$jscomp$8$$ = _.$htmlFor$$module$src$static_template$$($element$jscomp$366_placeholder$jscomp$8$$)($_template$$module$extensions$amp_brid_player$0_1$amp_brid_player$$);
    _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["aria-label"], $element$jscomp$366_placeholder$jscomp$8$$);
    _.$JSCompiler_StaticMethods_applyFillContent$$($element$jscomp$366_placeholder$jscomp$8$$);
    $element$jscomp$366_placeholder$jscomp$8$$.setAttribute("src", "https://cdn.brid.tv/live/partners/" + (0,window.encodeURIComponent)($altText_partnerID$$) + ("/snapshot/" + (0,window.encodeURIComponent)($feedID$$) + ".jpg"));
    $altText_partnerID$$ = $element$jscomp$366_placeholder$jscomp$8$$.hasAttribute("aria-label") ? "Loading video - " + $element$jscomp$366_placeholder$jscomp$8$$.getAttribute("aria-label") : "Loading video";
    $element$jscomp$366_placeholder$jscomp$8$$.setAttribute("alt", $altText_partnerID$$);
    return $element$jscomp$366_placeholder$jscomp$8$$;
  }
};
_.$JSCompiler_prototypeAlias$$.$handleBridMessage_$ = function($element$jscomp$367_event$jscomp$94$$) {
  if (_.$originMatches$$module$src$iframe_video$$($element$jscomp$367_event$jscomp$94$$, this.$iframe_$, "https://services.brid.tv")) {
    var $eventData$jscomp$3_params$jscomp$30$$ = $element$jscomp$367_event$jscomp$94$$.data;
    "string" === typeof $eventData$jscomp$3_params$jscomp$30$$ && 0 === $eventData$jscomp$3_params$jscomp$30$$.indexOf("Brid") && ($element$jscomp$367_event$jscomp$94$$ = this.element, $eventData$jscomp$3_params$jscomp$30$$ = $eventData$jscomp$3_params$jscomp$30$$.split("|"), "trigger" == $eventData$jscomp$3_params$jscomp$30$$[2] ? ("ready" == $eventData$jscomp$3_params$jscomp$30$$[3] && this.$playerReadyResolver_$(this.$iframe_$), _.$redispatch$$module$src$iframe_video$$($element$jscomp$367_event$jscomp$94$$, 
    $eventData$jscomp$3_params$jscomp$30$$[3], {ready:_.$VideoEvents$$module$src$video_interface$$.$LOAD$, play:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, pause:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$})) : "volume" == $eventData$jscomp$3_params$jscomp$30$$[2] && (this.$volume_$ = (0,window.parseFloat)($eventData$jscomp$3_params$jscomp$30$$[3]), $element$jscomp$367_event$jscomp$94$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$(0 >= this.$volume_$))));
  }
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "muted", 1);
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "volume", 0);
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "muted", 0);
  $JSCompiler_StaticMethods_AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player_prototype$sendCommand_$$(this, "volume", 1);
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
  this.$user$().error("amp-brid-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-brid-player", $AmpBridPlayer$$module$extensions$amp_brid_player$0_1$amp_brid_player$$);

})});
