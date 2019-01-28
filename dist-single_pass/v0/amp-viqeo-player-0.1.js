(self.AMP=self.AMP||[]).push({n:"amp-viqeo-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player$$ = function($$jscomp$super$this$jscomp$116_element$jscomp$699$$) {
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$116_element$jscomp$699$$) || this;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$volume_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$viqeoPlayer_$ = null;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$hasAutoplay_$ = !1;
  $$jscomp$super$this$jscomp$116_element$jscomp$699$$.$videoId_$ = "";
  return $$jscomp$super$this$jscomp$116_element$jscomp$699$$;
}, $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$self_contentWindow$jscomp$2$$, $command$jscomp$9$$) {
  $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$self_contentWindow$jscomp$2$$.$iframe_$ && ($JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$self_contentWindow$jscomp$2$$ = $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$self_contentWindow$jscomp$2$$.$iframe_$.contentWindow) && ("string" === 
  typeof $command$jscomp$9$$ && ($command$jscomp$9$$ = {action:$command$jscomp$9$$}), $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$self_contentWindow$jscomp$2$$.postMessage($command$jscomp$9$$, "*"));
};
_.$$jscomp$inherits$$($AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$30$$) {
  this.$preconnect$.url("https://api.viqeo.tv", $opt_onLayout$jscomp$30$$);
  this.$preconnect$.url("https://cdn.viqeo.tv", $opt_onLayout$jscomp$30$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$111$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$111$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$videoId_$ = this.element.getAttribute("data-videoid");
  this.$hasAutoplay_$ = this.element.hasAttribute("autoplay");
  var $deferred$jscomp$67$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$67$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$67$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1330$$ = this, $iframe$jscomp$98$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "viqeoplayer", {autoplay:this.$hasAutoplay_$}, {$allowFullscreen$:!0});
  $iframe$jscomp$98$$.setAttribute("allow", "autoplay");
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleViqeoMessages_$.bind(this));
  return this.$mutateElement$(function() {
    $$jscomp$this$jscomp$1330$$.element.appendChild($iframe$jscomp$98$$);
    $$jscomp$this$jscomp$1330$$.$iframe_$ = $iframe$jscomp$98$$;
    _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$98$$);
  }).then(function() {
    return $$jscomp$this$jscomp$1330$$.$playerReadyPromise_$;
  });
};
_.$JSCompiler_prototypeAlias$$.$handleViqeoMessages_$ = function($action$jscomp$42_event$jscomp$254$$) {
  var $eventData$jscomp$22$$ = $action$jscomp$42_event$jscomp$254$$.data;
  $eventData$jscomp$22$$ && $action$jscomp$42_event$jscomp$254$$.source === (this.$iframe_$ && this.$iframe_$.contentWindow) && "ViqeoPlayer" === $eventData$jscomp$22$$.source && ($action$jscomp$42_event$jscomp$254$$ = $eventData$jscomp$22$$.action, "ready" === $action$jscomp$42_event$jscomp$254$$ ? (this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$), this.$playerReadyResolver_$(this.$iframe_$)) : "play" === $action$jscomp$42_event$jscomp$254$$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$PLAYING$) : 
  "pause" === $action$jscomp$42_event$jscomp$254$$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$PAUSE$) : "mute" === $action$jscomp$42_event$jscomp$254$$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$MUTED$) : "unmute" === $action$jscomp$42_event$jscomp$254$$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$) : "volume" === $action$jscomp$42_event$jscomp$254$$ && (this.$volume_$ = (0,window.parseFloat)($eventData$jscomp$22$$.value), 0 === 
  this.$volume_$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$MUTED$) : this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$)));
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$68$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$68$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$68$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$22$$ = this.element.ownerDocument.createElement("amp-img");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["aria-label"], $placeholder$jscomp$22$$);
  $placeholder$jscomp$22$$.hasAttribute("aria-label") ? $placeholder$jscomp$22$$.setAttribute("alt", "Loading video - " + $placeholder$jscomp$22$$.getAttribute("aria-label")) : $placeholder$jscomp$22$$.setAttribute("alt", "Loading video");
  $placeholder$jscomp$22$$.setAttribute("src", "http://cdn.viqeo.tv/preview/" + (0,window.encodeURIComponent)(this.$videoId_$) + ".jpg");
  $placeholder$jscomp$22$$.setAttribute("layout", "fill");
  $placeholder$jscomp$22$$.setAttribute("placeholder", "");
  $placeholder$jscomp$22$$.setAttribute("referrerpolicy", "origin");
  _.$JSCompiler_StaticMethods_applyFillContent$$($placeholder$jscomp$22$$);
  return $placeholder$jscomp$22$$;
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player_prototype$sendCommand_$$(this, "unmute");
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
  return this.$viqeoPlayer_$ ? this.$viqeoPlayer_$.$getCurrentTime$() : 0;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$viqeoPlayer_$ ? this.$viqeoPlayer_$.$getDuration$() : 1;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-viqeo-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-viqeo-player", $AmpViqeoPlayer$$module$extensions$amp_viqeo_player$0_1$amp_viqeo_player$$);

})});
