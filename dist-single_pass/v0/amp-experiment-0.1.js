(self.AMP=self.AMP||[]).push({n:"amp-experiment",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $Variants$$module$extensions$amp_experiment$0_1$variant$$ = function($ampdoc$jscomp$163$$) {
  this.ampdoc = $ampdoc$jscomp$163$$;
  this.$D$ = new _.$Deferred$$module$src$utils$promise$$;
}, $allocateVariant$$module$extensions$amp_experiment$0_1$variant$$ = function($ampdoc$jscomp$164$$, $experimentName$jscomp$4$$, $config$jscomp$66$$) {
  $validateConfig$$module$extensions$amp_experiment$0_1$variant$$($config$jscomp$66$$);
  var $hasConsentPromise_override$$ = _.$JSCompiler_StaticMethods_getParam$$(_.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$164$$), "amp-x-" + $experimentName$jscomp$4$$);
  if ($hasConsentPromise_override$$ && _.$hasOwn$$module$src$utils$object$$($config$jscomp$66$$.variants, $hasConsentPromise_override$$)) {
    return window.Promise.resolve($hasConsentPromise_override$$);
  }
  var $sticky$$ = !1 !== $config$jscomp$66$$.sticky, $cidScope$$ = $config$jscomp$66$$.cidScope || "amp-experiment";
  $hasConsentPromise_override$$ = window.Promise.resolve(!0);
  $sticky$$ && $config$jscomp$66$$.consentNotificationId && ($hasConsentPromise_override$$ = _.$Services$$module$src$services$userNotificationManagerForDoc$$($ampdoc$jscomp$164$$.$getHeadNode$()).then(function($ampdoc$jscomp$164$$) {
    return $ampdoc$jscomp$164$$.$J$($config$jscomp$66$$.consentNotificationId);
  }).then(function($ampdoc$jscomp$164$$) {
    return $ampdoc$jscomp$164$$.$isDismissed$();
  }));
  return $hasConsentPromise_override$$.then(function($hasConsentPromise_override$$) {
    return $hasConsentPromise_override$$ ? $getBucketTicket$$module$extensions$amp_experiment$0_1$variant$$($ampdoc$jscomp$164$$, $config$jscomp$66$$.group || $experimentName$jscomp$4$$, $sticky$$ ? $cidScope$$ : null).then(function($ampdoc$jscomp$164$$) {
      for (var $experimentName$jscomp$4$$ = 0, $hasConsentPromise_override$$ = Object.keys($config$jscomp$66$$.variants).sort(), $sticky$$ = 0; $sticky$$ < $hasConsentPromise_override$$.length; $sticky$$++) {
        if ($experimentName$jscomp$4$$ += $config$jscomp$66$$.variants[$hasConsentPromise_override$$[$sticky$$]], $ampdoc$jscomp$164$$ < $experimentName$jscomp$4$$) {
          return $hasConsentPromise_override$$[$sticky$$];
        }
      }
      return null;
    }) : null;
  });
}, $validateConfig$$module$extensions$amp_experiment$0_1$variant$$ = function($config$jscomp$67_variants$jscomp$4$$) {
  $config$jscomp$67_variants$jscomp$4$$ = $config$jscomp$67_variants$jscomp$4$$.variants;
  for (var $variantName$$ in $config$jscomp$67_variants$jscomp$4$$) {
    _.$hasOwn$$module$src$utils$object$$($config$jscomp$67_variants$jscomp$4$$, $variantName$$);
  }
}, $getBucketTicket$$module$extensions$amp_experiment$0_1$variant$$ = function($ampdoc$jscomp$165$$, $group$jscomp$2$$, $opt_cidScope$$) {
  if (!$opt_cidScope$$) {
    return window.Promise.resolve(100 * $ampdoc$jscomp$165$$.$win$.Math.random());
  }
  var $cidPromise$jscomp$3$$ = _.$Services$$module$src$services$cidForDoc$$($ampdoc$jscomp$165$$).then(function($ampdoc$jscomp$165$$) {
    return $ampdoc$jscomp$165$$.get({scope:$opt_cidScope$$, createCookieIfNotPresent:!0}, window.Promise.resolve());
  });
  return window.Promise.all([$cidPromise$jscomp$3$$, _.$Services$$module$src$services$cryptoFor$$($ampdoc$jscomp$165$$.$win$)]).then(function($ampdoc$jscomp$165$$) {
    return _.$JSCompiler_StaticMethods_uniform$$($ampdoc$jscomp$165$$[1], $group$jscomp$2$$ + ":" + $ampdoc$jscomp$165$$[0]);
  }).then(function($ampdoc$jscomp$165$$) {
    return 100 * $ampdoc$jscomp$165$$;
  });
}, $AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$ = function($var_args$jscomp$73$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
};
$Variants$$module$extensions$amp_experiment$0_1$variant$$.prototype.init = function($variants$jscomp$3$$) {
  this.$D$.resolve($variants$jscomp$3$$);
};
_.$$jscomp$inherits$$($AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$, window.AMP.BaseElement);
$AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$.prototype.$isLayoutSupported$ = function($layout$jscomp$54$$) {
  return "nodisplay" == $layout$jscomp$54$$ || "container" == $layout$jscomp$54$$;
};
$AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$591$$ = this;
  return _.$getServicePromiseForDoc$$module$src$service$$(this.$getAmpDoc$(), "variant").then(function($variantsService$$) {
    try {
      var $config$jscomp$68$$ = _.$parseJson$$module$src$json$$($$jscomp$this$jscomp$591$$.element.children[0].textContent), $results$jscomp$21$$ = Object.create(null), $variants$jscomp$5$$ = Object.keys($config$jscomp$68$$).map(function($variantsService$$) {
        return $allocateVariant$$module$extensions$amp_experiment$0_1$variant$$($$jscomp$this$jscomp$591$$.$getAmpDoc$(), $variantsService$$, $config$jscomp$68$$[$variantsService$$]).then(function($$jscomp$this$jscomp$591$$) {
          $results$jscomp$21$$[$variantsService$$] = $$jscomp$this$jscomp$591$$;
        });
      }), $experimentVariants$$ = window.Promise.all($variants$jscomp$5$$).then(function() {
        return $results$jscomp$21$$;
      }).then($$jscomp$this$jscomp$591$$.$D$.bind($$jscomp$this$jscomp$591$$));
      $variantsService$$.init($experimentVariants$$);
    } catch ($e$250$$) {
      throw $variantsService$$.init({}), $e$250$$;
    }
  });
};
$AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$.prototype.$D$ = function($experiments$jscomp$5$$) {
  return this.$getAmpDoc$().$whenBodyAvailable$().then(function($body$jscomp$24$$) {
    for (var $name$jscomp$233$$ in $experiments$jscomp$5$$) {
      $experiments$jscomp$5$$[$name$jscomp$233$$] && $body$jscomp$24$$.setAttribute("amp-x-" + $name$jscomp$233$$, $experiments$jscomp$5$$[$name$jscomp$233$$]);
    }
    return $experiments$jscomp$5$$;
  });
};
var $AMP$jscomp$inline_3195$$ = window.self.AMP;
$AMP$jscomp$inline_3195$$.registerServiceForDoc("variant", $Variants$$module$extensions$amp_experiment$0_1$variant$$);
$AMP$jscomp$inline_3195$$.registerElement("amp-experiment", $AmpExperiment$$module$extensions$amp_experiment$0_1$amp_experiment$$);

})});
