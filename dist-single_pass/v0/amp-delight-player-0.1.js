(self.AMP=self.AMP||[]).push({n:"amp-delight-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player$$ = function($$jscomp$super$this$jscomp$42_element$jscomp$391$$) {
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$42_element$jscomp$391$$) || this;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$baseURL_$ = "https://players.delight-vr.com";
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$contentID_$ = "";
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$totalDuration_$ = 1;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$currentTime_$ = 0;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$playedRanges_$ = [];
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$isFullscreen_$ = !1;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$playerReadyPromise_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$playerReadyResolver_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$unlistenScreenOrientationChange_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$unlistenOrientationChange_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$unlistenDeviceOrientation_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$unlistenDeviceMotion_$ = null;
  $$jscomp$super$this$jscomp$42_element$jscomp$391$$.$placeholderEl_$ = null;
  return $$jscomp$super$this$jscomp$42_element$jscomp$391$$;
}, $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$, $type$jscomp$180$$, $payload$jscomp$18$$) {
  $payload$jscomp$18$$ = void 0 === $payload$jscomp$18$$ ? {} : $payload$jscomp$18$$;
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$.$playerReadyPromise_$.then(function($JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$) {
    $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$ && $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$.contentWindow && $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$self$$.contentWindow.postMessage(JSON.stringify({type:$type$jscomp$180$$, $payload$:$payload$jscomp$18$$}), 
    "*");
  });
}, $JSCompiler_StaticMethods_registerEventHandlers_$$ = function($JSCompiler_StaticMethods_registerEventHandlers_$self$$) {
  function $dispatchOrientationChangeEvents$$() {
    $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$, "x-dl8-iframe-window-orientationchange", {orientation:window.orientation});
  }
  function $dispatchScreenOrientationChangeEvents$$() {
    var $dispatchOrientationChangeEvents$$ = window.screen.orientation || window.screen.$G$ || window.screen.$J$;
    $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$, "x-dl8-iframe-screen-change", {orientation:{angle:$dispatchOrientationChangeEvents$$.angle, type:$dispatchOrientationChangeEvents$$.type}});
  }
  if (window.screen) {
    var $screen$249$$ = window.screen.orientation || window.screen.$G$ || window.screen.$J$;
    $screen$249$$ && $screen$249$$.addEventListener ? $JSCompiler_StaticMethods_registerEventHandlers_$self$$.$unlistenScreenOrientationChange_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($screen$249$$, "change", $dispatchScreenOrientationChangeEvents$$, void 0) : $JSCompiler_StaticMethods_registerEventHandlers_$self$$.$unlistenOrientationChange_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$.$win$, 
    "orientationchange", $dispatchOrientationChangeEvents$$, void 0);
  } else {
    $JSCompiler_StaticMethods_registerEventHandlers_$self$$.$unlistenOrientationChange_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$.$win$, "orientationchange", $dispatchOrientationChangeEvents$$, void 0);
  }
  $JSCompiler_StaticMethods_registerEventHandlers_$self$$.$unlistenDeviceOrientation_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$.$win$, "deviceorientation", function($dispatchOrientationChangeEvents$$) {
    $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$, "x-dl8-iframe-window-deviceorientation", {alpha:$dispatchOrientationChangeEvents$$.alpha, beta:$dispatchOrientationChangeEvents$$.beta, gamma:$dispatchOrientationChangeEvents$$.gamma, absolute:$dispatchOrientationChangeEvents$$.absolute, timeStamp:$dispatchOrientationChangeEvents$$.timeStamp});
  });
  $JSCompiler_StaticMethods_registerEventHandlers_$self$$.$unlistenDeviceMotion_$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$.$win$, "devicemotion", function($dispatchOrientationChangeEvents$$) {
    $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$($JSCompiler_StaticMethods_registerEventHandlers_$self$$, "x-dl8-iframe-window-devicemotion", {acceleration:{x:$dispatchOrientationChangeEvents$$.acceleration.x, y:$dispatchOrientationChangeEvents$$.acceleration.y, z:$dispatchOrientationChangeEvents$$.acceleration.z}, accelerationIncludingGravity:{x:$dispatchOrientationChangeEvents$$.accelerationIncludingGravity.x, y:$dispatchOrientationChangeEvents$$.accelerationIncludingGravity.y, 
    z:$dispatchOrientationChangeEvents$$.accelerationIncludingGravity.z}, rotationRate:{alpha:$dispatchOrientationChangeEvents$$.rotationRate.alpha, beta:$dispatchOrientationChangeEvents$$.rotationRate.beta, gamma:$dispatchOrientationChangeEvents$$.rotationRate.gamma}, interval:$dispatchOrientationChangeEvents$$.interval, timeStamp:$dispatchOrientationChangeEvents$$.timeStamp});
  });
};
_.$$jscomp$inherits$$($AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$4$$) {
  this.$preconnect$.url(this.$baseURL_$, $onLayout$jscomp$4$$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$contentID_$ = this.element.getAttribute("data-content-id");
  var $deferred$jscomp$43$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$43$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$43$$.resolve;
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$587$$ = this, $iframe$jscomp$45$$ = _.$createFrameFor$$module$src$iframe_video$$(this, this.$baseURL_$ + "/player/" + this.$contentID_$ + "?amp=1");
  $iframe$jscomp$45$$.setAttribute("allow", "vr");
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", function($iframe$jscomp$45$$) {
    if ($iframe$jscomp$45$$.source === $$jscomp$this$jscomp$587$$.$iframe_$.contentWindow && ($iframe$jscomp$45$$ = _.$objOrParseJson$$module$src$iframe_video$$($iframe$jscomp$45$$.data), void 0 !== $iframe$jscomp$45$$ && void 0 !== $iframe$jscomp$45$$.type)) {
      var $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$ = $$jscomp$this$jscomp$587$$.element;
      switch($iframe$jscomp$45$$.type) {
        case "x-dl8-ping":
          ($iframe$jscomp$45$$ = $iframe$jscomp$45$$.guid) && $$jscomp$this$jscomp$587$$.$iframe_$.contentWindow.postMessage(JSON.stringify({type:"x-dl8-pong", $guid$:$iframe$jscomp$45$$, $idx$:0}), "*");
          break;
        case "x-dl8-to-parent-ready":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
          $$jscomp$this$jscomp$587$$.$playerReadyResolver_$($$jscomp$this$jscomp$587$$.$iframe_$);
          break;
        case "x-dl8-to-parent-playing":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$PLAYING$);
          break;
        case "x-dl8-to-parent-paused":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$PAUSE$);
          break;
        case "x-dl8-to-parent-ended":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$ENDED$);
          break;
        case "x-dl8-to-parent-timeupdate":
          $iframe$jscomp$45$$ = $iframe$jscomp$45$$.payload;
          $$jscomp$this$jscomp$587$$.$currentTime_$ = $iframe$jscomp$45$$.currentTime;
          $$jscomp$this$jscomp$587$$.$playedRanges_$ = $iframe$jscomp$45$$.$playedRanges$;
          break;
        case "x-dl8-to-parent-muted":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$MUTED$);
          break;
        case "x-dl8-to-parent-unmuted":
          $data$jscomp$inline_3179_event$jscomp$105_guid$jscomp$inline_3181_payload$jscomp$inline_3182$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$UNMUTED$);
          break;
        case "x-dl8-to-parent-duration":
          $$jscomp$this$jscomp$587$$.$totalDuration_$ = $iframe$jscomp$45$$.payload.duration;
          break;
        case "x-dl8-iframe-enter-fullscreen":
          _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$587$$.$iframe_$, "position", "fixed");
          break;
        case "x-dl8-iframe-exit-fullscreen":
          _.$setStyle$$module$src$style$$($$jscomp$this$jscomp$587$$.$iframe_$, "position", "absolute");
          break;
        case "x-dl8-to-parent-entered-fullscreen":
          $$jscomp$this$jscomp$587$$.$isFullscreen_$ = !0;
          break;
        case "x-dl8-to-parent-exited-fullscreen":
          $$jscomp$this$jscomp$587$$.$isFullscreen_$ = !1;
      }
    }
  });
  this.$iframe_$ = $iframe$jscomp$45$$;
  $JSCompiler_StaticMethods_registerEventHandlers_$$(this);
  return this.$loadPromise$($iframe$jscomp$45$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  var $deferred$jscomp$44$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$playerReadyPromise_$ = $deferred$jscomp$44$$.$promise$;
  this.$playerReadyResolver_$ = $deferred$jscomp$44$$.resolve;
  this.$unlistenScreenOrientationChange_$ && this.$unlistenScreenOrientationChange_$();
  this.$unlistenOrientationChange_$ && this.$unlistenOrientationChange_$();
  this.$unlistenDeviceOrientation_$ && this.$unlistenDeviceOrientation_$();
  this.$unlistenDeviceMotion_$ && this.$unlistenDeviceMotion_$();
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$51$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$51$$);
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$11$$ = this.element.ownerDocument.createElement("div"), $src$jscomp$32$$ = this.$baseURL_$ + "/poster/" + this.$contentID_$;
  $placeholder$jscomp$11$$.setAttribute("placeholder", "");
  _.$setStyle$$module$src$style$$($placeholder$jscomp$11$$, "background-image", "url(" + $src$jscomp$32$$ + ")");
  return this.$placeholderEl_$ = $placeholder$jscomp$11$$;
};
_.$JSCompiler_prototypeAlias$$.$firstLayoutCompleted$ = function() {
  var $$jscomp$this$jscomp$588$$ = this, $el$jscomp$62$$ = this.$placeholderEl_$, $promise$jscomp$41$$ = null;
  $el$jscomp$62$$ && this.$isInViewport$() ? ($el$jscomp$62$$.classList.add("i-amphtml-delight-player-faded"), $promise$jscomp$41$$ = _.$listenOncePromise$$module$src$event_helper$$($el$jscomp$62$$, "transitionend")) : $promise$jscomp$41$$ = window.Promise.resolve();
  return $promise$jscomp$41$$.then(function() {
    return window.AMP.BaseElement.prototype.$firstLayoutCompleted$.call($$jscomp$this$jscomp$588$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.pause();
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.play(!1);
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-play");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-pause");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-unmute");
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-enable-interface");
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-disable-interface");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-enter-fullscreen");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  $JSCompiler_StaticMethods_AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player_prototype$sendCommand_$$(this, "x-dl8-to-iframe-exit-fullscreen");
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
  return this.$currentTime_$;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return this.$totalDuration_$;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return this.$playedRanges_$;
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-delight-player", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-delight-player", $AmpDelightPlayer$$module$extensions$amp_delight_player$0_1$amp_delight_player$$, "amp-delight-player [placeholder]{-webkit-transition:opacity 0.5s ease-out;transition:opacity 0.5s ease-out;background:no-repeat 50%;background-size:cover;width:100%;height:100%}amp-delight-player [placeholder].i-amphtml-delight-player-faded{opacity:0;pointer-events:none}\n/*# sourceURL=/extensions/amp-delight-player/0.1/amp-delight-player.css*/");

})});
