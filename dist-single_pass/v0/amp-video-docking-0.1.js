(self.AMP=self.AMP||[]).push({n:"amp-video-docking",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $applyBreakpointClassname$$module$extensions$amp_video_docking$0_1$breakpoints$$ = function($element$jscomp$650$$, $width$jscomp$61$$, $breakpoints$$) {
  $breakpoints$$ = $breakpoints$$.sort(function($element$jscomp$650$$, $width$jscomp$61$$) {
    return $width$jscomp$61$$.minWidth - $element$jscomp$650$$.minWidth;
  });
  var $maxBreakpoint$$ = -1;
  $breakpoints$$.forEach(function($breakpoints$$) {
    var $$jscomp$destructuring$var548_minWidth$jscomp$1$$ = $breakpoints$$.className;
    $breakpoints$$ = $breakpoints$$.minWidth;
    $breakpoints$$ <= $width$jscomp$61$$ && $breakpoints$$ > $maxBreakpoint$$ ? ($element$jscomp$650$$.classList.add($$jscomp$destructuring$var548_minWidth$jscomp$1$$), $maxBreakpoint$$ = $breakpoints$$) : $element$jscomp$650$$.classList.remove($$jscomp$destructuring$var548_minWidth$jscomp$1$$);
  });
}, $calculateRightJustifiedX$$module$extensions$amp_video_docking$0_1$math$$ = function($containerWidth$jscomp$7$$, $itemWidth$jscomp$1$$, $itemMargin$jscomp$1$$, $step$$) {
  return $step$$ * ($containerWidth$jscomp$7$$ - $itemWidth$jscomp$1$$ - 2 * $itemMargin$jscomp$1$$);
}, $calculateLeftJustifiedX$$module$extensions$amp_video_docking$0_1$math$$ = function($containerWidth$jscomp$8$$, $itemWidth$jscomp$2$$, $itemMargin$jscomp$2$$, $step$jscomp$1$$) {
  return -$step$jscomp$1$$ * ($containerWidth$jscomp$8$$ - $itemWidth$jscomp$2$$ - 2 * $itemMargin$jscomp$2$$);
}, $pointerCoords$$module$extensions$amp_video_docking$0_1$events$$ = function($coords_e$jscomp$336$$) {
  $coords_e$jscomp$336$$ = $coords_e$jscomp$336$$.touches ? $coords_e$jscomp$336$$.touches[0] : $coords_e$jscomp$336$$;
  return {x:"x" in $coords_e$jscomp$336$$ ? $coords_e$jscomp$336$$.x : $coords_e$jscomp$336$$.clientX, y:"y" in $coords_e$jscomp$336$$ ? $coords_e$jscomp$336$$.y : $coords_e$jscomp$336$$.clientY};
}, $Timeout$$module$extensions$amp_video_docking$0_1$timeout$$ = function($win$jscomp$477$$, $handler$jscomp$63$$) {
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($win$jscomp$477$$);
  this.$F$ = $handler$jscomp$63$$;
  this.$D$ = null;
}, $swap$$module$extensions$amp_video_docking$0_1$controls$$ = function($a$jscomp$288$$, $b$jscomp$264$$) {
  _.$toggle$$module$src$style$$($a$jscomp$288$$, !1);
  _.$toggle$$module$src$style$$($b$jscomp$264$$, !0);
}, $Controls$$module$extensions$amp_video_docking$0_1$controls$$ = function($ampdoc$jscomp$226$$) {
  var $$jscomp$this$jscomp$1284$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$226$$;
  var $html$jscomp$37_refs$jscomp$2$$ = _.$htmlFor$$module$src$static_template$$($ampdoc$jscomp$226$$.$getBody$());
  this.container = $html$jscomp$37_refs$jscomp$2$$($_template2$$module$extensions$amp_video_docking$0_1$controls$$);
  this.$D$ = $html$jscomp$37_refs$jscomp$2$$($_template$$module$extensions$amp_video_docking$0_1$controls$$);
  this.$manager_$ = _.$once$$module$src$utils$function$$(function() {
    return _.$Services$$module$src$services$videoManagerForDoc$$($ampdoc$jscomp$226$$);
  });
  $html$jscomp$37_refs$jscomp$2$$ = _.$htmlRefs$$module$src$static_template$$(this.container);
  this.$W$ = $html$jscomp$37_refs$jscomp$2$$.dismissButton;
  this.$K$ = $html$jscomp$37_refs$jscomp$2$$.playButton;
  this.$J$ = $html$jscomp$37_refs$jscomp$2$$.pauseButton;
  this.$I$ = $html$jscomp$37_refs$jscomp$2$$.muteButton;
  this.$O$ = $html$jscomp$37_refs$jscomp$2$$.unmuteButton;
  this.$aa$ = $html$jscomp$37_refs$jscomp$2$$.fullscreenButton;
  this.$Y$ = $html$jscomp$37_refs$jscomp$2$$.dismissContainer;
  this.$R$ = this.$P$ = !1;
  this.$ba$ = _.$once$$module$src$utils$function$$(function() {
    return new $Timeout$$module$extensions$amp_video_docking$0_1$timeout$$($$jscomp$this$jscomp$1284$$.$ampdoc_$.$win$, function() {
      $$jscomp$this$jscomp$1284$$.$hide$(!0);
    });
  });
  this.$U$ = [];
  this.$video_$ = this.$V$ = this.$G$ = this.$F$ = null;
  $JSCompiler_StaticMethods_hideOnTapOutside_$$(this);
  $JSCompiler_StaticMethods_showOnTapOrHover_$$(this);
}, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$disable$$ = function($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$disable$self$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking-controls", "disable");
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$disable$self$$.$P$ = !0;
}, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$enable$$ = function($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$enable$self$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking-controls", "enable");
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$enable$self$$.$P$ = !1;
}, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$$ = function($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $video$jscomp$40$$) {
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$unlisten_$();
  var $element$jscomp$651$$ = $video$jscomp$40$$.element;
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$U$.push($JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$W$, "click", function() {
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.container.dispatchEvent(_.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$ampdoc_$.$win$, "dock-dismiss-on-tap", void 0));
  }), $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$K$, "click", function() {
    $video$jscomp$40$$.play(!1);
  }), $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$J$, "click", function() {
    $video$jscomp$40$$.pause();
  }), $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$I$, "click", function() {
    $video$jscomp$40$$.$mute$();
  }), $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$O$, "click", function() {
    $video$jscomp$40$$.$unmute$();
  }), $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$aa$, "click", function() {
    $video$jscomp$40$$.$fullscreenEnter$();
  }), _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.container, "mouseup", function() {
    return $JSCompiler_StaticMethods_hideOnTimeout$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$, 800);
  }), _.$listen$$module$src$event_helper$$($element$jscomp$651$$, _.$VideoEvents$$module$src$video_interface$$.$PLAYING$, function() {
    var $video$jscomp$40$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$K$, $element$jscomp$651$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$J$;
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$R$ = !1;
    $swap$$module$extensions$amp_video_docking$0_1$controls$$($video$jscomp$40$$, $element$jscomp$651$$);
  }), _.$listen$$module$src$event_helper$$($element$jscomp$651$$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, function() {
    var $video$jscomp$40$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$J$, $element$jscomp$651$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$K$;
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$R$ = !0;
    $swap$$module$extensions$amp_video_docking$0_1$controls$$($video$jscomp$40$$, $element$jscomp$651$$);
  }), _.$listen$$module$src$event_helper$$($element$jscomp$651$$, _.$VideoEvents$$module$src$video_interface$$.$MUTED$, function() {
    $swap$$module$extensions$amp_video_docking$0_1$controls$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$I$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$O$);
  }), _.$listen$$module$src$event_helper$$($element$jscomp$651$$, _.$VideoEvents$$module$src$video_interface$$.$UNMUTED$, function() {
    $swap$$module$extensions$amp_video_docking$0_1$controls$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$O$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$self$$.$I$);
  }));
}, $JSCompiler_StaticMethods_listenWhenEnabled_$$ = function($JSCompiler_StaticMethods_listenWhenEnabled_$self$$, $element$jscomp$652$$, $eventType$jscomp$66$$, $callback$jscomp$166$$) {
  return _.$listen$$module$src$event_helper$$($element$jscomp$652$$, $eventType$jscomp$66$$, function() {
    $JSCompiler_StaticMethods_listenWhenEnabled_$self$$.$P$ || $callback$jscomp$166$$();
  });
}, $JSCompiler_StaticMethods_hideOnTimeout$$ = function($JSCompiler_StaticMethods_hideOnTimeout$self$$, $timeout$jscomp$21$$) {
  $timeout$jscomp$21$$ = void 0 === $timeout$jscomp$21$$ ? 1200 : $timeout$jscomp$21$$;
  $JSCompiler_StaticMethods_hideOnTimeout$self$$.$ba$().$trigger$($timeout$jscomp$21$$);
}, $JSCompiler_StaticMethods_showOnTapOrHover_$$ = function($JSCompiler_StaticMethods_showOnTapOrHover_$self$$) {
  function $boundShow$$() {
    return $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$$($JSCompiler_StaticMethods_showOnTapOrHover_$self$$);
  }
  var $overlay$jscomp$1$$ = $JSCompiler_StaticMethods_showOnTapOrHover_$self$$.$D$;
  $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_showOnTapOrHover_$self$$, $overlay$jscomp$1$$, "click", $boundShow$$);
  $JSCompiler_StaticMethods_listenWhenEnabled_$$($JSCompiler_StaticMethods_showOnTapOrHover_$self$$, $overlay$jscomp$1$$, "mouseover", $boundShow$$);
}, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$$ = function($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$) {
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$ampdoc_$.$win$.requestAnimationFrame(function() {
    var $container$jscomp$inline_5121$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.container, $overlay$jscomp$inline_5122$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$D$, $playButton$jscomp$inline_5123$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$K$, $pauseButton$jscomp$inline_5124$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$J$, 
    $muteButton$jscomp$inline_5125$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$I$, $unmuteButton$jscomp$inline_5126$$ = $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$O$;
    _.$toggle$$module$src$style$$($container$jscomp$inline_5121$$, !0);
    $container$jscomp$inline_5121$$.classList.add("amp-video-docked-controls-shown");
    $overlay$jscomp$inline_5122$$.classList.add("amp-video-docked-controls-bg");
    $JSCompiler_StaticMethods_listenToMouseMove_$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$);
    "paused" != $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$manager_$().$getPlayingState$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$video_$) ? $swap$$module$extensions$amp_video_docking$0_1$controls$$($playButton$jscomp$inline_5123$$, $pauseButton$jscomp$inline_5124$$) : $swap$$module$extensions$amp_video_docking$0_1$controls$$($pauseButton$jscomp$inline_5124$$, $playButton$jscomp$inline_5123$$);
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$manager_$().$isMuted$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$.$video_$) ? $swap$$module$extensions$amp_video_docking$0_1$controls$$($muteButton$jscomp$inline_5125$$, $unmuteButton$jscomp$inline_5126$$) : $swap$$module$extensions$amp_video_docking$0_1$controls$$($unmuteButton$jscomp$inline_5126$$, $muteButton$jscomp$inline_5125$$);
    $JSCompiler_StaticMethods_hideOnTimeout$$($JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$self$$);
  });
}, $JSCompiler_StaticMethods_positionOnVsync$$ = function($JSCompiler_StaticMethods_positionOnVsync$self_dismissContainer$$, $scale$jscomp$11$$, $centerX_x$jscomp$111$$, $centerY$jscomp$1_y$jscomp$84$$, $width$jscomp$62$$, $height$jscomp$67$$) {
  var $container$jscomp$43$$ = $JSCompiler_StaticMethods_positionOnVsync$self_dismissContainer$$.container;
  $JSCompiler_StaticMethods_positionOnVsync$self_dismissContainer$$ = $JSCompiler_StaticMethods_positionOnVsync$self_dismissContainer$$.$Y$;
  var $halfScale$$ = $scale$jscomp$11$$ / 2;
  $centerX_x$jscomp$111$$ += $width$jscomp$62$$ * $halfScale$$;
  $centerY$jscomp$1_y$jscomp$84$$ += $height$jscomp$67$$ * $halfScale$$;
  $applyBreakpointClassname$$module$extensions$amp_video_docking$0_1$breakpoints$$($container$jscomp$43$$, $scale$jscomp$11$$ * $width$jscomp$62$$, $BREAKPOINTS$$module$extensions$amp_video_docking$0_1$controls$$);
  _.$setImportantStyles$$module$src$style$$($container$jscomp$43$$, {transform:_.$translate$$module$src$style$$($centerX_x$jscomp$111$$, $centerY$jscomp$1_y$jscomp$84$$)});
  _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_positionOnVsync$self_dismissContainer$$, {transform:_.$translate$$module$src$style$$($width$jscomp$62$$ * $halfScale$$ - 4 - 40, -($height$jscomp$67$$ * $halfScale$$ - 4 - 40))});
}, $JSCompiler_StaticMethods_hideOnTapOutside_$$ = function($JSCompiler_StaticMethods_hideOnTapOutside_$self$$) {
  _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_hideOnTapOutside_$self$$.$ampdoc_$.getRootNode(), "mousedown", function($e$jscomp$337_target$jscomp$inline_5129$$) {
    $e$jscomp$337_target$jscomp$inline_5129$$ = $e$jscomp$337_target$jscomp$inline_5129$$.target;
    $e$jscomp$337_target$jscomp$inline_5129$$ == $JSCompiler_StaticMethods_hideOnTapOutside_$self$$.$D$ || _.$closestBySelector$$module$src$dom$$($e$jscomp$337_target$jscomp$inline_5129$$, ".amp-video-docked-controls") || $JSCompiler_StaticMethods_hideOnTapOutside_$self$$.$hide$(!0);
  });
}, $JSCompiler_StaticMethods_listenToMouseMove_$$ = function($JSCompiler_StaticMethods_listenToMouseMove_$self$$) {
  $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$F$ || ($JSCompiler_StaticMethods_listenToMouseMove_$self$$.$F$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_listenToMouseMove_$self$$.$D$, "mousemove", function() {
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$show_$$($JSCompiler_StaticMethods_listenToMouseMove_$self$$);
  }), $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$G$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_listenToMouseMove_$self$$.$D$, "mouseout", function($e$jscomp$338_x$jscomp$112$$) {
    var $$jscomp$destructuring$var559_y$jscomp$85$$ = $pointerCoords$$module$extensions$amp_video_docking$0_1$events$$($e$jscomp$338_x$jscomp$112$$);
    $e$jscomp$338_x$jscomp$112$$ = $$jscomp$destructuring$var559_y$jscomp$85$$.x;
    $$jscomp$destructuring$var559_y$jscomp$85$$ = $$jscomp$destructuring$var559_y$jscomp$85$$.y;
    var $$jscomp$destructuring$var560$$ = $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$V$, $top$jscomp$20$$ = $$jscomp$destructuring$var560$$.top, $right$jscomp$11$$ = $$jscomp$destructuring$var560$$.right, $bottom$jscomp$4$$ = $$jscomp$destructuring$var560$$.bottom;
    if ($e$jscomp$338_x$jscomp$112$$ < $$jscomp$destructuring$var560$$.left || $e$jscomp$338_x$jscomp$112$$ > $right$jscomp$11$$ || $$jscomp$destructuring$var559_y$jscomp$85$$ < $top$jscomp$20$$ || $$jscomp$destructuring$var559_y$jscomp$85$$ > $bottom$jscomp$4$$) {
      $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$hide$(!0), $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$F$ && ($JSCompiler_StaticMethods_listenToMouseMove_$self$$.$F$(), $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$F$ = null), $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$G$ && ($JSCompiler_StaticMethods_listenToMouseMove_$self$$.$G$(), $JSCompiler_StaticMethods_listenToMouseMove_$self$$.$G$ = null);
    }
  }));
}, $throttleByAnimationFrame$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = function($win$jscomp$478$$, $fn$jscomp$25$$) {
  var $running$$ = !1;
  return function($args$jscomp$61$$) {
    for (var $$jscomp$restParams$jscomp$6$$ = [], $$jscomp$restIndex$jscomp$6$$ = 0; $$jscomp$restIndex$jscomp$6$$ < arguments.length; ++$$jscomp$restIndex$jscomp$6$$) {
      $$jscomp$restParams$jscomp$6$$[$$jscomp$restIndex$jscomp$6$$] = arguments[$$jscomp$restIndex$jscomp$6$$];
    }
    $running$$ || ($running$$ = !0, $win$jscomp$478$$.requestAnimationFrame(function() {
      $fn$jscomp$25$$.apply(null, $$jscomp$restParams$jscomp$6$$);
      $running$$ = !1;
    }));
  };
}, $isSizedLayoutRect$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = function($rect$jscomp$21$$) {
  var $height$jscomp$68$$ = $rect$jscomp$21$$.height;
  return 0 < $rect$jscomp$21$$.width && 0 < $height$jscomp$68$$;
}, $targetsEqual$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = function($a$jscomp$289$$, $b$jscomp$265$$) {
  return 1 == $a$jscomp$289$$.nodeType ? $a$jscomp$289$$ == $b$jscomp$265$$ : $a$jscomp$289$$.$posX$ == $b$jscomp$265$$.$posX$;
}, $VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = function($ampdoc$jscomp$227$$, $opt_injectedPositionObserver$$) {
  var $$jscomp$this$jscomp$1291$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$227$$;
  this.$manager_$ = _.$once$$module$src$utils$function$$(function() {
    return _.$Services$$module$src$services$videoManagerForDoc$$($ampdoc$jscomp$227$$);
  });
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$227$$);
  this.$D$ = null;
  this.$fa$ = _.$isRTL$$module$src$dom$$(this.$ampdoc_$.getRootNode()) ? 0 : 1;
  var $html$jscomp$40$$ = _.$htmlFor$$module$src$static_template$$(this.$ampdoc_$.getRootNode());
  this.$U$ = _.$once$$module$src$utils$function$$(function() {
    return $JSCompiler_StaticMethods_append_$$($$jscomp$this$jscomp$1291$$, $html$jscomp$40$$($_template$$module$extensions$amp_video_docking$0_1$amp_video_docking$$));
  });
  this.$F$ = _.$once$$module$src$utils$function$$(function() {
    return $JSCompiler_StaticMethods_installControls_$$($$jscomp$this$jscomp$1291$$);
  });
  this.$P$ = _.$once$$module$src$utils$function$$(function() {
    return $JSCompiler_StaticMethods_append_$$($$jscomp$this$jscomp$1291$$, $html$jscomp$40$$($_template2$$module$extensions$amp_video_docking$0_1$amp_video_docking$$));
  });
  this.$R$ = _.$once$$module$src$utils$function$$(function() {
    return _.$htmlRefs$$module$src$static_template$$($$jscomp$this$jscomp$1291$$.$P$());
  });
  this.$J$ = this.$K$ = this.$I$ = this.$W$ = this.$ea$ = null;
  this.$Y$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$(this.$viewport_$);
  this.$V$ = !1;
  this.$aa$ = [];
  this.$ga$ = _.$once$$module$src$utils$function$$(function() {
    var $ampdoc$jscomp$227$$ = $$jscomp$this$jscomp$1291$$.$ampdoc_$;
    _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($$jscomp$this$jscomp$1291$$.$viewport_$, $throttleByAnimationFrame$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($ampdoc$jscomp$227$$.$win$, function() {
      var $ampdoc$jscomp$227$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($$jscomp$this$jscomp$1291$$.$viewport_$);
      5 > Math.abs($ampdoc$jscomp$227$$ - $$jscomp$this$jscomp$1291$$.$Y$) || ($$jscomp$this$jscomp$1291$$.$J$ = $ampdoc$jscomp$227$$ > $$jscomp$this$jscomp$1291$$.$Y$ ? 1 : -1, $$jscomp$this$jscomp$1291$$.$Y$ = $ampdoc$jscomp$227$$);
    }));
    _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$($$jscomp$this$jscomp$1291$$.$viewport_$, function() {
      return $JSCompiler_StaticMethods_updateAllOnResize_$$($$jscomp$this$jscomp$1291$$);
    });
    _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$227$$, ".amp-video-docked-controls{opacity:0;pointer-events:none!important;-webkit-transition:opacity 0.3s ease;transition:opacity 0.3s ease;height:120px}.amp-video-docked-main-button-group{height:40px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;margin:-20px 0 0 -60px}.amp-large>.amp-video-docked-main-button-group{margin-left:-70px}.amp-large>.amp-video-docked-main-button-group>.amp-video-docked-button-group{margin-right:10px}.amp-large>.amp-video-docked-button-dismiss-group{margin:6px 0 0 -6px}.amp-small>.amp-video-docked-button-dismiss-group,.amp-small>.amp-video-docked-button-dismiss-group>div[role=button]{min-width:32px;height:32px;border-radius:32px;background-size:20px 20px}.amp-small>.amp-video-docked-button-dismiss-group{margin-left:8px}.amp-video-docked-controls-shown{opacity:1;pointer-events:initial!important}.amp-video-docked-button-group{margin:0}.amp-video-docked-button-dismiss-group,.amp-video-docked-button-dismiss-group>div[role=button],.amp-video-docked-button-group,.amp-video-docked-button-group>div[role=button]{min-width:40px;height:40px;border-radius:40px}.amp-video-docked-button-dismiss-group:active,.amp-video-docked-button-group:active{background-color:hsla(0,0%,100%,0.7)}.amp-video-docked-button-dismiss-group>div[role=button],.amp-video-docked-button-group,.amp-video-docked-button-group>div[role=button],.amp-video-docked-controls,.i-amphtml-video-docked-overlay{-webkit-tap-highlight-color:rgba(0,0,0,0)!important}.amp-video-docked-button-dismiss-group>div[role=button],.amp-video-docked-button-group>div[role=button]{background-repeat:no-repeat;background-position:50%}.amp-video-docked-shadow{box-shadow:0px 0 20px 6px rgba(0,0,0,0.2)}.amp-video-docked-controls-bg{background:hsla(0,0%,90.2%,0.6)}.amp-video-docked-mute{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-video-docked-unmute{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-video-docked-pause{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-video-docked-play{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-video-docked-fullscreen{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'/%3E%3C/svg%3E\")}.amp-video-docked-dismiss{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\")}.amp-video-docked-shadow,.i-amphtml-video-docked,.i-amphtml-video-docked-overlay{margin:0!important}.i-amphtml-video-docked{-webkit-transition-property:-webkit-transform!important;transition-property:-webkit-transform!important;transition-property:transform!important;transition-property:transform,-webkit-transform!important}.amp-video-docked-controls,.amp-video-docked-shadow,.i-amphtml-video-docked,.i-amphtml-video-docked-overlay{position:fixed!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;padding:0!important;min-width:0!important;min-height:0!important;max-width:auto!important;max-height:auto!important;-webkit-transform-origin:left top!important;transform-origin:left top!important;will-change:width,height,transition,transform,opacity}.i-amphtml-video-docked-overlay{opacity:0;-webkit-transition:opacity 0.3s ease;transition:opacity 0.3s ease;contain:strict!important}.amp-video-docked-controls-bg{opacity:1}.i-amphtml-video-docked-overlay.amp-video-docked-almost-dismissed{opacity:1;background:hsla(0,0%,39.2%,0.1)}.i-amphtml-video-docked-shadow.amp-video-docked-almost-dismissed,.i-amphtml-video-docked.amp-video-docked-almost-dismissed{opacity:0.3}.amp-video-docked-button-dismiss-group{position:absolute;top:-40px}.amp-video-docked-placeholder-background{position:absolute;background:hsla(0,0%,78.4%,0.5);-webkit-transition-property:opacity;transition-property:opacity;overflow:hidden;pointer-events:none;z-index:0;opacity:0}.amp-video-docked-placeholder-icon{-webkit-mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h48v48H0z'/%3E%3Cpath d='M40 4H16c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4zM8 12H4v28c0 2.2 1.8 4 4 4h28v-4H8V12zm28 3.868L23.382 28.486l-2.828-2.828L33.212 13H25V9h15v15h-4v-8.132z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\");mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h48v48H0z'/%3E%3Cpath d='M40 4H16c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4zM8 12H4v28c0 2.2 1.8 4 4 4h28v-4H8V12zm28 3.868L23.382 28.486l-2.828-2.828L33.212 13H25V9h15v15h-4v-8.132z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\");-webkit-mask-size:48px 48px;mask-size:48px 48px;height:48px;width:48px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:bottom left;mask-position:bottom left;background:hsla(0,0%,39.2%,0.8);-webkit-transition-property:opacity,-webkit-transform;transition-property:opacity,-webkit-transform;transition-property:opacity,transform;transition-property:opacity,transform,-webkit-transform;will-change:opacity,transform;margin:-88px 0 0 40px}.amp-video-docked-placeholder-icon.amp-rtl{-webkit-mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M-4-4h48v48H-4z'/%3E%3Cpath d='M36 0c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4h24zM16 11.868l12.618 12.618 2.829-2.828L18.789 9H27V5H12v15h4v-8.132zM4 8H0v28c0 2.2 1.8 4 4 4h28v-4H4V8z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\");mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M-4-4h48v48H-4z'/%3E%3Cpath d='M36 0c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4h24zM16 11.868l12.618 12.618 2.829-2.828L18.789 9H27V5H12v15h4v-8.132zM4 8H0v28c0 2.2 1.8 4 4 4h28v-4H4V8z' fill='%23000' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E\");margin-left:calc(100% - 88px)}.amp-video-docked-placeholder-icon.amp-small{-webkit-mask-size:32px 32px;mask-size:32px 32px;width:32px;height:32px;margin:-52px 0 0 20px}.amp-video-docked-placeholder-icon.amp-rtl.amp-small{margin-left:calc(100% - 52px)}.amp-video-docked-placeholder-background-poster{width:100%;height:100%;background-size:cover;background-repeat:no-repeat;-webkit-filter:blur(20px);filter:blur(20px);-webkit-transform:scale(1.1);transform:scale(1.1);opacity:0.3}.amp-video-docked-controls{z-index:2147483646!important}.i-amphtml-video-docked-overlay{z-index:2147483645!important}.i-amphtml-video-docked{z-index:2147483644!important}.amp-video-docked-shadow{z-index:2147483643!important}\n/*# sourceURL=/extensions/amp-video-docking/0.1/amp-video-docking.css*/", 
    null, !1, "amp-video-docking");
  });
  this.$G$ = _.$once$$module$src$utils$function$$(function() {
    var $ampdoc$jscomp$227$$ = $$jscomp$this$jscomp$1291$$.$ampdoc_$.getRootNode(), $opt_injectedPositionObserver$$ = $ampdoc$jscomp$227$$.querySelector("[dock]");
    $opt_injectedPositionObserver$$;
    $opt_injectedPositionObserver$$ = $opt_injectedPositionObserver$$.getAttribute("dock").trim();
    return "" == $opt_injectedPositionObserver$$ ? null : $ampdoc$jscomp$227$$.querySelector($opt_injectedPositionObserver$$);
  });
  this.$ba$ = $opt_injectedPositionObserver$$ || null;
  this.$O$ = !1;
  $JSCompiler_StaticMethods_registerAll_$$(this);
}, $JSCompiler_StaticMethods_registerAll_$$ = function($JSCompiler_StaticMethods_registerAll_$self$$) {
  var $ampdoc$jscomp$229$$ = $JSCompiler_StaticMethods_registerAll_$self$$.$ampdoc_$, $dockableElements_dockableSelector$$ = "[" + _.$cssEscape$$module$third_party$css_escape$css_escape$$("dock") + "]";
  $dockableElements_dockableSelector$$ = $ampdoc$jscomp$229$$.getRootNode().querySelectorAll($dockableElements_dockableSelector$$);
  for (var $i$362$$ = 0; $i$362$$ < $dockableElements_dockableSelector$$.length; $i$362$$++) {
    var $element$jscomp$655$$ = $dockableElements_dockableSelector$$[$i$362$$];
    $element$jscomp$655$$.signals && $element$jscomp$655$$.signals().get(_.$VideoEvents$$module$src$video_interface$$.$REGISTERED$) && $JSCompiler_StaticMethods_registerAll_$self$$.registerElement($element$jscomp$655$$);
  }
  _.$listen$$module$src$event_helper$$($ampdoc$jscomp$229$$.$getBody$(), _.$VideoEvents$$module$src$video_interface$$.$REGISTERED$, function($ampdoc$jscomp$229$$) {
    $ampdoc$jscomp$229$$ = $ampdoc$jscomp$229$$.target;
    $ampdoc$jscomp$229$$.hasAttribute("dock") && $JSCompiler_StaticMethods_registerAll_$self$$.registerElement($ampdoc$jscomp$229$$);
  });
}, $JSCompiler_StaticMethods_updateAllOnResize_$$ = function($JSCompiler_StaticMethods_updateAllOnResize_$self$$) {
  $JSCompiler_StaticMethods_updateAllOnResize_$self$$.$aa$.forEach(function($video$jscomp$42$$) {
    return $JSCompiler_StaticMethods_updateOnResize_$$($JSCompiler_StaticMethods_updateAllOnResize_$self$$, $video$jscomp$42$$);
  });
}, $JSCompiler_StaticMethods_append_$$ = function($JSCompiler_StaticMethods_append_$self$$, $element$jscomp$658$$) {
  return ($JSCompiler_StaticMethods_append_$self$$.$ampdoc_$.getRootNode().body || $JSCompiler_StaticMethods_append_$self$$.$ampdoc_$.getRootNode()).appendChild($element$jscomp$658$$);
}, $JSCompiler_StaticMethods_addDragListeners_$$ = function($JSCompiler_StaticMethods_addDragListeners_$self$$, $element$jscomp$659$$) {
  function $handler$jscomp$64$$($element$jscomp$659$$) {
    return $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$$($JSCompiler_StaticMethods_addDragListeners_$self$$, $element$jscomp$659$$);
  }
  _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$659$$, "touchstart", $handler$jscomp$64$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$659$$, "mousedown", $handler$jscomp$64$$, void 0);
}, $JSCompiler_StaticMethods_installControls_$$ = function($JSCompiler_StaticMethods_installControls_$self$$) {
  var $controls$$ = new $Controls$$module$extensions$amp_video_docking$0_1$controls$$($JSCompiler_StaticMethods_installControls_$self$$.$ampdoc_$), $container$jscomp$46$$ = $controls$$.container, $overlay$jscomp$5$$ = $controls$$.$D$;
  _.$listen$$module$src$event_helper$$($container$jscomp$46$$, "dock-dismiss-on-tap", function() {
    $JSCompiler_StaticMethods_installControls_$self$$.$F$().$hide$(!1, !0);
    $JSCompiler_StaticMethods_undock_$$($JSCompiler_StaticMethods_installControls_$self$$, $JSCompiler_StaticMethods_installControls_$self$$.$D$.video);
  });
  $JSCompiler_StaticMethods_addDragListeners_$$($JSCompiler_StaticMethods_installControls_$self$$, $container$jscomp$46$$);
  $JSCompiler_StaticMethods_addDragListeners_$$($JSCompiler_StaticMethods_installControls_$self$$, $overlay$jscomp$5$$);
  $JSCompiler_StaticMethods_append_$$($JSCompiler_StaticMethods_installControls_$self$$, $container$jscomp$46$$);
  $JSCompiler_StaticMethods_append_$$($JSCompiler_StaticMethods_installControls_$self$$, $overlay$jscomp$5$$);
  return $controls$$;
}, $JSCompiler_StaticMethods_getTargetFor_$$ = function($JSCompiler_StaticMethods_getTargetFor_$self$$, $posY_video$jscomp$45$$) {
  var $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$;
  if (!($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = $JSCompiler_StaticMethods_getTargetFor_$self$$.$V$)) {
    $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = $posY_video$jscomp$45$$.$getLayoutBox$();
    var $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$ = $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$.height;
    .98 > $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$.width / $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$ ? ($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = 
    $posY_video$jscomp$45$$.element, $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$ = $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$.tagName.toUpperCase(), _.$user$$module$src$log$$().error($TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$, 
    "Minimize-to-corner (`dock`) does not support portrait video.", $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$), $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = 
    !1) : $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = 320 <= $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_getTargetFor_$self$$) && $JSCompiler_StaticMethods_getTargetFor_$self$$.$viewport_$.$getSize$().height >= 0.7 * $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$;
    $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = !$$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$;
  }
  !($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ || 
  $JSCompiler_StaticMethods_getTargetFor_$self$$.$D$ && !($JSCompiler_StaticMethods_getTargetFor_$self$$.$D$ && $JSCompiler_StaticMethods_getTargetFor_$self$$.$D$.video == $posY_video$jscomp$45$$)) && ($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = !$JSCompiler_StaticMethods_getTargetFor_$self$$.$D$) && 
  ($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = (void 0 === $posY_video$jscomp$45$$ ? null : $posY_video$jscomp$45$$) || $JSCompiler_StaticMethods_getTargetFor_$self$$.$D$.video, $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = 
  "playing_manual" != $JSCompiler_StaticMethods_getTargetFor_$self$$.$manager_$().$getPlayingState$($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$));
  if ($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$) {
    return null;
  }
  if ($JSCompiler_StaticMethods_slotHasDimensions_$$($JSCompiler_StaticMethods_getTargetFor_$self$$)) {
    $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = $JSCompiler_StaticMethods_getSlotRelativeY_$$($JSCompiler_StaticMethods_getTargetFor_$self$$);
    var $$jscomp$inline_5158_bottom$jscomp$inline_5160$$ = $posY_video$jscomp$45$$.element.$I$().intersectionRect;
    $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$ = $$jscomp$inline_5158_bottom$jscomp$inline_5160$$.top;
    $$jscomp$inline_5158_bottom$jscomp$inline_5160$$ = $$jscomp$inline_5158_bottom$jscomp$inline_5160$$.bottom;
    var $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$ = $JSCompiler_StaticMethods_getFixedLayoutBox_$$($JSCompiler_StaticMethods_getTargetFor_$self$$, $JSCompiler_StaticMethods_getTargetFor_$self$$.$G$()), $slotTop$jscomp$inline_5162$$ = $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$.top;
    $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$ = $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$.height;
    $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$ = $JSCompiler_StaticMethods_getTargetFor_$self$$.$viewport_$.$getSize$().height - $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$ - $slotTop$jscomp$inline_5162$$;
    $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = 0 == $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ ? 
    $TAG$jscomp$inline_6550_height$jscomp$inline_5153_top$jscomp$inline_5159$$ <= $slotTop$jscomp$inline_5162$$ : $$jscomp$inline_5158_bottom$jscomp$inline_5160$$ >= $$jscomp$inline_5161_slotBottom$jscomp$inline_5164_slotHeight$jscomp$inline_5163$$;
  } else {
    $$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$ = !1;
  }
  if ($$jscomp$inline_5152_JSCompiler_inline_result$jscomp$1019_JSCompiler_inline_result$jscomp$1022_JSCompiler_temp$jscomp$1021_JSCompiler_temp$jscomp$5685_JSCompiler_temp$jscomp$5686_element$jscomp$inline_6549_relativeY$jscomp$inline_5157_video$jscomp$inline_6554$$) {
    return $JSCompiler_StaticMethods_getTargetFor_$self$$.$G$();
  }
  $posY_video$jscomp$45$$ = $JSCompiler_StaticMethods_maybeGetRelativeY_$$($JSCompiler_StaticMethods_getTargetFor_$self$$, $posY_video$jscomp$45$$);
  return null === $posY_video$jscomp$45$$ ? $posY_video$jscomp$45$$ : {$posY$:$posY_video$jscomp$45$$, $posX$:$JSCompiler_StaticMethods_getTargetFor_$self$$.$fa$};
}, $JSCompiler_StaticMethods_getFixedLayoutBox_$$ = function($JSCompiler_StaticMethods_getFixedLayoutBox_$self_dy$jscomp$21$$, $element$jscomp$661$$) {
  $JSCompiler_StaticMethods_getFixedLayoutBox_$self_dy$jscomp$21$$ = -_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_getFixedLayoutBox_$self_dy$jscomp$21$$.$viewport_$);
  return _.$moveLayoutRect$$module$src$layout_rect$$($element$jscomp$661$$.$getLayoutBox$(), 0, $JSCompiler_StaticMethods_getFixedLayoutBox_$self_dy$jscomp$21$$);
}, $JSCompiler_StaticMethods_slotHasDimensions_$$ = function($$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$) {
  if (!$$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$.$G$()) {
    return !1;
  }
  $$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$ = $JSCompiler_StaticMethods_getFixedLayoutBox_$$($$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$, $$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$.$G$());
  var $height$jscomp$69$$ = $$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$.height;
  return 0 < $$jscomp$destructuring$var568_JSCompiler_StaticMethods_slotHasDimensions_$self$$.width && 0 < $height$jscomp$69$$;
}, $JSCompiler_StaticMethods_updateOnResize_$$ = function($JSCompiler_StaticMethods_updateOnResize_$self$$, $video$jscomp$47$$) {
  $JSCompiler_StaticMethods_updateOnResize_$self$$.$ampdoc_$.$win$.requestAnimationFrame(function() {
    var $target$jscomp$190$$ = $JSCompiler_StaticMethods_getTargetFor_$$($JSCompiler_StaticMethods_updateOnResize_$self$$, $video$jscomp$47$$);
    $target$jscomp$190$$ ? $JSCompiler_StaticMethods_dock_$$($JSCompiler_StaticMethods_updateOnResize_$self$$, $video$jscomp$47$$, $target$jscomp$190$$, 1) : $JSCompiler_StaticMethods_updateOnResize_$self$$.$D$ && $JSCompiler_StaticMethods_updateOnResize_$self$$.$D$.video == $video$jscomp$47$$ && $JSCompiler_StaticMethods_undock_$$($JSCompiler_StaticMethods_updateOnResize_$self$$, $video$jscomp$47$$);
  });
}, $JSCompiler_StaticMethods_getRightEdge_$$ = function($JSCompiler_StaticMethods_getRightEdge_$self$$) {
  return $JSCompiler_StaticMethods_getRightEdge_$self$$.$viewport_$.$getSize$().width;
}, $JSCompiler_StaticMethods_maybeGetRelativeY_$$ = function($JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$, $video$jscomp$52$$) {
  if ($JSCompiler_StaticMethods_slotHasDimensions_$$($JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$)) {
    return null;
  }
  if ($JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$.$D$ && $JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$.$D$.video == $video$jscomp$52$$ && 1 != $JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$.$D$.target.nodeType) {
    return $JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$.$D$.target.$posY$;
  }
  $JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$ = $video$jscomp$52$$.element.$I$().intersectionRect;
  if (!$isSizedLayoutRect$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$) || 0 < $JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$.top) {
    return null;
  }
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking", "should dock at Y = TOP", {video:$video$jscomp$52$$, intersectionRect:$JSCompiler_StaticMethods_maybeGetRelativeY_$self_intersectionRect$jscomp$4$$});
  return 0;
}, $JSCompiler_StaticMethods_getSlotRelativeY_$$ = function($JSCompiler_StaticMethods_getSlotRelativeY_$self$$) {
  var $$jscomp$destructuring$var572_height$jscomp$71$$ = $JSCompiler_StaticMethods_getFixedLayoutBox_$$($JSCompiler_StaticMethods_getSlotRelativeY_$self$$, $JSCompiler_StaticMethods_getSlotRelativeY_$self$$.$G$()), $top$jscomp$22$$ = $$jscomp$destructuring$var572_height$jscomp$71$$.top;
  $$jscomp$destructuring$var572_height$jscomp$71$$ = $$jscomp$destructuring$var572_height$jscomp$71$$.height;
  return $JSCompiler_StaticMethods_getSlotRelativeY_$self$$.$viewport_$.$getSize$().height - $$jscomp$destructuring$var572_height$jscomp$71$$ - $top$jscomp$22$$ > $top$jscomp$22$$ ? 0 : 1;
}, $JSCompiler_StaticMethods_dockInTwoSteps_$$ = function($JSCompiler_StaticMethods_dockInTwoSteps_$self$$, $video$jscomp$55$$, $target$jscomp$193$$) {
  $JSCompiler_StaticMethods_dock_$$($JSCompiler_StaticMethods_dockInTwoSteps_$self$$, $video$jscomp$55$$, $target$jscomp$193$$, 0.1);
  (0,window.requestAnimationFrame)(function() {
    $JSCompiler_StaticMethods_dock_$$($JSCompiler_StaticMethods_dockInTwoSteps_$self$$, $video$jscomp$55$$, $target$jscomp$193$$, 1);
  });
}, $JSCompiler_StaticMethods_dock_$$ = function($JSCompiler_StaticMethods_dock_$self$$, $video$jscomp$56$$, $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$) {
  var $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ = $JSCompiler_StaticMethods_dock_$self$$.$D$;
  if (!($currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ && $targetsEqual$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$.target) && $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$.step >= $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$)) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking", "dock", {video:$video$jscomp$56$$, target:$$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, step:$JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$});
    ($currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ = $video$jscomp$56$$.element.querySelector(".i-amphtml-android-poster-bug")) && _.$removeElement$$module$src$dom$$($currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$);
    var $$jscomp$destructuring$var574_relativeX$$ = $JSCompiler_StaticMethods_getDims_$$($JSCompiler_StaticMethods_dock_$self$$, $video$jscomp$56$$, $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$);
    $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ = $$jscomp$destructuring$var574_relativeX$$.x;
    var $y$jscomp$87$$ = $$jscomp$destructuring$var574_relativeX$$.y, $scale$jscomp$13$$ = $$jscomp$destructuring$var574_relativeX$$.scale;
    $$jscomp$destructuring$var574_relativeX$$ = $$jscomp$destructuring$var574_relativeX$$.$relativeX$;
    $video$jscomp$56$$.$hideControls$();
    $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$enable$$($JSCompiler_StaticMethods_dock_$self$$.$F$());
    $JSCompiler_StaticMethods_placeAt_$$($JSCompiler_StaticMethods_dock_$self$$, $video$jscomp$56$$, $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$, $y$jscomp$87$$, $scale$jscomp$13$$, $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$, void 0, $$jscomp$destructuring$var574_relativeX$$);
    $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ = $JSCompiler_StaticMethods_dock_$self$$.$D$;
    $JSCompiler_StaticMethods_dock_$self$$.$D$ = {video:$video$jscomp$56$$, target:$$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, step:$JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$};
    $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$ && $targetsEqual$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$.target) && $currentlyDocked_el$jscomp$inline_5171_previouslyDocked$jscomp$inline_5177_x$jscomp$114$$.video == $video$jscomp$56$$ || ($$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$ = 
    $JSCompiler_StaticMethods_getTargetArea_$$($JSCompiler_StaticMethods_dock_$self$$, $video$jscomp$56$$, $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$), $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$ = _.$layoutRectLtwh$$module$src$layout_rect$$($$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$.x, $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$.y, $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$.$targetWidth$, 
    $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$.$targetHeight$), $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$ = $JSCompiler_StaticMethods_dock_$self$$.$F$(), $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$.$V$ = $$jscomp$inline_5178_target$jscomp$194_targetRect$jscomp$inline_5179$$, $JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$.$video_$ != $video$jscomp$56$$ && ($JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$.$video_$ = 
    $video$jscomp$56$$, $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$listen_$$($JSCompiler_StaticMethods_setVideo$self$jscomp$inline_6556_step$jscomp$3$$, $video$jscomp$56$$)), $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$$($JSCompiler_StaticMethods_dock_$self$$, "dock"));
  }
}, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$$ = function($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$, $action$jscomp$40$$) {
  var $element$jscomp$664$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$.$D$ && 1 == $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$.$D$.target.nodeType ? $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$.$G$() : $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$.$D$.video.element;
  $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$.$ampdoc_$.$win$, $action$jscomp$40$$, _.$dict$$module$src$utils$object$$({}));
  _.$Services$$module$src$services$actionServiceForDoc$$($element$jscomp$664$$).$trigger$($element$jscomp$664$$, $action$jscomp$40$$, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$self_event$jscomp$247$$, 1);
}, $JSCompiler_StaticMethods_placeAt_$$ = function($JSCompiler_StaticMethods_placeAt_$self$$, $video$jscomp$58$$, $x$jscomp$116$$, $y$jscomp$89$$, $scale$jscomp$15$$, $step$jscomp$5$$, $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$, $isPlacementRtl_opt_relativeX$$) {
  function $setTransitionTiming$$($JSCompiler_StaticMethods_placeAt_$self$$) {
    return _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_placeAt_$self$$, {"transition-duration":$transitionDurationMs$$ + "ms", "transition-timing-function":$transitionTiming$$});
  }
  function $maybeSetSizing$$($JSCompiler_StaticMethods_placeAt_$self$$, $video$jscomp$58$$) {
    $boxNeedsSizing$$ && (_.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_placeAt_$self$$, {width:_.$px$$module$src$style$$($width$jscomp$66$$), height:_.$px$$module$src$style$$($height$jscomp$73$$)}), $video$jscomp$58$$ && _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_placeAt_$self$$, {left:_.$px$$module$src$style$$($videoX$$), top:_.$px$$module$src$style$$($videoY$$)}));
  }
  if ($JSCompiler_StaticMethods_placeAt_$self$$.$I$ && $JSCompiler_StaticMethods_placeAt_$self$$.$I$.x == $x$jscomp$116$$ && $JSCompiler_StaticMethods_placeAt_$self$$.$I$.y == $y$jscomp$89$$ && $JSCompiler_StaticMethods_placeAt_$self$$.$I$.scale == $scale$jscomp$15$$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_placeAt_$self$$.$O$ = !0;
  var $transitionDurationMs$$ = _.$isFiniteNumber$$module$src$types$$($$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$) ? $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$ : $JSCompiler_StaticMethods_placeAt_$self$$.$D$ ? 300 * Math.abs($step$jscomp$5$$ - $JSCompiler_StaticMethods_placeAt_$self$$.$D$.step) : 0;
  $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$ = $video$jscomp$58$$.$getLayoutBox$();
  var $width$jscomp$66$$ = $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$.width, $height$jscomp$73$$ = $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$.height, $videoX$$ = $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$.x, $videoY$$ = $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$.y;
  $JSCompiler_StaticMethods_placeAt_$self$$.$I$ = {x:$x$jscomp$116$$, y:$y$jscomp$89$$, scale:$scale$jscomp$15$$};
  var $transitionTiming$$ = 0 < $step$jscomp$5$$ ? "ease-out" : "ease-in", $element$jscomp$666$$ = $video$jscomp$58$$.element, $internalElement$jscomp$1$$ = _.$getInternalVideoElementFor$$module$src$utils$video$$($element$jscomp$666$$), $shadowLayer$$ = $JSCompiler_StaticMethods_placeAt_$self$$.$U$(), $overlay$jscomp$6$$ = $JSCompiler_StaticMethods_placeAt_$self$$.$F$().$D$, $placeholderBackground$$ = $JSCompiler_StaticMethods_placeAt_$self$$.$P$(), $placeholderIcon$$ = $JSCompiler_StaticMethods_placeAt_$self$$.$R$().icon, 
  $hasRelativePlacement$$ = _.$isFiniteNumber$$module$src$types$$($isPlacementRtl_opt_relativeX$$);
  $isPlacementRtl_opt_relativeX$$ = 0 == $isPlacementRtl_opt_relativeX$$;
  $hasRelativePlacement$$ && ($applyBreakpointClassname$$module$extensions$amp_video_docking$0_1$breakpoints$$($placeholderIcon$$, $width$jscomp$66$$, $PLACEHOLDER_ICON_BREAKPOINTS$$module$extensions$amp_video_docking$0_1$amp_video_docking$$), $placeholderIcon$$.classList.toggle("amp-rtl", $isPlacementRtl_opt_relativeX$$));
  var $boxNeedsSizing$$ = $JSCompiler_StaticMethods_boxNeedsSizing_$$($JSCompiler_StaticMethods_placeAt_$self$$, $width$jscomp$66$$, $height$jscomp$73$$);
  $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$ = $placeholderIcon$$.classList.contains("amp-small");
  var $placeholderIconX$$ = ($isPlacementRtl_opt_relativeX$$ ? $calculateLeftJustifiedX$$module$extensions$amp_video_docking$0_1$math$$ : $calculateRightJustifiedX$$module$extensions$amp_video_docking$0_1$math$$)($width$jscomp$66$$, $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$ ? 32 : 48, $$jscomp$destructuring$var577_isSmallPlaceholderIcon_opt_transitionDurationMs$$ ? 20 : 40, $step$jscomp$5$$);
  $video$jscomp$58$$.$mutateElement$(function() {
    $internalElement$jscomp$1$$.classList.add("i-amphtml-video-docked");
    _.$setImportantStyles$$module$src$style$$($element$jscomp$666$$, {overflow:"visible"});
    _.$toggle$$module$src$style$$($shadowLayer$$, !0);
    _.$toggle$$module$src$style$$($overlay$jscomp$6$$, !0);
    $maybeSetSizing$$($placeholderBackground$$, !0);
    _.$setImportantStyles$$module$src$style$$($placeholderBackground$$, {opacity:$step$jscomp$5$$});
    $setTransitionTiming$$($placeholderBackground$$);
    $JSCompiler_StaticMethods_setPosterImage_$$($JSCompiler_StaticMethods_placeAt_$self$$, $video$jscomp$58$$);
    $setTransitionTiming$$($placeholderIcon$$);
    $hasRelativePlacement$$ && _.$setImportantStyles$$module$src$style$$($placeholderIcon$$, {transform:"translate(" + $placeholderIconX$$ + "px, 0px) scale(1)"});
    [_.$getInternalVideoElementFor$$module$src$utils$video$$($video$jscomp$58$$.element), $JSCompiler_StaticMethods_placeAt_$self$$.$U$(), $JSCompiler_StaticMethods_placeAt_$self$$.$F$().$D$].forEach(function($JSCompiler_StaticMethods_placeAt_$self$$) {
      _.$setImportantStyles$$module$src$style$$($JSCompiler_StaticMethods_placeAt_$self$$, {transform:"translate(" + $x$jscomp$116$$ + "px, " + $y$jscomp$89$$ + "px) scale(" + $scale$jscomp$15$$ + ")"});
      $setTransitionTiming$$($JSCompiler_StaticMethods_placeAt_$self$$);
      $maybeSetSizing$$($JSCompiler_StaticMethods_placeAt_$self$$);
    });
    _.$setImportantStyles$$module$src$style$$($shadowLayer$$, {opacity:$step$jscomp$5$$});
    $JSCompiler_StaticMethods_positionOnVsync$$($JSCompiler_StaticMethods_placeAt_$self$$.$F$(), $scale$jscomp$15$$, $x$jscomp$116$$, $y$jscomp$89$$, $width$jscomp$66$$, $height$jscomp$73$$);
  });
  return _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_placeAt_$self$$.$ampdoc_$.$win$).$promise$($transitionDurationMs$$).then(function() {
    $JSCompiler_StaticMethods_placeAt_$self$$.$O$ = !1;
  });
}, $JSCompiler_StaticMethods_setPosterImage_$$ = function($JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$, $element$jscomp$670_posterSrc_video$jscomp$61$$) {
  $element$jscomp$670_posterSrc_video$jscomp$61$$ = $element$jscomp$670_posterSrc_video$jscomp$61$$.element;
  $JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$ = $JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$.$R$().poster;
  $element$jscomp$670_posterSrc_video$jscomp$61$$.hasAttribute("poster") ? ($element$jscomp$670_posterSrc_video$jscomp$61$$ = $element$jscomp$670_posterSrc_video$jscomp$61$$.getAttribute("poster"), _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$, !0), _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$, {"background-image":"url(" + $element$jscomp$670_posterSrc_video$jscomp$61$$ + ")"})) : _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_setPosterImage_$self_placeholderPoster$$, 
  !1);
}, $JSCompiler_StaticMethods_boxNeedsSizing_$$ = function($JSCompiler_StaticMethods_boxNeedsSizing_$self$$, $width$jscomp$67$$, $height$jscomp$75$$) {
  var $needsSizing$$ = !$JSCompiler_StaticMethods_boxNeedsSizing_$self$$.$K$ || $JSCompiler_StaticMethods_boxNeedsSizing_$self$$.$K$.width != $width$jscomp$67$$ || $JSCompiler_StaticMethods_boxNeedsSizing_$self$$.$K$.height != $height$jscomp$75$$;
  $needsSizing$$ && ($JSCompiler_StaticMethods_boxNeedsSizing_$self$$.$K$ = {width:$width$jscomp$67$$, height:$height$jscomp$75$$});
  return $needsSizing$$;
}, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$$ = function($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$, $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$) {
  if ($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$ && !($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$ && 1 == $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$.target.nodeType || $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$O$)) {
    var $initialX$$ = $pointerCoords$$module$extensions$amp_video_docking$0_1$events$$($$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$).x, $offset$jscomp$27$$ = {x:0, y:0};
    $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$.target;
    var $currentPosX$$ = $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$.$posX$, $currentPosY$$ = $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$.$posY$;
    $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$ = $throttleByAnimationFrame$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$ampdoc_$.$win$, function($$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$) {
      var $onDragEnd$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$.target, $root$jscomp$92$$ = $onDragEnd$$.$posY$;
      if ($onDragEnd$$.$posX$ === $currentPosX$$ && $root$jscomp$92$$ === $currentPosY$$ && ($offset$jscomp$27$$.x = $pointerCoords$$module$extensions$amp_video_docking$0_1$events$$($$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$).x - $initialX$$, $offset$jscomp$27$$.y = 0, !(10 >= Math.sqrt(Math.pow($offset$jscomp$27$$.x, 2) + Math.pow($offset$jscomp$27$$.y, 2))))) {
        $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$.preventDefault();
        $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$.stopPropagation();
        $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$F$().$hide$(!1, !0);
        $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$V$ = !0;
        $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$disable$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$F$());
        $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$ = $offset$jscomp$27$$.x;
        $onDragEnd$$ = $offset$jscomp$27$$.y;
        $root$jscomp$92$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$.video;
        var $unlisteners$jscomp$5$$ = $JSCompiler_StaticMethods_getDims_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$, $root$jscomp$92$$, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$D$.target, 1), $e$jscomp$342_offsetX$jscomp$inline_6561$$ = $unlisteners$jscomp$5$$.x, $y$jscomp$inline_6566$$ = $unlisteners$jscomp$5$$.y;
        $unlisteners$jscomp$5$$ = $unlisteners$jscomp$5$$.scale;
        var $offsetRelativeX$jscomp$inline_6569$$ = $JSCompiler_StaticMethods_getCenter_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$, $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$, $onDragEnd$$).$centerX$ >= $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$) / 2 ? 1 : 0;
        $JSCompiler_StaticMethods_placeAt_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$, $root$jscomp$92$$, $e$jscomp$342_offsetX$jscomp$inline_6561$$ + $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$, $y$jscomp$inline_6566$$ + $onDragEnd$$, $unlisteners$jscomp$5$$, 1, 0, $offsetRelativeX$jscomp$inline_6569$$);
      }
    });
    var $onDragEnd$$ = function() {
      return $JSCompiler_StaticMethods_onDragEnd_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$, $unlisteners$jscomp$5$$, $offset$jscomp$27$$);
    }, $root$jscomp$92$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$.$ampdoc_$.getRootNode(), $unlisteners$jscomp$5$$ = [$JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$), $JSCompiler_StaticMethods_disableUserSelect_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$), 
    $JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$drag_$self$$), _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$92$$, "touchmove", $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$, void 0), _.$internalListenImplementation$$module$src$event_helper_listen$$($root$jscomp$92$$, "mousemove", $$jscomp$destructuring$var588_e$jscomp$341_onDragMove$$, 
    void 0), _.$listenOnce$$module$src$event_helper$$($root$jscomp$92$$, "touchend", $onDragEnd$$), _.$listenOnce$$module$src$event_helper$$($root$jscomp$92$$, "mouseup", $onDragEnd$$)];
  }
}, $JSCompiler_StaticMethods_disableUserSelect_$$ = function($JSCompiler_StaticMethods_disableUserSelect_$self$$) {
  var $docEl$$ = $JSCompiler_StaticMethods_disableUserSelect_$self$$.$ampdoc_$.getRootNode().documentElement;
  $docEl$$.classList.add("i-amphtml-select-disabled");
  return function() {
    return $docEl$$.classList.remove("i-amphtml-select-disabled");
  };
}, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$$ = function($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$self$$) {
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$self$$.$viewport_$);
  return $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$self$$.$viewport_$.$Viewport$$module$src$service$viewport$viewport_impl_prototype$resetScroll$.bind($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$disableScroll_$self$$.$viewport_$);
}, $JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$$ = function($JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$self$$) {
  function $handler$jscomp$65$$($JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$self$$) {
    return $JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$self$$.preventDefault();
  }
  var $win$jscomp$479$$ = $JSCompiler_StaticMethods_workaroundWebkitDragAndScrollIssue_$self$$.$ampdoc_$.$win$;
  if (!_.$JSCompiler_StaticMethods_isIos$$(_.$Services$$module$src$services$platformFor$$($win$jscomp$479$$))) {
    return function() {
    };
  }
  $win$jscomp$479$$.addEventListener("touchmove", $handler$jscomp$65$$, {passive:!1});
  return function() {
    return $win$jscomp$479$$.removeEventListener("touchmove", $handler$jscomp$65$$);
  };
}, $JSCompiler_StaticMethods_onDragEnd_$$ = function($JSCompiler_StaticMethods_onDragEnd_$self$$, $unlisteners$jscomp$6$$, $offset$jscomp$29$$) {
  $unlisteners$jscomp$6$$.forEach(function($JSCompiler_StaticMethods_onDragEnd_$self$$) {
    return $JSCompiler_StaticMethods_onDragEnd_$self$$.call();
  });
  $JSCompiler_StaticMethods_onDragEnd_$self$$.$V$ = !1;
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$enable$$($JSCompiler_StaticMethods_onDragEnd_$self$$.$F$());
  $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$$($JSCompiler_StaticMethods_onDragEnd_$self$$, $offset$jscomp$29$$.x, $offset$jscomp$29$$.y);
}, $JSCompiler_StaticMethods_getCenter_$$ = function($$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$, $offsetX$jscomp$21$$, $offsetY$jscomp$13$$) {
  var $$jscomp$destructuring$var591_width$jscomp$68$$ = $$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$.$D$, $scale$jscomp$18_target$jscomp$199$$ = $$jscomp$destructuring$var591_width$jscomp$68$$.target, $step$jscomp$8$$ = $$jscomp$destructuring$var591_width$jscomp$68$$.step, $video$jscomp$65$$ = $$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$.$D$.video, $$jscomp$destructuring$var592_height$jscomp$76$$ = $video$jscomp$65$$.$getLayoutBox$();
  $$jscomp$destructuring$var591_width$jscomp$68$$ = $$jscomp$destructuring$var592_height$jscomp$76$$.width;
  $$jscomp$destructuring$var592_height$jscomp$76$$ = $$jscomp$destructuring$var592_height$jscomp$76$$.height;
  $$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$ = $JSCompiler_StaticMethods_getDims_$$($$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$, $video$jscomp$65$$, $scale$jscomp$18_target$jscomp$199$$, $step$jscomp$8$$);
  $scale$jscomp$18_target$jscomp$199$$ = $$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$.scale;
  return {$centerX$:$$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$.x + $offsetX$jscomp$21$$ + $$jscomp$destructuring$var591_width$jscomp$68$$ * $scale$jscomp$18_target$jscomp$199$$ / 2, $centerY$:$$jscomp$destructuring$var593_JSCompiler_StaticMethods_getCenter_$self$$.y + $offsetY$jscomp$13$$ + $$jscomp$destructuring$var592_height$jscomp$76$$ * $scale$jscomp$18_target$jscomp$199$$ / 2};
}, $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$$ = function($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$, $offsetRelativeX$jscomp$1_offsetX$jscomp$22$$, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$) {
  var $video$jscomp$66$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$.$D$.video, $step$jscomp$9$$ = $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$.$D$.step;
  $offsetRelativeX$jscomp$1_offsetX$jscomp$22$$ = $JSCompiler_StaticMethods_getCenter_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$, $offsetRelativeX$jscomp$1_offsetX$jscomp$22$$, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$).$centerX$ >= $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$) / 
  2 ? 1 : 0;
  $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$ = {$posX$:$offsetRelativeX$jscomp$1_offsetX$jscomp$22$$, $posY$:0};
  $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$.$D$.target = $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$;
  $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$.$fa$ = $offsetRelativeX$jscomp$1_offsetX$jscomp$22$$;
  $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$ = $JSCompiler_StaticMethods_getDims_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$, $video$jscomp$66$$, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$, $step$jscomp$9$$);
  $JSCompiler_StaticMethods_placeAt_$$($JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$snap_$self$$, $video$jscomp$66$$, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$.x, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$.y, $$jscomp$destructuring$var596_offsetY$jscomp$14_target$jscomp$200$$.scale, $step$jscomp$9$$, 200, $offsetRelativeX$jscomp$1_offsetX$jscomp$22$$);
}, $JSCompiler_StaticMethods_getTargetArea_$$ = function($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$, $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$, $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$) {
  if (1 == $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.nodeType) {
    var $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ = $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$.$getLayoutBox$(), $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ = $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$.width;
    $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ = $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$.height;
    $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.$getLayoutBox$();
    var $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.width, $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.height, $left$jscomp$inline_5210$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.left;
    $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ = $JSCompiler_StaticMethods_getFixedLayoutBox_$$($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$, $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$.$G$());
    $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ = $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$.top;
    var $bottom$jscomp$inline_5213$$ = $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$.bottom;
    $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ / $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ > $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ / $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ ? ($$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ = 
    $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ / $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$, $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ + $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ / 2 - 
    $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ * $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ / 2, $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ = $left$jscomp$inline_5210$$) : ($$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ = 
    $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ / $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$, $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ = $left$jscomp$inline_5210$$ + $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ / 2 - $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ * 
    $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ / 2, $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$);
    $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$ = 0 == $JSCompiler_StaticMethods_getSlotRelativeY_$$($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$) ? $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ : $bottom$jscomp$inline_5213$$ - $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$;
    $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$ = {x:$aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$, y:$margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$, $targetWidth$:$naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ * $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$, 
    $targetHeight$:$$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ * $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$, $initialY$:$JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$};
  } else {
    $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.$posX$, $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.$posY$, $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ = 
    $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$.$getLayoutBox$(), $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.width, $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$ = $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$.height, 
    $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ = Math.min(30, 0.04 * $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$)), $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ = $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ / 
    $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$, $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ = Math.max(180, 0.3 * $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$)), $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$ = 
    $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ / $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$, $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ = 1 == $$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$ ? $JSCompiler_StaticMethods_getRightEdge_$$($JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$) - 
    $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ - $$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$ : $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$, $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ = 0 == $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ ? $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ : 
    $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$.$viewport_$.$getSize$().height - $margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$ - $aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$, $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$ = 
    $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$.$viewport_$.$getSize$().height, $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$ = {x:$$jscomp$inline_5204_naturalHeight$jscomp$inline_5206_posX$jscomp$inline_5221_x$jscomp$inline_5230$$, y:$margin$jscomp$inline_5226_slotWidth$jscomp$inline_5208_y$jscomp$inline_5215_y$jscomp$inline_5231$$, 
    $targetWidth$:$$jscomp$inline_5211_scale$jscomp$inline_5216_targetWidth$jscomp$inline_5228_video$jscomp$67_width$jscomp$inline_5224$$, $targetHeight$:$aspectRatio$jscomp$inline_5227_slotHeight$jscomp$inline_5209_targetHeight$jscomp$inline_5229_x$jscomp$inline_5214$$, $initialY$:0 == $naturalWidth$jscomp$inline_5205_posY$jscomp$inline_5222$$ ? 0 : $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$ - $$jscomp$inline_5207_$jscomp$inline_5223_height$jscomp$inline_5225_target$jscomp$201_top$jscomp$inline_5212$$};
  }
  return $JSCompiler_StaticMethods_getTargetArea_$self_JSCompiler_inline_result$jscomp$5689_JSCompiler_temp$jscomp$1027_targetBottom$jscomp$inline_6578$$;
}, $JSCompiler_StaticMethods_getDims_$$ = function($JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$, $video$jscomp$70$$, $$jscomp$destructuring$var602_target$jscomp$202$$, $step$jscomp$10$$) {
  var $$jscomp$destructuring$var601_width$jscomp$70$$ = $video$jscomp$70$$.$getLayoutBox$(), $currentX_left$jscomp$21$$ = $$jscomp$destructuring$var601_width$jscomp$70$$.left;
  $$jscomp$destructuring$var601_width$jscomp$70$$ = $$jscomp$destructuring$var601_width$jscomp$70$$.width;
  $$jscomp$destructuring$var602_target$jscomp$202$$ = $JSCompiler_StaticMethods_getTargetArea_$$($JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$, $video$jscomp$70$$, $$jscomp$destructuring$var602_target$jscomp$202$$);
  var $currentWidth_x$jscomp$124$$ = $$jscomp$destructuring$var602_target$jscomp$202$$.x, $relativeX$jscomp$1$$ = $currentWidth_x$jscomp$124$$ < $currentX_left$jscomp$21$$ ? 0 : 1;
  $currentX_left$jscomp$21$$ = _.$mapRange$$module$src$utils$math$$($step$jscomp$10$$, 0, 1, $currentX_left$jscomp$21$$, $currentWidth_x$jscomp$124$$);
  $currentWidth_x$jscomp$124$$ = _.$mapRange$$module$src$utils$math$$($step$jscomp$10$$, 0, 1, $$jscomp$destructuring$var601_width$jscomp$70$$, $$jscomp$destructuring$var602_target$jscomp$202$$.$targetWidth$);
  $JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$ = 1 == $JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$.$J$ || 0.02 < $step$jscomp$10$$ ? $$jscomp$destructuring$var602_target$jscomp$202$$.y : $JSCompiler_StaticMethods_getFixedLayoutBox_$$($JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$, $video$jscomp$70$$.element).top;
  return {x:$currentX_left$jscomp$21$$, y:_.$mapRange$$module$src$utils$math$$($step$jscomp$10$$, 0, 1, $$jscomp$destructuring$var602_target$jscomp$202$$.$initialY$, $JSCompiler_StaticMethods_getDims_$self_max$jscomp$inline_5236$$), scale:$currentWidth_x$jscomp$124$$ / $$jscomp$destructuring$var601_width$jscomp$70$$, $relativeX$:$relativeX$jscomp$1$$};
}, $JSCompiler_StaticMethods_undock_$$ = function($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking", "undock", {video:$video$jscomp$72$$});
  $JSCompiler_StaticMethods_Controls$$module$extensions$amp_video_docking$0_1$controls_prototype$disable$$($JSCompiler_StaticMethods_undock_$self$$.$F$());
  $JSCompiler_StaticMethods_undock_$self$$.$F$().$hide$(!1, !0);
  $JSCompiler_StaticMethods_VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking_prototype$trigger_$$($JSCompiler_StaticMethods_undock_$self$$, "undock");
  var $$jscomp$destructuring$var604$$ = $JSCompiler_StaticMethods_getDims_$$($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$, $JSCompiler_StaticMethods_undock_$self$$.$D$.target, 0);
  $JSCompiler_StaticMethods_placeAt_$$($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$, $$jscomp$destructuring$var604$$.x, $$jscomp$destructuring$var604$$.y, $$jscomp$destructuring$var604$$.scale, 0, void 0, $$jscomp$destructuring$var604$$.$relativeX$).then(function() {
    a: {
      if ($JSCompiler_StaticMethods_undock_$self$$.$I$) {
        var $$jscomp$destructuring$var604$$ = $JSCompiler_StaticMethods_undock_$self$$.$I$;
        var $JSCompiler_inline_result$jscomp$1025_x$jscomp$inline_5241$$ = $$jscomp$destructuring$var604$$.x;
        var $y$jscomp$inline_5242$$ = $$jscomp$destructuring$var604$$.y;
        $$jscomp$destructuring$var604$$ = $$jscomp$destructuring$var604$$.scale;
        var $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$ = $JSCompiler_StaticMethods_getFixedLayoutBox_$$($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$.element), $height$jscomp$inline_5245$$ = $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$.height;
        $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$ = $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$.top;
        if ($y$jscomp$inline_5242$$ != $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$ && !($$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$ < -($height$jscomp$inline_5245$$ - 0.7 * $height$jscomp$inline_5245$$))) {
          $JSCompiler_inline_result$jscomp$1025_x$jscomp$inline_5241$$ = $JSCompiler_StaticMethods_placeAt_$$($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$, $JSCompiler_inline_result$jscomp$1025_x$jscomp$inline_5241$$, $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$, $$jscomp$destructuring$var604$$, 0, Math.min(150, Math.abs($y$jscomp$inline_5242$$ - $$jscomp$inline_5244_fixedScrollTop$jscomp$inline_5246$$) / 2));
          break a;
        }
      }
      $JSCompiler_inline_result$jscomp$1025_x$jscomp$inline_5241$$ = void 0;
    }
    return $JSCompiler_inline_result$jscomp$1025_x$jscomp$inline_5241$$;
  }).then(function() {
    return $JSCompiler_StaticMethods_resetOnUndock_$$($JSCompiler_StaticMethods_undock_$self$$, $video$jscomp$72$$);
  });
}, $JSCompiler_StaticMethods_resetOnUndock_$$ = function($JSCompiler_StaticMethods_resetOnUndock_$self$$, $video$jscomp$73$$) {
  var $element$jscomp$672$$ = $video$jscomp$73$$.element, $internalElement$jscomp$2$$ = _.$getInternalVideoElementFor$$module$src$utils$video$$($element$jscomp$672$$);
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-video-docking", "resetOnUndock", {video:$video$jscomp$73$$});
  return $video$jscomp$73$$.$mutateElement$(function() {
    $video$jscomp$73$$.$showControls$();
    $internalElement$jscomp$2$$.classList.remove("i-amphtml-video-docked");
    var $shadowLayer$jscomp$1$$ = $JSCompiler_StaticMethods_resetOnUndock_$self$$.$U$(), $placeholderIcon$jscomp$1$$ = $JSCompiler_StaticMethods_resetOnUndock_$self$$.$R$().icon, $placeholderBackground$jscomp$1$$ = $JSCompiler_StaticMethods_resetOnUndock_$self$$.$P$();
    _.$toggle$$module$src$style$$($shadowLayer$jscomp$1$$, !1);
    $JSCompiler_StaticMethods_resetOnUndock_$self$$.$F$().reset();
    [$element$jscomp$672$$, $internalElement$jscomp$2$$, $shadowLayer$jscomp$1$$, $placeholderBackground$jscomp$1$$, $placeholderIcon$jscomp$1$$].forEach(function($JSCompiler_StaticMethods_resetOnUndock_$self$$) {
      _.$resetStyles$$module$src$style$$($JSCompiler_StaticMethods_resetOnUndock_$self$$, "transform transition width height opacity overflow".split(" "));
    });
    $JSCompiler_StaticMethods_resetOnUndock_$self$$.$I$ = null;
    $JSCompiler_StaticMethods_resetOnUndock_$self$$.$K$ = null;
    $JSCompiler_StaticMethods_resetOnUndock_$self$$.$D$ = null;
  });
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$$.prototype.$isMuted$ = _.$JSCompiler_unstubMethod$$(51, function() {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("video-service", "isMuted is not implemented");
  return !1;
});
_.$VideoManager$$module$src$service$video_manager_impl$$.prototype.$isMuted$ = _.$JSCompiler_unstubMethod$$(50, function($video$jscomp$15$$) {
  return _.$JSCompiler_StaticMethods_getEntryForVideo_$$(this, $video$jscomp$15$$).$isMuted$();
});
_.$VideoEntry$$module$src$service$video_manager_impl$$.prototype.$isMuted$ = _.$JSCompiler_unstubMethod$$(49, function() {
  return this.$muted_$;
});
$Timeout$$module$extensions$amp_video_docking$0_1$timeout$$.prototype.$trigger$ = function($time$jscomp$37$$, $args$jscomp$60$$) {
  for (var $$jscomp$restParams$jscomp$5$$ = [], $$jscomp$restIndex$jscomp$5$$ = 1; $$jscomp$restIndex$jscomp$5$$ < arguments.length; ++$$jscomp$restIndex$jscomp$5$$) {
    $$jscomp$restParams$jscomp$5$$[$$jscomp$restIndex$jscomp$5$$ - 1] = arguments[$$jscomp$restIndex$jscomp$5$$];
  }
  var $$jscomp$this$jscomp$1283$$ = this;
  this.cancel();
  this.$D$ = this.$timer_$.delay(function() {
    return $$jscomp$this$jscomp$1283$$.$F$.apply(null, $$jscomp$restParams$jscomp$5$$);
  }, $time$jscomp$37$$);
};
$Timeout$$module$extensions$amp_video_docking$0_1$timeout$$.prototype.cancel = function() {
  null !== this.$D$ && (this.$timer_$.cancel(this.$D$), this.$D$ = null);
};
var $_template$$module$extensions$amp_video_docking$0_1$controls$$ = ["<div class=i-amphtml-video-docked-overlay hidden></div>"], $_template2$$module$extensions$amp_video_docking$0_1$controls$$ = ["<div class=amp-video-docked-controls hidden><div class=amp-video-docked-main-button-group><div class=amp-video-docked-button-group><div role=button ref=playButton class=amp-video-docked-play></div><div role=button ref=pauseButton class=amp-video-docked-pause></div></div><div class=amp-video-docked-button-group><div role=button ref=muteButton class=amp-video-docked-mute></div><div role=button ref=unmuteButton class=amp-video-docked-unmute></div></div><div class=amp-video-docked-button-group><div role=button ref=fullscreenButton class=amp-video-docked-fullscreen></div></div></div><div class=amp-video-docked-button-dismiss-group ref=dismissContainer><div role=button ref=dismissButton class=amp-video-docked-dismiss></div></div></div>"], 
$BREAKPOINTS$$module$extensions$amp_video_docking$0_1$controls$$ = [{className:"amp-small", minWidth:0}, {className:"amp-large", minWidth:300}];
$Controls$$module$extensions$amp_video_docking$0_1$controls$$.prototype.$unlisten_$ = function() {
  for (; 0 < this.$U$.length;) {
    this.$U$.pop().call();
  }
};
$Controls$$module$extensions$amp_video_docking$0_1$controls$$.prototype.$hide$ = function($opt_respectSticky$$, $opt_immediately$$) {
  var $container$jscomp$44$$ = this.container, $overlay$jscomp$3$$ = this.$D$;
  !$container$jscomp$44$$.classList.contains("amp-video-docked-controls-shown") || $opt_respectSticky$$ && this.$R$ || ($opt_immediately$$ && (_.$toggle$$module$src$style$$($container$jscomp$44$$, !1), _.$toggle$$module$src$style$$($overlay$jscomp$3$$, !1)), $overlay$jscomp$3$$.classList.remove("amp-video-docked-controls-bg"), $container$jscomp$44$$.classList.remove("amp-video-docked-controls-shown"));
};
$Controls$$module$extensions$amp_video_docking$0_1$controls$$.prototype.reset = function() {
  var $i$360_overlay$jscomp$4$$ = this.$D$, $els$jscomp$2$$ = [$i$360_overlay$jscomp$4$$, this.container];
  _.$toggle$$module$src$style$$($i$360_overlay$jscomp$4$$, !1);
  this.$hide$();
  for ($i$360_overlay$jscomp$4$$ = 0; $i$360_overlay$jscomp$4$$ < $els$jscomp$2$$.length; $i$360_overlay$jscomp$4$$++) {
    _.$resetStyles$$module$src$style$$($els$jscomp$2$$[$i$360_overlay$jscomp$4$$], ["transform", "transition", "width", "height"]);
  }
};
var $_template$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = ["<div class=amp-video-docked-shadow hidden></div>"], $_template2$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = ["<div class=amp-video-docked-placeholder-background><div class=amp-video-docked-placeholder-background-poster ref=poster></div><div class=amp-video-docked-placeholder-icon ref=icon></div></div>"], $PLACEHOLDER_ICON_BREAKPOINTS$$module$extensions$amp_video_docking$0_1$amp_video_docking$$ = [{className:"amp-small", 
minWidth:0}, {className:"amp-large", minWidth:420}];
$VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking$$.prototype.register = function($video$jscomp$43$$) {
  var $$jscomp$this$jscomp$1294$$ = this;
  this.$ga$();
  var $element$jscomp$656$$ = $video$jscomp$43$$.element;
  if (this.$ba$) {
    var $JSCompiler_inline_result$jscomp$1018$$ = this.$ba$;
  } else {
    _.$installPositionObserverServiceForDoc$$module$src$service$position_observer$position_observer_impl$$(this.$ampdoc_$), $JSCompiler_inline_result$jscomp$1018$$ = _.$getServiceForDoc$$module$src$service$$(this.$ampdoc_$, "position-observer");
  }
  $JSCompiler_inline_result$jscomp$1018$$.observe($element$jscomp$656$$, 1, function() {
    if (!$$jscomp$this$jscomp$1294$$.$O$) {
      if (1 == $$jscomp$this$jscomp$1294$$.$J$) {
        var $element$jscomp$656$$ = $JSCompiler_StaticMethods_getTargetFor_$$($$jscomp$this$jscomp$1294$$, $video$jscomp$43$$);
        if ($element$jscomp$656$$) {
          var $JSCompiler_inline_result$jscomp$1018$$;
          if (!($JSCompiler_inline_result$jscomp$1018$$ = $$jscomp$this$jscomp$1294$$.$ea$ != $video$jscomp$43$$) && ($JSCompiler_inline_result$jscomp$1018$$ = null !== $$jscomp$this$jscomp$1294$$.$W$)) {
            $JSCompiler_inline_result$jscomp$1018$$ = $$jscomp$this$jscomp$1294$$.$W$;
            var $direction$jscomp$inline_6815$$ = $$jscomp$this$jscomp$1294$$.$J$;
            $JSCompiler_inline_result$jscomp$1018$$ = !(0 == $JSCompiler_inline_result$jscomp$1018$$ && 1 == $direction$jscomp$inline_6815$$ || 1 == $JSCompiler_inline_result$jscomp$1018$$ && -1 == $direction$jscomp$inline_6815$$);
          }
          $JSCompiler_inline_result$jscomp$1018$$ ? $JSCompiler_inline_result$jscomp$1018$$ = !1 : ($$jscomp$this$jscomp$1294$$.$isVisible_$($video$jscomp$43$$.element, 0.02) && ($$jscomp$this$jscomp$1294$$.$ea$ = null, $$jscomp$this$jscomp$1294$$.$W$ = null), $JSCompiler_inline_result$jscomp$1018$$ = !0);
          $JSCompiler_inline_result$jscomp$1018$$ || $$jscomp$this$jscomp$1294$$.$D$ || $JSCompiler_StaticMethods_dockInTwoSteps_$$($$jscomp$this$jscomp$1294$$, $video$jscomp$43$$, $element$jscomp$656$$);
        }
      } else {
        -1 == $$jscomp$this$jscomp$1294$$.$J$ && $$jscomp$this$jscomp$1294$$.$D$ && ($element$jscomp$656$$ = $$jscomp$this$jscomp$1294$$.$D$.video, $$jscomp$this$jscomp$1294$$.$isVisible_$($element$jscomp$656$$.element, 0.7) && $JSCompiler_StaticMethods_undock_$$($$jscomp$this$jscomp$1294$$, $element$jscomp$656$$));
      }
    }
  });
  this.$aa$.push($video$jscomp$43$$);
};
$VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking$$.prototype.registerElement = function($element$jscomp$657$$) {
  var $$jscomp$this$jscomp$1295$$ = this;
  $element$jscomp$657$$.$getImpl$().then(function($element$jscomp$657$$) {
    return $$jscomp$this$jscomp$1295$$.register($element$jscomp$657$$);
  });
};
$VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking$$.prototype.$isVisible_$ = function($JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$, $minRatio$jscomp$1$$) {
  $minRatio$jscomp$1$$ = void 0 === $minRatio$jscomp$1$$ ? 1 : $minRatio$jscomp$1$$;
  var $target$jscomp$inline_5183_top$jscomp$inline_5185$$ = $JSCompiler_StaticMethods_slotHasDimensions_$$(this) ? this.$G$() : null;
  $target$jscomp$inline_5183_top$jscomp$inline_5185$$ = void 0 === $target$jscomp$inline_5183_top$jscomp$inline_5185$$ ? null : $target$jscomp$inline_5183_top$jscomp$inline_5185$$;
  if (null != $target$jscomp$inline_5183_top$jscomp$inline_5185$$ && 1 == $target$jscomp$inline_5183_top$jscomp$inline_5185$$.nodeType) {
    $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$ = $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$.$getLayoutBox$();
    $target$jscomp$inline_5183_top$jscomp$inline_5185$$ = $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$.top;
    var $bottom$jscomp$inline_5186$$ = $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$.bottom, $height$jscomp$inline_5187$$ = $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$.height, $$jscomp$inline_5188_slotBottom$jscomp$inline_5190$$ = this.$G$().$getLayoutBox$(), $slotTop$jscomp$inline_5189$$ = $$jscomp$inline_5188_slotBottom$jscomp$inline_5190$$.top;
    $$jscomp$inline_5188_slotBottom$jscomp$inline_5190$$ = $$jscomp$inline_5188_slotBottom$jscomp$inline_5190$$.bottom;
    $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$ = $isSizedLayoutRect$$module$extensions$amp_video_docking$0_1$amp_video_docking$$($JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$) ? 0 == $JSCompiler_StaticMethods_getSlotRelativeY_$$(this) ? ($bottom$jscomp$inline_5186$$ - Math.max($target$jscomp$inline_5183_top$jscomp$inline_5185$$, $slotTop$jscomp$inline_5189$$)) / $height$jscomp$inline_5187$$ : ($$jscomp$inline_5188_slotBottom$jscomp$inline_5190$$ - 
    $target$jscomp$inline_5183_top$jscomp$inline_5185$$) / $height$jscomp$inline_5187$$ : 0;
  } else {
    $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$ = $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$.$I$().intersectionRatio;
  }
  return $JSCompiler_inline_result$jscomp$1024_element$jscomp$671_layoutBox$jscomp$inline_5184$$ > $minRatio$jscomp$1$$ - 0.02;
};
window.self.AMP.registerServiceForDoc("video-docking", $VideoDocking$$module$extensions$amp_video_docking$0_1$amp_video_docking$$);

})});
