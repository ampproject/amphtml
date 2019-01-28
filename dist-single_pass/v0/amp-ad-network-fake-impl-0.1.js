(self.AMP=self.AMP||[]).push({n:"amp-ad-network-fake-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$ = function($element$jscomp$299$$) {
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.call(this, $element$jscomp$299$$) || this;
};
_.$$jscomp$inherits$$($AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
$AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$.prototype.$buildCallback$ = function() {
  _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$buildCallback$.call(this);
};
$AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$.prototype.isValidElement = function() {
  var $id$jscomp$48$$ = this.element.getAttribute("id");
  return $id$jscomp$48$$ && _.$startsWith$$module$src$string$$($id$jscomp$48$$, "i-amphtml-demo-") ? !0 : (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("AMP-AD-NETWORK-FAKE-IMPL", "Only works with id starts with i-amphtml-demo-"), !1);
};
$AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$.prototype.$getAdUrl$ = function() {
  return this.element.getAttribute("src");
};
$AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$.prototype.$sendXhrRequest$ = function($adUrl$jscomp$12$$) {
  var $$jscomp$this$jscomp$347$$ = this;
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.prototype.$sendXhrRequest$.call(this, $adUrl$jscomp$12$$).then(function($adUrl$jscomp$12$$) {
    if (!$adUrl$jscomp$12$$) {
      return null;
    }
    var $response$jscomp$47$$ = $adUrl$jscomp$12$$.status, $headers$jscomp$8$$ = $adUrl$jscomp$12$$.headers;
    return "true" == $$jscomp$this$jscomp$347$$.element.getAttribute("a4a-conversion") ? $adUrl$jscomp$12$$.text().then(function($adUrl$jscomp$12$$) {
      var $$jscomp$this$jscomp$347$$ = window.Response, $status$jscomp$4$$ = (new window.DOMParser).parseFromString($adUrl$jscomp$12$$, "text/html"), $extensions$jscomp$inline_2313_responseText$$ = $status$jscomp$4$$.documentElement;
      $extensions$jscomp$inline_2313_responseText$$.hasAttribute("\u26a1") ? $extensions$jscomp$inline_2313_responseText$$.removeAttribute("\u26a1") : $extensions$jscomp$inline_2313_responseText$$.hasAttribute("amp") ? $extensions$jscomp$inline_2313_responseText$$.removeAttribute("amp") : $extensions$jscomp$inline_2313_responseText$$.hasAttribute("AMP") && $extensions$jscomp$inline_2313_responseText$$.removeAttribute("AMP");
      $extensions$jscomp$inline_2313_responseText$$.hasAttribute("\u26a14ads") || $extensions$jscomp$inline_2313_responseText$$.hasAttribute("\u26a14ADS") || $extensions$jscomp$inline_2313_responseText$$.setAttribute("amp4ads", "");
      $adUrl$jscomp$12$$ = [];
      for (var $i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$ = $status$jscomp$4$$.head.querySelectorAll("script[src]"), $i$jscomp$inline_2315_style$jscomp$inline_2319$$ = 0; $i$jscomp$inline_2315_style$jscomp$inline_2319$$ < $i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$.length; $i$jscomp$inline_2315_style$jscomp$inline_2319$$++) {
        var $script$jscomp$inline_2316$$ = $i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$[$i$jscomp$inline_2315_style$jscomp$inline_2319$$];
        $script$jscomp$inline_2316$$.hasAttribute("custom-element") ? $adUrl$jscomp$12$$.push($script$jscomp$inline_2316$$.getAttribute("custom-element")) : $script$jscomp$inline_2316$$.hasAttribute("custom-template") && $adUrl$jscomp$12$$.push($script$jscomp$inline_2316$$.getAttribute("custom-template"));
        $status$jscomp$4$$.head.removeChild($script$jscomp$inline_2316$$);
      }
      $status$jscomp$4$$ = $status$jscomp$4$$.head.querySelectorAll("style[amp-boilerplate]");
      for ($i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$ = 0; $i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$ < $status$jscomp$4$$.length; $i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$++) {
        $i$jscomp$inline_2315_style$jscomp$inline_2319$$ = $status$jscomp$4$$[$i$208$jscomp$inline_2318_scripts$jscomp$inline_2314$$], $i$jscomp$inline_2315_style$jscomp$inline_2319$$.parentNode.removeChild($i$jscomp$inline_2315_style$jscomp$inline_2319$$);
      }
      $extensions$jscomp$inline_2313_responseText$$ = $extensions$jscomp$inline_2313_responseText$$.outerHTML;
      $extensions$jscomp$inline_2313_responseText$$ += '<script type="application/json" amp-ad-metadata>{"ampRuntimeUtf16CharOffsets": [0, 0],"customElementExtensions": [';
      for ($status$jscomp$4$$ = 0; $status$jscomp$4$$ < $adUrl$jscomp$12$$.length; $status$jscomp$4$$++) {
        0 < $status$jscomp$4$$ && ($extensions$jscomp$inline_2313_responseText$$ += ","), $extensions$jscomp$inline_2313_responseText$$ += '"' + $adUrl$jscomp$12$$[$status$jscomp$4$$] + '"';
      }
      return new $$jscomp$this$jscomp$347$$($extensions$jscomp$inline_2313_responseText$$ + "]}\x3c/script>", {status:$response$jscomp$47$$, headers:$headers$jscomp$8$$});
    }) : $adUrl$jscomp$12$$;
  });
};
window.self.AMP.registerElement("amp-ad-network-fake-impl", $AmpAdNetworkFakeImpl$$module$extensions$amp_ad_network_fake_impl$0_1$amp_ad_network_fake_impl$$);

})});
