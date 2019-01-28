(self.AMP=self.AMP||[]).push({n:"amp-video-service",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $VideoService$$module$extensions$amp_video_service$0_1$amp_video_service$$ = function($ampdoc$jscomp$230$$) {
  var $$jscomp$this$jscomp$1307$$ = this, $win$jscomp$480$$ = $ampdoc$jscomp$230$$.$win$;
  this.$ampdoc_$ = $ampdoc$jscomp$230$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($win$jscomp$480$$);
  this.$D$ = null;
  this.$F$ = function() {
    $$jscomp$this$jscomp$1307$$.$D$.$fire$();
    $$jscomp$this$jscomp$1307$$.$timer_$.delay($$jscomp$this$jscomp$1307$$.$F$, 1000);
  };
}, $JSCompiler_StaticMethods_onTick$$ = function($JSCompiler_StaticMethods_onTick$self$$, $handler$jscomp$66$$) {
  $JSCompiler_StaticMethods_onTick$self$$.$D$ = $JSCompiler_StaticMethods_onTick$self$$.$D$ || new _.$Observable$$module$src$observable$$;
  $JSCompiler_StaticMethods_onTick$self$$.$D$.add($handler$jscomp$66$$);
  1 == _.$JSCompiler_StaticMethods_getHandlerCount$$($JSCompiler_StaticMethods_onTick$self$$.$D$) && ($JSCompiler_StaticMethods_onTick$self$$.$D$.$fire$(), $JSCompiler_StaticMethods_onTick$self$$.$timer_$.delay($JSCompiler_StaticMethods_onTick$self$$.$F$, 1000));
}, $VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service$$ = function($ampdoc$jscomp$231$$, $videoService$$, $video$jscomp$75$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$231$$;
  this.$F$ = $videoService$$;
  this.$video_$ = $video$jscomp$75$$;
  this.$D$ = !1;
}, $JSCompiler_StaticMethods_onPlaybackTick$$ = function($JSCompiler_StaticMethods_onPlaybackTick$self$$, $handler$jscomp$67$$) {
  $JSCompiler_StaticMethods_onTick$$($JSCompiler_StaticMethods_onPlaybackTick$self$$.$F$, function() {
    $JSCompiler_StaticMethods_onPlaybackTick$self$$.$D$ && $handler$jscomp$67$$();
  });
}, $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$$ = function($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$) {
  var $element$jscomp$681$$ = $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$.$video_$.element, $signals$jscomp$6$$ = $element$jscomp$681$$.signals();
  $element$jscomp$681$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$REGISTERED$);
  _.$JSCompiler_StaticMethods_signal$$($signals$jscomp$6$$, _.$VideoEvents$$module$src$video_interface$$.$REGISTERED$);
  $element$jscomp$681$$.$K$().then(function() {
    var $element$jscomp$681$$ = $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$.$video_$.element;
    $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$$($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$);
    $JSCompiler_StaticMethods_addEventHandlers_$$($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$);
    $element$jscomp$681$$.classList.add("i-amphtml-video-interface");
  });
  $signals$jscomp$6$$.whenSignal("load-start").then(function() {
    $JSCompiler_StaticMethods_triggerTimeUpdate_$$($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$self$$);
  });
}, $JSCompiler_StaticMethods_addEventHandlers_$$ = function($JSCompiler_StaticMethods_addEventHandlers_$self$$) {
  var $element$jscomp$683$$ = $JSCompiler_StaticMethods_addEventHandlers_$self$$.$video_$.element;
  _.$listen$$module$src$event_helper$$($element$jscomp$683$$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, function() {
    $JSCompiler_StaticMethods_addEventHandlers_$self$$.$D$ = !1;
  });
  _.$listen$$module$src$event_helper$$($element$jscomp$683$$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, function() {
    $JSCompiler_StaticMethods_addEventHandlers_$self$$.$D$ = !0;
  });
}, $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$$ = function($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$self$$) {
  function $registerAction$jscomp$1$$($JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$self$$, $registerAction$jscomp$1$$) {
    _.$JSCompiler_StaticMethods_registerAction$$($video$jscomp$77$$, $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$self$$, function() {
      _.$JSCompiler_StaticMethods_signal$$($video$jscomp$77$$.signals(), "user-interacted");
      $registerAction$jscomp$1$$();
    }, 1);
  }
  var $video$jscomp$77$$ = $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$registerCommonActions_$self$$.$video_$;
  $registerAction$jscomp$1$$("play", function() {
    return $video$jscomp$77$$.play(!1);
  });
  $registerAction$jscomp$1$$("pause", function() {
    return $video$jscomp$77$$.pause();
  });
  $registerAction$jscomp$1$$("mute", function() {
    return $video$jscomp$77$$.$mute$();
  });
  $registerAction$jscomp$1$$("unmute", function() {
    return $video$jscomp$77$$.$unmute$();
  });
  $registerAction$jscomp$1$$("fullscreen", function() {
    return $video$jscomp$77$$.$fullscreenEnter$();
  });
}, $JSCompiler_StaticMethods_triggerTimeUpdate_$$ = function($JSCompiler_StaticMethods_triggerTimeUpdate_$self$$) {
  $JSCompiler_StaticMethods_onPlaybackTick$$($JSCompiler_StaticMethods_triggerTimeUpdate_$self$$, function() {
    var $element$jscomp$684_video$jscomp$78$$ = $JSCompiler_StaticMethods_triggerTimeUpdate_$self$$.$video_$, $event$jscomp$250_time$jscomp$39$$ = $element$jscomp$684_video$jscomp$78$$.$getCurrentTime$(), $duration$jscomp$25$$ = $element$jscomp$684_video$jscomp$78$$.$getDuration$();
    if (_.$isFiniteNumber$$module$src$types$$($event$jscomp$250_time$jscomp$39$$) && _.$isFiniteNumber$$module$src$types$$($duration$jscomp$25$$) && !(0 >= $duration$jscomp$25$$)) {
      var $win$jscomp$481$$ = $JSCompiler_StaticMethods_triggerTimeUpdate_$self$$.$ampdoc_$.$win$;
      $element$jscomp$684_video$jscomp$78$$ = $JSCompiler_StaticMethods_triggerTimeUpdate_$self$$.$video_$.element;
      var $actions$jscomp$10$$ = _.$Services$$module$src$services$actionServiceForDoc$$($element$jscomp$684_video$jscomp$78$$);
      $event$jscomp$250_time$jscomp$39$$ = _.$createCustomEvent$$module$src$event_helper$$($win$jscomp$481$$, "amp-video-service.timeUpdate", _.$dict$$module$src$utils$object$$({time:$event$jscomp$250_time$jscomp$39$$, percent:$event$jscomp$250_time$jscomp$39$$ / $duration$jscomp$25$$}));
      $actions$jscomp$10$$.$trigger$($element$jscomp$684_video$jscomp$78$$, "timeUpdate", $event$jscomp$250_time$jscomp$39$$, 1);
    }
  });
};
$VideoService$$module$extensions$amp_video_service$0_1$amp_video_service$$.prototype.register = function($entry$jscomp$inline_5281_video$jscomp$74$$) {
  var $element$jscomp$678$$ = $entry$jscomp$inline_5281_video$jscomp$74$$.element;
  if ($element$jscomp$678$$.__AMP_VIDEO_ENTRY__) {
    return $element$jscomp$678$$.__AMP_VIDEO_ENTRY__;
  }
  if (!$entry$jscomp$inline_5281_video$jscomp$74$$.$supportsPlatform$()) {
    return null;
  }
  $entry$jscomp$inline_5281_video$jscomp$74$$ = new $VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service$$(this.$ampdoc_$, this, $entry$jscomp$inline_5281_video$jscomp$74$$);
  $JSCompiler_StaticMethods_VideoEntry$$module$extensions$amp_video_service$0_1$amp_video_service_prototype$install$$($entry$jscomp$inline_5281_video$jscomp$74$$);
  return $element$jscomp$678$$.__AMP_VIDEO_ENTRY__ = $entry$jscomp$inline_5281_video$jscomp$74$$;
};
$VideoService$$module$extensions$amp_video_service$0_1$amp_video_service$$.prototype.$G$ = function() {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-video-service", "%s unimplemented.", "Video analytics");
  return window.Promise.resolve();
};
window.self.AMP.registerServiceForDoc("video-service", $VideoService$$module$extensions$amp_video_service$0_1$amp_video_service$$);

})});
