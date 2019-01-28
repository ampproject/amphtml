(self.AMP=self.AMP||[]).push({n:"amp-animation",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $installWebAnimations$$module$web_animations_js$web_animations_install$$ = function($window$jscomp$28$$) {
  var $document$jscomp$7$$ = $window$jscomp$28$$.document;
  !function($a$jscomp$13$$, $b$jscomp$14$$) {
    var $c$jscomp$7$$ = {}, $d$jscomp$2$$ = {};
    !function($window$jscomp$28$$) {
      function $a$jscomp$13$$($window$jscomp$28$$) {
        return $window$jscomp$28$$;
      }
      function $b$jscomp$14$$() {
        this.$_endDelay$ = this.$_delay$ = 0;
        this.$_fill$ = "none";
        this.$_iterationStart$ = 0;
        this.$_iterations$ = 1;
        this.$_duration$ = 0;
        this.$_playbackRate$ = 1;
        this.$_direction$ = "normal";
        this.$_easing$ = "linear";
        this.$_easingFunction$ = $a$jscomp$13$$;
      }
      function $c$jscomp$7$$() {
        return $window$jscomp$28$$.$isDeprecated$("Invalid timing inputs", "2016-03-02", "TypeError exceptions will be thrown instead.", !0);
      }
      function $d$jscomp$2$$($document$jscomp$7$$, $a$jscomp$13$$) {
        var $c$jscomp$7$$ = new $b$jscomp$14$$;
        return $a$jscomp$13$$ && ($c$jscomp$7$$.fill = "both", $c$jscomp$7$$.duration = "auto"), "number" != typeof $document$jscomp$7$$ || (0,window.isNaN)($document$jscomp$7$$) ? void 0 !== $document$jscomp$7$$ && Object.getOwnPropertyNames($document$jscomp$7$$).forEach(function($a$jscomp$13$$) {
          "auto" == $document$jscomp$7$$[$a$jscomp$13$$] || ("number" == typeof $c$jscomp$7$$[$a$jscomp$13$$] || "duration" == $a$jscomp$13$$) && ("number" != typeof $document$jscomp$7$$[$a$jscomp$13$$] || (0,window.isNaN)($document$jscomp$7$$[$a$jscomp$13$$])) || "fill" == $a$jscomp$13$$ && -1 == $v$jscomp$9$$.indexOf($document$jscomp$7$$[$a$jscomp$13$$]) || "direction" == $a$jscomp$13$$ && -1 == $w$jscomp$13$$.indexOf($document$jscomp$7$$[$a$jscomp$13$$]) || "playbackRate" == $a$jscomp$13$$ && 
          1 !== $document$jscomp$7$$[$a$jscomp$13$$] && $window$jscomp$28$$.$isDeprecated$("AnimationEffectTiming.playbackRate", "2014-11-28", "Use Animation.playbackRate instead.") || ($c$jscomp$7$$[$a$jscomp$13$$] = $document$jscomp$7$$[$a$jscomp$13$$]);
        }) : $c$jscomp$7$$.duration = $document$jscomp$7$$, $c$jscomp$7$$;
      }
      function $a$jscomp$14$$($window$jscomp$28$$, $document$jscomp$7$$, $b$jscomp$14$$, $c$jscomp$7$$) {
        return 0 > $window$jscomp$28$$ || 1 < $window$jscomp$28$$ || 0 > $b$jscomp$14$$ || 1 < $b$jscomp$14$$ ? $a$jscomp$13$$ : function($a$jscomp$13$$) {
          if (0 >= $a$jscomp$13$$) {
            var $d$jscomp$2$$ = 0;
            return 0 < $window$jscomp$28$$ ? $d$jscomp$2$$ = $document$jscomp$7$$ / $window$jscomp$28$$ : !$document$jscomp$7$$ && 0 < $b$jscomp$14$$ && ($d$jscomp$2$$ = $c$jscomp$7$$ / $b$jscomp$14$$), $d$jscomp$2$$ * $a$jscomp$13$$;
          }
          if (1 <= $a$jscomp$13$$) {
            return $d$jscomp$2$$ = 0, 1 > $b$jscomp$14$$ ? $d$jscomp$2$$ = ($c$jscomp$7$$ - 1) / ($b$jscomp$14$$ - 1) : 1 == $b$jscomp$14$$ && 1 > $window$jscomp$28$$ && ($d$jscomp$2$$ = ($document$jscomp$7$$ - 1) / ($window$jscomp$28$$ - 1)), 1 + $d$jscomp$2$$ * ($a$jscomp$13$$ - 1);
          }
          $d$jscomp$2$$ = 0;
          for (var $a$jscomp$14$$ = 1; $d$jscomp$2$$ < $a$jscomp$14$$;) {
            var $x$jscomp$88$$ = ($d$jscomp$2$$ + $a$jscomp$14$$) / 2, $d$jscomp$3$$ = 3 * $window$jscomp$28$$ * (1 - $x$jscomp$88$$) * (1 - $x$jscomp$88$$) * $x$jscomp$88$$ + 3 * $b$jscomp$14$$ * (1 - $x$jscomp$88$$) * $x$jscomp$88$$ * $x$jscomp$88$$ + $x$jscomp$88$$ * $x$jscomp$88$$ * $x$jscomp$88$$;
            if (1e-5 > Math.abs($a$jscomp$13$$ - $d$jscomp$3$$)) {
              break;
            }
            $d$jscomp$3$$ < $a$jscomp$13$$ ? $d$jscomp$2$$ = $x$jscomp$88$$ : $a$jscomp$14$$ = $x$jscomp$88$$;
          }
          return 3 * $document$jscomp$7$$ * (1 - $x$jscomp$88$$) * (1 - $x$jscomp$88$$) * $x$jscomp$88$$ + 3 * $c$jscomp$7$$ * (1 - $x$jscomp$88$$) * $x$jscomp$88$$ * $x$jscomp$88$$ + $x$jscomp$88$$ * $x$jscomp$88$$ * $x$jscomp$88$$;
        };
      }
      function $j$jscomp$6$$($window$jscomp$28$$, $document$jscomp$7$$) {
        return function($a$jscomp$13$$) {
          if (1 <= $a$jscomp$13$$) {
            return 1;
          }
          var $b$jscomp$14$$ = 1 / $window$jscomp$28$$;
          return ($a$jscomp$13$$ += $document$jscomp$7$$ * $b$jscomp$14$$) - $a$jscomp$13$$ % $b$jscomp$14$$;
        };
      }
      function $k$jscomp$27$$($window$jscomp$28$$) {
        $C$$ || ($C$$ = $document$jscomp$7$$.createElement("div").style);
        $C$$.$animationTimingFunction$ = "";
        $C$$.$animationTimingFunction$ = $window$jscomp$28$$;
        var $a$jscomp$13$$ = $C$$.$animationTimingFunction$;
        if ("" == $a$jscomp$13$$ && $c$jscomp$7$$()) {
          throw new TypeError($window$jscomp$28$$ + " is not a valid value for easing");
        }
        return $a$jscomp$13$$;
      }
      function $l$jscomp$7$$($window$jscomp$28$$) {
        if ("linear" == $window$jscomp$28$$) {
          return $a$jscomp$13$$;
        }
        var $document$jscomp$7$$ = $E$$.exec($window$jscomp$28$$);
        return $document$jscomp$7$$ ? $a$jscomp$14$$.apply(this, $document$jscomp$7$$.slice(1).map(Number)) : ($document$jscomp$7$$ = $F$$.exec($window$jscomp$28$$)) ? $j$jscomp$6$$(Number($document$jscomp$7$$[1]), {start:$y$jscomp$65$$, $middle$:$z$jscomp$11$$, end:$A$$}[$document$jscomp$7$$[2]]) : $B$$[$window$jscomp$28$$] || $a$jscomp$13$$;
      }
      function $o$jscomp$9$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$) {
        if (null == $document$jscomp$7$$) {
          return $G$$;
        }
        var $b$jscomp$14$$ = $a$jscomp$13$$.delay + $window$jscomp$28$$ + $a$jscomp$13$$.endDelay;
        return $document$jscomp$7$$ < Math.min($a$jscomp$13$$.delay, $b$jscomp$14$$) ? $H$$ : $document$jscomp$7$$ >= Math.min($a$jscomp$13$$.delay + $window$jscomp$28$$, $b$jscomp$14$$) ? $I$$ : $J$$;
      }
      var $v$jscomp$9$$ = ["backwards", "forwards", "both", "none"], $w$jscomp$13$$ = ["reverse", "alternate", "alternate-reverse"];
      $b$jscomp$14$$.prototype = {$_setMember$:function($document$jscomp$7$$, $a$jscomp$13$$) {
        this["_" + $document$jscomp$7$$] = $a$jscomp$13$$;
        this.$_effect$ && (this.$_effect$.$_timingInput$[$document$jscomp$7$$] = $a$jscomp$13$$, this.$_effect$.$_timing$ = $window$jscomp$28$$.$normalizeTimingInput$(this.$_effect$.$_timingInput$), this.$_effect$.$activeDuration$ = $window$jscomp$28$$.$calculateActiveDuration$(this.$_effect$.$_timing$), this.$_effect$.$_animation$ && this.$_effect$.$_animation$.$_rebuildUnderlyingAnimation$());
      }, get playbackRate() {
        return this.$_playbackRate$;
      }, set delay($window$jscomp$28$$) {
        this.$_setMember$("delay", $window$jscomp$28$$);
      }, get delay() {
        return this.$_delay$;
      }, set endDelay($window$jscomp$28$$) {
        this.$_setMember$("endDelay", $window$jscomp$28$$);
      }, get endDelay() {
        return this.$_endDelay$;
      }, set fill($window$jscomp$28$$) {
        this.$_setMember$("fill", $window$jscomp$28$$);
      }, get fill() {
        return this.$_fill$;
      }, set iterationStart($window$jscomp$28$$) {
        if (((0,window.isNaN)($window$jscomp$28$$) || 0 > $window$jscomp$28$$) && $c$jscomp$7$$()) {
          throw new TypeError("iterationStart must be a non-negative number, received: " + window.timing.iterationStart);
        }
        this.$_setMember$("iterationStart", $window$jscomp$28$$);
      }, get iterationStart() {
        return this.$_iterationStart$;
      }, set duration($window$jscomp$28$$) {
        if ("auto" != $window$jscomp$28$$ && ((0,window.isNaN)($window$jscomp$28$$) || 0 > $window$jscomp$28$$) && $c$jscomp$7$$()) {
          throw new TypeError("duration must be non-negative or auto, received: " + $window$jscomp$28$$);
        }
        this.$_setMember$("duration", $window$jscomp$28$$);
      }, get duration() {
        return this.$_duration$;
      }, set direction($window$jscomp$28$$) {
        this.$_setMember$("direction", $window$jscomp$28$$);
      }, get direction() {
        return this.$_direction$;
      }, set easing($window$jscomp$28$$) {
        this.$_easingFunction$ = $l$jscomp$7$$($k$jscomp$27$$($window$jscomp$28$$));
        this.$_setMember$("easing", $window$jscomp$28$$);
      }, get easing() {
        return this.$_easing$;
      }, set iterations($window$jscomp$28$$) {
        if (((0,window.isNaN)($window$jscomp$28$$) || 0 > $window$jscomp$28$$) && $c$jscomp$7$$()) {
          throw new TypeError("iterations must be non-negative, received: " + $window$jscomp$28$$);
        }
        this.$_setMember$("iterations", $window$jscomp$28$$);
      }, get iterations() {
        return this.$_iterations$;
      }};
      var $y$jscomp$65$$ = 1, $z$jscomp$11$$ = .5, $A$$ = 0, $B$$ = {$ease$:$a$jscomp$14$$(.25, .1, .25, 1), "ease-in":$a$jscomp$14$$(.42, 0, 1, 1), "ease-out":$a$jscomp$14$$(0, 0, .58, 1), "ease-in-out":$a$jscomp$14$$(.42, 0, .58, 1), "step-start":$j$jscomp$6$$(1, $y$jscomp$65$$), "step-middle":$j$jscomp$6$$(1, $z$jscomp$11$$), "step-end":$j$jscomp$6$$(1, $A$$)}, $C$$ = null, $E$$ = /cubic-bezier\(\s*(-?\d+\.?\d*|-?\.\d+)\s*,\s*(-?\d+\.?\d*|-?\.\d+)\s*,\s*(-?\d+\.?\d*|-?\.\d+)\s*,\s*(-?\d+\.?\d*|-?\.\d+)\s*\)/, 
      $F$$ = /steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/, $G$$ = 0, $H$$ = 1, $I$$ = 2, $J$$ = 3;
      $window$jscomp$28$$.$cloneTimingInput$ = function($window$jscomp$28$$) {
        if ("number" == typeof $window$jscomp$28$$) {
          return $window$jscomp$28$$;
        }
        var $document$jscomp$7$$ = {}, $a$jscomp$13$$;
        for ($a$jscomp$13$$ in $window$jscomp$28$$) {
          $document$jscomp$7$$[$a$jscomp$13$$] = $window$jscomp$28$$[$a$jscomp$13$$];
        }
        return $document$jscomp$7$$;
      };
      $window$jscomp$28$$.$makeTiming$ = $d$jscomp$2$$;
      $window$jscomp$28$$.$numericTimingToObject$ = function($window$jscomp$28$$) {
        return "number" == typeof $window$jscomp$28$$ && ($window$jscomp$28$$ = (0,window.isNaN)($window$jscomp$28$$) ? {duration:0} : {duration:$window$jscomp$28$$}), $window$jscomp$28$$;
      };
      $window$jscomp$28$$.$normalizeTimingInput$ = function($document$jscomp$7$$) {
        return $document$jscomp$7$$ = $window$jscomp$28$$.$numericTimingToObject$($document$jscomp$7$$), $d$jscomp$2$$($document$jscomp$7$$, void 0);
      };
      $window$jscomp$28$$.$calculateActiveDuration$ = function($window$jscomp$28$$) {
        return Math.abs((0 === $window$jscomp$28$$.duration || 0 === $window$jscomp$28$$.iterations ? 0 : $window$jscomp$28$$.duration * $window$jscomp$28$$.iterations) / $window$jscomp$28$$.playbackRate);
      };
      $window$jscomp$28$$.$calculateIterationProgress$ = function($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$) {
        var $b$jscomp$14$$ = $o$jscomp$9$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$);
        a: {
          var $c$jscomp$7$$ = $a$jscomp$13$$.fill;
          switch($b$jscomp$14$$) {
            case $H$$:
              $document$jscomp$7$$ = "backwards" == $c$jscomp$7$$ || "both" == $c$jscomp$7$$ ? 0 : null;
              break a;
            case $J$$:
              $document$jscomp$7$$ -= $a$jscomp$13$$.delay;
              break a;
            case $I$$:
              $document$jscomp$7$$ = "forwards" == $c$jscomp$7$$ || "both" == $c$jscomp$7$$ ? $window$jscomp$28$$ : null;
              break a;
            case $G$$:
              $document$jscomp$7$$ = null;
              break a;
          }
          $document$jscomp$7$$ = void 0;
        }
        if (null === $document$jscomp$7$$) {
          return null;
        }
        $window$jscomp$28$$ = $a$jscomp$13$$.duration;
        $c$jscomp$7$$ = $a$jscomp$13$$.iterationStart;
        $window$jscomp$28$$ = (0 === $window$jscomp$28$$ ? $b$jscomp$14$$ !== $H$$ && ($c$jscomp$7$$ += $a$jscomp$13$$.iterations) : $c$jscomp$7$$ += $document$jscomp$7$$ / $window$jscomp$28$$, $c$jscomp$7$$);
        $c$jscomp$7$$ = $window$jscomp$28$$ === 1 / 0 ? $a$jscomp$13$$.iterationStart % 1 : $window$jscomp$28$$ % 1;
        $document$jscomp$7$$ = (0 !== $c$jscomp$7$$ || $b$jscomp$14$$ !== $I$$ || 0 === $a$jscomp$13$$.iterations || 0 === $document$jscomp$7$$ && 0 !== $a$jscomp$13$$.duration || ($c$jscomp$7$$ = 1), $c$jscomp$7$$);
        var $d$jscomp$2$$ = $c$jscomp$7$$ = $a$jscomp$13$$.direction;
        "normal" !== $c$jscomp$7$$ && "reverse" !== $c$jscomp$7$$ && ($b$jscomp$14$$ = $b$jscomp$14$$ === $I$$ && $a$jscomp$13$$.iterations === 1 / 0 ? 1 / 0 : 1 === $document$jscomp$7$$ ? Math.floor($window$jscomp$28$$) - 1 : Math.floor($window$jscomp$28$$), "alternate-reverse" === $c$jscomp$7$$ && ($b$jscomp$14$$ += 1), $d$jscomp$2$$ = "normal", $b$jscomp$14$$ !== 1 / 0 && 0 != $b$jscomp$14$$ % 2 && ($d$jscomp$2$$ = "reverse"));
        return $a$jscomp$13$$.$_easingFunction$("normal" === $d$jscomp$2$$ ? $document$jscomp$7$$ : 1 - $document$jscomp$7$$);
      };
      $window$jscomp$28$$.$calculatePhase$ = $o$jscomp$9$$;
      $window$jscomp$28$$.$normalizeEasing$ = $k$jscomp$27$$;
      $window$jscomp$28$$.$parseEasingFunction$ = $l$jscomp$7$$;
    }($c$jscomp$7$$);
    (function($a$jscomp$13$$) {
      function $b$jscomp$14$$($window$jscomp$28$$) {
        var $document$jscomp$7$$ = [], $a$jscomp$13$$;
        for ($a$jscomp$13$$ in $window$jscomp$28$$) {
          if (!($a$jscomp$13$$ in ["easing", "offset", "composite"])) {
            var $b$jscomp$14$$ = $window$jscomp$28$$[$a$jscomp$13$$];
            Array.isArray($b$jscomp$14$$) || ($b$jscomp$14$$ = [$b$jscomp$14$$]);
            for (var $c$jscomp$7$$, $d$jscomp$2$$ = $b$jscomp$14$$.length, $a$jscomp$40$$ = 0; $a$jscomp$40$$ < $d$jscomp$2$$; $a$jscomp$40$$++) {
              $c$jscomp$7$$ = {}, $c$jscomp$7$$.offset = "offset" in $window$jscomp$28$$ ? $window$jscomp$28$$.offset : 1 == $d$jscomp$2$$ ? 1 : $a$jscomp$40$$ / ($d$jscomp$2$$ - 1), "easing" in $window$jscomp$28$$ && ($c$jscomp$7$$.easing = $window$jscomp$28$$.easing), "composite" in $window$jscomp$28$$ && ($c$jscomp$7$$.$composite$ = $window$jscomp$28$$.$composite$), $c$jscomp$7$$[$a$jscomp$13$$] = $b$jscomp$14$$[$a$jscomp$40$$], $document$jscomp$7$$.push($c$jscomp$7$$);
            }
          }
        }
        return $document$jscomp$7$$.sort(function($window$jscomp$28$$, $document$jscomp$7$$) {
          return $window$jscomp$28$$.offset - $document$jscomp$7$$.offset;
        }), $document$jscomp$7$$;
      }
      var $c$jscomp$7$$ = {background:"backgroundImage backgroundPosition backgroundSize backgroundRepeat backgroundAttachment backgroundOrigin backgroundClip backgroundColor".split(" "), border:"borderTopColor borderTopStyle borderTopWidth borderRightColor borderRightStyle borderRightWidth borderBottomColor borderBottomStyle borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth".split(" "), borderBottom:["borderBottomWidth", "borderBottomStyle", "borderBottomColor"], borderColor:["borderTopColor", 
      "borderRightColor", "borderBottomColor", "borderLeftColor"], borderLeft:["borderLeftWidth", "borderLeftStyle", "borderLeftColor"], borderRadius:["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"], borderRight:["borderRightWidth", "borderRightStyle", "borderRightColor"], borderTop:["borderTopWidth", "borderTopStyle", "borderTopColor"], borderWidth:["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"], flex:["flexGrow", 
      "flexShrink", "flexBasis"], font:"fontFamily fontSize fontStyle fontVariant fontWeight lineHeight".split(" "), margin:["marginTop", "marginRight", "marginBottom", "marginLeft"], outline:["outlineColor", "outlineStyle", "outlineWidth"], padding:["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]}, $d$jscomp$2$$ = $document$jscomp$7$$.createElementNS("http://www.w3.org/1999/xhtml", "div"), $a$jscomp$40$$ = {$thin$:"1px", $medium$:"3px", $thick$:"5px"}, $k$jscomp$29$$ = {borderBottomWidth:$a$jscomp$40$$, 
      borderLeftWidth:$a$jscomp$40$$, borderRightWidth:$a$jscomp$40$$, borderTopWidth:$a$jscomp$40$$, fontSize:{"xx-small":"60%", "x-small":"75%", small:"89%", $medium$:"100%", $large$:"120%", "x-large":"150%", "xx-large":"200%"}, fontWeight:{$normal$:"400", bold:"700"}, outlineWidth:$a$jscomp$40$$, textShadow:{$none$:"0px 0px 0px transparent"}, boxShadow:{$none$:"0px 0px 0px 0px transparent"}};
      $a$jscomp$13$$.$convertToArrayForm$ = $b$jscomp$14$$;
      $a$jscomp$13$$.$normalizeKeyframes$ = function($document$jscomp$7$$) {
        function $a$jscomp$40$$() {
          var $window$jscomp$28$$ = $f$jscomp$9$$.length;
          null == $f$jscomp$9$$[$window$jscomp$28$$ - 1].offset && ($f$jscomp$9$$[$window$jscomp$28$$ - 1].offset = 1);
          1 < $window$jscomp$28$$ && null == $f$jscomp$9$$[0].offset && ($f$jscomp$9$$[0].offset = 0);
          for (var $document$jscomp$7$$ = 0, $a$jscomp$13$$ = $f$jscomp$9$$[0].offset, $b$jscomp$14$$ = 1; $b$jscomp$14$$ < $window$jscomp$28$$; $b$jscomp$14$$++) {
            var $c$jscomp$7$$ = $f$jscomp$9$$[$b$jscomp$14$$].offset;
            if (null != $c$jscomp$7$$) {
              for (var $d$jscomp$2$$ = 1; $d$jscomp$2$$ < $b$jscomp$14$$ - $document$jscomp$7$$; $d$jscomp$2$$++) {
                $f$jscomp$9$$[$document$jscomp$7$$ + $d$jscomp$2$$].offset = $a$jscomp$13$$ + ($c$jscomp$7$$ - $a$jscomp$13$$) * $d$jscomp$2$$ / ($b$jscomp$14$$ - $document$jscomp$7$$);
              }
              $document$jscomp$7$$ = $b$jscomp$14$$;
              $a$jscomp$13$$ = $c$jscomp$7$$;
            }
          }
        }
        if (null == $document$jscomp$7$$) {
          return [];
        }
        _.$$jscomp$initSymbol$$();
        _.$$jscomp$initSymbolIterator$$();
        _.$$jscomp$initSymbol$$();
        _.$$jscomp$initSymbolIterator$$();
        $window$jscomp$28$$.Symbol && window.Symbol.iterator && Array.prototype.from && $document$jscomp$7$$[window.Symbol.iterator] && ($document$jscomp$7$$ = Array.from($document$jscomp$7$$));
        Array.isArray($document$jscomp$7$$) || ($document$jscomp$7$$ = $b$jscomp$14$$($document$jscomp$7$$));
        var $f$jscomp$9$$ = $document$jscomp$7$$.map(function($window$jscomp$28$$) {
          var $document$jscomp$7$$ = {}, $b$jscomp$14$$;
          for ($b$jscomp$14$$ in $window$jscomp$28$$) {
            var $a$jscomp$40$$ = $window$jscomp$28$$[$b$jscomp$14$$];
            if ("offset" == $b$jscomp$14$$) {
              if (null != $a$jscomp$40$$) {
                if ($a$jscomp$40$$ = Number($a$jscomp$40$$), !(0,window.isFinite)($a$jscomp$40$$)) {
                  throw new TypeError("Keyframe offsets must be numbers.");
                }
                if (0 > $a$jscomp$40$$ || 1 < $a$jscomp$40$$) {
                  throw new TypeError("Keyframe offsets must be between 0 and 1.");
                }
              }
            } else {
              if ("composite" == $b$jscomp$14$$) {
                if ("add" == $a$jscomp$40$$ || "accumulate" == $a$jscomp$40$$) {
                  throw {type:window.DOMException.NOT_SUPPORTED_ERR, name:"NotSupportedError", message:"add compositing is not supported"};
                }
                if ("replace" != $a$jscomp$40$$) {
                  throw new TypeError("Invalid composite mode " + $a$jscomp$40$$ + ".");
                }
              } else {
                $a$jscomp$40$$ = "easing" == $b$jscomp$14$$ ? $a$jscomp$13$$.$normalizeEasing$($a$jscomp$40$$) : "" + $a$jscomp$40$$;
              }
            }
            var $f$jscomp$9$$ = void 0, $h$jscomp$13$$ = $b$jscomp$14$$, $i$jscomp$220$$ = $a$jscomp$40$$;
            $a$jscomp$40$$ = $document$jscomp$7$$;
            if ("display" !== $h$jscomp$13$$ && 0 !== $h$jscomp$13$$.lastIndexOf("animation", 0) && 0 !== $h$jscomp$13$$.lastIndexOf("transition", 0)) {
              var $h$jscomp$14$$ = $c$jscomp$7$$[$h$jscomp$13$$];
              if ($h$jscomp$14$$) {
                for ($f$jscomp$9$$ in $d$jscomp$2$$.style[$h$jscomp$13$$] = $i$jscomp$220$$, $h$jscomp$14$$) {
                  $h$jscomp$13$$ = $h$jscomp$14$$[$f$jscomp$9$$], $i$jscomp$220$$ = $d$jscomp$2$$.style[$h$jscomp$13$$], $a$jscomp$40$$[$h$jscomp$13$$] = $h$jscomp$13$$ in $k$jscomp$29$$ ? $k$jscomp$29$$[$h$jscomp$13$$][$i$jscomp$220$$] || $i$jscomp$220$$ : $i$jscomp$220$$;
                }
              } else {
                $a$jscomp$40$$[$h$jscomp$13$$] = $h$jscomp$13$$ in $k$jscomp$29$$ ? $k$jscomp$29$$[$h$jscomp$13$$][$i$jscomp$220$$] || $i$jscomp$220$$ : $i$jscomp$220$$;
              }
            }
          }
          return void 0 == $document$jscomp$7$$.offset && ($document$jscomp$7$$.offset = null), void 0 == $document$jscomp$7$$.easing && ($document$jscomp$7$$.easing = "linear"), $document$jscomp$7$$;
        });
        $document$jscomp$7$$ = !0;
        for (var $h$jscomp$13$$ = -1 / 0, $i$jscomp$220$$ = 0; $i$jscomp$220$$ < $f$jscomp$9$$.length; $i$jscomp$220$$++) {
          var $j$jscomp$8$$ = $f$jscomp$9$$[$i$jscomp$220$$].offset;
          if (null != $j$jscomp$8$$) {
            if ($j$jscomp$8$$ < $h$jscomp$13$$) {
              throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");
            }
            $h$jscomp$13$$ = $j$jscomp$8$$;
          } else {
            $document$jscomp$7$$ = !1;
          }
        }
        return $f$jscomp$9$$ = $f$jscomp$9$$.filter(function($window$jscomp$28$$) {
          return 0 <= $window$jscomp$28$$.offset && 1 >= $window$jscomp$28$$.offset;
        }), $document$jscomp$7$$ || $a$jscomp$40$$(), $f$jscomp$9$$;
      };
    })($c$jscomp$7$$);
    (function($window$jscomp$28$$) {
      var $document$jscomp$7$$ = {};
      $window$jscomp$28$$.$isDeprecated$ = function($window$jscomp$28$$, $a$jscomp$13$$, $b$jscomp$14$$, $c$jscomp$7$$) {
        $c$jscomp$7$$ = $c$jscomp$7$$ ? "are" : "is";
        var $d$jscomp$2$$ = new Date;
        $a$jscomp$13$$ = new Date($a$jscomp$13$$);
        return $a$jscomp$13$$.setMonth($a$jscomp$13$$.getMonth() + 3), !($d$jscomp$2$$ < $a$jscomp$13$$ && ($window$jscomp$28$$ in $document$jscomp$7$$ || window.console.warn("Web Animations: " + $window$jscomp$28$$ + " " + $c$jscomp$7$$ + " deprecated and will stop working on " + $a$jscomp$13$$.toDateString() + ". " + $b$jscomp$14$$), $document$jscomp$7$$[$window$jscomp$28$$] = !0, 1));
      };
      $window$jscomp$28$$.$deprecated$ = function($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$, $c$jscomp$7$$) {
        var $d$jscomp$2$$ = $c$jscomp$7$$ ? "are" : "is";
        if ($window$jscomp$28$$.$isDeprecated$($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$, $c$jscomp$7$$)) {
          throw Error($document$jscomp$7$$ + " " + $d$jscomp$2$$ + " no longer supported. " + $b$jscomp$14$$);
        }
      };
    })($c$jscomp$7$$);
    (function() {
      if ($document$jscomp$7$$.documentElement.animate) {
        var $a$jscomp$13$$ = $document$jscomp$7$$.documentElement.animate([], 0), $b$jscomp$14$$ = !0;
        if ($a$jscomp$13$$ && ($b$jscomp$14$$ = !1, "play currentTime pause reverse playbackRate cancel finish startTime playState".split(" ").forEach(function($window$jscomp$28$$) {
          void 0 === $a$jscomp$13$$[$window$jscomp$28$$] && ($b$jscomp$14$$ = !0);
        })), !$b$jscomp$14$$) {
          return;
        }
      }
      !function($window$jscomp$28$$, $document$jscomp$7$$) {
        function $a$jscomp$13$$($window$jscomp$28$$) {
          for (var $document$jscomp$7$$ = {}, $a$jscomp$13$$ = 0; $a$jscomp$13$$ < $window$jscomp$28$$.length; $a$jscomp$13$$++) {
            for (var $b$jscomp$14$$ in $window$jscomp$28$$[$a$jscomp$13$$]) {
              if ("offset" != $b$jscomp$14$$ && "easing" != $b$jscomp$14$$ && "composite" != $b$jscomp$14$$) {
                var $c$jscomp$7$$ = {offset:$window$jscomp$28$$[$a$jscomp$13$$].offset, easing:$window$jscomp$28$$[$a$jscomp$13$$].easing, value:$window$jscomp$28$$[$a$jscomp$13$$][$b$jscomp$14$$]};
                $document$jscomp$7$$[$b$jscomp$14$$] = $document$jscomp$7$$[$b$jscomp$14$$] || [];
                $document$jscomp$7$$[$b$jscomp$14$$].push($c$jscomp$7$$);
              }
            }
          }
          for (var $d$jscomp$2$$ in $document$jscomp$7$$) {
            if ($window$jscomp$28$$ = $document$jscomp$7$$[$d$jscomp$2$$], 0 != $window$jscomp$28$$[0].offset || 1 != $window$jscomp$28$$[$window$jscomp$28$$.length - 1].offset) {
              throw {type:window.DOMException.NOT_SUPPORTED_ERR, name:"NotSupportedError", message:"Partial keyframes are not supported"};
            }
          }
          return $document$jscomp$7$$;
        }
        function $b$jscomp$14$$($a$jscomp$13$$) {
          var $b$jscomp$14$$ = [], $c$jscomp$7$$;
          for ($c$jscomp$7$$ in $a$jscomp$13$$) {
            for (var $d$jscomp$2$$ = $a$jscomp$13$$[$c$jscomp$7$$], $a$jscomp$50$$ = 0; $a$jscomp$50$$ < $d$jscomp$2$$.length - 1; $a$jscomp$50$$++) {
              var $b$jscomp$42$$ = $a$jscomp$50$$, $a$jscomp$51$$ = $a$jscomp$50$$ + 1, $b$jscomp$43$$ = $d$jscomp$2$$[$b$jscomp$42$$].offset, $d$jscomp$19$$ = $d$jscomp$2$$[$a$jscomp$51$$].offset, $e$jscomp$139$$ = $b$jscomp$43$$, $c$jscomp$35$$ = $d$jscomp$19$$;
              0 == $a$jscomp$50$$ && ($e$jscomp$139$$ = -1 / 0, 0 == $d$jscomp$19$$ && ($a$jscomp$51$$ = $b$jscomp$42$$));
              $a$jscomp$50$$ == $d$jscomp$2$$.length - 2 && ($c$jscomp$35$$ = 1 / 0, 1 == $b$jscomp$43$$ && ($b$jscomp$42$$ = $a$jscomp$51$$));
              $b$jscomp$14$$.push({$applyFrom$:$e$jscomp$139$$, $applyTo$:$c$jscomp$35$$, startOffset:$d$jscomp$2$$[$b$jscomp$42$$].offset, endOffset:$d$jscomp$2$$[$a$jscomp$51$$].offset, $easingFunction$:$window$jscomp$28$$.$parseEasingFunction$($d$jscomp$2$$[$b$jscomp$42$$].easing), property:$c$jscomp$7$$, $interpolation$:$document$jscomp$7$$.$propertyInterpolation$($c$jscomp$7$$, $d$jscomp$2$$[$b$jscomp$42$$].value, $d$jscomp$2$$[$a$jscomp$51$$].value)});
            }
          }
          return $b$jscomp$14$$.sort(function($window$jscomp$28$$, $document$jscomp$7$$) {
            return $window$jscomp$28$$.startOffset - $document$jscomp$7$$.startOffset;
          }), $b$jscomp$14$$;
        }
        $document$jscomp$7$$.$convertEffectInput$ = function($c$jscomp$7$$) {
          $c$jscomp$7$$ = $window$jscomp$28$$.$normalizeKeyframes$($c$jscomp$7$$);
          var $d$jscomp$2$$ = $a$jscomp$13$$($c$jscomp$7$$), $a$jscomp$50$$ = $b$jscomp$14$$($d$jscomp$2$$);
          return function($window$jscomp$28$$, $a$jscomp$13$$) {
            if (null != $a$jscomp$13$$) {
              $a$jscomp$50$$.filter(function($window$jscomp$28$$) {
                return $a$jscomp$13$$ >= $window$jscomp$28$$.$applyFrom$ && $a$jscomp$13$$ < $window$jscomp$28$$.$applyTo$;
              }).forEach(function($b$jscomp$14$$) {
                var $c$jscomp$7$$ = $a$jscomp$13$$ - $b$jscomp$14$$.startOffset, $d$jscomp$2$$ = $b$jscomp$14$$.endOffset - $b$jscomp$14$$.startOffset;
                $c$jscomp$7$$ = 0 == $d$jscomp$2$$ ? 0 : $b$jscomp$14$$.$easingFunction$($c$jscomp$7$$ / $d$jscomp$2$$);
                $document$jscomp$7$$.apply($window$jscomp$28$$, $b$jscomp$14$$.property, $b$jscomp$14$$.$interpolation$($c$jscomp$7$$));
              });
            } else {
              for (var $b$jscomp$14$$ in $d$jscomp$2$$) {
                "offset" != $b$jscomp$14$$ && "easing" != $b$jscomp$14$$ && "composite" != $b$jscomp$14$$ && $document$jscomp$7$$.clear($window$jscomp$28$$, $b$jscomp$14$$);
              }
            }
          };
        };
      }($c$jscomp$7$$, $d$jscomp$2$$);
      (function($window$jscomp$28$$, $document$jscomp$7$$) {
        function $a$jscomp$13$$($window$jscomp$28$$) {
          return $window$jscomp$28$$.replace(/-(.)/g, function($window$jscomp$28$$, $document$jscomp$7$$) {
            return $document$jscomp$7$$.toUpperCase();
          });
        }
        var $b$jscomp$14$$ = {};
        $document$jscomp$7$$.$addPropertiesHandler$ = function($window$jscomp$28$$, $document$jscomp$7$$, $c$jscomp$7$$) {
          for (var $d$jscomp$2$$ = 0; $d$jscomp$2$$ < $c$jscomp$7$$.length; $d$jscomp$2$$++) {
            var $a$jscomp$50$$ = $window$jscomp$28$$, $b$jscomp$42$$ = $document$jscomp$7$$, $a$jscomp$56$$ = $a$jscomp$13$$($c$jscomp$7$$[$d$jscomp$2$$]);
            $b$jscomp$14$$[$a$jscomp$56$$] = $b$jscomp$14$$[$a$jscomp$56$$] || [];
            $b$jscomp$14$$[$a$jscomp$56$$].push([$a$jscomp$50$$, $b$jscomp$42$$]);
          }
        };
        var $c$jscomp$7$$ = {backgroundColor:"transparent", backgroundPosition:"0% 0%", borderBottomColor:"currentColor", borderBottomLeftRadius:"0px", borderBottomRightRadius:"0px", borderBottomWidth:"3px", borderLeftColor:"currentColor", borderLeftWidth:"3px", borderRightColor:"currentColor", borderRightWidth:"3px", borderSpacing:"2px", borderTopColor:"currentColor", borderTopLeftRadius:"0px", borderTopRightRadius:"0px", borderTopWidth:"3px", bottom:"auto", clip:"rect(0px, 0px, 0px, 0px)", color:"black", 
        fontSize:"100%", fontWeight:"400", height:"auto", left:"auto", letterSpacing:"normal", lineHeight:"120%", marginBottom:"0px", marginLeft:"0px", marginRight:"0px", marginTop:"0px", maxHeight:"none", maxWidth:"none", minHeight:"0px", minWidth:"0px", opacity:"1.0", outlineColor:"invert", $outlineOffset$:"0px", outlineWidth:"3px", paddingBottom:"0px", paddingLeft:"0px", paddingRight:"0px", paddingTop:"0px", right:"auto", $strokeDasharray$:"none", $strokeDashoffset$:"0px", textIndent:"0px", textShadow:"0px 0px 0px transparent", 
        top:"auto", transform:"", verticalAlign:"0px", visibility:"visible", width:"auto", wordSpacing:"normal", zIndex:"auto"};
        $document$jscomp$7$$.$propertyInterpolation$ = function($d$jscomp$2$$, $a$jscomp$50$$, $b$jscomp$42$$) {
          var $a$jscomp$56$$ = $d$jscomp$2$$;
          /-/.test($d$jscomp$2$$) && !$window$jscomp$28$$.$isDeprecated$("Hyphenated property names", "2016-03-22", "Use camelCase instead.", !0) && ($a$jscomp$56$$ = $a$jscomp$13$$($d$jscomp$2$$));
          "initial" != $a$jscomp$50$$ && "initial" != $b$jscomp$42$$ || ("initial" == $a$jscomp$50$$ && ($a$jscomp$50$$ = $c$jscomp$7$$[$a$jscomp$56$$]), "initial" == $b$jscomp$42$$ && ($b$jscomp$42$$ = $c$jscomp$7$$[$a$jscomp$56$$]));
          $d$jscomp$2$$ = $a$jscomp$50$$ == $b$jscomp$42$$ ? [] : $b$jscomp$14$$[$a$jscomp$56$$];
          for ($a$jscomp$56$$ = 0; $d$jscomp$2$$ && $a$jscomp$56$$ < $d$jscomp$2$$.length; $a$jscomp$56$$++) {
            var $b$jscomp$46$$ = $d$jscomp$2$$[$a$jscomp$56$$][0]($a$jscomp$50$$), $f$jscomp$22$$ = $d$jscomp$2$$[$a$jscomp$56$$][0]($b$jscomp$42$$);
            if (void 0 !== $b$jscomp$46$$ && void 0 !== $f$jscomp$22$$ && ($b$jscomp$46$$ = $d$jscomp$2$$[$a$jscomp$56$$][1]($b$jscomp$46$$, $f$jscomp$22$$))) {
              var $d$jscomp$24$$ = $document$jscomp$7$$.$Interpolation$.apply(null, $b$jscomp$46$$);
              return function($window$jscomp$28$$) {
                return 0 == $window$jscomp$28$$ ? $a$jscomp$50$$ : 1 == $window$jscomp$28$$ ? $b$jscomp$42$$ : $d$jscomp$24$$($window$jscomp$28$$);
              };
            }
          }
          return $document$jscomp$7$$.$Interpolation$(!1, !0, function($window$jscomp$28$$) {
            return $window$jscomp$28$$ ? $b$jscomp$42$$ : $a$jscomp$50$$;
          });
        };
      })($c$jscomp$7$$, $d$jscomp$2$$);
      (function($window$jscomp$28$$, $document$jscomp$7$$) {
        function $a$jscomp$13$$($document$jscomp$7$$) {
          function $a$jscomp$13$$($a$jscomp$13$$) {
            return $window$jscomp$28$$.$calculateIterationProgress$($b$jscomp$14$$, $a$jscomp$13$$, $document$jscomp$7$$);
          }
          var $b$jscomp$14$$ = $window$jscomp$28$$.$calculateActiveDuration$($document$jscomp$7$$);
          return $a$jscomp$13$$.$_totalDuration$ = $document$jscomp$7$$.delay + $b$jscomp$14$$ + $document$jscomp$7$$.endDelay, $a$jscomp$13$$;
        }
        $document$jscomp$7$$.$KeyframeEffect$ = function($b$jscomp$14$$, $c$jscomp$7$$, $d$jscomp$2$$, $a$jscomp$50$$) {
          function $b$jscomp$42$$() {
            $d$jscomp$25$$($b$jscomp$14$$, $a$jscomp$63$$);
          }
          var $a$jscomp$63$$, $b$jscomp$50$$ = $a$jscomp$13$$($window$jscomp$28$$.$normalizeTimingInput$($d$jscomp$2$$)), $d$jscomp$25$$ = $document$jscomp$7$$.$convertEffectInput$($c$jscomp$7$$);
          return $b$jscomp$42$$.$_update$ = function($window$jscomp$28$$) {
            return null !== ($a$jscomp$63$$ = $b$jscomp$50$$($window$jscomp$28$$));
          }, $b$jscomp$42$$.$_clear$ = function() {
            $d$jscomp$25$$($b$jscomp$14$$, null);
          }, $b$jscomp$42$$.$G$ = function($window$jscomp$28$$) {
            return $b$jscomp$14$$ === $window$jscomp$28$$;
          }, $b$jscomp$42$$.$_target$ = $b$jscomp$14$$, $b$jscomp$42$$.$_totalDuration$ = $b$jscomp$50$$.$_totalDuration$, $b$jscomp$42$$.$_id$ = $a$jscomp$50$$, $b$jscomp$42$$;
        };
      })($c$jscomp$7$$, $d$jscomp$2$$);
      (function($a$jscomp$13$$) {
        function $b$jscomp$14$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$) {
          $a$jscomp$13$$.enumerable = !0;
          $a$jscomp$13$$.configurable = !0;
          Object.defineProperty($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$);
        }
        function $c$jscomp$7$$($a$jscomp$13$$) {
          this.$_element$ = $a$jscomp$13$$;
          this.$_surrogateStyle$ = $document$jscomp$7$$.createElementNS("http://www.w3.org/1999/xhtml", "div").style;
          this.$_style$ = $a$jscomp$13$$.style;
          this.$_length$ = 0;
          this.$_isAnimatedProperty$ = {};
          this.$_updateSvgTransformAttr$ = !(!$a$jscomp$13$$.namespaceURI || -1 == $a$jscomp$13$$.namespaceURI.indexOf("/svg")) && ($a$jscomp$50$$ in $window$jscomp$28$$ || ($window$jscomp$28$$[$a$jscomp$50$$] = /Trident|MSIE|IEMobile|Edge|Android 4/i.test($window$jscomp$28$$.navigator.userAgent)), $window$jscomp$28$$[$a$jscomp$50$$]);
          this.$_savedTransformAttr$ = null;
          for ($a$jscomp$13$$ = 0; $a$jscomp$13$$ < this.$_style$.length; $a$jscomp$13$$++) {
            var $b$jscomp$14$$ = this.$_style$[$a$jscomp$13$$];
            this.$_surrogateStyle$[$b$jscomp$14$$] = this.$_style$[$b$jscomp$14$$];
          }
          this.$_updateIndices$();
        }
        function $d$jscomp$2$$($window$jscomp$28$$) {
          if (!$window$jscomp$28$$.$_webAnimationsPatchedStyle$) {
            var $document$jscomp$7$$ = new $c$jscomp$7$$($window$jscomp$28$$);
            try {
              $b$jscomp$14$$($window$jscomp$28$$, "style", {get:function() {
                return $document$jscomp$7$$;
              }});
            } catch ($b$227$$) {
              $window$jscomp$28$$.style.$_set$ = function($document$jscomp$7$$, $a$jscomp$13$$) {
                $window$jscomp$28$$.style[$document$jscomp$7$$] = $a$jscomp$13$$;
              }, $window$jscomp$28$$.style.$_clear$ = function($document$jscomp$7$$) {
                $window$jscomp$28$$.style[$document$jscomp$7$$] = "";
              };
            }
            $window$jscomp$28$$.$_webAnimationsPatchedStyle$ = $window$jscomp$28$$.style;
          }
        }
        var $a$jscomp$50$$ = "_webAnimationsUpdateSvgTransformAttr", $b$jscomp$42$$ = {cssText:1, length:1, parentRule:1}, $a$jscomp$66$$ = {getPropertyCSSValue:1, getPropertyPriority:1, getPropertyValue:1, item:1, removeProperty:1, setProperty:1}, $j$jscomp$14$$ = {removeProperty:1, setProperty:1};
        $c$jscomp$7$$.prototype = {get cssText() {
          return this.$_surrogateStyle$.cssText;
        }, set cssText($window$jscomp$28$$) {
          for (var $document$jscomp$7$$ = {}, $a$jscomp$13$$ = 0; $a$jscomp$13$$ < this.$_surrogateStyle$.length; $a$jscomp$13$$++) {
            $document$jscomp$7$$[this.$_surrogateStyle$[$a$jscomp$13$$]] = !0;
          }
          this.$_surrogateStyle$.cssText = $window$jscomp$28$$;
          this.$_updateIndices$();
          for ($a$jscomp$13$$ = 0; $a$jscomp$13$$ < this.$_surrogateStyle$.length; $a$jscomp$13$$++) {
            $document$jscomp$7$$[this.$_surrogateStyle$[$a$jscomp$13$$]] = !0;
          }
          for (var $b$jscomp$14$$ in $document$jscomp$7$$) {
            this.$_isAnimatedProperty$[$b$jscomp$14$$] || this.$_style$.setProperty($b$jscomp$14$$, this.$_surrogateStyle$.getPropertyValue($b$jscomp$14$$));
          }
        }, get length() {
          return this.$_surrogateStyle$.length;
        }, get parentRule() {
          return this.$_style$.parentRule;
        }, $_updateIndices$:function() {
          for (; this.$_length$ < this.$_surrogateStyle$.length;) {
            Object.defineProperty(this, this.$_length$, {configurable:!0, enumerable:!1, get:function($window$jscomp$28$$) {
              return function() {
                return this.$_surrogateStyle$[$window$jscomp$28$$];
              };
            }(this.$_length$)}), this.$_length$++;
          }
          for (; this.$_length$ > this.$_surrogateStyle$.length;) {
            this.$_length$--, Object.defineProperty(this, this.$_length$, {configurable:!0, enumerable:!1, value:void 0});
          }
        }, $_set$:function($window$jscomp$28$$, $document$jscomp$7$$) {
          this.$_style$[$window$jscomp$28$$] = $document$jscomp$7$$;
          this.$_isAnimatedProperty$[$window$jscomp$28$$] = !0;
          this.$_updateSvgTransformAttr$ && "transform" == $a$jscomp$13$$.$unprefixedPropertyName$($window$jscomp$28$$) && (null == this.$_savedTransformAttr$ && (this.$_savedTransformAttr$ = this.$_element$.getAttribute("transform")), this.$_element$.setAttribute("transform", $a$jscomp$13$$.$transformToSvgMatrix$($document$jscomp$7$$)));
        }, $_clear$:function($window$jscomp$28$$) {
          this.$_style$[$window$jscomp$28$$] = this.$_surrogateStyle$[$window$jscomp$28$$];
          this.$_updateSvgTransformAttr$ && "transform" == $a$jscomp$13$$.$unprefixedPropertyName$($window$jscomp$28$$) && (this.$_savedTransformAttr$ ? this.$_element$.setAttribute("transform", this.$_savedTransformAttr$) : this.$_element$.removeAttribute("transform"), this.$_savedTransformAttr$ = null);
          delete this.$_isAnimatedProperty$[$window$jscomp$28$$];
        }};
        for (var $k$jscomp$34$$ in $a$jscomp$66$$) {
          $c$jscomp$7$$.prototype[$k$jscomp$34$$] = function($window$jscomp$28$$, $document$jscomp$7$$) {
            return function() {
              var $a$jscomp$13$$ = this.$_surrogateStyle$[$window$jscomp$28$$].apply(this.$_surrogateStyle$, arguments);
              return $document$jscomp$7$$ && (this.$_isAnimatedProperty$[arguments[0]] || this.$_style$[$window$jscomp$28$$].apply(this.$_style$, arguments), this.$_updateIndices$()), $a$jscomp$13$$;
            };
          }($k$jscomp$34$$, $k$jscomp$34$$ in $j$jscomp$14$$);
        }
        for (var $l$jscomp$11$$ in $document$jscomp$7$$.documentElement.style) {
          $l$jscomp$11$$ in $b$jscomp$42$$ || $l$jscomp$11$$ in $a$jscomp$66$$ || function($window$jscomp$28$$) {
            $b$jscomp$14$$($c$jscomp$7$$.prototype, $window$jscomp$28$$, {get:function() {
              return this.$_surrogateStyle$[$window$jscomp$28$$];
            }, set:function($document$jscomp$7$$) {
              this.$_surrogateStyle$[$window$jscomp$28$$] = $document$jscomp$7$$;
              this.$_updateIndices$();
              this.$_isAnimatedProperty$[$window$jscomp$28$$] || (this.$_style$[$window$jscomp$28$$] = $document$jscomp$7$$);
            }});
          }($l$jscomp$11$$);
        }
        $a$jscomp$13$$.apply = function($window$jscomp$28$$, $document$jscomp$7$$, $b$jscomp$14$$) {
          $d$jscomp$2$$($window$jscomp$28$$);
          $window$jscomp$28$$.style.$_set$($a$jscomp$13$$.propertyName($document$jscomp$7$$), $b$jscomp$14$$);
        };
        $a$jscomp$13$$.clear = function($window$jscomp$28$$, $document$jscomp$7$$) {
          $window$jscomp$28$$.$_webAnimationsPatchedStyle$ && $window$jscomp$28$$.style.$_clear$($a$jscomp$13$$.propertyName($document$jscomp$7$$));
        };
      })($d$jscomp$2$$);
      (function($document$jscomp$7$$) {
        $window$jscomp$28$$.Element.prototype.animate = function($window$jscomp$28$$, $a$jscomp$13$$) {
          var $b$jscomp$14$$ = "";
          return $a$jscomp$13$$ && $a$jscomp$13$$.id && ($b$jscomp$14$$ = $a$jscomp$13$$.id), $document$jscomp$7$$.$timeline$.$_play$($document$jscomp$7$$.$KeyframeEffect$(this, $window$jscomp$28$$, $a$jscomp$13$$, $b$jscomp$14$$));
        };
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$, $a$jscomp$13$$, $b$jscomp$14$$) {
          if ("number" == typeof $window$jscomp$28$$ && "number" == typeof $a$jscomp$13$$) {
            return $window$jscomp$28$$ * (1 - $b$jscomp$14$$) + $a$jscomp$13$$ * $b$jscomp$14$$;
          }
          if ("boolean" == typeof $window$jscomp$28$$ && "boolean" == typeof $a$jscomp$13$$) {
            return .5 > $b$jscomp$14$$ ? $window$jscomp$28$$ : $a$jscomp$13$$;
          }
          if ($window$jscomp$28$$.length == $a$jscomp$13$$.length) {
            for (var $c$jscomp$7$$ = [], $d$jscomp$2$$ = 0; $d$jscomp$2$$ < $window$jscomp$28$$.length; $d$jscomp$2$$++) {
              $c$jscomp$7$$.push($document$jscomp$7$$($window$jscomp$28$$[$d$jscomp$2$$], $a$jscomp$13$$[$d$jscomp$2$$], $b$jscomp$14$$));
            }
            return $c$jscomp$7$$;
          }
          throw "Mismatched interpolation arguments " + $window$jscomp$28$$ + ":" + $a$jscomp$13$$;
        }
        $window$jscomp$28$$.$Interpolation$ = function($window$jscomp$28$$, $a$jscomp$13$$, $b$jscomp$14$$) {
          return function($c$jscomp$7$$) {
            return $b$jscomp$14$$($document$jscomp$7$$($window$jscomp$28$$, $a$jscomp$13$$, $c$jscomp$7$$));
          };
        };
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        $window$jscomp$28$$.$composeMatrix$ = function() {
          function $window$jscomp$28$$($window$jscomp$28$$, $document$jscomp$7$$) {
            for (var $a$jscomp$13$$ = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], $b$jscomp$14$$ = 0; 4 > $b$jscomp$14$$; $b$jscomp$14$$++) {
              for (var $c$jscomp$7$$ = 0; 4 > $c$jscomp$7$$; $c$jscomp$7$$++) {
                for (var $d$jscomp$2$$ = 0; 4 > $d$jscomp$2$$; $d$jscomp$2$$++) {
                  $a$jscomp$13$$[$b$jscomp$14$$][$c$jscomp$7$$] += $document$jscomp$7$$[$b$jscomp$14$$][$d$jscomp$2$$] * $window$jscomp$28$$[$d$jscomp$2$$][$c$jscomp$7$$];
                }
              }
            }
            return $a$jscomp$13$$;
          }
          return function($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$, $c$jscomp$7$$, $d$jscomp$2$$) {
            for (var $a$jscomp$50$$ = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], $b$jscomp$42$$ = 0; 4 > $b$jscomp$42$$; $b$jscomp$42$$++) {
              $a$jscomp$50$$[$b$jscomp$42$$][3] = $d$jscomp$2$$[$b$jscomp$42$$];
            }
            for ($b$jscomp$42$$ = 0; 3 > $b$jscomp$42$$; $b$jscomp$42$$++) {
              for ($d$jscomp$2$$ = 0; 3 > $d$jscomp$2$$; $d$jscomp$2$$++) {
                $a$jscomp$50$$[3][$b$jscomp$42$$] += $document$jscomp$7$$[$d$jscomp$2$$] * $a$jscomp$50$$[$d$jscomp$2$$][$b$jscomp$42$$];
              }
            }
            $document$jscomp$7$$ = $c$jscomp$7$$[0];
            $b$jscomp$42$$ = $c$jscomp$7$$[1];
            $d$jscomp$2$$ = $c$jscomp$7$$[2];
            $c$jscomp$7$$ = $c$jscomp$7$$[3];
            var $a$jscomp$79$$ = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            $a$jscomp$79$$[0][0] = 1 - 2 * ($b$jscomp$42$$ * $b$jscomp$42$$ + $d$jscomp$2$$ * $d$jscomp$2$$);
            $a$jscomp$79$$[0][1] = 2 * ($document$jscomp$7$$ * $b$jscomp$42$$ - $d$jscomp$2$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[0][2] = 2 * ($document$jscomp$7$$ * $d$jscomp$2$$ + $b$jscomp$42$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[1][0] = 2 * ($document$jscomp$7$$ * $b$jscomp$42$$ + $d$jscomp$2$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[1][1] = 1 - 2 * ($document$jscomp$7$$ * $document$jscomp$7$$ + $d$jscomp$2$$ * $d$jscomp$2$$);
            $a$jscomp$79$$[1][2] = 2 * ($b$jscomp$42$$ * $d$jscomp$2$$ - $document$jscomp$7$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[2][0] = 2 * ($document$jscomp$7$$ * $d$jscomp$2$$ - $b$jscomp$42$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[2][1] = 2 * ($b$jscomp$42$$ * $d$jscomp$2$$ + $document$jscomp$7$$ * $c$jscomp$7$$);
            $a$jscomp$79$$[2][2] = 1 - 2 * ($document$jscomp$7$$ * $document$jscomp$7$$ + $b$jscomp$42$$ * $b$jscomp$42$$);
            $a$jscomp$50$$ = $window$jscomp$28$$($a$jscomp$50$$, $a$jscomp$79$$);
            $c$jscomp$7$$ = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            $b$jscomp$14$$[2] && ($c$jscomp$7$$[2][1] = $b$jscomp$14$$[2], $a$jscomp$50$$ = $window$jscomp$28$$($a$jscomp$50$$, $c$jscomp$7$$));
            $b$jscomp$14$$[1] && ($c$jscomp$7$$[2][1] = 0, $c$jscomp$7$$[2][0] = $b$jscomp$14$$[0], $a$jscomp$50$$ = $window$jscomp$28$$($a$jscomp$50$$, $c$jscomp$7$$));
            $b$jscomp$14$$[0] && ($c$jscomp$7$$[2][0] = 0, $c$jscomp$7$$[1][0] = $b$jscomp$14$$[0], $a$jscomp$50$$ = $window$jscomp$28$$($a$jscomp$50$$, $c$jscomp$7$$));
            for ($b$jscomp$42$$ = 0; 3 > $b$jscomp$42$$; $b$jscomp$42$$++) {
              for ($d$jscomp$2$$ = 0; 3 > $d$jscomp$2$$; $d$jscomp$2$$++) {
                $a$jscomp$50$$[$b$jscomp$42$$][$d$jscomp$2$$] *= $a$jscomp$13$$[$b$jscomp$42$$];
              }
            }
            return 0 == $a$jscomp$50$$[0][2] && 0 == $a$jscomp$50$$[0][3] && 0 == $a$jscomp$50$$[1][2] && 0 == $a$jscomp$50$$[1][3] && 0 == $a$jscomp$50$$[2][0] && 0 == $a$jscomp$50$$[2][1] && 1 == $a$jscomp$50$$[2][2] && 0 == $a$jscomp$50$$[2][3] && 0 == $a$jscomp$50$$[3][2] && 1 == $a$jscomp$50$$[3][3] ? [$a$jscomp$50$$[0][0], $a$jscomp$50$$[0][1], $a$jscomp$50$$[1][0], $a$jscomp$50$$[1][1], $a$jscomp$50$$[3][0], $a$jscomp$50$$[3][1]] : $a$jscomp$50$$[0].concat($a$jscomp$50$$[1], $a$jscomp$50$$[2], 
            $a$jscomp$50$$[3]);
          };
        }();
        $window$jscomp$28$$.$quat$ = function($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$) {
          var $c$jscomp$7$$ = $window$jscomp$28$$.$dot$($document$jscomp$7$$, $a$jscomp$13$$);
          $c$jscomp$7$$ = Math.max(Math.min($c$jscomp$7$$, 1), -1);
          var $d$jscomp$2$$ = [];
          if (1 === $c$jscomp$7$$) {
            $d$jscomp$2$$ = $document$jscomp$7$$;
          } else {
            for (var $a$jscomp$50$$ = Math.acos($c$jscomp$7$$), $b$jscomp$42$$ = Math.sin($b$jscomp$14$$ * $a$jscomp$50$$) / Math.sqrt(1 - $c$jscomp$7$$ * $c$jscomp$7$$), $a$jscomp$79$$ = 0; 4 > $a$jscomp$79$$; $a$jscomp$79$$++) {
              $d$jscomp$2$$.push($document$jscomp$7$$[$a$jscomp$79$$] * (Math.cos($b$jscomp$14$$ * $a$jscomp$50$$) - $c$jscomp$7$$ * $b$jscomp$42$$) + $a$jscomp$13$$[$a$jscomp$79$$] * $b$jscomp$42$$);
            }
          }
          return $d$jscomp$2$$;
        };
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$, $document$jscomp$7$$) {
        function $a$jscomp$13$$($window$jscomp$28$$, $document$jscomp$7$$) {
          this.target = $window$jscomp$28$$;
          this.currentTime = $document$jscomp$7$$;
          this.type = "finish";
          this.cancelable = this.bubbles = !1;
          this.currentTarget = $window$jscomp$28$$;
          this.defaultPrevented = !1;
          this.eventPhase = window.Event.AT_TARGET;
          this.timeStamp = Date.now();
        }
        $window$jscomp$28$$.$sequenceNumber$ = 0;
        $document$jscomp$7$$.$Animation$ = function($document$jscomp$7$$) {
          this.id = "";
          $document$jscomp$7$$ && $document$jscomp$7$$.$_id$ && (this.id = $document$jscomp$7$$.$_id$);
          this.$_sequenceNumber$ = $window$jscomp$28$$.$sequenceNumber$++;
          this.$_currentTime$ = 0;
          this.$_startTime$ = null;
          this.$_paused$ = !1;
          this.$_playbackRate$ = 1;
          this.$_finishedFlag$ = this.$_inTimeline$ = !0;
          this.$onfinish$ = null;
          this.$_finishHandlers$ = [];
          this.$_effect$ = $document$jscomp$7$$;
          this.$_inEffect$ = this.$_effect$.$_update$(0);
          this.$_idle$ = !0;
          this.$_currentTimePending$ = !1;
        };
        $document$jscomp$7$$.$Animation$.prototype = {$_ensureAlive$:function() {
          0 > this.playbackRate && 0 === this.currentTime ? this.$_inEffect$ = this.$_effect$.$_update$(-1) : this.$_inEffect$ = this.$_effect$.$_update$(this.currentTime);
          this.$_inTimeline$ || !this.$_inEffect$ && this.$_finishedFlag$ || (this.$_inTimeline$ = !0, $document$jscomp$7$$.$timeline$.$_animations$.push(this));
        }, $_tickCurrentTime$:function($window$jscomp$28$$, $document$jscomp$7$$) {
          $window$jscomp$28$$ != this.$_currentTime$ && (this.$_currentTime$ = $window$jscomp$28$$, this.$_isFinished$ && !$document$jscomp$7$$ && (this.$_currentTime$ = 0 < this.$_playbackRate$ ? this.$_totalDuration$ : 0), this.$_ensureAlive$());
        }, get currentTime() {
          return this.$_idle$ || this.$_currentTimePending$ ? null : this.$_currentTime$;
        }, set currentTime($window$jscomp$28$$) {
          $window$jscomp$28$$ = +$window$jscomp$28$$;
          (0,window.isNaN)($window$jscomp$28$$) || ($document$jscomp$7$$.$restart$(), this.$_paused$ || null == this.$_startTime$ || (this.$_startTime$ = this.$_timeline$.currentTime - $window$jscomp$28$$ / this.$_playbackRate$), this.$_currentTimePending$ = !1, this.$_currentTime$ != $window$jscomp$28$$ && (this.$_idle$ && (this.$_idle$ = !1, this.$_paused$ = !0), this.$_tickCurrentTime$($window$jscomp$28$$, !0), $document$jscomp$7$$.$applyDirtiedAnimation$(this)));
        }, get startTime() {
          return this.$_startTime$;
        }, set startTime($window$jscomp$28$$) {
          $window$jscomp$28$$ = +$window$jscomp$28$$;
          (0,window.isNaN)($window$jscomp$28$$) || this.$_paused$ || this.$_idle$ || (this.$_startTime$ = $window$jscomp$28$$, this.$_tickCurrentTime$((this.$_timeline$.currentTime - this.$_startTime$) * this.playbackRate), $document$jscomp$7$$.$applyDirtiedAnimation$(this));
        }, get playbackRate() {
          return this.$_playbackRate$;
        }, set playbackRate($window$jscomp$28$$) {
          if ($window$jscomp$28$$ != this.$_playbackRate$) {
            var $a$jscomp$13$$ = this.currentTime;
            this.$_playbackRate$ = $window$jscomp$28$$;
            this.$_startTime$ = null;
            "paused" != this.playState && "idle" != this.playState && (this.$_finishedFlag$ = !1, this.$_idle$ = !1, this.$_ensureAlive$(), $document$jscomp$7$$.$applyDirtiedAnimation$(this));
            null != $a$jscomp$13$$ && (this.currentTime = $a$jscomp$13$$);
          }
        }, get $_isFinished$() {
          return !this.$_idle$ && (0 < this.$_playbackRate$ && this.$_currentTime$ >= this.$_totalDuration$ || 0 > this.$_playbackRate$ && 0 >= this.$_currentTime$);
        }, get $_totalDuration$() {
          return this.$_effect$.$_totalDuration$;
        }, get playState() {
          return this.$_idle$ ? "idle" : null == this.$_startTime$ && !this.$_paused$ && 0 != this.playbackRate || this.$_currentTimePending$ ? "pending" : this.$_paused$ ? "paused" : this.$_isFinished$ ? "finished" : "running";
        }, $_rewind$:function() {
          if (0 <= this.$_playbackRate$) {
            this.$_currentTime$ = 0;
          } else {
            if (!(this.$_totalDuration$ < 1 / 0)) {
              throw new window.DOMException("Unable to rewind negative playback rate animation with infinite duration", "InvalidStateError");
            }
            this.$_currentTime$ = this.$_totalDuration$;
          }
        }, play:function() {
          this.$_paused$ = !1;
          (this.$_isFinished$ || this.$_idle$) && (this.$_rewind$(), this.$_startTime$ = null);
          this.$_idle$ = this.$_finishedFlag$ = !1;
          this.$_ensureAlive$();
          $document$jscomp$7$$.$applyDirtiedAnimation$(this);
        }, pause:function() {
          this.$_isFinished$ || this.$_paused$ || this.$_idle$ ? this.$_idle$ && (this.$_rewind$(), this.$_idle$ = !1) : this.$_currentTimePending$ = !0;
          this.$_startTime$ = null;
          this.$_paused$ = !0;
        }, finish:function() {
          this.$_idle$ || (this.currentTime = 0 < this.$_playbackRate$ ? this.$_totalDuration$ : 0, this.$_startTime$ = this.$_totalDuration$ - this.currentTime, this.$_currentTimePending$ = !1, $document$jscomp$7$$.$applyDirtiedAnimation$(this));
        }, cancel:function() {
          this.$_inEffect$ && (this.$_inEffect$ = !1, this.$_idle$ = !0, this.$_paused$ = !1, this.$_finishedFlag$ = !0, this.$_currentTime$ = 0, this.$_startTime$ = null, this.$_effect$.$_update$(null), $document$jscomp$7$$.$applyDirtiedAnimation$(this));
        }, reverse:function() {
          this.playbackRate *= -1;
          this.play();
        }, addEventListener:function($window$jscomp$28$$, $document$jscomp$7$$) {
          "function" == typeof $document$jscomp$7$$ && "finish" == $window$jscomp$28$$ && this.$_finishHandlers$.push($document$jscomp$7$$);
        }, removeEventListener:function($window$jscomp$28$$, $document$jscomp$7$$) {
          "finish" == $window$jscomp$28$$ && ($window$jscomp$28$$ = this.$_finishHandlers$.indexOf($document$jscomp$7$$), 0 <= $window$jscomp$28$$ && this.$_finishHandlers$.splice($window$jscomp$28$$, 1));
        }, $_fireEvents$:function($window$jscomp$28$$) {
          if (this.$_isFinished$) {
            if (!this.$_finishedFlag$) {
              var $document$jscomp$7$$ = new $a$jscomp$13$$(this, this.$_currentTime$, $window$jscomp$28$$), $b$jscomp$14$$ = this.$_finishHandlers$.concat(this.$onfinish$ ? [this.$onfinish$] : []);
              (0,window.setTimeout)(function() {
                $b$jscomp$14$$.forEach(function($window$jscomp$28$$) {
                  $window$jscomp$28$$.call($document$jscomp$7$$.target, $document$jscomp$7$$);
                });
              }, 0);
              this.$_finishedFlag$ = !0;
            }
          } else {
            this.$_finishedFlag$ = !1;
          }
        }, $_tick$:function($window$jscomp$28$$, $document$jscomp$7$$) {
          this.$_idle$ || this.$_paused$ || (null == this.$_startTime$ ? $document$jscomp$7$$ && (this.startTime = $window$jscomp$28$$ - this.$_currentTime$ / this.playbackRate) : this.$_isFinished$ || this.$_tickCurrentTime$(($window$jscomp$28$$ - this.$_startTime$) * this.playbackRate));
          $document$jscomp$7$$ && (this.$_currentTimePending$ = !1, this.$_fireEvents$($window$jscomp$28$$));
        }, get $_needsTick$() {
          return this.playState in {$pending$:1, $running$:1} || !this.$_finishedFlag$;
        }, $_targetAnimations$:function() {
          var $window$jscomp$28$$ = this.$_effect$.$_target$;
          return $window$jscomp$28$$.$_activeAnimations$ || ($window$jscomp$28$$.$_activeAnimations$ = []), $window$jscomp$28$$.$_activeAnimations$;
        }, $_markTarget$:function() {
          var $window$jscomp$28$$ = this.$_targetAnimations$();
          -1 === $window$jscomp$28$$.indexOf(this) && $window$jscomp$28$$.push(this);
        }, $_unmarkTarget$:function() {
          var $window$jscomp$28$$ = this.$_targetAnimations$(), $document$jscomp$7$$ = $window$jscomp$28$$.indexOf(this);
          -1 !== $document$jscomp$7$$ && $window$jscomp$28$$.splice($document$jscomp$7$$, 1);
        }};
      })($c$jscomp$7$$, $d$jscomp$2$$);
      (function($document$jscomp$7$$, $a$jscomp$13$$) {
        function $b$jscomp$14$$($window$jscomp$28$$) {
          var $document$jscomp$7$$ = $b$jscomp$84$$;
          $b$jscomp$84$$ = [];
          $window$jscomp$28$$ < $q$jscomp$2$$.currentTime && ($window$jscomp$28$$ = $q$jscomp$2$$.currentTime);
          $q$jscomp$2$$.$_animations$.sort($c$jscomp$7$$);
          $q$jscomp$2$$.$_animations$ = $b$jscomp$42$$($window$jscomp$28$$, !0, $q$jscomp$2$$.$_animations$)[0];
          $document$jscomp$7$$.forEach(function($document$jscomp$7$$) {
            $document$jscomp$7$$[1]($window$jscomp$28$$);
          });
          $a$jscomp$50$$();
        }
        function $c$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$) {
          return $window$jscomp$28$$.$_sequenceNumber$ - $document$jscomp$7$$.$_sequenceNumber$;
        }
        function $d$jscomp$2$$() {
          this.$_animations$ = [];
          this.currentTime = $window$jscomp$28$$.performance && window.performance.now ? window.performance.now() : 0;
        }
        function $a$jscomp$50$$() {
          $o$jscomp$12$$.forEach(function($window$jscomp$28$$) {
            $window$jscomp$28$$();
          });
          $o$jscomp$12$$.length = 0;
        }
        function $b$jscomp$42$$($document$jscomp$7$$, $b$jscomp$14$$, $c$jscomp$7$$) {
          $p$jscomp$19$$ = !0;
          $a$jscomp$13$$.$timeline$.currentTime = $document$jscomp$7$$;
          $m$jscomp$7$$ = !1;
          var $d$jscomp$2$$ = [], $a$jscomp$50$$ = [], $b$jscomp$42$$ = [], $a$jscomp$98$$ = [];
          return $c$jscomp$7$$.forEach(function($window$jscomp$28$$) {
            $window$jscomp$28$$.$_tick$($document$jscomp$7$$, $b$jscomp$14$$);
            $window$jscomp$28$$.$_inEffect$ ? ($a$jscomp$50$$.push($window$jscomp$28$$.$_effect$), $window$jscomp$28$$.$_markTarget$()) : ($d$jscomp$2$$.push($window$jscomp$28$$.$_effect$), $window$jscomp$28$$.$_unmarkTarget$());
            $window$jscomp$28$$.$_needsTick$ && ($m$jscomp$7$$ = !0);
            var $a$jscomp$13$$ = $window$jscomp$28$$.$_inEffect$ || $window$jscomp$28$$.$_needsTick$;
            ($window$jscomp$28$$.$_inTimeline$ = $a$jscomp$13$$) ? $b$jscomp$42$$.push($window$jscomp$28$$) : $a$jscomp$98$$.push($window$jscomp$28$$);
          }), $o$jscomp$12$$.push.apply($o$jscomp$12$$, $d$jscomp$2$$), $o$jscomp$12$$.push.apply($o$jscomp$12$$, $a$jscomp$50$$), $m$jscomp$7$$ && $window$jscomp$28$$.requestAnimationFrame(function() {
          }), $p$jscomp$19$$ = !1, [$b$jscomp$42$$, $a$jscomp$98$$];
        }
        var $a$jscomp$98$$ = $window$jscomp$28$$.requestAnimationFrame, $b$jscomp$84$$ = [], $k$jscomp$36$$ = 0;
        $window$jscomp$28$$.requestAnimationFrame = function($window$jscomp$28$$) {
          var $document$jscomp$7$$ = $k$jscomp$36$$++;
          return 0 == $b$jscomp$84$$.length && $a$jscomp$98$$($b$jscomp$14$$), $b$jscomp$84$$.push([$document$jscomp$7$$, $window$jscomp$28$$]), $document$jscomp$7$$;
        };
        $window$jscomp$28$$.cancelAnimationFrame = function($window$jscomp$28$$) {
          $b$jscomp$84$$.forEach(function($document$jscomp$7$$) {
            $document$jscomp$7$$[0] == $window$jscomp$28$$ && ($document$jscomp$7$$[1] = function() {
            });
          });
        };
        $d$jscomp$2$$.prototype = {$_play$:function($window$jscomp$28$$) {
          $window$jscomp$28$$.$_timing$ = $document$jscomp$7$$.$normalizeTimingInput$($window$jscomp$28$$.timing);
          $window$jscomp$28$$ = new $a$jscomp$13$$.$Animation$($window$jscomp$28$$);
          return $window$jscomp$28$$.$_idle$ = !1, $window$jscomp$28$$.$_timeline$ = this, this.$_animations$.push($window$jscomp$28$$), $a$jscomp$13$$.$restart$(), $a$jscomp$13$$.$applyDirtiedAnimation$($window$jscomp$28$$), $window$jscomp$28$$;
        }};
        var $m$jscomp$7$$ = !1;
        $a$jscomp$13$$.$restart$ = function() {
          $m$jscomp$7$$ || ($m$jscomp$7$$ = !0, $window$jscomp$28$$.requestAnimationFrame(function() {
          }));
        };
        $a$jscomp$13$$.$applyDirtiedAnimation$ = function($window$jscomp$28$$) {
          $p$jscomp$19$$ || ($window$jscomp$28$$.$_markTarget$(), $window$jscomp$28$$ = $window$jscomp$28$$.$_targetAnimations$(), $window$jscomp$28$$.sort($c$jscomp$7$$), $b$jscomp$42$$($a$jscomp$13$$.$timeline$.currentTime, !1, $window$jscomp$28$$.slice())[1].forEach(function($window$jscomp$28$$) {
            $window$jscomp$28$$ = $q$jscomp$2$$.$_animations$.indexOf($window$jscomp$28$$);
            -1 !== $window$jscomp$28$$ && $q$jscomp$2$$.$_animations$.splice($window$jscomp$28$$, 1);
          }), $a$jscomp$50$$());
        };
        var $o$jscomp$12$$ = [], $p$jscomp$19$$ = !1, $q$jscomp$2$$ = new $d$jscomp$2$$;
        $a$jscomp$13$$.$timeline$ = $q$jscomp$2$$;
      })($c$jscomp$7$$, $d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$) {
          for (var $a$jscomp$13$$ = 0, $b$jscomp$14$$ = 0; $b$jscomp$14$$ < $window$jscomp$28$$.length; $b$jscomp$14$$++) {
            $a$jscomp$13$$ += $window$jscomp$28$$[$b$jscomp$14$$] * $document$jscomp$7$$[$b$jscomp$14$$];
          }
          return $a$jscomp$13$$;
        }
        function $a$jscomp$13$$($window$jscomp$28$$, $document$jscomp$7$$) {
          return [$window$jscomp$28$$[0] * $document$jscomp$7$$[0] + $window$jscomp$28$$[4] * $document$jscomp$7$$[1] + $window$jscomp$28$$[8] * $document$jscomp$7$$[2] + $window$jscomp$28$$[12] * $document$jscomp$7$$[3], $window$jscomp$28$$[1] * $document$jscomp$7$$[0] + $window$jscomp$28$$[5] * $document$jscomp$7$$[1] + $window$jscomp$28$$[9] * $document$jscomp$7$$[2] + $window$jscomp$28$$[13] * $document$jscomp$7$$[3], $window$jscomp$28$$[2] * $document$jscomp$7$$[0] + $window$jscomp$28$$[6] * 
          $document$jscomp$7$$[1] + $window$jscomp$28$$[10] * $document$jscomp$7$$[2] + $window$jscomp$28$$[14] * $document$jscomp$7$$[3], $window$jscomp$28$$[3] * $document$jscomp$7$$[0] + $window$jscomp$28$$[7] * $document$jscomp$7$$[1] + $window$jscomp$28$$[11] * $document$jscomp$7$$[2] + $window$jscomp$28$$[15] * $document$jscomp$7$$[3], $window$jscomp$28$$[0] * $document$jscomp$7$$[4] + $window$jscomp$28$$[4] * $document$jscomp$7$$[5] + $window$jscomp$28$$[8] * $document$jscomp$7$$[6] + $window$jscomp$28$$[12] * 
          $document$jscomp$7$$[7], $window$jscomp$28$$[1] * $document$jscomp$7$$[4] + $window$jscomp$28$$[5] * $document$jscomp$7$$[5] + $window$jscomp$28$$[9] * $document$jscomp$7$$[6] + $window$jscomp$28$$[13] * $document$jscomp$7$$[7], $window$jscomp$28$$[2] * $document$jscomp$7$$[4] + $window$jscomp$28$$[6] * $document$jscomp$7$$[5] + $window$jscomp$28$$[10] * $document$jscomp$7$$[6] + $window$jscomp$28$$[14] * $document$jscomp$7$$[7], $window$jscomp$28$$[3] * $document$jscomp$7$$[4] + $window$jscomp$28$$[7] * 
          $document$jscomp$7$$[5] + $window$jscomp$28$$[11] * $document$jscomp$7$$[6] + $window$jscomp$28$$[15] * $document$jscomp$7$$[7], $window$jscomp$28$$[0] * $document$jscomp$7$$[8] + $window$jscomp$28$$[4] * $document$jscomp$7$$[9] + $window$jscomp$28$$[8] * $document$jscomp$7$$[10] + $window$jscomp$28$$[12] * $document$jscomp$7$$[11], $window$jscomp$28$$[1] * $document$jscomp$7$$[8] + $window$jscomp$28$$[5] * $document$jscomp$7$$[9] + $window$jscomp$28$$[9] * $document$jscomp$7$$[10] + $window$jscomp$28$$[13] * 
          $document$jscomp$7$$[11], $window$jscomp$28$$[2] * $document$jscomp$7$$[8] + $window$jscomp$28$$[6] * $document$jscomp$7$$[9] + $window$jscomp$28$$[10] * $document$jscomp$7$$[10] + $window$jscomp$28$$[14] * $document$jscomp$7$$[11], $window$jscomp$28$$[3] * $document$jscomp$7$$[8] + $window$jscomp$28$$[7] * $document$jscomp$7$$[9] + $window$jscomp$28$$[11] * $document$jscomp$7$$[10] + $window$jscomp$28$$[15] * $document$jscomp$7$$[11], $window$jscomp$28$$[0] * $document$jscomp$7$$[12] + 
          $window$jscomp$28$$[4] * $document$jscomp$7$$[13] + $window$jscomp$28$$[8] * $document$jscomp$7$$[14] + $window$jscomp$28$$[12] * $document$jscomp$7$$[15], $window$jscomp$28$$[1] * $document$jscomp$7$$[12] + $window$jscomp$28$$[5] * $document$jscomp$7$$[13] + $window$jscomp$28$$[9] * $document$jscomp$7$$[14] + $window$jscomp$28$$[13] * $document$jscomp$7$$[15], $window$jscomp$28$$[2] * $document$jscomp$7$$[12] + $window$jscomp$28$$[6] * $document$jscomp$7$$[13] + $window$jscomp$28$$[10] * 
          $document$jscomp$7$$[14] + $window$jscomp$28$$[14] * $document$jscomp$7$$[15], $window$jscomp$28$$[3] * $document$jscomp$7$$[12] + $window$jscomp$28$$[7] * $document$jscomp$7$$[13] + $window$jscomp$28$$[11] * $document$jscomp$7$$[14] + $window$jscomp$28$$[15] * $document$jscomp$7$$[15]];
        }
        function $b$jscomp$14$$($window$jscomp$28$$) {
          return 2 * (($window$jscomp$28$$.$deg$ || 0) / 360 + ($window$jscomp$28$$.$grad$ || 0) / 400 + ($window$jscomp$28$$.$turn$ || 0)) * Math.PI + ($window$jscomp$28$$.$rad$ || 0);
        }
        function $c$jscomp$7$$($window$jscomp$28$$) {
          switch($window$jscomp$28$$.t) {
            case "rotatex":
              return $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[0]), [1, 0, 0, 0, 0, Math.cos($window$jscomp$28$$), Math.sin($window$jscomp$28$$), 0, 0, -Math.sin($window$jscomp$28$$), Math.cos($window$jscomp$28$$), 0, 0, 0, 0, 1];
            case "rotatey":
              return $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[0]), [Math.cos($window$jscomp$28$$), 0, -Math.sin($window$jscomp$28$$), 0, 0, 1, 0, 0, Math.sin($window$jscomp$28$$), 0, Math.cos($window$jscomp$28$$), 0, 0, 0, 0, 1];
            case "rotate":
            case "rotatez":
              return $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[0]), [Math.cos($window$jscomp$28$$), Math.sin($window$jscomp$28$$), 0, 0, -Math.sin($window$jscomp$28$$), Math.cos($window$jscomp$28$$), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "rotate3d":
              var $document$jscomp$7$$ = $window$jscomp$28$$.d[0], $a$jscomp$13$$ = $window$jscomp$28$$.d[1], $c$jscomp$7$$ = $window$jscomp$28$$.d[2];
              $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[3]);
              var $d$jscomp$2$$ = $document$jscomp$7$$ * $document$jscomp$7$$ + $a$jscomp$13$$ * $a$jscomp$13$$ + $c$jscomp$7$$ * $c$jscomp$7$$;
              0 === $d$jscomp$2$$ ? ($document$jscomp$7$$ = 1, $c$jscomp$7$$ = $a$jscomp$13$$ = 0) : 1 !== $d$jscomp$2$$ && ($d$jscomp$2$$ = Math.sqrt($d$jscomp$2$$), $document$jscomp$7$$ /= $d$jscomp$2$$, $a$jscomp$13$$ /= $d$jscomp$2$$, $c$jscomp$7$$ /= $d$jscomp$2$$);
              $d$jscomp$2$$ = Math.sin($window$jscomp$28$$ / 2);
              $window$jscomp$28$$ = $d$jscomp$2$$ * Math.cos($window$jscomp$28$$ / 2);
              $d$jscomp$2$$ *= $d$jscomp$2$$;
              return [1 - 2 * ($a$jscomp$13$$ * $a$jscomp$13$$ + $c$jscomp$7$$ * $c$jscomp$7$$) * $d$jscomp$2$$, 2 * ($document$jscomp$7$$ * $a$jscomp$13$$ * $d$jscomp$2$$ + $c$jscomp$7$$ * $window$jscomp$28$$), 2 * ($document$jscomp$7$$ * $c$jscomp$7$$ * $d$jscomp$2$$ - $a$jscomp$13$$ * $window$jscomp$28$$), 0, 2 * ($document$jscomp$7$$ * $a$jscomp$13$$ * $d$jscomp$2$$ - $c$jscomp$7$$ * $window$jscomp$28$$), 1 - 2 * ($document$jscomp$7$$ * $document$jscomp$7$$ + $c$jscomp$7$$ * $c$jscomp$7$$) * 
              $d$jscomp$2$$, 2 * ($a$jscomp$13$$ * $c$jscomp$7$$ * $d$jscomp$2$$ + $document$jscomp$7$$ * $window$jscomp$28$$), 0, 2 * ($document$jscomp$7$$ * $c$jscomp$7$$ * $d$jscomp$2$$ + $a$jscomp$13$$ * $window$jscomp$28$$), 2 * ($a$jscomp$13$$ * $c$jscomp$7$$ * $d$jscomp$2$$ - $document$jscomp$7$$ * $window$jscomp$28$$), 1 - 2 * ($document$jscomp$7$$ * $document$jscomp$7$$ + $a$jscomp$13$$ * $a$jscomp$13$$) * $d$jscomp$2$$, 0, 0, 0, 0, 1];
            case "scale":
              return [$window$jscomp$28$$.d[0], 0, 0, 0, 0, $window$jscomp$28$$.d[1], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "scalex":
              return [$window$jscomp$28$$.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "scaley":
              return [1, 0, 0, 0, 0, $window$jscomp$28$$.d[0], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "scalez":
              return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, $window$jscomp$28$$.d[0], 0, 0, 0, 0, 1];
            case "scale3d":
              return [$window$jscomp$28$$.d[0], 0, 0, 0, 0, $window$jscomp$28$$.d[1], 0, 0, 0, 0, $window$jscomp$28$$.d[2], 0, 0, 0, 0, 1];
            case "skew":
              return [1, Math.tan($b$jscomp$14$$($window$jscomp$28$$.d[1])), 0, 0, Math.tan($b$jscomp$14$$($window$jscomp$28$$.d[0])), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "skewx":
              return $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[0]), [1, 0, 0, 0, Math.tan($window$jscomp$28$$), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "skewy":
              return $window$jscomp$28$$ = $b$jscomp$14$$($window$jscomp$28$$.d[0]), [1, Math.tan($window$jscomp$28$$), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            case "translate":
              return $document$jscomp$7$$ = $window$jscomp$28$$.d[0].$px$ || 0, $a$jscomp$13$$ = $window$jscomp$28$$.d[1].$px$ || 0, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, $document$jscomp$7$$, $a$jscomp$13$$, 0, 1];
            case "translatex":
              return $document$jscomp$7$$ = $window$jscomp$28$$.d[0].$px$ || 0, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, $document$jscomp$7$$, 0, 0, 1];
            case "translatey":
              return $a$jscomp$13$$ = $window$jscomp$28$$.d[0].$px$ || 0, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, $a$jscomp$13$$, 0, 1];
            case "translatez":
              return $c$jscomp$7$$ = $window$jscomp$28$$.d[0].$px$ || 0, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, $c$jscomp$7$$, 1];
            case "translate3d":
              return $document$jscomp$7$$ = $window$jscomp$28$$.d[0].$px$ || 0, $a$jscomp$13$$ = $window$jscomp$28$$.d[1].$px$ || 0, $c$jscomp$7$$ = $window$jscomp$28$$.d[2].$px$ || 0, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, $document$jscomp$7$$, $a$jscomp$13$$, $c$jscomp$7$$, 1];
            case "perspective":
              return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, $window$jscomp$28$$.d[0].$px$ ? -1 / $window$jscomp$28$$.d[0].$px$ : 0, 0, 0, 0, 1];
            case "matrix":
              return [$window$jscomp$28$$.d[0], $window$jscomp$28$$.d[1], 0, 0, $window$jscomp$28$$.d[2], $window$jscomp$28$$.d[3], 0, 0, 0, 0, 1, 0, $window$jscomp$28$$.d[4], $window$jscomp$28$$.d[5], 0, 1];
            case "matrix3d":
              return $window$jscomp$28$$.d;
          }
        }
        function $d$jscomp$2$$($window$jscomp$28$$) {
          return 0 === $window$jscomp$28$$.length ? [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] : $window$jscomp$28$$.map($c$jscomp$7$$).reduce($a$jscomp$13$$);
        }
        var $a$jscomp$50$$ = function() {
          function $window$jscomp$28$$($window$jscomp$28$$) {
            return $window$jscomp$28$$[0][0] * $window$jscomp$28$$[1][1] * $window$jscomp$28$$[2][2] + $window$jscomp$28$$[1][0] * $window$jscomp$28$$[2][1] * $window$jscomp$28$$[0][2] + $window$jscomp$28$$[2][0] * $window$jscomp$28$$[0][1] * $window$jscomp$28$$[1][2] - $window$jscomp$28$$[0][2] * $window$jscomp$28$$[1][1] * $window$jscomp$28$$[2][0] - $window$jscomp$28$$[1][2] * $window$jscomp$28$$[2][1] * $window$jscomp$28$$[0][0] - $window$jscomp$28$$[2][2] * $window$jscomp$28$$[0][1] * $window$jscomp$28$$[1][0];
          }
          function $a$jscomp$13$$($window$jscomp$28$$) {
            var $document$jscomp$7$$ = $b$jscomp$14$$($window$jscomp$28$$);
            return [$window$jscomp$28$$[0] / $document$jscomp$7$$, $window$jscomp$28$$[1] / $document$jscomp$7$$, $window$jscomp$28$$[2] / $document$jscomp$7$$];
          }
          function $b$jscomp$14$$($window$jscomp$28$$) {
            return Math.sqrt($window$jscomp$28$$[0] * $window$jscomp$28$$[0] + $window$jscomp$28$$[1] * $window$jscomp$28$$[1] + $window$jscomp$28$$[2] * $window$jscomp$28$$[2]);
          }
          function $c$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$) {
            return [$a$jscomp$13$$ * $window$jscomp$28$$[0] + $b$jscomp$14$$ * $document$jscomp$7$$[0], $a$jscomp$13$$ * $window$jscomp$28$$[1] + $b$jscomp$14$$ * $document$jscomp$7$$[1], $a$jscomp$13$$ * $window$jscomp$28$$[2] + $b$jscomp$14$$ * $document$jscomp$7$$[2]];
          }
          return function($d$jscomp$2$$) {
            $d$jscomp$2$$ = [$d$jscomp$2$$.slice(0, 4), $d$jscomp$2$$.slice(4, 8), $d$jscomp$2$$.slice(8, 12), $d$jscomp$2$$.slice(12, 16)];
            if (1 !== $d$jscomp$2$$[3][3]) {
              return null;
            }
            for (var $a$jscomp$50$$ = [], $b$jscomp$42$$ = 0; 4 > $b$jscomp$42$$; $b$jscomp$42$$++) {
              $a$jscomp$50$$.push($d$jscomp$2$$[$b$jscomp$42$$].slice());
            }
            for ($b$jscomp$42$$ = 0; 3 > $b$jscomp$42$$; $b$jscomp$42$$++) {
              $a$jscomp$50$$[$b$jscomp$42$$][3] = 0;
            }
            if (0 === $window$jscomp$28$$($a$jscomp$50$$)) {
              return null;
            }
            var $a$jscomp$107$$ = [];
            if ($d$jscomp$2$$[0][3] || $d$jscomp$2$$[1][3] || $d$jscomp$2$$[2][3]) {
              $a$jscomp$107$$.push($d$jscomp$2$$[0][3]);
              $a$jscomp$107$$.push($d$jscomp$2$$[1][3]);
              $a$jscomp$107$$.push($d$jscomp$2$$[2][3]);
              $a$jscomp$107$$.push($d$jscomp$2$$[3][3]);
              var $c$jscomp$69$$ = 1 / $window$jscomp$28$$($a$jscomp$50$$), $d$jscomp$44$$ = $a$jscomp$50$$[0][0], $i$jscomp$229$$ = $a$jscomp$50$$[0][1];
              $b$jscomp$42$$ = $a$jscomp$50$$[0][2];
              var $e$jscomp$155$$ = $a$jscomp$50$$[1][0], $a$jscomp$114$$ = $a$jscomp$50$$[1][1], $g$jscomp$22$$ = $a$jscomp$50$$[1][2], $f$jscomp$31$$ = $a$jscomp$50$$[2][0], $k$jscomp$inline_2666$$ = $a$jscomp$50$$[2][1], $l$jscomp$inline_2667$$ = $a$jscomp$50$$[2][2];
              $c$jscomp$69$$ = [[($a$jscomp$114$$ * $l$jscomp$inline_2667$$ - $g$jscomp$22$$ * $k$jscomp$inline_2666$$) * $c$jscomp$69$$, ($b$jscomp$42$$ * $k$jscomp$inline_2666$$ - $i$jscomp$229$$ * $l$jscomp$inline_2667$$) * $c$jscomp$69$$, ($i$jscomp$229$$ * $g$jscomp$22$$ - $b$jscomp$42$$ * $a$jscomp$114$$) * $c$jscomp$69$$, 0], [($g$jscomp$22$$ * $f$jscomp$31$$ - $e$jscomp$155$$ * $l$jscomp$inline_2667$$) * $c$jscomp$69$$, ($d$jscomp$44$$ * $l$jscomp$inline_2667$$ - $b$jscomp$42$$ * $f$jscomp$31$$) * 
              $c$jscomp$69$$, ($b$jscomp$42$$ * $e$jscomp$155$$ - $d$jscomp$44$$ * $g$jscomp$22$$) * $c$jscomp$69$$, 0], [($e$jscomp$155$$ * $k$jscomp$inline_2666$$ - $a$jscomp$114$$ * $f$jscomp$31$$) * $c$jscomp$69$$, ($f$jscomp$31$$ * $i$jscomp$229$$ - $d$jscomp$44$$ * $k$jscomp$inline_2666$$) * $c$jscomp$69$$, ($d$jscomp$44$$ * $a$jscomp$114$$ - $i$jscomp$229$$ * $e$jscomp$155$$) * $c$jscomp$69$$, 0]];
              $d$jscomp$44$$ = [];
              for ($i$jscomp$229$$ = 0; 3 > $i$jscomp$229$$; $i$jscomp$229$$++) {
                for ($e$jscomp$155$$ = $b$jscomp$42$$ = 0; 3 > $e$jscomp$155$$; $e$jscomp$155$$++) {
                  $b$jscomp$42$$ += $a$jscomp$50$$[3][$e$jscomp$155$$] * $c$jscomp$69$$[$e$jscomp$155$$][$i$jscomp$229$$];
                }
                $d$jscomp$44$$.push($b$jscomp$42$$);
              }
              $a$jscomp$50$$ = ($d$jscomp$44$$.push(1), $c$jscomp$69$$.push($d$jscomp$44$$), $c$jscomp$69$$);
              $a$jscomp$50$$ = [[$a$jscomp$50$$[0][0], $a$jscomp$50$$[1][0], $a$jscomp$50$$[2][0], $a$jscomp$50$$[3][0]], [$a$jscomp$50$$[0][1], $a$jscomp$50$$[1][1], $a$jscomp$50$$[2][1], $a$jscomp$50$$[3][1]], [$a$jscomp$50$$[0][2], $a$jscomp$50$$[1][2], $a$jscomp$50$$[2][2], $a$jscomp$50$$[3][2]], [$a$jscomp$50$$[0][3], $a$jscomp$50$$[1][3], $a$jscomp$50$$[2][3], $a$jscomp$50$$[3][3]]];
              $c$jscomp$69$$ = [];
              for ($d$jscomp$44$$ = 0; 4 > $d$jscomp$44$$; $d$jscomp$44$$++) {
                for ($b$jscomp$42$$ = $i$jscomp$229$$ = 0; 4 > $b$jscomp$42$$; $b$jscomp$42$$++) {
                  $i$jscomp$229$$ += $a$jscomp$107$$[$b$jscomp$42$$] * $a$jscomp$50$$[$b$jscomp$42$$][$d$jscomp$44$$];
                }
                $c$jscomp$69$$.push($i$jscomp$229$$);
              }
              $a$jscomp$107$$ = $c$jscomp$69$$;
            } else {
              $a$jscomp$107$$ = [0, 0, 0, 1];
            }
            $a$jscomp$50$$ = $d$jscomp$2$$[3].slice(0, 3);
            $c$jscomp$69$$ = [];
            $c$jscomp$69$$.push($d$jscomp$2$$[0].slice(0, 3));
            $d$jscomp$44$$ = [];
            $d$jscomp$44$$.push($b$jscomp$14$$($c$jscomp$69$$[0]));
            $c$jscomp$69$$[0] = $a$jscomp$13$$($c$jscomp$69$$[0]);
            $i$jscomp$229$$ = [];
            $c$jscomp$69$$.push($d$jscomp$2$$[1].slice(0, 3));
            $i$jscomp$229$$.push($document$jscomp$7$$($c$jscomp$69$$[0], $c$jscomp$69$$[1]));
            $c$jscomp$69$$[1] = $c$jscomp$7$$($c$jscomp$69$$[1], $c$jscomp$69$$[0], 1, -$i$jscomp$229$$[0]);
            $d$jscomp$44$$.push($b$jscomp$14$$($c$jscomp$69$$[1]));
            $c$jscomp$69$$[1] = $a$jscomp$13$$($c$jscomp$69$$[1]);
            $i$jscomp$229$$[0] /= $d$jscomp$44$$[1];
            $c$jscomp$69$$.push($d$jscomp$2$$[2].slice(0, 3));
            $i$jscomp$229$$.push($document$jscomp$7$$($c$jscomp$69$$[0], $c$jscomp$69$$[2]));
            $c$jscomp$69$$[2] = $c$jscomp$7$$($c$jscomp$69$$[2], $c$jscomp$69$$[0], 1, -$i$jscomp$229$$[1]);
            $i$jscomp$229$$.push($document$jscomp$7$$($c$jscomp$69$$[1], $c$jscomp$69$$[2]));
            $c$jscomp$69$$[2] = $c$jscomp$7$$($c$jscomp$69$$[2], $c$jscomp$69$$[1], 1, -$i$jscomp$229$$[2]);
            $d$jscomp$44$$.push($b$jscomp$14$$($c$jscomp$69$$[2]));
            $c$jscomp$69$$[2] = $a$jscomp$13$$($c$jscomp$69$$[2]);
            $i$jscomp$229$$[1] /= $d$jscomp$44$$[2];
            $i$jscomp$229$$[2] /= $d$jscomp$44$$[2];
            $d$jscomp$2$$ = $c$jscomp$69$$[1];
            $b$jscomp$42$$ = $c$jscomp$69$$[2];
            if (0 > $document$jscomp$7$$($c$jscomp$69$$[0], [$d$jscomp$2$$[1] * $b$jscomp$42$$[2] - $d$jscomp$2$$[2] * $b$jscomp$42$$[1], $d$jscomp$2$$[2] * $b$jscomp$42$$[0] - $d$jscomp$2$$[0] * $b$jscomp$42$$[2], $d$jscomp$2$$[0] * $b$jscomp$42$$[1] - $d$jscomp$2$$[1] * $b$jscomp$42$$[0]])) {
              for ($b$jscomp$42$$ = 0; 3 > $b$jscomp$42$$; $b$jscomp$42$$++) {
                $d$jscomp$44$$[$b$jscomp$42$$] *= -1, $c$jscomp$69$$[$b$jscomp$42$$][0] *= -1, $c$jscomp$69$$[$b$jscomp$42$$][1] *= -1, $c$jscomp$69$$[$b$jscomp$42$$][2] *= -1;
              }
            }
            var $u$jscomp$1$$, $v$jscomp$10$$;
            $d$jscomp$2$$ = $c$jscomp$69$$[0][0] + $c$jscomp$69$$[1][1] + $c$jscomp$69$$[2][2] + 1;
            return 1E-4 < $d$jscomp$2$$ ? ($u$jscomp$1$$ = .5 / Math.sqrt($d$jscomp$2$$), $v$jscomp$10$$ = [($c$jscomp$69$$[2][1] - $c$jscomp$69$$[1][2]) * $u$jscomp$1$$, ($c$jscomp$69$$[0][2] - $c$jscomp$69$$[2][0]) * $u$jscomp$1$$, ($c$jscomp$69$$[1][0] - $c$jscomp$69$$[0][1]) * $u$jscomp$1$$, .25 / $u$jscomp$1$$]) : $c$jscomp$69$$[0][0] > $c$jscomp$69$$[1][1] && $c$jscomp$69$$[0][0] > $c$jscomp$69$$[2][2] ? ($u$jscomp$1$$ = 2 * Math.sqrt(1 + $c$jscomp$69$$[0][0] - $c$jscomp$69$$[1][1] - $c$jscomp$69$$[2][2]), 
            $v$jscomp$10$$ = [.25 * $u$jscomp$1$$, ($c$jscomp$69$$[0][1] + $c$jscomp$69$$[1][0]) / $u$jscomp$1$$, ($c$jscomp$69$$[0][2] + $c$jscomp$69$$[2][0]) / $u$jscomp$1$$, ($c$jscomp$69$$[2][1] - $c$jscomp$69$$[1][2]) / $u$jscomp$1$$]) : $c$jscomp$69$$[1][1] > $c$jscomp$69$$[2][2] ? ($u$jscomp$1$$ = 2 * Math.sqrt(1 + $c$jscomp$69$$[1][1] - $c$jscomp$69$$[0][0] - $c$jscomp$69$$[2][2]), $v$jscomp$10$$ = [($c$jscomp$69$$[0][1] + $c$jscomp$69$$[1][0]) / $u$jscomp$1$$, .25 * $u$jscomp$1$$, ($c$jscomp$69$$[1][2] + 
            $c$jscomp$69$$[2][1]) / $u$jscomp$1$$, ($c$jscomp$69$$[0][2] - $c$jscomp$69$$[2][0]) / $u$jscomp$1$$]) : ($u$jscomp$1$$ = 2 * Math.sqrt(1 + $c$jscomp$69$$[2][2] - $c$jscomp$69$$[0][0] - $c$jscomp$69$$[1][1]), $v$jscomp$10$$ = [($c$jscomp$69$$[0][2] + $c$jscomp$69$$[2][0]) / $u$jscomp$1$$, ($c$jscomp$69$$[1][2] + $c$jscomp$69$$[2][1]) / $u$jscomp$1$$, .25 * $u$jscomp$1$$, ($c$jscomp$69$$[1][0] - $c$jscomp$69$$[0][1]) / $u$jscomp$1$$]), [$a$jscomp$50$$, $d$jscomp$44$$, $i$jscomp$229$$, 
            $v$jscomp$10$$, $a$jscomp$107$$];
          };
        }();
        $window$jscomp$28$$.$dot$ = $document$jscomp$7$$;
        $window$jscomp$28$$.$makeMatrixDecomposition$ = function($window$jscomp$28$$) {
          return [$a$jscomp$50$$($d$jscomp$2$$($window$jscomp$28$$))];
        };
        $window$jscomp$28$$.$transformListToMatrix$ = $d$jscomp$2$$;
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$) {
          var $a$jscomp$13$$ = $window$jscomp$28$$.exec($document$jscomp$7$$);
          if ($a$jscomp$13$$) {
            return $a$jscomp$13$$ = $window$jscomp$28$$.ignoreCase ? $a$jscomp$13$$[0].toLowerCase() : $a$jscomp$13$$[0], [$a$jscomp$13$$, $document$jscomp$7$$.substr($a$jscomp$13$$.length)];
          }
        }
        function $a$jscomp$13$$($window$jscomp$28$$, $document$jscomp$7$$) {
          $document$jscomp$7$$ = $document$jscomp$7$$.replace(/^\s*/, "");
          if ($window$jscomp$28$$ = $window$jscomp$28$$($document$jscomp$7$$)) {
            return [$window$jscomp$28$$[0], $window$jscomp$28$$[1].replace(/^\s*/, "")];
          }
        }
        function $b$jscomp$14$$($window$jscomp$28$$, $document$jscomp$7$$) {
          for (var $a$jscomp$13$$ = $window$jscomp$28$$, $b$jscomp$14$$ = $document$jscomp$7$$; $a$jscomp$13$$ && $b$jscomp$14$$;) {
            $a$jscomp$13$$ > $b$jscomp$14$$ ? $a$jscomp$13$$ %= $b$jscomp$14$$ : $b$jscomp$14$$ %= $a$jscomp$13$$;
          }
          return $window$jscomp$28$$ * $document$jscomp$7$$ / ($a$jscomp$13$$ + $b$jscomp$14$$);
        }
        function $c$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$, $c$jscomp$7$$, $d$jscomp$2$$) {
          for (var $a$jscomp$50$$ = [], $b$jscomp$42$$ = [], $a$jscomp$122$$ = [], $b$jscomp$103$$ = $b$jscomp$14$$($c$jscomp$7$$.length, $d$jscomp$2$$.length), $c$jscomp$75$$ = 0; $c$jscomp$75$$ < $b$jscomp$103$$; $c$jscomp$75$$++) {
            var $b$jscomp$111$$ = $document$jscomp$7$$($c$jscomp$7$$[$c$jscomp$75$$ % $c$jscomp$7$$.length], $d$jscomp$2$$[$c$jscomp$75$$ % $d$jscomp$2$$.length]);
            if (!$b$jscomp$111$$) {
              return;
            }
            $a$jscomp$50$$.push($b$jscomp$111$$[0]);
            $b$jscomp$42$$.push($b$jscomp$111$$[1]);
            $a$jscomp$122$$.push($b$jscomp$111$$[2]);
          }
          return [$a$jscomp$50$$, $b$jscomp$42$$, function($document$jscomp$7$$) {
            $document$jscomp$7$$ = $document$jscomp$7$$.map(function($window$jscomp$28$$, $document$jscomp$7$$) {
              return $a$jscomp$122$$[$document$jscomp$7$$]($window$jscomp$28$$);
            }).join($a$jscomp$13$$);
            return $window$jscomp$28$$ ? $window$jscomp$28$$($document$jscomp$7$$) : $document$jscomp$7$$;
          }];
        }
        $window$jscomp$28$$.$consumeToken$ = $document$jscomp$7$$;
        $window$jscomp$28$$.$consumeTrimmed$ = $a$jscomp$13$$;
        $window$jscomp$28$$.$consumeRepeated$ = function($window$jscomp$28$$, $b$jscomp$14$$, $c$jscomp$7$$) {
          $window$jscomp$28$$ = $a$jscomp$13$$.bind(null, $window$jscomp$28$$);
          for (var $d$jscomp$2$$ = [];;) {
            var $a$jscomp$50$$ = $window$jscomp$28$$($c$jscomp$7$$);
            if (!$a$jscomp$50$$ || ($d$jscomp$2$$.push($a$jscomp$50$$[0]), $c$jscomp$7$$ = $a$jscomp$50$$[1], !($a$jscomp$50$$ = $document$jscomp$7$$($b$jscomp$14$$, $c$jscomp$7$$)) || "" == $a$jscomp$50$$[1])) {
              return [$d$jscomp$2$$, $c$jscomp$7$$];
            }
            $c$jscomp$7$$ = $a$jscomp$50$$[1];
          }
        };
        $window$jscomp$28$$.$consumeParenthesised$ = function($window$jscomp$28$$, $document$jscomp$7$$) {
          for (var $a$jscomp$13$$ = 0, $b$jscomp$14$$ = 0; $b$jscomp$14$$ < $document$jscomp$7$$.length && (!/\s|,/.test($document$jscomp$7$$[$b$jscomp$14$$]) || 0 != $a$jscomp$13$$); $b$jscomp$14$$++) {
            if ("(" == $document$jscomp$7$$[$b$jscomp$14$$]) {
              $a$jscomp$13$$++;
            } else {
              if (")" == $document$jscomp$7$$[$b$jscomp$14$$] && ($a$jscomp$13$$--, 0 == $a$jscomp$13$$ && $b$jscomp$14$$++, 0 >= $a$jscomp$13$$)) {
                break;
              }
            }
          }
          $window$jscomp$28$$ = $window$jscomp$28$$($document$jscomp$7$$.substr(0, $b$jscomp$14$$));
          return void 0 == $window$jscomp$28$$ ? void 0 : [$window$jscomp$28$$, $document$jscomp$7$$.substr($b$jscomp$14$$)];
        };
        $window$jscomp$28$$.$ignore$ = function($window$jscomp$28$$) {
          return function($document$jscomp$7$$) {
            $document$jscomp$7$$ = $window$jscomp$28$$($document$jscomp$7$$);
            return $document$jscomp$7$$ && ($document$jscomp$7$$[0] = void 0), $document$jscomp$7$$;
          };
        };
        $window$jscomp$28$$.optional = function($window$jscomp$28$$, $document$jscomp$7$$) {
          return function($a$jscomp$13$$) {
            return $window$jscomp$28$$($a$jscomp$13$$) || [$document$jscomp$7$$, $a$jscomp$13$$];
          };
        };
        $window$jscomp$28$$.$consumeList$ = function($document$jscomp$7$$, $a$jscomp$13$$) {
          for (var $b$jscomp$14$$ = [], $c$jscomp$7$$ = 0; $c$jscomp$7$$ < $document$jscomp$7$$.length; $c$jscomp$7$$++) {
            $a$jscomp$13$$ = $window$jscomp$28$$.$consumeTrimmed$($document$jscomp$7$$[$c$jscomp$7$$], $a$jscomp$13$$);
            if (!$a$jscomp$13$$ || "" == $a$jscomp$13$$[0]) {
              return;
            }
            void 0 !== $a$jscomp$13$$[0] && $b$jscomp$14$$.push($a$jscomp$13$$[0]);
            $a$jscomp$13$$ = $a$jscomp$13$$[1];
          }
          if ("" == $a$jscomp$13$$) {
            return $b$jscomp$14$$;
          }
        };
        $window$jscomp$28$$.$mergeNestedRepeated$ = $c$jscomp$7$$.bind(null, null);
        $window$jscomp$28$$.$mergeWrappedNestedRepeated$ = $c$jscomp$7$$;
        $window$jscomp$28$$.$mergeList$ = function($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$) {
          for (var $b$jscomp$14$$ = [], $c$jscomp$7$$ = [], $d$jscomp$2$$ = [], $a$jscomp$50$$ = 0, $b$jscomp$42$$ = 0; $b$jscomp$42$$ < $a$jscomp$13$$.length; $b$jscomp$42$$++) {
            if ("function" == typeof $a$jscomp$13$$[$b$jscomp$42$$]) {
              var $a$jscomp$122$$ = $a$jscomp$13$$[$b$jscomp$42$$]($window$jscomp$28$$[$a$jscomp$50$$], $document$jscomp$7$$[$a$jscomp$50$$++]);
              $b$jscomp$14$$.push($a$jscomp$122$$[0]);
              $c$jscomp$7$$.push($a$jscomp$122$$[1]);
              $d$jscomp$2$$.push($a$jscomp$122$$[2]);
            } else {
              !function($window$jscomp$28$$) {
                $b$jscomp$14$$.push(!1);
                $c$jscomp$7$$.push(!1);
                $d$jscomp$2$$.push(function() {
                  return $a$jscomp$13$$[$window$jscomp$28$$];
                });
              }($b$jscomp$42$$);
            }
          }
          return [$b$jscomp$14$$, $c$jscomp$7$$, function($window$jscomp$28$$) {
            for (var $document$jscomp$7$$ = "", $a$jscomp$13$$ = 0; $a$jscomp$13$$ < $window$jscomp$28$$.length; $a$jscomp$13$$++) {
              $document$jscomp$7$$ += $d$jscomp$2$$[$a$jscomp$13$$]($window$jscomp$28$$[$a$jscomp$13$$]);
            }
            return $document$jscomp$7$$;
          }];
        };
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($document$jscomp$7$$) {
          var $a$jscomp$13$$ = {$inset$:!1, $lengths$:[], color:null};
          if (($document$jscomp$7$$ = $window$jscomp$28$$.$consumeRepeated$(function($document$jscomp$7$$) {
            var $b$jscomp$14$$ = $window$jscomp$28$$.$consumeToken$(/^inset/i, $document$jscomp$7$$);
            return $b$jscomp$14$$ ? ($a$jscomp$13$$.$inset$ = !0, $b$jscomp$14$$) : ($b$jscomp$14$$ = $window$jscomp$28$$.$consumeLengthOrPercent$($document$jscomp$7$$)) ? ($a$jscomp$13$$.$lengths$.push($b$jscomp$14$$[0]), $b$jscomp$14$$) : ($b$jscomp$14$$ = $window$jscomp$28$$.$consumeColor$($document$jscomp$7$$)) ? ($a$jscomp$13$$.color = $b$jscomp$14$$[0], $b$jscomp$14$$) : void 0;
          }, /^/, $document$jscomp$7$$)) && $document$jscomp$7$$[0].length) {
            return [$a$jscomp$13$$, $document$jscomp$7$$[1]];
          }
        }
        var $a$jscomp$13$$ = function($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$, $c$jscomp$7$$) {
          function $d$jscomp$2$$($window$jscomp$28$$) {
            return {$inset$:$window$jscomp$28$$, color:[0, 0, 0, 0], $lengths$:[{$px$:0}, {$px$:0}, {$px$:0}, {$px$:0}]};
          }
          for (var $a$jscomp$50$$ = [], $b$jscomp$42$$ = [], $a$jscomp$135$$ = 0; $a$jscomp$135$$ < $b$jscomp$14$$.length || $a$jscomp$135$$ < $c$jscomp$7$$.length; $a$jscomp$135$$++) {
            var $b$jscomp$116$$ = $c$jscomp$7$$[$a$jscomp$135$$] || $d$jscomp$2$$($b$jscomp$14$$[$a$jscomp$135$$].$inset$);
            $a$jscomp$50$$.push($b$jscomp$14$$[$a$jscomp$135$$] || $d$jscomp$2$$($c$jscomp$7$$[$a$jscomp$135$$].$inset$));
            $b$jscomp$42$$.push($b$jscomp$116$$);
          }
          return $window$jscomp$28$$.$mergeNestedRepeated$($document$jscomp$7$$, $a$jscomp$13$$, $a$jscomp$50$$, $b$jscomp$42$$);
        }.bind(null, function($document$jscomp$7$$, $a$jscomp$13$$) {
          for (; $document$jscomp$7$$.$lengths$.length < Math.max($document$jscomp$7$$.$lengths$.length, $a$jscomp$13$$.$lengths$.length);) {
            $document$jscomp$7$$.$lengths$.push({$px$:0});
          }
          for (; $a$jscomp$13$$.$lengths$.length < Math.max($document$jscomp$7$$.$lengths$.length, $a$jscomp$13$$.$lengths$.length);) {
            $a$jscomp$13$$.$lengths$.push({$px$:0});
          }
          if ($document$jscomp$7$$.$inset$ == $a$jscomp$13$$.$inset$ && !!$document$jscomp$7$$.color == !!$a$jscomp$13$$.color) {
            for (var $b$jscomp$14$$, $c$jscomp$7$$ = [], $d$jscomp$2$$ = [[], 0], $a$jscomp$50$$ = [[], 0], $b$jscomp$42$$ = 0; $b$jscomp$42$$ < $document$jscomp$7$$.$lengths$.length; $b$jscomp$42$$++) {
              var $a$jscomp$135$$ = $window$jscomp$28$$.$mergeDimensions$($document$jscomp$7$$.$lengths$[$b$jscomp$42$$], $a$jscomp$13$$.$lengths$[$b$jscomp$42$$], 2 == $b$jscomp$42$$);
              $d$jscomp$2$$[0].push($a$jscomp$135$$[0]);
              $a$jscomp$50$$[0].push($a$jscomp$135$$[1]);
              $c$jscomp$7$$.push($a$jscomp$135$$[2]);
            }
            $document$jscomp$7$$.color && $a$jscomp$13$$.color && ($a$jscomp$13$$ = $window$jscomp$28$$.$mergeColors$($document$jscomp$7$$.color, $a$jscomp$13$$.color), $d$jscomp$2$$[1] = $a$jscomp$13$$[0], $a$jscomp$50$$[1] = $a$jscomp$13$$[1], $b$jscomp$14$$ = $a$jscomp$13$$[2]);
            return [$d$jscomp$2$$, $a$jscomp$50$$, function($window$jscomp$28$$) {
              for (var $a$jscomp$13$$ = $document$jscomp$7$$.$inset$ ? "inset " : " ", $d$jscomp$2$$ = 0; $d$jscomp$2$$ < $c$jscomp$7$$.length; $d$jscomp$2$$++) {
                $a$jscomp$13$$ += $c$jscomp$7$$[$d$jscomp$2$$]($window$jscomp$28$$[0][$d$jscomp$2$$]) + " ";
              }
              return $b$jscomp$14$$ && ($a$jscomp$13$$ += $b$jscomp$14$$($window$jscomp$28$$[1])), $a$jscomp$13$$;
            }];
          }
        }, ", ");
        $window$jscomp$28$$.$addPropertiesHandler$(function($a$jscomp$13$$) {
          if (($a$jscomp$13$$ = $window$jscomp$28$$.$consumeRepeated$($document$jscomp$7$$, /^,/, $a$jscomp$13$$)) && "" == $a$jscomp$13$$[1]) {
            return $a$jscomp$13$$[0];
          }
        }, $a$jscomp$13$$, ["box-shadow", "text-shadow"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$) {
          return $window$jscomp$28$$.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        }
        function $a$jscomp$13$$($window$jscomp$28$$, $document$jscomp$7$$, $a$jscomp$13$$) {
          return Math.min($document$jscomp$7$$, Math.max($window$jscomp$28$$, $a$jscomp$13$$));
        }
        function $b$jscomp$14$$($window$jscomp$28$$) {
          if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test($window$jscomp$28$$)) {
            return Number($window$jscomp$28$$);
          }
        }
        function $c$jscomp$7$$($window$jscomp$28$$, $b$jscomp$14$$) {
          return function($c$jscomp$7$$, $d$jscomp$2$$) {
            return [$c$jscomp$7$$, $d$jscomp$2$$, function($c$jscomp$7$$) {
              return $document$jscomp$7$$($a$jscomp$13$$($window$jscomp$28$$, $b$jscomp$14$$, $c$jscomp$7$$));
            }];
          };
        }
        function $d$jscomp$2$$($window$jscomp$28$$) {
          $window$jscomp$28$$ = $window$jscomp$28$$.trim().split(/\s*[\s,]\s*/);
          if (0 !== $window$jscomp$28$$.length) {
            for (var $document$jscomp$7$$ = [], $a$jscomp$13$$ = 0; $a$jscomp$13$$ < $window$jscomp$28$$.length; $a$jscomp$13$$++) {
              var $c$jscomp$7$$ = $b$jscomp$14$$($window$jscomp$28$$[$a$jscomp$13$$]);
              if (void 0 === $c$jscomp$7$$) {
                return;
              }
              $document$jscomp$7$$.push($c$jscomp$7$$);
            }
            return $document$jscomp$7$$;
          }
        }
        $window$jscomp$28$$.$clamp$ = $a$jscomp$13$$;
        $window$jscomp$28$$.$addPropertiesHandler$($d$jscomp$2$$, function($window$jscomp$28$$, $a$jscomp$13$$) {
          if ($window$jscomp$28$$.length == $a$jscomp$13$$.length) {
            return [$window$jscomp$28$$, $a$jscomp$13$$, function($window$jscomp$28$$) {
              return $window$jscomp$28$$.map($document$jscomp$7$$).join(" ");
            }];
          }
        }, ["stroke-dasharray"]);
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, $c$jscomp$7$$(0, 1 / 0), ["border-image-width", "line-height"]);
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, $c$jscomp$7$$(0, 1), ["opacity", "shape-image-threshold"]);
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, function($window$jscomp$28$$, $document$jscomp$7$$) {
          if (0 != $window$jscomp$28$$) {
            return $c$jscomp$7$$(0, 1 / 0)($window$jscomp$28$$, $document$jscomp$7$$);
          }
        }, ["flex-grow", "flex-shrink"]);
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, function($window$jscomp$28$$, $document$jscomp$7$$) {
          return [$window$jscomp$28$$, $document$jscomp$7$$, function($window$jscomp$28$$) {
            return Math.round($a$jscomp$13$$(1, 1 / 0, $window$jscomp$28$$));
          }];
        }, ["orphans", "widows"]);
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, function($window$jscomp$28$$, $document$jscomp$7$$) {
          return [$window$jscomp$28$$, $document$jscomp$7$$, Math.round];
        }, ["z-index"]);
        $window$jscomp$28$$.$parseNumber$ = $b$jscomp$14$$;
        $window$jscomp$28$$.$parseNumberList$ = $d$jscomp$2$$;
        $window$jscomp$28$$.$mergeNumbers$ = function($window$jscomp$28$$, $a$jscomp$13$$) {
          return [$window$jscomp$28$$, $a$jscomp$13$$, $document$jscomp$7$$];
        };
        $window$jscomp$28$$.$numberToString$ = $document$jscomp$7$$;
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        $window$jscomp$28$$.$addPropertiesHandler$(String, function($window$jscomp$28$$, $document$jscomp$7$$) {
          if ("visible" == $window$jscomp$28$$ || "visible" == $document$jscomp$7$$) {
            return [0, 1, function($a$jscomp$13$$) {
              return 0 >= $a$jscomp$13$$ ? $window$jscomp$28$$ : 1 <= $a$jscomp$13$$ ? $document$jscomp$7$$ : "visible";
            }];
          }
        }, ["visibility"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $a$jscomp$13$$($window$jscomp$28$$) {
          $window$jscomp$28$$ = $window$jscomp$28$$.trim();
          $d$jscomp$2$$.fillStyle = "#000";
          $d$jscomp$2$$.fillStyle = $window$jscomp$28$$;
          var $document$jscomp$7$$ = $d$jscomp$2$$.fillStyle;
          if ($d$jscomp$2$$.fillStyle = "#fff", $d$jscomp$2$$.fillStyle = $window$jscomp$28$$, $document$jscomp$7$$ == $d$jscomp$2$$.fillStyle) {
            return $d$jscomp$2$$.fillRect(0, 0, 1, 1), $window$jscomp$28$$ = $d$jscomp$2$$.getImageData(0, 0, 1, 1).data, $d$jscomp$2$$.clearRect(0, 0, 1, 1), $document$jscomp$7$$ = $window$jscomp$28$$[3] / 255, [$window$jscomp$28$$[0] * $document$jscomp$7$$, $window$jscomp$28$$[1] * $document$jscomp$7$$, $window$jscomp$28$$[2] * $document$jscomp$7$$, $document$jscomp$7$$];
          }
        }
        function $b$jscomp$14$$($document$jscomp$7$$, $a$jscomp$13$$) {
          return [$document$jscomp$7$$, $a$jscomp$13$$, function($document$jscomp$7$$) {
            if ($document$jscomp$7$$[3]) {
              for (var $a$jscomp$13$$ = 0; 3 > $a$jscomp$13$$; $a$jscomp$13$$++) {
                $document$jscomp$7$$[$a$jscomp$13$$] = Math.round(Math.max(0, Math.min(255, $document$jscomp$7$$[$a$jscomp$13$$] / $document$jscomp$7$$[3])));
              }
            }
            return $document$jscomp$7$$[3] = $window$jscomp$28$$.$numberToString$($window$jscomp$28$$.$clamp$(0, 1, $document$jscomp$7$$[3])), "rgba(" + $document$jscomp$7$$.join(",") + ")";
          }];
        }
        var $c$jscomp$7$$ = $document$jscomp$7$$.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        $c$jscomp$7$$.width = $c$jscomp$7$$.height = 1;
        var $d$jscomp$2$$ = $c$jscomp$7$$.getContext("2d");
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$13$$, $b$jscomp$14$$, "background-color border-bottom-color border-left-color border-right-color border-top-color color fill flood-color lighting-color outline-color stop-color stroke text-decoration-color".split(" "));
        $window$jscomp$28$$.$consumeColor$ = $window$jscomp$28$$.$consumeParenthesised$.bind(null, $a$jscomp$13$$);
        $window$jscomp$28$$.$mergeColors$ = $b$jscomp$14$$;
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$) {
          function $document$jscomp$7$$() {
            var $document$jscomp$7$$ = $a$jscomp$50$$.exec($window$jscomp$28$$);
            $d$jscomp$2$$ = $document$jscomp$7$$ ? $document$jscomp$7$$[0] : void 0;
          }
          function $a$jscomp$13$$() {
            if ("(" !== $d$jscomp$2$$) {
              var $window$jscomp$28$$ = Number($d$jscomp$2$$);
              return $document$jscomp$7$$(), $window$jscomp$28$$;
            }
            $document$jscomp$7$$();
            $window$jscomp$28$$ = $c$jscomp$7$$();
            return ")" !== $d$jscomp$2$$ ? window.NaN : ($document$jscomp$7$$(), $window$jscomp$28$$);
          }
          function $b$jscomp$14$$() {
            for (var $window$jscomp$28$$ = $a$jscomp$13$$(); "*" === $d$jscomp$2$$ || "/" === $d$jscomp$2$$;) {
              var $b$jscomp$14$$ = $d$jscomp$2$$;
              $document$jscomp$7$$();
              var $c$jscomp$7$$ = $a$jscomp$13$$();
              "*" === $b$jscomp$14$$ ? $window$jscomp$28$$ *= $c$jscomp$7$$ : $window$jscomp$28$$ /= $c$jscomp$7$$;
            }
            return $window$jscomp$28$$;
          }
          function $c$jscomp$7$$() {
            for (var $window$jscomp$28$$ = $b$jscomp$14$$(); "+" === $d$jscomp$2$$ || "-" === $d$jscomp$2$$;) {
              var $a$jscomp$13$$ = $d$jscomp$2$$;
              $document$jscomp$7$$();
              var $c$jscomp$7$$ = $b$jscomp$14$$();
              "+" === $a$jscomp$13$$ ? $window$jscomp$28$$ += $c$jscomp$7$$ : $window$jscomp$28$$ -= $c$jscomp$7$$;
            }
            return $window$jscomp$28$$;
          }
          var $d$jscomp$2$$, $a$jscomp$50$$ = /([\+\-\w\.]+|[\(\)\*\/])/g;
          return $document$jscomp$7$$(), $c$jscomp$7$$();
        }
        function $a$jscomp$13$$($window$jscomp$28$$, $a$jscomp$13$$) {
          if ("0" == ($a$jscomp$13$$ = $a$jscomp$13$$.trim().toLowerCase()) && 0 <= "px".search($window$jscomp$28$$)) {
            return {$px$:0};
          }
          if (/^[^(]*$|^calc/.test($a$jscomp$13$$)) {
            $a$jscomp$13$$ = $a$jscomp$13$$.replace(/calc\(/g, "(");
            var $b$jscomp$14$$ = {};
            $a$jscomp$13$$ = $a$jscomp$13$$.replace($window$jscomp$28$$, function($window$jscomp$28$$) {
              return $b$jscomp$14$$[$window$jscomp$28$$] = null, "U" + $window$jscomp$28$$;
            });
            $window$jscomp$28$$ = "U(" + $window$jscomp$28$$.source + ")";
            for (var $c$jscomp$7$$ = $a$jscomp$13$$.replace(/[-+]?(\d*\.)?\d+([Ee][-+]?\d+)?/g, "N").replace(new RegExp("N" + $window$jscomp$28$$, "g"), "D").replace(/\s[+-]\s/g, "O").replace(/\s/g, ""), $d$jscomp$2$$ = [/N\*(D)/g, /(N|D)[*\/]N/g, /(N|D)O\1/g, /\((N|D)\)/g], $a$jscomp$50$$ = 0; $a$jscomp$50$$ < $d$jscomp$2$$.length;) {
              $d$jscomp$2$$[$a$jscomp$50$$].test($c$jscomp$7$$) ? ($c$jscomp$7$$ = $c$jscomp$7$$.replace($d$jscomp$2$$[$a$jscomp$50$$], "$1"), $a$jscomp$50$$ = 0) : $a$jscomp$50$$++;
            }
            if ("D" == $c$jscomp$7$$) {
              for (var $b$jscomp$42$$ in $b$jscomp$14$$) {
                $c$jscomp$7$$ = $document$jscomp$7$$($a$jscomp$13$$.replace(new RegExp("U" + $b$jscomp$42$$, "g"), "").replace(new RegExp($window$jscomp$28$$, "g"), "*0"));
                if (!(0,window.isFinite)($c$jscomp$7$$)) {
                  return;
                }
                $b$jscomp$14$$[$b$jscomp$42$$] = $c$jscomp$7$$;
              }
              return $b$jscomp$14$$;
            }
          }
        }
        function $b$jscomp$14$$($window$jscomp$28$$, $document$jscomp$7$$) {
          return $c$jscomp$7$$($window$jscomp$28$$, $document$jscomp$7$$, !0);
        }
        function $c$jscomp$7$$($document$jscomp$7$$, $a$jscomp$13$$, $b$jscomp$14$$) {
          var $c$jscomp$7$$, $d$jscomp$2$$ = [];
          for ($c$jscomp$7$$ in $document$jscomp$7$$) {
            $d$jscomp$2$$.push($c$jscomp$7$$);
          }
          for ($c$jscomp$7$$ in $a$jscomp$13$$) {
            0 > $d$jscomp$2$$.indexOf($c$jscomp$7$$) && $d$jscomp$2$$.push($c$jscomp$7$$);
          }
          return $document$jscomp$7$$ = $d$jscomp$2$$.map(function($window$jscomp$28$$) {
            return $document$jscomp$7$$[$window$jscomp$28$$] || 0;
          }), $a$jscomp$13$$ = $d$jscomp$2$$.map(function($window$jscomp$28$$) {
            return $a$jscomp$13$$[$window$jscomp$28$$] || 0;
          }), [$document$jscomp$7$$, $a$jscomp$13$$, function($document$jscomp$7$$) {
            var $a$jscomp$13$$ = $document$jscomp$7$$.map(function($a$jscomp$13$$, $c$jscomp$7$$) {
              return 1 == $document$jscomp$7$$.length && $b$jscomp$14$$ && ($a$jscomp$13$$ = Math.max($a$jscomp$13$$, 0)), $window$jscomp$28$$.$numberToString$($a$jscomp$13$$) + $d$jscomp$2$$[$c$jscomp$7$$];
            }).join(" + ");
            return 1 < $document$jscomp$7$$.length ? "calc(" + $a$jscomp$13$$ + ")" : $a$jscomp$13$$;
          }];
        }
        var $d$jscomp$2$$ = $a$jscomp$13$$.bind(null, /px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc/g), $a$jscomp$50$$ = $a$jscomp$13$$.bind(null, /px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|%/g), $b$jscomp$42$$ = $a$jscomp$13$$.bind(null, /deg|rad|grad|turn/g);
        $window$jscomp$28$$.$parseLength$ = $d$jscomp$2$$;
        $window$jscomp$28$$.$parseLengthOrPercent$ = $a$jscomp$50$$;
        $window$jscomp$28$$.$consumeLengthOrPercent$ = $window$jscomp$28$$.$consumeParenthesised$.bind(null, $a$jscomp$50$$);
        $window$jscomp$28$$.$parseAngle$ = $b$jscomp$42$$;
        $window$jscomp$28$$.$mergeDimensions$ = $c$jscomp$7$$;
        $d$jscomp$2$$ = $window$jscomp$28$$.$consumeParenthesised$.bind(null, $d$jscomp$2$$);
        $d$jscomp$2$$ = $window$jscomp$28$$.$consumeRepeated$.bind(void 0, $d$jscomp$2$$, /^/);
        var $a$jscomp$156$$ = $window$jscomp$28$$.$consumeRepeated$.bind(void 0, $d$jscomp$2$$, /^,/);
        $window$jscomp$28$$.$consumeSizePairList$ = $a$jscomp$156$$;
        $d$jscomp$2$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(void 0, $b$jscomp$14$$, " ");
        $b$jscomp$42$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(void 0, $d$jscomp$2$$, ",");
        $window$jscomp$28$$.$mergeNonNegativeSizePair$ = $d$jscomp$2$$;
        $window$jscomp$28$$.$addPropertiesHandler$(function($window$jscomp$28$$) {
          if (($window$jscomp$28$$ = $a$jscomp$156$$($window$jscomp$28$$)) && "" == $window$jscomp$28$$[1]) {
            return $window$jscomp$28$$[0];
          }
        }, $b$jscomp$42$$, ["background-size"]);
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$50$$, $b$jscomp$14$$, "border-bottom-width border-image-width border-left-width border-right-width border-top-width flex-basis font-size height line-height max-height max-width outline-width width".split(" "));
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$50$$, $c$jscomp$7$$, "border-bottom-left-radius border-bottom-right-radius border-top-left-radius border-top-right-radius bottom left letter-spacing margin-bottom margin-left margin-right margin-top min-height min-width outline-offset padding-bottom padding-left padding-right padding-top perspective right shape-margin stroke-dashoffset text-indent top vertical-align word-spacing".split(" "));
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($document$jscomp$7$$) {
          return $window$jscomp$28$$.$consumeLengthOrPercent$($document$jscomp$7$$) || $window$jscomp$28$$.$consumeToken$(/^auto/, $document$jscomp$7$$);
        }
        function $a$jscomp$13$$($a$jscomp$13$$) {
          if (($a$jscomp$13$$ = $window$jscomp$28$$.$consumeList$([$window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(null, /^rect/)), $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(null, /^\(/)), $window$jscomp$28$$.$consumeRepeated$.bind(null, $document$jscomp$7$$, /^,/), $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(null, /^\)/))], $a$jscomp$13$$)) && 4 == $a$jscomp$13$$[0].length) {
            return $a$jscomp$13$$[0];
          }
        }
        var $b$jscomp$14$$ = $window$jscomp$28$$.$mergeWrappedNestedRepeated$.bind(null, function($window$jscomp$28$$) {
          return "rect(" + $window$jscomp$28$$ + ")";
        }, function($document$jscomp$7$$, $a$jscomp$13$$) {
          return "auto" == $document$jscomp$7$$ || "auto" == $a$jscomp$13$$ ? [!0, !1, function($b$jscomp$14$$) {
            $b$jscomp$14$$ = $b$jscomp$14$$ ? $document$jscomp$7$$ : $a$jscomp$13$$;
            if ("auto" == $b$jscomp$14$$) {
              return "auto";
            }
            $b$jscomp$14$$ = $window$jscomp$28$$.$mergeDimensions$($b$jscomp$14$$, $b$jscomp$14$$);
            return $b$jscomp$14$$[2]($b$jscomp$14$$[0]);
          }] : $window$jscomp$28$$.$mergeDimensions$($document$jscomp$7$$, $a$jscomp$13$$);
        }, ", ");
        $window$jscomp$28$$.$parseBox$ = $a$jscomp$13$$;
        $window$jscomp$28$$.$mergeBoxes$ = $b$jscomp$14$$;
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$13$$, $b$jscomp$14$$, ["clip"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($window$jscomp$28$$) {
          return function($document$jscomp$7$$) {
            var $a$jscomp$13$$ = 0;
            return $window$jscomp$28$$.map(function($window$jscomp$28$$) {
              return $window$jscomp$28$$ === $b$jscomp$42$$ ? $document$jscomp$7$$[$a$jscomp$13$$++] : $window$jscomp$28$$;
            });
          };
        }
        function $a$jscomp$13$$($window$jscomp$28$$) {
          return $window$jscomp$28$$;
        }
        function $b$jscomp$14$$($document$jscomp$7$$) {
          if ("none" == ($document$jscomp$7$$ = $document$jscomp$7$$.toLowerCase().trim())) {
            return [];
          }
          for (var $a$jscomp$13$$, $b$jscomp$14$$ = /\s*(\w+)\(([^)]*)\)/g, $c$jscomp$7$$ = [], $d$jscomp$2$$ = 0; ($a$jscomp$13$$ = $b$jscomp$14$$.exec($document$jscomp$7$$)) && $a$jscomp$13$$.index == $d$jscomp$2$$;) {
            $d$jscomp$2$$ = $a$jscomp$13$$.index + $a$jscomp$13$$[0].length;
            var $a$jscomp$50$$ = $a$jscomp$13$$[1], $b$jscomp$42$$ = $n$jscomp$29$$[$a$jscomp$50$$];
            if (!$b$jscomp$42$$) {
              break;
            }
            $a$jscomp$13$$ = $a$jscomp$13$$[2].split(",");
            $b$jscomp$42$$ = $b$jscomp$42$$[0];
            if ($b$jscomp$42$$.length < $a$jscomp$13$$.length) {
              break;
            }
            for (var $c$jscomp$111$$ = [], $d$jscomp$77$$ = 0; $d$jscomp$77$$ < $b$jscomp$42$$.length; $d$jscomp$77$$++) {
              var $e$jscomp$181$$ = $a$jscomp$13$$[$d$jscomp$77$$];
              var $i$jscomp$241$$ = $b$jscomp$42$$[$d$jscomp$77$$];
              if (void 0 === ($e$jscomp$181$$ = $e$jscomp$181$$ ? {$A$:function($document$jscomp$7$$) {
                return "0" == $document$jscomp$7$$.trim() ? $m$jscomp$12$$ : $window$jscomp$28$$.$parseAngle$($document$jscomp$7$$);
              }, $N$:$window$jscomp$28$$.$parseNumber$, $T$:$window$jscomp$28$$.$parseLengthOrPercent$, $L$:$window$jscomp$28$$.$parseLength$}[$i$jscomp$241$$.toUpperCase()]($e$jscomp$181$$) : {a:$m$jscomp$12$$, n:$c$jscomp$111$$[0], t:$a$jscomp$170$$}[$i$jscomp$241$$])) {
                return;
              }
              $c$jscomp$111$$.push($e$jscomp$181$$);
            }
            if ($c$jscomp$7$$.push({t:$a$jscomp$50$$, d:$c$jscomp$111$$}), $b$jscomp$14$$.lastIndex == $document$jscomp$7$$.length) {
              return $c$jscomp$7$$;
            }
          }
        }
        function $c$jscomp$7$$($window$jscomp$28$$) {
          return $window$jscomp$28$$.toFixed(6).replace(".000000", "");
        }
        function $d$jscomp$2$$($document$jscomp$7$$, $a$jscomp$13$$) {
          if ($document$jscomp$7$$.$decompositionPair$ !== $a$jscomp$13$$) {
            $document$jscomp$7$$.$decompositionPair$ = $a$jscomp$13$$;
            var $b$jscomp$14$$ = $window$jscomp$28$$.$makeMatrixDecomposition$($document$jscomp$7$$);
          }
          if ($a$jscomp$13$$.$decompositionPair$ !== $document$jscomp$7$$) {
            $a$jscomp$13$$.$decompositionPair$ = $document$jscomp$7$$;
            var $d$jscomp$2$$ = $window$jscomp$28$$.$makeMatrixDecomposition$($a$jscomp$13$$);
          }
          return null == $b$jscomp$14$$[0] || null == $d$jscomp$2$$[0] ? [[!1], [!0], function($window$jscomp$28$$) {
            return $window$jscomp$28$$ ? $a$jscomp$13$$[0].d : $document$jscomp$7$$[0].d;
          }] : ($b$jscomp$14$$[0].push(0), $d$jscomp$2$$[0].push(1), [$b$jscomp$14$$, $d$jscomp$2$$, function($document$jscomp$7$$) {
            var $a$jscomp$13$$ = $window$jscomp$28$$.$quat$($b$jscomp$14$$[0][3], $d$jscomp$2$$[0][3], $document$jscomp$7$$[5]);
            return $window$jscomp$28$$.$composeMatrix$($document$jscomp$7$$[0], $document$jscomp$7$$[1], $document$jscomp$7$$[2], $a$jscomp$13$$, $document$jscomp$7$$[4]).map($c$jscomp$7$$).join(",");
          }]);
        }
        function $a$jscomp$50$$($window$jscomp$28$$) {
          return $window$jscomp$28$$.replace(/(x|y|z|3d)?$/, "3d");
        }
        var $b$jscomp$42$$ = null, $a$jscomp$170$$ = {$px$:0}, $m$jscomp$12$$ = {$deg$:0}, $n$jscomp$29$$ = {$matrix$:["NNNNNN", [$b$jscomp$42$$, $b$jscomp$42$$, 0, 0, $b$jscomp$42$$, $b$jscomp$42$$, 0, 0, 0, 0, 1, 0, $b$jscomp$42$$, $b$jscomp$42$$, 0, 1], $a$jscomp$13$$], $matrix3d$:["NNNNNNNNNNNNNNNN", $a$jscomp$13$$], rotate:["A"], $rotatex$:["A"], $rotatey$:["A"], $rotatez$:["A"], $rotate3d$:["NNNA"], perspective:["L"], scale:["Nn", $document$jscomp$7$$([$b$jscomp$42$$, $b$jscomp$42$$, 1]), $a$jscomp$13$$], 
        $scalex$:["N", $document$jscomp$7$$([$b$jscomp$42$$, 1, 1]), $document$jscomp$7$$([$b$jscomp$42$$, 1])], $scaley$:["N", $document$jscomp$7$$([1, $b$jscomp$42$$, 1]), $document$jscomp$7$$([1, $b$jscomp$42$$])], $scalez$:["N", $document$jscomp$7$$([1, 1, $b$jscomp$42$$])], $scale3d$:["NNN", $a$jscomp$13$$], $skew$:["Aa", null, $a$jscomp$13$$], $skewx$:["A", null, $document$jscomp$7$$([$b$jscomp$42$$, $m$jscomp$12$$])], $skewy$:["A", null, $document$jscomp$7$$([$m$jscomp$12$$, $b$jscomp$42$$])], 
        translate:["Tt", $document$jscomp$7$$([$b$jscomp$42$$, $b$jscomp$42$$, $a$jscomp$170$$]), $a$jscomp$13$$], $translatex$:["T", $document$jscomp$7$$([$b$jscomp$42$$, $a$jscomp$170$$, $a$jscomp$170$$]), $document$jscomp$7$$([$b$jscomp$42$$, $a$jscomp$170$$])], $translatey$:["T", $document$jscomp$7$$([$a$jscomp$170$$, $b$jscomp$42$$, $a$jscomp$170$$]), $document$jscomp$7$$([$a$jscomp$170$$, $b$jscomp$42$$])], $translatez$:["L", $document$jscomp$7$$([$a$jscomp$170$$, $a$jscomp$170$$, $b$jscomp$42$$])], 
        $translate3d$:["TTL", $a$jscomp$13$$]};
        $window$jscomp$28$$.$addPropertiesHandler$($b$jscomp$14$$, function($document$jscomp$7$$, $a$jscomp$13$$) {
          var $b$jscomp$14$$ = $window$jscomp$28$$.$makeMatrixDecomposition$ && !0, $c$jscomp$7$$ = !1;
          if (!$document$jscomp$7$$.length || !$a$jscomp$13$$.length) {
            $document$jscomp$7$$.length || ($c$jscomp$7$$ = !0, $document$jscomp$7$$ = $a$jscomp$13$$, $a$jscomp$13$$ = []);
            for (var $b$jscomp$42$$ = 0; $b$jscomp$42$$ < $document$jscomp$7$$.length; $b$jscomp$42$$++) {
              var $a$jscomp$170$$ = $document$jscomp$7$$[$b$jscomp$42$$].t, $c$jscomp$111$$ = "scale" == $a$jscomp$170$$.substr(0, 5) ? 1 : 0;
              $a$jscomp$13$$.push({t:$a$jscomp$170$$, d:$document$jscomp$7$$[$b$jscomp$42$$].d.map(function($window$jscomp$28$$) {
                if ("number" == typeof $window$jscomp$28$$) {
                  return $c$jscomp$111$$;
                }
                var $document$jscomp$7$$ = {}, $a$jscomp$13$$;
                for ($a$jscomp$13$$ in $window$jscomp$28$$) {
                  $document$jscomp$7$$[$a$jscomp$13$$] = $c$jscomp$111$$;
                }
                return $document$jscomp$7$$;
              })});
            }
          }
          var $d$jscomp$77$$ = [], $e$jscomp$181$$ = [], $i$jscomp$241$$ = [];
          if ($document$jscomp$7$$.length != $a$jscomp$13$$.length) {
            if (!$b$jscomp$14$$) {
              return;
            }
            var $f$jscomp$54$$ = $d$jscomp$2$$($document$jscomp$7$$, $a$jscomp$13$$);
            $d$jscomp$77$$ = [$f$jscomp$54$$[0]];
            $e$jscomp$181$$ = [$f$jscomp$54$$[1]];
            $i$jscomp$241$$ = [["matrix", [$f$jscomp$54$$[2]]]];
          } else {
            for ($b$jscomp$42$$ = 0; $b$jscomp$42$$ < $document$jscomp$7$$.length; $b$jscomp$42$$++) {
              $a$jscomp$170$$ = $document$jscomp$7$$[$b$jscomp$42$$].t;
              var $t$jscomp$11_z$jscomp$12$$ = $a$jscomp$13$$[$b$jscomp$42$$].t, $k$jscomp$45$$ = $document$jscomp$7$$[$b$jscomp$42$$].d, $g$jscomp$37$$ = $a$jscomp$13$$[$b$jscomp$42$$].d;
              $f$jscomp$54$$ = $n$jscomp$29$$[$a$jscomp$170$$];
              var $x$jscomp$89_y$jscomp$66$$ = $n$jscomp$29$$[$t$jscomp$11_z$jscomp$12$$];
              if ("perspective" == $a$jscomp$170$$ && "perspective" == $t$jscomp$11_z$jscomp$12$$ || !("matrix" != $a$jscomp$170$$ && "matrix3d" != $a$jscomp$170$$ || "matrix" != $t$jscomp$11_z$jscomp$12$$ && "matrix3d" != $t$jscomp$11_z$jscomp$12$$)) {
                if (!$b$jscomp$14$$) {
                  return;
                }
                $f$jscomp$54$$ = $d$jscomp$2$$([$document$jscomp$7$$[$b$jscomp$42$$]], [$a$jscomp$13$$[$b$jscomp$42$$]]);
                $d$jscomp$77$$.push($f$jscomp$54$$[0]);
                $e$jscomp$181$$.push($f$jscomp$54$$[1]);
                $i$jscomp$241$$.push(["matrix", [$f$jscomp$54$$[2]]]);
              } else {
                if ($a$jscomp$170$$ != $t$jscomp$11_z$jscomp$12$$) {
                  if ($f$jscomp$54$$[2] && $x$jscomp$89_y$jscomp$66$$[2] && $a$jscomp$170$$.replace(/[xy]/, "") == $t$jscomp$11_z$jscomp$12$$.replace(/[xy]/, "")) {
                    $a$jscomp$170$$ = $a$jscomp$170$$.replace(/[xy]/, ""), $k$jscomp$45$$ = $f$jscomp$54$$[2]($k$jscomp$45$$), $g$jscomp$37$$ = $x$jscomp$89_y$jscomp$66$$[2]($g$jscomp$37$$);
                  } else {
                    if (!$f$jscomp$54$$[1] || !$x$jscomp$89_y$jscomp$66$$[1] || $a$jscomp$50$$($a$jscomp$170$$) != $a$jscomp$50$$($t$jscomp$11_z$jscomp$12$$)) {
                      if (!$b$jscomp$14$$) {
                        return;
                      }
                      $f$jscomp$54$$ = $d$jscomp$2$$($document$jscomp$7$$, $a$jscomp$13$$);
                      $d$jscomp$77$$ = [$f$jscomp$54$$[0]];
                      $e$jscomp$181$$ = [$f$jscomp$54$$[1]];
                      $i$jscomp$241$$ = [["matrix", [$f$jscomp$54$$[2]]]];
                      break;
                    }
                    $a$jscomp$170$$ = $a$jscomp$50$$($a$jscomp$170$$);
                    $k$jscomp$45$$ = $f$jscomp$54$$[1]($k$jscomp$45$$);
                    $g$jscomp$37$$ = $x$jscomp$89_y$jscomp$66$$[1]($g$jscomp$37$$);
                  }
                }
                $x$jscomp$89_y$jscomp$66$$ = [];
                $t$jscomp$11_z$jscomp$12$$ = [];
                for (var $A$jscomp$1$$ = [], $B$jscomp$1$$ = 0; $B$jscomp$1$$ < $k$jscomp$45$$.length; $B$jscomp$1$$++) {
                  $f$jscomp$54$$ = ("number" == typeof $k$jscomp$45$$[$B$jscomp$1$$] ? $window$jscomp$28$$.$mergeNumbers$ : $window$jscomp$28$$.$mergeDimensions$)($k$jscomp$45$$[$B$jscomp$1$$], $g$jscomp$37$$[$B$jscomp$1$$]), $x$jscomp$89_y$jscomp$66$$[$B$jscomp$1$$] = $f$jscomp$54$$[0], $t$jscomp$11_z$jscomp$12$$[$B$jscomp$1$$] = $f$jscomp$54$$[1], $A$jscomp$1$$.push($f$jscomp$54$$[2]);
                }
                $d$jscomp$77$$.push($x$jscomp$89_y$jscomp$66$$);
                $e$jscomp$181$$.push($t$jscomp$11_z$jscomp$12$$);
                $i$jscomp$241$$.push([$a$jscomp$170$$, $A$jscomp$1$$]);
              }
            }
          }
          $c$jscomp$7$$ && ($document$jscomp$7$$ = $d$jscomp$77$$, $d$jscomp$77$$ = $e$jscomp$181$$, $e$jscomp$181$$ = $document$jscomp$7$$);
          return [$d$jscomp$77$$, $e$jscomp$181$$, function($window$jscomp$28$$) {
            return $window$jscomp$28$$.map(function($window$jscomp$28$$, $document$jscomp$7$$) {
              $window$jscomp$28$$ = $window$jscomp$28$$.map(function($window$jscomp$28$$, $a$jscomp$13$$) {
                return $i$jscomp$241$$[$document$jscomp$7$$][1][$a$jscomp$13$$]($window$jscomp$28$$);
              }).join(",");
              return "matrix" == $i$jscomp$241$$[$document$jscomp$7$$][0] && 16 == $window$jscomp$28$$.split(",").length && ($i$jscomp$241$$[$document$jscomp$7$$][0] = "matrix3d"), $i$jscomp$241$$[$document$jscomp$7$$][0] + "(" + $window$jscomp$28$$ + ")";
            }).join(" ");
          }];
        }, ["transform"]);
        $window$jscomp$28$$.$transformToSvgMatrix$ = function($document$jscomp$7$$) {
          $document$jscomp$7$$ = $window$jscomp$28$$.$transformListToMatrix$($b$jscomp$14$$($document$jscomp$7$$));
          return "matrix(" + $c$jscomp$7$$($document$jscomp$7$$[0]) + " " + $c$jscomp$7$$($document$jscomp$7$$[1]) + " " + $c$jscomp$7$$($document$jscomp$7$$[4]) + " " + $c$jscomp$7$$($document$jscomp$7$$[5]) + " " + $c$jscomp$7$$($document$jscomp$7$$[12]) + " " + $c$jscomp$7$$($document$jscomp$7$$[13]) + ")";
        };
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($document$jscomp$7$$) {
          return $document$jscomp$7$$ = 100 * Math.round($document$jscomp$7$$ / 100), $document$jscomp$7$$ = $window$jscomp$28$$.$clamp$(100, 900, $document$jscomp$7$$), 400 === $document$jscomp$7$$ ? "normal" : 700 === $document$jscomp$7$$ ? "bold" : String($document$jscomp$7$$);
        }
        $window$jscomp$28$$.$addPropertiesHandler$(function($window$jscomp$28$$) {
          $window$jscomp$28$$ = Number($window$jscomp$28$$);
          if (!((0,window.isNaN)($window$jscomp$28$$) || 100 > $window$jscomp$28$$ || 900 < $window$jscomp$28$$ || 0 != $window$jscomp$28$$ % 100)) {
            return $window$jscomp$28$$;
          }
        }, function($window$jscomp$28$$, $a$jscomp$13$$) {
          return [$window$jscomp$28$$, $a$jscomp$13$$, $document$jscomp$7$$];
        }, ["font-weight"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $document$jscomp$7$$($document$jscomp$7$$) {
          return $window$jscomp$28$$.$consumeToken$(/^(left|center|right|top|bottom)\b/i, $document$jscomp$7$$) || $window$jscomp$28$$.$consumeLengthOrPercent$($document$jscomp$7$$);
        }
        function $a$jscomp$13$$($a$jscomp$13$$, $b$jscomp$14$$) {
          if (($b$jscomp$14$$ = $window$jscomp$28$$.$consumeRepeated$($document$jscomp$7$$, /^/, $b$jscomp$14$$)) && "" == $b$jscomp$14$$[1] && ($b$jscomp$14$$ = $b$jscomp$14$$[0], $b$jscomp$14$$[0] = $b$jscomp$14$$[0] || "center", $b$jscomp$14$$[1] = $b$jscomp$14$$[1] || "center", 3 == $a$jscomp$13$$ && ($b$jscomp$14$$[2] = $b$jscomp$14$$[2] || {$px$:0}), $b$jscomp$14$$.length == $a$jscomp$13$$)) {
            if (/top|bottom/.test($b$jscomp$14$$[0]) || /left|right/.test($b$jscomp$14$$[1])) {
              $a$jscomp$13$$ = $b$jscomp$14$$[0], $b$jscomp$14$$[0] = $b$jscomp$14$$[1], $b$jscomp$14$$[1] = $a$jscomp$13$$;
            }
            if (/left|right|center|Object/.test($b$jscomp$14$$[0]) && /top|bottom|center|Object/.test($b$jscomp$14$$[1])) {
              return $b$jscomp$14$$.map(function($window$jscomp$28$$) {
                return "object" == typeof $window$jscomp$28$$ ? $window$jscomp$28$$ : $c$jscomp$7$$[$window$jscomp$28$$];
              });
            }
          }
        }
        function $b$jscomp$14$$($a$jscomp$13$$) {
          if ($a$jscomp$13$$ = $window$jscomp$28$$.$consumeRepeated$($document$jscomp$7$$, /^/, $a$jscomp$13$$)) {
            for (var $b$jscomp$14$$ = $a$jscomp$13$$[0], $d$jscomp$2$$ = [{"%":50}, {"%":50}], $a$jscomp$50$$ = 0, $b$jscomp$42$$ = !1, $a$jscomp$186$$ = 0; $a$jscomp$186$$ < $b$jscomp$14$$.length; $a$jscomp$186$$++) {
              var $c$jscomp$122$$ = $b$jscomp$14$$[$a$jscomp$186$$];
              if ("string" == typeof $c$jscomp$122$$) {
                $b$jscomp$42$$ = /bottom|right/.test($c$jscomp$122$$), $a$jscomp$50$$ = {left:0, right:0, $center$:$a$jscomp$50$$, top:1, bottom:1}[$c$jscomp$122$$], $d$jscomp$2$$[$a$jscomp$50$$] = $c$jscomp$7$$[$c$jscomp$122$$], "center" == $c$jscomp$122$$ && $a$jscomp$50$$++;
              } else {
                if ($b$jscomp$42$$) {
                  $b$jscomp$42$$ = void 0;
                  var $d$jscomp$82$$ = {};
                  for ($b$jscomp$42$$ in $c$jscomp$122$$) {
                    $d$jscomp$82$$[$b$jscomp$42$$] = -$c$jscomp$122$$[$b$jscomp$42$$];
                  }
                  $c$jscomp$122$$ = $d$jscomp$82$$;
                  $c$jscomp$122$$["%"] = ($c$jscomp$122$$["%"] || 0) + 100;
                }
                $d$jscomp$2$$[$a$jscomp$50$$] = $c$jscomp$122$$;
                $a$jscomp$50$$++;
                $b$jscomp$42$$ = !1;
              }
            }
            return [$d$jscomp$2$$, $a$jscomp$13$$[1]];
          }
        }
        var $c$jscomp$7$$ = {left:{"%":0}, $center$:{"%":50}, right:{"%":100}, top:{"%":0}, bottom:{"%":100}}, $d$jscomp$2$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(null, $window$jscomp$28$$.$mergeDimensions$, " ");
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$13$$.bind(null, 3), $d$jscomp$2$$, ["transform-origin"]);
        $window$jscomp$28$$.$addPropertiesHandler$($a$jscomp$13$$.bind(null, 2), $d$jscomp$2$$, ["perspective-origin"]);
        $window$jscomp$28$$.$consumePosition$ = $b$jscomp$14$$;
        $window$jscomp$28$$.$mergeOffsetList$ = $d$jscomp$2$$;
        $d$jscomp$2$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(null, $d$jscomp$2$$, ", ");
        $window$jscomp$28$$.$addPropertiesHandler$(function($document$jscomp$7$$) {
          if (($document$jscomp$7$$ = $window$jscomp$28$$.$consumeRepeated$($b$jscomp$14$$, /^,/, $document$jscomp$7$$)) && "" == $document$jscomp$7$$[1]) {
            return $document$jscomp$7$$[0];
          }
        }, $d$jscomp$2$$, ["background-position", "object-position"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        var $document$jscomp$7$$ = $window$jscomp$28$$.$consumeParenthesised$.bind(null, $window$jscomp$28$$.$parseLengthOrPercent$), $a$jscomp$13$$ = $window$jscomp$28$$.$consumeRepeated$.bind(void 0, $document$jscomp$7$$, /^/), $b$jscomp$14$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(void 0, $window$jscomp$28$$.$mergeDimensions$, " "), $c$jscomp$7$$ = $window$jscomp$28$$.$mergeNestedRepeated$.bind(void 0, $b$jscomp$14$$, ",");
        $window$jscomp$28$$.$addPropertiesHandler$(function($b$jscomp$14$$) {
          var $c$jscomp$7$$ = $window$jscomp$28$$.$consumeToken$(/^circle/, $b$jscomp$14$$);
          return $c$jscomp$7$$ && $c$jscomp$7$$[0] ? ["circle"].concat($window$jscomp$28$$.$consumeList$([$window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\(/)), $document$jscomp$7$$, $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^at/)), $window$jscomp$28$$.$consumePosition$, $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\)/))], $c$jscomp$7$$[1])) : ($c$jscomp$7$$ = $window$jscomp$28$$.$consumeToken$(/^ellipse/, 
          $b$jscomp$14$$)) && $c$jscomp$7$$[0] ? ["ellipse"].concat($window$jscomp$28$$.$consumeList$([$window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\(/)), $a$jscomp$13$$, $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^at/)), $window$jscomp$28$$.$consumePosition$, $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\)/))], $c$jscomp$7$$[1])) : ($b$jscomp$14$$ = $window$jscomp$28$$.$consumeToken$(/^polygon/, 
          $b$jscomp$14$$)) && $b$jscomp$14$$[0] ? ["polygon"].concat($window$jscomp$28$$.$consumeList$([$window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\(/)), $window$jscomp$28$$.optional($window$jscomp$28$$.$consumeToken$.bind(void 0, /^nonzero\s*,|^evenodd\s*,/), "nonzero,"), $window$jscomp$28$$.$consumeSizePairList$, $window$jscomp$28$$.$ignore$($window$jscomp$28$$.$consumeToken$.bind(void 0, /^\)/))], $b$jscomp$14$$[1])) : void 0;
        }, function($document$jscomp$7$$, $a$jscomp$13$$) {
          if ($document$jscomp$7$$[0] === $a$jscomp$13$$[0]) {
            return "circle" == $document$jscomp$7$$[0] ? $window$jscomp$28$$.$mergeList$($document$jscomp$7$$.slice(1), $a$jscomp$13$$.slice(1), ["circle(", $window$jscomp$28$$.$mergeDimensions$, " at ", $window$jscomp$28$$.$mergeOffsetList$, ")"]) : "ellipse" == $document$jscomp$7$$[0] ? $window$jscomp$28$$.$mergeList$($document$jscomp$7$$.slice(1), $a$jscomp$13$$.slice(1), ["ellipse(", $window$jscomp$28$$.$mergeNonNegativeSizePair$, " at ", $window$jscomp$28$$.$mergeOffsetList$, ")"]) : "polygon" == 
            $document$jscomp$7$$[0] && $document$jscomp$7$$[1] == $a$jscomp$13$$[1] ? $window$jscomp$28$$.$mergeList$($document$jscomp$7$$.slice(2), $a$jscomp$13$$.slice(2), ["polygon(", $document$jscomp$7$$[1], $c$jscomp$7$$, ")"]) : void 0;
          }
        }, ["shape-outside"]);
      })($d$jscomp$2$$);
      (function($window$jscomp$28$$) {
        function $a$jscomp$13$$($window$jscomp$28$$, $a$jscomp$13$$) {
          $a$jscomp$13$$.concat([$window$jscomp$28$$]).forEach(function($a$jscomp$13$$) {
            $a$jscomp$13$$ in $document$jscomp$7$$.documentElement.style && ($b$jscomp$14$$[$window$jscomp$28$$] = $a$jscomp$13$$);
            $c$jscomp$7$$[$a$jscomp$13$$] = $window$jscomp$28$$;
          });
        }
        var $b$jscomp$14$$ = {}, $c$jscomp$7$$ = {};
        $a$jscomp$13$$("transform", ["webkitTransform", "msTransform"]);
        $a$jscomp$13$$("transformOrigin", ["webkitTransformOrigin"]);
        $a$jscomp$13$$("perspective", ["webkitPerspective"]);
        $a$jscomp$13$$("perspectiveOrigin", ["webkitPerspectiveOrigin"]);
        $window$jscomp$28$$.propertyName = function($window$jscomp$28$$) {
          return $b$jscomp$14$$[$window$jscomp$28$$] || $window$jscomp$28$$;
        };
        $window$jscomp$28$$.$unprefixedPropertyName$ = function($window$jscomp$28$$) {
          return $c$jscomp$7$$[$window$jscomp$28$$] || $window$jscomp$28$$;
        };
      })($d$jscomp$2$$);
    })();
    (function() {
      if (void 0 === $document$jscomp$7$$.createElement("div").animate([]).$oncancel$) {
        var $a$jscomp$13$$ = $window$jscomp$28$$.performance && window.performance.now ? function() {
          return window.performance.now();
        } : function() {
          return Date.now();
        };
        var $b$jscomp$14$$ = function($window$jscomp$28$$, $document$jscomp$7$$) {
          this.target = $window$jscomp$28$$;
          this.currentTime = $document$jscomp$7$$;
          this.type = "cancel";
          this.cancelable = this.bubbles = !1;
          this.currentTarget = $window$jscomp$28$$;
          this.defaultPrevented = !1;
          this.eventPhase = window.Event.AT_TARGET;
          this.timeStamp = Date.now();
        }, $c$jscomp$7$$ = $window$jscomp$28$$.Element.prototype.animate;
        $window$jscomp$28$$.Element.prototype.animate = function($window$jscomp$28$$, $document$jscomp$7$$) {
          $window$jscomp$28$$ = $c$jscomp$7$$.call(this, $window$jscomp$28$$, $document$jscomp$7$$);
          $window$jscomp$28$$.$_cancelHandlers$ = [];
          $window$jscomp$28$$.$oncancel$ = null;
          var $d$jscomp$2$$ = $window$jscomp$28$$.cancel;
          $window$jscomp$28$$.cancel = function() {
            $d$jscomp$2$$.call(this);
            var $window$jscomp$28$$ = new $b$jscomp$14$$(this, null, $a$jscomp$13$$()), $document$jscomp$7$$ = this.$_cancelHandlers$.concat(this.$oncancel$ ? [this.$oncancel$] : []);
            (0,window.setTimeout)(function() {
              $document$jscomp$7$$.forEach(function($document$jscomp$7$$) {
                $document$jscomp$7$$.call($window$jscomp$28$$.target, $window$jscomp$28$$);
              });
            }, 0);
          };
          var $a$jscomp$194$$ = $window$jscomp$28$$.addEventListener;
          $window$jscomp$28$$.addEventListener = function($window$jscomp$28$$, $document$jscomp$7$$) {
            "function" == typeof $document$jscomp$7$$ && "cancel" == $window$jscomp$28$$ ? this.$_cancelHandlers$.push($document$jscomp$7$$) : $a$jscomp$194$$.call(this, $window$jscomp$28$$, $document$jscomp$7$$);
          };
          var $b$jscomp$174$$ = $window$jscomp$28$$.removeEventListener;
          return $window$jscomp$28$$.removeEventListener = function($window$jscomp$28$$, $document$jscomp$7$$) {
            "cancel" == $window$jscomp$28$$ ? ($window$jscomp$28$$ = this.$_cancelHandlers$.indexOf($document$jscomp$7$$), 0 <= $window$jscomp$28$$ && this.$_cancelHandlers$.splice($window$jscomp$28$$, 1)) : $b$jscomp$174$$.call(this, $window$jscomp$28$$, $document$jscomp$7$$);
          }, $window$jscomp$28$$;
        };
      }
    })();
    (function($a$jscomp$13$$) {
      var $b$jscomp$14$$ = $document$jscomp$7$$.documentElement, $c$jscomp$7$$ = null, $d$jscomp$2$$ = !1;
      try {
        var $a$jscomp$199$$ = "0" == (0,window.getComputedStyle)($b$jscomp$14$$).getPropertyValue("opacity") ? "1" : "0";
        $c$jscomp$7$$ = $b$jscomp$14$$.animate({opacity:[$a$jscomp$199$$, $a$jscomp$199$$]}, {duration:1});
        $c$jscomp$7$$.currentTime = 0;
        $d$jscomp$2$$ = (0,window.getComputedStyle)($b$jscomp$14$$).getPropertyValue("opacity") == $a$jscomp$199$$;
      } catch ($a$228$$) {
      } finally {
        $c$jscomp$7$$ && $c$jscomp$7$$.cancel();
      }
      if (!$d$jscomp$2$$) {
        var $g$jscomp$43$$ = $window$jscomp$28$$.Element.prototype.animate;
        $window$jscomp$28$$.Element.prototype.animate = function($document$jscomp$7$$, $b$jscomp$14$$) {
          _.$$jscomp$initSymbol$$();
          _.$$jscomp$initSymbolIterator$$();
          _.$$jscomp$initSymbol$$();
          _.$$jscomp$initSymbolIterator$$();
          return $window$jscomp$28$$.Symbol && window.Symbol.iterator && Array.prototype.from && $document$jscomp$7$$[window.Symbol.iterator] && ($document$jscomp$7$$ = Array.from($document$jscomp$7$$)), Array.isArray($document$jscomp$7$$) || null === $document$jscomp$7$$ || ($document$jscomp$7$$ = $a$jscomp$13$$.$convertToArrayForm$($document$jscomp$7$$)), $g$jscomp$43$$.call(this, $document$jscomp$7$$, $b$jscomp$14$$);
        };
      }
    })($c$jscomp$7$$);
    $b$jscomp$14$$ ? $b$jscomp$14$$.$true$ = $a$jscomp$13$$ : !0;
  }({}, function() {
    return this;
  }());
}, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function() {
}, $CssPassthroughNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($css$jscomp$7$$) {
  this.$D$ = $css$jscomp$7$$;
}, $CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($opt_array$$) {
  this.$D$ = $opt_array$$ || [];
}, $CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($url$jscomp$173$$) {
  this.$url_$ = $url$jscomp$173$$;
}, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($type$jscomp$173$$, $num$jscomp$5$$, $units$jscomp$1$$) {
  this.$type_$ = $type$jscomp$173$$;
  this.$F$ = $num$jscomp$5$$;
  this.$D$ = $units$jscomp$1$$.toLowerCase();
}, $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($num$jscomp$6$$) {
  $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "NUM", $num$jscomp$6$$, "");
}, $CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($num$jscomp$8$$) {
  $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "PRC", $num$jscomp$8$$, "%");
}, $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($num$jscomp$10$$, $units$jscomp$2$$) {
  $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "LEN", $num$jscomp$10$$, $units$jscomp$2$$);
}, $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($num$jscomp$13$$, $units$jscomp$3$$) {
  $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "ANG", $num$jscomp$13$$, $units$jscomp$3$$);
}, $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($num$jscomp$15$$, $units$jscomp$4$$) {
  $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "TME", $num$jscomp$15$$, $units$jscomp$4$$);
}, $JSCompiler_StaticMethods_millis_$$ = function($JSCompiler_StaticMethods_millis_$self$$) {
  if ("ms" == $JSCompiler_StaticMethods_millis_$self$$.$D$) {
    return $JSCompiler_StaticMethods_millis_$self$$.$F$;
  }
  if ("s" == $JSCompiler_StaticMethods_millis_$self$$.$D$) {
    return 1000 * $JSCompiler_StaticMethods_millis_$self$$.$F$;
  }
  throw $unknownUnits$$module$extensions$amp_animation$0_1$css_expr_ast$$($JSCompiler_StaticMethods_millis_$self$$.$D$);
}, $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($name$jscomp$212$$, $args$jscomp$21$$, $opt_dimensions$$) {
  this.$I$ = $name$jscomp$212$$.toLowerCase();
  this.$D$ = $args$jscomp$21$$;
  this.$G$ = $opt_dimensions$$ || null;
}, $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($suffix$jscomp$4$$, $args$jscomp$23$$) {
  $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.call(this, "translate" + $suffix$jscomp$4$$.toUpperCase(), $args$jscomp$23$$, "" == $suffix$jscomp$4$$ ? ["w", "h"] : "x" == $suffix$jscomp$4$$ ? ["w"] : "y" == $suffix$jscomp$4$$ ? ["h"] : "z" == $suffix$jscomp$4$$ ? ["z"] : "3d" == $suffix$jscomp$4$$ ? ["w", "h", "z"] : null);
  this.$suffix_$ = $suffix$jscomp$4$$;
}, $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($dim$jscomp$2$$, $opt_selector$$, $opt_selectionMethod$$) {
  this.$G$ = $dim$jscomp$2$$;
  this.$D$ = $opt_selector$$ || null;
  this.$I$ = $opt_selectionMethod$$ || null;
}, $CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($value$jscomp$194$$) {
  this.$D$ = $value$jscomp$194$$;
}, $CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($left$jscomp$7$$, $right$jscomp$2$$) {
  this.$D$ = void 0 === $left$jscomp$7$$ ? null : $left$jscomp$7$$;
  this.$G$ = void 0 === $right$jscomp$2$$ ? null : $right$jscomp$2$$;
}, $CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function() {
}, $CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function() {
}, $CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($varName$jscomp$7$$, $opt_def$$) {
  this.$G$ = $varName$jscomp$7$$;
  this.$D$ = $opt_def$$ || null;
}, $CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($expr$jscomp$14$$) {
  this.$D$ = $expr$jscomp$14$$;
}, $CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($left$jscomp$9$$, $right$jscomp$4$$, $op$jscomp$1$$) {
  this.$D$ = $left$jscomp$9$$;
  this.$I$ = $right$jscomp$4$$;
  this.$G$ = $op$jscomp$1$$;
}, $CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($left$jscomp$11$$, $right$jscomp$6$$, $op$jscomp$2$$) {
  this.$D$ = $left$jscomp$11$$;
  this.$I$ = $right$jscomp$6$$;
  this.$G$ = $op$jscomp$2$$;
}, $unknownUnits$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function($units$jscomp$5$$) {
  return Error("unknown units: " + $units$jscomp$5$$);
}, $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$ = function() {
  return Error("no css");
}, $extractKeyframes$$module$extensions$amp_animation$0_1$keyframes_extractor$$ = function($rootNode$jscomp$6_win$jscomp$321$$, $name$jscomp$213$$) {
  var $styleSheets$jscomp$1$$ = $rootNode$jscomp$6_win$jscomp$321$$.styleSheets;
  if (!$styleSheets$jscomp$1$$) {
    return null;
  }
  $rootNode$jscomp$6_win$jscomp$321$$ = ($rootNode$jscomp$6_win$jscomp$321$$.ownerDocument || $rootNode$jscomp$6_win$jscomp$321$$).defaultView;
  for (var $i$jscomp$249$$ = $styleSheets$jscomp$1$$.length - 1; 0 <= $i$jscomp$249$$; $i$jscomp$249$$--) {
    var $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$ = $styleSheets$jscomp$1$$[$i$jscomp$249$$];
    if ($JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$.cssRules) {
      var $styleNode$jscomp$inline_2719$$ = $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$.ownerNode;
      $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$ = $styleNode$jscomp$inline_2719$$ && ($styleNode$jscomp$inline_2719$$.hasAttribute("amp-custom") || $styleNode$jscomp$inline_2719$$.hasAttribute("amp-keyframes")) ? $scanRules$$module$extensions$amp_animation$0_1$keyframes_extractor$$($rootNode$jscomp$6_win$jscomp$321$$, $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$.cssRules, $name$jscomp$213$$) : null;
    } else {
      $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$ = null;
    }
    if ($JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$) {
      return $JSCompiler_inline_result$jscomp$679_keyframes$jscomp$1_styleSheet$jscomp$inline_2717$$;
    }
  }
  return null;
}, $scanRules$$module$extensions$amp_animation$0_1$keyframes_extractor$$ = function($array$jscomp$inline_2722_win$jscomp$323$$, $i$jscomp$inline_2723_rules$jscomp$4$$, $keyframe$jscomp$inline_2725_name$jscomp$215$$) {
  for (var $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$ = $i$jscomp$inline_2723_rules$jscomp$4$$.length - 1; 0 <= $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$; $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$--) {
    var $j$jscomp$inline_2727_rule$jscomp$7$$ = $i$jscomp$inline_2723_rules$jscomp$4$$[$i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$];
    if (7 == $j$jscomp$inline_2727_rule$jscomp$7$$.type) {
      var $found$jscomp$3_keyframesRule$$ = $j$jscomp$inline_2727_rule$jscomp$7$$;
      if ($j$jscomp$inline_2727_rule$jscomp$7$$.name == $keyframe$jscomp$inline_2725_name$jscomp$215$$ && $isEnabled$$module$extensions$amp_animation$0_1$keyframes_extractor$$($array$jscomp$inline_2722_win$jscomp$323$$, $j$jscomp$inline_2727_rule$jscomp$7$$)) {
        $array$jscomp$inline_2722_win$jscomp$323$$ = [];
        for ($i$jscomp$inline_2723_rules$jscomp$4$$ = 0; $i$jscomp$inline_2723_rules$jscomp$4$$ < $found$jscomp$3_keyframesRule$$.cssRules.length; $i$jscomp$inline_2723_rules$jscomp$4$$++) {
          $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$ = $found$jscomp$3_keyframesRule$$.cssRules[$i$jscomp$inline_2723_rules$jscomp$4$$];
          $keyframe$jscomp$inline_2725_name$jscomp$215$$ = {};
          $keyframe$jscomp$inline_2725_name$jscomp$215$$.offset = "from" == $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$.keyText ? 0 : "to" == $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$.keyText ? 1 : (0,window.parseFloat)($i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$.keyText) / 100;
          $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$ = $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$.style;
          for ($j$jscomp$inline_2727_rule$jscomp$7$$ = 0; $j$jscomp$inline_2727_rule$jscomp$7$$ < $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$.length; $j$jscomp$inline_2727_rule$jscomp$7$$++) {
            var $styleName$jscomp$inline_2728$$ = $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$[$j$jscomp$inline_2727_rule$jscomp$7$$], $propName$jscomp$inline_2729$$ = $styleName$jscomp$inline_2728$$;
            _.$endsWith$$module$src$string$$($styleName$jscomp$inline_2728$$, "animation-timing-function") && ($propName$jscomp$inline_2729$$ = "easing");
            $keyframe$jscomp$inline_2725_name$jscomp$215$$[$propName$jscomp$inline_2729$$] = $i$jscomp$250_keyframeRule$jscomp$inline_2724_style$jscomp$inline_2726$$[$styleName$jscomp$inline_2728$$];
          }
          $array$jscomp$inline_2722_win$jscomp$323$$.push($keyframe$jscomp$inline_2725_name$jscomp$215$$);
        }
        return $array$jscomp$inline_2722_win$jscomp$323$$;
      }
    } else {
      if (4 == $j$jscomp$inline_2727_rule$jscomp$7$$.type || 12 == $j$jscomp$inline_2727_rule$jscomp$7$$.type) {
        if ($found$jscomp$3_keyframesRule$$ = $scanRules$$module$extensions$amp_animation$0_1$keyframes_extractor$$($array$jscomp$inline_2722_win$jscomp$323$$, $j$jscomp$inline_2727_rule$jscomp$7$$.cssRules, $keyframe$jscomp$inline_2725_name$jscomp$215$$)) {
          return $found$jscomp$3_keyframesRule$$;
        }
      }
    }
  }
  return null;
}, $isEnabled$$module$extensions$amp_animation$0_1$keyframes_extractor$$ = function($win$jscomp$324$$, $rule$jscomp$8$$) {
  return $rule$jscomp$8$$.media && $rule$jscomp$8$$.media.mediaText && !$win$jscomp$324$$.matchMedia($rule$jscomp$8$$.media.mediaText).matches || !(12 != $rule$jscomp$8$$.type || $win$jscomp$324$$.CSS && $win$jscomp$324$$.CSS.supports && $win$jscomp$324$$.CSS.supports($rule$jscomp$8$$.conditionText)) ? !1 : $rule$jscomp$8$$.parentRule ? $isEnabled$$module$extensions$amp_animation$0_1$keyframes_extractor$$($win$jscomp$324$$, $rule$jscomp$8$$.parentRule) : !0;
}, $AnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$ = function($requests$jscomp$4$$) {
  this.$requests_$ = $requests$jscomp$4$$;
}, $AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$ = function($win$jscomp$325$$, $requests$jscomp$5$$, $viewportData$$) {
  this.$requests_$ = $requests$jscomp$5$$;
  this.$F$ = $win$jscomp$325$$;
  this.$D$ = [];
  this.$topRatio_$ = $viewportData$$["top-ratio"];
  this.$bottomRatio_$ = $viewportData$$["bottom-ratio"];
  this.$I$ = $viewportData$$["top-margin"];
  this.$G$ = $viewportData$$["bottom-margin"];
}, $WebAnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$ = function($requests$jscomp$6$$) {
  this.$requests_$ = $requests$jscomp$6$$;
  this.$D$ = null;
  this.$G$ = 0;
  this.$F$ = "idle";
  this.$I$ = new _.$Observable$$module$src$observable$$;
}, $Scanner$$module$extensions$amp_animation$0_1$web_animations$$ = function() {
}, $Builder$$module$extensions$amp_animation$0_1$web_animations$$ = function($win$jscomp$326$$, $rootNode$jscomp$7$$, $baseUrl$jscomp$14$$, $vsync$jscomp$2$$, $resources$jscomp$9$$) {
  this.$D$ = $win$jscomp$326$$;
  this.$I$ = new $CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$($win$jscomp$326$$, $rootNode$jscomp$7$$, $baseUrl$jscomp$14$$);
  this.$vsync_$ = $vsync$jscomp$2$$;
  this.$J$ = $resources$jscomp$9$$;
  this.$targets_$ = [];
  this.$G$ = [];
  this.$K$ = _.$JSCompiler_StaticMethods_isChrome$$(_.$Services$$module$src$services$platformFor$$(this.$D$)) && _.$isExperimentOn$$module$src$experiments$$(this.$D$, "chrome-animation-worklet") && "animationWorklet" in window.CSS;
}, $MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$ = function($builder$jscomp$2$$, $css$jscomp$9$$, $path$jscomp$8$$, $target$jscomp$124$$, $index$jscomp$96$$, $vars$jscomp$19$$, $timing$jscomp$3$$) {
  this.$O$ = $builder$jscomp$2$$;
  this.$D$ = $css$jscomp$9$$;
  this.$R$ = $path$jscomp$8$$;
  this.$target_$ = $target$jscomp$124$$;
  this.$G$ = $index$jscomp$96$$;
  this.$F$ = $vars$jscomp$19$$ || _.$map$$module$src$utils$object$$();
  this.$I$ = $timing$jscomp$3$$ || {duration:0, delay:0, endDelay:0, iterations:1, iterationStart:0, easing:"linear", direction:"normal", fill:"none"};
  this.$requests_$ = [];
  this.$J$ = [];
}, $JSCompiler_StaticMethods_onMultiAnimation$$ = function($JSCompiler_StaticMethods_onMultiAnimation$self$$, $spec$jscomp$26$$) {
  $JSCompiler_StaticMethods_with_$$($JSCompiler_StaticMethods_onMultiAnimation$self$$, $spec$jscomp$26$$, function() {
    return $JSCompiler_StaticMethods_onMultiAnimation$self$$.$scan$($spec$jscomp$26$$.animations);
  });
}, $JSCompiler_StaticMethods_onSwitchAnimation$$ = function($JSCompiler_StaticMethods_onSwitchAnimation$self$$, $spec$jscomp$27$$) {
  $JSCompiler_StaticMethods_with_$$($JSCompiler_StaticMethods_onSwitchAnimation$self$$, $spec$jscomp$27$$, function() {
    for (var $i$jscomp$253$$ = 0; $i$jscomp$253$$ < $spec$jscomp$27$$.switch.length && !$JSCompiler_StaticMethods_onSwitchAnimation$self$$.$scan$($spec$jscomp$27$$.switch[$i$jscomp$253$$]); $i$jscomp$253$$++) {
    }
  });
}, $JSCompiler_StaticMethods_onCompAnimation$$ = function($JSCompiler_StaticMethods_onCompAnimation$self$$, $spec$jscomp$28$$) {
  var $newPath$$ = $JSCompiler_StaticMethods_onCompAnimation$self$$.$R$.concat($spec$jscomp$28$$.animation), $otherSpecPromise$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_onCompAnimation$self$$.$D$.getElementById($spec$jscomp$28$$.animation), 'Animation not found: "' + $spec$jscomp$28$$.animation + '"').$getImpl$().then(function($JSCompiler_StaticMethods_onCompAnimation$self$$) {
    return $JSCompiler_StaticMethods_onCompAnimation$self$$.$configJson_$;
  });
  $JSCompiler_StaticMethods_with_$$($JSCompiler_StaticMethods_onCompAnimation$self$$, $spec$jscomp$28$$, function() {
    var $spec$jscomp$28$$ = $JSCompiler_StaticMethods_onCompAnimation$self$$.$target_$, $index$jscomp$97$$ = $JSCompiler_StaticMethods_onCompAnimation$self$$.$G$, $vars$jscomp$20$$ = $JSCompiler_StaticMethods_onCompAnimation$self$$.$F$, $timing$jscomp$4$$ = $JSCompiler_StaticMethods_onCompAnimation$self$$.$I$, $promise$jscomp$36$$ = $otherSpecPromise$$.then(function($otherSpecPromise$$) {
      if ($otherSpecPromise$$) {
        return $JSCompiler_StaticMethods_onCompAnimation$self$$.$O$.$resolveRequests$($newPath$$, $otherSpecPromise$$, null, $spec$jscomp$28$$, $index$jscomp$97$$, $vars$jscomp$20$$, $timing$jscomp$4$$);
      }
    }).then(function($spec$jscomp$28$$) {
      $spec$jscomp$28$$.forEach(function($spec$jscomp$28$$) {
        return $JSCompiler_StaticMethods_onCompAnimation$self$$.$requests_$.push($spec$jscomp$28$$);
      });
    });
    $JSCompiler_StaticMethods_onCompAnimation$self$$.$J$.push($promise$jscomp$36$$);
  });
}, $JSCompiler_StaticMethods_onKeyframeAnimation$$ = function($JSCompiler_StaticMethods_onKeyframeAnimation$self$$, $spec$jscomp$29$$) {
  $JSCompiler_StaticMethods_with_$$($JSCompiler_StaticMethods_onKeyframeAnimation$self$$, $spec$jscomp$29$$, function() {
    var $target$jscomp$126$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_onKeyframeAnimation$self$$.$target_$, "No target specified"), $keyframes$jscomp$2$$ = $JSCompiler_StaticMethods_createKeyframes_$$($JSCompiler_StaticMethods_onKeyframeAnimation$self$$, $target$jscomp$126$$, $spec$jscomp$29$$);
    $JSCompiler_StaticMethods_onKeyframeAnimation$self$$.$requests_$.push({target:$target$jscomp$126$$, keyframes:$keyframes$jscomp$2$$, $vars$:$JSCompiler_StaticMethods_onKeyframeAnimation$self$$.$F$, timing:$JSCompiler_StaticMethods_onKeyframeAnimation$self$$.$I$});
  });
}, $JSCompiler_StaticMethods_createKeyframes_$$ = function($JSCompiler_StaticMethods_createKeyframes_$self$$, $target$jscomp$127$$, $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$) {
  $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$ = $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$.keyframes;
  "string" == typeof $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$ && ($keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$ = $extractKeyframes$$module$extensions$amp_animation$0_1$keyframes_extractor$$($JSCompiler_StaticMethods_createKeyframes_$self$$.$D$.$K$, $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$));
  if (_.$isObject$$module$src$types$$($keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$)) {
    var $object$jscomp$9_prop$232$$ = $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$;
    $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$ = {};
    for (var $array$jscomp$18_prop$jscomp$7$$ in $object$jscomp$9_prop$232$$) {
      var $startFrame_toValue_value$jscomp$196$$ = $object$jscomp$9_prop$232$$[$array$jscomp$18_prop$jscomp$7$$], $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = void 0;
      $SERVICE_PROPS$$module$extensions$amp_animation$0_1$web_animations$$[$array$jscomp$18_prop$jscomp$7$$] ? $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = $startFrame_toValue_value$jscomp$196$$ : _.$isArray$$module$src$types$$($startFrame_toValue_value$jscomp$196$$) && 1 != $startFrame_toValue_value$jscomp$196$$.length ? $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = $startFrame_toValue_value$jscomp$196$$.map(function($target$jscomp$127$$) {
        return $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_createKeyframes_$self$$.$D$, $target$jscomp$127$$, "", !0);
      }) : ($addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = $JSCompiler_StaticMethods_createKeyframes_$self$$.$D$.measure($target$jscomp$127$$, $array$jscomp$18_prop$jscomp$7$$), $startFrame_toValue_value$jscomp$196$$ = _.$isArray$$module$src$types$$($startFrame_toValue_value$jscomp$196$$) ? $startFrame_toValue_value$jscomp$196$$[0] : $startFrame_toValue_value$jscomp$196$$, $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = [$addStartFrame_fromValue_i$jscomp$254_preparedValue$$, $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_createKeyframes_$self$$.$D$, 
      $startFrame_toValue_value$jscomp$196$$, "", !0)]);
      $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$[$array$jscomp$18_prop$jscomp$7$$] = $addStartFrame_fromValue_i$jscomp$254_preparedValue$$;
    }
    return $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$;
  }
  if (_.$isArray$$module$src$types$$($keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$) && 0 < $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$.length) {
    $array$jscomp$18_prop$jscomp$7$$ = $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$;
    $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$ = [];
    $startFrame_toValue_value$jscomp$196$$ = ($addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = 1 == $array$jscomp$18_prop$jscomp$7$$.length || 0 < $array$jscomp$18_prop$jscomp$7$$[0].offset) ? _.$map$$module$src$utils$object$$() : $JSCompiler_StaticMethods_resolveCssMap$$($JSCompiler_StaticMethods_createKeyframes_$self$$.$D$, $array$jscomp$18_prop$jscomp$7$$[0]);
    $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$.push($startFrame_toValue_value$jscomp$196$$);
    for ($addStartFrame_fromValue_i$jscomp$254_preparedValue$$ = $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ ? 0 : 1; $addStartFrame_fromValue_i$jscomp$254_preparedValue$$ < $array$jscomp$18_prop$jscomp$7$$.length; $addStartFrame_fromValue_i$jscomp$254_preparedValue$$++) {
      var $frame$jscomp$5$$ = $array$jscomp$18_prop$jscomp$7$$[$addStartFrame_fromValue_i$jscomp$254_preparedValue$$];
      for ($object$jscomp$9_prop$232$$ in $frame$jscomp$5$$) {
        $SERVICE_PROPS$$module$extensions$amp_animation$0_1$web_animations$$[$object$jscomp$9_prop$232$$] || $startFrame_toValue_value$jscomp$196$$[$object$jscomp$9_prop$232$$] || ($startFrame_toValue_value$jscomp$196$$[$object$jscomp$9_prop$232$$] = $JSCompiler_StaticMethods_createKeyframes_$self$$.$D$.measure($target$jscomp$127$$, $object$jscomp$9_prop$232$$));
      }
      $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$.push($JSCompiler_StaticMethods_resolveCssMap$$($JSCompiler_StaticMethods_createKeyframes_$self$$.$D$, $frame$jscomp$5$$));
    }
    return $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$;
  }
  throw _.$user$$module$src$log$$().$createError$("keyframes not found", $keyframes$230_keyframes$231_spec$jscomp$30_specKeyframes$$);
}, $JSCompiler_StaticMethods_with_$$ = function($JSCompiler_StaticMethods_with_$self$$, $spec$jscomp$31$$, $callback$jscomp$112$$) {
  var $prevTarget$$ = $JSCompiler_StaticMethods_with_$self$$.$target_$, $prevIndex$$ = $JSCompiler_StaticMethods_with_$self$$.$G$, $prevVars$$ = $JSCompiler_StaticMethods_with_$self$$.$F$, $prevTiming$$ = $JSCompiler_StaticMethods_with_$self$$.$I$, $targets$jscomp$3$$ = $spec$jscomp$31$$.target || $spec$jscomp$31$$.selector ? $JSCompiler_StaticMethods_resolveTargets_$$($JSCompiler_StaticMethods_with_$self$$, $spec$jscomp$31$$) : [null];
  $JSCompiler_StaticMethods_with_$self$$.$D$.$U$ = $targets$jscomp$3$$.length;
  $targets$jscomp$3$$.forEach(function($targets$jscomp$3$$, $index$jscomp$98$$) {
    $JSCompiler_StaticMethods_with_$self$$.$target_$ = $targets$jscomp$3$$ || $prevTarget$$;
    $JSCompiler_StaticMethods_with_$self$$.$G$ = $targets$jscomp$3$$ ? $index$jscomp$98$$ : $prevIndex$$;
    $JSCompiler_StaticMethods_withTarget$$($JSCompiler_StaticMethods_with_$self$$.$D$, $JSCompiler_StaticMethods_with_$self$$.$target_$, $JSCompiler_StaticMethods_with_$self$$.$G$, function() {
      var $prevTarget$$ = $JSCompiler_StaticMethods_with_$self$$.$target_$ ? $JSCompiler_StaticMethods_matchSubtargets_$$($JSCompiler_StaticMethods_with_$self$$.$target_$, $JSCompiler_StaticMethods_with_$self$$.$G$ || 0, $spec$jscomp$31$$) : $spec$jscomp$31$$;
      $JSCompiler_StaticMethods_with_$self$$.$F$ = $JSCompiler_StaticMethods_mergeVars_$$($JSCompiler_StaticMethods_with_$self$$, $prevTarget$$, $prevVars$$);
      $JSCompiler_StaticMethods_withVars$$($JSCompiler_StaticMethods_with_$self$$.$D$, $JSCompiler_StaticMethods_with_$self$$.$F$, function() {
        var $spec$jscomp$31$$ = $JSCompiler_StaticMethods_resolveMillis$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.duration, $prevTiming$$.duration), $prevIndex$$ = $JSCompiler_StaticMethods_resolveMillis$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.delay, $prevTiming$$.delay), $prevVars$$ = $JSCompiler_StaticMethods_resolveMillis$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.endDelay, $prevTiming$$.endDelay), $targets$jscomp$3$$ = $JSCompiler_StaticMethods_resolveNumber$$($JSCompiler_StaticMethods_with_$self$$.$D$, 
        $prevTarget$$.iterations, $prevTiming$$.iterations), $target$jscomp$128$$ = $JSCompiler_StaticMethods_resolveNumber$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.iterationStart, $prevTiming$$.iterationStart), $index$jscomp$98$$ = $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.easing, $prevTiming$$.easing, !1), $subtargetSpec$$ = $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.direction, 
        $prevTiming$$.direction, !1), $fill$jscomp$inline_2754$$ = $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_with_$self$$.$D$, $prevTarget$$.fill, $prevTiming$$.fill, !1);
        $JSCompiler_StaticMethods_validateTime_$$($spec$jscomp$31$$, $prevTarget$$.duration, "duration");
        $JSCompiler_StaticMethods_validateTime_$$($prevIndex$$, $prevTarget$$.delay, "delay");
        $JSCompiler_StaticMethods_validateTime_$$($prevVars$$, $prevTarget$$.endDelay, "endDelay");
        _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $WebAnimationTimingDirection$$module$extensions$amp_animation$0_1$web_animation_types$$, $subtargetSpec$$, "direction");
        _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $WebAnimationTimingFill$$module$extensions$amp_animation$0_1$web_animation_types$$, $fill$jscomp$inline_2754$$, "fill");
        $JSCompiler_StaticMethods_with_$self$$.$I$ = {duration:$spec$jscomp$31$$, delay:$prevIndex$$, endDelay:$prevVars$$, iterations:$targets$jscomp$3$$, iterationStart:$target$jscomp$128$$, easing:$index$jscomp$98$$, direction:$subtargetSpec$$, fill:$fill$jscomp$inline_2754$$};
        $callback$jscomp$112$$();
      });
    });
  });
  $JSCompiler_StaticMethods_with_$self$$.$target_$ = $prevTarget$$;
  $JSCompiler_StaticMethods_with_$self$$.$G$ = $prevIndex$$;
  $JSCompiler_StaticMethods_with_$self$$.$F$ = $prevVars$$;
  $JSCompiler_StaticMethods_with_$self$$.$I$ = $prevTiming$$;
}, $JSCompiler_StaticMethods_resolveTargets_$$ = function($JSCompiler_StaticMethods_resolveTargets_$self$$, $spec$jscomp$32$$) {
  if ($spec$jscomp$32$$.selector) {
    var $targets$jscomp$4$$ = $JSCompiler_StaticMethods_queryElements$$($JSCompiler_StaticMethods_resolveTargets_$self$$.$D$, $spec$jscomp$32$$.selector);
    0 == $targets$jscomp$4$$.length && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-animation", 'Target not found: "' + $spec$jscomp$32$$.selector + '"');
  } else {
    $spec$jscomp$32$$.target ? ("string" == typeof $spec$jscomp$32$$.target && _.$user$$module$src$log$$().error("amp-animation", "string targets are deprecated"), $targets$jscomp$4$$ = [_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), "string" == typeof $spec$jscomp$32$$.target ? $JSCompiler_StaticMethods_resolveTargets_$self$$.$D$.getElementById($spec$jscomp$32$$.target) : $spec$jscomp$32$$.target, 'Target not found: "' + $spec$jscomp$32$$.target + '"')]) : $JSCompiler_StaticMethods_resolveTargets_$self$$.$target_$ && 
    ($targets$jscomp$4$$ = [$JSCompiler_StaticMethods_resolveTargets_$self$$.$target_$]);
  }
  $targets$jscomp$4$$.forEach(function($spec$jscomp$32$$) {
    var $targets$jscomp$4$$ = $JSCompiler_StaticMethods_resolveTargets_$self$$.$O$;
    $targets$jscomp$4$$.$targets_$.includes($spec$jscomp$32$$) || ($targets$jscomp$4$$.$targets_$.push($spec$jscomp$32$$), $targets$jscomp$4$$.$G$.push(_.$JSCompiler_StaticMethods_Resources$$module$src$service$resources_impl_prototype$requireLayout$$($targets$jscomp$4$$.$J$, $spec$jscomp$32$$)));
  });
  return $targets$jscomp$4$$;
}, $JSCompiler_StaticMethods_matchSubtargets_$$ = function($target$jscomp$131$$, $index$jscomp$99$$, $spec$jscomp$33$$) {
  if (!$spec$jscomp$33$$.subtargets || 0 == $spec$jscomp$33$$.subtargets.length) {
    return $spec$jscomp$33$$;
  }
  var $result$jscomp$37$$ = _.$map$$module$src$utils$object$$($spec$jscomp$33$$);
  $spec$jscomp$33$$.subtargets.forEach(function($spec$jscomp$33$$) {
    $JSCompiler_StaticMethods_getMatcher_$$($spec$jscomp$33$$)($target$jscomp$131$$, $index$jscomp$99$$) && Object.assign($result$jscomp$37$$, $spec$jscomp$33$$);
  });
  return $result$jscomp$37$$;
}, $JSCompiler_StaticMethods_getMatcher_$$ = function($spec$jscomp$34$$) {
  if ($spec$jscomp$34$$.matcher) {
    return $spec$jscomp$34$$.matcher;
  }
  if (void 0 !== $spec$jscomp$34$$.index) {
    var $specIndex$$ = Number($spec$jscomp$34$$.index);
    var $matcher$jscomp$2$$ = function($spec$jscomp$34$$, $matcher$jscomp$2$$) {
      return $matcher$jscomp$2$$ === $specIndex$$;
    };
  } else {
    var $specSelector$$ = $spec$jscomp$34$$.selector;
    $matcher$jscomp$2$$ = function($spec$jscomp$34$$) {
      try {
        return _.$matches$$module$src$dom$$($spec$jscomp$34$$, $specSelector$$);
      } catch ($e$233$$) {
        throw _.$user$$module$src$log$$().$createError$('Bad subtarget selector: "' + $specSelector$$ + '"', $e$233$$);
      }
    };
  }
  return $spec$jscomp$34$$.matcher = $matcher$jscomp$2$$;
}, $JSCompiler_StaticMethods_mergeVars_$$ = function($JSCompiler_StaticMethods_mergeVars_$self$$, $newVars$$, $prevVars$jscomp$1$$) {
  var $result$jscomp$38$$ = _.$map$$module$src$utils$object$$($prevVars$jscomp$1$$), $k$jscomp$52$$;
  for ($k$jscomp$52$$ in $newVars$$) {
    _.$startsWith$$module$src$string$$($k$jscomp$52$$, "--") && ($result$jscomp$38$$[$k$jscomp$52$$] = $newVars$$[$k$jscomp$52$$]);
  }
  $JSCompiler_StaticMethods_withVars$$($JSCompiler_StaticMethods_mergeVars_$self$$.$D$, $result$jscomp$38$$, function() {
    for (var $prevVars$jscomp$1$$ in $newVars$$) {
      _.$startsWith$$module$src$string$$($prevVars$jscomp$1$$, "--") && ($result$jscomp$38$$[$prevVars$jscomp$1$$] = $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_mergeVars_$self$$.$D$, $newVars$$[$prevVars$jscomp$1$$], "", !0));
    }
  });
  return $result$jscomp$38$$;
}, $JSCompiler_StaticMethods_validateTime_$$ = function($value$jscomp$197$$, $newValue$jscomp$6$$, $field$jscomp$5$$) {
  null != $newValue$jscomp$6$$ && Math.floor($value$jscomp$197$$) != $value$jscomp$197$$ && 1 > $value$jscomp$197$$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-animation", '"' + $field$jscomp$5$$ + '" is fractional. Note that all times are in milliseconds.');
}, $CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$ = function($win$jscomp$327$$, $rootNode$jscomp$8$$, $baseUrl$jscomp$15$$) {
  this.$D$ = $win$jscomp$327$$;
  this.$K$ = $rootNode$jscomp$8$$;
  this.$baseUrl_$ = $baseUrl$jscomp$15$$;
  this.$P$ = _.$map$$module$src$utils$object$$();
  this.$R$ = _.$map$$module$src$utils$object$$();
  this.$F$ = this.$J$ = this.$G$ = this.$U$ = null;
  this.$V$ = [];
  this.$O$ = this.$I$ = null;
}, $JSCompiler_StaticMethods_queryElements$$ = function($JSCompiler_StaticMethods_queryElements$self$$, $selector$jscomp$32$$) {
  try {
    return _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_queryElements$self$$.$K$.querySelectorAll($selector$jscomp$32$$));
  } catch ($e$235$$) {
    throw _.$user$$module$src$log$$().$createError$('Bad query selector: "' + $selector$jscomp$32$$ + '"', $e$235$$);
  }
}, $JSCompiler_StaticMethods_withTarget$$ = function($JSCompiler_StaticMethods_withTarget$self$$, $target$jscomp$135$$, $index$jscomp$101$$, $callback$jscomp$113$$) {
  var $prev$jscomp$2$$ = $JSCompiler_StaticMethods_withTarget$self$$.$G$, $prevIndex$jscomp$1$$ = $JSCompiler_StaticMethods_withTarget$self$$.$J$;
  $JSCompiler_StaticMethods_withTarget$self$$.$G$ = $target$jscomp$135$$;
  $JSCompiler_StaticMethods_withTarget$self$$.$J$ = $index$jscomp$101$$;
  $callback$jscomp$113$$($target$jscomp$135$$);
  $JSCompiler_StaticMethods_withTarget$self$$.$G$ = $prev$jscomp$2$$;
  $JSCompiler_StaticMethods_withTarget$self$$.$J$ = $prevIndex$jscomp$1$$;
}, $JSCompiler_StaticMethods_withVars$$ = function($JSCompiler_StaticMethods_withVars$self$$, $vars$jscomp$21$$, $callback$jscomp$114$$) {
  var $prev$jscomp$3$$ = $JSCompiler_StaticMethods_withVars$self$$.$F$;
  $JSCompiler_StaticMethods_withVars$self$$.$F$ = $vars$jscomp$21$$;
  $callback$jscomp$114$$();
  $JSCompiler_StaticMethods_withVars$self$$.$F$ = $prev$jscomp$3$$;
}, $JSCompiler_StaticMethods_resolveCssMap$$ = function($JSCompiler_StaticMethods_resolveCssMap$self$$, $input$jscomp$41$$) {
  var $result$jscomp$41$$ = _.$map$$module$src$utils$object$$(), $k$jscomp$53$$;
  for ($k$jscomp$53$$ in $input$jscomp$41$$) {
    $result$jscomp$41$$[$k$jscomp$53$$] = "offset" == $k$jscomp$53$$ ? $input$jscomp$41$$[$k$jscomp$53$$] : $JSCompiler_StaticMethods_resolveCss_$$($JSCompiler_StaticMethods_resolveCssMap$self$$, $input$jscomp$41$$[$k$jscomp$53$$], "", !0);
  }
  return $result$jscomp$41$$;
}, $JSCompiler_StaticMethods_resolveMillis$$ = function($JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$, $input$jscomp$43$$, $JSCompiler_inline_result$jscomp$677_def$jscomp$9$$) {
  if (null != $input$jscomp$43$$ && "" !== $input$jscomp$43$$) {
    if ("number" == typeof $input$jscomp$43$$) {
      return $input$jscomp$43$$;
    }
    if ($JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$ = $JSCompiler_StaticMethods_resolveAsNode_$$($JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$, $input$jscomp$43$$, !1)) {
      $JSCompiler_inline_result$jscomp$677_def$jscomp$9$$ = $JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$ instanceof $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $JSCompiler_StaticMethods_millis_$$($JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$) : $JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$ instanceof $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $JSCompiler_StaticMethods_resolveMillis$self_node$jscomp$70$$.$F$ : 
      void 0;
    }
  }
  return $JSCompiler_inline_result$jscomp$677_def$jscomp$9$$;
}, $JSCompiler_StaticMethods_resolveNumber$$ = function($JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$, $input$jscomp$44$$, $JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$) {
  if (null != $input$jscomp$44$$ && "" !== $input$jscomp$44$$) {
    if ("number" == typeof $input$jscomp$44$$) {
      return $input$jscomp$44$$;
    }
    if ($JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$ = $JSCompiler_StaticMethods_resolveAsNode_$$($JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$, $input$jscomp$44$$, !1)) {
      $JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$ instanceof $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$ = $JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$.$F$ : ($JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$ = $JSCompiler_StaticMethods_resolveNumber$self_node$jscomp$71$$.$css$(), $JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$ = 
      $INFINITY_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$.test($JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$) ? window.Infinity : void 0);
    }
  }
  return $JSCompiler_inline_result$jscomp$676_css$jscomp$inline_2762_def$jscomp$10$$;
}, $JSCompiler_StaticMethods_resolveCss_$$ = function($JSCompiler_StaticMethods_resolveCss_$self_result$jscomp$42$$, $JSCompiler_temp$jscomp$673_input$jscomp$45$$, $def$jscomp$11$$, $normalize$jscomp$14$$) {
  if (null == $JSCompiler_temp$jscomp$673_input$jscomp$45$$ || "" === $JSCompiler_temp$jscomp$673_input$jscomp$45$$) {
    return $def$jscomp$11$$;
  }
  var $inputCss$$ = String($JSCompiler_temp$jscomp$673_input$jscomp$45$$);
  ($JSCompiler_temp$jscomp$673_input$jscomp$45$$ = "number" == typeof $JSCompiler_temp$jscomp$673_input$jscomp$45$$) || ($JSCompiler_temp$jscomp$673_input$jscomp$45$$ = !($VAR_CSS_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$.test($inputCss$$) || $normalize$jscomp$14$$ && $NORM_CSS_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$.test($inputCss$$)));
  if ($JSCompiler_temp$jscomp$673_input$jscomp$45$$) {
    return $inputCss$$;
  }
  $JSCompiler_StaticMethods_resolveCss_$self_result$jscomp$42$$ = $JSCompiler_StaticMethods_resolveAsNode_$$($JSCompiler_StaticMethods_resolveCss_$self_result$jscomp$42$$, $inputCss$$, $normalize$jscomp$14$$);
  return null != $JSCompiler_StaticMethods_resolveCss_$self_result$jscomp$42$$ ? $JSCompiler_StaticMethods_resolveCss_$self_result$jscomp$42$$.$css$() : $def$jscomp$11$$;
}, $JSCompiler_StaticMethods_resolveAsNode_$$ = function($JSCompiler_StaticMethods_resolveAsNode_$self$$, $css$jscomp$10_input$jscomp$46$$, $normalize$jscomp$15$$) {
  if (null == $css$jscomp$10_input$jscomp$46$$ || "" === $css$jscomp$10_input$jscomp$46$$) {
    return null;
  }
  if ("number" == typeof $css$jscomp$10_input$jscomp$46$$) {
    return new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($css$jscomp$10_input$jscomp$46$$);
  }
  $css$jscomp$10_input$jscomp$46$$ = String($css$jscomp$10_input$jscomp$46$$);
  var $node$jscomp$72$$ = $JSCompiler_StaticMethods_resolveAsNode_$self$$.$R$[$css$jscomp$10_input$jscomp$46$$];
  void 0 === $node$jscomp$72$$ && ($node$jscomp$72$$ = $parser$$module$extensions$amp_animation$0_1$css_expr_impl$$.parse($css$jscomp$10_input$jscomp$46$$), $JSCompiler_StaticMethods_resolveAsNode_$self$$.$R$[$css$jscomp$10_input$jscomp$46$$] = $node$jscomp$72$$);
  return $node$jscomp$72$$ ? $node$jscomp$72$$.resolve($JSCompiler_StaticMethods_resolveAsNode_$self$$, $normalize$jscomp$15$$) : null;
}, $JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$ = function($JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$self$$) {
  return _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$self$$.$G$, "Only allowed when target is specified");
}, $JSCompiler_StaticMethods_withDimension$$ = function($JSCompiler_StaticMethods_withDimension$self$$, $dim$jscomp$4_result$jscomp$44$$, $callback$jscomp$115$$) {
  var $savedDim$$ = $JSCompiler_StaticMethods_withDimension$self$$.$I$;
  $JSCompiler_StaticMethods_withDimension$self$$.$I$ = $dim$jscomp$4_result$jscomp$44$$;
  $dim$jscomp$4_result$jscomp$44$$ = $callback$jscomp$115$$();
  $JSCompiler_StaticMethods_withDimension$self$$.$I$ = $savedDim$$;
  return $dim$jscomp$4_result$jscomp$44$$;
}, $JSCompiler_StaticMethods_getElementSize_$$ = function($b$jscomp$180_target$jscomp$137$$) {
  $b$jscomp$180_target$jscomp$137$$ = $b$jscomp$180_target$jscomp$137$$.getBoundingClientRect();
  return {width:$b$jscomp$180_target$jscomp$137$$.width, height:$b$jscomp$180_target$jscomp$137$$.height};
}, $installWebAnimationsIfNecessary$$module$extensions$amp_animation$0_1$web_animations_polyfill$$ = function($win$jscomp$328$$) {
  $win$jscomp$328$$.__AMP_WA || ($win$jscomp$328$$.__AMP_WA = !0, $installWebAnimations$$module$web_animations_js$web_animations_install$$($win$jscomp$328$$));
}, $WebAnimationService$$module$extensions$amp_animation$0_1$web_animation_service$$ = function($ampdoc$jscomp$136$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$136$$;
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$136$$.$win$);
  this.$D$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$136$$);
}, $AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation$$ = function($$jscomp$super$this$jscomp$17_element$jscomp$331$$) {
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$17_element$jscomp$331$$) || this;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$triggerOnVisibility_$ = !1;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$visible_$ = !1;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$pausedByAction_$ = !1;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$triggered_$ = !1;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$embed_$ = null;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$configJson_$ = null;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$runner_$ = null;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$runnerPromise_$ = null;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$restartPass_$ = null;
  $$jscomp$super$this$jscomp$17_element$jscomp$331$$.$hasPositionObserver_$ = !1;
  return $$jscomp$super$this$jscomp$17_element$jscomp$331$$;
}, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$ = function($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$, $visible$jscomp$6$$) {
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$.$visible_$ != $visible$jscomp$6$$ && ($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$.$visible_$ = $visible$jscomp$6$$, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$.$triggered_$ && ($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$.$visible_$ ? 
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$.$pausedByAction_$ || $JSCompiler_StaticMethods_startOrResume_$$($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$) : $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$$($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$self$$)));
}, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$$ = function($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$) {
  var $triggered$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$triggered_$, $pausedByAction$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$pausedByAction_$;
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$runner_$ && ($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$runner_$.cancel(), $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$runner_$ = null, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$runnerPromise_$ = 
  null);
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$triggered_$ = $triggered$$;
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$pausedByAction_$ = $pausedByAction$$;
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$triggered_$ && $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$visible_$ && _.$JSCompiler_StaticMethods_schedule$$($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$self$$.$restartPass_$);
}, $JSCompiler_StaticMethods_startOrResume_$$ = function($JSCompiler_StaticMethods_startOrResume_$self$$, $opt_args$jscomp$7$$) {
  if (!$JSCompiler_StaticMethods_startOrResume_$self$$.$triggered_$ || !$JSCompiler_StaticMethods_startOrResume_$self$$.$visible_$) {
    return null;
  }
  $JSCompiler_StaticMethods_startOrResume_$self$$.$pausedByAction_$ = !1;
  return $JSCompiler_StaticMethods_startOrResume_$self$$.$runner_$ ? ($JSCompiler_StaticMethods_startOrResume_$self$$.$runner_$.resume(), null) : $JSCompiler_StaticMethods_createRunnerIfNeeded_$$($JSCompiler_StaticMethods_startOrResume_$self$$, $opt_args$jscomp$7$$).then(function() {
    $JSCompiler_StaticMethods_startOrResume_$self$$.$runner_$.start();
  });
}, $JSCompiler_StaticMethods_createRunnerIfNeeded_$$ = function($JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$, $opt_args$jscomp$8$$, $opt_viewportData$jscomp$1$$) {
  $JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runnerPromise_$ || ($JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runnerPromise_$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$$($JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$, $opt_args$jscomp$8$$, $opt_viewportData$jscomp$1$$).then(function($opt_args$jscomp$8$$) {
    $JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runner_$ = $opt_args$jscomp$8$$;
    $JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runner_$.$onPlayStateChanged$($JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$playStateChanged_$.bind($JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$));
    $JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runner_$.init();
  }));
  return $JSCompiler_StaticMethods_createRunnerIfNeeded_$self$$.$runnerPromise_$;
}, $JSCompiler_StaticMethods_finish_$$ = function($JSCompiler_StaticMethods_finish_$self$$) {
  $JSCompiler_StaticMethods_finish_$self$$.$triggered_$ = !1;
  $JSCompiler_StaticMethods_finish_$self$$.$pausedByAction_$ = !1;
  $JSCompiler_StaticMethods_finish_$self$$.$runner_$ && ($JSCompiler_StaticMethods_finish_$self$$.$runner_$.finish(), $JSCompiler_StaticMethods_finish_$self$$.$runner_$ = null, $JSCompiler_StaticMethods_finish_$self$$.$runnerPromise_$ = null);
}, $JSCompiler_StaticMethods_cancel_$$ = function($JSCompiler_StaticMethods_cancel_$self$$) {
  $JSCompiler_StaticMethods_cancel_$self$$.$triggered_$ = !1;
  $JSCompiler_StaticMethods_cancel_$self$$.$pausedByAction_$ = !1;
  $JSCompiler_StaticMethods_cancel_$self$$.$runner_$ && ($JSCompiler_StaticMethods_cancel_$self$$.$runner_$.cancel(), $JSCompiler_StaticMethods_cancel_$self$$.$runner_$ = null, $JSCompiler_StaticMethods_cancel_$self$$.$runnerPromise_$ = null);
}, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$$ = function($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$, $ampdoc$jscomp$138_opt_args$jscomp$9$$, $opt_viewportData$jscomp$2$$) {
  var $configJson$jscomp$13$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$configJson_$, $args$jscomp$27$$ = $ampdoc$jscomp$138_opt_args$jscomp$9$$ || null;
  $installWebAnimationsIfNecessary$$module$extensions$amp_animation$0_1$web_animations_polyfill$$($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$win$);
  $ampdoc$jscomp$138_opt_args$jscomp$9$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$getAmpDoc$();
  var $readyPromise$jscomp$5$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$ ? $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$.$whenReady$() : $ampdoc$jscomp$138_opt_args$jscomp$9$$.$whenReady$(), $hostWin$jscomp$3$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$ ? 
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$.$win$ : $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$win$, $baseUrl$jscomp$16$$ = $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$ ? $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$.spec.url : 
  $ampdoc$jscomp$138_opt_args$jscomp$9$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
  return $readyPromise$jscomp$5$$.then(function() {
    return (new $Builder$$module$extensions$amp_animation$0_1$web_animations$$($hostWin$jscomp$3$$, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$ ? $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$embed_$.$win$.document : $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$getAmpDoc$().getRootNode(), 
    $baseUrl$jscomp$16$$, _.$JSCompiler_StaticMethods_getVsync$$($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$), $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.element.$getResources$())).$F$($configJson$jscomp$13$$, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$createRunner_$self$$.$hasPositionObserver_$, 
    $args$jscomp$27$$, $opt_viewportData$jscomp$2$$);
  });
}, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$$ = function($JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$self$$) {
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$self$$.$runner_$ && $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$self$$.$runner_$.pause();
}, $WebAnimationTimingDirection$$module$extensions$amp_animation$0_1$web_animation_types$$ = {$NORMAL$:"normal", $REVERSE$:"reverse", $ALTERNATE$:"alternate", $ALTERNATE_REVERSE$:"alternate-reverse"}, $WebAnimationTimingFill$$module$extensions$amp_animation$0_1$web_animation_types$$ = {NONE:"none", $FORWARDS$:"forwards", $BACKWARDS$:"backwards", $BOTH$:"both", $AUTO$:"auto"};
var $FINAL_URL_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$ = /^(data|https):/i, $DEG_TO_RAD$$module$extensions$amp_animation$0_1$css_expr_ast$$ = 2 * Math.PI / 360, $GRAD_TO_RAD$$module$extensions$amp_animation$0_1$css_expr_ast$$ = Math.PI / 200, $VAR_CSS_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$ = /(calc|var|url|rand|index|width|height|num|length)\(/i, $NORM_CSS_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$ = /\d(%|em|rem|vw|vh|vmin|vmax|s|deg|grad)/i, $INFINITY_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$ = 
/^(infinity|infinite)$/i;
$CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.resolve = function($context$jscomp$36$$, $normalize$jscomp$1$$) {
  return this.$isConst$($normalize$jscomp$1$$) ? this : this.$calc$($context$jscomp$36$$, $normalize$jscomp$1$$);
};
$CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !0;
};
$CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function() {
  return this;
};
_.$$jscomp$inherits$$($CssPassthroughNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssPassthroughNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return this.$D$;
};
_.$$jscomp$inherits$$($CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return this.$D$.map(function($node$jscomp$64$$) {
    return $node$jscomp$64$$.$css$();
  }).join(" ");
};
$CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function($normalize$jscomp$2$$) {
  return this.$D$.reduce(function($acc$jscomp$2$$, $node$jscomp$65$$) {
    return $acc$jscomp$2$$ && $node$jscomp$65$$.$isConst$($normalize$jscomp$2$$);
  }, !0);
};
$CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$37$$, $normalize$jscomp$3$$) {
  for (var $resolvedArray$$ = [], $i$jscomp$246$$ = 0; $i$jscomp$246$$ < this.$D$.length; $i$jscomp$246$$++) {
    var $resolved$$ = this.$D$[$i$jscomp$246$$].resolve($context$jscomp$37$$, $normalize$jscomp$3$$);
    if ($resolved$$) {
      $resolvedArray$$.push($resolved$$);
    } else {
      return null;
    }
  }
  return new $CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($resolvedArray$$);
};
_.$$jscomp$inherits$$($CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return this.$url_$ ? 'url("' + this.$url_$ + '")' : "";
};
$CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !this.$url_$ || $FINAL_URL_RE$$module$extensions$amp_animation$0_1$css_expr_ast$$.test(this.$url_$);
};
$CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$38_resolvedUrl$jscomp$inline_2694$$) {
  $context$jscomp$38_resolvedUrl$jscomp$inline_2694$$ = _.$resolveRelativeUrl$$module$src$url$$(this.$url_$, $context$jscomp$38_resolvedUrl$jscomp$inline_2694$$.$baseUrl_$);
  return new $CssPassthroughNode$$module$extensions$amp_animation$0_1$css_expr_ast$$('url("' + $context$jscomp$38_resolvedUrl$jscomp$inline_2694$$ + '")');
};
_.$$jscomp$inherits$$($CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
_.$JSCompiler_prototypeAlias$$ = $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype;
_.$JSCompiler_prototypeAlias$$.$css$ = function() {
  return "" + this.$F$ + this.$D$;
};
_.$JSCompiler_prototypeAlias$$.$isConst$ = function($normalize$jscomp$4$$) {
  return $normalize$jscomp$4$$ ? this.$isNorm$() : !0;
};
_.$JSCompiler_prototypeAlias$$.$isNorm$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$norm$ = function() {
  return this;
};
_.$JSCompiler_prototypeAlias$$.$calc$ = function($context$jscomp$39$$, $normalize$jscomp$5$$) {
  return $normalize$jscomp$5$$ ? this.$norm$($context$jscomp$39$$) : this;
};
_.$JSCompiler_prototypeAlias$$.$calcPercent$ = function() {
  throw Error("cannot calculate percent for " + this.$type_$);
};
_.$$jscomp$inherits$$($CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$G$ = function($num$jscomp$7$$) {
  return new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$7$$);
};
_.$$jscomp$inherits$$($CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$G$ = function($num$jscomp$9$$) {
  return new $CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$9$$);
};
$CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isNorm$ = function() {
  return !1;
};
$CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$norm$ = function($context$jscomp$40$$) {
  return $context$jscomp$40$$.$I$ ? (new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(0, "px")).$calcPercent$(this.$F$, $context$jscomp$40$$) : this;
};
_.$$jscomp$inherits$$($CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$G$ = function($num$jscomp$11$$) {
  return new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$11$$, this.$D$);
};
$CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isNorm$ = function() {
  return "px" == this.$D$;
};
$CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$norm$ = function($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$) {
  if (this.$isNorm$()) {
    return this;
  }
  if ("em" == this.$D$ || "rem" == this.$D$) {
    if ("em" == this.$D$) {
      var $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$ = $JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$);
      $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$ = (0,window.parseFloat)($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.measure($JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$, "font-size"));
    } else {
      $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$ = (0,window.parseFloat)($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.measure($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$D$.document.documentElement, "font-size"));
    }
    return new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$F$ * $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$, "px");
  }
  if ("vw" == this.$D$ || "vh" == this.$D$ || "vmin" == this.$D$ || "vmax" == this.$D$) {
    $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$O$ || ($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$O$ = {width:$JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$D$.innerWidth, height:$JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$D$.innerHeight});
    $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$ = $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$.$O$;
    $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$ = $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$.width * this.$F$ / 100;
    $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$ = $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$.height * this.$F$ / 100;
    var $num$jscomp$12$$ = 0;
    "vw" == this.$D$ ? $num$jscomp$12$$ = $JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$ : "vh" == this.$D$ ? $num$jscomp$12$$ = $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$ : "vmin" == this.$D$ ? $num$jscomp$12$$ = Math.min($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$, $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$) : "vmax" == this.$D$ && ($num$jscomp$12$$ = Math.max($JSCompiler_temp$jscomp$5623_context$jscomp$41_vw$$, $JSCompiler_inline_result$jscomp$685_target$jscomp$inline_6081_vh$jscomp$1$$));
    return new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$12$$, "px");
  }
  throw $unknownUnits$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$D$);
};
$CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calcPercent$ = function($percent$jscomp$1$$, $context$jscomp$42_size$jscomp$27$$) {
  var $dim$jscomp$1$$ = $context$jscomp$42_size$jscomp$27$$.$I$;
  $context$jscomp$42_size$jscomp$27$$ = $JSCompiler_StaticMethods_getElementSize_$$($JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($context$jscomp$42_size$jscomp$27$$));
  return new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(("w" == $dim$jscomp$1$$ ? $context$jscomp$42_size$jscomp$27$$.width : "h" == $dim$jscomp$1$$ ? $context$jscomp$42_size$jscomp$27$$.height : 0) * $percent$jscomp$1$$ / 100, "px");
};
_.$$jscomp$inherits$$($CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$G$ = function($num$jscomp$14$$) {
  return new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$14$$, this.$D$);
};
$CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isNorm$ = function() {
  return "rad" == this.$D$;
};
$CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$norm$ = function() {
  if (this.$isNorm$()) {
    return this;
  }
  if ("deg" == this.$D$) {
    return new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$F$ * $DEG_TO_RAD$$module$extensions$amp_animation$0_1$css_expr_ast$$, "rad");
  }
  if ("grad" == this.$D$) {
    return new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$F$ * $GRAD_TO_RAD$$module$extensions$amp_animation$0_1$css_expr_ast$$, "rad");
  }
  throw $unknownUnits$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$D$);
};
_.$$jscomp$inherits$$($CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$G$ = function($num$jscomp$16$$) {
  return new $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($num$jscomp$16$$, this.$D$);
};
$CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isNorm$ = function() {
  return "ms" == this.$D$;
};
$CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$norm$ = function() {
  return this.$isNorm$() ? this : new $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($JSCompiler_StaticMethods_millis_$$(this), "ms");
};
_.$$jscomp$inherits$$($CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  var $args$jscomp$22$$ = this.$D$.map(function($args$jscomp$22$$) {
    return $args$jscomp$22$$.$css$();
  }).join(",");
  return this.$I$ + "(" + $args$jscomp$22$$ + ")";
};
$CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function($normalize$jscomp$6$$) {
  return this.$D$.reduce(function($acc$jscomp$3$$, $node$jscomp$69$$) {
    return $acc$jscomp$3$$ && $node$jscomp$69$$.$isConst$($normalize$jscomp$6$$);
  }, !0);
};
$CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$43$$, $normalize$jscomp$7$$) {
  for (var $resolvedArgs$$ = [], $$jscomp$loop$398$$ = {}, $i$jscomp$247$$ = 0; $i$jscomp$247$$ < this.$D$.length; $$jscomp$loop$398$$ = {node:$$jscomp$loop$398$$.node}, $i$jscomp$247$$++) {
    $$jscomp$loop$398$$.node = this.$D$[$i$jscomp$247$$];
    var $resolved$jscomp$1$$ = void 0;
    this.$G$ && $i$jscomp$247$$ < this.$G$.length ? $resolved$jscomp$1$$ = $JSCompiler_StaticMethods_withDimension$$($context$jscomp$43$$, this.$G$[$i$jscomp$247$$], function($resolvedArgs$$) {
      return function() {
        return $resolvedArgs$$.node.resolve($context$jscomp$43$$, $normalize$jscomp$7$$);
      };
    }($$jscomp$loop$398$$)) : $resolved$jscomp$1$$ = $$jscomp$loop$398$$.node.resolve($context$jscomp$43$$, $normalize$jscomp$7$$);
    if ($resolved$jscomp$1$$) {
      $resolvedArgs$$.push($resolved$jscomp$1$$);
    } else {
      return null;
    }
  }
  return new $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(this.$I$, $resolvedArgs$$);
};
_.$$jscomp$inherits$$($CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
_.$$jscomp$inherits$$($CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  throw $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$();
};
$CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$) {
  if (this.$D$) {
    var $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$ = this.$D$;
    try {
      var $element$jscomp$inline_6086$$ = "closest" == this.$I$ ? _.$closestBySelector$$module$src$dom$$($JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$), $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$) : $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$.$K$.querySelector($dim$jscomp$inline_2698_selector$jscomp$inline_6084$$);
    } catch ($e$236$jscomp$inline_6087$$) {
      throw _.$user$$module$src$log$$().$createError$('Bad query selector: "' + $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$ + '"', $e$236$jscomp$inline_6087$$);
    }
    $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $element$jscomp$inline_6086$$, "Element not found: " + $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$);
    $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$ = $JSCompiler_StaticMethods_getElementSize_$$($JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$);
  } else {
    $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$ = $JSCompiler_StaticMethods_getElementSize_$$($JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$));
  }
  $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$ = this.$G$;
  return new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("w" == $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$ ? $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$.width : "h" == $dim$jscomp$inline_2698_selector$jscomp$inline_6084$$ ? $JSCompiler_inline_result$jscomp$5625_JSCompiler_temp$jscomp$5624_context$jscomp$44_size$jscomp$28$$.height : 0, "px");
};
_.$$jscomp$inherits$$($CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  throw $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$();
};
$CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$45_num$jscomp$17_value$jscomp$195$$, $normalize$jscomp$8$$) {
  $context$jscomp$45_num$jscomp$17_value$jscomp$195$$ = this.$D$.resolve($context$jscomp$45_num$jscomp$17_value$jscomp$195$$, $normalize$jscomp$8$$);
  if (null == $context$jscomp$45_num$jscomp$17_value$jscomp$195$$) {
    return null;
  }
  $context$jscomp$45_num$jscomp$17_value$jscomp$195$$ = $context$jscomp$45_num$jscomp$17_value$jscomp$195$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $context$jscomp$45_num$jscomp$17_value$jscomp$195$$.$F$ : (0,window.parseFloat)($context$jscomp$45_num$jscomp$17_value$jscomp$195$$.$css$());
  return null == $context$jscomp$45_num$jscomp$17_value$jscomp$195$$ || (0,window.isNaN)($context$jscomp$45_num$jscomp$17_value$jscomp$195$$) ? null : new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($context$jscomp$45_num$jscomp$17_value$jscomp$195$$);
};
_.$$jscomp$inherits$$($CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  throw $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$();
};
$CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$46_rand$jscomp$1$$, $normalize$jscomp$9_right$jscomp$3$$) {
  if (null == this.$D$ || null == this.$G$) {
    return new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$(Math.random());
  }
  var $left$jscomp$8$$ = this.$D$.resolve($context$jscomp$46_rand$jscomp$1$$, $normalize$jscomp$9_right$jscomp$3$$);
  $normalize$jscomp$9_right$jscomp$3$$ = this.$G$.resolve($context$jscomp$46_rand$jscomp$1$$, $normalize$jscomp$9_right$jscomp$3$$);
  if (null == $left$jscomp$8$$ || null == $normalize$jscomp$9_right$jscomp$3$$) {
    return null;
  }
  if (!($left$jscomp$8$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ && $normalize$jscomp$9_right$jscomp$3$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$)) {
    throw Error("left and right must be both numerical");
  }
  if ($left$jscomp$8$$.$type_$ != $normalize$jscomp$9_right$jscomp$3$$.$type_$) {
    throw Error("left and right must be the same type");
  }
  $left$jscomp$8$$.$D$ != $normalize$jscomp$9_right$jscomp$3$$.$D$ && ($left$jscomp$8$$ = $left$jscomp$8$$.$norm$($context$jscomp$46_rand$jscomp$1$$), $normalize$jscomp$9_right$jscomp$3$$ = $normalize$jscomp$9_right$jscomp$3$$.$norm$($context$jscomp$46_rand$jscomp$1$$));
  $context$jscomp$46_rand$jscomp$1$$ = Math.random();
  return $left$jscomp$8$$.$G$(Math.min($left$jscomp$8$$.$F$, $normalize$jscomp$9_right$jscomp$3$$.$F$) * (1 - $context$jscomp$46_rand$jscomp$1$$) + Math.max($left$jscomp$8$$.$F$, $normalize$jscomp$9_right$jscomp$3$$.$F$) * $context$jscomp$46_rand$jscomp$1$$);
};
_.$$jscomp$inherits$$($CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  throw $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$();
};
$CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$47$$) {
  $JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($context$jscomp$47$$);
  return new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($context$jscomp$47$$.$J$);
};
_.$$jscomp$inherits$$($CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  throw $noCss$$module$extensions$amp_animation$0_1$css_expr_ast$$();
};
$CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$48$$) {
  $JSCompiler_StaticMethods_CssContextImpl$$module$extensions$amp_animation$0_1$web_animations_prototype$requireTarget_$$($context$jscomp$48$$);
  return new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($context$jscomp$48$$.$U$);
};
_.$$jscomp$inherits$$($CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return "var(" + this.$G$ + (this.$D$ ? "," + this.$D$.$css$() : "") + ")";
};
$CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$49$$, $normalize$jscomp$10$$) {
  var $result$jscomp$inline_2708_varName$jscomp$inline_2706$$ = this.$G$;
  $context$jscomp$49$$.$V$.push($result$jscomp$inline_2708_varName$jscomp$inline_2706$$);
  var $rawValue$jscomp$inline_2707$$ = $context$jscomp$49$$.$F$ && void 0 != $context$jscomp$49$$.$F$[$result$jscomp$inline_2708_varName$jscomp$inline_2706$$] ? $context$jscomp$49$$.$F$[$result$jscomp$inline_2708_varName$jscomp$inline_2706$$] : $context$jscomp$49$$.$G$ ? $context$jscomp$49$$.measure($context$jscomp$49$$.$G$, $result$jscomp$inline_2708_varName$jscomp$inline_2706$$) : null;
  null != $rawValue$jscomp$inline_2707$$ && "" !== $rawValue$jscomp$inline_2707$$ || _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-animation", 'Variable not found: "' + $result$jscomp$inline_2708_varName$jscomp$inline_2706$$ + '"');
  $result$jscomp$inline_2708_varName$jscomp$inline_2706$$ = $JSCompiler_StaticMethods_resolveAsNode_$$($context$jscomp$49$$, $rawValue$jscomp$inline_2707$$, !1);
  $context$jscomp$49$$.$V$.pop();
  return $result$jscomp$inline_2708_varName$jscomp$inline_2706$$ ? $result$jscomp$inline_2708_varName$jscomp$inline_2706$$.resolve($context$jscomp$49$$, $normalize$jscomp$10$$) : this.$D$ ? this.$D$.resolve($context$jscomp$49$$, $normalize$jscomp$10$$) : null;
};
_.$$jscomp$inherits$$($CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return "calc(" + this.$D$.$css$() + ")";
};
$CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$50$$, $normalize$jscomp$11$$) {
  return this.$D$.resolve($context$jscomp$50$$, $normalize$jscomp$11$$);
};
_.$$jscomp$inherits$$($CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return this.$D$.$css$() + " " + this.$G$ + " " + this.$I$.$css$();
};
$CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$51$$, $normalize$jscomp$12_right$jscomp$5$$) {
  var $left$jscomp$10$$ = this.$D$.resolve($context$jscomp$51$$, $normalize$jscomp$12_right$jscomp$5$$);
  $normalize$jscomp$12_right$jscomp$5$$ = this.$I$.resolve($context$jscomp$51$$, $normalize$jscomp$12_right$jscomp$5$$);
  if (null == $left$jscomp$10$$ || null == $normalize$jscomp$12_right$jscomp$5$$) {
    return null;
  }
  if (!($left$jscomp$10$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ && $normalize$jscomp$12_right$jscomp$5$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$)) {
    throw Error("left and right must be both numerical");
  }
  if ($left$jscomp$10$$.$type_$ != $normalize$jscomp$12_right$jscomp$5$$.$type_$) {
    if ($left$jscomp$10$$ instanceof $CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$) {
      $left$jscomp$10$$ = $normalize$jscomp$12_right$jscomp$5$$.$calcPercent$($left$jscomp$10$$.$F$, $context$jscomp$51$$);
    } else {
      if ($normalize$jscomp$12_right$jscomp$5$$ instanceof $CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$) {
        $normalize$jscomp$12_right$jscomp$5$$ = $left$jscomp$10$$.$calcPercent$($normalize$jscomp$12_right$jscomp$5$$.$F$, $context$jscomp$51$$);
      } else {
        throw Error("left and right must be the same type");
      }
    }
  }
  $left$jscomp$10$$.$D$ != $normalize$jscomp$12_right$jscomp$5$$.$D$ && ($left$jscomp$10$$ = $left$jscomp$10$$.$norm$($context$jscomp$51$$), $normalize$jscomp$12_right$jscomp$5$$ = $normalize$jscomp$12_right$jscomp$5$$.$norm$($context$jscomp$51$$));
  return $left$jscomp$10$$.$G$($left$jscomp$10$$.$F$ + ("+" == this.$G$ ? 1 : -1) * $normalize$jscomp$12_right$jscomp$5$$.$F$);
};
_.$$jscomp$inherits$$($CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$, $CssNode$$module$extensions$amp_animation$0_1$css_expr_ast$$);
$CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$css$ = function() {
  return this.$D$.$css$() + " " + this.$G$ + " " + this.$I$.$css$();
};
$CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$isConst$ = function() {
  return !1;
};
$CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$.prototype.$calc$ = function($context$jscomp$52_num$jscomp$19_right$jscomp$7$$, $multi_normalize$jscomp$13$$) {
  var $base$jscomp$7_left$jscomp$12$$ = this.$D$.resolve($context$jscomp$52_num$jscomp$19_right$jscomp$7$$, $multi_normalize$jscomp$13$$);
  $context$jscomp$52_num$jscomp$19_right$jscomp$7$$ = this.$I$.resolve($context$jscomp$52_num$jscomp$19_right$jscomp$7$$, $multi_normalize$jscomp$13$$);
  if (null == $base$jscomp$7_left$jscomp$12$$ || null == $context$jscomp$52_num$jscomp$19_right$jscomp$7$$) {
    return null;
  }
  if (!($base$jscomp$7_left$jscomp$12$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ && $context$jscomp$52_num$jscomp$19_right$jscomp$7$$ instanceof $CssNumericNode$$module$extensions$amp_animation$0_1$css_expr_ast$$)) {
    throw Error("left and right must be both numerical");
  }
  if ("*" == this.$G$) {
    if ($base$jscomp$7_left$jscomp$12$$ instanceof $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$) {
      $multi_normalize$jscomp$13$$ = $base$jscomp$7_left$jscomp$12$$.$F$, $base$jscomp$7_left$jscomp$12$$ = $context$jscomp$52_num$jscomp$19_right$jscomp$7$$;
    } else {
      if (!($context$jscomp$52_num$jscomp$19_right$jscomp$7$$ instanceof $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$)) {
        throw Error("one of sides in multiplication must be a number");
      }
      $multi_normalize$jscomp$13$$ = $context$jscomp$52_num$jscomp$19_right$jscomp$7$$.$F$;
    }
  } else {
    if (!($context$jscomp$52_num$jscomp$19_right$jscomp$7$$ instanceof $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$)) {
      throw Error("denominator must be a number");
    }
    $multi_normalize$jscomp$13$$ = 1 / $context$jscomp$52_num$jscomp$19_right$jscomp$7$$.$F$;
  }
  $context$jscomp$52_num$jscomp$19_right$jscomp$7$$ = $base$jscomp$7_left$jscomp$12$$.$F$ * $multi_normalize$jscomp$13$$;
  return (0,window.isFinite)($context$jscomp$52_num$jscomp$19_right$jscomp$7$$) ? $base$jscomp$7_left$jscomp$12$$.$G$($context$jscomp$52_num$jscomp$19_right$jscomp$7$$) : null;
};
var $parser$$module$extensions$amp_animation$0_1$css_expr_impl$$ = function() {
  function $o$jscomp$18$$($o$jscomp$18$$, $Parser$jscomp$1$$, $$V0$jscomp$1_parser$jscomp$1$$, $$V1$jscomp$1$$) {
    $$V0$jscomp$1_parser$jscomp$1$$ = $$V0$jscomp$1_parser$jscomp$1$$ || {};
    for ($$V1$jscomp$1$$ = $o$jscomp$18$$.length; $$V1$jscomp$1$$--; $$V0$jscomp$1_parser$jscomp$1$$[$o$jscomp$18$$[$$V1$jscomp$1$$]] = $Parser$jscomp$1$$) {
    }
    return $$V0$jscomp$1_parser$jscomp$1$$;
  }
  function $Parser$jscomp$1$$() {
    this.$yy$ = {};
  }
  var $$V0$jscomp$1_parser$jscomp$1$$ = [1, 7], $$V1$jscomp$1$$ = [1, 8], $$V2$jscomp$1$$ = [1, 9], $$V3$jscomp$1$$ = [1, 14], $$V4$jscomp$1$$ = [1, 15], $$V5$jscomp$1$$ = [1, 25], $$V6$jscomp$1$$ = [1, 26], $$V7$jscomp$1$$ = [1, 27], $$V8$jscomp$1$$ = [1, 28], $$V9$jscomp$1$$ = [1, 29], $$Va$jscomp$1$$ = [1, 30], $$Vb$jscomp$1$$ = [1, 31], $$Vc$jscomp$1$$ = [1, 32], $$Vd$$ = [1, 33], $$Ve$$ = [1, 34], $$Vf$$ = [1, 35], $$Vg$$ = [1, 36], $$Vh$$ = [1, 37], $$Vi$$ = [1, 38], $$Vj$$ = [1, 39], $$Vk$$ = 
  [1, 40], $$Vl$$ = [1, 41], $$Vm$$ = [1, 42], $$Vn$$ = [1, 57], $$Vo$$ = [1, 43], $$Vp$$ = [1, 46], $$Vq$$ = [1, 47], $$Vr$$ = [1, 48], $$Vs$$ = [1, 49], $$Vt$$ = [1, 50], $$Vu$$ = [1, 51], $$Vv$$ = [1, 52], $$Vw$$ = [1, 53], $$Vx$$ = [1, 54], $$Vy$$ = [1, 55], $$Vz$$ = [1, 56], $$VA$$ = [1, 44], $$VB$$ = [1, 45], $$VC$$ = [5, 9, 10, 11, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 45, 49, 50, 51, 52, 53, 54, 55, 56, 58, 59, 60, 61, 62, 64], $$VD$$ = [5, 9, 10, 
  11, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 45, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 58, 59, 60, 61, 62, 64, 67, 68, 69, 70], $$VE$$ = [1, 64], $$VF$$ = [1, 88], $$VG$$ = [1, 89], $$VH$$ = [1, 90], $$VI$$ = [1, 91], $$VJ$$ = [46, 67, 68, 69, 70], $$VK$$ = [1, 94], $$VL$$ = [46, 48], $$VM$$ = [46, 69, 70];
  $$V0$jscomp$1_parser$jscomp$1$$ = {trace:function() {
  }, $yy$:{}, $symbols_$:{error:2, result:3, value:4, EOF:5, literal_or_function:6, literal:7, "function":8, STRING:9, NUMBER:10, PERCENTAGE:11, length:12, angle:13, time:14, url:15, HEXCOLOR:16, IDENT:17, LENGTH_PX:18, LENGTH_EM:19, LENGTH_REM:20, LENGTH_VH:21, LENGTH_VW:22, LENGTH_VMIN:23, LENGTH_VMAX:24, LENGTH_CM:25, LENGTH_MM:26, LENGTH_Q:27, LENGTH_IN:28, LENGTH_PC:29, LENGTH_PT:30, ANGLE_DEG:31, ANGLE_RAD:32, ANGLE_GRAD:33, TIME_MS:34, TIME_S:35, var_function:36, calc_function:37, translate_function:38, 
  dim_function:39, num_function:40, rand_function:41, index_function:42, length_function:43, any_function:44, FUNCTION_START:45, ")":46, args:47, ",":48, URL_START:49, TRANSLATE_START:50, TRANSLATE_X_START:51, TRANSLATE_Y_START:52, TRANSLATE_Z_START:53, TRANSLATE_3D_START:54, WIDTH_START:55, HEIGHT_START:56, CLOSEST_START:57, NUM_START:58, RAND_START:59, INDEX_START:60, LENGTH_START:61, VAR_START:62, VAR_NAME:63, CALC_START:64, calc_expr:65, "(":66, "*":67, "/":68, "+":69, "-":70, $accept:0, $end:1}, 
  $terminals_$:{2:"error", 5:"EOF", 9:"STRING", 10:"NUMBER", 11:"PERCENTAGE", 16:"HEXCOLOR", 17:"IDENT", 18:"LENGTH_PX", 19:"LENGTH_EM", 20:"LENGTH_REM", 21:"LENGTH_VH", 22:"LENGTH_VW", 23:"LENGTH_VMIN", 24:"LENGTH_VMAX", 25:"LENGTH_CM", 26:"LENGTH_MM", 27:"LENGTH_Q", 28:"LENGTH_IN", 29:"LENGTH_PC", 30:"LENGTH_PT", 31:"ANGLE_DEG", 32:"ANGLE_RAD", 33:"ANGLE_GRAD", 34:"TIME_MS", 35:"TIME_S", 45:"FUNCTION_START", 46:")", 48:",", 49:"URL_START", 50:"TRANSLATE_START", 51:"TRANSLATE_X_START", 52:"TRANSLATE_Y_START", 
  53:"TRANSLATE_Z_START", 54:"TRANSLATE_3D_START", 55:"WIDTH_START", 56:"HEIGHT_START", 57:"CLOSEST_START", 58:"NUM_START", 59:"RAND_START", 60:"INDEX_START", 61:"LENGTH_START", 62:"VAR_START", 63:"VAR_NAME", 64:"CALC_START", 66:"(", 67:"*", 68:"/", 69:"+", 70:"-"}, $productions_$:[0, [3, 2], [3, 1], [4, 1], [4, 2], [6, 1], [6, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [12, 
  1], [12, 1], [12, 1], [13, 1], [13, 1], [13, 1], [14, 1], [14, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [8, 1], [44, 2], [44, 3], [47, 1], [47, 3], [15, 3], [38, 3], [38, 3], [38, 3], [38, 3], [38, 3], [39, 2], [39, 2], [39, 3], [39, 3], [39, 5], [39, 5], [40, 3], [41, 2], [41, 5], [42, 2], [43, 2], [36, 3], [36, 5], [37, 3], [65, 1], [65, 3], [65, 3], [65, 3], [65, 3], [65, 3]], $performAction$:function($o$jscomp$18$$, $Parser$jscomp$1$$, $$V0$jscomp$1_parser$jscomp$1$$, 
  $$V1$jscomp$1$$, $$V2$jscomp$1$$, $$V3$jscomp$1$$) {
    $o$jscomp$18$$ = $$V3$jscomp$1$$.length - 1;
    switch($$V2$jscomp$1$$) {
      case 1:
        return $$V3$jscomp$1$$[$o$jscomp$18$$ - 1];
      case 2:
        return null;
      case 3:
      case 5:
      case 6:
      case 10:
      case 11:
      case 12:
      case 13:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38:
      case 39:
      case 40:
      case 41:
      case 42:
      case 67:
        this.$$$ = $$V3$jscomp$1$$[$o$jscomp$18$$];
        break;
      case 4:
        $$V2$jscomp$1$$ = $$V3$jscomp$1$$[$o$jscomp$18$$ - 1];
        $$V3$jscomp$1$$ = $$V3$jscomp$1$$[$o$jscomp$18$$];
        $$V2$jscomp$1$$ = $$V2$jscomp$1$$ instanceof $CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $$V2$jscomp$1$$ : new $CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$([$$V2$jscomp$1$$]);
        $$V3$jscomp$1$$ instanceof $CssConcatNode$$module$extensions$amp_animation$0_1$css_expr_ast$$ ? $$V2$jscomp$1$$.$D$ = $$V2$jscomp$1$$.$D$.concat($$V3$jscomp$1$$.$D$) : $$V2$jscomp$1$$.$D$.push($$V3$jscomp$1$$);
        this.$$$ = $$V2$jscomp$1$$;
        break;
      case 7:
      case 14:
      case 15:
        this.$$$ = new $CssPassthroughNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$]);
        break;
      case 8:
        this.$$$ = new $CssNumberNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]));
        break;
      case 9:
        this.$$$ = new $CssPercentNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]));
        break;
      case 16:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "px");
        break;
      case 17:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "em");
        break;
      case 18:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "rem");
        break;
      case 19:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "vh");
        break;
      case 20:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "vw");
        break;
      case 21:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "vmin");
        break;
      case 22:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "vmax");
        break;
      case 23:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "cm");
        break;
      case 24:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "mm");
        break;
      case 25:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "q");
        break;
      case 26:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "in");
        break;
      case 27:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "pc");
        break;
      case 28:
        this.$$$ = new $CssLengthNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "pt");
        break;
      case 29:
        this.$$$ = new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "deg");
        break;
      case 30:
        this.$$$ = new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "rad");
        break;
      case 31:
        this.$$$ = new $CssAngleNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "grad");
        break;
      case 32:
        this.$$$ = new $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "ms");
        break;
      case 33:
        this.$$$ = new $CssTimeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$((0,window.parseFloat)($$V3$jscomp$1$$[$o$jscomp$18$$]), "s");
        break;
      case 43:
        this.$$$ = new $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 1].slice(0, -1), []);
        break;
      case 44:
        this.$$$ = new $CssFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 2].slice(0, -1), $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 45:
        this.$$$ = [$$V3$jscomp$1$$[$o$jscomp$18$$]];
        break;
      case 46:
        $$V2$jscomp$1$$ = $$V3$jscomp$1$$[$o$jscomp$18$$ - 2];
        $$V2$jscomp$1$$.push($$V3$jscomp$1$$[$o$jscomp$18$$]);
        this.$$$ = $$V2$jscomp$1$$;
        break;
      case 47:
        this.$$$ = new $CssUrlNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 1].slice(1, -1));
        break;
      case 48:
        this.$$$ = new $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 49:
        this.$$$ = new $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("x", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 50:
        this.$$$ = new $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("y", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 51:
        this.$$$ = new $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("z", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 52:
        this.$$$ = new $CssTranslateNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("3d", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 53:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("w");
        break;
      case 54:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("h");
        break;
      case 55:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("w", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1].slice(1, -1));
        break;
      case 56:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("h", $$V3$jscomp$1$$[$o$jscomp$18$$ - 1].slice(1, -1));
        break;
      case 57:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("w", $$V3$jscomp$1$$[$o$jscomp$18$$ - 2].slice(1, -1), "closest");
        break;
      case 58:
        this.$$$ = new $CssDimSizeNode$$module$extensions$amp_animation$0_1$css_expr_ast$$("h", $$V3$jscomp$1$$[$o$jscomp$18$$ - 2].slice(1, -1), "closest");
        break;
      case 59:
        this.$$$ = new $CssNumConvertNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 60:
        this.$$$ = new $CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$;
        break;
      case 61:
        this.$$$ = new $CssRandNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 3], $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 62:
        this.$$$ = new $CssIndexNode$$module$extensions$amp_animation$0_1$css_expr_ast$$;
        break;
      case 63:
        this.$$$ = new $CssLengthFuncNode$$module$extensions$amp_animation$0_1$css_expr_ast$$;
        break;
      case 64:
        this.$$$ = new $CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 65:
        this.$$$ = new $CssVarNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 3], $$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 66:
        this.$$$ = new $CssCalcNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 1]);
        break;
      case 68:
        this.$$$ = $$V3$jscomp$1$$[$o$jscomp$18$$ - 1];
        break;
      case 69:
        this.$$$ = new $CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 2], $$V3$jscomp$1$$[$o$jscomp$18$$], "*");
        break;
      case 70:
        this.$$$ = new $CssCalcProductNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 2], $$V3$jscomp$1$$[$o$jscomp$18$$], "/");
        break;
      case 71:
        this.$$$ = new $CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 2], $$V3$jscomp$1$$[$o$jscomp$18$$], "+");
        break;
      case 72:
        this.$$$ = new $CssCalcSumNode$$module$extensions$amp_animation$0_1$css_expr_ast$$($$V3$jscomp$1$$[$o$jscomp$18$$ - 2], $$V3$jscomp$1$$[$o$jscomp$18$$], "-");
    }
  }, table:[{3:1, 4:2, 5:[1, 3], 6:4, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 
  42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {1:[3]}, {5:[1, 58], 6:59, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 
  25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {1:[2, 2]}, $o$jscomp$18$$($$VC$$, [2, 3]), $o$jscomp$18$$($$VD$$, [2, 5]), $o$jscomp$18$$($$VD$$, [2, 6]), $o$jscomp$18$$($$VD$$, [2, 7]), 
  $o$jscomp$18$$($$VD$$, [2, 8]), $o$jscomp$18$$($$VD$$, [2, 9]), $o$jscomp$18$$($$VD$$, [2, 10]), $o$jscomp$18$$($$VD$$, [2, 11]), $o$jscomp$18$$($$VD$$, [2, 12]), $o$jscomp$18$$($$VD$$, [2, 13]), $o$jscomp$18$$($$VD$$, [2, 14]), $o$jscomp$18$$($$VD$$, [2, 15]), $o$jscomp$18$$($$VD$$, [2, 34]), $o$jscomp$18$$($$VD$$, [2, 35]), $o$jscomp$18$$($$VD$$, [2, 36]), $o$jscomp$18$$($$VD$$, [2, 37]), $o$jscomp$18$$($$VD$$, [2, 38]), $o$jscomp$18$$($$VD$$, [2, 39]), $o$jscomp$18$$($$VD$$, [2, 40]), $o$jscomp$18$$($$VD$$, 
  [2, 41]), $o$jscomp$18$$($$VD$$, [2, 42]), $o$jscomp$18$$($$VD$$, [2, 16]), $o$jscomp$18$$($$VD$$, [2, 17]), $o$jscomp$18$$($$VD$$, [2, 18]), $o$jscomp$18$$($$VD$$, [2, 19]), $o$jscomp$18$$($$VD$$, [2, 20]), $o$jscomp$18$$($$VD$$, [2, 21]), $o$jscomp$18$$($$VD$$, [2, 22]), $o$jscomp$18$$($$VD$$, [2, 23]), $o$jscomp$18$$($$VD$$, [2, 24]), $o$jscomp$18$$($$VD$$, [2, 25]), $o$jscomp$18$$($$VD$$, [2, 26]), $o$jscomp$18$$($$VD$$, [2, 27]), $o$jscomp$18$$($$VD$$, [2, 28]), $o$jscomp$18$$($$VD$$, [2, 
  29]), $o$jscomp$18$$($$VD$$, [2, 30]), $o$jscomp$18$$($$VD$$, [2, 31]), $o$jscomp$18$$($$VD$$, [2, 32]), $o$jscomp$18$$($$VD$$, [2, 33]), {9:[1, 60]}, {63:[1, 61]}, {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 
  28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:62, 66:$$VE$$}, {6:66, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 
  19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 47:65, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {6:66, 7:5, 8:6, 
  9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 47:67, 49:$$Vo$$, 
  50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {6:66, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 
  30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 47:68, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {6:66, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 
  20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 47:69, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {6:66, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 
  10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 47:70, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 
  53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {9:[1, 72], 46:[1, 71], 57:[1, 73]}, {9:[1, 75], 46:[1, 74], 57:[1, 76]}, {6:77, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 
  26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {6:79, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 
  18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 46:[1, 78], 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 
  64:$$VB$$}, {46:[1, 80]}, {46:[1, 81]}, {6:66, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 
  41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 46:[1, 82], 47:83, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, {1:[2, 1]}, $o$jscomp$18$$($$VC$$, [2, 4]), {46:[1, 84]}, {46:[1, 85], 48:[1, 86]}, {46:[1, 87], 67:$$VF$$, 68:$$VG$$, 69:$$VH$$, 70:$$VI$$}, $o$jscomp$18$$($$VJ$$, [2, 67]), {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 
  15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 
  60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:92, 66:$$VE$$}, {46:[1, 93], 48:$$VK$$}, $o$jscomp$18$$($$VL$$, [2, 45]), {46:[1, 95], 48:$$VK$$}, {46:[1, 96], 48:$$VK$$}, {46:[1, 97], 48:$$VK$$}, {46:[1, 98], 48:$$VK$$}, $o$jscomp$18$$($$VD$$, [2, 53]), {46:[1, 99]}, {9:[1, 100]}, $o$jscomp$18$$($$VD$$, [2, 54]), {46:[1, 101]}, {9:[1, 102]}, {46:[1, 103]}, $o$jscomp$18$$($$VD$$, [2, 60]), {48:[1, 104]}, $o$jscomp$18$$($$VD$$, [2, 62]), $o$jscomp$18$$($$VD$$, [2, 63]), $o$jscomp$18$$($$VD$$, [2, 
  43]), {46:[1, 105], 48:$$VK$$}, $o$jscomp$18$$($$VD$$, [2, 47]), $o$jscomp$18$$($$VD$$, [2, 64]), {6:106, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 
  34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, $o$jscomp$18$$($$VD$$, [2, 66]), {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 
  21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:107, 66:$$VE$$}, {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 
  10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 
  54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:108, 66:$$VE$$}, {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 
  32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:109, 66:$$VE$$}, {6:63, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 
  21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$, 65:110, 66:$$VE$$}, {46:[1, 111], 67:$$VF$$, 68:$$VG$$, 69:$$VH$$, 
  70:$$VI$$}, $o$jscomp$18$$($$VD$$, [2, 48]), {6:112, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 
  40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, $o$jscomp$18$$($$VD$$, [2, 49]), $o$jscomp$18$$($$VD$$, [2, 50]), $o$jscomp$18$$($$VD$$, [2, 51]), $o$jscomp$18$$($$VD$$, [2, 52]), $o$jscomp$18$$($$VD$$, [2, 55]), {46:[1, 113]}, $o$jscomp$18$$($$VD$$, [2, 56]), {46:[1, 114]}, $o$jscomp$18$$($$VD$$, [2, 59]), {6:115, 7:5, 8:6, 9:$$V0$jscomp$1_parser$jscomp$1$$, 
  10:$$V1$jscomp$1$$, 11:$$V2$jscomp$1$$, 12:10, 13:11, 14:12, 15:13, 16:$$V3$jscomp$1$$, 17:$$V4$jscomp$1$$, 18:$$V5$jscomp$1$$, 19:$$V6$jscomp$1$$, 20:$$V7$jscomp$1$$, 21:$$V8$jscomp$1$$, 22:$$V9$jscomp$1$$, 23:$$Va$jscomp$1$$, 24:$$Vb$jscomp$1$$, 25:$$Vc$jscomp$1$$, 26:$$Vd$$, 27:$$Ve$$, 28:$$Vf$$, 29:$$Vg$$, 30:$$Vh$$, 31:$$Vi$$, 32:$$Vj$$, 33:$$Vk$$, 34:$$Vl$$, 35:$$Vm$$, 36:16, 37:17, 38:18, 39:19, 40:20, 41:21, 42:22, 43:23, 44:24, 45:$$Vn$$, 49:$$Vo$$, 50:$$Vp$$, 51:$$Vq$$, 52:$$Vr$$, 53:$$Vs$$, 
  54:$$Vt$$, 55:$$Vu$$, 56:$$Vv$$, 58:$$Vw$$, 59:$$Vx$$, 60:$$Vy$$, 61:$$Vz$$, 62:$$VA$$, 64:$$VB$$}, $o$jscomp$18$$($$VD$$, [2, 44]), {46:[1, 116]}, $o$jscomp$18$$($$VJ$$, [2, 69]), $o$jscomp$18$$($$VJ$$, [2, 70]), $o$jscomp$18$$($$VM$$, [2, 71], {67:$$VF$$, 68:$$VG$$}), $o$jscomp$18$$($$VM$$, [2, 72], {67:$$VF$$, 68:$$VG$$}), $o$jscomp$18$$($$VJ$$, [2, 68]), $o$jscomp$18$$($$VL$$, [2, 46]), {46:[1, 117]}, {46:[1, 118]}, {46:[1, 119]}, $o$jscomp$18$$($$VD$$, [2, 65]), $o$jscomp$18$$($$VD$$, [2, 
  57]), $o$jscomp$18$$($$VD$$, [2, 58]), $o$jscomp$18$$($$VD$$, [2, 61])], $defaultActions$:{3:[2, 2], 58:[2, 1]}, parseError:function($o$jscomp$18$$, $Parser$jscomp$1$$) {
    if ($Parser$jscomp$1$$.$recoverable$) {
      this.trace($o$jscomp$18$$);
    } else {
      throw $o$jscomp$18$$ = Error($o$jscomp$18$$), $o$jscomp$18$$.hash = $Parser$jscomp$1$$, $o$jscomp$18$$;
    }
  }, parse:function($o$jscomp$18$$) {
    var $Parser$jscomp$1$$ = [0], $$V0$jscomp$1_parser$jscomp$1$$ = [null], $$V1$jscomp$1$$ = [], $$V2$jscomp$1$$ = this.table, $$V3$jscomp$1$$ = "", $$V4$jscomp$1$$ = 0, $$V5$jscomp$1$$ = 0, $$V6$jscomp$1$$ = 0, $$V7$jscomp$1$$ = $$V1$jscomp$1$$.slice.call(arguments, 1), $$V8$jscomp$1$$ = Object.create(this.$lexer$), $$Vs$$ = {};
    for ($$V9$jscomp$1$$ in this.$yy$) {
      Object.prototype.hasOwnProperty.call(this.$yy$, $$V9$jscomp$1$$) && ($$Vs$$[$$V9$jscomp$1$$] = this.$yy$[$$V9$jscomp$1$$]);
    }
    $$V8$jscomp$1$$.$setInput$($o$jscomp$18$$, $$Vs$$);
    $$Vs$$.$lexer$ = $$V8$jscomp$1$$;
    $$Vs$$.$parser$ = this;
    "undefined" == typeof $$V8$jscomp$1$$.$yylloc$ && ($$V8$jscomp$1$$.$yylloc$ = {});
    var $$V9$jscomp$1$$ = $$V8$jscomp$1$$.$yylloc$;
    $$V1$jscomp$1$$.push($$V9$jscomp$1$$);
    var $$Vc$jscomp$1$$ = $$V8$jscomp$1$$.options && $$V8$jscomp$1$$.options.$ranges$;
    "function" === typeof $$Vs$$.parseError ? this.parseError = $$Vs$$.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
    for (var $$Va$jscomp$1$$, $$Vr$$, $$Vd$$, $$Vb$jscomp$1$$, $$Vt$$ = {}, $$Vu$$, $$Vv$$;;) {
      $$Vd$$ = $Parser$jscomp$1$$[$Parser$jscomp$1$$.length - 1];
      if (this.$defaultActions$[$$Vd$$]) {
        $$Vb$jscomp$1$$ = this.$defaultActions$[$$Vd$$];
      } else {
        if (null === $$Va$jscomp$1$$ || "undefined" == typeof $$Va$jscomp$1$$) {
          $$Va$jscomp$1$$ = $$V8$jscomp$1$$.$lex$() || 1, "number" !== typeof $$Va$jscomp$1$$ && ($$Va$jscomp$1$$ = this.$symbols_$[$$Va$jscomp$1$$] || $$Va$jscomp$1$$);
        }
        $$Vb$jscomp$1$$ = $$V2$jscomp$1$$[$$Vd$$] && $$V2$jscomp$1$$[$$Vd$$][$$Va$jscomp$1$$];
      }
      if ("undefined" === typeof $$Vb$jscomp$1$$ || !$$Vb$jscomp$1$$.length || !$$Vb$jscomp$1$$[0]) {
        $$Vv$$ = [];
        for ($$Vu$$ in $$V2$jscomp$1$$[$$Vd$$]) {
          this.$terminals_$[$$Vu$$] && 2 < $$Vu$$ && $$Vv$$.push("'" + this.$terminals_$[$$Vu$$] + "'");
        }
        var $$Vw$$ = $$V8$jscomp$1$$.$showPosition$ ? "Parse error on line " + ($$V4$jscomp$1$$ + 1) + ":\n" + $$V8$jscomp$1$$.$showPosition$() + "\nExpecting " + $$Vv$$.join(", ") + ", got '" + (this.$terminals_$[$$Va$jscomp$1$$] || $$Va$jscomp$1$$) + "'" : "Parse error on line " + ($$V4$jscomp$1$$ + 1) + ": Unexpected " + (1 == $$Va$jscomp$1$$ ? "end of input" : "'" + (this.$terminals_$[$$Va$jscomp$1$$] || $$Va$jscomp$1$$) + "'");
        this.parseError($$Vw$$, {text:$$V8$jscomp$1$$.match, $token$:this.$terminals_$[$$Va$jscomp$1$$] || $$Va$jscomp$1$$, line:$$V8$jscomp$1$$.$yylineno$, $loc$:$$V9$jscomp$1$$, $expected$:$$Vv$$});
      }
      if ($$Vb$jscomp$1$$[0] instanceof Array && 1 < $$Vb$jscomp$1$$.length) {
        throw Error("Parse Error: multiple actions possible at state: " + $$Vd$$ + ", token: " + $$Va$jscomp$1$$);
      }
      switch($$Vb$jscomp$1$$[0]) {
        case 1:
          $Parser$jscomp$1$$.push($$Va$jscomp$1$$);
          $$V0$jscomp$1_parser$jscomp$1$$.push($$V8$jscomp$1$$.$yytext$);
          $$V1$jscomp$1$$.push($$V8$jscomp$1$$.$yylloc$);
          $Parser$jscomp$1$$.push($$Vb$jscomp$1$$[1]);
          $$Va$jscomp$1$$ = null;
          $$Vr$$ ? ($$Va$jscomp$1$$ = $$Vr$$, $$Vr$$ = null) : ($$V5$jscomp$1$$ = $$V8$jscomp$1$$.$yyleng$, $$V3$jscomp$1$$ = $$V8$jscomp$1$$.$yytext$, $$V4$jscomp$1$$ = $$V8$jscomp$1$$.$yylineno$, $$V9$jscomp$1$$ = $$V8$jscomp$1$$.$yylloc$, 0 < $$V6$jscomp$1$$ && $$V6$jscomp$1$$--);
          break;
        case 2:
          $$Vv$$ = this.$productions_$[$$Vb$jscomp$1$$[1]][1];
          $$Vt$$.$$$ = $$V0$jscomp$1_parser$jscomp$1$$[$$V0$jscomp$1_parser$jscomp$1$$.length - $$Vv$$];
          $$Vt$$.$_$$ = {$first_line$:$$V1$jscomp$1$$[$$V1$jscomp$1$$.length - ($$Vv$$ || 1)].$first_line$, $last_line$:$$V1$jscomp$1$$[$$V1$jscomp$1$$.length - 1].$last_line$, $first_column$:$$V1$jscomp$1$$[$$V1$jscomp$1$$.length - ($$Vv$$ || 1)].$first_column$, $last_column$:$$V1$jscomp$1$$[$$V1$jscomp$1$$.length - 1].$last_column$};
          $$Vc$jscomp$1$$ && ($$Vt$$.$_$$.$range$ = [$$V1$jscomp$1$$[$$V1$jscomp$1$$.length - ($$Vv$$ || 1)].$range$[0], $$V1$jscomp$1$$[$$V1$jscomp$1$$.length - 1].$range$[1]]);
          $$Vd$$ = this.$performAction$.apply($$Vt$$, [$$V3$jscomp$1$$, $$V5$jscomp$1$$, $$V4$jscomp$1$$, $$Vs$$, $$Vb$jscomp$1$$[1], $$V0$jscomp$1_parser$jscomp$1$$, $$V1$jscomp$1$$].concat($$V7$jscomp$1$$));
          if ("undefined" !== typeof $$Vd$$) {
            return $$Vd$$;
          }
          $$Vv$$ && ($Parser$jscomp$1$$ = $Parser$jscomp$1$$.slice(0, -2 * $$Vv$$), $$V0$jscomp$1_parser$jscomp$1$$ = $$V0$jscomp$1_parser$jscomp$1$$.slice(0, -1 * $$Vv$$), $$V1$jscomp$1$$ = $$V1$jscomp$1$$.slice(0, -1 * $$Vv$$));
          $Parser$jscomp$1$$.push(this.$productions_$[$$Vb$jscomp$1$$[1]][0]);
          $$V0$jscomp$1_parser$jscomp$1$$.push($$Vt$$.$$$);
          $$V1$jscomp$1$$.push($$Vt$$.$_$$);
          $$Vb$jscomp$1$$ = $$V2$jscomp$1$$[$Parser$jscomp$1$$[$Parser$jscomp$1$$.length - 2]][$Parser$jscomp$1$$[$Parser$jscomp$1$$.length - 1]];
          $Parser$jscomp$1$$.push($$Vb$jscomp$1$$);
          break;
        case 3:
          return !0;
      }
    }
  }};
  $$V0$jscomp$1_parser$jscomp$1$$.$lexer$ = function() {
    return {$EOF$:1, parseError:function($o$jscomp$18$$, $Parser$jscomp$1$$) {
      if (this.$yy$.$parser$) {
        this.$yy$.$parser$.parseError($o$jscomp$18$$, $Parser$jscomp$1$$);
      } else {
        throw Error($o$jscomp$18$$);
      }
    }, $setInput$:function($o$jscomp$18$$, $Parser$jscomp$1$$) {
      this.$yy$ = $Parser$jscomp$1$$ || this.$yy$ || {};
      this.$_input$ = $o$jscomp$18$$;
      this.$_more$ = this.$_backtrack$ = this.done = !1;
      this.$yylineno$ = this.$yyleng$ = 0;
      this.$yytext$ = this.$matched$ = this.match = "";
      this.$conditionStack$ = ["INITIAL"];
      this.$yylloc$ = {$first_line$:1, $first_column$:0, $last_line$:1, $last_column$:0};
      this.options.$ranges$ && (this.$yylloc$.$range$ = [0, 0]);
      this.offset = 0;
      return this;
    }, input:function() {
      var $o$jscomp$18$$ = this.$_input$[0];
      this.$yytext$ += $o$jscomp$18$$;
      this.$yyleng$++;
      this.offset++;
      this.match += $o$jscomp$18$$;
      this.$matched$ += $o$jscomp$18$$;
      $o$jscomp$18$$.match(/(?:\r\n?|\n).*/g) ? (this.$yylineno$++, this.$yylloc$.$last_line$++) : this.$yylloc$.$last_column$++;
      this.options.$ranges$ && this.$yylloc$.$range$[1]++;
      this.$_input$ = this.$_input$.slice(1);
      return $o$jscomp$18$$;
    }, $unput$:function($o$jscomp$18$$) {
      var $Parser$jscomp$1$$ = $o$jscomp$18$$.length, $$V0$jscomp$1_parser$jscomp$1$$ = $o$jscomp$18$$.split(/(?:\r\n?|\n)/g);
      this.$_input$ = $o$jscomp$18$$ + this.$_input$;
      this.$yytext$ = this.$yytext$.substr(0, this.$yytext$.length - $Parser$jscomp$1$$);
      this.offset -= $Parser$jscomp$1$$;
      $o$jscomp$18$$ = this.match.split(/(?:\r\n?|\n)/g);
      this.match = this.match.substr(0, this.match.length - 1);
      this.$matched$ = this.$matched$.substr(0, this.$matched$.length - 1);
      $$V0$jscomp$1_parser$jscomp$1$$.length - 1 && (this.$yylineno$ -= $$V0$jscomp$1_parser$jscomp$1$$.length - 1);
      var $$V1$jscomp$1$$ = this.$yylloc$.$range$;
      this.$yylloc$ = {$first_line$:this.$yylloc$.$first_line$, $last_line$:this.$yylineno$ + 1, $first_column$:this.$yylloc$.$first_column$, $last_column$:$$V0$jscomp$1_parser$jscomp$1$$ ? ($$V0$jscomp$1_parser$jscomp$1$$.length === $o$jscomp$18$$.length ? this.$yylloc$.$first_column$ : 0) + $o$jscomp$18$$[$o$jscomp$18$$.length - $$V0$jscomp$1_parser$jscomp$1$$.length].length - $$V0$jscomp$1_parser$jscomp$1$$[0].length : this.$yylloc$.$first_column$ - $Parser$jscomp$1$$};
      this.options.$ranges$ && (this.$yylloc$.$range$ = [$$V1$jscomp$1$$[0], $$V1$jscomp$1$$[0] + this.$yyleng$ - $Parser$jscomp$1$$]);
      this.$yyleng$ = this.$yytext$.length;
      return this;
    }, $more$:function() {
      this.$_more$ = !0;
      return this;
    }, reject:function() {
      if (this.options.$backtrack_lexer$) {
        this.$_backtrack$ = !0;
      } else {
        return this.parseError("Lexical error on line " + (this.$yylineno$ + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.$showPosition$(), {text:"", $token$:null, line:this.$yylineno$});
      }
      return this;
    }, $less$:function($o$jscomp$18$$) {
      this.$unput$(this.match.slice($o$jscomp$18$$));
    }, $pastInput$:function() {
      var $o$jscomp$18$$ = this.$matched$.substr(0, this.$matched$.length - this.match.length);
      return (20 < $o$jscomp$18$$.length ? "..." : "") + $o$jscomp$18$$.substr(-20).replace(/\n/g, "");
    }, $upcomingInput$:function() {
      var $o$jscomp$18$$ = this.match;
      20 > $o$jscomp$18$$.length && ($o$jscomp$18$$ += this.$_input$.substr(0, 20 - $o$jscomp$18$$.length));
      return ($o$jscomp$18$$.substr(0, 20) + (20 < $o$jscomp$18$$.length ? "..." : "")).replace(/\n/g, "");
    }, $showPosition$:function() {
      var $o$jscomp$18$$ = this.$pastInput$(), $Parser$jscomp$1$$ = Array($o$jscomp$18$$.length + 1).join("-");
      return $o$jscomp$18$$ + this.$upcomingInput$() + "\n" + $Parser$jscomp$1$$ + "^";
    }, $test_match$:function($o$jscomp$18$$, $Parser$jscomp$1$$) {
      var $$V0$jscomp$1_parser$jscomp$1$$;
      if (this.options.$backtrack_lexer$) {
        var $$V1$jscomp$1$$ = {$yylineno$:this.$yylineno$, $yylloc$:{$first_line$:this.$yylloc$.$first_line$, $last_line$:this.$last_line$, $first_column$:this.$yylloc$.$first_column$, $last_column$:this.$yylloc$.$last_column$}, $yytext$:this.$yytext$, match:this.match, matches:this.matches, $matched$:this.$matched$, $yyleng$:this.$yyleng$, offset:this.offset, $_more$:this.$_more$, $_input$:this.$_input$, $yy$:this.$yy$, $conditionStack$:this.$conditionStack$.slice(0), done:this.done};
        this.options.$ranges$ && ($$V1$jscomp$1$$.$yylloc$.$range$ = this.$yylloc$.$range$.slice(0));
      }
      if ($$V0$jscomp$1_parser$jscomp$1$$ = $o$jscomp$18$$[0].match(/(?:\r\n?|\n).*/g)) {
        this.$yylineno$ += $$V0$jscomp$1_parser$jscomp$1$$.length;
      }
      this.$yylloc$ = {$first_line$:this.$yylloc$.$last_line$, $last_line$:this.$yylineno$ + 1, $first_column$:this.$yylloc$.$last_column$, $last_column$:$$V0$jscomp$1_parser$jscomp$1$$ ? $$V0$jscomp$1_parser$jscomp$1$$[$$V0$jscomp$1_parser$jscomp$1$$.length - 1].length - $$V0$jscomp$1_parser$jscomp$1$$[$$V0$jscomp$1_parser$jscomp$1$$.length - 1].match(/\r?\n?/)[0].length : this.$yylloc$.$last_column$ + $o$jscomp$18$$[0].length};
      this.$yytext$ += $o$jscomp$18$$[0];
      this.match += $o$jscomp$18$$[0];
      this.matches = $o$jscomp$18$$;
      this.$yyleng$ = this.$yytext$.length;
      this.options.$ranges$ && (this.$yylloc$.$range$ = [this.offset, this.offset += this.$yyleng$]);
      this.$_backtrack$ = this.$_more$ = !1;
      this.$_input$ = this.$_input$.slice($o$jscomp$18$$[0].length);
      this.$matched$ += $o$jscomp$18$$[0];
      $o$jscomp$18$$ = this.$performAction$.call(this, this.$yy$, this, $Parser$jscomp$1$$, this.$conditionStack$[this.$conditionStack$.length - 1]);
      this.done && this.$_input$ && (this.done = !1);
      if ($o$jscomp$18$$) {
        return $o$jscomp$18$$;
      }
      if (this.$_backtrack$) {
        for (var $$V2$jscomp$1$$ in $$V1$jscomp$1$$) {
          this[$$V2$jscomp$1$$] = $$V1$jscomp$1$$[$$V2$jscomp$1$$];
        }
      }
      return !1;
    }, next:function() {
      if (this.done) {
        return this.$EOF$;
      }
      this.$_input$ || (this.done = !0);
      var $o$jscomp$18$$;
      this.$_more$ || (this.match = this.$yytext$ = "");
      for (var $Parser$jscomp$1$$ = this.$_currentRules$(), $$V0$jscomp$1_parser$jscomp$1$$ = 0; $$V0$jscomp$1_parser$jscomp$1$$ < $Parser$jscomp$1$$.length; $$V0$jscomp$1_parser$jscomp$1$$++) {
        if (($o$jscomp$18$$ = this.$_input$.match(this.rules[$Parser$jscomp$1$$[$$V0$jscomp$1_parser$jscomp$1$$]])) && (!$$V1$jscomp$1$$ || $o$jscomp$18$$[0].length > $$V1$jscomp$1$$[0].length)) {
          var $$V1$jscomp$1$$ = $o$jscomp$18$$;
          var $$V2$jscomp$1$$ = $$V0$jscomp$1_parser$jscomp$1$$;
          if (this.options.$backtrack_lexer$) {
            $$V1$jscomp$1$$ = this.$test_match$($o$jscomp$18$$, $Parser$jscomp$1$$[$$V0$jscomp$1_parser$jscomp$1$$]);
            if (!1 !== $$V1$jscomp$1$$) {
              return $$V1$jscomp$1$$;
            }
            if (this.$_backtrack$) {
              $$V1$jscomp$1$$ = !1;
            } else {
              return !1;
            }
          } else {
            if (!this.options.flex) {
              break;
            }
          }
        }
      }
      return $$V1$jscomp$1$$ ? ($$V1$jscomp$1$$ = this.$test_match$($$V1$jscomp$1$$, $Parser$jscomp$1$$[$$V2$jscomp$1$$]), !1 !== $$V1$jscomp$1$$ ? $$V1$jscomp$1$$ : !1) : "" === this.$_input$ ? this.$EOF$ : this.parseError("Lexical error on line " + (this.$yylineno$ + 1) + ". Unrecognized text.\n" + this.$showPosition$(), {text:"", $token$:null, line:this.$yylineno$});
    }, $lex$:function() {
      var $o$jscomp$18$$ = this.next();
      return $o$jscomp$18$$ ? $o$jscomp$18$$ : this.$lex$();
    }, $begin$:function($o$jscomp$18$$) {
      this.$conditionStack$.push($o$jscomp$18$$);
    }, $popState$:function() {
      return 0 < this.$conditionStack$.length - 1 ? this.$conditionStack$.pop() : this.$conditionStack$[0];
    }, $_currentRules$:function() {
      return this.$conditionStack$.length && this.$conditionStack$[this.$conditionStack$.length - 1] ? this.$conditions$[this.$conditionStack$[this.$conditionStack$.length - 1]].rules : this.$conditions$.INITIAL.rules;
    }, $topState$:function($o$jscomp$18$$) {
      $o$jscomp$18$$ = this.$conditionStack$.length - 1 - Math.abs($o$jscomp$18$$ || 0);
      return 0 <= $o$jscomp$18$$ ? this.$conditionStack$[$o$jscomp$18$$] : "INITIAL";
    }, pushState:function($o$jscomp$18$$) {
      this.$begin$($o$jscomp$18$$);
    }, $stateStackSize$:function() {
      return this.$conditionStack$.length;
    }, options:{}, $performAction$:function($o$jscomp$18$$, $Parser$jscomp$1$$, $$V0$jscomp$1_parser$jscomp$1$$) {
      switch($$V0$jscomp$1_parser$jscomp$1$$) {
        case 1:
          return 18;
        case 2:
          return 19;
        case 3:
          return 20;
        case 4:
          return 21;
        case 5:
          return 22;
        case 6:
          return 23;
        case 7:
          return 24;
        case 8:
          return 25;
        case 9:
          return 26;
        case 10:
          return 27;
        case 11:
          return 28;
        case 12:
          return 29;
        case 13:
          return 30;
        case 14:
          return 31;
        case 15:
          return 32;
        case 16:
          return 33;
        case 17:
          return 34;
        case 18:
          return 35;
        case 19:
          return 11;
        case 20:
          return 10;
        case 21:
          return 16;
        case 22:
          return 49;
        case 23:
          return 64;
        case 24:
          return 62;
        case 25:
          return 50;
        case 26:
          return 51;
        case 27:
          return 52;
        case 28:
          return 53;
        case 29:
          return 54;
        case 30:
          return 59;
        case 31:
          return 60;
        case 32:
          return 61;
        case 33:
          return 55;
        case 34:
          return 56;
        case 35:
          return 57;
        case 36:
          return 58;
        case 37:
          return 45;
        case 38:
          return 17;
        case 39:
          return 63;
        case 40:
          return 9;
        case 41:
          return 69;
        case 42:
          return 70;
        case 43:
          return 67;
        case 44:
          return 68;
        case 45:
          return 66;
        case 46:
          return 46;
        case 47:
          return 48;
        case 48:
          return "INVALID";
        case 49:
          return 5;
      }
    }, rules:[/^(?:\s+)/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Pp])([Xx]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Ee])([Mm]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Rr])([Ee])([Mm]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Vv])([Hh]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Vv])([Ww]))/, 
    /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Vv])([Mm])([Ii])([Nn]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Vv])([Mm])([Aa])([Xx]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Cc])([Mm]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Mm])([Mm]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Qq]))/, 
    /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Ii])([Nn]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Pp])([Cc]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Pp])([Tt]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Dd])([Ee])([Gg]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Rr])([Aa])([Dd]))/, 
    /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Gg])([Rr])([Aa])([Dd]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Mm])([Ss]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)([Ss]))/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)%)/, /^(?:([+-]?[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?|[+-]?\.[0-9]+([eE][+\-]?[0-9]+)?)\b)/, /^(?:#([a-fA-F0-9]+))/, /^(?:([Uu])([Rr])([Ll])\()/, 
    /^(?:([Cc])([Aa])([Ll])([Cc])\()/, /^(?:([Vv])([Aa])([Rr])\()/, /^(?:([Tt])([Rr])([Aa])([Nn])([Ss])([Ll])([Aa])([Tt])([Ee])\()/, /^(?:([Tt])([Rr])([Aa])([Nn])([Ss])([Ll])([Aa])([Tt])([Ee])([Xx])\()/, /^(?:([Tt])([Rr])([Aa])([Nn])([Ss])([Ll])([Aa])([Tt])([Ee])([Yy])\()/, /^(?:([Tt])([Rr])([Aa])([Nn])([Ss])([Ll])([Aa])([Tt])([Ee])([Zz])\()/, /^(?:([Tt])([Rr])([Aa])([Nn])([Ss])([Ll])([Aa])([Tt])([Ee])3([Dd])\()/, /^(?:([Rr])([Aa])([Nn])([Dd])\()/, /^(?:([Ii])([Nn])([Dd])([Ee])([Xx])\()/, /^(?:([Ll])([Ee])([Nn])([Gg])([Tt])([Hh])\()/, 
    /^(?:([Ww])([Ii])([Dd])([Tt])([Hh])\()/, /^(?:([Hh])([Ee])([Ii])([Gg])([Hh])([Tt])\()/, /^(?:([Cc])([Ll])([Oo])([Ss])([Ee])([Ss])([Tt])\()/, /^(?:([Nn])([Uu])([Mm])\()/, /^(?:(-?[a-zA-Z_][\-a-zA-Z0-9_]*)\()/, /^(?:(-?[a-zA-Z_][\-a-zA-Z0-9_]*))/, /^(?:--(-?[a-zA-Z_][\-a-zA-Z0-9_]*))/, /^(?:('[^']*'|"[^"]*"))/, /^(?:\+)/, /^(?:-)/, /^(?:\*)/, /^(?:\/)/, /^(?:\()/, /^(?:\))/, /^(?:,)/, /^(?:.)/, /^(?:$)/], $conditions$:{INITIAL:{rules:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 
    18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], inclusive:!0}}};
  }();
  $Parser$jscomp$1$$.prototype = $$V0$jscomp$1_parser$jscomp$1$$;
  $$V0$jscomp$1_parser$jscomp$1$$.$D$ = $Parser$jscomp$1$$;
  return new $Parser$jscomp$1$$;
}();
var $animIdCounter$$module$extensions$amp_animation$0_1$web_animations$$ = 0, $SERVICE_PROPS$$module$extensions$amp_animation$0_1$web_animations$$ = {offset:!0, easing:!0};
_.$JSCompiler_prototypeAlias$$ = $AnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getPlayState$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$onPlayStateChanged$ = function() {
};
_.$JSCompiler_prototypeAlias$$.init = function() {
};
_.$JSCompiler_prototypeAlias$$.start = function() {
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
};
_.$JSCompiler_prototypeAlias$$.resume = function() {
};
_.$JSCompiler_prototypeAlias$$.reverse = function() {
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$seekToPercent$ = function() {
};
_.$JSCompiler_prototypeAlias$$.finish = function() {
};
_.$JSCompiler_prototypeAlias$$.cancel = function() {
};
_.$JSCompiler_prototypeAlias$$.$setPlayState_$ = function() {
};
_.$$jscomp$inherits$$($AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$, $AnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$);
$AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.init = function() {
  var $$jscomp$this$jscomp$419$$ = this;
  this.$requests_$.map(function($request$jscomp$27$$) {
    $request$jscomp$27$$.$vars$ && _.$setStyles$$module$src$style$$($request$jscomp$27$$.target, _.$assertDoesNotContainDisplay$$module$src$style$$($request$jscomp$27$$.$vars$));
    window.CSS.animationWorklet.addModule(window.URL.createObjectURL(new window.Blob(["\n    registerAnimator('anim" + ++$animIdCounter$$module$extensions$amp_animation$0_1$web_animations$$ + "', class {\n      constructor(options = {\n        'time-range': 0,\n        'start-offset': 0,\n        'end-offset': 0,\n        'top-ratio': 0,\n        'bottom-ratio': 0,\n        'element-height': 0,\n      }) {\n        this.timeRange = options['time-range'];\n        this.startOffset = options['start-offset'];\n        this.endOffset = options['end-offset'];\n        this.topRatio = options['top-ratio'];\n        this.bottomRatio = options['bottom-ratio'];\n        this.height = options['element-height'];\n      }\n      animate(currentTime, effect) {\n        if (currentTime == NaN) {\n          return;\n        }\n\n        // This function mirrors updateVisibility_ in amp-position-observer\n        const currentScrollPos =\n        ((currentTime / this.timeRange) *\n        (this.endOffset - this.startOffset)) +\n        this.startOffset;\n        const halfViewport = (this.startOffset + this.endOffset) / 2;\n        const relativePositionTop = currentScrollPos > halfViewport;\n\n        const ratioToUse = relativePositionTop ?\n        this.topRatio : this.bottomRatio;\n        const offset = this.height * ratioToUse;\n        let isVisible = false;\n\n        if (relativePositionTop) {\n          isVisible =\n          currentScrollPos + this.height >= (this.startOffset + offset);\n        } else {\n          isVisible =\n          currentScrollPos <= (this.endOffset - offset);\n        }\n        if (isVisible) {\n          effect.localTime = currentTime;\n        }\n\n      }\n    });\n    "], 
    {type:"text/javascript"}))).then(function() {
      var $scrollSource_scrollTimeline$$ = _.$Services$$module$src$services$viewportForDoc$$($$jscomp$this$jscomp$419$$.$F$.document.documentElement).$D$.$ViewportBindingDef$$module$src$service$viewport$viewport_binding_def_prototype$getScrollingElement$(), $elementRect$jscomp$2_player$jscomp$1$$ = $request$jscomp$27$$.target.getBoundingClientRect();
      $scrollSource_scrollTimeline$$ = new $$jscomp$this$jscomp$419$$.$F$.$ScrollTimeline$({$scrollSource$:$scrollSource_scrollTimeline$$, orientation:"block", $timeRange$:$request$jscomp$27$$.timing.duration, $startScrollOffset$:$$jscomp$this$jscomp$419$$.$I$ + "px", $endScrollOffset$:$$jscomp$this$jscomp$419$$.$G$ + "px", fill:$request$jscomp$27$$.timing.fill});
      var $keyframeEffect$$ = new window.KeyframeEffect($request$jscomp$27$$.target, $request$jscomp$27$$.keyframes, $request$jscomp$27$$.timing);
      $elementRect$jscomp$2_player$jscomp$1$$ = new $$jscomp$this$jscomp$419$$.$F$.$WorkletAnimation$("anim" + $animIdCounter$$module$extensions$amp_animation$0_1$web_animations$$, [$keyframeEffect$$], $scrollSource_scrollTimeline$$, {"time-range":$request$jscomp$27$$.timing.duration, "start-offset":$$jscomp$this$jscomp$419$$.$I$, "end-offset":$$jscomp$this$jscomp$419$$.$G$, "top-ratio":$$jscomp$this$jscomp$419$$.$topRatio_$, "bottom-ratio":$$jscomp$this$jscomp$419$$.$bottomRatio_$, "element-height":$elementRect$jscomp$2_player$jscomp$1$$.height});
      $elementRect$jscomp$2_player$jscomp$1$$.play();
      $$jscomp$this$jscomp$419$$.$D$.push($elementRect$jscomp$2_player$jscomp$1$$);
    });
  });
};
$AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.start = function() {
  this.$D$ || this.init();
};
$AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.cancel = function() {
  this.$D$ && this.$D$.forEach(function($player$jscomp$2$$) {
    $player$jscomp$2$$.cancel();
  });
};
_.$$jscomp$inherits$$($WebAnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$, $AnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$);
_.$JSCompiler_prototypeAlias$$ = $WebAnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getPlayState$ = function() {
  return this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$onPlayStateChanged$ = function($handler$jscomp$44$$) {
  this.$I$.add($handler$jscomp$44$$);
};
_.$JSCompiler_prototypeAlias$$.init = function() {
  var $$jscomp$this$jscomp$420$$ = this;
  this.$D$ = this.$requests_$.map(function($$jscomp$this$jscomp$420$$) {
    $$jscomp$this$jscomp$420$$.$vars$ && _.$setStyles$$module$src$style$$($$jscomp$this$jscomp$420$$.target, _.$assertDoesNotContainDisplay$$module$src$style$$($$jscomp$this$jscomp$420$$.$vars$));
    $$jscomp$this$jscomp$420$$ = $$jscomp$this$jscomp$420$$.target.animate($$jscomp$this$jscomp$420$$.keyframes, $$jscomp$this$jscomp$420$$.timing);
    $$jscomp$this$jscomp$420$$.pause();
    return $$jscomp$this$jscomp$420$$;
  });
  this.$G$ = this.$D$.length;
  this.$D$.forEach(function($player$jscomp$4$$) {
    $player$jscomp$4$$.$onfinish$ = function() {
      $$jscomp$this$jscomp$420$$.$G$--;
      0 == $$jscomp$this$jscomp$420$$.$G$ && $$jscomp$this$jscomp$420$$.$setPlayState_$("finished");
    };
  });
};
_.$JSCompiler_prototypeAlias$$.start = function() {
  this.$D$ || this.init();
  this.resume();
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  this.$setPlayState_$("paused");
  this.$D$.forEach(function($player$jscomp$5$$) {
    "running" == $player$jscomp$5$$.playState && $player$jscomp$5$$.pause();
  });
};
_.$JSCompiler_prototypeAlias$$.resume = function() {
  var $$jscomp$this$jscomp$421$$ = this, $oldRunnerPlayState$$ = this.$F$;
  "running" != $oldRunnerPlayState$$ && (this.$setPlayState_$("running"), this.$G$ = 0, this.$D$.forEach(function($player$jscomp$6$$) {
    if ("paused" != $oldRunnerPlayState$$ || "paused" == $player$jscomp$6$$.playState) {
      $player$jscomp$6$$.play(), $$jscomp$this$jscomp$421$$.$G$++;
    }
  }));
};
_.$JSCompiler_prototypeAlias$$.reverse = function() {
  this.$D$.forEach(function($player$jscomp$7$$) {
    $player$jscomp$7$$.reverse();
  });
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function($time$jscomp$23$$) {
  this.$setPlayState_$("paused");
  this.$D$.forEach(function($player$jscomp$8$$) {
    $player$jscomp$8$$.pause();
    $player$jscomp$8$$.currentTime = $time$jscomp$23$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$seekToPercent$ = function($percent$jscomp$2$$) {
  for (var $maxTotalDuration$jscomp$inline_2736$$ = 0, $i$jscomp$inline_2737$$ = 0; $i$jscomp$inline_2737$$ < this.$requests_$.length; $i$jscomp$inline_2737$$++) {
    var $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$ = this.$requests_$[$i$jscomp$inline_2737$$].timing;
    $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$ = $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$.duration * ($timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$.iterations - $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$.iterationStart) + $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$.delay + $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$.endDelay;
    $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$ > $maxTotalDuration$jscomp$inline_2736$$ && ($maxTotalDuration$jscomp$inline_2736$$ = $timing$229$jscomp$inline_2738_totalDuration$jscomp$inline_2739$$);
  }
  this.$seekTo$($maxTotalDuration$jscomp$inline_2736$$ * $percent$jscomp$2$$);
};
_.$JSCompiler_prototypeAlias$$.finish = function() {
  if (this.$D$) {
    var $players$$ = this.$D$;
    this.$D$ = null;
    this.$setPlayState_$("finished");
    $players$$.forEach(function($players$$) {
      $players$$.finish();
    });
  }
};
_.$JSCompiler_prototypeAlias$$.cancel = function() {
  this.$D$ && (this.$setPlayState_$("idle"), this.$D$.forEach(function($player$jscomp$10$$) {
    $player$jscomp$10$$.cancel();
  }));
};
_.$JSCompiler_prototypeAlias$$.$setPlayState_$ = function($playState$$) {
  this.$F$ != $playState$$ && (this.$F$ = $playState$$, this.$I$.$fire$(this.$F$));
};
$Scanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$scan$ = function($spec$jscomp$21$$) {
  var $$jscomp$this$jscomp$422$$ = this;
  if (_.$isArray$$module$src$types$$($spec$jscomp$21$$)) {
    return $spec$jscomp$21$$.reduce(function($spec$jscomp$21$$, $comp$$) {
      return $$jscomp$this$jscomp$422$$.$scan$($comp$$) || $spec$jscomp$21$$;
    }, !1);
  }
  if (!this.$K$($spec$jscomp$21$$)) {
    return !1;
  }
  $spec$jscomp$21$$.animations ? $JSCompiler_StaticMethods_onMultiAnimation$$(this, $spec$jscomp$21$$) : $spec$jscomp$21$$.switch ? $JSCompiler_StaticMethods_onSwitchAnimation$$(this, $spec$jscomp$21$$) : $spec$jscomp$21$$.animation ? $JSCompiler_StaticMethods_onCompAnimation$$(this, $spec$jscomp$21$$) : $spec$jscomp$21$$.keyframes ? $JSCompiler_StaticMethods_onKeyframeAnimation$$(this, $spec$jscomp$21$$) : this.$P$();
  return !0;
};
$Scanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$K$ = function() {
  return !0;
};
$Scanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$P$ = function() {
  throw _.$dev$$module$src$log$$().$createError$('unknown animation type: must have "animations" or "keyframes" field');
};
$Builder$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$F$ = function($spec$jscomp$22$$, $hasPositionObserver$$, $opt_args$jscomp$5$$, $opt_viewportData$$) {
  var $$jscomp$this$jscomp$423$$ = this;
  $hasPositionObserver$$ = void 0 === $hasPositionObserver$$ ? !1 : $hasPositionObserver$$;
  $opt_viewportData$$ = void 0 === $opt_viewportData$$ ? null : $opt_viewportData$$;
  return this.$resolveRequests$([], $spec$jscomp$22$$, $opt_args$jscomp$5$$).then(function($spec$jscomp$22$$) {
    _.$getMode$$module$src$mode$$().$development$ && "amp-animation";
    return window.Promise.all($$jscomp$this$jscomp$423$$.$G$).then(function() {
      return $$jscomp$this$jscomp$423$$.$K$ && $hasPositionObserver$$ ? new $AnimationWorkletRunner$$module$extensions$amp_animation$0_1$web_animations$$($$jscomp$this$jscomp$423$$.$D$, $spec$jscomp$22$$, $opt_viewportData$$) : new $WebAnimationRunner$$module$extensions$amp_animation$0_1$web_animations$$($spec$jscomp$22$$);
    });
  });
};
$Builder$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$resolveRequests$ = function($path$jscomp$6$$, $spec$jscomp$23$$, $args$jscomp$26$$, $target$jscomp$121$$, $index$jscomp$94$$, $vars$jscomp$17$$, $timing$jscomp$1$$) {
  var $scanner$jscomp$1$$ = new $MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$(this, this.$I$, $path$jscomp$6$$, void 0 === $target$jscomp$121$$ ? null : $target$jscomp$121$$, void 0 === $index$jscomp$94$$ ? null : $index$jscomp$94$$, void 0 === $vars$jscomp$17$$ ? null : $vars$jscomp$17$$, void 0 === $timing$jscomp$1$$ ? null : $timing$jscomp$1$$);
  return _.$JSCompiler_StaticMethods_measurePromise$$(this.$vsync_$, function() {
    return $scanner$jscomp$1$$.$resolveRequests$($spec$jscomp$23$$, $args$jscomp$26$$);
  });
};
_.$$jscomp$inherits$$($MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$, $Scanner$$module$extensions$amp_animation$0_1$web_animations$$);
$MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$resolveRequests$ = function($spec$jscomp$24$$, $opt_args$jscomp$6$$) {
  var $$jscomp$this$jscomp$424$$ = this;
  $opt_args$jscomp$6$$ ? $JSCompiler_StaticMethods_with_$$(this, $opt_args$jscomp$6$$, function() {
    $$jscomp$this$jscomp$424$$.$scan$($spec$jscomp$24$$);
  }) : $JSCompiler_StaticMethods_withVars$$(this.$D$, this.$F$, function() {
    $$jscomp$this$jscomp$424$$.$scan$($spec$jscomp$24$$);
  });
  return window.Promise.all(this.$J$).then(function() {
    return $$jscomp$this$jscomp$424$$.$requests_$;
  });
};
$MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$K$ = function($spec$jscomp$25$$) {
  return $spec$jscomp$25$$.media && !this.$D$.matchMedia($spec$jscomp$25$$.media) || $spec$jscomp$25$$.supports && !this.$D$.supports($spec$jscomp$25$$.supports) ? !1 : !0;
};
$MeasureScanner$$module$extensions$amp_animation$0_1$web_animations$$.prototype.$P$ = function() {
  throw _.$user$$module$src$log$$().$createError$('unknown animation type: must have "animation", "animations" or "keyframes" field');
};
$CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$.prototype.matchMedia = function($mediaQuery$$) {
  return this.$D$.matchMedia($mediaQuery$$).matches;
};
$CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$.prototype.supports = function($query$jscomp$15$$) {
  return this.$D$.CSS && this.$D$.CSS.supports ? this.$D$.CSS.supports($query$jscomp$15$$) : !1;
};
$CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$.prototype.getElementById = function($id$jscomp$60$$) {
  return this.$K$.getElementById($id$jscomp$60$$);
};
$CssContextImpl$$module$extensions$amp_animation$0_1$web_animations$$.prototype.measure = function($target$jscomp$134$$, $prop$jscomp$9$$) {
  var $targetId$jscomp$2$$ = $target$jscomp$134$$.__AMP_ANIM_ID;
  $targetId$jscomp$2$$ || ($targetId$jscomp$2$$ = String(++$animIdCounter$$module$extensions$amp_animation$0_1$web_animations$$), $target$jscomp$134$$.__AMP_ANIM_ID = $targetId$jscomp$2$$);
  var $styles$jscomp$5$$ = this.$P$[$targetId$jscomp$2$$];
  $styles$jscomp$5$$ || ($styles$jscomp$5$$ = _.$computedStyle$$module$src$style$$(this.$D$, $target$jscomp$134$$), this.$P$[$targetId$jscomp$2$$] = $styles$jscomp$5$$);
  return _.$startsWith$$module$src$string$$($prop$jscomp$9$$, "--") ? $styles$jscomp$5$$.getPropertyValue($prop$jscomp$9$$) : $styles$jscomp$5$$[_.$getVendorJsPropertyName$$module$src$style$$($styles$jscomp$5$$, $prop$jscomp$9$$.replace(/-([a-z])/g, _.$toUpperCase$$module$src$string$$))];
};
$WebAnimationService$$module$extensions$amp_animation$0_1$web_animation_service$$.prototype.$createBuilder$ = function() {
  $installWebAnimationsIfNecessary$$module$extensions$amp_animation$0_1$web_animations_polyfill$$(this.$ampdoc_$.$win$);
  return new $Builder$$module$extensions$amp_animation$0_1$web_animations$$(this.$ampdoc_$.$win$, this.$ampdoc_$.getRootNode(), this.$ampdoc_$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$(), this.$vsync_$, this.$D$);
};
_.$$jscomp$inherits$$($AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$434$$ = this, $ampdoc$jscomp$137$$ = this.$getAmpDoc$(), $frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$ = this.element.getAttribute("trigger");
  $frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$ && (this.$triggerOnVisibility_$ = "visibility" == $frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$);
  $frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$ = _.$childElementByTag$$module$src$dom$$(this.element, "script");
  this.$configJson_$ = _.$tryParseJson$$module$src$json$$($frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$.textContent, function($$jscomp$this$jscomp$434$$) {
    throw _.$user$$module$src$log$$().$createError$("failed to parse animation script", $$jscomp$this$jscomp$434$$);
  });
  this.$triggerOnVisibility_$ && this.$mutateElement$(function() {
    _.$setStyles$$module$src$style$$($$jscomp$this$jscomp$434$$.element, {visibility:"hidden", top:"0px", left:"0px", width:"1px", height:"1px", position:"fixed"});
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$434$$.element, !0);
    _.$setInitialDisplay$$module$src$style$$($$jscomp$this$jscomp$434$$.element);
  });
  this.$restartPass_$ = new _.$Pass$$module$src$pass$$(this.$win$, function() {
    $$jscomp$this$jscomp$434$$.$pausedByAction_$ || $JSCompiler_StaticMethods_startOrResume_$$($$jscomp$this$jscomp$434$$);
  }, 50);
  var $embed$jscomp$5$$ = ($frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$ = _.$getParentWindowFrameElement$$module$src$service$$(this.element, $ampdoc$jscomp$137$$.$win$)) ? _.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$($frameElement$jscomp$6_scriptElement$jscomp$2_trigger$jscomp$9$$) : null;
  if ($embed$jscomp$5$$) {
    this.$embed_$ = $embed$jscomp$5$$, $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$(this, $embed$jscomp$5$$.$visible_$), $embed$jscomp$5$$.$FriendlyIframeEmbed$$module$src$friendly_iframe_embed_prototype$onVisibilityChanged$(function() {
      $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$($$jscomp$this$jscomp$434$$, $embed$jscomp$5$$.$visible_$);
    }), _.$listen$$module$src$event_helper$$(this.$embed_$.$win$, "resize", function() {
      return $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$$($$jscomp$this$jscomp$434$$);
    });
  } else {
    var $viewer$jscomp$35$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$137$$);
    $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$(this, _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($viewer$jscomp$35$$));
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($viewer$jscomp$35$$, function() {
      $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$($$jscomp$this$jscomp$434$$, _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($viewer$jscomp$35$$));
    });
    _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onResize$$(this.$getViewport$(), function($ampdoc$jscomp$137$$) {
      $ampdoc$jscomp$137$$.$relayoutAll$ && $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$onResize_$$($$jscomp$this$jscomp$434$$);
    });
  }
  _.$JSCompiler_StaticMethods_registerDefaultAction$$(this, this.$startAction_$.bind(this), "start", 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "restart", this.$restartAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "pause", this.$pauseAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "resume", this.$resumeAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "togglePause", this.$togglePauseAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "seekTo", this.$seekToAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "reverse", this.$reverseAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "finish", this.$finishAction_$.bind(this), 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "cancel", this.$cancelAction_$.bind(this), 1);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  this.$triggerOnVisibility_$ && this.$startAction_$();
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$setVisible_$$(this, !1);
};
_.$JSCompiler_prototypeAlias$$.$startAction_$ = function($opt_invocation$$) {
  this.$triggered_$ = !0;
  return this.$visible_$ ? $JSCompiler_StaticMethods_startOrResume_$$(this, $opt_invocation$$ ? $opt_invocation$$.args : null) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$restartAction_$ = function($invocation$jscomp$24$$) {
  $JSCompiler_StaticMethods_cancel_$$(this);
  this.$triggered_$ = !0;
  return this.$visible_$ ? $JSCompiler_StaticMethods_startOrResume_$$(this, $invocation$jscomp$24$$.args) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$pauseAction_$ = function() {
  var $$jscomp$this$jscomp$435$$ = this;
  return this.$triggered_$ ? $JSCompiler_StaticMethods_createRunnerIfNeeded_$$(this).then(function() {
    $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$$($$jscomp$this$jscomp$435$$);
    $$jscomp$this$jscomp$435$$.$pausedByAction_$ = !0;
  }) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$resumeAction_$ = function() {
  var $$jscomp$this$jscomp$436$$ = this;
  return this.$triggered_$ ? $JSCompiler_StaticMethods_createRunnerIfNeeded_$$(this).then(function() {
    $$jscomp$this$jscomp$436$$.$visible_$ && ($$jscomp$this$jscomp$436$$.$runner_$.resume(), $$jscomp$this$jscomp$436$$.$pausedByAction_$ = !1);
  }) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$togglePauseAction_$ = function() {
  var $$jscomp$this$jscomp$437$$ = this;
  return this.$triggered_$ ? $JSCompiler_StaticMethods_createRunnerIfNeeded_$$(this).then(function() {
    if ($$jscomp$this$jscomp$437$$.$visible_$) {
      if ("paused" == $$jscomp$this$jscomp$437$$.$runner_$.$getPlayState$()) {
        return $JSCompiler_StaticMethods_startOrResume_$$($$jscomp$this$jscomp$437$$);
      }
      $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$$($$jscomp$this$jscomp$437$$);
      $$jscomp$this$jscomp$437$$.$pausedByAction_$ = !0;
    }
  }) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$seekToAction_$ = function($invocation$jscomp$25$$) {
  var $$jscomp$this$jscomp$438$$ = this;
  this.$triggered_$ = !0;
  this.$hasPositionObserver_$ = !!$invocation$jscomp$25$$.caller && "AMP-POSITION-OBSERVER" === $invocation$jscomp$25$$.caller.tagName;
  return $JSCompiler_StaticMethods_createRunnerIfNeeded_$$(this, null, $invocation$jscomp$25$$ && $invocation$jscomp$25$$.event ? $invocation$jscomp$25$$.event.$D$ : null).then(function() {
    $JSCompiler_StaticMethods_AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation_prototype$pause_$$($$jscomp$this$jscomp$438$$);
    $$jscomp$this$jscomp$438$$.$pausedByAction_$ = !0;
    var $percent$jscomp$3_time$jscomp$25$$ = (0,window.parseFloat)($invocation$jscomp$25$$.args && $invocation$jscomp$25$$.args.time);
    _.$isFiniteNumber$$module$src$types$$($percent$jscomp$3_time$jscomp$25$$) && $$jscomp$this$jscomp$438$$.$runner_$.$seekTo$($percent$jscomp$3_time$jscomp$25$$);
    $percent$jscomp$3_time$jscomp$25$$ = (0,window.parseFloat)($invocation$jscomp$25$$.args && $invocation$jscomp$25$$.args.percent);
    _.$isFiniteNumber$$module$src$types$$($percent$jscomp$3_time$jscomp$25$$) && $$jscomp$this$jscomp$438$$.$runner_$.$seekToPercent$(_.$clamp$$module$src$utils$math$$($percent$jscomp$3_time$jscomp$25$$, 0, 1));
  });
};
_.$JSCompiler_prototypeAlias$$.$reverseAction_$ = function() {
  var $$jscomp$this$jscomp$439$$ = this;
  return this.$triggered_$ ? $JSCompiler_StaticMethods_createRunnerIfNeeded_$$(this).then(function() {
    $$jscomp$this$jscomp$439$$.$visible_$ && $$jscomp$this$jscomp$439$$.$runner_$.reverse();
  }) : window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$finishAction_$ = function() {
  $JSCompiler_StaticMethods_finish_$$(this);
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$cancelAction_$ = function() {
  $JSCompiler_StaticMethods_cancel_$$(this);
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$playStateChanged_$ = function($playState$jscomp$1$$) {
  "finished" == $playState$jscomp$1$$ && $JSCompiler_StaticMethods_finish_$$(this);
};
var $AMP$jscomp$inline_2767$$ = window.self.AMP;
$AMP$jscomp$inline_2767$$.registerElement("amp-animation", $AmpAnimation$$module$extensions$amp_animation$0_1$amp_animation$$);
$AMP$jscomp$inline_2767$$.registerServiceForDoc("web-animation", $WebAnimationService$$module$extensions$amp_animation$0_1$web_animation_service$$);

})});
