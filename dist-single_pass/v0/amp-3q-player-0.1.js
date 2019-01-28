(self.AMP=self.AMP||[]).push({n:"amp-3q-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $Amp3QPlayer$$module$extensions$amp_3q_player$0_1$amp_3q_player$$ = function($$jscomp$super$this$jscomp$4_element$jscomp$271$$) {
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$4_element$jscomp$271$$) || this;
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$4_element$jscomp$271$$.$dataId$ = null;
  return $$jscomp$super$this$jscomp$4_element$jscomp$271$$;
}, $JSCompiler_StaticMethods_sdnPostMessage_$$ = function($JSCompiler_StaticMethods_sdnPostMessage_$self$$, $message$jscomp$49$$) {
  $JSCompiler_StaticMethods_sdnPostMessage_$self$$.$playerReadyPromise_$.then(function() {
    $JSCompiler_StaticMethods_sdnPostMessage_$self$$.$iframe_$ && $JSCompiler_StaticMethods_sdnPostMessage_$self$$.$iframe_$.contentWindow && $JSCompiler_StaticMethods_sdnPostMessage_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$49$$, "*");
  });
};
_.$$jscomp$inherits$$($Amp3QPlayer$$module$extensions$amp_3q_player$0_1$amp_3q_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $Amp3QPlayer$$module$extensions$amp_3q_player$0_1$amp_3q_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$2$$) {
  this.$preconnect$.url("https://playout.3qsdn.com", $opt_onLayout$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $el$jscomp$29$$ = this.element;
  this.$dataId$ = $el$jscomp$29$$.getAttribute("data-id");
  var $deferred$jscomp$25$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$25$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$25$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($el$jscomp$29$$);
  _.$Services$$module$src$services$videoManagerForDoc$$($el$jscomp$29$$).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$245$$ = this;
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, "https://playout.3qsdn.com/" + (0,window.encodeURIComponent)(this.$dataId$) + "?autoplay=false&amp=true");
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$sdnBridge_$.bind(this));
  return this.$loadPromise$(this.$iframe_$).then(function() {
    return $$jscomp$this$jscomp$245$$.$playerReadyPromise_$;
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$26$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$26$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$26$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$26$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$26$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$5$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$5$$});
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$sdnBridge_$ = function($data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$) {
  $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$.source && $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$.source != this.$iframe_$.contentWindow || ($data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$ = _.$objOrParseJson$$module$src$iframe_video$$($data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$.data), void 0 !== $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$ && ($data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$ = $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$.data, 
  "ready" == $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$ && this.$playerReadyResolver_$(), _.$redispatch$$module$src$iframe_video$$(this.element, $data$jscomp$86_event$jscomp$53_eventType$jscomp$27$$, {ready:_.$VideoEvents$$module$src$video_interface$$.$LOAD$, playing:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, paused:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, muted:_.$VideoEvents$$module$src$video_interface$$.$MUTED$, unmuted:_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$})));
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "play2");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "unmute");
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "showControlbar");
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_sdnPostMessage_$$(this, "hideControlbar");
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
  this.$user$().error("amp-3q-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-3q-player", $Amp3QPlayer$$module$extensions$amp_3q_player$0_1$amp_3q_player$$);

})});
