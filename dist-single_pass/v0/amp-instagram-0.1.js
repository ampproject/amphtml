(self.AMP=self.AMP||[]).push({n:"amp-instagram",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$ = function($$jscomp$super$this$jscomp$64_element$jscomp$455$$) {
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$64_element$jscomp$455$$) || this;
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$.$shortcode_$ = "";
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$.$unlistenMessage_$ = null;
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$.$captioned_$ = "";
  $$jscomp$super$this$jscomp$64_element$jscomp$455$$.$iframePromise_$ = null;
  return $$jscomp$super$this$jscomp$64_element$jscomp$455$$;
};
_.$$jscomp$inherits$$($AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$19$$) {
  this.$preconnect$.url("https://www.instagram.com", $opt_onLayout$jscomp$19$$);
  this.$preconnect$.url("https://instagram.fsnc1-1.fna.fbcdn.net", $opt_onLayout$jscomp$19$$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$shortcode_$ = this.element.getAttribute("data-shortcode") || this.element.getAttribute("shortcode");
  this.$captioned_$ = this.element.hasAttribute("data-captioned") ? "captioned/" : "";
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$14$$ = this.$win$.document.createElement("div");
  $placeholder$jscomp$14$$.setAttribute("placeholder", "");
  var $image$jscomp$10$$ = this.$win$.document.createElement("amp-img");
  $image$jscomp$10$$.setAttribute("noprerender", "");
  $image$jscomp$10$$.setAttribute("src", "https://www.instagram.com/p/" + (0,window.encodeURIComponent)(this.$shortcode_$) + "/media/?size=l");
  $image$jscomp$10$$.setAttribute("layout", "fill");
  $image$jscomp$10$$.setAttribute("referrerpolicy", "origin");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["alt"], $image$jscomp$10$$);
  this.element.hasAttribute("data-default-framing") && this.element.classList.add("amp-instagram-default-framing");
  _.$setStyles$$module$src$style$$($image$jscomp$10$$, {top:"0 px", bottom:"0 px", left:"0 px", right:"0 px"});
  $placeholder$jscomp$14$$.appendChild($image$jscomp$10$$);
  return $placeholder$jscomp$14$$;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$71$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$71$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$690$$ = this, $iframe$jscomp$63$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$63$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleInstagramMessages_$.bind(this));
  $iframe$jscomp$63$$.setAttribute("scrolling", "no");
  $iframe$jscomp$63$$.setAttribute("frameborder", "0");
  $iframe$jscomp$63$$.setAttribute("allowtransparency", "true");
  $iframe$jscomp$63$$.setAttribute("title", "Instagram: " + this.element.getAttribute("alt"));
  $iframe$jscomp$63$$.src = "https://www.instagram.com/p/" + (0,window.encodeURIComponent)(this.$shortcode_$) + "/embed/" + this.$captioned_$ + "?cr=1&v=9";
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$63$$);
  this.element.appendChild($iframe$jscomp$63$$);
  _.$setStyles$$module$src$style$$($iframe$jscomp$63$$, {opacity:0});
  return this.$iframePromise_$ = this.$loadPromise$($iframe$jscomp$63$$).then(function() {
    _.$JSCompiler_StaticMethods_getVsync$$($$jscomp$this$jscomp$690$$).$mutate$(function() {
      _.$setStyles$$module$src$style$$($iframe$jscomp$63$$, {opacity:1});
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$handleInstagramMessages_$ = function($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$) {
  var $$jscomp$this$jscomp$691$$ = this;
  if ("https://www.instagram.com" == $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.origin && $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.source == this.$iframe_$.contentWindow && ($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$ = $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.data) && (_.$isObject$$module$src$types$$($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$) || _.$startsWith$$module$src$string$$($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$, 
  "{")) && ($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$ = _.$isObject$$module$src$types$$($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$) ? $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$ : _.$tryParseJson$$module$src$json$$($data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$), void 0 !== $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$ && "MEASURE" == $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.type && $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.details)) {
    var $height$jscomp$47$$ = $data$jscomp$138_event$jscomp$142_eventData$jscomp$13$$.details.height;
    _.$JSCompiler_StaticMethods_getVsync$$(this).measure(function() {
      $$jscomp$this$jscomp$691$$.$iframe_$ && $$jscomp$this$jscomp$691$$.$iframe_$.offsetHeight !== $height$jscomp$47$$ && _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$691$$, $height$jscomp$47$$);
    });
  }
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframePromise_$ = this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
window.self.AMP.registerElement("amp-instagram", $AmpInstagram$$module$extensions$amp_instagram$0_1$amp_instagram$$, "amp-instagram.amp-instagram-default-framing{border:1px solid #dbdbdb!important}\n/*# sourceURL=/extensions/amp-instagram/0.1/amp-instagram.css*/");

})});
