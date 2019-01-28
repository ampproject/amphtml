(self.AMP=self.AMP||[]).push({n:"amp-lightbox-gallery",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $SwipeYRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$10$$) {
  _.$SwipeRecognizer$$module$src$gesture_recognizers$$.call(this, "swipe-y", $manager$jscomp$10$$, !1, !0);
}, $q$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$239$$, $b$jscomp$211$$, $d$jscomp$113$$) {
  $a$jscomp$239$$ = $a$jscomp$239$$.width / $a$jscomp$239$$.height;
  return $a$jscomp$239$$ > $b$jscomp$211$$.width / $b$jscomp$211$$.height !== $d$jscomp$113$$ ? {width:$b$jscomp$211$$.height * $a$jscomp$239$$, height:$b$jscomp$211$$.height} : {width:$b$jscomp$211$$.width, height:$b$jscomp$211$$.width / $a$jscomp$239$$};
}, $r$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$240$$, $b$jscomp$212$$, $d$jscomp$114$$) {
  $d$jscomp$114$$ = void 0 === $d$jscomp$114$$ ? (0,window.getComputedStyle)($a$jscomp$240$$).getPropertyValue("object-fit") : $d$jscomp$114$$;
  $a$jscomp$240$$ = {width:$a$jscomp$240$$.naturalWidth, height:$a$jscomp$240$$.naturalHeight};
  switch($d$jscomp$114$$) {
    case "cover":
      return $q$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$240$$, $b$jscomp$212$$, !1);
    case "contain":
      return $q$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$240$$, $b$jscomp$212$$, !0);
    case "fill":
      return $b$jscomp$212$$;
    case "none":
      return $a$jscomp$240$$;
    case "scale-down":
      return $b$jscomp$212$$ = $q$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$240$$, $b$jscomp$212$$, !0), {width:Math.min($a$jscomp$240$$.width, $b$jscomp$212$$.width), height:Math.min($a$jscomp$240$$.height, $b$jscomp$212$$.height)};
    case "":
    case null:
      return $b$jscomp$212$$;
    default:
      throw Error("object-fit: " + $d$jscomp$114$$ + " not supported");
  }
}, $t$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$241$$, $b$jscomp$213$$) {
  $a$jscomp$241$$ = ($a$jscomp$241$$.match(new RegExp("-?\\s*\\d+" + $b$jscomp$213$$)) || ["0"])[0].replace(" ", "");
  return Number.parseFloat($a$jscomp$241$$);
}, $u$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$242$$, $b$jscomp$214$$, $d$jscomp$115$$) {
  var $c$jscomp$156$$ = $a$jscomp$242$$ || "50% 50%", $e$jscomp$258$$ = 0 === $c$jscomp$156$$.lastIndexOf("calc", 0) ? $c$jscomp$156$$.indexOf(")") + 1 : $c$jscomp$156$$.indexOf(" ");
  $a$jscomp$242$$ = $c$jscomp$156$$.slice(0, $e$jscomp$258$$) || "";
  $c$jscomp$156$$ = $c$jscomp$156$$.slice($e$jscomp$258$$) || "";
  $e$jscomp$258$$ = $t$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$242$$, "px");
  var $f$jscomp$73$$ = $t$$module$$ampproject$animations$dist$animations_mjs$$($c$jscomp$156$$, "px");
  $a$jscomp$242$$ = $t$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$242$$, "%") / 100;
  return {top:$t$$module$$ampproject$animations$dist$animations_mjs$$($c$jscomp$156$$, "%") / 100 * ($b$jscomp$214$$.height - $d$jscomp$115$$.height) + $f$jscomp$73$$, left:$a$jscomp$242$$ * ($b$jscomp$214$$.width - $d$jscomp$115$$.width) + $e$jscomp$258$$};
}, $w$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$243$$, $b$jscomp$215$$, $d$jscomp$116$$, $c$jscomp$157$$) {
  $b$jscomp$215$$ = void 0 === $b$jscomp$215$$ ? $a$jscomp$243$$.getBoundingClientRect() : $b$jscomp$215$$;
  $d$jscomp$116$$ = void 0 === $d$jscomp$116$$ ? (0,window.getComputedStyle)($a$jscomp$243$$).getPropertyValue("object-position") : $d$jscomp$116$$;
  $c$jscomp$157$$ = void 0 === $c$jscomp$157$$ ? $r$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$243$$, $b$jscomp$215$$) : $c$jscomp$157$$;
  $d$jscomp$116$$ = $u$$module$$ampproject$animations$dist$animations_mjs$$($d$jscomp$116$$, $b$jscomp$215$$, $c$jscomp$157$$);
  var $e$jscomp$259$$ = window.document.createElement("div"), $f$jscomp$74$$ = window.document.createElement("div"), $g$jscomp$51$$ = window.document.createElement("div"), $h$jscomp$49$$ = window.document.createElement("div");
  $a$jscomp$243$$ = $a$jscomp$243$$.cloneNode(!0);
  $a$jscomp$243$$.className = "";
  $a$jscomp$243$$.style.cssText = "";
  $h$jscomp$49$$.appendChild($a$jscomp$243$$);
  $g$jscomp$51$$.appendChild($h$jscomp$49$$);
  $f$jscomp$74$$.appendChild($g$jscomp$51$$);
  $e$jscomp$259$$.appendChild($f$jscomp$74$$);
  Object.assign($f$jscomp$74$$.style, {overflow:"hidden", width:$b$jscomp$215$$.width + "px", height:$b$jscomp$215$$.height + "px"});
  Object.assign($h$jscomp$49$$.style, {transform:"translate(" + $d$jscomp$116$$.left + "px, " + $d$jscomp$116$$.top + "px)"});
  Object.assign($a$jscomp$243$$.style, {display:"block", width:$c$jscomp$157$$.width + "px", height:$c$jscomp$157$$.height + "px"});
  return {$B$:$e$jscomp$259$$, $m$:$f$jscomp$74$$, $h$:$g$jscomp$51$$, u:$h$jscomp$49$$, i:$a$jscomp$243$$};
}, $x$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$244$$) {
  if ("static" != (0,window.getComputedStyle)($a$jscomp$244$$).position) {
    return $a$jscomp$244$$;
  }
  var $b$jscomp$216$$ = $a$jscomp$244$$.offsetParent || $a$jscomp$244$$.parentElement;
  return $b$jscomp$216$$ ? $x$$module$$ampproject$animations$dist$animations_mjs$$($b$jscomp$216$$) : $a$jscomp$244$$;
}, $y$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$245$$) {
  return "cubic-bezier(" + $a$jscomp$245$$.$x1$ + ", " + $a$jscomp$245$$.$y1$ + ", " + $a$jscomp$245$$.$x2$ + ", " + $a$jscomp$245$$.$y2$ + ")";
}, $z$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$246$$, $b$jscomp$217$$, $d$jscomp$117$$) {
  var $c$jscomp$158$$ = $d$jscomp$117$$ * $d$jscomp$117$$, $e$jscomp$260$$ = $c$jscomp$158$$ * $d$jscomp$117$$;
  return 3 * ($d$jscomp$117$$ - 2 * $c$jscomp$158$$ + $e$jscomp$260$$) * $a$jscomp$246$$ + 3 * ($c$jscomp$158$$ - $e$jscomp$260$$) * $b$jscomp$217$$ + $e$jscomp$260$$;
}, $A$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$247$$, $b$jscomp$218$$) {
  return {x:$a$jscomp$247$$.width / $b$jscomp$218$$.width, y:$a$jscomp$247$$.height / $b$jscomp$218$$.height};
}, $B$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$248$$) {
  var $b$jscomp$219$$ = $a$jscomp$248$$.$h$, $d$jscomp$118$$ = $a$jscomp$248$$.curve, $c$jscomp$159$$ = $a$jscomp$248$$.$styles$, $e$jscomp$261$$ = $a$jscomp$248$$.a, $f$jscomp$75$$ = $a$jscomp$248$$.b, $g$jscomp$52$$ = $e$jscomp$261$$ + "-crop";
  $e$jscomp$261$$ += "-counterScale";
  var $h$jscomp$50$$ = $A$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$248$$.g, $a$jscomp$248$$.f), $k$jscomp$64$$ = {x:1, y:1}, $l$jscomp$28$$ = $f$jscomp$75$$ ? $h$jscomp$50$$ : $k$jscomp$64$$;
  $f$jscomp$75$$ = $f$jscomp$75$$ ? $k$jscomp$64$$ : $h$jscomp$50$$;
  Object.assign($a$jscomp$248$$.$m$.style, $c$jscomp$159$$, {willChange:"transform", transformOrigin:"top left", animationName:$g$jscomp$52$$, $animationTimingFunction$:"linear", $animationFillMode$:"forwards"});
  Object.assign($b$jscomp$219$$.style, $c$jscomp$159$$, {willChange:"transform", transformOrigin:"top left", animationName:$e$jscomp$261$$, $animationTimingFunction$:"linear", $animationFillMode$:"forwards"});
  $b$jscomp$219$$ = $a$jscomp$248$$ = "";
  for ($c$jscomp$159$$ = 0; 20 >= $c$jscomp$159$$; $c$jscomp$159$$++) {
    $h$jscomp$50$$ = .05 * $c$jscomp$159$$;
    var $m$jscomp$22$$ = $z$$module$$ampproject$animations$dist$animations_mjs$$($d$jscomp$118$$.$y1$, $d$jscomp$118$$.$y2$, $h$jscomp$50$$);
    $h$jscomp$50$$ = 100 * $z$$module$$ampproject$animations$dist$animations_mjs$$($d$jscomp$118$$.$x1$, $d$jscomp$118$$.$x2$, $h$jscomp$50$$);
    $k$jscomp$64$$ = $l$jscomp$28$$.x;
    $k$jscomp$64$$ += $m$jscomp$22$$ * ($f$jscomp$75$$.x - $k$jscomp$64$$);
    var $n$jscomp$41$$ = $l$jscomp$28$$.y;
    $m$jscomp$22$$ = $n$jscomp$41$$ + $m$jscomp$22$$ * ($f$jscomp$75$$.y - $n$jscomp$41$$);
    $n$jscomp$41$$ = 1 / $k$jscomp$64$$;
    var $p$jscomp$34$$ = 1 / $m$jscomp$22$$;
    $a$jscomp$248$$ += $h$jscomp$50$$ + "% {\n      transform: scale(" + $k$jscomp$64$$ + ", " + $m$jscomp$22$$ + ");\n    }";
    $b$jscomp$219$$ += $h$jscomp$50$$ + "% {\n      transform: scale(" + $n$jscomp$41$$ + ", " + $p$jscomp$34$$ + ");\n    }";
  }
  return "\n    @keyframes " + $g$jscomp$52$$ + " {\n      " + $a$jscomp$248$$ + "\n    }\n\n    @keyframes " + $e$jscomp$261$$ + " {\n      " + $b$jscomp$219$$ + "\n    }\n  ";
}, $C$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$249$$) {
  var $b$jscomp$220$$ = $a$jscomp$249$$.b, $d$jscomp$119$$ = $a$jscomp$249$$.a + "-scale", $c$jscomp$160$$ = {x:1, y:1}, $e$jscomp$262$$ = $A$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$249$$.$o$, $a$jscomp$249$$.$j$), $f$jscomp$76$$ = $b$jscomp$220$$ ? $e$jscomp$262$$ : $c$jscomp$160$$;
  $b$jscomp$220$$ = $b$jscomp$220$$ ? $c$jscomp$160$$ : $e$jscomp$262$$;
  Object.assign($a$jscomp$249$$.element.style, $a$jscomp$249$$.$styles$, {willChange:"transform", transformOrigin:"top left", animationName:$d$jscomp$119$$, $animationTimingFunction$:$y$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$249$$.curve), $animationFillMode$:"forwards"});
  return "\n    @keyframes " + $d$jscomp$119$$ + " {\n      from {\n        transform: scale(" + $f$jscomp$76$$.x + ", " + $f$jscomp$76$$.y + ");\n      }\n\n      to {\n        transform: scale(" + $b$jscomp$220$$.x + ", " + $b$jscomp$220$$.y + ");\n      }\n    }\n  ";
}, $D$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$250$$) {
  var $b$jscomp$221$$ = $a$jscomp$250$$.element, $d$jscomp$120$$ = $a$jscomp$250$$.g, $c$jscomp$161$$ = $a$jscomp$250$$.$o$, $e$jscomp$263$$ = $a$jscomp$250$$.$A$, $f$jscomp$77$$ = $a$jscomp$250$$.$styles$, $g$jscomp$53$$ = $a$jscomp$250$$.b, $h$jscomp$51$$ = $y$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$250$$.curve), $k$jscomp$65$$ = $a$jscomp$250$$.a + "-object-position";
  $a$jscomp$250$$ = $u$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$250$$.v, $a$jscomp$250$$.f, $a$jscomp$250$$.$j$);
  $c$jscomp$161$$ = $u$$module$$ampproject$animations$dist$animations_mjs$$($e$jscomp$263$$, $d$jscomp$120$$, $c$jscomp$161$$);
  $d$jscomp$120$$ = $g$jscomp$53$$ ? $c$jscomp$161$$ : $a$jscomp$250$$;
  $g$jscomp$53$$ = $g$jscomp$53$$ ? $a$jscomp$250$$ : $c$jscomp$161$$;
  Object.assign($b$jscomp$221$$.style, $f$jscomp$77$$, {willChange:"transform", animationName:$k$jscomp$65$$, $animationTimingFunction$:$h$jscomp$51$$, $animationFillMode$:"forwards"});
  return "\n    @keyframes " + $k$jscomp$65$$ + " {\n      from {\n        transform: translate(" + $d$jscomp$120$$.left + "px, " + $d$jscomp$120$$.top + "px);\n      }\n\n      to {\n        transform: translate(" + $g$jscomp$53$$.left + "px, " + $g$jscomp$53$$.top + "px);\n      }\n    }\n  ";
}, $E$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$251$$) {
  var $b$jscomp$222$$ = $a$jscomp$251$$.$w$, $d$jscomp$121$$ = $a$jscomp$251$$.f, $c$jscomp$162$$ = $a$jscomp$251$$.g, $e$jscomp$264$$ = $a$jscomp$251$$.b, $f$jscomp$78$$ = $a$jscomp$251$$.a + "-translation", $g$jscomp$54$$ = $e$jscomp$264$$ ? $c$jscomp$162$$ : $d$jscomp$121$$;
  $d$jscomp$121$$ = $e$jscomp$264$$ ? $d$jscomp$121$$ : $c$jscomp$162$$;
  $c$jscomp$162$$ = $g$jscomp$54$$.left - $d$jscomp$121$$.left;
  $g$jscomp$54$$ = $g$jscomp$54$$.top - $d$jscomp$121$$.top;
  Object.assign($a$jscomp$251$$.element.style, $a$jscomp$251$$.$styles$, {position:"absolute", top:$d$jscomp$121$$.top - $b$jscomp$222$$.top + "px", left:$d$jscomp$121$$.left - $b$jscomp$222$$.left + "px", willChange:"transform", animationName:$f$jscomp$78$$, $animationTimingFunction$:$y$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$251$$.curve), $animationFillMode$:"forwards"});
  return "\n    @keyframes " + $f$jscomp$78$$ + " {\n      from {\n        transform: translate(" + $c$jscomp$162$$ + "px, " + $g$jscomp$54$$ + "px);\n      }\n\n      to {\n        transform: translate(0, 0);\n      }\n    }\n  ";
}, $H$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$252$$) {
  $G$$module$$ampproject$animations$dist$animations_mjs$$ += 1;
  return $a$jscomp$252$$ + "-" + $G$$module$$ampproject$animations$dist$animations_mjs$$ + "-";
}, $I$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$253$$, $b$jscomp$223$$) {
  var $d$jscomp$122$$ = (0,window.getComputedStyle)($a$jscomp$253$$), $c$jscomp$163$$ = $d$jscomp$122$$.getPropertyValue("object-fit");
  $d$jscomp$122$$ = $d$jscomp$122$$.getPropertyValue("object-position");
  return {$C$:$c$jscomp$163$$, $l$:$d$jscomp$122$$, rect:$b$jscomp$223$$, i:$a$jscomp$253$$, $c$:$r$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$253$$, $b$jscomp$223$$, $c$jscomp$163$$), s:$b$jscomp$223$$.width * $b$jscomp$223$$.height};
}, $prepareImageAnimation$$module$$ampproject$animations$dist$animations_mjs$$ = function($a$jscomp$254$$) {
  var $b$jscomp$224$$ = void 0 === $a$jscomp$254$$.$transitionContainer$ ? window.document.body : $a$jscomp$254$$.$transitionContainer$, $d$jscomp$123$$ = void 0 === $a$jscomp$254$$.$styleContainer$ ? window.document.head : $a$jscomp$254$$.$styleContainer$, $c$jscomp$164$$ = $a$jscomp$254$$.$srcImg$, $e$jscomp$265$$ = $a$jscomp$254$$.$targetImg$, $f$jscomp$79$$ = void 0 === $a$jscomp$254$$.$srcImgRect$ ? $c$jscomp$164$$.getBoundingClientRect() : $a$jscomp$254$$.$srcImgRect$, $g$jscomp$55$$ = void 0 === 
  $a$jscomp$254$$.$targetImgRect$ ? $e$jscomp$265$$.getBoundingClientRect() : $a$jscomp$254$$.$targetImgRect$, $h$jscomp$52$$ = void 0 === $a$jscomp$254$$.curve ? $F$$module$$ampproject$animations$dist$animations_mjs$$ : $a$jscomp$254$$.curve, $k$jscomp$66$$ = $a$jscomp$254$$.$styles$;
  $a$jscomp$254$$ = void 0 === $a$jscomp$254$$.$keyframesNamespace$ ? "img-transform" : $a$jscomp$254$$.$keyframesNamespace$;
  $c$jscomp$164$$ = $I$$module$$ampproject$animations$dist$animations_mjs$$($c$jscomp$164$$, $f$jscomp$79$$);
  $f$jscomp$79$$ = $I$$module$$ampproject$animations$dist$animations_mjs$$($e$jscomp$265$$, $g$jscomp$55$$);
  $g$jscomp$55$$ = ($e$jscomp$265$$ = $f$jscomp$79$$.s > $c$jscomp$164$$.s) ? $c$jscomp$164$$ : $f$jscomp$79$$;
  $c$jscomp$164$$ = $e$jscomp$265$$ ? $f$jscomp$79$$ : $c$jscomp$164$$;
  $a$jscomp$254$$ = $H$$module$$ampproject$animations$dist$animations_mjs$$($a$jscomp$254$$);
  var $l$jscomp$29$$ = $w$$module$$ampproject$animations$dist$animations_mjs$$($c$jscomp$164$$.i, $c$jscomp$164$$.rect, $c$jscomp$164$$.$l$, $c$jscomp$164$$.$c$), $m$jscomp$23$$ = $l$jscomp$29$$.$B$, $n$jscomp$42$$ = $l$jscomp$29$$.$m$, $p$jscomp$35$$ = $l$jscomp$29$$.$h$;
  $f$jscomp$79$$ = $l$jscomp$29$$.u;
  $l$jscomp$29$$ = $l$jscomp$29$$.i;
  var $J$jscomp$2$$ = $x$$module$$ampproject$animations$dist$animations_mjs$$($b$jscomp$224$$).getBoundingClientRect();
  $n$jscomp$42$$ = $B$$module$$ampproject$animations$dist$animations_mjs$$({$m$:$n$jscomp$42$$, $h$:$p$jscomp$35$$, f:$c$jscomp$164$$.rect, g:$g$jscomp$55$$.rect, curve:$h$jscomp$52$$, $styles$:$k$jscomp$66$$, a:$a$jscomp$254$$, b:$e$jscomp$265$$});
  $p$jscomp$35$$ = $E$$module$$ampproject$animations$dist$animations_mjs$$({element:$m$jscomp$23$$, $w$:$J$jscomp$2$$, f:$c$jscomp$164$$.rect, g:$g$jscomp$55$$.rect, curve:$h$jscomp$52$$, $styles$:$k$jscomp$66$$, a:$a$jscomp$254$$, b:$e$jscomp$265$$});
  $f$jscomp$79$$ = $D$$module$$ampproject$animations$dist$animations_mjs$$({element:$f$jscomp$79$$, f:$c$jscomp$164$$.rect, g:$g$jscomp$55$$.rect, $j$:$c$jscomp$164$$.$c$, $o$:$g$jscomp$55$$.$c$, v:$c$jscomp$164$$.$l$, $A$:$g$jscomp$55$$.$l$, curve:$h$jscomp$52$$, $styles$:$k$jscomp$66$$, a:$a$jscomp$254$$, b:$e$jscomp$265$$});
  $h$jscomp$52$$ = $C$$module$$ampproject$animations$dist$animations_mjs$$({element:$l$jscomp$29$$, $j$:$c$jscomp$164$$.$c$, $o$:$g$jscomp$55$$.$c$, curve:$h$jscomp$52$$, $styles$:$k$jscomp$66$$, a:$a$jscomp$254$$, b:$e$jscomp$265$$});
  var $v$jscomp$19$$ = window.document.createElement("style");
  $v$jscomp$19$$.textContent = $n$jscomp$42$$ + $f$jscomp$79$$ + $p$jscomp$35$$ + $h$jscomp$52$$;
  return {$applyAnimation$:function() {
    $d$jscomp$123$$.appendChild($v$jscomp$19$$);
    $b$jscomp$224$$.appendChild($m$jscomp$23$$);
  }, $cleanupAnimation$:function() {
    $b$jscomp$224$$.removeChild($m$jscomp$23$$);
    $d$jscomp$123$$.removeChild($v$jscomp$19$$);
  }};
}, $LightboxManager$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$ = function($ampdoc$jscomp$183$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$183$$;
  this.$F$ = null;
  this.$D$ = _.$map$$module$src$utils$object$$({default:[]});
  this.$G$ = 0;
  this.$seen_$ = [];
}, $JSCompiler_StaticMethods_maybeInit$$ = function($JSCompiler_StaticMethods_maybeInit$self$$) {
  if ($JSCompiler_StaticMethods_maybeInit$self$$.$F$) {
    return $JSCompiler_StaticMethods_maybeInit$self$$.$F$;
  }
  $JSCompiler_StaticMethods_maybeInit$self$$.$F$ = $JSCompiler_StaticMethods_scanLightboxables_$$($JSCompiler_StaticMethods_maybeInit$self$$);
  $JSCompiler_StaticMethods_maybeInit$self$$.$ampdoc_$.getRootNode().addEventListener("amp:dom-update", function() {
    $JSCompiler_StaticMethods_maybeInit$self$$.$F$ = $JSCompiler_StaticMethods_scanLightboxables_$$($JSCompiler_StaticMethods_maybeInit$self$$);
  });
  return $JSCompiler_StaticMethods_maybeInit$self$$.$F$;
}, $JSCompiler_StaticMethods_scanLightboxables_$$ = function($JSCompiler_StaticMethods_scanLightboxables_$self$$) {
  return $JSCompiler_StaticMethods_scanLightboxables_$self$$.$ampdoc_$.$whenReady$().then(function() {
    var $matches$jscomp$17$$ = $JSCompiler_StaticMethods_scanLightboxables_$self$$.$ampdoc_$.getRootNode().querySelectorAll("[lightbox]"), $processLightboxElement$$ = $JSCompiler_StaticMethods_scanLightboxables_$self$$.$I$.bind($JSCompiler_StaticMethods_scanLightboxables_$self$$);
    _.$iterateCursor$$module$src$dom$$($matches$jscomp$17$$, $processLightboxElement$$);
  });
}, $JSCompiler_StaticMethods_processLightboxCarousel_$$ = function($JSCompiler_StaticMethods_processLightboxCarousel_$self$$, $carousel$$) {
  var $lightboxGroupId$$ = $carousel$$.getAttribute("lightbox") || "carousel" + ($carousel$$.getAttribute("id") || $JSCompiler_StaticMethods_processLightboxCarousel_$self$$.$G$++);
  $JSCompiler_StaticMethods_getSlidesFromCarousel_$$($carousel$$).then(function($carousel$$) {
    $carousel$$.forEach(function($carousel$$) {
      $carousel$$.hasAttribute("lightbox-exclude") || $carousel$$.hasAttribute("lightbox") && $carousel$$.getAttribute("lightbox") !== $lightboxGroupId$$ || $JSCompiler_StaticMethods_processLightboxCarousel_$self$$.$seen_$.includes($carousel$$) || ($carousel$$.setAttribute("lightbox", $lightboxGroupId$$), $JSCompiler_StaticMethods_processLightboxCarousel_$self$$.$seen_$.push($carousel$$), $JSCompiler_StaticMethods_processBaseLightboxElement_$$($JSCompiler_StaticMethods_processLightboxCarousel_$self$$, 
      $carousel$$, $lightboxGroupId$$));
    });
  });
}, $JSCompiler_StaticMethods_unwrapLightboxedFigure_$$ = function($element$jscomp$466_figure$jscomp$1$$, $lightboxGroupId$jscomp$2$$) {
  ($element$jscomp$466_figure$jscomp$1$$ = _.$childElement$$module$src$dom$$($element$jscomp$466_figure$jscomp$1$$, function($element$jscomp$466_figure$jscomp$1$$) {
    return "FIGCAPTION" !== $element$jscomp$466_figure$jscomp$1$$.tagName;
  })) && $element$jscomp$466_figure$jscomp$1$$.setAttribute("lightbox", $lightboxGroupId$jscomp$2$$);
  return $element$jscomp$466_figure$jscomp$1$$;
}, $JSCompiler_StaticMethods_processBaseLightboxElement_$$ = function($JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$, $element$jscomp$467_unwrappedFigureElement$$, $lightboxGroupId$jscomp$3$$) {
  if ("FIGURE" == $element$jscomp$467_unwrappedFigureElement$$.tagName && ($element$jscomp$467_unwrappedFigureElement$$ = $JSCompiler_StaticMethods_unwrapLightboxedFigure_$$($element$jscomp$467_unwrappedFigureElement$$, $lightboxGroupId$jscomp$3$$), !$element$jscomp$467_unwrappedFigureElement$$)) {
    return;
  }
  $JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$.$D$[$lightboxGroupId$jscomp$3$$] || ($JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$.$D$[$lightboxGroupId$jscomp$3$$] = []);
  $JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$.$D$[$lightboxGroupId$jscomp$3$$].push($element$jscomp$467_unwrappedFigureElement$$);
  $ELIGIBLE_TAP_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$element$jscomp$467_unwrappedFigureElement$$.tagName] && !$element$jscomp$467_unwrappedFigureElement$$.hasAttribute("on") && ($JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$ = _.$elementByTag$$module$src$dom$$($JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$.$ampdoc_$.getRootNode(), "amp-lightbox-gallery"), $element$jscomp$467_unwrappedFigureElement$$.setAttribute("on", 
  "tap:" + $JSCompiler_StaticMethods_processBaseLightboxElement_$self_gallery$$.id + ".activate"));
}, $JSCompiler_StaticMethods_getSlidesFromCarousel_$$ = function($element$jscomp$468$$) {
  return $element$jscomp$468$$.signals().whenSignal("load-end").then(function() {
    return _.$toArray$$module$src$types$$($element$jscomp$468$$.querySelectorAll(".amp-carousel-slide"));
  });
}, $JSCompiler_StaticMethods_getElementsForLightboxGroup$$ = function($JSCompiler_StaticMethods_getElementsForLightboxGroup$self$$, $lightboxGroupId$jscomp$4$$) {
  return $JSCompiler_StaticMethods_maybeInit$$($JSCompiler_StaticMethods_getElementsForLightboxGroup$self$$).then(function() {
    return $JSCompiler_StaticMethods_getElementsForLightboxGroup$self$$.$D$[$lightboxGroupId$jscomp$4$$];
  });
}, $JSCompiler_StaticMethods_getVideoTimestamp_$$ = function($element$jscomp$470$$) {
  return $VIDEO_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$element$jscomp$470$$.tagName] ? $element$jscomp$470$$.$getImpl$().then(function($element$jscomp$470$$) {
    return $element$jscomp$470$$.$getDuration$();
  }) : window.Promise.resolve();
}, $JSCompiler_StaticMethods_getThumbnails$$ = function($JSCompiler_StaticMethods_getThumbnails$self$$, $lightboxGroupId$jscomp$5$$) {
  return $JSCompiler_StaticMethods_getThumbnails$self$$.$D$[$lightboxGroupId$jscomp$5$$].map(function($lightboxGroupId$jscomp$5$$) {
    a: {
      if ($lightboxGroupId$jscomp$5$$.hasAttribute("lightbox-thumbnail-id")) {
        var $element$jscomp$471$$ = $lightboxGroupId$jscomp$5$$.getAttribute("lightbox-thumbnail-id");
        if (($element$jscomp$471$$ = $JSCompiler_StaticMethods_getThumbnails$self$$.$ampdoc_$.getElementById($element$jscomp$471$$)) && "AMP-IMG" == $element$jscomp$471$$.tagName) {
          $element$jscomp$471$$ = _.$srcsetFromElement$$module$src$srcset$$($element$jscomp$471$$);
          break a;
        }
      }
      $element$jscomp$471$$ = $JSCompiler_StaticMethods_getUserPlaceholderSrcset_$$($JSCompiler_StaticMethods_getThumbnails$self$$, $lightboxGroupId$jscomp$5$$);
    }
    a: {
      switch($lightboxGroupId$jscomp$5$$.tagName) {
        case "AMP-AD":
          var $JSCompiler_inline_result$jscomp$787$$ = 'data:image/svg+xml;charset=utf-8,<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#1E3B63" d="M0 0h128v128H0z"/><rect fill="#2B6AC0" x="34" y="74" width="8" height="30" rx="2"/><rect fill="#2B6AC0" x="87" y="74" width="8" height="30" rx="2"/><rect fill="#ACC8F0" x="24" y="30" width="81" height="54" rx="4"/><path fill="#D1E5FF" d="M29 35h71v44H29z"/><path d="M64 53.5V66a3 3 0 0 1-6 0v-4h-5v4a3 3 0 0 1-6 0V53.5a8.5 8.5 0 0 1 17 0zm-6 0a2.5 2.5 0 0 0-5 0V56h5v-2.5zM71 45h3v.041C80.16 45.55 85 50.71 85 57s-4.84 11.45-11 11.959V69h-3a3 3 0 0 1-3-3V48a3 3 0 0 1 3-3zm3 6.083v11.834a6.002 6.002 0 0 0 0-11.834z" fill="#225CAC"/></g></svg>';
          break a;
        case "AMP-VIDEO":
        case "AMP-YOUTUBE":
          $JSCompiler_inline_result$jscomp$787$$ = 'data:image/svg+xml;charset=utf-8,<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#1E3B63" d="M0 0h128v128H0z"/><path d="M24 51h80v46a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V51z" fill="#225CAC"/><path fill="#1B519B" d="M24 49h80v12H24z"/><path fill="#D1E5FF" d="M56 49l-8 12h-9l8-12zm16 0l-8 12h-8l8-12zm32 0l-8 12h-8l8-12zm-16 0l-8 12h-8l8-12z"/><path d="M26.916 49.148l77.274-20.705-2.07-7.728a4 4 0 0 0-4.9-2.828L27.674 36.522a4 4 0 0 0-2.829 4.899l2.07 7.727z" fill="#1B519B"/><path fill="#D1E5FF" d="M57.826 40.866l-10.834-9.52-8.693 2.329 10.833 9.52zm15.454-4.141l-10.833-9.52-7.727 2.07 10.833 9.52zm30.91-8.282l-10.833-9.52-7.728 2.07 10.834 9.52zm-15.455 4.141l-10.833-9.52-7.728 2.07 10.834 9.52z"/><path d="M28 37h9.86a4 4 0 0 1 3.327 1.781L48 49l-8 12H24V41a4 4 0 0 1 4-4z" fill="#2B6AC0"/><circle fill="#D1E5FF" cx="29.5" cy="44.5" r="1.5"/><circle fill="#D1E5FF" cx="29.5" cy="55.5" r="1.5"/></g></svg>';
          break a;
        default:
          $JSCompiler_inline_result$jscomp$787$$ = 'data:image/svg+xml;charset=utf-8,<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path d="M9 20.5a1.5 1.5 0 0 1-3 0c0-6.488 5-8.53 5-13.5a4 4 0 1 0-8 0 1.5 1.5 0 0 1-3 0 7 7 0 1 1 14 0c0 5.483-5 7.485-5 13.5z" id="a"/><circle id="b" cx="7.5" cy="29.5" r="1.5"/></defs><g fill="none" fill-rule="evenodd"><path fill="#1E3B63" d="M0 0h128v128H0z"/><path d="M33 24.5h62a4 4 0 0 1 4 4v54.952L78.081 104.5H33a4 4 0 0 1-4-4v-72a4 4 0 0 1 4-4z" fill="#D1E5FF"/><g transform="translate(57 48)"><use fill="#225CAC" xlink:href="#a"/><path stroke="#225CAC" d="M9.5 20.5a2 2 0 1 1-4 0c0-2.85.756-4.755 2.58-7.59l.385-.595c.152-.236.265-.412.373-.584C10.006 9.873 10.5 8.601 10.5 7a3.5 3.5 0 1 0-7 0 2 2 0 1 1-4 0 7.5 7.5 0 0 1 15 0c0 2.273-.642 3.81-2.314 6.409l-.266.412C10.133 16.592 9.5 18.103 9.5 20.5z"/></g><g transform="translate(57 48)"><use fill="#225CAC" xlink:href="#b"/><circle stroke="#225CAC" cx="7.5" cy="29.5" r="2"/></g><path d="M82 83.5h17l-21 21v-17a4 4 0 0 1 4-4z" fill="#ACC8F0"/></g></svg>';
      }
    }
    return {srcset:$element$jscomp$471$$, $placeholderSrc$:$JSCompiler_inline_result$jscomp$787$$, element:$lightboxGroupId$jscomp$5$$, $timestampPromise$:$JSCompiler_StaticMethods_getVideoTimestamp_$$($lightboxGroupId$jscomp$5$$)};
  });
}, $JSCompiler_StaticMethods_getUserPlaceholderSrcset_$$ = function($JSCompiler_StaticMethods_getUserPlaceholderSrcset_$self_poster$jscomp$inline_3546$$, $element$jscomp$474_placeholder$jscomp$17$$) {
  return "AMP-IMG" == $element$jscomp$474_placeholder$jscomp$17$$.tagName ? _.$srcsetFromElement$$module$src$srcset$$($element$jscomp$474_placeholder$jscomp$17$$) : "AMP-VIDEO" == $element$jscomp$474_placeholder$jscomp$17$$.tagName ? ($JSCompiler_StaticMethods_getUserPlaceholderSrcset_$self_poster$jscomp$inline_3546$$ = $element$jscomp$474_placeholder$jscomp$17$$.getAttribute("poster")) ? _.$srcsetFromSrc$$module$src$srcset$$($JSCompiler_StaticMethods_getUserPlaceholderSrcset_$self_poster$jscomp$inline_3546$$) : 
  null : ($element$jscomp$474_placeholder$jscomp$17$$ = _.$childElementByAttr$$module$src$dom$$($element$jscomp$474_placeholder$jscomp$17$$, "placeholder")) ? $JSCompiler_StaticMethods_getUserPlaceholderSrcset_$$($JSCompiler_StaticMethods_getUserPlaceholderSrcset_$self_poster$jscomp$inline_3546$$, $element$jscomp$474_placeholder$jscomp$17$$) : null;
}, $AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = function($$jscomp$super$this$jscomp$69_element$jscomp$475$$) {
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$69_element$jscomp$475$$) || this;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$doc_$ = $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$win$.document;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$isActive_$ = !1;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$historyId_$ = -1;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$currentElemId_$ = -1;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$boundOnKeyDown_$ = $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$onKeyDown_$.bind($$jscomp$super$this$jscomp$69_element$jscomp$475$$);
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$manager_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$history_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$action_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$elementsMetadata_$ = {default:[]};
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$container_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$carouselContainer_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$controlsContainer_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$navControls_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$carousel_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$descriptionBox_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$descriptionTextArea_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$descriptionOverflowMask_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$gallery_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$topBar_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$controlsMode_$ = 1;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$unlistenClick_$ = null;
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$currentLightboxGroupId_$ = "default";
  $$jscomp$super$this$jscomp$69_element$jscomp$475$$.$sourceElement_$ = null;
  return $$jscomp$super$this$jscomp$69_element$jscomp$475$$;
}, $JSCompiler_StaticMethods_buildControls_$$ = function($JSCompiler_StaticMethods_buildControls_$self$$) {
  $JSCompiler_StaticMethods_buildControls_$self$$.$controlsContainer_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_buildControls_$self$$.$doc_$)($_template2$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
  $JSCompiler_StaticMethods_buildDescriptionBox_$$($JSCompiler_StaticMethods_buildControls_$self$$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$$($JSCompiler_StaticMethods_buildControls_$self$$);
  $JSCompiler_StaticMethods_buildNavControls_$$($JSCompiler_StaticMethods_buildControls_$self$$);
  $JSCompiler_StaticMethods_buildControls_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_buildControls_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_buildControls_$self$$.$controlsContainer_$);
  });
}, $JSCompiler_StaticMethods_findOrInitializeLightbox_$$ = function($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$, $lightboxGroupId$jscomp$6$$) {
  $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$carouselContainer_$ || ($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$carouselContainer_$ = $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$doc_$.createElement("div"), $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$container_$.appendChild($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$carouselContainer_$));
  $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$controlsContainer_$ || $JSCompiler_StaticMethods_buildControls_$$($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$);
  var $existingCarousel$jscomp$inline_3550$$ = $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.element.querySelector("amp-carousel[amp-lightbox-group=" + _.$cssEscape$$module$third_party$css_escape$css_escape$$($lightboxGroupId$jscomp$6$$) + "]");
  $existingCarousel$jscomp$inline_3550$$ ? ($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$.$carousel_$ = $existingCarousel$jscomp$inline_3550$$, $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$ = $JSCompiler_StaticMethods_showCarousel_$$($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$, $lightboxGroupId$jscomp$6$$)) : $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$ = 
  $JSCompiler_StaticMethods_buildCarousel_$$($JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$, $lightboxGroupId$jscomp$6$$);
  return $JSCompiler_StaticMethods_findOrInitializeLightbox_$self_JSCompiler_inline_result$jscomp$790$$;
}, $JSCompiler_StaticMethods_buildCarouselSlides_$$ = function($JSCompiler_StaticMethods_buildCarouselSlides_$self$$, $lightboxableElements$$) {
  var $index$jscomp$125$$ = 0;
  $JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$elementsMetadata_$[$JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$currentLightboxGroupId_$] = [];
  $lightboxableElements$$.forEach(function($lightboxableElements$$) {
    $lightboxableElements$$.$Ka$ = $index$jscomp$125$$++;
    var $element$jscomp$477_metadata$jscomp$6$$ = !$lightboxableElements$$.classList.contains("i-amphtml-element");
    $element$jscomp$477_metadata$jscomp$6$$ = $lightboxableElements$$.cloneNode($element$jscomp$477_metadata$jscomp$6$$);
    $element$jscomp$477_metadata$jscomp$6$$.removeAttribute("on");
    $element$jscomp$477_metadata$jscomp$6$$.removeAttribute("id");
    $element$jscomp$477_metadata$jscomp$6$$.removeAttribute("i-amphtml-layout");
    a: {
      var $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = $JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$manager_$;
      var $ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ = _.$closestByTag$$module$src$dom$$($lightboxableElements$$, "figure");
      if ($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ && ($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ = _.$elementByTag$$module$src$dom$$($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$, "figcaption"))) {
        $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = $ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$.innerText;
        break a;
      }
      if ($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ = $lightboxableElements$$.getAttribute("aria-describedby")) {
        if ($JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$.$ampdoc_$.getElementById($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$)) {
          $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$.innerText;
          break a;
        }
      }
      $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = null;
    }
    $lightboxableElements$$ = {$descriptionText$:$JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$, tagName:$element$jscomp$477_metadata$jscomp$6$$.tagName, $sourceElement$:$lightboxableElements$$, element:$element$jscomp$477_metadata$jscomp$6$$};
    $ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ = $element$jscomp$477_metadata$jscomp$6$$;
    $ELIGIBLE_TAP_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$element$jscomp$477_metadata$jscomp$6$$.tagName] && ($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$ = $JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$doc_$.createElement("div"), $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$ = 
    _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$doc_$)($_template3$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$), $element$jscomp$477_metadata$jscomp$6$$.removeAttribute("class"), $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$.appendChild($element$jscomp$477_metadata$jscomp$6$$), $ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$.appendChild($JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$), 
    $lightboxableElements$$.$imageViewer$ = $JSCompiler_StaticMethods_getDescription$self$jscomp$inline_3557_JSCompiler_inline_result$jscomp$785_descriptionElement$jscomp$inline_3562_imageViewer$$);
    $JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$carousel_$.appendChild($ariaDescribedBy$jscomp$inline_3561_container$jscomp$15_figCaption$jscomp$inline_3560_figureParent$jscomp$inline_3559_slide$jscomp$4$$);
    $JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$elementsMetadata_$[$JSCompiler_StaticMethods_buildCarouselSlides_$self$$.$currentLightboxGroupId_$].push($lightboxableElements$$);
  });
}, $JSCompiler_StaticMethods_showCarousel_$$ = function($JSCompiler_StaticMethods_showCarousel_$self$$, $lightboxGroupId$jscomp$8$$) {
  return $JSCompiler_StaticMethods_showCarousel_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_showCarousel_$self$$.$controlsContainer_$.classList.toggle("i-amphtml-ghost", 1 == $JSCompiler_StaticMethods_showCarousel_$self$$.$elementsMetadata_$[$lightboxGroupId$jscomp$8$$].length);
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_showCarousel_$self$$.$carousel_$, !0);
  });
}, $JSCompiler_StaticMethods_buildCarousel_$$ = function($JSCompiler_StaticMethods_buildCarousel_$self$$, $lightboxGroupId$jscomp$9$$) {
  return window.Promise.all([_.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_buildCarousel_$self$$.$win$), $JSCompiler_StaticMethods_buildCarousel_$self$$.$getAmpDoc$(), "amp-carousel"), _.$JSCompiler_StaticMethods_installExtensionForDoc$$(_.$Services$$module$src$services$extensionsFor$$($JSCompiler_StaticMethods_buildCarousel_$self$$.$win$), $JSCompiler_StaticMethods_buildCarousel_$self$$.$getAmpDoc$(), "amp-image-viewer")]).then(function() {
    return $JSCompiler_StaticMethods_getElementsForLightboxGroup$$($JSCompiler_StaticMethods_buildCarousel_$self$$.$manager_$, $lightboxGroupId$jscomp$9$$);
  }).then(function($list$jscomp$8$$) {
    $JSCompiler_StaticMethods_buildCarousel_$self$$.$carousel_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_buildCarousel_$self$$.$doc_$)($_template4$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
    $JSCompiler_StaticMethods_buildCarousel_$self$$.$carousel_$.setAttribute("amp-lightbox-group", $lightboxGroupId$jscomp$9$$);
    $JSCompiler_StaticMethods_buildCarouselSlides_$$($JSCompiler_StaticMethods_buildCarousel_$self$$, $list$jscomp$8$$);
    return $JSCompiler_StaticMethods_buildCarousel_$self$$.$mutateElement$(function() {
      $JSCompiler_StaticMethods_buildCarousel_$self$$.$carouselContainer_$.appendChild($JSCompiler_StaticMethods_buildCarousel_$self$$.$carousel_$);
      $JSCompiler_StaticMethods_buildCarousel_$self$$.$controlsContainer_$.classList.toggle("i-amphtml-ghost", 1 == $list$jscomp$8$$.length);
    });
  });
}, $JSCompiler_StaticMethods_buildDescriptionBox_$$ = function($JSCompiler_StaticMethods_buildDescriptionBox_$self$$) {
  $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionBox_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$doc_$)($_template5$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
  $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionTextArea_$ = $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionBox_$.querySelector(".i-amphtml-lbg-desc-text");
  $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionOverflowMask_$ = $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionBox_$.querySelector(".i-amphtml-lbg-desc-mask");
  $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionBox_$.addEventListener("click", function($event$jscomp$145$$) {
    $JSCompiler_StaticMethods_toggleDescriptionOverflow_$$($JSCompiler_StaticMethods_buildDescriptionBox_$self$$);
    $event$jscomp$145$$.stopPropagation();
  });
  $JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$controlsContainer_$.appendChild($JSCompiler_StaticMethods_buildDescriptionBox_$self$$.$descriptionBox_$);
}, $JSCompiler_StaticMethods_updateDescriptionBox_$$ = function($JSCompiler_StaticMethods_updateDescriptionBox_$self$$) {
  var $descText$jscomp$1$$ = $JSCompiler_StaticMethods_getCurrentElement_$$($JSCompiler_StaticMethods_updateDescriptionBox_$self$$).$descriptionText$;
  $descText$jscomp$1$$ ? $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionTextArea_$.innerText = $descText$jscomp$1$$;
    $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$.classList.remove("i-amphtml-lbg-fade-out");
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$, !0);
  }).then(function() {
    var $descText$jscomp$1$$, $isInOverflowMode$$;
    $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$measureMutateElement$(function() {
      $descText$jscomp$1$$ = $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$.scrollHeight - $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$.clientHeight >= $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionOverflowMask_$.clientHeight;
      $isInOverflowMode$$ = $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$.classList.contains("i-amphtml-lbg-overflow");
    }, function() {
      _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionOverflowMask_$, {visibility:$descText$jscomp$1$$ || $isInOverflowMode$$ ? "visible" : "hidden"});
      $isInOverflowMode$$ && $JSCompiler_StaticMethods_clearDescOverflowState_$$($JSCompiler_StaticMethods_updateDescriptionBox_$self$$);
    });
  }) : $JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$mutateElement$(function() {
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_updateDescriptionBox_$self$$.$descriptionBox_$, !1);
  });
}, $JSCompiler_StaticMethods_toggleDescriptionOverflow_$$ = function($JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$) {
  _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.element, "descriptionOverflowToggled", _.$dict$$module$src$utils$object$$({}));
  var $isInStandardMode$$, $isInOverflowMode$jscomp$1$$, $descriptionOverflows$jscomp$1$$;
  $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$measureMutateElement$(function() {
    $isInStandardMode$$ = $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.classList.contains("i-amphtml-lbg-standard");
    $isInOverflowMode$jscomp$1$$ = $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.classList.contains("i-amphtml-lbg-overflow");
    $descriptionOverflows$jscomp$1$$ = $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.scrollHeight - $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.clientHeight >= $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionOverflowMask_$.clientHeight;
  }, function() {
    $isInStandardMode$$ && $descriptionOverflows$jscomp$1$$ ? ($JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.classList.remove("i-amphtml-lbg-standard"), $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$descriptionBox_$.classList.add("i-amphtml-lbg-overflow"), _.$toggle$$module$src$style$$(_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$navControls_$, "E#19457 this.navControls_"), 
    !1), _.$toggle$$module$src$style$$(_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$.$topBar_$, "E#19457 this.topBar_"), !1)) : $isInOverflowMode$jscomp$1$$ && $JSCompiler_StaticMethods_clearDescOverflowState_$$($JSCompiler_StaticMethods_toggleDescriptionOverflow_$self$$);
  });
}, $JSCompiler_StaticMethods_clearDescOverflowState_$$ = function($JSCompiler_StaticMethods_clearDescOverflowState_$self$$) {
  $JSCompiler_StaticMethods_clearDescOverflowState_$self$$.$descriptionBox_$.scrollTop = 0;
  $JSCompiler_StaticMethods_clearDescOverflowState_$self$$.$descriptionBox_$.classList.remove("i-amphtml-lbg-overflow");
  $JSCompiler_StaticMethods_clearDescOverflowState_$self$$.$descriptionBox_$.classList.add("i-amphtml-lbg-standard");
  _.$toggle$$module$src$style$$(_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_clearDescOverflowState_$self$$.$navControls_$, "E#19457 this.navControls_"), !0);
  _.$toggle$$module$src$style$$(_.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_clearDescOverflowState_$self$$.$topBar_$, "E#19457 this.topBar_"), !0);
}, $JSCompiler_StaticMethods_buildNavControls_$$ = function($JSCompiler_StaticMethods_buildNavControls_$self$$) {
  $JSCompiler_StaticMethods_buildNavControls_$self$$.$navControls_$ = $JSCompiler_StaticMethods_buildNavControls_$self$$.$doc_$.createElement("div");
  var $nextButton_nextSlide$$ = $JSCompiler_StaticMethods_buildNavControls_$self$$.$nextSlide_$.bind($JSCompiler_StaticMethods_buildNavControls_$self$$), $prevButton_prevSlide$$ = $JSCompiler_StaticMethods_buildNavControls_$self$$.$prevSlide_$.bind($JSCompiler_StaticMethods_buildNavControls_$self$$);
  $nextButton_nextSlide$$ = $JSCompiler_StaticMethods_buildButton_$$($JSCompiler_StaticMethods_buildNavControls_$self$$, "Next", "i-amphtml-lbg-button-next", $nextButton_nextSlide$$);
  $prevButton_prevSlide$$ = $JSCompiler_StaticMethods_buildButton_$$($JSCompiler_StaticMethods_buildNavControls_$self$$, "Prev", "i-amphtml-lbg-button-prev", $prevButton_prevSlide$$);
  _.$getService$$module$src$service$$($JSCompiler_StaticMethods_buildNavControls_$self$$.$win$, "input").$hasMouse_$ || ($prevButton_prevSlide$$.classList.add("i-amphtml-screen-reader"), $nextButton_nextSlide$$.classList.add("i-amphtml-screen-reader"));
  $JSCompiler_StaticMethods_buildNavControls_$self$$.$navControls_$.appendChild($prevButton_prevSlide$$);
  $JSCompiler_StaticMethods_buildNavControls_$self$$.$navControls_$.appendChild($nextButton_nextSlide$$);
  $JSCompiler_StaticMethods_buildNavControls_$self$$.$controlsContainer_$.appendChild($JSCompiler_StaticMethods_buildNavControls_$self$$.$navControls_$);
}, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$$ = function($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$) {
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$ = $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$doc_$.createElement("div");
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$.classList.add("i-amphtml-lbg-top-bar");
  var $close_closeButton$$ = $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$close_$.bind($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$), $openGallery_openGalleryButton$$ = $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$openGallery_$.bind($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$), 
  $closeGallery_closeGalleryButton$$ = $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$closeGallery_$.bind($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$);
  $close_closeButton$$ = $JSCompiler_StaticMethods_buildButton_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$, "Close", "i-amphtml-lbg-button-close", $close_closeButton$$);
  $openGallery_openGalleryButton$$ = $JSCompiler_StaticMethods_buildButton_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$, "Gallery", "i-amphtml-lbg-button-gallery", $openGallery_openGalleryButton$$);
  $closeGallery_closeGalleryButton$$ = $JSCompiler_StaticMethods_buildButton_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$, "Content", "i-amphtml-lbg-button-slide", $closeGallery_closeGalleryButton$$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$.appendChild($close_closeButton$$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$.appendChild($openGallery_openGalleryButton$$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$.appendChild($closeGallery_closeGalleryButton$$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$controlsContainer_$.appendChild($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$buildTopBar_$self$$.$topBar_$);
}, $JSCompiler_StaticMethods_buildButton_$$ = function($JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$, $label$jscomp$13$$, $className$jscomp$6$$, $action$jscomp$20$$) {
  $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.$doc_$)($_template6$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
  $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.setAttribute("aria-label", $label$jscomp$13$$);
  $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.classList.add($className$jscomp$6$$);
  $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.addEventListener("click", function($JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$) {
    $action$jscomp$20$$();
    $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.stopPropagation();
    $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$.preventDefault();
  });
  return $JSCompiler_StaticMethods_buildButton_$self_button$jscomp$2$$;
}, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$$ = function($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$, $clickConsumed_e$jscomp$266$$) {
  var $target$jscomp$150$$ = $clickConsumed_e$jscomp$266$$.target;
  $clickConsumed_e$jscomp$266$$ = null !== _.$closest$$module$src$dom$$($target$jscomp$150$$, function($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$) {
    return "BUTTON" == $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$.tagName || "A" == $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$.tagName || "button" == $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$.getAttribute("role");
  }, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$.$container_$);
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$ = !!_.$JSCompiler_StaticMethods_findAction_$$($target$jscomp$150$$, "tap", $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$.$container_$);
  return !($clickConsumed_e$jscomp$266$$ || $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$self_hasTap$$);
}, $JSCompiler_StaticMethods_setupEventListeners_$$ = function($JSCompiler_StaticMethods_setupEventListeners_$self$$) {
  var $onToggleControls$$ = $JSCompiler_StaticMethods_setupEventListeners_$self$$.$onToggleControls_$.bind($JSCompiler_StaticMethods_setupEventListeners_$self$$);
  $JSCompiler_StaticMethods_setupEventListeners_$self$$.$unlistenClick_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$($JSCompiler_StaticMethods_setupEventListeners_$self$$.$container_$, "click", $onToggleControls$$, void 0);
}, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$setupGestures_$$ = function($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$setupGestures_$self$$) {
  _.$JSCompiler_StaticMethods_onGesture$$(_.$Gestures$$module$src$gesture$get$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$setupGestures_$self$$.$carousel_$), $SwipeYRecognizer$$module$src$gesture_recognizers$$, function($e$jscomp$268$$) {
    $e$jscomp$268$$.data.$last$ && 10 < Math.abs($e$jscomp$268$$.data.deltaY) && $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$setupGestures_$self$$.$AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$close_$();
  });
}, $JSCompiler_StaticMethods_pauseLightboxChildren_$$ = function($JSCompiler_StaticMethods_pauseLightboxChildren_$self$$) {
  var $slides$jscomp$3$$ = $JSCompiler_StaticMethods_pauseLightboxChildren_$self$$.$elementsMetadata_$[$JSCompiler_StaticMethods_pauseLightboxChildren_$self$$.$currentLightboxGroupId_$].map(function($JSCompiler_StaticMethods_pauseLightboxChildren_$self$$) {
    return $JSCompiler_StaticMethods_pauseLightboxChildren_$self$$.element;
  });
  $JSCompiler_StaticMethods_pauseLightboxChildren_$self$$.$schedulePause$($slides$jscomp$3$$);
}, $JSCompiler_StaticMethods_getCurrentElement_$$ = function($JSCompiler_StaticMethods_getCurrentElement_$self$$) {
  return $JSCompiler_StaticMethods_getCurrentElement_$self$$.$elementsMetadata_$[$JSCompiler_StaticMethods_getCurrentElement_$self$$.$currentLightboxGroupId_$][$JSCompiler_StaticMethods_getCurrentElement_$self$$.$currentElemId_$];
}, $JSCompiler_StaticMethods_openLightboxGallery_$$ = function($JSCompiler_StaticMethods_openLightboxGallery_$self$$, $element$jscomp$479$$) {
  $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$sourceElement_$ = $element$jscomp$479$$;
  var $lightboxGroupId$jscomp$10$$ = $element$jscomp$479$$.getAttribute("lightbox") || "default";
  $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$currentLightboxGroupId_$ = $lightboxGroupId$jscomp$10$$;
  return $JSCompiler_StaticMethods_findOrInitializeLightbox_$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$, $lightboxGroupId$jscomp$10$$).then(function() {
    return $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$mutateElement$(function() {
      _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.element, !0);
      _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.element, {opacity:0});
      $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$controlsContainer_$.classList.remove("i-amphtml-lbg-fade-in");
      $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$controlsContainer_$.classList.add("i-amphtml-lbg-hidden");
      _.$JSCompiler_StaticMethods_enterLightboxMode$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.$getViewport$());
    });
  }).then(function() {
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$isActive_$ = !0;
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$updateInViewport$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.$container_$, !0);
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$scheduleLayout$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.$container_$);
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$doc_$.documentElement.addEventListener("keydown", $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$boundOnKeyDown_$);
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$carousel_$.addEventListener("slideChange", function($element$jscomp$479$$) {
      $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$currentElemId_$ = $element$jscomp$479$$.data.index;
      $JSCompiler_StaticMethods_updateDescriptionBox_$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$);
    });
    $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$setupGestures_$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$);
    $JSCompiler_StaticMethods_setupEventListeners_$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$);
    return $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$carousel_$.signals().whenSignal("load-end");
  }).then(function() {
    return $JSCompiler_StaticMethods_openLightboxForElement_$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$, $element$jscomp$479$$);
  }).then(function() {
    $JSCompiler_StaticMethods_openLightboxGallery_$self$$.$showControls_$();
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_openLightboxGallery_$self$$.element, "lightboxOpened", _.$dict$$module$src$utils$object$$({}));
  });
}, $JSCompiler_StaticMethods_openLightboxForElement_$$ = function($JSCompiler_StaticMethods_openLightboxForElement_$self$$, $element$jscomp$480$$) {
  $JSCompiler_StaticMethods_openLightboxForElement_$self$$.$currentElemId_$ = $element$jscomp$480$$.$Ka$;
  $JSCompiler_StaticMethods_openLightboxForElement_$self$$.$carousel_$.$getImpl$().then(function($element$jscomp$480$$) {
    return $element$jscomp$480$$.$showSlideWhenReady$($JSCompiler_StaticMethods_openLightboxForElement_$self$$.$currentElemId_$);
  });
  $JSCompiler_StaticMethods_updateDescriptionBox_$$($JSCompiler_StaticMethods_openLightboxForElement_$self$$);
  return $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$$($JSCompiler_StaticMethods_openLightboxForElement_$self$$);
}, $JSCompiler_StaticMethods_elementTypeCanBeAnimated_$$ = function($element$jscomp$481$$) {
  return $element$jscomp$481$$ && _.$isLoaded$$module$src$event_helper$$($element$jscomp$481$$) && $ELIGIBLE_TAP_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$element$jscomp$481$$.tagName] && _.$elementByTag$$module$src$dom$$($element$jscomp$481$$, "img") ? !0 : !1;
}, $JSCompiler_StaticMethods_transitionImg_$$ = function($JSCompiler_StaticMethods_transitionImg_$self$$, $sourceElement$jscomp$2$$, $enter$$) {
  return $JSCompiler_StaticMethods_getCurrentElement_$$($JSCompiler_StaticMethods_transitionImg_$self$$).$imageViewer$.$getImpl$().then(function($imageViewer$jscomp$1_lightboxImg$$) {
    var $$jscomp$destructuring$var435_sourceImg$$ = $imageViewer$jscomp$1_lightboxImg$$.$getImageBoxWithOffset$(), $height$jscomp$49$$ = $$jscomp$destructuring$var435_sourceImg$$.height;
    if (!$$jscomp$destructuring$var435_sourceImg$$.width || !$height$jscomp$49$$) {
      return $JSCompiler_StaticMethods_fade_$$($JSCompiler_StaticMethods_transitionImg_$self$$, $enter$$);
    }
    $imageViewer$jscomp$1_lightboxImg$$ = $imageViewer$jscomp$1_lightboxImg$$.$getImage$();
    $$jscomp$destructuring$var435_sourceImg$$ = _.$childElementByTag$$module$src$dom$$($sourceElement$jscomp$2$$, "img");
    return $JSCompiler_StaticMethods_runImgTransition_$$($JSCompiler_StaticMethods_transitionImg_$self$$, $enter$$ ? $$jscomp$destructuring$var435_sourceImg$$ : $imageViewer$jscomp$1_lightboxImg$$, $enter$$ ? $imageViewer$jscomp$1_lightboxImg$$ : $$jscomp$destructuring$var435_sourceImg$$, $enter$$);
  });
}, $JSCompiler_StaticMethods_runImgTransition_$$ = function($JSCompiler_StaticMethods_runImgTransition_$self$$, $srcImg$jscomp$1$$, $targetImg$jscomp$1$$, $enter$jscomp$1$$) {
  function $cleanup$jscomp$3$$() {
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_runImgTransition_$self$$.element, $enter$jscomp$1$$);
    _.$setStyle$$module$src$style$$($container$jscomp$16$$, "animationName", "");
    _.$setStyle$$module$src$style$$($carousel$jscomp$4$$, "animationName", "");
    $srcImg$jscomp$1$$.classList.remove("i-amphtml-ghost");
    $targetImg$jscomp$1$$.classList.remove("i-amphtml-ghost");
    $imageAnimation$$.$cleanupAnimation$();
  }
  var $carousel$jscomp$4$$ = $JSCompiler_StaticMethods_runImgTransition_$self$$.$carousel_$, $container$jscomp$16$$ = $JSCompiler_StaticMethods_runImgTransition_$self$$.$container_$, $duration$jscomp$23$$, $motionDuration$$, $imageAnimation$$;
  return $JSCompiler_StaticMethods_runImgTransition_$self$$.$measureMutateElement$(function() {
    var $enter$jscomp$1$$ = $srcImg$jscomp$1$$.getBoundingClientRect(), $cleanup$jscomp$3$$ = $targetImg$jscomp$1$$.getBoundingClientRect(), $carousel$jscomp$4$$ = $JSCompiler_StaticMethods_runImgTransition_$self$$.$getViewport$().$getSize$().height;
    var $container$jscomp$16$$ = void 0 === $container$jscomp$16$$ ? 1000 : $container$jscomp$16$$;
    $duration$jscomp$23$$ = _.$clamp$$module$src$utils$math$$(Math.abs(Math.abs(Math.abs($cleanup$jscomp$3$$.top - $enter$jscomp$1$$.top))) / (void 0 === $carousel$jscomp$4$$ ? 250 : $carousel$jscomp$4$$) * $container$jscomp$16$$, 500, $container$jscomp$16$$);
    $motionDuration$$ = 0.8 * $duration$jscomp$23$$;
    $imageAnimation$$ = $prepareImageAnimation$$module$$ampproject$animations$dist$animations_mjs$$({$styleContainer$:$JSCompiler_StaticMethods_runImgTransition_$self$$.$getAmpDoc$().$getHeadNode$(), $srcImg$:$srcImg$jscomp$1$$, $targetImg$:$targetImg$jscomp$1$$, $srcImgRect$:void 0, $targetImgRect$:void 0, $styles$:{animationDuration:$motionDuration$$ + "ms", zIndex:2147483642}, $keyframesNamespace$:void 0, curve:$TRANSITION_CURVE$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$});
  }, function() {
    _.$toggle$$module$src$style$$($carousel$jscomp$4$$, $enter$jscomp$1$$);
    _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_runImgTransition_$self$$.element, "opacity", "");
    _.$setStyles$$module$src$style$$($container$jscomp$16$$, {animationName:$enter$jscomp$1$$ ? "fadeIn" : "fadeOut", $animationTimingFunction$:"cubic-bezier(0.8, 0, 0.2, 1)", $animationDuration$:$motionDuration$$ + "ms", $animationFillMode$:"forwards"});
    _.$setStyles$$module$src$style$$($carousel$jscomp$4$$, {animationName:"fadeIn", $animationDelay$:$motionDuration$$ - 0.01 + "ms", $animationDuration$:"0.01ms", $animationFillMode$:"forwards"});
    $srcImg$jscomp$1$$.classList.add("i-amphtml-ghost");
    $targetImg$jscomp$1$$.classList.add("i-amphtml-ghost");
    $imageAnimation$$.$applyAnimation$();
  }).then(function() {
    return _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_runImgTransition_$self$$.$win$).$promise$(0);
  }).then(function() {
    return _.$Services$$module$src$services$timerFor$$($JSCompiler_StaticMethods_runImgTransition_$self$$.$win$).$promise$($duration$jscomp$23$$);
  }).then(function() {
    return $JSCompiler_StaticMethods_runImgTransition_$self$$.$mutateElement$($cleanup$jscomp$3$$);
  });
}, $JSCompiler_StaticMethods_fade_$$ = function($JSCompiler_StaticMethods_fade_$self$$, $anim$jscomp$2_fadeIn$$) {
  var $startOpacity$$ = $anim$jscomp$2_fadeIn$$ ? 0 : 1, $endOpacity$$ = $anim$jscomp$2_fadeIn$$ ? 1 : 0;
  $anim$jscomp$2_fadeIn$$ = new _.$Animation$$module$src$animation$$($JSCompiler_StaticMethods_fade_$self$$.element);
  $anim$jscomp$2_fadeIn$$.add(0, _.$setStyles$$module$src$transition$$($JSCompiler_StaticMethods_fade_$self$$.element, {opacity:_.$numeric$$module$src$transition$$($startOpacity$$, $endOpacity$$)}), 0.8, $FADE_CURVE$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
  return _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$thenAlways$$($anim$jscomp$2_fadeIn$$.start(500), function() {
    return $JSCompiler_StaticMethods_fade_$self$$.$mutateElement$(function() {
      _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_fade_$self$$.element, {opacity:""});
      0 == $endOpacity$$ && (_.$toggle$$module$src$style$$($JSCompiler_StaticMethods_fade_$self$$.$carousel_$, !1), _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_fade_$self$$.element, !1));
    });
  });
}, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$$ = function($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$self$$) {
  var $sourceElement$jscomp$5$$ = $JSCompiler_StaticMethods_getCurrentElement_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$self$$).$sourceElement$;
  return $JSCompiler_StaticMethods_elementTypeCanBeAnimated_$$($sourceElement$jscomp$5$$) ? $JSCompiler_StaticMethods_getCurrentElement_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$self$$).$imageViewer$.signals().whenSignal("load-end").then(function() {
    return $JSCompiler_StaticMethods_transitionImg_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$self$$, $sourceElement$jscomp$5$$, !0);
  }) : $JSCompiler_StaticMethods_fade_$$($JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$enter_$self$$, !0);
}, $JSCompiler_StaticMethods_maybeSyncSourceCarousel_$$ = function($JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$) {
  var $target$jscomp$154_targetSlide$$ = $JSCompiler_StaticMethods_getCurrentElement_$$($JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$).$sourceElement$;
  if ($JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$ = _.$closestBySelector$$module$src$dom$$($target$jscomp$154_targetSlide$$, 'amp-carousel[type="slides"]')) {
    var $allSlides$$ = _.$toArray$$module$src$types$$(_.$scopedQuerySelectorAll$$module$src$dom$$($JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$, ".i-amphtml-slide-item"));
    $target$jscomp$154_targetSlide$$ = _.$closestBySelector$$module$src$dom$$($target$jscomp$154_targetSlide$$, ".i-amphtml-slide-item");
    var $targetSlideIndex$$ = $allSlides$$.indexOf($target$jscomp$154_targetSlide$$);
    $JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$.$getImpl$().then(function($JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$) {
      return $JSCompiler_StaticMethods_maybeSyncSourceCarousel_$self_parentCarousel$jscomp$1$$.$showSlideWhenReady$($targetSlideIndex$$);
    });
  }
}, $JSCompiler_StaticMethods_maybeSlideCarousel_$$ = function($JSCompiler_StaticMethods_maybeSlideCarousel_$self$$, $direction$jscomp$8$$) {
  $JSCompiler_StaticMethods_maybeSlideCarousel_$self$$.$container_$.hasAttribute("gallery-view") || $JSCompiler_StaticMethods_maybeSlideCarousel_$self$$.$carousel_$.$getImpl$().then(function($JSCompiler_StaticMethods_maybeSlideCarousel_$self$$) {
    $JSCompiler_StaticMethods_maybeSlideCarousel_$self$$.$goCallback$($direction$jscomp$8$$, !0, !1);
  });
}, $JSCompiler_StaticMethods_findOrBuildGallery_$$ = function($JSCompiler_StaticMethods_findOrBuildGallery_$self$$) {
  $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$ = $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.element.querySelector(".i-amphtml-lbg-gallery[amp-lightbox-group=" + _.$cssEscape$$module$third_party$css_escape$css_escape$$($JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$currentLightboxGroupId_$) + "]");
  $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$ ? ($JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$.classList.remove("i-amphtml-ghost"), $JSCompiler_StaticMethods_updateVideoThumbnails_$$($JSCompiler_StaticMethods_findOrBuildGallery_$self$$)) : ($JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$doc_$)($_template7$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$), 
  $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$.setAttribute("amp-lightbox-group", $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$currentLightboxGroupId_$), $JSCompiler_StaticMethods_initializeThumbnails_$$($JSCompiler_StaticMethods_findOrBuildGallery_$self$$), $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$mutateElement$(function() {
    $JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$container_$.appendChild($JSCompiler_StaticMethods_findOrBuildGallery_$self$$.$gallery_$);
  }));
}, $JSCompiler_StaticMethods_updateVideoThumbnails_$$ = function($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$) {
  var $thumbnails$$ = $JSCompiler_StaticMethods_getThumbnails$$($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.$manager_$, $JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.$currentLightboxGroupId_$).map(function($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$, $thumbnails$$) {
    return Object.assign({index:$thumbnails$$}, $JSCompiler_StaticMethods_updateVideoThumbnails_$self$$);
  }).filter(function($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$) {
    return $VIDEO_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.element.tagName];
  });
  $JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.$mutateElement$(function() {
    $thumbnails$$.forEach(function($thumbnails$$) {
      $thumbnails$$.$timestampPromise$.then(function($thumbnail$jscomp$2$$) {
        if ($thumbnail$jscomp$2$$ && !(0,window.isNaN)($thumbnail$jscomp$2$$)) {
          $thumbnail$jscomp$2$$ = $JSCompiler_StaticMethods_secondsToTimestampString_$$($thumbnail$jscomp$2$$);
          var $timestamp$jscomp$4_ts$$ = _.$childElementByTag$$module$src$dom$$($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.$gallery_$.childNodes[$thumbnails$$.index], "div");
          1 < $timestamp$jscomp$4_ts$$.childNodes.length && $timestamp$jscomp$4_ts$$.removeChild($timestamp$jscomp$4_ts$$.childNodes[1]);
          $timestamp$jscomp$4_ts$$.appendChild($JSCompiler_StaticMethods_updateVideoThumbnails_$self$$.$doc_$.createTextNode($thumbnail$jscomp$2$$));
          $timestamp$jscomp$4_ts$$.classList.add("i-amphtml-lbg-has-timestamp");
        }
      });
    });
  });
}, $JSCompiler_StaticMethods_initializeThumbnails_$$ = function($JSCompiler_StaticMethods_initializeThumbnails_$self$$) {
  var $thumbnails$jscomp$1$$ = [];
  $JSCompiler_StaticMethods_getThumbnails$$($JSCompiler_StaticMethods_initializeThumbnails_$self$$.$manager_$, $JSCompiler_StaticMethods_initializeThumbnails_$self$$.$currentLightboxGroupId_$).forEach(function($thumbnail$jscomp$3_thumbnailElement$$) {
    "AMP-AD" != $thumbnail$jscomp$3_thumbnailElement$$.element.tagName && ($thumbnail$jscomp$3_thumbnailElement$$ = $JSCompiler_StaticMethods_createThumbnailElement_$$($JSCompiler_StaticMethods_initializeThumbnails_$self$$, $thumbnail$jscomp$3_thumbnailElement$$), $thumbnails$jscomp$1$$.push($thumbnail$jscomp$3_thumbnailElement$$));
  });
  $JSCompiler_StaticMethods_initializeThumbnails_$self$$.$mutateElement$(function() {
    $thumbnails$jscomp$1$$.forEach(function($thumbnails$jscomp$1$$) {
      $JSCompiler_StaticMethods_initializeThumbnails_$self$$.$gallery_$.appendChild($thumbnails$jscomp$1$$);
    });
  });
}, $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$padStart_$$ = function($s$jscomp$41$$) {
  var $targetLength$jscomp$2$$ = 2;
  if ($s$jscomp$41$$.length >= $targetLength$jscomp$2$$) {
    return $s$jscomp$41$$;
  }
  $targetLength$jscomp$2$$ -= $s$jscomp$41$$.length;
  for (var $padding$$ = "0"; $targetLength$jscomp$2$$ > $padding$$.length;) {
    $padding$$ += "0";
  }
  return $padding$$.slice(0, $targetLength$jscomp$2$$) + $s$jscomp$41$$;
}, $JSCompiler_StaticMethods_secondsToTimestampString_$$ = function($seconds$$) {
  return $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$padStart_$$(Math.floor($seconds$$ / 3600).toString()) + ":" + $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$padStart_$$(Math.floor($seconds$$ / 60).toString()) + ":" + $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$padStart_$$(Math.floor($seconds$$ % 
  60).toString());
}, $JSCompiler_StaticMethods_handleThumbnailClick_$$ = function($JSCompiler_StaticMethods_handleThumbnailClick_$self$$, $event$jscomp$150$$, $id$jscomp$79$$) {
  $event$jscomp$150$$.stopPropagation();
  window.Promise.all([$JSCompiler_StaticMethods_handleThumbnailClick_$self$$.$closeGallery_$(), $JSCompiler_StaticMethods_handleThumbnailClick_$self$$.$carousel_$.$getImpl$()]).then(function($event$jscomp$150$$) {
    $JSCompiler_StaticMethods_handleThumbnailClick_$self$$.$currentElemId_$ = $id$jscomp$79$$;
    $event$jscomp$150$$[1].$showSlideWhenReady$($JSCompiler_StaticMethods_handleThumbnailClick_$self$$.$currentElemId_$);
    $JSCompiler_StaticMethods_updateDescriptionBox_$$($JSCompiler_StaticMethods_handleThumbnailClick_$self$$);
  });
}, $JSCompiler_StaticMethods_createThumbnailElement_$$ = function($JSCompiler_StaticMethods_createThumbnailElement_$self$$, $thumbnailObj$$) {
  var $element$jscomp$482$$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_createThumbnailElement_$self$$.$doc_$)($_template8$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$), $imgElement$$ = _.$childElementByTag$$module$src$dom$$($element$jscomp$482$$, "img");
  $thumbnailObj$$.srcset ? $imgElement$$.setAttribute("srcset", _.$JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$$($thumbnailObj$$.srcset)) : $imgElement$$.setAttribute("src", $thumbnailObj$$.$placeholderSrc$);
  $element$jscomp$482$$.appendChild($imgElement$$);
  if ($VIDEO_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$[$thumbnailObj$$.element.tagName]) {
    var $timestampDiv$jscomp$1$$ = _.$htmlFor$$module$src$static_template$$($JSCompiler_StaticMethods_createThumbnailElement_$self$$.$doc_$)($_template9$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
    $thumbnailObj$$.$timestampPromise$.then(function($thumbnailObj$$) {
      $thumbnailObj$$ && !(0,window.isNaN)($thumbnailObj$$) && ($timestampDiv$jscomp$1$$.appendChild($JSCompiler_StaticMethods_createThumbnailElement_$self$$.$doc_$.createTextNode($JSCompiler_StaticMethods_secondsToTimestampString_$$($thumbnailObj$$))), $timestampDiv$jscomp$1$$.classList.add("i-amphtml-lbg-has-timestamp"));
    });
    $element$jscomp$482$$.appendChild($timestampDiv$jscomp$1$$);
  }
  $element$jscomp$482$$.addEventListener("click", function($element$jscomp$482$$) {
    $JSCompiler_StaticMethods_handleThumbnailClick_$$($JSCompiler_StaticMethods_createThumbnailElement_$self$$, $element$jscomp$482$$, $thumbnailObj$$.element.$Ka$);
  });
  return $element$jscomp$482$$;
};
_.$$jscomp$inherits$$($SwipeYRecognizer$$module$src$gesture_recognizers$$, _.$SwipeRecognizer$$module$src$gesture_recognizers$$);
var $F$$module$$ampproject$animations$dist$animations_mjs$$ = {$x1$:.42, $y1$:0, $x2$:.58, $y2$:1}, $G$$module$$ampproject$animations$dist$animations_mjs$$ = 0;
var $ELIGIBLE_TAP_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$ = {"AMP-IMG":!0}, $VIDEO_TAGS$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$ = {"AMP-YOUTUBE":!0, "AMP-VIDEO":!0};
$LightboxManager$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$.prototype.$I$ = function($element$jscomp$465$$) {
  if (!this.$seen_$.includes($element$jscomp$465$$)) {
    if (this.$seen_$.push($element$jscomp$465$$), "AMP-CAROUSEL" == $element$jscomp$465$$.tagName) {
      $JSCompiler_StaticMethods_processLightboxCarousel_$$(this, $element$jscomp$465$$);
    } else {
      var $lightboxGroupId$jscomp$1$$ = $element$jscomp$465$$.getAttribute("lightbox") || "default";
      $JSCompiler_StaticMethods_processBaseLightboxElement_$$(this, $element$jscomp$465$$, $lightboxGroupId$jscomp$1$$);
    }
  }
};
var $_template$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<div class=i-amphtml-lbg><div class=i-amphtml-lbg-mask></div></div>"], $_template2$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<div class=i-amphtml-lbg-controls></div>"], $_template3$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<amp-image-viewer layout=fill></amp-image-viewer>"], $_template4$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = 
["<amp-carousel type=slides layout=fill loop></amp-carousel>"], $_template5$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ['<div class="i-amphtml-lbg-desc-box i-amphtml-lbg-standard"><div class=i-amphtml-lbg-desc-text></div><div class=i-amphtml-lbg-desc-mask></div></div>'], $_template6$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<div role=button class=i-amphtml-lbg-button><span class=i-amphtml-lbg-icon></span></div>"], $_template7$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = 
["<div class=i-amphtml-lbg-gallery></div>"], $_template8$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<div class=i-amphtml-lbg-gallery-thumbnail><img class=i-amphtml-lbg-gallery-thumbnail-img></div>"], $_template9$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = ["<div class=i-amphtml-lbg-thumbnail-timestamp-container><span class=i-amphtml-lbg-thumbnail-play-icon></span><div></div></div>"], $TRANSITION_CURVE$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = 
{$x1$:0.8, $y1$:0, $x2$:0.2, $y2$:1}, $FADE_CURVE$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$ = _.$bezierCurve$$module$src$curve$$(0.8, 0, 0.2, 1);
_.$$jscomp$inherits$$($AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$.prototype;
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$700$$ = this;
  return _.$getElementServiceForDoc$$module$src$element_service$$(this.element, "amp-lightbox-manager", "amp-lightbox-gallery").then(function($manager$jscomp$19$$) {
    $$jscomp$this$jscomp$700$$.$manager_$ = $manager$jscomp$19$$;
    $$jscomp$this$jscomp$700$$.$history_$ = _.$Services$$module$src$services$historyForDoc$$($$jscomp$this$jscomp$700$$.$getAmpDoc$());
    $$jscomp$this$jscomp$700$$.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$($$jscomp$this$jscomp$700$$.element);
    return _.$Services$$module$src$services$viewerForDoc$$($$jscomp$this$jscomp$700$$.$getAmpDoc$()).$D$;
  }).then(function() {
    $$jscomp$this$jscomp$700$$.$container_$ = _.$htmlFor$$module$src$static_template$$($$jscomp$this$jscomp$700$$.$doc_$)($_template$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$);
    $$jscomp$this$jscomp$700$$.element.appendChild($$jscomp$this$jscomp$700$$.$container_$);
    $JSCompiler_StaticMethods_maybeInit$$($$jscomp$this$jscomp$700$$.$manager_$);
    _.$JSCompiler_StaticMethods_registerDefaultAction$$($$jscomp$this$jscomp$700$$, function($invocation$jscomp$43$$) {
      return $$jscomp$this$jscomp$700$$.$open_$($invocation$jscomp$43$$);
    }, "open");
  });
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$nextSlide_$ = function() {
  this.$carousel_$.$getImpl$().then(function($carousel$jscomp$1$$) {
    $carousel$jscomp$1$$.$interactionNext$();
  });
};
_.$JSCompiler_prototypeAlias$$.$prevSlide_$ = function() {
  this.$carousel_$.$getImpl$().then(function($carousel$jscomp$2$$) {
    $carousel$jscomp$2$$.$interactionPrev$();
  });
};
_.$JSCompiler_prototypeAlias$$.$onToggleControls_$ = function($e$jscomp$267$$) {
  $JSCompiler_StaticMethods_AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$shouldHandleClick_$$(this, $e$jscomp$267$$) && (0 == this.$controlsMode_$ ? this.$showControls_$() : this.$container_$.hasAttribute("gallery-view") || (this.$controlsContainer_$.classList.remove("i-amphtml-lbg-fade-in"), this.$controlsContainer_$.classList.add("i-amphtml-lbg-fade-out"), this.$controlsMode_$ = 0));
  _.$triggerAnalyticsEvent$$module$src$analytics$$(this.element, "controlsToggled", _.$dict$$module$src$utils$object$$({}));
};
_.$JSCompiler_prototypeAlias$$.$showControls_$ = function() {
  this.$controlsContainer_$.classList.remove("i-amphtml-lbg-fade-out");
  this.$controlsContainer_$.classList.remove("i-amphtml-lbg-hidden");
  this.$controlsContainer_$.classList.add("i-amphtml-lbg-fade-in");
  this.$container_$.hasAttribute("gallery-view") || $JSCompiler_StaticMethods_updateDescriptionBox_$$(this);
  this.$controlsMode_$ = 1;
};
_.$JSCompiler_prototypeAlias$$.$open_$ = function($invocation$jscomp$44_targetId$jscomp$3$$) {
  var $$jscomp$this$jscomp$709$$ = this, $target$jscomp$151$$ = $invocation$jscomp$44_targetId$jscomp$3$$.caller;
  $invocation$jscomp$44_targetId$jscomp$3$$.args && $invocation$jscomp$44_targetId$jscomp$3$$.args.id && ($invocation$jscomp$44_targetId$jscomp$3$$ = $invocation$jscomp$44_targetId$jscomp$3$$.args.id, $target$jscomp$151$$ = this.$getAmpDoc$().getElementById($invocation$jscomp$44_targetId$jscomp$3$$));
  $JSCompiler_StaticMethods_openLightboxGallery_$$(this, $target$jscomp$151$$).then(function() {
    return $$jscomp$this$jscomp$709$$.$history_$.push($$jscomp$this$jscomp$709$$.$AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$close_$.bind($$jscomp$this$jscomp$709$$));
  }).then(function($invocation$jscomp$44_targetId$jscomp$3$$) {
    $$jscomp$this$jscomp$709$$.$historyId_$ = $invocation$jscomp$44_targetId$jscomp$3$$;
  });
};
_.$JSCompiler_prototypeAlias$$.$AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$close_$ = function() {
  var $$jscomp$this$jscomp$716$$ = this;
  if (!this.$isActive_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_maybeSyncSourceCarousel_$$(this);
  this.$isActive_$ = !1;
  this.$unlistenClick_$ && (this.$unlistenClick_$(), this.$unlistenClick_$ = null);
  this.$doc_$.documentElement.removeEventListener("keydown", this.$boundOnKeyDown_$);
  this.$carousel_$.removeEventListener("slideChange", function($event$jscomp$148$$) {
    $$jscomp$this$jscomp$716$$.$currentElemId_$ = $event$jscomp$148$$.data.index;
    $JSCompiler_StaticMethods_updateDescriptionBox_$$($$jscomp$this$jscomp$716$$);
  });
  _.$Gestures$$module$src$gesture$get$$(this.$carousel_$).$cleanup$();
  return this.$mutateElement$(function() {
    _.$JSCompiler_StaticMethods_leaveLightboxMode$$($$jscomp$this$jscomp$716$$.$getViewport$());
    $$jscomp$this$jscomp$716$$.$container_$.removeAttribute("gallery-view");
    $$jscomp$this$jscomp$716$$.$gallery_$ && ($$jscomp$this$jscomp$716$$.$gallery_$.classList.add("i-amphtml-ghost"), $$jscomp$this$jscomp$716$$.$gallery_$ = null);
    $JSCompiler_StaticMethods_clearDescOverflowState_$$($$jscomp$this$jscomp$716$$);
  }).then(function() {
    var $target$jscomp$inline_6262$$ = $JSCompiler_StaticMethods_getCurrentElement_$$($$jscomp$this$jscomp$716$$).$sourceElement$;
    var $JSCompiler_inline_result$jscomp$6675_parentCarousel$jscomp$inline_6773$$ = $target$jscomp$inline_6262$$ == $$jscomp$this$jscomp$716$$.$sourceElement_$ || $target$jscomp$inline_6262$$.$isInViewport$() ? !0 : ($JSCompiler_inline_result$jscomp$6675_parentCarousel$jscomp$inline_6773$$ = _.$closestBySelector$$module$src$dom$$($target$jscomp$inline_6262$$, 'amp-carousel[type="slides"]')) && $JSCompiler_inline_result$jscomp$6675_parentCarousel$jscomp$inline_6773$$.$isInViewport$() ? !0 : !1;
    return $JSCompiler_inline_result$jscomp$6675_parentCarousel$jscomp$inline_6773$$ && $JSCompiler_StaticMethods_elementTypeCanBeAnimated_$$($target$jscomp$inline_6262$$) ? $JSCompiler_StaticMethods_transitionImg_$$($$jscomp$this$jscomp$716$$, $JSCompiler_StaticMethods_getCurrentElement_$$($$jscomp$this$jscomp$716$$).$sourceElement$, !1) : $JSCompiler_StaticMethods_fade_$$($$jscomp$this$jscomp$716$$, !1);
  }).then(function() {
    $$jscomp$this$jscomp$716$$.$schedulePause$($$jscomp$this$jscomp$716$$.$container_$);
    $JSCompiler_StaticMethods_pauseLightboxChildren_$$($$jscomp$this$jscomp$716$$);
    $$jscomp$this$jscomp$716$$.$carousel_$ = null;
    -1 != $$jscomp$this$jscomp$716$$.$historyId_$ && $$jscomp$this$jscomp$716$$.$history_$.pop($$jscomp$this$jscomp$716$$.$historyId_$);
  });
};
_.$JSCompiler_prototypeAlias$$.$onKeyDown_$ = function($event$jscomp$149$$) {
  if (this.$isActive_$) {
    switch($event$jscomp$149$$.key) {
      case "Escape":
        this.$AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery_prototype$close_$();
        break;
      case "ArrowLeft":
        $JSCompiler_StaticMethods_maybeSlideCarousel_$$(this, -1);
        break;
      case "ArrowRight":
        $JSCompiler_StaticMethods_maybeSlideCarousel_$$(this, 1);
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$openGallery_$ = function() {
  var $$jscomp$this$jscomp$717$$ = this;
  this.$gallery_$ || $JSCompiler_StaticMethods_findOrBuildGallery_$$(this);
  this.$mutateElement$(function() {
    $$jscomp$this$jscomp$717$$.$container_$.setAttribute("gallery-view", "");
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$717$$.$navControls_$, !1);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$717$$.$carousel_$, !1);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$717$$.$descriptionBox_$, !1);
  });
  _.$triggerAnalyticsEvent$$module$src$analytics$$(this.element, "thumbnailsViewToggled", _.$dict$$module$src$utils$object$$({}));
};
_.$JSCompiler_prototypeAlias$$.$closeGallery_$ = function() {
  var $$jscomp$this$jscomp$718$$ = this;
  return this.$mutateElement$(function() {
    $$jscomp$this$jscomp$718$$.$container_$.removeAttribute("gallery-view");
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$718$$.$navControls_$, !0);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$718$$.$carousel_$, !0);
    $JSCompiler_StaticMethods_updateDescriptionBox_$$($$jscomp$this$jscomp$718$$);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$718$$.$descriptionBox_$, !0);
  });
};
var $AMP$jscomp$inline_3584$$ = window.self.AMP;
$AMP$jscomp$inline_3584$$.registerElement("amp-lightbox-gallery", $AmpLightboxGallery$$module$extensions$amp_lightbox_gallery$0_1$amp_lightbox_gallery$$, "amp-lightbox-gallery .amp-carousel-button{display:none}.i-amphtml-lbg-icon{width:100%!important;height:100%!important;display:block!important;background-repeat:no-repeat!important;background-position:50%!important}.i-amphtml-lbg-button-close{top:0!important;right:0!important}.i-amphtml-lbg-button-close .i-amphtml-lbg-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.295 5.705a.997.997 0 0 0-1.41 0L12 10.59 7.115 5.705a.997.997 0 1 0-1.41 1.41L10.59 12l-4.885 4.885a.997.997 0 0 0 1.41 1.41L12 13.41l4.885 4.885a.997.997 0 0 0 1.41-1.41L13.41 12l4.885-4.885a.997.997 0 0 0 0-1.41z' fill='%23fff' fill-rule='nonzero'/%3E%3C/svg%3E\")}.i-amphtml-lbg-button-gallery{top:0!important;left:0!important}.i-amphtml-lbg-button-gallery .i-amphtml-lbg-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 3h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 0h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 13h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1zm12 0h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E\")}.i-amphtml-lbg-button-slide{top:0!important;left:0!important;display:none}.i-amphtml-lbg-button-slide .i-amphtml-lbg-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm14 12V5H5v8l3-3 5 5 3-3 3 3zm-3.5-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E\")}.i-amphtml-lbg-button.i-amphtml-lbg-button-next,.i-amphtml-lbg-button.i-amphtml-lbg-button-prev{top:0!important;bottom:0!important;margin:auto!important;-webkit-filter:drop-shadow(0 0 1px #000)!important;filter:drop-shadow(0 0 1px black)!important;width:40px;height:40px;padding:20px}.i-amphtml-lbg-button-next{right:0!important}.i-amphtml-lbg-button-next .i-amphtml-lbg-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.182 12l-3.89-3.89a1 1 0 0 1 1.415-1.413l4.596 4.596a1 1 0 0 1 0 1.414l-4.596 4.596a1 1 0 0 1-1.414-1.414L13.182 12z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E\")}.i-amphtml-lbg-button-prev{left:0!important}.i-amphtml-lbg-button-prev .i-amphtml-lbg-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.828 12l3.89 3.89a1 1 0 1 1-1.415 1.413l-4.596-4.596a1 1 0 0 1 0-1.414l4.596-4.596a1 1 0 1 1 1.415 1.414L10.828 12z' fill='%23fff' fill-rule='evenodd'/%3E%3C/svg%3E\")}.i-amphtml-lbg-button{position:absolute!important;cursor:pointer!important;width:24px;height:24px;padding:16px;box-sizing:content-box}.i-amphtml-lbg{position:fixed!important;z-index:2147483642}.i-amphtml-lbg,.i-amphtml-lbg-gallery,.i-amphtml-lbg-mask{top:0!important;left:0!important;right:0!important;bottom:0!important}.i-amphtml-lbg-gallery,.i-amphtml-lbg-mask{background-color:#000!important;position:absolute!important}.i-amphtml-lbg-gallery{display:none;top:56px!important;overflow:auto!important}@media (min-width:1024px){.i-amphtml-lbg-gallery{top:80px!important}}.i-amphtml-lbg-top-bar{position:absolute!important;left:0!important;right:0!important;top:0!important;height:56px!important;z-index:1!important;background:-webkit-linear-gradient(rgba(0,0,0,0.3),transparent);background:linear-gradient(rgba(0,0,0,0.3),transparent)}@media (min-width:1024px){.i-amphtml-lbg-top-bar{height:80px!important}}.i-amphtml-lbg-controls.i-amphtml-lbg-hidden{opacity:0;visibility:hidden}.i-amphtml-lbg-controls.i-amphtml-lbg-fade-in{-webkit-animation:fadeIn 0.4s ease-in 1 forwards;animation:fadeIn 0.4s ease-in 1 forwards}.i-amphtml-lbg-controls.i-amphtml-lbg-fade-out{-webkit-animation:fadeOut 0.4s linear 1 forwards;animation:fadeOut 0.4s linear 1 forwards}.i-amphtml-lbg-desc-box{position:absolute!important;left:0!important;right:0!important;bottom:0!important;color:#fff}.i-amphtml-lbg-desc-box.i-amphtml-lbg-standard{background:-webkit-linear-gradient(transparent,rgba(0,0,0,0.5));background:linear-gradient(transparent,rgba(0,0,0,0.5));max-height:6rem!important;-webkit-transition:max-height 0.3s ease-out!important;transition:max-height 0.3s ease-out!important;overflow:hidden!important}.i-amphtml-lbg-desc-box.i-amphtml-lbg-overflow{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;max-height:100%!important;-webkit-transition:max-height 0.7s ease-out!important;transition:max-height 0.7s ease-out!important}.i-amphtml-lbg-desc-mask{width:100%!important;position:fixed!important;bottom:0!important}.i-amphtml-lbg-desc-text{padding:20px!important;position:relative!important}.i-amphtml-lbg-desc-box.i-amphtml-lbg-overflow .i-amphtml-lbg-desc-text{padding-top:40px!important}.i-amphtml-lbg-desc-box.i-amphtml-lbg-standard .i-amphtml-lbg-desc-mask{z-index:1!important;height:1rem!important;background:-webkit-linear-gradient(transparent,rgba(0,0,0,0.9));background:linear-gradient(transparent,rgba(0,0,0,0.9));-webkit-transition:background-color 0.5s ease-out!important;transition:background-color 0.5s ease-out!important}.i-amphtml-lbg-desc-box.i-amphtml-lbg-overflow .i-amphtml-lbg-desc-mask{background-color:rgba(0,0,0,0.4)!important;top:0!important;z-index:0!important;-webkit-transition:background-color 0.4s ease-in!important;transition:background-color 0.4s ease-in!important}.i-amphtml-lbg[gallery-view] .i-amphtml-lbg-gallery{display:grid!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;grid-gap:5px!important;grid-template-columns:repeat(3,1fr);grid-auto-rows:-webkit-min-content!important;grid-auto-rows:min-content!important;padding:5px}@media (min-width:1024px){.i-amphtml-lbg[gallery-view] .i-amphtml-lbg-gallery{grid-template-columns:repeat(4,249.75px)}}.i-amphtml-lbg-gallery-thumbnail{position:relative!important;padding-top:100%!important}.i-amphtml-lbg-gallery-thumbnail-img{width:100%!important;height:100%!important;position:absolute!important;top:0!important;-o-object-fit:cover!important;object-fit:cover!important;cursor:pointer!important}.i-amphtml-lbg-thumbnail-timestamp-container{background-color:#292d33;color:#fff;position:absolute;bottom:10px;left:10px;height:20px;border-radius:2px;opacity:0.8;width:20px}.i-amphtml-lbg-thumbnail-timestamp-container.i-amphtml-lbg-has-timestamp{font-size:12px;padding:0 5px 0 18px;line-height:1.3rem;width:auto}.i-amphtml-lbg-thumbnail-play-icon{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E\");height:16px;width:16px;position:absolute;left:2px;bottom:2px}@media (min-width:1024px){.i-amphtml-lbg-button{width:40px;height:40px;padding:20px}}.i-amphtml-lbg[gallery-view] .i-amphtml-lbg-button-gallery{display:none}.i-amphtml-lbg[gallery-view] .i-amphtml-lbg-button-slide{display:block}amp-lightbox-gallery .i-amphtml-slide-item>*{height:auto}@-webkit-keyframes fadeIn{0%{opacity:0}to{opacity:1;visibility:visible}}@keyframes fadeIn{0%{opacity:0}to{opacity:1;visibility:visible}}@-webkit-keyframes fadeOut{0%{opacity:1}to{opacity:0;visibility:hidden}}@keyframes fadeOut{0%{opacity:1}to{opacity:0;visibility:hidden}}@-webkit-keyframes slideUp{0%{max-height:6rem}to{max-height:100%}}@keyframes slideUp{0%{max-height:6rem}to{max-height:100%}}\n/*# sourceURL=/extensions/amp-lightbox-gallery/0.1/amp-lightbox-gallery.css*/");
$AMP$jscomp$inline_3584$$.registerServiceForDoc("amp-lightbox-manager", $LightboxManager$$module$extensions$amp_lightbox_gallery$0_1$service$lightbox_manager_impl$$);
_.$JSCompiler_StaticMethods_addDocFactory$$(_.$Services$$module$src$services$extensionsFor$$(window.global), function($ampdoc$jscomp$184$$) {
  return $ampdoc$jscomp$184$$.$whenReady$().then(function() {
    return $ampdoc$jscomp$184$$.$getBody$();
  }).then(function($body$jscomp$27$$) {
    if (!_.$elementByTag$$module$src$dom$$($ampdoc$jscomp$184$$.getRootNode(), "amp-lightbox-gallery")) {
      var $gallery$jscomp$1$$ = $ampdoc$jscomp$184$$.$win$.document.createElement("amp-lightbox-gallery");
      $gallery$jscomp$1$$.setAttribute("layout", "nodisplay");
      $gallery$jscomp$1$$.setAttribute("id", "amp-lightbox-gallery");
      $body$jscomp$27$$.appendChild($gallery$jscomp$1$$);
    }
  });
});

})});
