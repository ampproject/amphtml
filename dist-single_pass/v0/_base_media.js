(self.AMP=self.AMP||[]).push({n:"_base_media",i:"_base_i",v:"1901181729101",f:(function(AMP,_){
var $_template$$module$src$iframe_video$$;
_.$fullscreenEnter$$module$src$dom$$ = function($element$jscomp$26$$) {
  var $requestFs$$ = $element$jscomp$26$$.requestFullscreen || $element$jscomp$26$$.$fb$ || $element$jscomp$26$$.webkitRequestFullscreen || $element$jscomp$26$$.webkitRequestFullScreen || $element$jscomp$26$$.webkitEnterFullscreen || $element$jscomp$26$$.webkitEnterFullScreen || $element$jscomp$26$$.msRequestFullscreen || $element$jscomp$26$$.$bb$ || $element$jscomp$26$$.$ab$ || $element$jscomp$26$$.mozRequestFullScreen;
  $requestFs$$ && $requestFs$$.call($element$jscomp$26$$);
};
_.$fullscreenExit$$module$src$dom$$ = function($element$jscomp$27$$) {
  var $exitFs$$ = $element$jscomp$27$$.$cancelFullScreen$ || $element$jscomp$27$$.exitFullscreen || $element$jscomp$27$$.$exitFullScreen$ || $element$jscomp$27$$.webkitExitFullscreen || $element$jscomp$27$$.webkitExitFullScreen || $element$jscomp$27$$.webkitCancelFullScreen || $element$jscomp$27$$.mozCancelFullScreen || $element$jscomp$27$$.msExitFullscreen;
  $exitFs$$ ? $exitFs$$.call($element$jscomp$27$$) : ($element$jscomp$27$$.ownerDocument && ($exitFs$$ = $element$jscomp$27$$.ownerDocument.$cancelFullScreen$ || $element$jscomp$27$$.ownerDocument.exitFullscreen || $element$jscomp$27$$.ownerDocument.$exitFullScreen$ || $element$jscomp$27$$.ownerDocument.webkitExitFullscreen || $element$jscomp$27$$.ownerDocument.webkitExitFullScreen || $element$jscomp$27$$.ownerDocument.webkitCancelFullScreen || $element$jscomp$27$$.ownerDocument.mozCancelFullScreen || 
  $element$jscomp$27$$.ownerDocument.msExitFullscreen), $exitFs$$ && $exitFs$$.call($element$jscomp$27$$.ownerDocument));
};
_.$originMatches$$module$src$iframe_video$$ = function($event$jscomp$37$$, $iframe$jscomp$17$$, $host$jscomp$3$$) {
  return $iframe$jscomp$17$$ && $event$jscomp$37$$.source == $iframe$jscomp$17$$.contentWindow ? "string" === typeof $host$jscomp$3$$ ? $host$jscomp$3$$ == $event$jscomp$37$$.origin : $host$jscomp$3$$.test($event$jscomp$37$$.origin) : !1;
};
_.$redispatch$$module$src$iframe_video$$ = function($element$jscomp$256$$, $dispatchEvent$jscomp$1_event$jscomp$38$$, $events$jscomp$3$$) {
  if (null == $events$jscomp$3$$[$dispatchEvent$jscomp$1_event$jscomp$38$$]) {
    return !1;
  }
  $dispatchEvent$jscomp$1_event$jscomp$38$$ = $events$jscomp$3$$[$dispatchEvent$jscomp$1_event$jscomp$38$$];
  (_.$isArray$$module$src$types$$($dispatchEvent$jscomp$1_event$jscomp$38$$) ? $dispatchEvent$jscomp$1_event$jscomp$38$$ : [$dispatchEvent$jscomp$1_event$jscomp$38$$]).forEach(function($dispatchEvent$jscomp$1_event$jscomp$38$$) {
    $element$jscomp$256$$.$D$($dispatchEvent$jscomp$1_event$jscomp$38$$);
  });
  return !0;
};
_.$createFrameFor$$module$src$iframe_video$$ = function($video$jscomp$33$$, $src$jscomp$13$$, $opt_name$jscomp$2$$, $opt_sandbox$$) {
  var $element$jscomp$257$$ = $video$jscomp$33$$.element, $frame$jscomp$1$$ = _.$htmlFor$$module$src$static_template$$($element$jscomp$257$$)($_template$$module$src$iframe_video$$);
  $opt_name$jscomp$2$$ && $frame$jscomp$1$$.setAttribute("name", $opt_name$jscomp$2$$);
  $opt_sandbox$$ && $frame$jscomp$1$$.setAttribute("sandbox", $opt_sandbox$$.join(" "));
  _.$JSCompiler_StaticMethods_propagateAttributes$$($video$jscomp$33$$, ["referrerpolicy"], $frame$jscomp$1$$);
  _.$Services$$module$src$services$urlForDoc$$($element$jscomp$257$$);
  $frame$jscomp$1$$.src = $src$jscomp$13$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($frame$jscomp$1$$);
  $element$jscomp$257$$.appendChild($frame$jscomp$1$$);
  return $frame$jscomp$1$$;
};
_.$isJsonOrObj$$module$src$iframe_video$$ = function($anything$$) {
  return $anything$$ ? _.$isObject$$module$src$types$$($anything$$) || _.$startsWith$$module$src$string$$($anything$$, "{") : !1;
};
_.$objOrParseJson$$module$src$iframe_video$$ = function($objOrStr$$) {
  return _.$isObject$$module$src$types$$($objOrStr$$) ? $objOrStr$$ : _.$tryParseJson$$module$src$json$$($objOrStr$$);
};
_.$mutedOrUnmutedEvent$$module$src$iframe_video$$ = function($isMuted$$) {
  return $isMuted$$ ? _.$VideoEvents$$module$src$video_interface$$.$MUTED$ : _.$VideoEvents$$module$src$video_interface$$.$UNMUTED$;
};
$_template$$module$src$iframe_video$$ = ["<iframe frameborder=0 allowfullscreen></iframe>"];

})});
