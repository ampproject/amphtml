(self.AMP=self.AMP||[]).push({n:"amp-jwplayer",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpJWPlayer$$module$extensions$amp_jwplayer$0_1$amp_jwplayer$$ = function($$jscomp$super$this$jscomp$67_element$jscomp$461$$) {
  $$jscomp$super$this$jscomp$67_element$jscomp$461$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$67_element$jscomp$461$$) || this;
  $$jscomp$super$this$jscomp$67_element$jscomp$461$$.$contentid_$ = "";
  $$jscomp$super$this$jscomp$67_element$jscomp$461$$.$playerid_$ = "";
  $$jscomp$super$this$jscomp$67_element$jscomp$461$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$67_element$jscomp$461$$;
};
_.$$jscomp$inherits$$($AmpJWPlayer$$module$extensions$amp_jwplayer$0_1$amp_jwplayer$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpJWPlayer$$module$extensions$amp_jwplayer$0_1$amp_jwplayer$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($onLayout$jscomp$6$$) {
  this.$preconnect$.url("https://content.jwplatform.com", $onLayout$jscomp$6$$);
  this.$preconnect$.url("https://ssl.p.jwpcdn.com", $onLayout$jscomp$6$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$73$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$73$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$contentid_$ = this.element.getAttribute("data-playlist-id") || this.element.getAttribute("data-media-id");
  this.$playerid_$ = this.element.getAttribute("data-player-id");
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$67$$ = this.element.ownerDocument.createElement("iframe"), $src$jscomp$50$$ = "https://content.jwplatform.com/players/" + (0,window.encodeURIComponent)(this.$contentid_$) + "-" + (0,window.encodeURIComponent)(this.$playerid_$) + ".html";
  $iframe$jscomp$67$$.setAttribute("frameborder", "0");
  $iframe$jscomp$67$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$67$$.src = $src$jscomp$50$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$67$$);
  this.element.appendChild($iframe$jscomp$67$$);
  this.$iframe_$ = $iframe$jscomp$67$$;
  return this.$loadPromise$($iframe$jscomp$67$$);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("pause", "https://content.jwplatform.com");
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  if (this.element.hasAttribute("data-media-id")) {
    var $placeholder$jscomp$15$$ = this.$win$.document.createElement("amp-img");
    _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["aria-label"], $placeholder$jscomp$15$$);
    $placeholder$jscomp$15$$.setAttribute("src", "https://content.jwplatform.com/thumbs/" + (0,window.encodeURIComponent)(this.$contentid_$) + "-720.jpg");
    $placeholder$jscomp$15$$.setAttribute("layout", "fill");
    $placeholder$jscomp$15$$.setAttribute("placeholder", "");
    $placeholder$jscomp$15$$.setAttribute("referrerpolicy", "origin");
    $placeholder$jscomp$15$$.hasAttribute("aria-label") ? $placeholder$jscomp$15$$.setAttribute("alt", "Loading video - " + $placeholder$jscomp$15$$.getAttribute("aria-label")) : $placeholder$jscomp$15$$.setAttribute("alt", "Loading video");
    return $placeholder$jscomp$15$$;
  }
};
window.self.AMP.registerElement("amp-jwplayer", $AmpJWPlayer$$module$extensions$amp_jwplayer$0_1$amp_jwplayer$$);

})});
