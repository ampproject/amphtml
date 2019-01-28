(self.AMP=self.AMP||[]).push({n:"amp-ad-network-cloudflare-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$ = function($var_args$jscomp$64$$) {
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.apply(this, arguments) || this;
}, $JSCompiler_StaticMethods_replacements$$ = function($str$jscomp$18$$, $values$jscomp$13$$) {
  $str$jscomp$18$$ = $str$jscomp$18$$.replace(/SLOT_WIDTH/g, $values$jscomp$13$$.$slotWidth$);
  return $str$jscomp$18$$ = $str$jscomp$18$$.replace(/SLOT_HEIGHT/g, $values$jscomp$13$$.$slotHeight$);
}, $NETWORKS$$module$extensions$amp_ad_network_cloudflare_impl$0_1$vendors$$ = {cloudflare:{base:"https://firebolt.cloudflaredemo.com"}, adzerk:{base:"https://engine.betazerk.com"}, celtra:{base:"https://ads-amp.celtra.com"}, dianomi:{base:"https://www.dianomi.com", src:"https://www.dianomi.com/smartads.pl?format=a4a"}, yieldmo:{base:"https://yieldmo-amp.club", src:"https://yieldmo-amp.club/ads"}};
_.$$jscomp$inherits$$($AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
$AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$.prototype.isValidElement = function() {
  var $el$jscomp$34_src$jscomp$18$$ = this.element;
  if (!_.$JSCompiler_StaticMethods_isAmpAdElement$$(this) || !$el$jscomp$34_src$jscomp$18$$.hasAttribute("data-cf-network")) {
    return !1;
  }
  var $network$$ = $NETWORKS$$module$extensions$amp_ad_network_cloudflare_impl$0_1$vendors$$[$el$jscomp$34_src$jscomp$18$$.getAttribute("data-cf-network")];
  if (!$network$$) {
    return !1;
  }
  $el$jscomp$34_src$jscomp$18$$ = $el$jscomp$34_src$jscomp$18$$.getAttribute("src") || $network$$.src;
  if (!$el$jscomp$34_src$jscomp$18$$ || !_.$startsWith$$module$src$string$$($el$jscomp$34_src$jscomp$18$$, $network$$.base)) {
    return !1;
  }
  _.$parseUrlDeprecated$$module$src$url$$($el$jscomp$34_src$jscomp$18$$);
  return !0;
};
$AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$.prototype.$getSigningServiceNames$ = function() {
  return ["cloudflare"];
};
$AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$.prototype.$getAdUrl$ = function() {
  var $rect$jscomp$14_values$jscomp$14$$ = this.$getIntersectionElementLayoutBox$(), $el$jscomp$35$$ = this.element, $network$jscomp$1_url$jscomp$139$$ = $NETWORKS$$module$extensions$amp_ad_network_cloudflare_impl$0_1$vendors$$[$el$jscomp$35$$.getAttribute("data-cf-network")], $a4a$jscomp$5_pre$jscomp$1$$ = "false" !== $el$jscomp$35$$.getAttribute("data-cf-a4a"), $base$jscomp$5_i$jscomp$185$$ = $network$jscomp$1_url$jscomp$139$$.base;
  $network$jscomp$1_url$jscomp$139$$ = $el$jscomp$35$$.getAttribute("src") || $network$jscomp$1_url$jscomp$139$$.src;
  $a4a$jscomp$5_pre$jscomp$1$$ && "/_a4a/" != $network$jscomp$1_url$jscomp$139$$.substr($base$jscomp$5_i$jscomp$185$$.length, 6) && ($network$jscomp$1_url$jscomp$139$$ = $base$jscomp$5_i$jscomp$185$$ + "/_a4a" + $network$jscomp$1_url$jscomp$139$$.slice($base$jscomp$5_i$jscomp$185$$.length));
  $rect$jscomp$14_values$jscomp$14$$ = {$slotWidth$:($rect$jscomp$14_values$jscomp$14$$.width || 0).toString(), $slotHeight$:($rect$jscomp$14_values$jscomp$14$$.height || 0).toString()};
  $network$jscomp$1_url$jscomp$139$$ = (0,window.encodeURI)($JSCompiler_StaticMethods_replacements$$($network$jscomp$1_url$jscomp$139$$, $rect$jscomp$14_values$jscomp$14$$));
  $a4a$jscomp$5_pre$jscomp$1$$ = 0 > $network$jscomp$1_url$jscomp$139$$.indexOf("?") ? "?" : "&";
  for ($base$jscomp$5_i$jscomp$185$$ = 0; $base$jscomp$5_i$jscomp$185$$ < $el$jscomp$35$$.attributes.length; $base$jscomp$5_i$jscomp$185$$++) {
    var $attrib$$ = $el$jscomp$35$$.attributes[$base$jscomp$5_i$jscomp$185$$];
    $attrib$$.specified && _.$startsWith$$module$src$string$$($attrib$$.name, "data-") && !_.$startsWith$$module$src$string$$($attrib$$.name, "data-cf-") && ($network$jscomp$1_url$jscomp$139$$ += $a4a$jscomp$5_pre$jscomp$1$$ + (0,window.encodeURIComponent)($attrib$$.name.substring(5)) + "=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_replacements$$($attrib$$.value, $rect$jscomp$14_values$jscomp$14$$)), $a4a$jscomp$5_pre$jscomp$1$$ = "&");
  }
  return $network$jscomp$1_url$jscomp$139$$;
};
window.self.AMP.registerElement("amp-ad-network-cloudflare-impl", $AmpAdNetworkCloudflareImpl$$module$extensions$amp_ad_network_cloudflare_impl$0_1$amp_ad_network_cloudflare_impl$$);

})});
