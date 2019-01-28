(self.AMP=self.AMP||[]).push({n:"amp-mowplayer",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer$$ = function($$jscomp$super$this$jscomp$74_element$jscomp$498$$) {
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$74_element$jscomp$498$$) || this;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$mediaid_$ = "";
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$videoIframeSrc_$ = null;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$74_element$jscomp$498$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$74_element$jscomp$498$$;
}, $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$self$$, $command$jscomp$5$$, $opt_args$jscomp$14$$) {
  $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function() {
    if ($JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$self$$.$iframe_$.contentWindow) {
      var $message$jscomp$65$$ = JSON.stringify(_.$dict$$module$src$utils$object$$({event:"command", func:$command$jscomp$5$$, args:$opt_args$jscomp$14$$ || ""}));
      $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$self$$.$iframe_$.contentWindow.postMessage($message$jscomp$65$$, "https://cdn.mowplayer.com");
    }
  });
};
_.$$jscomp$inherits$$($AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$22$$) {
  var $preconnect$jscomp$5$$ = this.$preconnect$;
  $preconnect$jscomp$5$$.url(this.$getVideoIframeSrc_$());
  $preconnect$jscomp$5$$.url("https://cdn.mowplayer.com", $opt_onLayout$jscomp$22$$);
  $preconnect$jscomp$5$$.url("https://code.mowplayer.com", $opt_onLayout$jscomp$22$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$78$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$78$$);
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($visible$jscomp$11$$) {
  this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$VISIBILITY$, {visible:$visible$jscomp$11$$});
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$mediaid_$ = this.element.getAttribute("data-mediaid");
  var $deferred$jscomp$49$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$49$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$49$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  return this.$videoIframeSrc_$ ? this.$videoIframeSrc_$ : this.$videoIframeSrc_$ = _.$addParamsToUrl$$module$src$url$$("https://cdn.mowplayer.com/player.html", _.$dict$$module$src$utils$object$$({code:this.$mediaid_$}));
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$766$$ = this;
  this.$iframe_$ = _.$createFrameFor$$module$src$iframe_video$$(this, this.$getVideoIframeSrc_$());
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleMowMessage_$.bind(this));
  var $loaded$jscomp$1$$ = this.$loadPromise$(this.$iframe_$).then(function() {
    $$jscomp$this$jscomp$766$$.$iframe_$ && $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$($$jscomp$this$jscomp$766$$, "listening", ["amp", window.location.href, window.location.origin, !0]);
    $$jscomp$this$jscomp$766$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
  this.$playerReadyResolver_$($loaded$jscomp$1$$);
  return $loaded$jscomp$1$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$50$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$50$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$50$$.resolve;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($mutations$jscomp$13$$) {
  null != $mutations$jscomp$13$$["data-mediaid"] && this.$iframe_$ && $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$(this, "loadVideoById", [this.$mediaid_$]);
};
_.$JSCompiler_prototypeAlias$$.$handleMowMessage_$ = function($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$) {
  if (_.$originMatches$$module$src$iframe_video$$($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$, this.$iframe_$, "https://cdn.mowplayer.com") && ($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ = $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$))) {
    var $data$jscomp$146_element$jscomp$499$$ = _.$objOrParseJson$$module$src$iframe_video$$($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$);
    if (null != $data$jscomp$146_element$jscomp$499$$) {
      $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ = $data$jscomp$146_element$jscomp$499$$.event;
      var $info$jscomp$16$$ = $data$jscomp$146_element$jscomp$499$$.info || {};
      $data$jscomp$146_element$jscomp$499$$ = this.element;
      "set_aspect_ratio" === $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ && _.$JSCompiler_StaticMethods_attemptChangeHeight$$(this, $info$jscomp$16$$.new_height).catch(function() {
      });
      var $muted$jscomp$1_playerState$$ = $info$jscomp$16$$.playerState;
      "infoDelivery" == $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ && null != $muted$jscomp$1_playerState$$ ? ($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ = {}, _.$redispatch$$module$src$iframe_video$$($data$jscomp$146_element$jscomp$499$$, $muted$jscomp$1_playerState$$.toString(), ($$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$[1] = _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$[2] = 
      _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$[0] = [_.$VideoEvents$$module$src$video_interface$$.$ENDED$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$], $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$))) : ($muted$jscomp$1_playerState$$ = $info$jscomp$16$$.muted, "infoDelivery" == $$jscomp$compprop35_event$jscomp$156_eventData$jscomp$14_eventType$jscomp$58$$ && $info$jscomp$16$$ && 
      null != $muted$jscomp$1_playerState$$ && this.$muted_$ != $muted$jscomp$1_playerState$$ && (this.$muted_$ = $muted$jscomp$1_playerState$$, $data$jscomp$146_element$jscomp$499$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$(this.$muted_$))));
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
  $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$(this, "playVideo");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$(this, "pauseVideo");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer_prototype$sendCommand_$$(this, "unMute");
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
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-mowplayer", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-mowplayer", $AmpMowplayer$$module$extensions$amp_mowplayer$0_1$amp_mowplayer$$);

})});
