(self.AMP=self.AMP||[]).push({n:"amp-vimeo",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo$$ = function($element$jscomp$694$$) {
  var $$jscomp$super$this$jscomp$114$$ = window.AMP.BaseElement.call(this, $element$jscomp$694$$) || this;
  $$jscomp$super$this$jscomp$114$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$114$$.$setVolumeMethod_$ = _.$once$$module$src$utils$function$$(function() {
    var $element$jscomp$694$$ = "set";
    return ($element$jscomp$694$$ = void 0 === $element$jscomp$694$$ ? null : $element$jscomp$694$$) ? $element$jscomp$694$$.toLowerCase() + "Volume" : "volume";
  });
  $$jscomp$super$this$jscomp$114$$.$onReadyOnce_$ = _.$once$$module$src$utils$function$$(function() {
    return $$jscomp$super$this$jscomp$114$$.$onReady_$();
  });
  $$jscomp$super$this$jscomp$114$$.$muted_$ = !1;
  $$jscomp$super$this$jscomp$114$$.$boundOnMessage_$ = function($element$jscomp$694$$) {
    return $$jscomp$super$this$jscomp$114$$.$onMessage_$($element$jscomp$694$$);
  };
  $$jscomp$super$this$jscomp$114$$.$unlistenFrame_$ = null;
  return $$jscomp$super$this$jscomp$114$$;
}, $JSCompiler_StaticMethods_isAutoplay_$$ = function($JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$) {
  if (!$JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$.element.hasAttribute("autoplay")) {
    return window.Promise.resolve(!1);
  }
  $JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$ = $JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$.$win$;
  return _.$VideoUtils$$module$src$utils$video$isAutoplaySupported$$($JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$, _.$getMode$$module$src$mode$$($JSCompiler_StaticMethods_isAutoplay_$self_win$jscomp$495$$).$lite$);
}, $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$self_contentWindow$jscomp$1$$, $method$jscomp$35$$, $optParams$$) {
  $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$self_contentWindow$jscomp$1$$.$iframe_$ && ($JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$self_contentWindow$jscomp$1$$ = $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$self_contentWindow$jscomp$1$$.$iframe_$.contentWindow) && $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$self_contentWindow$jscomp$1$$.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({method:$method$jscomp$35$$, 
  value:(void 0 === $optParams$$ ? null : $optParams$$) || ""})), "*");
}, $VIMEO_EVENTS$$module$extensions$amp_vimeo$0_1$amp_vimeo$$ = {play:_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, pause:_.$VideoEvents$$module$src$video_interface$$.$PAUSE$, ended:_.$VideoEvents$$module$src$video_interface$$.$ENDED$, volumechange:null};
_.$$jscomp$inherits$$($AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$10$$) {
  $onLayout$jscomp$10$$ = void 0 === $onLayout$jscomp$10$$ ? !1 : $onLayout$jscomp$10$$;
  var $preconnect$jscomp$7$$ = this.$preconnect$;
  $preconnect$jscomp$7$$.url("https://player.vimeo.com", $onLayout$jscomp$10$$);
  $preconnect$jscomp$7$$.url("https://i.vimeocdn.com", $onLayout$jscomp$10$$);
  $preconnect$jscomp$7$$.url("https://f.vimeocdn.com", $onLayout$jscomp$10$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$109$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$109$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.$getAmpDoc$());
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1328$$ = this;
  return $JSCompiler_StaticMethods_isAutoplay_$$(this).then(function($iframe$jscomp$inline_5424_isAutoplay$jscomp$1$$) {
    var $src$jscomp$inline_5423_vidId$jscomp$inline_5422$$ = $$jscomp$this$jscomp$1328$$.element.getAttribute("data-videoid");
    $src$jscomp$inline_5423_vidId$jscomp$inline_5422$$ = "https://player.vimeo.com/video/" + (0,window.encodeURIComponent)($src$jscomp$inline_5423_vidId$jscomp$inline_5422$$);
    $iframe$jscomp$inline_5424_isAutoplay$jscomp$1$$ && ($$jscomp$this$jscomp$1328$$.$muted_$ = !0, $src$jscomp$inline_5423_vidId$jscomp$inline_5422$$ = _.$addParamToUrl$$module$src$url$$($src$jscomp$inline_5423_vidId$jscomp$inline_5422$$, "muted", "1"));
    $iframe$jscomp$inline_5424_isAutoplay$jscomp$1$$ = _.$createFrameFor$$module$src$iframe_video$$($$jscomp$this$jscomp$1328$$, $src$jscomp$inline_5423_vidId$jscomp$inline_5422$$);
    $$jscomp$this$jscomp$1328$$.$iframe_$ = $iframe$jscomp$inline_5424_isAutoplay$jscomp$1$$;
    $$jscomp$this$jscomp$1328$$.$unlistenFrame_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($$jscomp$this$jscomp$1328$$.$win$, "message", $$jscomp$this$jscomp$1328$$.$boundOnMessage_$, void 0);
    $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$($$jscomp$this$jscomp$1328$$, "ping");
    return $$jscomp$this$jscomp$1328$$.$loadPromise$($iframe$jscomp$inline_5424_isAutoplay$jscomp$1$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenFrame_$ && (this.$unlistenFrame_$(), this.$unlistenFrame_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$onReady_$ = function() {
  var $$jscomp$this$jscomp$1329$$ = this, $element$jscomp$696$$ = this.element;
  Object.keys($VIMEO_EVENTS$$module$extensions$amp_vimeo$0_1$amp_vimeo$$).forEach(function($element$jscomp$696$$) {
    $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$($$jscomp$this$jscomp$1329$$, "addEventListener", $element$jscomp$696$$);
  });
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$696$$).register(this);
  $element$jscomp$696$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
};
_.$JSCompiler_prototypeAlias$$.$onMessage_$ = function($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$) {
  if (_.$originMatches$$module$src$iframe_video$$($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$, this.$iframe_$, /^(https?:)?\/\/((player|www).)?vimeo.com(?=$|\/)/) && ($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$ = $element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$))) {
    var $data$jscomp$218_muted$jscomp$4_volume$$ = _.$objOrParseJson$$module$src$iframe_video$$($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$);
    if ("ready" == $data$jscomp$218_muted$jscomp$4_volume$$.event || "ping" == $data$jscomp$218_muted$jscomp$4_volume$$.method) {
      this.$onReadyOnce_$();
    } else {
      if ($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$ = this.element, !_.$redispatch$$module$src$iframe_video$$($element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$, $data$jscomp$218_muted$jscomp$4_volume$$.event, $VIMEO_EVENTS$$module$extensions$amp_vimeo$0_1$amp_vimeo$$) && "volumechange" == $data$jscomp$218_muted$jscomp$4_volume$$.event && ($data$jscomp$218_muted$jscomp$4_volume$$ = $data$jscomp$218_muted$jscomp$4_volume$$.data && $data$jscomp$218_muted$jscomp$4_volume$$.data.volume)) {
        $data$jscomp$218_muted$jscomp$4_volume$$ = 0 >= $data$jscomp$218_muted$jscomp$4_volume$$, $data$jscomp$218_muted$jscomp$4_volume$$ != this.$muted_$ && (this.$muted_$ = $data$jscomp$218_muted$jscomp$4_volume$$, $element$jscomp$697_event$jscomp$253_eventData$jscomp$21$$.$D$(_.$mutedOrUnmutedEvent$$module$src$iframe_video$$($data$jscomp$218_muted$jscomp$4_volume$$)));
      }
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.pause();
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  this.$muted_$ || $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$(this, this.$setVolumeMethod_$(), "0");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo_prototype$sendCommand_$$(this, this.$setVolumeMethod_$(), "1");
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-vimeo", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-vimeo", $AmpVimeo$$module$extensions$amp_vimeo$0_1$amp_vimeo$$);

})});
