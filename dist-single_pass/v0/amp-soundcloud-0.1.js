(self.AMP=self.AMP||[]).push({n:"amp-soundcloud",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$ = function($$jscomp$super$this$jscomp$94_element$jscomp$547$$) {
  $$jscomp$super$this$jscomp$94_element$jscomp$547$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$94_element$jscomp$547$$) || this;
  $$jscomp$super$this$jscomp$94_element$jscomp$547$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$94_element$jscomp$547$$;
};
_.$$jscomp$inherits$$($AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$, window.AMP.BaseElement);
$AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$.prototype.$preconnectCallback$ = function($opt_onLayout$jscomp$26$$) {
  this.$preconnect$.url("https://api.soundcloud.com/", $opt_onLayout$jscomp$26$$);
};
$AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$.prototype.$isLayoutSupported$ = function($layout$jscomp$93$$) {
  return "fixed-height" == $layout$jscomp$93$$;
};
$AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$.prototype.$layoutCallback$ = function() {
  var $height$jscomp$56$$ = this.element.getAttribute("height"), $color$jscomp$2$$ = this.element.getAttribute("data-color"), $visual$$ = this.element.getAttribute("data-visual"), $src$jscomp$63_url$jscomp$196$$ = "https://api.soundcloud.com/" + (this.element.hasAttribute("data-trackid") ? "tracks" : "playlists") + "/", $mediaid$$ = this.element.getAttribute("data-trackid") || this.element.getAttribute("data-playlistid"), $secret$$ = this.element.getAttribute("data-secret-token"), $iframe$jscomp$81$$ = 
  this.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$81$$.setAttribute("frameborder", "no");
  $iframe$jscomp$81$$.setAttribute("scrolling", "no");
  $src$jscomp$63_url$jscomp$196$$ = "https://w.soundcloud.com/player/?url=" + (0,window.encodeURIComponent)($src$jscomp$63_url$jscomp$196$$ + $mediaid$$);
  $secret$$ && ($src$jscomp$63_url$jscomp$196$$ += (0,window.encodeURIComponent)("?secret_token=" + $secret$$));
  "true" === $visual$$ ? $src$jscomp$63_url$jscomp$196$$ += "&visual=true" : $color$jscomp$2$$ && ($src$jscomp$63_url$jscomp$196$$ += "&color=" + (0,window.encodeURIComponent)($color$jscomp$2$$));
  $iframe$jscomp$81$$.src = $src$jscomp$63_url$jscomp$196$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$81$$);
  $iframe$jscomp$81$$.height = $height$jscomp$56$$;
  this.element.appendChild($iframe$jscomp$81$$);
  this.$iframe_$ = $iframe$jscomp$81$$;
  return this.$loadPromise$($iframe$jscomp$81$$);
};
$AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$.prototype.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({method:"pause"})), "https://w.soundcloud.com");
};
window.self.AMP.registerElement("amp-soundcloud", $AmpSoundcloud$$module$extensions$amp_soundcloud$0_1$amp_soundcloud$$);

})});
