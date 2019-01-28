(self.AMP=self.AMP||[]).push({n:"amp-recaptcha-input",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $w$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$230$$, $a$jscomp$260$$) {
  $a$jscomp$260$$ = $a$jscomp$260$$.split(":")[0];
  $b$jscomp$230$$ = +$b$jscomp$230$$;
  if (!$b$jscomp$230$$) {
    return !1;
  }
  switch($a$jscomp$260$$) {
    case "http":
    case "ws":
      return 80 !== $b$jscomp$230$$;
    case "https":
    case "wss":
      return 443 !== $b$jscomp$230$$;
    case "ftp":
      return 21 !== $b$jscomp$230$$;
    case "gopher":
      return 70 !== $b$jscomp$230$$;
    case "file":
      return !1;
  }
  return 0 !== $b$jscomp$230$$;
}, $y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$stringify$$ = function($b$jscomp$231$$, $a$jscomp$261$$) {
  $a$jscomp$261$$ = $a$jscomp$261$$ || "";
  var $c$jscomp$165$$ = [];
  "string" !== typeof $a$jscomp$261$$ && ($a$jscomp$261$$ = "?");
  for (var $e$jscomp$285$$ in $b$jscomp$231$$) {
    $x$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.call($b$jscomp$231$$, $e$jscomp$285$$) && $c$jscomp$165$$.push((0,window.encodeURIComponent)($e$jscomp$285$$) + "=" + (0,window.encodeURIComponent)($b$jscomp$231$$[$e$jscomp$285$$]));
  }
  return $c$jscomp$165$$.length ? $a$jscomp$261$$ + $c$jscomp$165$$.join("&") : "";
}, $y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$parse$$ = function($b$jscomp$232$$) {
  for (var $a$jscomp$262$$ = /([^=?&]+)=?([^&]*)/g, $c$jscomp$166$$ = {}, $e$jscomp$286$$; $e$jscomp$286$$ = $a$jscomp$262$$.exec($b$jscomp$232$$);) {
    var $d$jscomp$124$$ = (0,window.decodeURIComponent)($e$jscomp$286$$[1].replace(/\+/g, " "));
    $e$jscomp$286$$ = (0,window.decodeURIComponent)($e$jscomp$286$$[2].replace(/\+/g, " "));
    $d$jscomp$124$$ in $c$jscomp$166$$ || ($c$jscomp$166$$[$d$jscomp$124$$] = $e$jscomp$286$$);
  }
  return $c$jscomp$166$$;
}, $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$234$$, $a$jscomp$263$$, $c$jscomp$167$$) {
  if (!(this instanceof $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$)) {
    return new $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$234$$, $a$jscomp$263$$, $c$jscomp$167$$);
  }
  var $e$jscomp$287$$ = $B$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.slice(), $d$jscomp$125$$ = typeof $a$jscomp$263$$, $k$jscomp$70$$ = 0;
  "object" !== $d$jscomp$125$$ && "string" !== $d$jscomp$125$$ && ($c$jscomp$167$$ = $a$jscomp$263$$, $a$jscomp$263$$ = null);
  $c$jscomp$167$$ && "function" !== typeof $c$jscomp$167$$ && ($c$jscomp$167$$ = $y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$parse$$);
  $d$jscomp$125$$ = $v$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ && $v$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.location || {};
  $a$jscomp$263$$ = $a$jscomp$263$$ || $d$jscomp$125$$;
  $d$jscomp$125$$ = {};
  var $f$jscomp$80$$ = typeof $a$jscomp$263$$;
  if ("blob:" === $a$jscomp$263$$.protocol) {
    $d$jscomp$125$$ = new $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$((0,window.unescape)($a$jscomp$263$$.pathname), {});
  } else {
    if ("string" === $f$jscomp$80$$) {
      for ($g$jscomp$56$$ in $d$jscomp$125$$ = new $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($a$jscomp$263$$, {}), $C$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$) {
        delete $d$jscomp$125$$[$g$jscomp$56$$];
      }
    } else {
      if ("object" === $f$jscomp$80$$) {
        for ($g$jscomp$56$$ in $a$jscomp$263$$) {
          $g$jscomp$56$$ in $C$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ || ($d$jscomp$125$$[$g$jscomp$56$$] = $a$jscomp$263$$[$g$jscomp$56$$]);
        }
        void 0 === $d$jscomp$125$$.$slashes$ && ($d$jscomp$125$$.$slashes$ = $A$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.test($a$jscomp$263$$.href));
      }
    }
  }
  $a$jscomp$263$$ = $d$jscomp$125$$;
  var $g$jscomp$56$$ = $z$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.exec($b$jscomp$234$$ || "");
  $b$jscomp$234$$ = $g$jscomp$56$$[1] ? $g$jscomp$56$$[1].toLowerCase() : "";
  $d$jscomp$125$$ = !!$g$jscomp$56$$[2];
  $f$jscomp$80$$ = $g$jscomp$56$$[3];
  $g$jscomp$56$$ = !$b$jscomp$234$$ && !$d$jscomp$125$$;
  this.$slashes$ = $d$jscomp$125$$ || $g$jscomp$56$$ && $a$jscomp$263$$.$slashes$;
  this.protocol = $b$jscomp$234$$ || $a$jscomp$263$$.protocol || "";
  $b$jscomp$234$$ = $f$jscomp$80$$;
  for ($d$jscomp$125$$ || ($e$jscomp$287$$[3] = [/(.*)/, "pathname"]); $k$jscomp$70$$ < $e$jscomp$287$$.length; $k$jscomp$70$$++) {
    if ($d$jscomp$125$$ = $e$jscomp$287$$[$k$jscomp$70$$], "function" === typeof $d$jscomp$125$$) {
      $b$jscomp$234$$ = $d$jscomp$125$$($b$jscomp$234$$);
    } else {
      var $h$jscomp$59$$ = $d$jscomp$125$$[0];
      $f$jscomp$80$$ = $d$jscomp$125$$[1];
      if ($h$jscomp$59$$ !== $h$jscomp$59$$) {
        this[$f$jscomp$80$$] = $b$jscomp$234$$;
      } else {
        if ("string" === typeof $h$jscomp$59$$) {
          ~($h$jscomp$59$$ = $b$jscomp$234$$.indexOf($h$jscomp$59$$)) && ("number" === typeof $d$jscomp$125$$[2] ? (this[$f$jscomp$80$$] = $b$jscomp$234$$.slice(0, $h$jscomp$59$$), $b$jscomp$234$$ = $b$jscomp$234$$.slice($h$jscomp$59$$ + $d$jscomp$125$$[2])) : (this[$f$jscomp$80$$] = $b$jscomp$234$$.slice($h$jscomp$59$$), $b$jscomp$234$$ = $b$jscomp$234$$.slice(0, $h$jscomp$59$$)));
        } else {
          if ($h$jscomp$59$$ = $h$jscomp$59$$.exec($b$jscomp$234$$)) {
            this[$f$jscomp$80$$] = $h$jscomp$59$$[1], $b$jscomp$234$$ = $b$jscomp$234$$.slice(0, $h$jscomp$59$$.index);
          }
        }
      }
      this[$f$jscomp$80$$] = this[$f$jscomp$80$$] || ($g$jscomp$56$$ && $d$jscomp$125$$[3] ? $a$jscomp$263$$[$f$jscomp$80$$] || "" : "");
      $d$jscomp$125$$[4] && (this[$f$jscomp$80$$] = this[$f$jscomp$80$$].toLowerCase());
    }
  }
  $c$jscomp$167$$ && (this.query = $c$jscomp$167$$(this.query));
  if ($g$jscomp$56$$ && $a$jscomp$263$$.$slashes$ && "/" !== this.pathname.charAt(0) && ("" !== this.pathname || "" !== $a$jscomp$263$$.pathname)) {
    $c$jscomp$167$$ = this.pathname;
    $c$jscomp$167$$ = ($a$jscomp$263$$.pathname || "/").split("/").slice(0, -1).concat($c$jscomp$167$$.split("/"));
    $e$jscomp$287$$ = $c$jscomp$167$$.length;
    $k$jscomp$70$$ = $c$jscomp$167$$[$e$jscomp$287$$ - 1];
    $a$jscomp$263$$ = !1;
    for ($b$jscomp$234$$ = 0; $e$jscomp$287$$--;) {
      "." === $c$jscomp$167$$[$e$jscomp$287$$] ? $c$jscomp$167$$.splice($e$jscomp$287$$, 1) : ".." === $c$jscomp$167$$[$e$jscomp$287$$] ? ($c$jscomp$167$$.splice($e$jscomp$287$$, 1), $b$jscomp$234$$++) : $b$jscomp$234$$ && (0 === $e$jscomp$287$$ && ($a$jscomp$263$$ = !0), $c$jscomp$167$$.splice($e$jscomp$287$$, 1), $b$jscomp$234$$--);
    }
    $a$jscomp$263$$ && $c$jscomp$167$$.unshift("");
    "." !== $k$jscomp$70$$ && ".." !== $k$jscomp$70$$ || $c$jscomp$167$$.push("");
    this.pathname = $c$jscomp$167$$.join("/");
  }
  $w$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$(this.port, this.protocol) || (this.host = this.hostname, this.port = "");
  this.username = this.password = "";
  this.$auth$ && ($d$jscomp$125$$ = this.$auth$.split(":"), this.username = $d$jscomp$125$$[0] || "", this.password = $d$jscomp$125$$[1] || "");
  this.origin = this.protocol && this.host && "file:" !== this.protocol ? this.protocol + "//" + this.host : "null";
  this.href = this.toString();
}, $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$237$$) {
  throw new window.RangeError($H$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$[$b$jscomp$237$$]);
}, $M$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$238$$, $a$jscomp$266$$) {
  for (var $c$jscomp$169$$ = $b$jscomp$238$$.length, $e$jscomp$288$$ = []; $c$jscomp$169$$--;) {
    $e$jscomp$288$$[$c$jscomp$169$$] = $a$jscomp$266$$($b$jscomp$238$$[$c$jscomp$169$$]);
  }
  return $e$jscomp$288$$;
}, $N$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$239$$, $a$jscomp$267$$) {
  var $c$jscomp$170$$ = $b$jscomp$239$$.split("@"), $e$jscomp$289$$ = "";
  1 < $c$jscomp$170$$.length && ($e$jscomp$289$$ = $c$jscomp$170$$[0] + "@", $b$jscomp$239$$ = $c$jscomp$170$$[1]);
  $b$jscomp$239$$ = $b$jscomp$239$$.replace($G$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$, ".");
  $b$jscomp$239$$ = $b$jscomp$239$$.split(".");
  $a$jscomp$267$$ = $M$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$239$$, $a$jscomp$267$$).join(".");
  return $e$jscomp$289$$ + $a$jscomp$267$$;
}, $P$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$241$$) {
  return $M$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$241$$, function($b$jscomp$241$$) {
    var $a$jscomp$269$$ = "";
    65535 < $b$jscomp$241$$ && ($b$jscomp$241$$ -= 65536, $a$jscomp$269$$ += $J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$241$$ >>> 10 & 1023 | 55296), $b$jscomp$241$$ = 56320 | $b$jscomp$241$$ & 1023);
    return $a$jscomp$269$$ + $J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$241$$);
  }).join("");
}, $R$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$244$$, $a$jscomp$271$$, $c$jscomp$172$$) {
  var $e$jscomp$291$$ = 0;
  $b$jscomp$244$$ = $c$jscomp$172$$ ? $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$244$$ / 700) : $b$jscomp$244$$ >> 1;
  for ($b$jscomp$244$$ += $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$244$$ / $a$jscomp$271$$); 455 < $b$jscomp$244$$; $e$jscomp$291$$ += 36) {
    $b$jscomp$244$$ = $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$244$$ / 35);
  }
  return $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($e$jscomp$291$$ + 36 * $b$jscomp$244$$ / ($b$jscomp$244$$ + 38));
}, $U$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$toASCII$$ = function($b$jscomp$247$$) {
  return $N$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$247$$, function($b$jscomp$247$$) {
    if ($F$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.test($b$jscomp$247$$)) {
      var $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$;
      var $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$ = [];
      var $a$jscomp$inline_6319_c$jscomp$inline_3893$$ = [];
      var $c$jscomp$inline_6320_e$jscomp$inline_3894$$ = 0;
      for (var $e$jscomp$inline_6321_k$jscomp$inline_3896$$ = $b$jscomp$247$$.length, $d$jscomp$inline_6322_f$jscomp$inline_3897$$; $c$jscomp$inline_6320_e$jscomp$inline_3894$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$;) {
        $d$jscomp$inline_6322_f$jscomp$inline_3897$$ = $b$jscomp$247$$.charCodeAt($c$jscomp$inline_6320_e$jscomp$inline_3894$$++), 55296 <= $d$jscomp$inline_6322_f$jscomp$inline_3897$$ && 56319 >= $d$jscomp$inline_6322_f$jscomp$inline_3897$$ && $c$jscomp$inline_6320_e$jscomp$inline_3894$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$ ? ($a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$ = $b$jscomp$247$$.charCodeAt($c$jscomp$inline_6320_e$jscomp$inline_3894$$++), 56320 == ($a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$ & 
        64512) ? $a$jscomp$inline_6319_c$jscomp$inline_3893$$.push((($d$jscomp$inline_6322_f$jscomp$inline_3897$$ & 1023) << 10) + ($a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$ & 1023) + 65536) : ($a$jscomp$inline_6319_c$jscomp$inline_3893$$.push($d$jscomp$inline_6322_f$jscomp$inline_3897$$), $c$jscomp$inline_6320_e$jscomp$inline_3894$$--)) : $a$jscomp$inline_6319_c$jscomp$inline_3893$$.push($d$jscomp$inline_6322_f$jscomp$inline_3897$$);
      }
      $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$ = $a$jscomp$inline_6319_c$jscomp$inline_3893$$;
      $e$jscomp$inline_6321_k$jscomp$inline_3896$$ = $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$.length;
      $d$jscomp$inline_6322_f$jscomp$inline_3897$$ = 128;
      var $g$jscomp$inline_3898$$ = 0, $h$jscomp$inline_3899$$ = 72;
      for ($c$jscomp$inline_6320_e$jscomp$inline_3894$$ = 0; $c$jscomp$inline_6320_e$jscomp$inline_3894$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$; ++$c$jscomp$inline_6320_e$jscomp$inline_3894$$) {
        var $b$jscomp$inline_6325_m$jscomp$inline_3900$$ = $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$[$c$jscomp$inline_6320_e$jscomp$inline_3894$$];
        128 > $b$jscomp$inline_6325_m$jscomp$inline_3900$$ && $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.push($J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$inline_6325_m$jscomp$inline_3900$$));
      }
      for (($b$jscomp$247$$ = $a$jscomp$inline_6319_c$jscomp$inline_3893$$ = $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.length) && $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.push("-"); $b$jscomp$247$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$;) {
        var $l$jscomp$inline_3901$$ = 2147483647;
        for ($c$jscomp$inline_6320_e$jscomp$inline_3894$$ = 0; $c$jscomp$inline_6320_e$jscomp$inline_3894$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$; ++$c$jscomp$inline_6320_e$jscomp$inline_3894$$) {
          $b$jscomp$inline_6325_m$jscomp$inline_3900$$ = $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$[$c$jscomp$inline_6320_e$jscomp$inline_3894$$], $b$jscomp$inline_6325_m$jscomp$inline_3900$$ >= $d$jscomp$inline_6322_f$jscomp$inline_3897$$ && $b$jscomp$inline_6325_m$jscomp$inline_3900$$ < $l$jscomp$inline_3901$$ && ($l$jscomp$inline_3901$$ = $b$jscomp$inline_6325_m$jscomp$inline_3900$$);
        }
        var $t$jscomp$inline_3902$$ = $b$jscomp$247$$ + 1;
        $l$jscomp$inline_3901$$ - $d$jscomp$inline_6322_f$jscomp$inline_3897$$ > $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$((2147483647 - $g$jscomp$inline_3898$$) / $t$jscomp$inline_3902$$) && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("overflow");
        $g$jscomp$inline_3898$$ += ($l$jscomp$inline_3901$$ - $d$jscomp$inline_6322_f$jscomp$inline_3897$$) * $t$jscomp$inline_3902$$;
        $d$jscomp$inline_6322_f$jscomp$inline_3897$$ = $l$jscomp$inline_3901$$;
        for ($c$jscomp$inline_6320_e$jscomp$inline_3894$$ = 0; $c$jscomp$inline_6320_e$jscomp$inline_3894$$ < $e$jscomp$inline_6321_k$jscomp$inline_3896$$; ++$c$jscomp$inline_6320_e$jscomp$inline_3894$$) {
          if ($b$jscomp$inline_6325_m$jscomp$inline_3900$$ = $a$jscomp$274_a$jscomp$inline_3892_b$jscomp$inline_6318$$[$c$jscomp$inline_6320_e$jscomp$inline_3894$$], $b$jscomp$inline_6325_m$jscomp$inline_3900$$ < $d$jscomp$inline_6322_f$jscomp$inline_3897$$ && 2147483647 < ++$g$jscomp$inline_3898$$ && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("overflow"), $b$jscomp$inline_6325_m$jscomp$inline_3900$$ == $d$jscomp$inline_6322_f$jscomp$inline_3897$$) {
            var $r$jscomp$inline_3903$$ = $g$jscomp$inline_3898$$;
            for ($l$jscomp$inline_3901$$ = 36;; $l$jscomp$inline_3901$$ += 36) {
              $b$jscomp$inline_6325_m$jscomp$inline_3900$$ = $l$jscomp$inline_3901$$ <= $h$jscomp$inline_3899$$ ? 1 : $l$jscomp$inline_3901$$ >= $h$jscomp$inline_3899$$ + 26 ? 26 : $l$jscomp$inline_3901$$ - $h$jscomp$inline_3899$$;
              if ($r$jscomp$inline_3903$$ < $b$jscomp$inline_6325_m$jscomp$inline_3900$$) {
                break;
              }
              var $K$jscomp$inline_3904$$ = $r$jscomp$inline_3903$$ - $b$jscomp$inline_6325_m$jscomp$inline_3900$$;
              $r$jscomp$inline_3903$$ = 36 - $b$jscomp$inline_6325_m$jscomp$inline_3900$$;
              $b$jscomp$inline_6325_m$jscomp$inline_3900$$ += $K$jscomp$inline_3904$$ % $r$jscomp$inline_3903$$;
              $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.push($J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$inline_6325_m$jscomp$inline_3900$$ + 22 + 75 * (26 > $b$jscomp$inline_6325_m$jscomp$inline_3900$$) - 0));
              $r$jscomp$inline_3903$$ = $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($K$jscomp$inline_3904$$ / $r$jscomp$inline_3903$$);
            }
            $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.push($J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($r$jscomp$inline_3903$$ + 22 + 75 * (26 > $r$jscomp$inline_3903$$) - 0));
            $h$jscomp$inline_3899$$ = $R$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($g$jscomp$inline_3898$$, $t$jscomp$inline_3902$$, $b$jscomp$247$$ == $a$jscomp$inline_6319_c$jscomp$inline_3893$$);
            $g$jscomp$inline_3898$$ = 0;
            ++$b$jscomp$247$$;
          }
        }
        ++$g$jscomp$inline_3898$$;
        ++$d$jscomp$inline_6322_f$jscomp$inline_3897$$;
      }
      $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$ = "xn--" + $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$.join("");
    } else {
      $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$ = $b$jscomp$247$$;
    }
    return $JSCompiler_temp$jscomp$832_d$jscomp$inline_3895$$;
  });
}, $U$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$toUnicode$$ = function($b$jscomp$248$$) {
  return $N$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$248$$, function($b$jscomp$248$$) {
    if ($E$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.test($b$jscomp$248$$)) {
      $b$jscomp$248$$ = $b$jscomp$248$$.slice(4).toLowerCase();
      var $JSCompiler_temp$jscomp$831_a$jscomp$275_b$jscomp$inline_3906$$ = [], $c$jscomp$inline_3908$$ = $b$jscomp$248$$.length, $e$jscomp$inline_3909$$ = 0, $d$jscomp$inline_3910$$ = 128, $k$jscomp$inline_3911$$ = 72, $f$jscomp$inline_3912$$, $g$jscomp$inline_3913$$, $h$jscomp$inline_3914$$ = $b$jscomp$248$$.lastIndexOf("-");
      0 > $h$jscomp$inline_3914$$ && ($h$jscomp$inline_3914$$ = 0);
      for ($f$jscomp$inline_3912$$ = 0; $f$jscomp$inline_3912$$ < $h$jscomp$inline_3914$$; ++$f$jscomp$inline_3912$$) {
        128 <= $b$jscomp$248$$.charCodeAt($f$jscomp$inline_3912$$) && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("not-basic"), $JSCompiler_temp$jscomp$831_a$jscomp$275_b$jscomp$inline_3906$$.push($b$jscomp$248$$.charCodeAt($f$jscomp$inline_3912$$));
      }
      for ($h$jscomp$inline_3914$$ = 0 < $h$jscomp$inline_3914$$ ? $h$jscomp$inline_3914$$ + 1 : 0; $h$jscomp$inline_3914$$ < $c$jscomp$inline_3908$$;) {
        $f$jscomp$inline_3912$$ = $e$jscomp$inline_3909$$;
        var $m$jscomp$inline_3915$$ = 1;
        for ($g$jscomp$inline_3913$$ = 36;; $g$jscomp$inline_3913$$ += 36) {
          $h$jscomp$inline_3914$$ >= $c$jscomp$inline_3908$$ && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("invalid-input");
          var $l$jscomp$inline_3916$$ = $b$jscomp$248$$.charCodeAt($h$jscomp$inline_3914$$++);
          $l$jscomp$inline_3916$$ = 10 > $l$jscomp$inline_3916$$ - 48 ? $l$jscomp$inline_3916$$ - 22 : 26 > $l$jscomp$inline_3916$$ - 65 ? $l$jscomp$inline_3916$$ - 65 : 26 > $l$jscomp$inline_3916$$ - 97 ? $l$jscomp$inline_3916$$ - 97 : 36;
          (36 <= $l$jscomp$inline_3916$$ || $l$jscomp$inline_3916$$ > $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$((2147483647 - $e$jscomp$inline_3909$$) / $m$jscomp$inline_3915$$)) && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("overflow");
          $e$jscomp$inline_3909$$ += $l$jscomp$inline_3916$$ * $m$jscomp$inline_3915$$;
          var $t$jscomp$inline_3917$$ = $g$jscomp$inline_3913$$ <= $k$jscomp$inline_3911$$ ? 1 : $g$jscomp$inline_3913$$ >= $k$jscomp$inline_3911$$ + 26 ? 26 : $g$jscomp$inline_3913$$ - $k$jscomp$inline_3911$$;
          if ($l$jscomp$inline_3916$$ < $t$jscomp$inline_3917$$) {
            break;
          }
          $l$jscomp$inline_3916$$ = 36 - $t$jscomp$inline_3917$$;
          $m$jscomp$inline_3915$$ > $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$(2147483647 / $l$jscomp$inline_3916$$) && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("overflow");
          $m$jscomp$inline_3915$$ *= $l$jscomp$inline_3916$$;
        }
        $m$jscomp$inline_3915$$ = $JSCompiler_temp$jscomp$831_a$jscomp$275_b$jscomp$inline_3906$$.length + 1;
        $k$jscomp$inline_3911$$ = $R$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($e$jscomp$inline_3909$$ - $f$jscomp$inline_3912$$, $m$jscomp$inline_3915$$, 0 == $f$jscomp$inline_3912$$);
        $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($e$jscomp$inline_3909$$ / $m$jscomp$inline_3915$$) > 2147483647 - $d$jscomp$inline_3910$$ && $L$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("overflow");
        $d$jscomp$inline_3910$$ += $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($e$jscomp$inline_3909$$ / $m$jscomp$inline_3915$$);
        $e$jscomp$inline_3909$$ %= $m$jscomp$inline_3915$$;
        $JSCompiler_temp$jscomp$831_a$jscomp$275_b$jscomp$inline_3906$$.splice($e$jscomp$inline_3909$$++, 0, $d$jscomp$inline_3910$$);
      }
      $b$jscomp$248$$ = $P$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($JSCompiler_temp$jscomp$831_a$jscomp$275_b$jscomp$inline_3906$$);
    }
    return $b$jscomp$248$$;
  });
}, $X$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$249$$) {
  $b$jscomp$249$$ = (new $D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$249$$)).hostname;
  var $a$jscomp$276$$ = $U$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$toUnicode$$($b$jscomp$249$$);
  return !(63 >= $b$jscomp$249$$.length) || $V$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.test($a$jscomp$276$$) && $W$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.test($a$jscomp$276$$) || -1 == $b$jscomp$249$$.indexOf(".") ? $Y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$249$$) : ($a$jscomp$276$$ = $U$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$toUnicode$$($b$jscomp$249$$), 
  $a$jscomp$276$$ = $a$jscomp$276$$.split("-").join("--"), $a$jscomp$276$$ = $a$jscomp$276$$.split(".").join("-"), $a$jscomp$276$$ = $U$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$toASCII$$($a$jscomp$276$$).toLowerCase(), 63 < $a$jscomp$276$$.length ? $Y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$249$$) : window.Promise.resolve($a$jscomp$276$$));
}, $Y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$250$$) {
  return $aa$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($b$jscomp$250$$).then(function($b$jscomp$250$$) {
    return $ba$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$("ffffffffff" + $b$jscomp$250$$ + "000000").substr(8, Math.ceil(4 * $b$jscomp$250$$.length / 5));
  });
}, $aa$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$251$$) {
  if ("undefined" !== typeof window) {
    return $b$jscomp$251$$ = (new window.TextEncoder("utf-8")).encode($b$jscomp$251$$), window.crypto.subtle.digest("SHA-256", $b$jscomp$251$$).then(function($b$jscomp$251$$) {
      var $a$jscomp$278$$ = [];
      $b$jscomp$251$$ = new window.DataView($b$jscomp$251$$);
      for (var $c$jscomp$175$$ = 0; $c$jscomp$175$$ < $b$jscomp$251$$.byteLength; $c$jscomp$175$$ += 4) {
        var $a$jscomp$279$$ = ("00000000" + $b$jscomp$251$$.getUint32($c$jscomp$175$$).toString(16)).slice(-8);
        $a$jscomp$278$$.push($a$jscomp$279$$);
      }
      return $a$jscomp$278$$.join("");
    });
  }
  var $a$jscomp$278$$ = window.Buffer.from($b$jscomp$251$$, "utf-8"), $c$jscomp$175$$ = {};
  return new window.Promise(function($b$jscomp$251$$) {
    var $b$jscomp$253$$ = $c$jscomp$175$$.$createHash$("sha256").update($a$jscomp$278$$).digest("hex");
    $b$jscomp$251$$($b$jscomp$253$$);
  });
}, $ba$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = function($b$jscomp$254$$) {
  var $a$jscomp$280$$ = [];
  $b$jscomp$254$$.match(/.{1,2}/g).forEach(function($b$jscomp$254$$, $c$jscomp$177$$) {
    $a$jscomp$280$$[$c$jscomp$177$$] = (0,window.parseInt)($b$jscomp$254$$, 16);
  });
  var $c$jscomp$177$$ = $a$jscomp$280$$.length % 5, $e$jscomp$294$$ = Math.floor($a$jscomp$280$$.length / 5);
  $b$jscomp$254$$ = [];
  if (0 != $c$jscomp$177$$) {
    for (var $d$jscomp$131$$ = 0; $d$jscomp$131$$ < 5 - $c$jscomp$177$$; $d$jscomp$131$$++) {
      $a$jscomp$280$$ += "\x00";
    }
    $e$jscomp$294$$ += 1;
  }
  for ($d$jscomp$131$$ = 0; $d$jscomp$131$$ < $e$jscomp$294$$; $d$jscomp$131$$++) {
    $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt($a$jscomp$280$$[5 * $d$jscomp$131$$] >> 3)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$] & 7) << 2 | $a$jscomp$280$$[5 * $d$jscomp$131$$ + 1] >> 6)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$ + 1] & 63) >> 1)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$ + 1] & 1) << 
    4 | $a$jscomp$280$$[5 * $d$jscomp$131$$ + 2] >> 4)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$ + 2] & 15) << 1 | $a$jscomp$280$$[5 * $d$jscomp$131$$ + 3] >> 7)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$ + 3] & 127) >> 2)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt(($a$jscomp$280$$[5 * $d$jscomp$131$$ + 3] & 3) << 3 | $a$jscomp$280$$[5 * $d$jscomp$131$$ + 4] >> 
    5)), $b$jscomp$254$$.push("abcdefghijklmnopqrstuvwxyz234567".charAt($a$jscomp$280$$[5 * $d$jscomp$131$$ + 4] & 31));
  }
  $e$jscomp$294$$ = 0;
  1 == $c$jscomp$177$$ ? $e$jscomp$294$$ = 6 : 2 == $c$jscomp$177$$ ? $e$jscomp$294$$ = 4 : 3 == $c$jscomp$177$$ ? $e$jscomp$294$$ = 3 : 4 == $c$jscomp$177$$ && ($e$jscomp$294$$ = 1);
  for ($c$jscomp$177$$ = 0; $c$jscomp$177$$ < $e$jscomp$294$$; $c$jscomp$177$$++) {
    $b$jscomp$254$$.pop();
  }
  for ($c$jscomp$177$$ = 0; $c$jscomp$177$$ < $e$jscomp$294$$; $c$jscomp$177$$++) {
    $b$jscomp$254$$.push("=");
  }
  return $b$jscomp$254$$.join("");
}, $AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$ = function($ampdoc$jscomp$190$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$190$$;
  this.$F$ = this.$ampdoc_$.$win$;
  this.$G$ = this.$iframe_$ = this.$sitekey_$ = null;
  this.$J$ = 0;
  this.$I$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$unlisteners_$ = [];
  this.$D$ = {};
}, $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$$ = function($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$) {
  return $JSCompiler_StaticMethods_createRecaptchaFrame_$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$).then(function($iframe$jscomp$77$$) {
    $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$iframe_$ = $iframe$jscomp$77$$;
    $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$unlisteners_$ = [$JSCompiler_StaticMethods_listenIframe_$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$, "amp-recaptcha-ready", function() {
      return $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$I$.resolve();
    }), $JSCompiler_StaticMethods_listenIframe_$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$, "amp-recaptcha-token", $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$O$.bind($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$)), 
    $JSCompiler_StaticMethods_listenIframe_$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$, "amp-recaptcha-error", $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$K$.bind($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$))];
    $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$D$ = {};
    $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$F$.document.body.appendChild($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$iframe_$);
    return _.$loadPromise$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$self$$.$iframe_$);
  });
}, $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$$ = function($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$) {
  $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$iframe_$ && (_.$removeElement$$module$src$dom$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$iframe_$), $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$unlisteners_$.forEach(function($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$) {
    return $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$();
  }), $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$iframe_$ = null, $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$G$ = null, $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$I$ = new _.$Deferred$$module$src$utils$promise$$, $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$unlisteners_$ = 
  [], $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$self$$.$D$ = {});
}, $JSCompiler_StaticMethods_createRecaptchaFrame_$$ = function($JSCompiler_StaticMethods_createRecaptchaFrame_$self$$) {
  var $iframe$jscomp$78$$ = $JSCompiler_StaticMethods_createRecaptchaFrame_$self$$.$F$.document.createElement("iframe");
  return $JSCompiler_StaticMethods_getRecaptchaFrameSrc_$$($JSCompiler_StaticMethods_createRecaptchaFrame_$self$$).then(function($recaptchaFrameSrc$$) {
    $iframe$jscomp$78$$.src = $recaptchaFrameSrc$$;
    $iframe$jscomp$78$$.setAttribute("scrolling", "no");
    $iframe$jscomp$78$$.setAttribute("data-amp-3p-sentinel", "amp-recaptcha");
    $iframe$jscomp$78$$.setAttribute("name", JSON.stringify(_.$dict$$module$src$utils$object$$({sitekey:$JSCompiler_StaticMethods_createRecaptchaFrame_$self$$.$sitekey_$, sentinel:"amp-recaptcha"})));
    $iframe$jscomp$78$$.classList.add("i-amphtml-recaptcha-iframe");
    _.$setStyle$$module$src$style$$($iframe$jscomp$78$$, "border", "none");
    $iframe$jscomp$78$$.onload = function() {
      this.readyState = "complete";
    };
    return $iframe$jscomp$78$$;
  });
}, $JSCompiler_StaticMethods_getRecaptchaFrameSrc_$$ = function($JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$) {
  var $curlsSubdomainPromise$$ = void 0;
  _.$JSCompiler_StaticMethods_Url$$module$src$service$url_impl_prototype$isProxyOrigin$$(_.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$.$ampdoc_$.$getHeadNode$()), $JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$.$F$.location.href) ? $curlsSubdomainPromise$$ = _.$tryResolve$$module$src$utils$promise$$(function() {
    return $JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$.$F$.location.hostname.split(".")[0];
  }) : $curlsSubdomainPromise$$ = $X$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$.$F$.location.href);
  return $curlsSubdomainPromise$$.then(function($JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$) {
    return "https://" + $JSCompiler_StaticMethods_getRecaptchaFrameSrc_$self$$ + (".recaptcha." + _.$urls$$module$src$config$$.thirdPartyFrameHost + "/1901181729101/") + "recaptcha.html";
  });
}, $JSCompiler_StaticMethods_listenIframe_$$ = function($JSCompiler_StaticMethods_listenIframe_$self$$, $evName$jscomp$2$$, $cb$jscomp$12$$) {
  return _.$listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_listenIframe_$self$$.$iframe_$, $evName$jscomp$2$$, $cb$jscomp$12$$, !0);
}, $AmpRecaptchaInput$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_input$$ = function($$jscomp$super$this$jscomp$86_element$jscomp$524$$) {
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$86_element$jscomp$524$$) || this;
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$.$sitekey_$ = null;
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$.$action_$ = null;
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$.$recaptchaService_$ = null;
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$.$registerPromise_$ = null;
  $$jscomp$super$this$jscomp$86_element$jscomp$524$$.$isExperimentEnabled_$ = _.$isExperimentOn$$module$src$experiments$$($$jscomp$super$this$jscomp$86_element$jscomp$524$$.$win$, "amp-recaptcha-input");
  return $$jscomp$super$this$jscomp$86_element$jscomp$524$$;
};
var $v$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = "undefined" !== typeof window ? window : "undefined" !== typeof window.global ? window.global : "undefined" !== typeof window.self ? window.self : {}, $x$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = Object.prototype.hasOwnProperty, $z$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i, $A$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = 
/^[A-Za-z][A-Za-z0-9+-.]*:\/\//, $B$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = [["#", "hash"], ["?", "query"], function($b$jscomp$233$$) {
  return $b$jscomp$233$$.replace("\\", "/");
}, ["/", "pathname"], ["@", "auth", 1], [window.NaN, "host", void 0, 1, 1], [/:(\d+)$/, "port", void 0, 1], [window.NaN, "hostname", void 0, 1, 1]], $C$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = {hash:1, query:1};
$D$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.prototype = {set:function($b$jscomp$235$$, $a$jscomp$264$$, $c$jscomp$168$$) {
  switch($b$jscomp$235$$) {
    case "query":
      "string" === typeof $a$jscomp$264$$ && $a$jscomp$264$$.length && ($a$jscomp$264$$ = ($c$jscomp$168$$ || $y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$parse$$)($a$jscomp$264$$));
      this[$b$jscomp$235$$] = $a$jscomp$264$$;
      break;
    case "port":
      this[$b$jscomp$235$$] = $a$jscomp$264$$;
      $w$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$($a$jscomp$264$$, this.protocol) ? $a$jscomp$264$$ && (this.host = this.hostname + ":" + $a$jscomp$264$$) : (this.host = this.hostname, this[$b$jscomp$235$$] = "");
      break;
    case "hostname":
      this[$b$jscomp$235$$] = $a$jscomp$264$$;
      this.port && ($a$jscomp$264$$ += ":" + this.port);
      this.host = $a$jscomp$264$$;
      break;
    case "host":
      this[$b$jscomp$235$$] = $a$jscomp$264$$;
      /:\d+$/.test($a$jscomp$264$$) ? ($a$jscomp$264$$ = $a$jscomp$264$$.split(":"), this.port = $a$jscomp$264$$.pop(), this.hostname = $a$jscomp$264$$.join(":")) : (this.hostname = $a$jscomp$264$$, this.port = "");
      break;
    case "protocol":
      this.protocol = $a$jscomp$264$$.toLowerCase();
      this.$slashes$ = !$c$jscomp$168$$;
      break;
    case "pathname":
    case "hash":
      $a$jscomp$264$$ ? ($c$jscomp$168$$ = "pathname" === $b$jscomp$235$$ ? "/" : "#", this[$b$jscomp$235$$] = $a$jscomp$264$$.charAt(0) !== $c$jscomp$168$$ ? $c$jscomp$168$$ + $a$jscomp$264$$ : $a$jscomp$264$$) : this[$b$jscomp$235$$] = $a$jscomp$264$$;
      break;
    default:
      this[$b$jscomp$235$$] = $a$jscomp$264$$;
  }
  for ($b$jscomp$235$$ = 0; $b$jscomp$235$$ < $B$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$.length; $b$jscomp$235$$++) {
    $a$jscomp$264$$ = $B$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$[$b$jscomp$235$$], $a$jscomp$264$$[4] && (this[$a$jscomp$264$$[1]] = this[$a$jscomp$264$$[1]].toLowerCase());
  }
  this.origin = this.protocol && this.host && "file:" !== this.protocol ? this.protocol + "//" + this.host : "null";
  this.href = this.toString();
  return this;
}, toString:function($b$jscomp$236$$) {
  $b$jscomp$236$$ && "function" === typeof $b$jscomp$236$$ || ($b$jscomp$236$$ = $y$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$stringify$$);
  var $a$jscomp$265$$ = this.protocol;
  $a$jscomp$265$$ && ":" !== $a$jscomp$265$$.charAt($a$jscomp$265$$.length - 1) && ($a$jscomp$265$$ += ":");
  $a$jscomp$265$$ += this.$slashes$ ? "//" : "";
  this.username && ($a$jscomp$265$$ += this.username, this.password && ($a$jscomp$265$$ += ":" + this.password), $a$jscomp$265$$ += "@");
  $a$jscomp$265$$ += this.host + this.pathname;
  ($b$jscomp$236$$ = "object" === typeof this.query ? $b$jscomp$236$$(this.query) : this.query) && ($a$jscomp$265$$ += "?" !== $b$jscomp$236$$.charAt(0) ? "?" + $b$jscomp$236$$ : $b$jscomp$236$$);
  this.hash && ($a$jscomp$265$$ += this.hash);
  return $a$jscomp$265$$;
}};
var $E$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = /^xn--/, $F$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = /[^\x20-\x7E]/, $G$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = /[\x2E\u3002\uFF0E\uFF61]/g, $H$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = {overflow:"Overflow: input needs wider integers to process", "not-basic":"Illegal input >= 0x80 (not a basic code point)", 
"invalid-input":"Invalid input"}, $I$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = Math.floor, $J$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = String.fromCharCode, $V$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = /[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02b8\u0300-\u0590\u0800-\u1fff\u200e\u2c00-\ufb1c\ufe00-\ufe6f\ufefd-\uffff]/, $W$$module$third_party$amp_toolbox_cache_url$dist$amp_toolbox_cache_url_esm$$ = 
/[\u0591-\u06ef\u06fa-\u07ff\u200f\ufb1d-\ufdff\ufe70-\ufefc]/;
$AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$.prototype.register = function($sitekey$$) {
  if (!this.$sitekey_$) {
    this.$sitekey_$ = $sitekey$$;
  } else {
    if (this.$sitekey_$ !== $sitekey$$) {
      return window.Promise.reject(Error("You must supply the same sitekey to all amp-recaptcha-input elements."));
    }
  }
  this.$J$++;
  this.$G$ || (this.$G$ = $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$initialize_$$(this));
  return this.$G$;
};
$AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$.prototype.execute = function($resourceId$$, $action$jscomp$21$$) {
  var $$jscomp$this$jscomp$806$$ = this;
  if (!this.$iframe_$) {
    return window.Promise.reject(Error("An iframe is not created. You must register before executing"));
  }
  var $executePromise$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$D$[$resourceId$$] = {resolve:$executePromise$$.resolve, reject:$executePromise$$.reject};
  this.$I$.$promise$.then(function() {
    var $executePromise$$ = $$jscomp$this$jscomp$806$$.$iframe_$;
    _.$postMessageToWindows$$module$src$iframe_helper$$($executePromise$$, [{$win$:$executePromise$$.contentWindow, origin:"*"}], "amp-recaptcha-action", _.$dict$$module$src$utils$object$$({id:$resourceId$$, action:"amp_" + $action$jscomp$21$$}), !0);
  });
  return $executePromise$$.$promise$;
};
$AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$.prototype.$O$ = function($data$jscomp$161$$) {
  this.$D$[$data$jscomp$161$$.id].resolve($data$jscomp$161$$.$token$);
  delete this.$D$[$data$jscomp$161$$.id];
};
$AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$.prototype.$K$ = function($data$jscomp$162$$) {
  this.$D$[$data$jscomp$162$$.id].reject(Error($data$jscomp$162$$.error));
  delete this.$D$[$data$jscomp$162$$.id];
};
_.$$jscomp$inherits$$($AmpRecaptchaInput$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_input$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpRecaptchaInput$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_input$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$810$$ = this;
  if (this.$isExperimentEnabled_$) {
    return this.$sitekey_$ = this.element.getAttribute("data-sitekey"), this.$action_$ = this.element.getAttribute("data-action"), this.$recaptchaService_$ = _.$getServiceForDoc$$module$src$service$$(this.$getAmpDoc$(), "amp-recaptcha"), this.$mutateElement$(function() {
      _.$toggle$$module$src$style$$($$jscomp$this$jscomp$810$$.element);
      $$jscomp$this$jscomp$810$$.element.classList.add("i-amphtml-async-input");
      _.$setStyles$$module$src$style$$($$jscomp$this$jscomp$810$$.element, {position:"absolute", width:"1px", height:"1px", overflow:"hidden", visibility:"hidden"});
    });
  }
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$88$$) {
  return "nodisplay" == $layout$jscomp$88$$;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  !this.$registerPromise_$ && this.$sitekey_$ && (this.$registerPromise_$ = this.$recaptchaService_$.register(this.$sitekey_$));
  return this.$registerPromise_$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  if (this.$registerPromise_$) {
    var $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$unregister$self$jscomp$inline_3919$$ = this.$recaptchaService_$;
    $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$unregister$self$jscomp$inline_3919$$.$J$--;
    0 >= $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$unregister$self$jscomp$inline_3919$$.$J$ && $JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$dispose_$$($JSCompiler_StaticMethods_AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service_prototype$unregister$self$jscomp$inline_3919$$);
    this.$registerPromise_$ = null;
  }
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$getValue$ = function() {
  return this.$sitekey_$ && this.$action_$ ? this.$recaptchaService_$.execute(this.element.$ia$(), this.$action_$) : window.Promise.reject(Error("amp-recaptcha-input requires both the data-sitekey, and data-action attribute"));
};
var $AMP$jscomp$inline_3921$$ = window.self.AMP;
_.$registerServiceBuilderForDoc$$module$src$service$$($AMP$jscomp$inline_3921$$.ampdoc, "amp-recaptcha", $AmpRecaptchaService$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_service$$);
$AMP$jscomp$inline_3921$$.registerElement("amp-recaptcha-input", $AmpRecaptchaInput$$module$extensions$amp_recaptcha_input$0_1$amp_recaptcha_input$$, ".i-amphtml-recaptcha-iframe{position:fixed!important;top:0px!important;left:0px!important;height:1px!important;width:1px!important;overflow:hidden!important;visibility:hidden!important}\n/*# sourceURL=/extensions/amp-recaptcha-input/0.1/amp-recaptcha-input.css*/");

})});
